module.exports = Histogram;

let Utils = require('./visualize-utils');
/**
 * Visualize Histogram contructor
 * @param: {Object} config: configuration of visualize histogram object
 *
 */
function Histogram(histogramModel) {
    this.handlers = new Object();

    this.data = null;

    this.histogramModel = histogramModel;
    this.idCurve = histogramModel.properties.idCurve;

    // visualize instant vars
    this.svgContainer = null;
    this.depthStep = -1;
    this.fullData = null;
    this.intervalData = null;
    this.zoneData = new Array();
    this.zoneBins = new Array();

    this.drawPending = false;
}
Histogram.prototype.trap = function (eventName, handlerCb) {
    let eventHandlers = this.handlers[eventName];
    if (!Array.isArray(eventHandlers)) {
        this.handlers[eventName] = [];
    }

    this.handlers[eventName].push(handlerCb);
    return this;
}

Histogram.prototype.signal = function (eventName, data) {
    let eventHandlers = this.handlers[eventName];
    if (Array.isArray(eventHandlers)) {
        eventHandlers.forEach(function (handler) {
            handler(data);
        });
    }
}

Histogram.prototype.setZoneSet = function(zoneSet) {
    this.zoneSet = zoneSet;
    //if (this.drawPending) this.doPlot();
}
Histogram.prototype.setCurve = function(data) {
    this.data = data.filter(function(d) {return !isNaN(d.x);}); // ? clone
    //if (this.drawPending) this.doPlot();
}

Histogram.prototype.getTickValuesY = function() {
    if (this.histogramModel.properties.plotType != "Frequency") { // Percentile
        console.log('getTickValuesY: Percent');
        return d3.range(0, 100, 10);
    }
    // plotType == Frequency
    return d3.range(0, d3.max(this.bins, function(d) {return d.length}), 100);
}

Histogram.prototype.filterF = function(d, zoneIdx) {
    var tempDepth = 0;
    if (!this.histogramModel) return false;
    if (this.histogramModel.properties.idZoneSet & !zoneIdx) {
        return true;
    }

    tempDepth = this.startDepth + this.depthStep * parseInt(d.y);

    if(this.histogramModel && this.histogramModel.properties.idZoneSet) {
        let zone = this.zoneSet[zoneIdx];
        return (!isNaN(d.y) && ( tempDepth >= zone.properties.startDepth ) && 
                ( tempDepth < zone.properties.endDepth ));
    }

    return (!isNaN(d.y) && ( tempDepth >= this.histogramModel.properties.intervalDepthTop ) && 
            ( tempDepth < this.histogramModel.properties.intervalDepthBottom ));
}



Histogram.prototype.getZoneData = function(idx) {
    var self = this;
    return this.data.filter(function(d) {
        return self.filterF.call(self, d, idx);
    }).map(function(d) { return parseFloat(d.x); });
}

Histogram.prototype.getIntervalData = function() {
    var self = this;
    return this.data.filter(function(d) {
        return self.filterF.call(self, d);
    }).map(function(d) { return parseFloat(d.x); });
}

Histogram.prototype.getFullData = function() {
    var self = this;
    return this.data.map(function(d) { return parseFloat(d.x); });
}

