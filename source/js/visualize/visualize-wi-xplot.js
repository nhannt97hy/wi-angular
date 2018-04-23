let Utils = require('./visualize-utils');
let CanvasHelper = require('./visualize-canvas-helper');
let SvgHelper = require('./visualize-svg-helper');

const _MARGIN = {
    top: 20,
    right: -30,
    bottom: 30,
    left: 70
};
const _AREA_LINE_COLOR = 'DarkCyan';
const _AREA_LINE_WIDTH = 4;
const _AREA_BACKGROUND = 'rgba(255, 255, 0, 0.5)';
const _TERNARY_VERTEX_COLOR = 'Green';
const _TERNARY_POINT_COLOR = 'Red';
const _TERNARY_VERTEX_SIZE = 6;
const _TERNARY_EDGE_WIDTH = 2;

module.exports = ViWiXplot;

function ViWiXplot(props) {
    this.pointsets = props.pointsets;
    this.config = props.config;

    this.showTooltip = true;
}

ViWiXplot.prototype.setProperties = function (props) {
    Utils.setIfNotUndefined(this, 'pointsets', props.pointsets);
    Utils.setIfNotUndefined(this, 'config', props.config);
    console.log(this);
}

ViWiXplot.prototype.getProperties = function () {
    return this;
}

ViWiXplot.prototype.init = function (domElem) {
    let self = this;
    console.log("initialization wi xplot into DOM: ", domElem, " with pointsets: ", this.pointsets);

    this.root = d3.select(domElem);

    this.plotContainer = this.root.append('div')
        .attr('class', 'wi-xplot-plot-container');

    this.rect = this.plotContainer.node().getBoundingClientRect();

    this.svgContainer = this.plotContainer.append('svg')
        .attr('class', 'wi-xplot-svg-container')
        .attr('width', self.rect.width)
        .attr('height', self.rect.height);

    this.canvas = this.plotContainer.append('canvas')
        .attr('width', self.rect.width)
        .attr('height', self.rect.height);

    this.ctx = this.canvas.node().getContext('2d');

    this.footerContainer = this.root.select('.vi-crossplot-footer-container');
    this.footerLeft = this.footerContainer.append('div')
        .attr('class', 'vi-crossplot-footer-left');
    this.footerRight = this.footerContainer.append('div')
        .attr('class', 'vi-crossplot-footer-right');

    this.calcPlotContainerSize();
    this.prepareContainer();
    this.prepareData();
    this.doPlot();

    this.svgContainer.raise();

    this.on('mousedown', function() { self.mouseDownCallback() });
    this.on('mousemove', function() { self.mouseMoveCallback() });
    this.on('mouseleave', function() { self.tooltip(null, null, true);})
}

ViWiXplot.prototype.setMode = function(mode) {
    this.svgContainer.raise();
    this.svgContainer.style('cursor', mode == null ? 'default' : 'copy');
    this.mode = mode;
}

ViWiXplot.prototype.prepareContainer = function () {
    this.prepareAxesContainer();
    this.prepareFunctionsContainer();
}

// SVG Container
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
ViWiXplot.prototype.prepareFunctionsContainer = function () {
    let self = this;

    this.functionsContainer = this.svgContainer.append('g')
        .attr('class', 'wi-xplot-functions-container')
        .attr('width', self.rect.width)
        .attr('height', self.rect.height);

    this.functionsContainer.append('clipPath')
        .attr('id', self.getSvgClipId())
        .append('rect');

    this.functionsContainer.append('g')
        .attr('class', 'vi-xplot-polygons');
    this.functionsContainer.append('g')
        .attr('class', 'vi-xplot-regression-lines');
    this.functionsContainer.append('g')
        .attr('class', 'vi-xplot-user-define-lines');
    this.functionsContainer.append('g')
        .attr('class', 'vi-xplot-area');
    this.functionsContainer.append('g')
        .attr('class', 'vi-xplot-user-line');
    this.functionsContainer.append('g')
        .attr('class', 'vi-xplot-equations');
    this.functionsContainer.append('g')
        .attr('class', 'vi-xplot-ternary');
    this.functionsContainer.append('g')
        .attr('class', 'vi-xplot-overlay-line');
    this.functionsContainer.append('g')
        .attr('class', 'vi-xplot-tooltip');

}

