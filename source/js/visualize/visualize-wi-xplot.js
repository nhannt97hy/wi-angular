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
    this.userDefineLines = [];
    this.regressionLines = [];
    this.polygons = [];
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
    this.on('mouseleave', function() { self.tooltip(null, null, true);});

    let zoom = d3.zoom()
        .scaleExtent([1, 6])
        .on('zoom', zooming);
    zoom.filter(function () {
        d3.event.preventDefault();
        d3.event.stopPropagation();
        return d3.event.ctrlKey;
    });
    function zooming() {
        let transform = d3.event.transform;
        // console.log(transform);
        self.ctx.save();
        self.ctx.clearRect(0, 0, self.rect.width, self.rect.height);
        self.ctx.translate(transform.x, transform.y);
        self.ctx.scale(transform.k, transform.k);
        self.plotPoints();
        self.ctx.restore();
        // self.gTicksX.call(self.ticksX.scale(transform.rescaleX(self.getTransformX())));
        // self.gTicksY.call(self.ticksY.scale(transform.rescaleY(self.getTransformY())));
        // self.gGridsX.call(self.gridsX.scale(transform.rescaleX(self.getTransformX())));
        // self.gGridsY.call(self.gridsY.scale(transform.rescaleY(self.getTransformY())));
    }
    this.plotContainer.call(zoom);
    this.plotContainer.on('dblclick.zoom', null);
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
    this.plotUserDefineLines();
    this.plotPolygons();
    this.plotRegressionLines();
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

    this.ticksX = d3.axisBottom(this.getTransformX())
        .tickValues(xTickValues)
        .tickFormat(Utils.getDecimalFormatter(this.config.decimalsX));

    this.ticksY = d3.axisLeft(this.getTransformY())
        .tickValues(yTickValues)
        .tickFormat(Utils.getDecimalFormatter(this.config.decimalsY));

    this.gTicksX = this.axesContainer.select('g.vi-crossplot-axis-x-ticks')
        .attr('transform', 'translate('+ 0 +', ' + vpY[0] + ')')
        .call(this.ticksX)
        .selectAll('.tick text')
        .style('display', function (d, i) {
            return xTickType(i) ? 'block' : 'none';
        });

    this.gTicksY = this.axesContainer.select('g.vi-crossplot-axis-y-ticks')
        .attr('transform', 'translate(' + vpX[0] + ', '+ 0 +')')
        .call(this.ticksY)
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

    this.gridsX = d3.axisBottom(this.getTransformX())
        .tickValues(xTickValues)
        .tickFormat('')
        .tickSize(-Math.abs(vpY[1] - vpY[0]));

    this.gridsY = d3.axisLeft(this.getTransformY())
        .tickValues(yTickValues)
        .tickFormat('')
        .tickSize(-Math.abs(vpX[1] - vpX[0]));

    this.gGridsX = this.axesContainer.select('g.vi-crossplot-axis-x-grids')
        .attr('transform', 'translate('+ 0 +', ' + vpY[0] + ')')
        .call(this.gridsX)
        .selectAll('.tick line')
        .attr('class', function (d, i) {
            return (xTickType(i)) ? 'major' : 'minor';
        });

    this.gGridsY = this.axesContainer.select('g.vi-crossplot-axis-y-grids')
        .attr('transform', 'translate(' + vpX[0] + ', '+ 0 +')')
        .call(this.gridsY)
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

    let transformX = self.getTransformX();
    let transformY = self.getTransformY();

    let vpX = self.getViewportX();
    let vpY = self.getViewportY();

    let windowX = self.getWindowX();
    let windowY = self.getWindowY();

    let ctx = self.ctx;

    if (!this.pointsets.length) return;
    this.outliers = 0;
    this.pointsets.forEach(pointSet => {
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

// User Define Line
ViWiXplot.prototype.getUserDefineFunc = function(funcStr) {
    let func = new Function('x', 'return ' + funcStr);
    try {
        let y = func(0.5);
        if (y === undefined) return null;
        func.equation = 'y=' + funcStr;
        return func;
    }
    catch (e) { return null; }
}
ViWiXplot.prototype.prepareUserDefineLines = function() {
    let lines = this.userDefineLines;

    let self = this;
    lines.forEach(function(l) {
        let func = self.getUserDefineFunc(l.function);
        if (!func) {
            l.invalid = true;
            toastr.error('Function ' + l.function + ' is invalid!');
            return;
        }
        l.invalid = false;
        l.func = func;

        let start = self.config.scale.left;
        let end = self.config.scale.right;
        let step = (end - start) / 1000;

        l.data = Utils.range(start, end, step).map(function(d) {
            return {
                x: d,
                y: func(d)
            };
        });
    });
}
ViWiXplot.prototype.plotUserDefineLines = function() {
    this.prepareUserDefineLines();

    let transformX = this.getTransformX();
    let transformY = this.getTransformY();

    let line = d3.line()
        .x(function(d) { return transformX(d.x); })
        .y(function(d) { return transformY(d.y); })
        .defined(function(d) {
            return !isNaN(d.x) && !isNaN(d.y) && d.y != Infinity && d.y != -Infinity;
        });

    let userDefineLineContainer = this.functionsContainer.select('g.vi-xplot-user-define-lines')
        .attr('clip-path', 'url(#' + this.getSvgClipId() + ')');

    let userDefineLines = userDefineLineContainer.selectAll('path')
        .data(this.userDefineLines.filter(function(r) {
            return r.func != null;
        }));
    let self = this;
    userDefineLines.enter().append('path')
        .merge(userDefineLines)
        .attr('d', function(d) {
            return line(d.data);
        })
        .attr('stroke', function(d) { return d.lineStyle.lineColor; })
        .attr('stroke-dasharray', function(d) { return d.lineStyle.lineStyle; })
        .attr('stroke-width', function(d) { return d.lineStyle.lineWidth; })
        .attr('fill', 'none')
        .style('display', function(d) { return d.displayLine ? 'block' : 'none'; });
    userDefineLines.exit().remove();

    this.plotEquations();
}

// Plot Equations
ViWiXplot.prototype.plotEquations = function() {
    let self = this;

    let equationContainer = this.functionsContainer.select('g.vi-xplot-equations');
    let eqData = this.regressionLines.concat(this.userDefineLines).filter(function(r) {
        return r.displayEquation && r.func != null;
    });
    let equations = equationContainer.selectAll('text').data(eqData);

    const HEIGHT = 14;
    equations.enter().append('text')
        .merge(equations)
        .attr('x', 0)
        .attr('y', function(d, i) { return (i+1)*HEIGHT; })
        .attr('fill', function(d) { return d.lineStyle.lineColor; })
        .text(function(d) { return d.func.equation; });
    equations.exit().remove();

    let gWidth = equationContainer.node().getBoundingClientRect().width;
    equationContainer.attr('transform', 'translate(' + (this.getViewportX()[1] - gWidth) + ',' + this.getViewportY()[1] + ')' );
}

// Plot Polygon
ViWiXplot.prototype.plotPolygons = function() {
    let transformX = this.getTransformX();
    let transformY = this.getTransformY();

    let line = d3.line()
        .x(function(d) { return transformX(d.x); })
        .y(function(d) { return transformY(d.y); });

    let polygonContainer = this.functionsContainer.select('g.vi-xplot-polygons')
        .attr('clip-path', 'url(#' + this.getSvgClipId() + ')')

    let polygons = polygonContainer.selectAll('path')
        .data(this.polygons.filter(function(p) { return p.points && p.points.length; }));

    let self = this;
    polygons.enter().append('path')
        .merge(polygons)
        .attr('d', function(d) {
            if (d === self.tmpPolygon)
                return line(d.points);
            else
                return line(d.points.concat([d.points[0]]));
        })
        .attr('stroke', function(d) { return d.lineStyle; })
        .attr('fill-rule', 'evenodd')
        .attr('fill', function(d) {
            let color = d3.color(d.lineStyle);
            color.opacity = 0.1;
            return color.toString();
        })
        .style('display', function(d) { return d.display ? 'block' : 'none'; });
    polygons.exit().remove();
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

// Overlay Polygon
ViWiXplot.prototype.startAddPolygon = function() {
    this.setMode('PlotPolygon');
}
ViWiXplot.prototype.endAddPolygon = function() {
    this.setMode(null);
    if (!this.tmpPolygon) return null;
    if (this.tmpPolygonPoint) {
        this.tmpPolygon.points.pop();
    }
    let addedPolygon = this.tmpPolygon;
    this.tmpPolygon = null;
    this.plotPolygons();
    return addedPolygon;
}

ViWiXplot.prototype.startEditPolygon = function(id) {
    let polygon = this.polygons.filter(function(p) {
        return p.idPolygon == id;
    })[0];
    if (!polygon) return;

    this.setMode('PlotPolygon');
    this.tmpPolygon = polygon;
    this.tmpPolygonPoint = Utils.clone(polygon.points[polygon.points.length -1]);
    this.tmpPolygon.points.push(this.tmpPolygonPoint);
}
ViWiXplot.prototype.endEditPolygon = function() {
    this.setMode(null);
    if (!this.tmpPolygon) return null;
    if (this.tmpPolygonPoint) {
        this.tmpPolygon.points.pop();
    }
    let edittedPolygon = this.tmpPolygon;
    this.tmpPolygon = null;
    this.plotPolygons();
    return edittedPolygon;
}

// Plot Regression Line
// problem with self.data!!!
ViWiXplot.prototype.prepareRegressionLines = function() {
    let regLines = this.regressionLines;

    let self = this;
    regLines.forEach(function(l) {
        let polygons = self.polygons.filter(function(p) {
            return l.polygons.findIndex(lp => {
                return lp.idPolygon ? lp.idPolygon == p.idPolygon : lp == p.idPolygon;
            }) > -1;
            // return l.polygons.indexOf(p.idPolygon) > -1;
        });
        let data = self.filterByPolygons(polygons, self.data, l.exclude);
        if (data.length == 0) {
            l.func = null;
            return;
        }
        let func = self.getRegressionFunc(data, l.regType, l.inverseReg, l.fitX, l.fitY);
        if (!func) return;
        let start = self.config.scale.left;
        let end = self.config.scale.right;
        let step = (end - start) / 1000;

        l.data = Utils.range(start, end, step).map(function(d) {
            return {
                x: d,
                y: func(d)
            };
        });
        l.func = func;
    });
}
ViWiXplot.prototype.getRegressionFunc = function(data, type, inverse, fitX, fitY) {
    if (!type) type = 'Linear';
    let reducer = function(sum, current) { return sum + current; };
    let needFit = fitX != null && fitY != null;

    let aWithSign = function(a) {
        return a == 0 ? '' : (a > 0 ? '+' : '') + a;
    }

    let getLinearArgs = function(data) {
        let dataX = data.map(function(d) { return d.x; });
        let dataY = data.map(function(d) { return d.y; });

        let meanX = dataX.reduce(reducer, 0) * 1.0 / dataX.length;
        let meanY = dataY.reduce(reducer, 0) * 1.0 / dataY.length;

        let XX = dataX.map(function(d) { return Math.pow(d-meanX, 2); }).reduce(reducer, 0);
        let XY = dataX.map(function(d, i) { return (d-meanX) * (dataY[i]-meanY); }).reduce(reducer, 0);

        let slope = XY / XX;
        let intercept = meanY - meanX * slope;
        return [slope, intercept];
    }

    let args, slope, intercept, func;

    if (type == 'Linear') {
        data = data.map(function(d) {
            return {
                x: needFit ? (inverse ? 1/d.x - 1/fitX : d.x - fitY) : (inverse ? 1/d.x : d.x),
                y: needFit ? d.y -fitY : d.y
            }
        });
        if (!data.length) return null;
        args = getLinearArgs(data);
        slope = args[0];
        intercept = needFit ? (-slope * (inverse ? 1/fitX : fitX) + fitY) : args[1];
        func = function(x) {
            return inverse ? slope/x + intercept :  x*slope + intercept;
        }
        let a = +slope.toFixed(6);
        let b = +intercept.toFixed(6);
        func.equation = 'y=' + (a == 0 ? '' : (a + (inverse ? '/' : '*') + 'x')) + (a == 0 ? b : aWithSign(b));
    }
    else if (type == 'Exponent') {
        data = data.map(function(d) {
            return {
                x: needFit ? (inverse ? 1/d.x - 1/fitX : d.x - fitX) : (inverse ? 1/d.x : d.x),
                y: needFit ? Math.log(d.y) - Math.log(fitY) : Math.log(d.y)
            }
        }).filter(function(d) { return d.y > 0; });

        if (!data.length) return null;
        args = getLinearArgs(data);
        slope = Math.exp(args[0]);
        intercept = needFit ? fitY/Math.pow(slope, inverse ? 1/fitX : fitX) : Math.exp(args[1]);
        func = function(x) {
            return intercept*Math.pow(slope, inverse ? 1/x : x);
        }
        let a = +slope.toFixed(6);
        let b = +intercept.toFixed(6);
        func.equation = 'y=' + b + '*' + a + (inverse ? '^(1/x)' : '^x');
    }
    else if (type == 'Power') {
        data = data.map(function(d) {
            return {
                x: needFit ? Math.log(inverse ? 1/d.x : d.x) - Math.log(inverse ? 1/fitX : fitX) : Math.log(inverse ? 1/d.x : d.x),
                y: needFit ? Math.log(d.y) - Math.log(fitY) : Math.log(d.y)
            }
        }).filter(function(d) { return d.x > 0 && d.y > 0; });

        if (!data.length) return null;
        args = getLinearArgs(data);
        slope = args[0];
        intercept = needFit ? fitY/Math.pow(inverse ? 1/fitX : fitX, slope) : Math.exp(args[1]);
        func = function(x) {
            return intercept*Math.pow(inverse ? 1/x : x, slope);
        }
        let a = +slope.toFixed(6);
        let b = +intercept.toFixed(6);
        func.equation = 'y=' + b + (inverse ? '*1/x^' : '*x^') + a;
    }

    if (func.equation.indexOf('NaN') > -1) return null;
    return func;
}
ViWiXplot.prototype.filterByPolygons = function(polygons, data, exclude) {
    let ppoints = polygons.map(function(p) {
        return p.points.map(function(point) {
            return [point.x, point.y];
        });
    });

    return data.filter(function(d) {
        let pass = exclude ? false : true;
        for (let p of ppoints)
            if (d3.polygonContains(p, [d.x, d.y]))
                return pass;
        return !pass;
    });
}
ViWiXplot.prototype.plotRegressionLines = function() {
    // if (this.data.length == 0) return;
    this.prepareRegressionLines();

    let transformX = this.getTransformX();
    let transformY = this.getTransformY();

    let line = d3.line()
        .x(function(d) { return transformX(d.x); })
        .y(function(d) { return transformY(d.y); })
        .defined(function(d) {
            return !isNaN(d.x) && !isNaN(d.y) && d.y != Infinity && d.y != -Infinity;
        });

    let regLineContainer = this.svgContainer.select('g.vi-crossplot-regression-lines')
        .attr('clip-path', 'url(#' + this.getSvgClipId() + ')');

    let regLines = regLineContainer.selectAll('path')
        .data(this.regressionLines.filter(function(r) {
            return r.func != null;
        }));

    let self = this;
    regLines.enter().append('path')
        .merge(regLines)
        .attr('d', function(d) {
            return line(d.data);
        })
        .attr('stroke', function(d) { return d.lineStyle.lineColor; })
        .attr('stroke-dasharray', function(d) { return d.lineStyle.lineStyle; })
        .attr('stroke-width', function(d) { return d.lineStyle.lineWidth; })
        .attr('fill', 'none')
        .style('display', function(d) { return d.displayLine ? 'block' : 'none'; });
    regLines.exit().remove();

    this.plotEquations();
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

ViWiXplot.prototype.onMouseDown = function (callback) {
    let self = this;
    this.on('mousedown', function() {
        let ret = self.mouseDownCallback();
        callback(ret);
    });
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

// Utils
ViWiXplot.prototype.genColor = function() {
    function rand(x) {
        return Math.floor(Math.random() * x);
    }

    const DEFAULT_COLORS = ['Cyan', 'Brown', 'Green', 'DarkGoldenRod', 'DimGray', 'Indigo', 'Navy'];
    let usedColors = [];
    this.polygons.forEach(function(d) {
        usedColors = usedColors.concat(d3.color(d.lineStyle).toString());
    });

    let color;
    for (let i = 0; i <= this.polygons.length; i++)  {
        if (i >= DEFAULT_COLORS.length) {
            do {
                color = d3.rgb(rand(255), rand(255), rand(255)).toString();
            }
            while (usedColors.indexOf(color) >= 0);
        }
        else color = d3.color(DEFAULT_COLORS[i]).toString();
        if (usedColors.indexOf(color) < 0) break;
    }
    return color;
}