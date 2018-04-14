let Utils = require('./visualize-utils');
let CanvasHelper = require('./visualize-canvas-helper');
let SvgHelper = require('./visualize-svg-helper');

const _MARGIN = {
    top: 20,
    right: 20,
    bottom: 50,
    left: 70
};

module.exports = ViWiXplot;

function ViWiXplot(config) {
    this.pointsets = config.pointsets;
    this.scale = config.scale;
}

ViWiXplot.prototype.init = function (domElem) {
    let self = this;
    console.log("initialization wi xplot into DOM: ", domElem, " with pointsets: ", this.pointsets);

    this.root = d3.select(domElem);

    this.plotContainer = self.root.append('div')
        .attr('class', 'wi-xplot-plot-container');

    this.rect = this.plotContainer.node().getBoundingClientRect();


    this.svgContainer = self.plotContainer.append('svg')
        .attr('class', 'wi-xplot-svg-container')
        .attr('width', self.rect.width)
        .attr('height', self.rect.height);

    this.canvas = this.plotContainer.append('canvas')
        .attr('width', self.rect.width)
        .attr('height', self.rect.height);

    this.ctx = this.canvas.node().getContext('2d');

    this.calcPlotContainerSize();
    this.prepareContainer();
    this.prepareData();
    this.doPlot();
}

ViWiXplot.prototype.prepareContainer = function () {
    this.prepareAxesContainer();
    // later
    // this.prepareFunctionsContainer();
}

ViWiXplot.prototype.prepareAxesContainer = function () {
    let self = this;
    let xScale = this.getTransformX();
    let yScale = this.getTransformY();

    this.axesContainer = this.svgContainer.append('g')
        .attr('class', 'wi-xplot-axes-container');

    let xAxis = d3.axisTop(xScale)
        .ticks((self.plotContainerSize.width + 2) / (self.plotContainerSize.height + 2) * 10)
        .tickSize(self.plotContainerSize.height)
        .tickPadding(8 - self.plotContainerSize.height);
    let gX = this.axesContainer.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', 'translate(' + self.plotContainerSize.x + ', ' + (self.plotContainerSize.y + self.plotContainerSize.height) + ')')
        .call(xAxis);
    let xAxisBottom = d3.axisBottom(xScale);
    let gXBottom = this.axesContainer.append('g')
        .attr('class', 'axis axis--x-bottom')
        .attr('transform', 'translate(' + self.plotContainerSize.x + ', ' + (self.plotContainerSize.y + self.plotContainerSize.height) + ')')
        .call(xAxisBottom);

    let yAxis = d3.axisRight(yScale)
        .ticks(10)
        .tickSize(self.plotContainerSize.width)
        .tickPadding(8 - self.plotContainerSize.width);
    let gY = this.axesContainer.append('g')
        .attr('class', 'axis axis--y')
        .attr('transform', 'translate(' + self.plotContainerSize.x + ', ' + self.plotContainerSize.y + ')')
        .call(yAxis);
    let yAxisLeft = d3.axisLeft(yScale);
    let gYLeft = this.axesContainer.append('g')
        .attr('class', 'axis axis--y-left')
        .attr('transform', 'translate(' + self.plotContainerSize.x + ', ' + self.plotContainerSize.y + ')')
        .call(yAxisLeft);
}

ViWiXplot.prototype.prepareData = function () {
    let self = this;
    this.data = [];
    this.pointsets.forEach(pointSet => {
        if (!pointSet.curveX || !pointSet.curveY || !pointSet.curveX.data || !pointSet.curveY.data)
            return;

        let data = [];

        let mapX = {};
        Utils.parseData(pointSet.curveX.data).forEach(function (d) {
            mapX[d.y] = d.x;
        });

        Utils.parseData(pointSet.curveY.data).forEach(function (d) {
            if (d.y != null && d.x != null && mapX[d.y] != null && !isNaN(d.y) && !isNaN(d.x) && !isNaN(mapX[d.y])) {
                data.push({
                    x: mapX[d.y],
                    y: d.x,
                    depth: d.y
                });
            }
        });
        self.data.push(data);
    });
}

ViWiXplot.prototype.doPlot = function () {
    this.adjustSize();

    this.plotPoints();
}

ViWiXplot.prototype.adjustSize = function () {
    let self = this;
    this.canvas
        .attr('width', self.rect.width)
        .attr('height', self.rect.height);

    this.axesContainer
        .attr('width', self.rect.width)
        .attr('height', self.rect.height);

    this.svgContainer
        .attr('width', self.rect.width)
        .attr('height', self.rect.height);
}

ViWiXplot.prototype.plotPoints = function () {
    let self = this;
    this.pointsets.forEach(pointSet => {
        let transformX = self.getTransformX();
        let transformY = self.getTransformY();

        let vpX = self.getViewportX();
        let vpY = self.getViewportY();

        let windowX = self.getWindowX();
        let windowY = self.getWindowY();

        let ctx = self.ctx;

        ctx.rect(d3.min(vpX), d3.min(vpY), d3.max(vpX) - d3.min(vpX), d3.max(vpY) - d3.min(vpY));
        ctx.clip();

        // test
        pointSet.idPointSet == 1 ? pointSet.pointColor = 'blue' : pointSet.pointColor = 'red';
        pointSet.pointSize = 3;
        pointSet.pointSymbol = 'circle';
        // end test
        let helper = new CanvasHelper(ctx, {
            strokeStyle: pointSet.pointColor,
            fillStyle: pointSet.pointColor,
            size: pointSet.pointSize
        });

        let plotFunc = helper[Utils.lowercase(pointSet.pointSymbol)];
        if (typeof plotFunc != 'function') return;

        self.data[self.pointsets.indexOf(pointSet)].forEach(function (d) {
            plotFunc.call(helper, transformX(d.x), transformY(d.y));
        });
    });
}

ViWiXplot.prototype.getTransformX = function () {
    return d3.scaleLinear()
        .domain(this.getWindowX())
        .range(this.getViewportX());
}
ViWiXplot.prototype.getTransformY = function () {
    return d3.scaleLinear()
        .domain(this.getWindowY())
        .range(this.getViewportY());
}

ViWiXplot.prototype.getWindowX = function () {
    return [this.scale.left, this.scale.right];
}
ViWiXplot.prototype.getWindowY = function () {
    return [this.scale.bottom, this.scale.top];
}

ViWiXplot.prototype.getViewportX = function () {
    return [0, this.plotContainerSize.width];
}
ViWiXplot.prototype.getViewportY = function () {
    return [this.plotContainerSize.height, 0];
}

ViWiXplot.prototype.calcPlotContainerSize = function () {
    let svgSize = this.svgContainer.node().getBoundingClientRect();
    this.plotContainerSize = {
        x: _MARGIN.left,
        y: _MARGIN.top,
        width: svgSize.width - _MARGIN.left - _MARGIN.right,
        height: svgSize.height - _MARGIN.top - _MARGIN.bottom
    };
}