ViWiXplot.prototype.prepareData = function () {
    let self = this;
    if (!this.pointsets.length) return;
    this.data = [];
    this.nullDatas = 0;
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
    this.updateClipPath();

    this.plotPoints();
    this.plotArea();
    this.plotUserLine();
    this.plotFooter();
}

ViWiXplot.prototype.updatePlot = function (newProps) {
    this.setProperties(newProps);

    if(!newProps) {
        this.doPlot();
        return;
    }

    this.clearPlotContainer();
    this.prepareContainer();
    if (!this.pointsets.length) return;
    this.prepareData();
    this.doPlot();
}
ViWiXplot.prototype.updateClipPath = function () {
    let self = this;
    let vpX = this.getViewportX();
    let vpY = this.getViewportY();

    this.svgContainer.select('clipPath')
        .attr('id', self.getSvgClipId())
        .select('rect')
            .attr('x', d3.min(vpX))
            .attr('y', d3.min(vpY))
            .attr('width', Math.abs(vpX[0] - vpX[1]))
            .attr('height', Math.abs(vpY[0] - vpY[1]));
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

ViWiXplot.prototype.clearPlotContainer = function () {
    this.svgContainer.selectAll('*').remove();
    this.ctx.clearRect(0, 0, this.rect.width, this.rect.height);
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
        .attr('transform', 'translate('+ 0 +', ' + vpY[0] + ')')
        .call(axisX)
        .selectAll('.tick text')
        .style('display', function (d, i) {
            return xTickType(i) ? 'block' : 'none';
        });

    this.axesContainer.select('g.vi-crossplot-axis-y-ticks')
        .attr('transform', 'translate(' + vpX[0] + ', '+ 0 +')')
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
        .attr('transform', 'translate('+ 0 +', ' + vpY[0] + ')')
        .call(gridX)
        .selectAll('.tick line')
        .attr('class', function (d, i) {
            return (xTickType(i)) ? 'major' : 'minor';
        });

    this.axesContainer.select('g.vi-crossplot-axis-y-grids')
        .attr('transform', 'translate(' + vpX[0] + ', '+ 0 +')')
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
    let _PADDING_BOTTOM = 20;
    let _PADDING_LEFT = 20;

    let labelXElem = this.axesContainer.select('text.vi-crossplot-axis-x-label')
        .text(this.getLabelX());
    let bbX = labelXElem.node().getBBox();
    labelXElem
        .attr('transform',
            'translate('
            + ((vpX[1] - vpX[0]) / 2 + vpX[0] - bbX.width / 2)
            + ','
            + (self.rect.height - _PADDING_BOTTOM)
            + ')'
        );

    let labelYElem = this.axesContainer.select('text.vi-crossplot-axis-y-label')
        .text(this.getLabelY());
    let bbY = labelYElem.node().getBBox();
    labelYElem
        .attr('text-anchor', 'middle')
        .attr('transform',
            'translate('
            + (_PADDING_LEFT)
            + ','
            + ((vpY[1] - vpY[0]) / 2 + _PADDING_LEFT / 2 + vpY[0] - bbY.height / 2)
            + ')rotate(-90)'
        );
}

ViWiXplot.prototype.plotPoints = function () {
    let self = this;
    if (!this.pointsets.length) return;
    this.outliers = 0;
    this.pointsets.forEach(pointSet => {
        let transformX = self.getTransformX();
        let transformY = self.getTransformY();

        let vpX = self.getViewportX();
        let vpY = self.getViewportY();

        let windowX = self.getWindowX();
        let windowY = self.getWindowY();

        let ctx = self.ctx;

        ctx.rect(d3.min(vpX), d3.min(vpY), d3.max(vpX)-d3.min(vpX), d3.max(vpY)-d3.min(vpY));
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
            if(!(d.x >= d3.min(windowX) && d.x <= d3.max(windowX) && d.y >= d3.min(windowY) && d.y <= d3.max(windowY))) {
                self.outliers ++;
            }
            plotFunc.call(helper, transformX(d.x), transformY(d.y));
        });
    });
}