function __reverseBins(bins) {
    let len = bins.length;
    let halfLen = Math.floor(len/2);
    let temp = null;

    for (let i = 0; i < halfLen; i++) {
        temp = bins[i];
        bins[i] = bins[len - i - 1];
        bins[len - i - 1] = temp;
        
        temp = bins[i].x0;
        bins[i].x0 = bins[i].x1;
        bins[i].x1 = temp;

        temp = bins[len - i - 1].x0;
        bins[len - i - 1].x0 = bins[len - i - 1].x1;
        bins[len - i - 1].x1 = temp;
    }

    if (len % 2) {
        temp = bins[halfLen].x0;
        bins[halfLen].x0 = bins[halfLen].x1;
        bins[halfLen].x1 = temp;
    }
}
Histogram.prototype.doPlot = function() {
    var self = this;
    // Adjust svgContainer size
    self.svgContainer.attr('width',self.container.node().clientWidth)
        .attr('height', self.container.node().clientHeight);

    // remove previously render histograms
    this.svgContainer.selectAll('.bars, path.gaussian-line, line.mean-line, line.sigma-line').remove();

    // Sanity checking
    if (!this.data) {
        console.error('No curve data');
        return;
    }
    if (!this.histogramModel) {
        console.error('No histogramModel');
        return;
    }
    if (this.histogramModel.properties.idZoneSet && (!this.zoneSet || !this.zoneSet.length)) {
        console.warn('No zoneSet to draw');
        return;
    }
    // pass checking. Set drawPending = false
    this.drawPending = false;

    // Local variables
    console.log('Do plot begin');
    let wdX = this.getWindowX();
    let vpX = this.getViewportX();
    let vpY = this.getViewportY();
    let transformX = this.getTransformX();
    let transformY = null

    let nBins = this.histogramModel.properties.divisions;
    let domain = this.getNormalizedWindowX();
    let step = (wdX[1] - wdX[0]) / nBins;

    let realStep = step;
    let jumpFactor = Math.ceil(nBins/20);
    if (jumpFactor > 1) realStep = jumpFactor * step;

    // Setup Axis X
    this.axisX = d3.axisBottom(transformX)
        .tickValues(d3.range(wdX[0], wdX[1] + realStep/2, realStep))
        .tickFormat(Utils.getDecimalFormatter(0));

    // Setup histogram generator
    let thresholds = d3.range(domain[0], domain[1], (domain[1] - domain[0])/nBins);
    var histogramGenerator = d3.histogram().domain(domain).thresholds(thresholds);

    // Prepare data and group them in bins: fullData/fullBins, intervalData/intervalBins, zoneData[]/zoneBins[]
    // We may reverse bins if necessary
    this.fullData = this.getFullData();
    this.fullBins = histogramGenerator(this.fullData);
    if (step < 0) __reverseBins(this.fullBins);

    this.zoneData.length = 0;
    this.zoneBins.length = 0;
    delete this.intervalData;
    delete this.intervalBins;

    if (this.histogramModel.properties.idZoneSet) {
        for (let i in this.zoneSet) {
            this.zoneData[i] = this.getZoneData(i);
            this.zoneBins[i] = histogramGenerator(this.zoneData[i]);
            if (step < 0) __reverseBins(this.zoneBins[i]);
        }
    }
    else {
        this.intervalData = this.getIntervalData();
        this.intervalBins = histogramGenerator(this.intervalData);
        if (step < 0) __reverseBins(this.intervalBins);
    }
    

    // Calculate average and standardDeviation
    self.unsetJoinedZoneData(); // IMPORTANT ! Clear joinZoneData for calculate statistics
    this.mean = this._getAverage();
    this.standardDeviation =  this._getStandardDeviation();

    self.signal('data-processing-done', 'linhtinh');

    // After having data, we can setup vertical transformation and Y axis 
    let wdY = this.getWindowY();
    transformY = this.getTransformY();

    this.axisY = d3.axisLeft(transformY)
        .ticks(Math.floor(vpY[1]/40), ',.0f');

    // Generate X and Y axes
    this.axisX = this.axisX.tickSize(-this.svgContainer.node().clientHeight);
    this.axisY = this.axisY.tickSize(-this.svgContainer.node().clientWidth);
    if (this.histogramModel.properties.showGrid) {
        this.svgContainer.selectAll('.tick line').classed('hidden', false);
    }
    else {
        this.svgContainer.selectAll('.tick line').classed('hidden', true);
    }
    this.svgContainer.select('g.vi-histogram-axis-x-ticks')
        .call(this.axisX)
        .style('transform', 'translateY(' + vpY[1] + 'px)');
    this.svgContainer.select('g.vi-histogram-axis-y-ticks')
        .call(this.axisY)
        .style('transform', 'translateX(' + vpX[0] + 'px)');

    drawBarHistogram();

    if (self.histogramModel.properties.showGaussian) {
        drawGaussianCurve();
    }

    function showTooltip(d, i) {
        var content = null;
        console.log(this);
        if (self.histogramModel.properties.plotType != 'Frequency') {
            content = '<span>' + (d.length * 100 / self.fullData.length) + '%</span>';
        }
        else {
            content = '<div>' + d.length + '</div>';
        }
        var pos = d3.mouse(self.container.node());
        self.container.select('.vi-histogram-tooltip')
            .style('opacity', 0.9)
            .html(content)
            .style("left", pos[0] + "px") 
            .style("top", (pos[1]-30) + "px");
    }
    function hideTooltip() {
        self.container.select('.vi-histogram-tooltip')
            .style('opacity', 0)
            .style("left", 0) 
            .style("top", 0);
    }

    function getBinValue(bin) {
        if(self.histogramModel.properties.plotType != 'Frequency') {
            return bin.length*100/self.fullData.length;
        }
        return bin.length;
    }
    function drawBarHistogram() {
        // Generate column groups
        let bars = self.svgContainer.selectAll('.bars').data(self.fullBins).enter()
            .append('g').attr('class', 'bars')
            .attr('transform', function(d) {
                //return 'translate(' + transformX(d.x0) + ', ' + transformY(getBinValue(d)) + ')';
                if (self.histogramModel.properties.plotType != 'Frequency') {
                    return 'translate(' + transformX(d.x0) + ', ' + transformY(d.length*100/self.fullData.length) + ')';
                }
                return 'translate(' + transformX(d.x0) + ', ' + transformY(d.length) + ')';
            });

        // Column width and gap setups
        var gap = 4;
        let colWidth = Math.abs(transformX(self.fullBins[0].x1) - transformX(self.fullBins[0].x0));
        gap = Math.min(gap, Math.floor(colWidth/5));
        
        // Generate histogram segments
        if (self.intervalBins) {
            // For intervalDepth case
            bars.append('rect')
                .attr('x', gap/2)
                .attr('width', colWidth - gap)
                .attr('y', function(d, i) {
                    if (self.histogramModel.properties.plotType != 'Frequency') {
                        return (transformY(self.intervalBins[i].length * 100 / self.fullData.length) - transformY(self.fullBins[i].length * 100 / self.fullData.length));
                    }
                    return (transformY(self.intervalBins[i].length) - transformY(self.fullBins[i].length ));
                })
                .attr('height', function(d, i) {
                    if (self.histogramModel.properties.plotType != 'Frequency') {
                        return transformY(wdY[0]) 
                            - transformY(self.intervalBins[i].length * 100 / self.fullData.length);
                    }
                    return transformY(wdY[0]) - transformY(self.intervalBins[i].length);
                })
                .attr('fill', self.histogramModel.properties.color?self.histogramModel.properties.color:'steelblue')
                .on('mousemove', showTooltip)
                .on('mouseout', hideTooltip);
        }
        else {
            // For zonalDepth case
            for (let j in self.zoneBins) {
                bars.append('rect')
                    .attr('x', gap/2)
                    .attr('width', colWidth - gap)
                    .attr('y', function(d, i) {
                        var fullBinHeight, cumHeight;
                        if (self.histogramModel.properties.plotType != 'Frequency') {
                            fullBinHeight = ( transformY(wdY[0]) - transformY(self.fullBins[i].length * 100/self.fullData.length) );
                            cumHeight = fullBinHeight;
                            for (let k = 0; k <= j; k++) {
                                cumHeight = cumHeight - (transformY(wdY[0]) - transformY(self.zoneBins[k][i].length * 100 / self.fullData.length));
                            }
                            return cumHeight;
                            //return (transformY(self.zoneBins[j][i].length * 100 / self.zoneBins[j].length) 
                            //        - transformY(self.fullBins[i].length * 100 / self.fullData.length));
                        }
                        fullBinHeight = (transformY(wdY[0]) - transformY(self.fullBins[i].length ));
                        cumHeight = fullBinHeight;
                        for (let k = 0; k <= j; k++) {
                            cumHeight = cumHeight - (transformY(wdY[0]) - transformY(self.zoneBins[k][i].length));
                        }
                        return cumHeight;
                    })
                    .attr('height', function(d, i) {
                        if (self.histogramModel.properties.plotType != 'Frequency') {
                            return transformY(wdY[0]) 
                                - transformY(self.zoneBins[j][i].length*100/self.fullData.length);
                        }
                        return transformY(wdY[0]) - transformY(self.zoneBins[j][i].length);
                    })
                    .attr('fill', self.zoneSet[j].properties.background?self.zoneSet[j].properties.background:'steelblue')
                    .on('mousemove', function(d, i) { showTooltip(self.zoneBins[j][i]); })
                    .on('mouseout', hideTooltip);
            }
        }
    }

    function drawGaussianCurve() {
        var squaredSigma = self.standardDeviation * self.standardDeviation;
        console.log(self.standardDeviation, self.mean, squaredSigma);
        var gaussianPoints = getData(4000);
        var gaussianTransformY = d3.scaleLinear()
            .domain(d3.extent(gaussianPoints, function(d) {return d.y;}))
            .range([vpY[1], vpY[0]]);

        var line = d3.line()
            .x(function(d) {
                return transformX(d.x);
            })
            .y(function(d) {
                return gaussianTransformY(d.y);
            });
        self.svgContainer.append('path').datum(gaussianPoints)
                .attr('class', 'gaussian-line').attr('d', line);
        let meanPos = transformX(self.mean);
        let leftSigmaPos = transformX(self.mean - self.standardDeviation);
        let rightSigmaPos = transformX(self.mean + self.standardDeviation);
        self.svgContainer.append('line').attr('class', 'mean-line')
            .attr('x1', meanPos)
            .attr('y1', 0)
            .attr('x2', meanPos)
            .attr('y2', vpY[1]);

        self.svgContainer.append('line').attr('class', 'sigma-line')
            .attr('x1', rightSigmaPos)
            .attr('y1', 0)
            .attr('x2', rightSigmaPos)
            .attr('y2', vpY[1]);

        self.svgContainer.append('line').attr('class', 'sigma-line')
            .attr('x1', leftSigmaPos)
            .attr('y1', 0)
            .attr('x2', leftSigmaPos)
            .attr('y2', vpY[1]);
        function normal() {
            var x = 0, y = 0, rds, c;
            var xSample;
            var left = Math.min(wdX[0], wdX[1]);
            var right = Math.max(wdX[0], wdX[1]);
            do {
                do {
                    x = (Math.random() * 2 - 1);
                    y = (Math.random() * 2 - 1);
                    rds = x * x + y * y;
                } while (rds == 0 || rds > 1);
                c = Math.sqrt(-2 * Math.log(rds) / rds); // Box-Muller transform
                xSample = self.mean + self.standardDeviation * x * c;
            } while (xSample < left || xSample > right);

            return xSample;
        }

        //taken from Jason Davies science library
        // https://github.com/jasondavies/science.js/
        function gaussian(x) {
            var gaussianConstant = 1 / Math.sqrt(2 * Math.PI),
            mean = self.mean,
            sigma = self.standardDeviation;

            x = (x - mean) / sigma;
            return gaussianConstant * Math.exp(-.5 * x * x) / sigma;
        };
        function getData(numSamples) {
            var data = new Array();
            // loop to populate data array with 
            // probabily - quantile pairs
            for (var i = 0; i < numSamples; i++) {
                x = normal(); // calc random draw from normal dist
                y = gaussian(x) // calc prob of rand draw
                point = {
                    x: x,
                    y: y
                }
                data.push(point);
            };
            // need to sort for plotting
            //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
            data.sort(function(x, y) {
                return x.x - y.x;
            });
            return data;
        }
    }
}

