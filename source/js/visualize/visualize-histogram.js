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
    this.discriminator = histogramModel.properties.discriminator;
    this.discriminatorArr = null;

    // visualize instant vars
    this.svgContainer = null;
    this.depthStep = -1;
    this.fullData = null;
    this.intervalData = null;
    this.discriminatorData = null;
    this.zoneData = new Array();
    this.zoneBins = new Array();

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

Histogram.prototype.setHistogramModel = function(histogramModel) {
    this.histogramModel = histogramModel;
}

Histogram.prototype.setZoneSet = function(zoneSet) {
    this.zoneSet = zoneSet;
}
Histogram.prototype.setCurve = function(data) {
    if (data == null) {
        delete this.data;
        this.zoneData.length = 0;
        this.zoneBins.length = 0;
        delete this.intervalData;
        delete this.intervalBins;
        delete this.mean;
        delete this.standardDeviation;        
        return;
    }
    this.data = data;
}

Histogram.prototype.getTickValuesY = function() {
    if (this.histogramModel.properties.plotType != "Frequency") { // Percentile
        return d3.range(0, 100, 10);
    }
    // plotType == Frequency
    return d3.range(0, d3.max(this.bins, function(d) {return d.length}), 100);
}

Histogram.prototype.getDiscriminatorData = function (){
    let self = this;
    if(self.discriminatorArr && self.discriminatorArr.length){
        let result = [];
        for(let i = 0; i < self.data.length; i++){
            if(self.discriminatorArr[i]){
                result.push(self.data[i]);
            }
        }
        return result.filter(function(d) {return !isNaN(d.x);});
    }else {
        console.log('no discriminator');
        return self.data.filter(function(d) {return !isNaN(d.x);});
    }
}

Histogram.prototype.filterF = function(d, zoneIdx) {
    var tempDepth = 0;
    if (!this.histogramModel) return false;
    if(this.histogramModel.properties.leftScale == this.histogramModel.properties.rightScale) return false;
    if (this.histogramModel.properties.idZoneSet & !zoneIdx) {
        return true;
    }

    tempDepth = this.startDepth + this.depthStep * parseInt(d.y);
    left = Math.min(this.histogramModel.properties.leftScale, this.histogramModel.properties.rightScale);
    right = Math.max(this.histogramModel.properties.leftScale, this.histogramModel.properties.rightScale);

    if(this.histogramModel && this.histogramModel.properties.idZoneSet) {
        let zone = this.zoneSet[zoneIdx];
        return (!isNaN(d.y) && ( tempDepth >= zone.properties.startDepth ) && 
                ( tempDepth < zone.properties.endDepth ) && (parseFloat(d.x) >= left) && (parseFloat(d.x) <= right));
    }
    let xFloat = parseFloat(d.x);
    return (
        !isNaN(d.y) && 
        ( tempDepth >= this.histogramModel.properties.intervalDepthTop ) && 
        ( tempDepth < this.histogramModel.properties.intervalDepthBottom ) && 
        (xFloat >= left) && 
        (xFloat <= right)
    );
}

Histogram.prototype.getZoneData = function(idx) {
    var self = this;
    return this.discriminatorData.filter(function(d) {
        return self.filterF.call(self, d, idx);
    }).map(function(d) { return parseFloat(d.x); });
}

Histogram.prototype.getIntervalData = function() {
    var self = this;
    return this.discriminatorData.filter(function(d) {
        return self.filterF.call(self, d);
    }).map(function(d) { return parseFloat(d.x); });
}

