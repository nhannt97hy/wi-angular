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

function ViWiXplot(props) {
    this.pointsets = props.pointsets;
    this.scale = props.scale;
    this.config = props.config;
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
        .attr('class', 'wi-xplot-axes-container')
        .attr('width', self.rect.width)
        .attr('height', self.rect.height);

    this.axesContainer
        .selectAll('g.vi-crossplot-axis-group')
        .data([
            'vi-crossplot-axis-ticks vi-crossplot-axis-x-ticks',
            'vi-crossplot-axis-grids vi-crossplot-axis-x-grids',
            'vi-crossplot-axis-ticks vi-crossplot-axis-y-ticks',
            'vi-crossplot-axis-grids vi-crossplot-axis-y-grids',
        ])
        .enter()
        .append('g')
            .attr('class', function (d) { return 'vi-crossplot-axis-group ' + d; });

    this.axesContainer
        .selectAll('text.vi-crossplot-axis-label')
        .data(['vi-crossplot-axis-x-label', 'vi-crossplot-axis-y-label'])
        .enter()
        .append('text')
            .attr('class', function (d) { return 'vi-crossplot-axis-label ' + d; })
            .text('-');
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
    this.updateAxesContainer();

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

ViWiXplot.prototype.updateAxesContainer = function () {
    this.updateAxesTicks();
    this.updateAxesGrids();
    this.updateAxesLabels();
}

ViWiXplot.prototype.updateAxesTicks = function () {
    let self = this;
    let wdX = this.getWindowX();
    let wdY = this.getWindowY();
    let vpX = this.getViewportX();
    let vpY = this.getViewportY();
    let xTickValues = this.genXTickValues();
    let yTickValues = this.genYTickValues();
    let xTickType = (this.config.logX) ? xLogMajorTest : xLinearMajorTest;
    let yTickType = (this.config.logY) ? yLogMajorTest : yLinearMajorTest;

    let axisX = d3.axisBottom(this.getTransformX())
        .tickValues(xTickValues)
        .tickFormat(Utils.getDecimalFormatter(this.config.decimalsX));

    let axisY = d3.axisLeft(this.getTransformY())
        .tickValues(yTickValues)
        .tickFormat(Utils.getDecimalFormatter(this.config.decimalsY));

    this.axesContainer.select('g.vi-crossplot-axis-x-ticks')
        .attr('transform', 'translate(' + self.plotContainerSize.x + ', ' + (self.plotContainerSize.y + self.plotContainerSize.height) + ')')
        .call(axisX)
        .selectAll('.tick text')
        .style('display', function (d, i) {
            return xTickType(i) ? 'block' : 'none';
        });

    this.axesContainer.select('g.vi-crossplot-axis-y-ticks')
        .attr('transform', 'translate(' + self.plotContainerSize.x + ', ' + self.plotContainerSize.y + ')')
        .call(axisY)
        .selectAll('.tick text')
        .style('display', function (d, i) {
            return yTickType(i) ? 'block' : 'none';
        });

    function xLinearMajorTest(i) {
        return (!self.config.minorX || i % self.config.minorX == 0) ? true : false;
    }
    function yLinearMajorTest(i) {
        return (!self.config.minorY || i % self.config.minorY == 0) ? true : false;
    }

    function xLogMajorTest(i) {
        return Number.isInteger(Math.log10(xTickValues[i])) ? true : false;
    }
    function yLogMajorTest(i) {
        return Number.isInteger(Math.log10(yTickValues[i])) ? true : false;
    }
}

ViWiXplot.prototype.updateAxesGrids = function () {
    let self = this;

    let wdX = this.getWindowX();
    let wdY = this.getWindowY();
    let vpX = this.getViewportX();
    let vpY = this.getViewportY();
    let xTickValues = this.genXTickValues();
    let yTickValues = this.genYTickValues();
    let xTickType = (this.config.logX) ? xLogMajorTest : xLinearMajorTest;
    let yTickType = (this.config.logY) ? yLogMajorTest : yLinearMajorTest;

    let gridX = d3.axisBottom(this.getTransformX())
        .tickValues(xTickValues)
        .tickFormat('')
        .tickSize(-Math.abs(vpY[1] - vpY[0]));

    let gridY = d3.axisLeft(this.getTransformY())
        .tickValues(yTickValues)
        .tickFormat('')
        .tickSize(-Math.abs(vpX[1] - vpX[0]));

    this.axesContainer.select('g.vi-crossplot-axis-x-grids')
        .attr('transform', 'translate(' + self.plotContainerSize.x + ', ' + (self.plotContainerSize.y + self.plotContainerSize.height) + ')')
        .call(gridX)
        .selectAll('.tick line')
        .attr('class', function (d, i) {
            return (xTickType(i)) ? 'major' : 'minor';
        });

    this.axesContainer.select('g.vi-crossplot-axis-y-grids')
        .attr('transform', 'translate(' + self.plotContainerSize.x + ', ' + self.plotContainerSize.y + ')')
        .call(gridY)
        .selectAll('.tick line')
        .attr('class', function (d, i) {
            return (yTickType(i)) ? 'major' : 'minor';
        });

    function xLinearMajorTest(i) {
        return (!self.config.minorX || i % self.config.minorX == 0) ? true : false;
    }
    function yLinearMajorTest(i) {
        return (!self.config.minorY || i % self.config.minorY == 0) ? true : false;
    }

    function xLogMajorTest(i) {
        return Number.isInteger(Math.log10(xTickValues[i])) ? true : false;
    }
    function yLogMajorTest(i) {
        return Number.isInteger(Math.log10(yTickValues[i])) ? true : false;
    }
}

ViWiXplot.prototype.updateAxesLabels = function () {
    let self = this;
    let vpX = this.getViewportX();
    let vpY = this.getViewportY();
    let _PADDING_BOTTOM = 10;
    let _PADDING_LEFT = 10;

    this.axesContainer.select('text.vi-crossplot-axis-x-label')
        .attr('x', function() { return self.plotContainerSize.x + self.plotContainerSize.width/2; })
        .attr('y', function() { return self.plotContainerSize.y + self.plotContainerSize.height + _MARGIN.bottom; })
        .attr('text-anchor', 'middle')
        .text(this.pointsets[0].curveX.name);

    this.axesContainer.select('text.vi-crossplot-axis-y-label')
        .attr('transform', 'rotate(-90)')
        .attr('y', _MARGIN.top )
        .attr('x', -(self.plotContainerSize.height/2) - _MARGIN.top )
        .attr('text-anchor', 'middle')
        .text(this.pointsets[0].curveY.name);
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
        self.pointsets.indexOf(pointSet) ? pointSet.pointColor = 'blue' : pointSet.pointColor = 'red';
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

ViWiXplot.prototype.genXTickValues = function () {
    let wdX = this.getWindowX();
    if (this.config.logX) {
        if (wdX[0] < wdX[1])
            return Utils.genLogTickValues(wdX[0], wdX[1]);
        else {
            return Utils.genLogTickValues(wdX[1], wdX[0]).reverse();
        }
    }
    else {
        let stepX = (wdX[1] - wdX[0]) / (this.config.majorX * this.config.minorX || 1);
        return d3.range(wdX[0], wdX[1] + stepX / 2, stepX);
    }
}
ViWiXplot.prototype.genYTickValues = function () {
    let wdY = this.getWindowY();
    if (this.config.logY) {
        if (wdY[0] < wdY[1])
            return Utils.genLogTickValues(wdY[0], wdY[1]);
        else {
            return Utils.genLogTickValues(wdY[1], wdY[0]).reverse();
        }
    }
    else {
        let stepY = (wdY[1] - wdY[0]) / (this.config.majorY * this.config.minorY || 1);
        return d3.range(wdY[0], wdY[1] + stepY / 2, stepY);
    }
}