Histogram.prototype.init = function(domElem) {
    var self = this;
    console.log("init histogram into domElem:", domElem);
    this.container = d3.select(domElem).attr('class', 'vi-histogram-container');
    this.svgContainer = this.container.append('svg')
        .attr('class', 'vi-histogram-svg')
        .attr('width',this.container.node().clientWidth)
        .attr('height', this.container.node().clientHeight);

    this.container.append('div').attr('class', 'vi-histogram-tooltip').style('opacity', 0);

    new ResizeSensor( $(this.container.node()), function(param) {
        console.log("On resize", param, this);
        self.doPlot();
    } );

    this.svgContainer
        .selectAll('g.vi-histogram-axis-group')
        .data([
            'vi-histogram-axis-ticks vi-histogram-axis-x-ticks',
            'vi-histogram-axis-grids vi-histogram-axis-x-grids',
            'vi-histogram-axis-ticks vi-histogram-axis-y-ticks',
            'vi-histogram-axis-grids vi-histogram-axis-y-grids'
        ])
        .enter()
            .append('g')
            .attr('class', function(d) { return 'vi-histogram-axis-group ' + d; });

    this.trap('histogram-update', function() {
        console.warn('Update histogram');
        if (self.drawPending) {
            console.warn('draw request is pending already');
            //return;
        }
        self.drawPending = true;
        self.doPlot();
    });
    window.VISHISTOGRAM = this;
}