Histogram.prototype.getFullData = function() {
    var self = this;
    return this.discriminatorData.map(function(d) { return parseFloat(d.x); });
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
const MINOR_TICKS = 5
Histogram.prototype.doPlot = function() {
    var self = this;
    console.log('vihist doPlot');
    if (self.timerHandle) {
        clearTimeout(self.timerHandle)
    }
    self.timerHandle = setTimeout(function() {
        self.timerHandle = null;
        self._doPlot();
    }, 500);
}
Histogram.prototype._doPlot = function() {
    var self = this;

    if($(this.container.node()).width() < 0 || $(this.container.node()).height() < 0)
        return;
    // Adjust svgContainer size
    self.svgContainer
        .attr('width', $(this.container.node()).width())
        .attr('height', $(this.container.node()).height());

    // remove previously render histograms
    this.svgContainer.selectAll('.bars, .curves, path.gaussian-line, path.cumulative-line, line.mean-line, line.sigma-line, .mean-label, .sigma-label').remove();

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
        console.error('No zoneSet to draw');
        return;
    }

    // Local variables
    console.log('Do plot begin');
    let wdX = this.getWindowX(self.histogramModel.properties.loga, 
        self.histogramModel.properties.flipHorizontal);
    let vpX = this.getViewportX();
    let vpY = this.getViewportY();
    let transformX = this.getTransformX(self.histogramModel.properties.loga, 
        self.histogramModel.properties.flipHorizontal);
    let transformY = null, transformCumulativeY = null;

    let nBins = this.histogramModel.properties.divisions;
    let domain = this.getNormalizedWindowX();
    let step = (wdX[1] - wdX[0]) / nBins;

    let jumpFactorSeed = 20;
    if(vpX[1] <= 200) {
        jumpFactorSeed = 5;
    }
    let realStep = step;
    let jumpFactor = Math.ceil(nBins/jumpFactorSeed);
    if (jumpFactor > 1) realStep = jumpFactor * step;

    let tickCountX = (vpX[1] - vpX[0])/40;
    // Setup Axis X
    let xTickValues;
    if (!self.histogramModel.properties.loga) {
        xTickValues = d3.range(wdX[0], wdX[1], realStep);
    }
    else {
        xTickValues = Utils.genLogTickValues(wdX[0], wdX[1]);
    }
    let _nDecimal = Math.ceil(-1*Math.log10(Math.abs(realStep)));
    _nDecimal = (_nDecimal >= 0)? _nDecimal:0;
    
    this.axisX = d3.axisBottom(transformX)
        .tickValues(xTickValues)
//        .tickFormat(Utils.getDecimalFormatter(realStep > 1 ? 0:2))
        .tickFormat(Utils.getDecimalFormatter(_nDecimal))
        .tickPadding(10);

    // Setup histogram generator
    let thresholds;
    if (!self.histogramModel.properties.loga) {
        thresholds = d3.range(domain[0], domain[1], (domain[1] - domain[0])/nBins);
    }
    else {
        let targetThresholds = d3.range(vpX[0], vpX[1], (vpX[1] - vpX[0])/nBins);
        thresholds = targetThresholds.map(function(d) {
            return transformX.invert(d);
        });
    }
    var histogramGenerator = d3.histogram().domain(domain).thresholds(thresholds);

    // Prepare data and group them in bins: fullData/fullBins, intervalData/intervalBins, zoneData[]/zoneBins[]
    // We may reverse bins if necessary
    this.discriminatorData = this.getDiscriminatorData();
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
    
    transformCumulativeY = this.getTransformCumulativeY();

    var tickCount = Math.floor(vpY[1]/40);
    var allTickCount = (tickCount - 1)*MINOR_TICKS + 1;
    this.axisY = d3.axisLeft(transformY)
        .ticks(allTickCount , ',.0f')
        .tickFormat(function (d, i) {
            return (i % MINOR_TICKS)?"":d;
        })
        .tickPadding(10);

//    this.axisCumulativeY = d3.axisRight(transformCumulativeY)
//        .ticks(tickCount, ',.2f');

    // Generate X and Y axes
    this.axisX = this.axisX.tickSize(-this.svgContainer.node().clientHeight);
    this.axisY = this.axisY.tickSize(-this.svgContainer.node().clientWidth);

    let axisXGroup = this.svgContainer.select('g.vi-histogram-axis-x-ticks');
    axisXGroup.call(this.axisX)
        .style('transform', 'translateY(' + vpY[1] + 'px)');

    if (self.histogramModel.properties.loga) {
        axisXGroup.selectAll('.tick').classed('majorX', function(d, i) {
            return Utils.logMajorTest(xTickValues[i]);
        });
    }
    else {
        axisXGroup.selectAll('.tick').classed('majorX', true);
    }

    let axisYGroup = this.svgContainer.select('g.vi-histogram-axis-y-ticks');
    axisYGroup.call(this.axisY)
        .style('transform', 'translateX(' + vpX[0] + 'px)');


    this.svgContainer.selectAll('g.vi-histogram-axis-y-ticks .tick.major')
        .classed('major', false)
        .select('.second-label').remove();

    this.svgContainer.selectAll('g.vi-histogram-axis-y-ticks .tick')
        .filter(function(d, i) {
            return (i % MINOR_TICKS) == 0;
        })
        .classed('major', true);

    this.svgContainer.selectAll('g.vi-histogram-axis-y-ticks .tick.major')
        .append('text')
        .attr('class', 'second-label')
        .text(function(d) {
            var newLabel = transformCumulativeY.invert(transformY(d)).toFixed(0);
            return newLabel;
        })
        .attr('text-anchor', 'start')
        .attr('fill', '#000')
        .style('transform', 'translate(' + (vpX[1] + 4) + 'px, 2px)');
//    this.svgContainer.select('g.vi-histogram-axis-cumulative-y-ticks')
//        .call(this.axisCumulativeY)
//        .style('transform', 'translateX(' + (vpX[1] - 100) + 'px)');
    if(self.histogramModel.properties.plot === "Bar") {
        drawBarHistogram();
    } else if(self.histogramModel.properties.plot === "Curve"){
        drawCurveHistogram();
    }

    if (self.histogramModel.properties.showGaussian) {
        drawGaussianCurve();
    }

    if (self.histogramModel.properties.showCumulative) {
        drawCumulativeCurve();
    }

    if (self.histogramModel.properties.showGrid) {
        self.container.classed('show-grid', true).classed('hide-grid', false);
    }
    else {
        self.container.classed('show-grid', false).classed('hide-grid', true);
    }
    function showTooltip(d, i) {
        var content = null;
        if (self.histogramModel.properties.plotType != 'Frequency') {
            content = '<span>' + (d.length * 100 / self.getLength()).toFixed(2) + '%</span>';                
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
                if (self.histogramModel.properties.plotType != 'Frequency') {
                    return 'translate(' + transformX(d.x0) + ', ' + transformY(d.length*100/self.fullData.length) + ')';
                }
                return 'translate(' + transformX(d.x0) + ', ' + transformY(d.length) + ')';
            });

        // Column width and gap setups
        var gap = 4;
        let colWidth = d3.min(self.fullBins, function(d) {
            var w = Math.abs(transformX(d.x1) - transformX(d.x0));
            return w;
        });
        gap = Math.min(gap, Math.floor(colWidth/5));
        
        // Generate histogram segments
        if (self.intervalBins) {
            // For intervalDepth case
            bars.append('rect')
                //.attr('x', gap/2)
                //.attr('width', colWidth - gap)
                .attr('x', 3)
                .attr('width', function(d, i) {
                    var width = Math.abs(transformX(self.fullBins[i].x1) - transformX(self.fullBins[i].x0));
                    return width - 3;
                })
                .attr('y', function(d, i) {
                    if (self.histogramModel.properties.plotType != 'Frequency') {
                        return (transformY(self.intervalBins[i].length * 100 / self.intervalData.length) - transformY(self.fullBins[i].length * 100 / self.fullData.length));
                    }
                    return (transformY(self.intervalBins[i].length) - transformY(self.fullBins[i].length ));
                })
                .attr('height', function(d, i) {
                    if (self.histogramModel.properties.plotType != 'Frequency') {
                        return transformY(wdY[0]) 
                            - transformY(self.intervalBins[i].length * 100 / self.intervalData.length);
                    }
                    return transformY(wdY[0]) - transformY(self.intervalBins[i].length);
                })
                .attr('fill', self.histogramModel.properties.color?self.histogramModel.properties.color:'steelblue')
                .on('mousemove', function(d, i) { 
                    if (self.histogramModel.properties.showTooltip)
                        showTooltip(self.intervalBins[i]);
                })
                .on('mouseout', hideTooltip);
        }
        else {
            // For zonalDepth case
            for (let j in self.zoneBins) {
                bars.append('rect')
                    //.attr('x', gap/2)
                    //.attr('width', colWidth - gap)
                    .attr('x', 3)
                    .attr('width', function(d, i) {
                        var width = Math.abs(transformX(self.fullBins[i].x1) - transformX(self.fullBins[i].x0));
                        return width - 3;
                    })
                    .attr('y', function(d, i) {
                        var fullBinHeight, cumHeight;
                        if (self.histogramModel.properties.plotType != 'Frequency') {
                            let len = self.getLength();                                                        
                            fullBinHeight = ( transformY(wdY[0]) - transformY(self.fullBins[i].length * 100/self.fullData.length) );
                            cumHeight = fullBinHeight;
                            for (let k = 0; k <= j; k++) {
                                cumHeight = cumHeight - (transformY(wdY[0]) - transformY(self.zoneBins[k][i].length * 100 / len));
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
                            let len = self.getLength();                            
                            return transformY(wdY[0]) 
                                - transformY(self.zoneBins[j][i].length*100/len);
                        }
                        return transformY(wdY[0]) - transformY(self.zoneBins[j][i].length);
                    })
                    .attr('fill', self.zoneSet[j].properties.background?self.zoneSet[j].properties.background:'steelblue')
                    .on('mousemove', function(d, i) { 
                        if (self.histogramModel.properties.showTooltip)
                            showTooltip(self.intervalBins[i]);
                    })
                    .on('mouseout', hideTooltip);
            }
        }
    }

    function drawCurveHistogram() {
        //var line = d3.line().curve(d3.curveCatmullRom.alpha(0.5));
        var line = d3.line().curve(d3.curveBasis);
        var path = self.svgContainer.append('path')
            .attr('class', 'curves');
        
        if (self.intervalBins) {
            line
                .x(function(d, i) {
                    var width = Math.abs(transformX(self.fullBins[i].x1) - transformX(self.fullBins[i].x0));
                    return transformX(d.x0) + width / 2;
                })
                .y(function(d, i) {
                    if (self.histogramModel.properties.plotType != 'Frequency') {
                        return transformY(d.length*100/self.fullData.length) + (transformY(self.intervalBins[i].length * 100 / self.intervalData.length) - transformY(d.length * 100 / self.fullData.length));
                    }
                    return transformY(d.length) + (transformY(self.intervalBins[i].length) - transformY(d.length ));    
                });

                path.attr('stroke', self.histogramModel.properties.color?self.histogramModel.properties.color:'steelblue');

        } else {
            line
                .x(function(d, i) {
                    var width = Math.abs(transformX(self.fullBins[i].x1) - transformX(self.fullBins[i].x0));
                    return transformX(d.x0) + width / 2;
                })
                .y(function(d, i) {
                    let binsHeight = 0;
                    for(let j = 0; j < self.zoneBins.length; ++j) {
                        if(!binsHeight) {
                            binsHeight = self.zoneBins[j][i].length;
                        } else {
                            binsHeight += self.zoneBins[j][i].length;
                        }
                    }
                    if(self.histogramModel.properties.plotType != 'Frequency') {
                        let len = self.getLength();
                        return transformY(binsHeight*100/len);
                    }
                    return transformY(binsHeight);    
                });
                path.attr('stroke', self.zoneSet[self.zoneSet.length-1].properties.background ? self.zoneSet[self.zoneSet.length-1].properties.background:'blue');
        }

        path.datum(self.fullBins)
            .attr('d', line);
    }

    function drawGaussianCurve() {
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
            })
            .curve(d3.curveCatmullRom.alpha(0.2));

            //.curve(d3.curveBasis);
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

        self.svgContainer.append("text")
            .attr("y", 10)
            .attr("x", meanPos)
            .attr('text-anchor', 'start')
            .attr("class", "mean-label")
            .text("Avg");

        self.svgContainer.append('line').attr('class', 'sigma-line')
            .attr('x1', rightSigmaPos)
            .attr('y1', 0)
            .attr('x2', rightSigmaPos)
            .attr('y2', vpY[1]);
        
        self.svgContainer.append("text")
            .attr("y", 10)
            .attr("x", rightSigmaPos)
            .attr('text-anchor', 'start')
            .attr("class", "sigma-label")
            .text("Std Dev");

        self.svgContainer.append('line').attr('class', 'sigma-line')
            .attr('x1', leftSigmaPos)
            .attr('y1', 0)
            .attr('x2', leftSigmaPos)
            .attr('y2', vpY[1]);

        self.svgContainer.append("text")
            .attr("y", 10)
            .attr("x", leftSigmaPos)
            .attr('text-anchor', 'start')
            .attr("class", "sigma-label")
            .text("Std Dev");

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
    function drawCumulativeCurve() {
        var cumulativePoints = getCumulativeData();
        var cumulativeTransformY = d3.scaleLinear()
            .domain(d3.extent(cumulativePoints, function(d) {return d.y;}))
            .range([vpY[1], vpY[0]]);

        var line = d3.line()
            .x(function(d) {
                return transformX(d.x);
            })
            .y(function(d) {
                return cumulativeTransformY(d.y);
            })
            //.curve(d3.curveCatmullRom.alpha(0.2));
            .curve(d3.curveBasis);

        self.svgContainer.append('path').datum(cumulativePoints)
                .attr('class', 'cumulative-line').attr('d', line);

        function getCumulativeData() {
            var cumulativeVal = 0;
            var points = new Array();
            if (self.intervalBins) {
                if (self.histogramModel.properties.plotType != 'Frequency') {
                    for (let i in self.intervalBins) {
                        cumulativeVal += self.intervalBins[i].length * 100 / self.fullData.length;
                        points.push({
                            x: (self.intervalBins[i].x0 + self.intervalBins[i].x1)/2,
                            y: cumulativeVal
                        });
                    }
                } 
                else {
                    for (let i in self.intervalBins) {
                        cumulativeVal += self.intervalBins[i].length;
                        points.push({
                            x: (self.intervalBins[i].x0 + self.intervalBins[i].x1)/2,
                            y: cumulativeVal
                        });
                    }
                }
            }
            else {
                if (self.histogramModel.properties.plotType != 'Frequency') {
                    let fullData = 0;

                    for (let i in self.zoneBins) 
                        fullData += d3.sum(self.zoneBins[i], function(d) {return d.length;});

                    for (let i in self.fullBins) {
                        let tempVal = 0;
                        for (let j in self.zoneBins) {
                            tempVal += self.zoneBins[j][i].length;
                        }
                        tempVal = tempVal * 100 / fullData;
                        cumulativeVal += tempVal;
                        points.push({
                            x: (self.fullBins[i].x0 + self.fullBins[i].x1)/2,
                            y: cumulativeVal
                        });
                    }
                }
                else {
                    for (let i in self.fullBins) {
                        let tempVal = 0;
                        for (let j in self.zoneBins) {
                            tempVal += self.zoneBins[j][i].length;
                        }
                        cumulativeVal += tempVal;
                        points.push({
                            x: (self.fullBins[i].x0 + self.fullBins[i].x1)/2,
                            y: cumulativeVal
                        });
                    }
                }
            }
            return points;
        }
    }
}

