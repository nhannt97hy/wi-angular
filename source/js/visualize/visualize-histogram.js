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
    if (this.drawPending) this.doPlot();
}
Histogram.prototype.setCurve = function(data) {
    this.data = data.filter(function(d) {return !isNaN(d.x);}); // ? clone
    if (this.drawPending) this.doPlot();
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
        // TODO
        let zone = this.zoneSet[zoneIdx];
        return (!isNaN(d.y) && ( tempDepth >= zone.properties.startDepth ) && 
                ( tempDepth < zone.properties.endDepth ));
    }

    /*
    let isANumber = !isNaN(d.y);
    let gtDepthTop = ( tempDepth >= this.histogramModel.properties.intervalDepthTop );
    let ltDepthBottom = ( tempDepth < this.histogramModel.properties.intervalDepthBottom );
    if ( isANumber ) {
        if ( gtDepthTop ) {
            if (ltDepthBottom ) {
                return true;
            }
        }
    }
    return false;
    */

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
    if (this.histogramModel.properties.idZoneSet) {
        delete this.intervalData;
        delete this.intervalBins;
        for (let i in this.zoneSet) {
            this.zoneData[i] = this.getZoneData(i);
            this.zoneBins[i] = histogramGenerator(this.zoneData[i]);
            if (step < 0) __reverseBins(this.zoneBins[i]);
        }
    }
    else {
        this.zoneData.length = 0;
        this.zoneBins.length = 0;
        this.intervalData = this.getIntervalData();
        this.intervalBins = histogramGenerator(this.intervalData);
        if (step < 0) __reverseBins(this.intervalBins);
    }

    // After having data, we can setup vertical transformation and Y axis (Y axis) 
    let wdY = this.getWindowY();
    transformY = this.getTransformY();

    this.axisY = d3.axisLeft(transformY)
        .ticks(Math.floor(vpY[1]/40), ',.0f');

    // remove previously render histograms
    this.svgContainer.selectAll('.bars').remove();
    
    // Generate X and Y axes
    this.svgContainer.select('g.vi-histogram-axis-x-ticks')
        .call(this.axisX)
        .style('transform', 'translateY(' + vpY[1] + 'px)');
    this.svgContainer.select('g.vi-histogram-axis-y-ticks')
        .call(this.axisY)
        .style('transform', 'translateX(' + vpX[0] + 'px)');

    // Generate column groups
    let bars = this.svgContainer.selectAll('.bars').data(this.fullBins).enter()
        .append('g').attr('class', 'bars')
        .attr('transform', function(d) {
            if (self.histogramModel.properties.plotType != 'Frequency') {
                return 'translate(' + transformX(d.x0) + ', ' + transformY(d.length*100/self.data.length) + ')';
                //return 'translate(' + transformX(d.x0) + ', 0)';
            }
            return 'translate(' + transformX(d.x0) + ', ' + transformY(d.length) + ')';
            //return 'translate(' + transformX(d.x0) + ', 0)';
        });

    // Column width and gap setups
    var gap = 4;
    let colWidth = Math.abs(transformX(self.fullBins[0].x1) - transformX(self.fullBins[0].x0));
    gap = Math.min(gap, Math.floor(colWidth/5));
    
    // Generate histogram segments
    if (this.intervalBins) {
        // For intervalDepth case
        bars.append('rect')
            .attr('x', gap/2)
            .attr('width', colWidth - gap)
            .attr('y', function(d, i) {
                if (self.histogramModel.properties.plotType != 'Frequency') {
                    return (transformY(self.intervalBins[i].length * 100 / self.intervalData.length) - transformY(self.fullBins[i].length * 100 / self.data.length));
                }
                return (transformY(self.intervalBins[i].length) - transformY(self.fullBins[i].length ));
            })
            .attr('height', function(d, i) {
                if (self.histogramModel.properties.plotType != 'Frequency') {
                    return transformY(wdY[0]) - transformY(self.intervalBins[i].length * 100 / self.intervalData.length);
                }
                return transformY(wdY[0]) - transformY(self.intervalBins[i].length);
            })
            .attr('fill', self.histogramModel.properties.color?self.histogramModel.properties.color:'steelblue');
    }
    else {
        // For zonalDepth case
        bars.append('rect')
            .attr('x', gap/2)
            .attr('width', colWidth - gap)
            .attr('y', function(d, i) {
                if (self.histogramModel.properties.plotType != 'Frequency') {
                    return (transformY(self.zoneBins[0][i].length * 100 / self.zoneBins[0].length) 
                            - transformY(self.fullBins[i].length * 100 / self.data.length));
                }
                return (transformY(self.zoneBins[0][i].length) - transformY(self.fullBins[i].length ));
            })
            .attr('height', function(d, i) {
                if (self.histogramModel.properties.plotType != 'Frequency') {
                    return transformY(wdY[0]) - transformY(self.zoneBins[0][i].length*100/self.data.length);
                }
                return transformY(wdY[0]) - transformY(self.zoneBins[0][i].length);
            })
            .attr('fill', self.zoneSet[0].properties.background?self.zoneSet[0].properties.background:'steelblue');
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

    new ResizeSensor($(this.container.node()), function(param) {
        console.log("On resize", param, this);
        self.doPlot();
    });

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
        let total = this.data.length;
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
    if (!this.data) return null;
    return this.data.length;
}

Histogram.prototype.getMin = function () {
    if (!this.data) return null;
    return d3.min(this.data, function (d) {
        return parseFloat(d.x)
    });
}

Histogram.prototype.getMax = function () {
    if (!this.data) return null;
    return d3.max(this.data, function (d) {
        return parseFloat(d.x)
    });
}

Histogram.prototype.getAverage = function () {
    if (!this.data) return null;
    return d3.mean(this.data, function (d) {
        return parseFloat(d.x)
    }).toFixed(4);

}

Histogram.prototype.getAverageDeviation = function () {
    if (!this.data) return null;
    var mean = d3.mean(this.data, function (d) {
        return parseFloat(d.x)
    });

    return d3.mean(this.data, function (d) {
        return Math.abs(parseFloat(d.x) - mean)
    }).toFixed(4);

}

Histogram.prototype.getStandardDeviation = function () {
    if (!this.data) return null;
    return d3.deviation(this.data, function (d) {
        return parseFloat(d.x)
    }).toFixed(4);
}

Histogram.prototype.getVariance = function () {
    if (!this.data) return null;
    return d3.variance(this.data, function (d) {
        return parseFloat(d.x)
    }).toFixed(4);
}

Histogram.prototype.getSkewness = function () {
    if (!this.data) return null;
    var map = this.data.map(function (d) {
        return parseFloat(d.x);
    })
    return ss.sampleSkewness(map).toFixed(4);
}

Histogram.prototype.getKurtosis = function () {
    if (!this.data) return null;
    var map = this.data.map(function (d) {
        return parseFloat(d.x);
    })
    return ss.sampleKurtosis(map).toFixed(4);
}

Histogram.prototype.getMedian = function () {
    if (!this.data) return null;
    return d3.median(this.data, function (d) {
        return parseFloat(d.x)
    }).toFixed(4);
}

Histogram.prototype.getPercentile = function (p) {
    if (!this.data) return null;
    return d3.quantile(this.data.sort(function (a, b) {
        return parseFloat(a.x) - parseFloat(b.x);
    }), p, function (d) {
        return parseFloat(d.x)
    }).toFixed(4);
}