Histogram.prototype.getViewportY = function() {
    return [0, $(this.svgContainer.node()).height()];
}
Histogram.prototype.getViewportX = function() {
    return [0, $(this.svgContainer.node()).width()];
}
Histogram.prototype.getWindowY = function() {
    if (this.histogramModel.properties.plotType != 'Frequency') {
        let total = this.fullData.length;
        console.log('getWindowY: Percent');
        return [0, d3.max(this.fullBins, function(d) { return d.length*100/total;})];
    }
    return [0, d3.max(this.fullBins, function(d) {return d.length;})];
}
Histogram.prototype.getWindowX = function() {
    return [this.histogramModel.properties.leftScale, this.histogramModel.properties.rightScale];
}

Histogram.prototype.getNormalizedWindowX = function() {
    return d3.extent(this.getWindowX());
}

Histogram.prototype.getTransformX = function() {
    return d3.scaleLinear()
        .domain(this.getWindowX())
        .range(this.getViewportX());
}

Histogram.prototype.getTransformY = function() {
    let wdY = this.getWindowY();
    return d3.scaleLinear()
        .domain([wdY[1], wdY[0]])
        .range(this.getViewportY());
}
Histogram.prototype.getLength = function () {
    if (!this.histogramModel.properties.idZoneSet) {
        // intervalDepth case
        if (!this.intervalData) return null;
        return this.intervalData.length;
    }
    // zonalDepth case
    if (!this.zoneData || !this.zoneData.length) return null;

    var allLength = this.zoneData.reduce(function(sumLength, aZoneData) {
        return sumLength + aZoneData.length;
    }, 0);

    return allLength;
}