// Plot Area
ViWiXplot.prototype.plotArea = function () {
    let self = this;
    let areaContainer = this.functionsContainer.select('g.vi-xplot-area');
    areaContainer.selectAll('.vi-xplot-area-item').remove();
    if (!this.area || !this.area.points || this.area.points.length < 2) return;

    let transformX = this.getTransformX();
    let transformY = this.getTransformY();

    let line = d3.line()
        .x(function (d) { return transformX(d.x); })
        .y(function (d) { return transformY(d.y); });

    let area = areaContainer.append('path')
        .datum(this.area)
        .attr('d', function (d) {
            if (d === self.tmpPolygon)
                return line(d.points);
            else
                return line(d.points.concat([d.points[0]]));
        })
        .classed('vi-xplot-area-item', true)
        .attr('stroke', _AREA_LINE_COLOR)
        .attr('stroke-width', _AREA_LINE_WIDTH)
        .attr('fill-rule', 'evenodd')
        .attr('fill', _AREA_BACKGROUND);
}

// Plot User Line
ViWiXplot.prototype.plotUserLine = function () {
    let userLineContainer = this.functionsContainer.select('g.vi-xplot-user-line');
    userLineContainer.selectAll('path').remove();

    if (!this.userLine || !this.userLine.points || this.userLine.points.length < 2) return;

    let transformX = this.getTransformX();
    let transformY = this.getTransformY();

    let line = d3.line()
        .x(function(d) { return transformX(d.x); })
        .y(function(d) { return transformY(d.y); });

    let userLine = userLineContainer.append('path')
        .datum(this.userLine)
        .attr('d', function(d) { return line(d.points); })
        .attr('stroke', _AREA_LINE_COLOR)
        .attr('stroke-width', _AREA_LINE_WIDTH);

    let equation = Utils.getLinearEquation(this.userLine.points[0], this.userLine.points[1]);
    equation = equation.replace('x', this.getLabelX());
    equation = equation.replace('y', this.getLabelY());
}

ViWiXplot.prototype.plotFooter = function () {
    let self = this;
    let totalPoints = 0;
    this.data.forEach(datum => {
        totalPoints += datum.length;
    });
    let footerString = (totalPoints - this.outliers) +" points plotted out of "
                        + (totalPoints + this.nullDatas) + '( '
                        + this.outliers + ' outliers, '
                        + this.nullDatas + ' nulls)';
    this.footerRight
        .text(footerString);
}

// Tooltip
ViWiXplot.prototype.tooltip = function (x, y, notShow) {
    let self = this;
    let transformX = this.getTransformX();
    let transformY = this.getTransformY();
    let tooltipData = { x: x, y: y };

    let xCoord = transformX(x) + 15;
    let yCoord = transformY(y) + 15;
    let container = this.functionsContainer.select('g.vi-xplot-tooltip');
    if (notShow || isNaN(xCoord) || isNaN(yCoord) || !x || !y) {
        container.selectAll('*').remove();
        return;
    }

    let text = container.selectAll('text')
        .data([x, y]);
    text.enter()
        .append('text')
        .style('font-size', 12)
        .attr('x', xCoord)
        .attr('y', (d, i) => { return yCoord + 15 + 15 * i; })
        .text(function (d, i) {
            return (i == 0 ? 'X(' + self.getLabelX() : 'Y(' + self.getLabelY()) + '): ' + d.toFixed(2);
        });
    text.attr('x', xCoord)
        .attr('y', (d, i) => { return yCoord + 15 + 15 * i; })
        .text(function (d, i) {
            return (i == 0 ? 'X(' + self.getLabelX() : 'Y(' + self.getLabelY()) + '): ' + d.toFixed(2);
        });
    text.exit().remove();

    let maxWidth = d3.max(container.selectAll('text').nodes().map(function (node) { return node.getBBox().width; }));
    let maxHeight = container.select('text').node().getBBox().height * 2.5;
    let rect = container.selectAll('rect')
        .data([{ x: xCoord, y: yCoord }]);
    rect.enter()
        .append('rect')
        .attr('x', (d) => d.x - 5)
        .attr('y', (d) => d.y - 5)
        .attr('width', maxWidth + 10)
        .attr('height', maxHeight + 10)
        .attr('fill', 'lightgreen')
        .attr('fill-opacity', 0.9)
        .attr('stroke', '#444')
        .attr('rx', 7)
        .attr('ry', 7);
    rect.attr('x', (d) => d.x - 5)
        .attr('y', (d) => d.y - 5)
        .attr('width', maxWidth + 10)
        .attr('height', maxHeight + 10);
    rect.exit().remove();
    text.raise();
}

