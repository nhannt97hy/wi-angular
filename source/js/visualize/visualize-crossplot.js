let Utils = require('./visualize-utils');
let CanvasHelper = require('./visualize-canvas-helper');

module.exports = Crossplot;

function Crossplot(config) {
    this.name = config.name || 'Noname';

    this.xCurve = config.xCurve;
    this.xLog = config.xLog == null ? false : config.xLog;
    this.xMajor = config.xMajor || 5;
    this.xMinor = config.xMinor || 1;
    this.scaleLeft = config.scaleLeft || (this.xCurve || {}).minX;
    this.scaleRight = config.scaleRight || (this.xCurve || {}).maxX;

    this.yCurve = config.yCurve;
    this.yLog = config.yLog == null ? false : config.yLog;
    this.yMajor = config.yMajor || 5;
    this.yMinor = config.yMinor || 1;
    this.scaleBottom = config.scaleBottom || (this.yCurve || {}).minX;
    this.scaleTop = config.scaleTop || (this.yCurve || {}).maxX;

    this.colorCurve = config.colorCurve;
    this.scaleMin = config.scaleMin;
    this.scaleMax = config.scaleMax;
    this.colorNum = config.colorNum || 5;

    this.symbolName = config.symbolName || 'circle';
    this.symbolSize = config.symbolSize || 5;
    this.symbolColor = config.symbolColor || 'blue';

    this.topDepth = config.topDepth;
    this.bottomDepth = config.bottomDepth;
    this.padding = 50;

    this.prepareData();
}

Crossplot.prototype.getViewportX = function() {
    return [this.padding, this.svgContainer.node().clientWidth - this.padding];
}

Crossplot.prototype.getViewportY = function() {
    return [this.svgContainer.node().clientHeight - this.padding, this.padding];
}

Crossplot.prototype.init = function(domElem) {
    let self = this;
    this.root = typeof domElem == 'function' ? domElem : d3.select(domElem);

    this.createContainer();
    let rect = this.bodyContainer.node().getBoundingClientRect();
    this.canvas = this.bodyContainer.append('canvas')
        .attr('width', rect.width)
        .attr('height', rect.height)
        .style('position', 'absolute')
        .style('top', 0)
        .style('left', 0);

    this.ctx = this.canvas.node().getContext('2d');

    this.svgContainer = this.bodyContainer.append('svg')
        .attr('width', rect.width)
        .attr('height', rect.height)
        .style('position', 'absolute')
        .style('top', 0)
        .style('left', 0);

    this.xAxisGroup = this.svgContainer.append('g')
        .attr('class', 'vi-track-axis-group vi-track-x-axis-group');

    this.yAxisGroup = this.svgContainer.append('g')
        .attr('class', 'vi-track-axis-group vi-track-y-axis-group');

    d3.select(window)
        .on('resize', function() {
            self.adjustSize();
            self.doPlot();
        });

    this.doPlot();
}

Crossplot.prototype.createContainer = function() {
    this.container = this.root.append('div')
        .attr('class', 'vi-crossplot-container')
        .style('position', 'relative')
        .style('flex', 1)
        .style('display', 'flex')
        .style('flex-flow', 'column');

    this.headerContainer = this.container.append('div')
        .attr('class', 'vi-crossplot-header-container')
        .style('flex', '0 1 auto')
        .style('text-align', 'center');

    this.headerContainer
        .selectAll('div')
        .data(['vi-crossplot-header-name', 'vi-crossplot-header-info'])
        .enter()
        .append('div')
            .attr('class', function(d) { return d; })
            .text('-');

    this.bodyContainer = this.container.append('div')
        .attr('class', 'vi-crossplot-body-container')
        .style('position', 'relative')
        .style('flex', '1 1 auto');
}

Crossplot.prototype.adjustSize = function() {
    let rect = this.bodyContainer.node().getBoundingClientRect();
    this.canvas
        .attr('width', rect.width)
        .attr('height', rect.height);

    this.svgContainer
        .attr('width', rect.width)
        .attr('height', rect.height);
}

Crossplot.prototype.doPlot = function() {
    this.updateHeader();
    this.updateAxis();
    this.plotSymbol();
}

Crossplot.prototype.updateHeader = function() {
    this.headerContainer
        .selectAll('div')
        .data([this.name, '-'])
        .text(function(d) { return d; });
}

Crossplot.prototype.updateAxis = function() {
    let xAxisScale = d3.scaleLinear()
        .domain([this.scaleLeft, this.scaleRight])
        .range(this.getViewportX());
    let xAxis = d3.axisBottom(xAxisScale);
    this.xAxisGroup.call(xAxis);

    let yAxisScale = d3.scaleLinear()
        .domain([this.scaleBottom, this.scaleTop])
        .range(this.getViewportY());
    let yAxis = d3.axisLeft(yAxisScale);
    this.yAxisGroup.call(yAxis);

    this.xAxisGroup
        .style('transform', 'translateY(' + (this.svgContainer.node().clientHeight - this.padding) + 'px)');
    this.yAxisGroup
        .style('transform', 'translateX(' + this.padding + 'px)');
}

Crossplot.prototype.plotSymbol = function() {
    let transformX = d3.scaleLinear()
        .domain([this.scaleLeft, this.scaleRight])
        .range(this.getViewportX());
    let transformY = d3.scaleLinear()
        .domain([this.scaleBottom, this.scaleTop])
        .range(this.getViewportY());

    let ctx = this.ctx;
    let helper = new CanvasHelper(ctx, {
        strokeStyle: 'none',
        fillStyle: this.symbolColor,
        size: this.symbolSize
    });

    let plotFunc = helper[Utils.lowercase(this.symbolName)];
    if (typeof plotFunc != 'function') return;

    this.data.forEach(function(d) {
        plotFunc.call(helper, transformX(d.x), transformY(d.y));
    });
}

Crossplot.prototype.prepareData = function() {
    this.data = [];
    if (!this.xCurve || !this.yCurve || !this.xCurve.data || !this.yCurve.data)
        return;

    let mapX = {};
    this.xCurve.data.forEach(function(d) {
        mapX[d.y] = d.x;
    });

    let self = this;
    this.yCurve.data.forEach(function(d) {
        if (d.y != null && mapX[d.y] != null) {
            self.data.push({
                x: mapX[d.y],
                y: d.x
            });
        }
    });
}