Histogram.prototype.getMin = function () {
    if (!this.histogramModel.properties.idZoneSet) {
        // intervalDepth case
        if (!this.intervalData) return null;
        return d3.min(this.intervalData);
    }
    // zonalDepth case
    if (!this.zoneData || !this.zoneData.length) return null;

    var minOfAll = this.zoneData.reduce(function(minVal, aZoneData) {
        var aMin = d3.min(aZoneData);
        return (minVal > aMin)?aMin:minVal;
    }, 9999999);

    return minOfAll;
}

Histogram.prototype.getMax = function () {
    if (!this.histogramModel.properties.idZoneSet) {
        // intervalDepth case
        if (!this.intervalData) return null;
        return d3.max(this.intervalData);
    }
    // zonalDepth case
    if (!this.zoneData || !this.zoneData.length) return null;

    var maxOfAll = this.zoneData.reduce(function(maxVal, aZoneData) {
        var aMax = d3.max(aZoneData);
        return (maxVal < aMax)?aMax:maxVal;
    }, -9999999);

    return maxOfAll;
}

const __DECIMAL_LEN = 4

Histogram.prototype.joinZoneData = function() {
    if (!this.joinedZoneData) {
        this.joinedZoneData = [].concat.apply([], this.zoneData);
    }
    return this.joinedZoneData;
}
Histogram.prototype.unsetJoinedZoneData = function() {
    delete this.joinedZoneData;
}