Histogram.prototype.init = function(domElem) {
    var self = this;
    console.log("init histogram into domElem:", domElem);
    this.container = d3.select(domElem).classed('vi-histogram-container', true);
    
    this.svgContainer = this.container.append('svg')
        .attr('class', 'vi-histogram-svg')
        .attr('width', $(this.container.node()).width())
        .attr('height', $(this.container.node()).height());

    this.container.append('div').attr('class', 'vi-histogram-tooltip').style('opacity', 0);

    this.resizeSensor = new ResizeSensor( $(this.container.node()), function(param) {
        self.doPlot();
    } );
    document.addEventListener('resize', function (event) {
        self.doPlot();
    })

    this.svgContainer
        .selectAll('g.vi-histogram-axis-group')
        .data([
            'vi-histogram-axis-ticks vi-histogram-axis-x-ticks',
            'vi-histogram-axis-grids vi-histogram-axis-x-grids',
            'vi-histogram-axis-ticks vi-histogram-axis-y-ticks',
            'vi-histogram-axis-ticks vi-histogram-axis-cumulative-y-ticks',
            'vi-histogram-axis-grids vi-histogram-axis-y-grids'
        ])
        .enter()
            .append('g')
            .attr('class', function(d) { return 'vi-histogram-axis-group ' + d; });

    this.trap('histogram-update', function() {
        console.warn('Update histogram');
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
    if (!this.histogramModel.properties.idZoneSet) {
        // intervalDepth case
        if (this.histogramModel.properties.plotType != 'Frequency') {
            let total = this.intervalData.length;
            return [0, d3.max(this.intervalBins, function(d) { return d.length*100/total;})];
        }
        return [0, d3.max(this.intervalBins, function(d) {return d.length;})];
    }else{
        // zoneDepth case
        let totalLenArr = this.zoneBins.reduce(function (r, a) {
            a.forEach(function (b, i) {
                r[i] = (r[i] || 0) + b.length;
            });
            return r;
        }, []);

        if (this.histogramModel.properties.plotType != 'Frequency') {
            let total = this.getLength();
            return [0, d3.max(totalLenArr, function(d) { return d*100/total;})];
        }
        return [0, d3.max(totalLenArr)];
    }
}
Histogram.prototype.getWindowX = function(isLoga, isFlipped) {
    var left = this.histogramModel.properties.leftScale;
    var right = this.histogramModel.properties.rightScale;

    if (isFlipped) {
        left = this.histogramModel.properties.rightScale;
        right = this.histogramModel.properties.leftScale;
    }

    if (!isLoga) 
        return [left, right];
    var left = (left > 0)? left : 0.001;
    var right = (right)? right: 0.001;
    return [left, right];
}

Histogram.prototype.getNormalizedWindowX = function() {
    return d3.extent(this.getWindowX(this.histogramModel.properties.loga, 
        this.histogramModel.properties.flipHorizontal));
}

Histogram.prototype.getTransformX = function(isLoga, isFlipped) {
    if (!isLoga) return d3.scaleLinear()
        .domain(this.getWindowX(false, isFlipped))
        .range(this.getViewportX());
    return d3.scaleLog()
        .domain(this.getWindowX(true, isFlipped))
        .range(this.getViewportX());
}

Histogram.prototype.getTransformY = function() {
    let wdY = this.getWindowY();
    return d3.scaleLinear()
        .domain([wdY[1], wdY[0]])
        .range(this.getViewportY());
}

Histogram.prototype.getTransformCumulativeY = function() {
    let wdY = this.getWindowY();
    return d3.scaleLinear()
        .domain([100, 0])
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
    return this.mean?this.mean.toFixed(__DECIMAL_LEN):null;
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
        if (!this.intervalData || !this.intervalData.length) return null;
        return calAverageDeviation(this.intervalData);
    }
    // zonalDepth case
    if (!this.zoneData || !this.zoneData.length) return null;
    var newArray = this.joinZoneData();
    return calAverageDeviation(newArray);
}

Histogram.prototype.getStandardDeviation = function() {
    return this.standardDeviation?this.standardDeviation.toFixed(__DECIMAL_LEN):null;
}
Histogram.prototype._getStandardDeviation = function () {
    if (!this.histogramModel.properties.idZoneSet) {
        // intervalDepth case
        if (!this.intervalData || !this.intervalData.length) return null;
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
        if (!this.intervalData || !this.intervalData.length) return null;
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
        if (!this.intervalData || !this.intervalData.length) return null;
        return ss.sampleSkewness(this.intervalData).toFixed(__DECIMAL_LEN);
    }
    // zonalDepth case
    if (!this.zoneData || !this.zoneData.length) return null;
    return ss.sampleSkewness(this.joinZoneData()).toFixed(__DECIMAL_LEN);

}

Histogram.prototype.getKurtosis = function () {
    if (!this.histogramModel.properties.idZoneSet) {
        // intervalDepth case
        if (!this.intervalData || !this.intervalData.length) return null;
        return ss.sampleKurtosis(this.intervalData).toFixed(__DECIMAL_LEN);
    }
    // zonalDepth case
    if (!this.zoneData || !this.zoneData.length) return null;
    return ss.sampleKurtosis(this.joinZoneData()).toFixed(__DECIMAL_LEN);
}

Histogram.prototype.getMedian = function () {
    if (!this.histogramModel.properties.idZoneSet) {
        // intervalDepth case
        if (!this.intervalData || !this.intervalData.length) return null;
        return d3.median(this.intervalData).toFixed(__DECIMAL_LEN);
    }
    // zonalDepth case
    if (!this.zoneData || !this.zoneData.length) return null;
    return d3.median(this.joinZoneData()).toFixed(__DECIMAL_LEN);
}

function calPercentile(data, p) {
    return d3.quantile(data.sort(function (a, b) {
        return a - b;
    }), p).toFixed(__DECIMAL_LEN);
}

Histogram.prototype.getPercentile = function (p) {

    if (!this.histogramModel.properties.idZoneSet) {
        // intervalDepth case
        if (!this.intervalData || !this.intervalData.length) return null;
        return calPercentile(this.intervalData, p);
    }
    // zonalDepth case
    if (!this.zoneData || !this.zoneData.length) return null;
    return calPercentile(this.joinZoneData(), p);
}