// Area Polygon
ViWiXplot.prototype.startAddAreaPolygon = function () {
    this.setMode('PlotAreaPolygon');
}
ViWiXplot.prototype.endAddAreaPolygon = function () {
    this.setMode(null);
    if (!this.tmpPolygon) return null;
    if (this.tmpPolygonPoint) {
        this.tmpPolygon.points.pop();
    }
    this.tmpPolygon = null;
    this.plotArea();
    return this.area;
}

// Area Rectangle
ViWiXplot.prototype.startAddAreaRectangle = function () {
    this.setMode('PlotAreaRectangle');
    this.area = null;
}
ViWiXplot.prototype.endAddAreaRectangle = function () {
    this.setMode(null);
    return this.area;
}

// User Line
ViWiXplot.prototype.startAddUserLine = function () {
    this.setMode('PlotUserLine');
    this.userLine = null;
}
ViWiXplot.prototype.endAddUserLine = function () {
    this.setMode(null);
    return this.userLine;
}

ViWiXplot.prototype.getTransformX = function () {
    let scaleFunc = this.config.logX ? d3.scaleLog() : d3.scaleLinear();
    return scaleFunc
        .domain(this.getWindowX())
        .range(this.getViewportX());
}
ViWiXplot.prototype.getTransformY = function () {
    let scaleFunc = this.config.logY ? d3.scaleLog() : d3.scaleLinear();
    return scaleFunc
        .domain(this.getWindowY())
        .range(this.getViewportY());
}

ViWiXplot.prototype.getWindowX = function () {
    return [this.config.scale.left, this.config.scale.right];
}
ViWiXplot.prototype.getWindowY = function () {
    return [this.config.scale.bottom, this.config.scale.top];
}

ViWiXplot.prototype.getViewportX = function () {
    return [this.plotContainerSize.x, this.plotContainerSize.width];
}
ViWiXplot.prototype.getViewportY = function () {
    return [this.plotContainerSize.height, this.plotContainerSize.y];
}

ViWiXplot.prototype.getLabelX = function () {
    return this.pointsets[0].curveX.name;
}
ViWiXplot.prototype.getLabelY = function () {
    return this.pointsets[0].curveY.name;
}