Histogram.prototype.getAverage = function() {
    return this.mean.toFixed(__DECIMAL_LEN);
}
Histogram.prototype._getAverage = function () {
    if (!this.histogramModel.properties.idZoneSet) {
        // intervalDepth case
        if (!this.intervalData) return null;
        return d3.mean(this.intervalData);
    }
    // zonalDepth case
    if (!this.zoneData || !this.zoneData.length) return null;
    return d3.mean(this.joinZoneData());
}

function calAverageDeviation(data) {
    var mean = d3.mean(data);

    return d3.mean(data, function (d) {
        return Math.abs(d - mean)
    }).toFixed(__DECIMAL_LEN);
}


Histogram.prototype.getAverageDeviation = function () {
    if (!this.histogramModel.properties.idZoneSet) {
        // intervalDepth case
        if (!this.intervalData) return null;
        return calAverageDeviation(this.intervalData);
    }
    // zonalDepth case
    if (!this.zoneData || !this.zoneData.length) return null;
    var newArray = this.joinZoneData();
    return calAverageDeviation(newArray);
}

Histogram.prototype.getStandardDeviation = function() {
    return this.standardDeviation.toFixed(__DECIMAL_LEN);
}
Histogram.prototype._getStandardDeviation = function () {
    if (!this.histogramModel.properties.idZoneSet) {
        // intervalDepth case
        if (!this.intervalData) return null;
        return d3.deviation(this.intervalData);
    }
    // zonalDepth case
    if (!this.zoneData || !this.zoneData.length) return null;
    var newArray = this.joinZoneData();
    return d3.deviation(newArray);
}

Histogram.prototype.getVariance = function () {
    if (!this.histogramModel.properties.idZoneSet) {
        // intervalDepth case
        if (!this.intervalData) return null;
        return d3.variance(this.intervalData).toFixed(__DECIMAL_LEN);
    }
    // zonalDepth case
    if (!this.zoneData || !this.zoneData.length) return null;
    var newArray = this.joinZoneData();
    return d3.variance(newArray).toFixed(__DECIMAL_LEN);
}

Histogram.prototype.getSkewness = function () {
    if (!this.histogramModel.properties.idZoneSet) {
        // intervalDepth case
        if (!this.intervalData) return null;
        return ss.sampleSkewness(this.intervalData).toFixed(__DECIMAL_LEN);
    }
    // zonalDepth case
    if (!this.zoneData || !this.zoneData.length) return null;
    return ss.sampleSkewness(this.joinZoneData()).toFixed(__DECIMAL_LEN);

}

Histogram.prototype.getKurtosis = function () {
    if (!this.histogramModel.properties.idZoneSet) {
        // intervalDepth case
        if (!this.intervalData) return null;
        return ss.sampleKurtosis(this.intervalData).toFixed(__DECIMAL_LEN);
    }
    // zonalDepth case
    if (!this.zoneData || !this.zoneData.length) return null;
    return ss.sampleKurtosis(this.joinZoneData()).toFixed(__DECIMAL_LEN);
}

Histogram.prototype.getMedian = function () {
    if (!this.histogramModel.properties.idZoneSet) {
        // intervalDepth case
        if (!this.intervalData) return null;
        return d3.median(this.intervalData);
    }
    // zonalDepth case
    if (!this.zoneData || !this.zoneData.length) return null;
    return d3.median(this.joinZoneData());
}

function calPercentile(data, p) {
    return d3.quantile(data.sort(function (a, b) {
        return a - b;
    }), p).toFixed(__DECIMAL_LEN);
}

Histogram.prototype.getPercentile = function (p) {

    if (!this.histogramModel.properties.idZoneSet) {
        // intervalDepth case
        if (!this.intervalData) return null;
        return calPercentile(this.intervalData, p);
    }
    // zonalDepth case
    if (!this.zoneData || !this.zoneData.length) return null;
    return calPercentile(this.joinZoneData(), p);
}
