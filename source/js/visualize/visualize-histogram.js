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

Histogram.prototype.setCurve = function(data) {
    this.data = data.filter(function(d) {return !isNaN(d.x);}); // ? clone
}

Histogram.prototype.getTickValuesY = function() {
    if (this.histogramModel.properties.plotType != "Frequency") { // Percentile
        console.log('getTickValuesY: Percent');
        return d3.range(0, 100, 10);
    }
    // plotType == Frequency
    return d3.range(0, d3.max(this.bins, function(d) {return d.length}), 100);
}

Histogram.prototype.filterF = function(d) {
    return true;
}

Histogram.prototype.plotData = function(idx) {
    console.log('plotData:', this.data, this.data.filter);
    return this.data.filter(this.filterF).map(function(d) { return d.x; });
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

    return bins;
}
Histogram.prototype.doPlot = function() {
    var self = this;

    self.svgContainer.attr('width',self.container.node().clientWidth)
        .attr('height', self.container.node().clientHeight);

    if (!this.data) return;
    console.log('Do plot begin');
    let wdX = this.getWindowX();
    let vpX = this.getViewportX();
    let vpY = this.getViewportY();
    let transformX = this.getTransformX();
    let transformY = null

    let nBins = this.histogramModel.properties.divisions;
    let domain = this.getNormalizedWindowX();
    let step = (wdX[1] - wdX[0]) / nBins;

    this.axisX = d3.axisBottom(transformX)
        .tickValues(d3.range(wdX[0], wdX[1] + step/2, step))
        .tickFormat(Utils.getDecimalFormatter(0));

    this.bins = d3.histogram()
        .domain(domain)
        .thresholds(d3.range(domain[0], 
            domain[1], 
            (domain[1] - domain[0])/nBins)
        )(this.plotData());
    if (step < 0) this.bins = __reverseBins(this.bins);

    transformY = this.getTransformY();

    this.axisY = d3.axisLeft(transformY)
        .ticks(10, ',.0f')
        //.tickValues(this.getTickValuesY())
        //.tickFormat(d3.format(",.0f"));

    this.svgContainer.selectAll('.bars').remove();
    
    this.svgContainer.select('g.vi-histogram-axis-x-ticks')
        .call(this.axisX)
        .style('transform', 'translateY(' + vpY[1] + 'px)');

    this.svgContainer.select('g.vi-histogram-axis-y-ticks')
        .call(this.axisY)
        .style('transform', 'translateX(' + vpX[0] + 'px)');

    let bars = this.svgContainer.selectAll('.bars').data(this.bins).enter()
        .append('g').attr('class', 'bars')
        .attr('transform', function(d) {
            if (self.histogramModel.properties.plotType != 'Frequency') {
                return 'translate(' + transformX(d.x0) + ', ' + transformY(d.length*100/self.data.length) + ')';
            }
            return 'translate(' + transformX(d.x0) + ', ' + transformY(d.length) + ')';
        });
    var gap = 4;
    let colWidth = Math.abs(transformX(self.bins[0].x1) - transformX(self.bins[0].x0));
    gap = Math.min(gap, Math.floor(colWidth/5));

    bars.append('rect')
        .attr('x', gap/2)
        .attr('width', Math.abs(transformX(self.bins[0].x1) - transformX(self.bins[0].x0)) - gap)
        .attr('height', function(d) {
            if (self.histogramModel.properties.plotType != 'Frequency') {
                console.log('drawRect: Percent', vpY[1], 
                    d.length*100/self.data.length,
                    transformY(d.length*100/self.data.length),
                    vpY[1] - transformY(d.length*100/self.data.length));
                return vpY[1] - transformY(d.length*100/self.data.length);
            }
            return vpY[1] - transformY(d.length);
        })
        .attr('fill', 'steelblue');

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
        console.log('Update histogram');
        if (!self.data) {
            console.warn('No data to draw');
            return;
        }
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
        return [0, d3.max(this.bins, function(d) { return d.length*100/total;})];
    }
    return [0, d3.max(this.bins, function(d) {return d.length;})];
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