ViWiXplot.prototype.getSvgClipId = function () {
    return 'vi-xplot-clip-path';
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

// Mouse event
ViWiXplot.prototype.on = function(type, cb) {
    this.svgContainer.on(type, cb);
}

ViWiXplot.prototype.mouseDownCallback = function () {
    let mouse = d3.mouse(this.svgContainer.node());
    let vpX = this.getViewportX();
    let vpY = this.getViewportY();

    if (mouse[0] < d3.min(vpX) || mouse[0] > d3.max(vpX)
        || mouse[1] < d3.min(vpY) || mouse[1] > d3.max(vpY))
        return;

    let x = this.getTransformX().invert(mouse[0]);
    let y = this.getTransformY().invert(mouse[1]);

    if (d3.event.button == 2) return;
    if (this.mode == 'PlotPolygon') {
        if (!this.tmpPolygon) {
            this.tmpPolygon = {
                lineStyle: this.genColor(),
                display: true,
                points: [{ x: x, y: y }]
            };
            this.polygons.push(this.tmpPolygon);
        }
        this.tmpPolygonPoint = null;
        this.plotPolygons();
    }
    else if (this.mode == 'PlotAreaPolygon') {
        if (!this.tmpPolygon) {
            this.tmpPolygon = { points: [{ x: x, y: y }] };
            this.area = this.tmpPolygon;
        }
        this.tmpPolygonPoint = null;
        this.plotArea();
    }
    else if (this.mode == 'PlotAreaRectangle') {
        if (!this.area) {
            this.area = { points: [{ x: x, y: y }] };
        }
        else {
            this.area = {
                points: [
                    this.area.points[0],
                    { x: this.area.points[0].x, y: y },
                    { x: x, y: y },
                    { x: x, y: this.area.points[0].y }
                ]
            }
            this.plotArea();
        }
    }
    else if (this.mode == 'PlotUserLine') {
        if (!this.userLine) {
            this.userLine = { points: [{ x: x, y: y }] };
        }
        else {
            this.userLine = {
                points: [
                    this.userLine.points[0],
                    { x: x, y: y }
                ]
            }
            this.plotUserLine();
        }
    }
    else if (this.mode == 'PlotTernaryVertex') {
        let vertices = this.ternary.vertices;
        let vertex = this.tmpVertex;
        if (vertex == null) {
            vertex = {
                x: x,
                y: y,
                name: 'Material_' + (vertices.length + 1),
                style: 'Circle',
                used: false,
                showed: true
            };
            vertices.push(vertex);
        }
        else {
            vertex.x = x;
            vertex.y = y;
        }
        this.plotTernary();
        return vertex;
    }
    else if (this.mode == 'PlotTernaryPoint') {
        this.ternary.calculate.point = {
            x: x,
            y: y
        }
        this.plotTernaryPoint();
        return this.ternary.calculate.point;
    }
}

ViWiXplot.prototype.mouseMoveCallback = function () {
    let mouse = d3.mouse(this.svgContainer.node());
    let vpX = this.getViewportX();
    let vpY = this.getViewportY();

    if (mouse[0] < d3.min(vpX) || mouse[0] > d3.max(vpX)
        || mouse[1] < d3.min(vpY) || mouse[1] > d3.max(vpY))
        return;

    let x = this.getTransformX().invert(mouse[0]);
    let y = this.getTransformY().invert(mouse[1]);

    if (this.mode == 'PlotPolygon') {
        if (!this.tmpPolygon) return;
        if (!this.tmpPolygonPoint) {
            this.tmpPolygonPoint = { x: x, y: y };
            this.tmpPolygon.points.push(this.tmpPolygonPoint);
        }
        else {
            this.tmpPolygonPoint.x = x;
            this.tmpPolygonPoint.y = y;
        }
        this.plotPolygons();
    }
    else if (this.mode == 'PlotAreaPolygon') {
        if (!this.tmpPolygon) return;
        if (!this.tmpPolygonPoint) {
            this.tmpPolygonPoint = { x: x, y: y };
            this.tmpPolygon.points.push(this.tmpPolygonPoint);
        }
        else {
            this.tmpPolygonPoint.x = x;
            this.tmpPolygonPoint.y = y;
        }
        this.plotArea();
    }
    else if (this.mode == 'PlotAreaRectangle') {
        if (!this.area) return;
        else {
            this.area = {
                points: [
                    this.area.points[0],
                    { x: this.area.points[0].x, y: y },
                    { x: x, y: y },
                    { x: x, y: this.area.points[0].y }
                ]
            };
            this.plotArea();
        }
    }
    else if (this.mode == 'PlotUserLine') {
        if (!this.userLine) return;
        else {
            this.userLine = {
                points: [
                    this.userLine.points[0],
                    { x: x, y: y }
                ]
            };
            this.plotUserLine();
        }
    }
    else {
        if (this.showTooltip) {
            this.tooltip(x, y);
        } else {
            this.tooltip(null, null, true);
        }
    }
}