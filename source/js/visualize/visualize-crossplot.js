let Utils = require('./visualize-utils');
let CanvasHelper = require('./visualize-canvas-helper');

module.exports = Crossplot;

function Crossplot(config) {
    this.setProperties(config);

    this.paddingLeft = 100;
    this.paddingRight = 50;
    this.paddingTop = 50;
    this.paddingBottom = 50;

    this.rectZWidth = 0;
}

const POLYGON_SCHEMA = {
    type: 'Object',
    properties: {
        idPolygon: { type: 'Integer' },
        lineStyle: { type: 'String', default: 'Blue' },
        display: { type: 'Boolean', default: true },
        points: {
            type: 'Array',
            item: {
                type: 'Object',
                properties: {
                    x: { type: 'Float' },
                    y: { type: 'Float' }
                }
            }
        }
    }
}

Crossplot.prototype.PROPERTIES = {
    idCrossPlot: { type: 'Integer' },
    idWell: { type: 'Integer'},
    name: { type: 'String', default: 'Noname' },
    pointSet: {
        type: 'Object',
        properties: {
            idPointSet: { type: 'Integer' },
            curveX: { type: 'Object' },
            logX: { type: 'Boolean', default: false },
            majorX: { type: 'Integer', default: 5, null: false },
            minorX : { type: 'Integer', default: 1, null: false },
            scaleLeft: { type: 'Float' },
            scaleRight: { type: 'Float' },
            labelX: { type: 'String' },
            decimalsX: { type: 'Integer', default: 2 },
            curveY: { type: 'Object' },
            logY: { type: 'Boolean', default: false },
            majorY: { type: 'Integer', default: 5, null: false },
            minorY: { type: 'Integer', default: 1, null: false },
            scaleBottom: { type: 'Float' },
            scaleTop: { type: 'Float' },
            labelY: { type: 'String' },
            decimalsY: { type: 'Integer', default: 2 },
            curveZ: { type: 'Object' },
            scaleMin: { type: 'Float' },
            scaleMax: { type: 'Float' },
            numColor: { type: 'Integer', default: 5 },
            decimalsZ: { type: 'Float', default: 2 },
            pointSymbol: {
                type: 'Enum',
                values: ['Circle', 'Square', 'Cross', 'Diamond', 'Plus', 'Star'],
                default: 'Circle'
            },
            pointSize: { type: 'Integer', default: 2 },
            pointColor: { type: 'String', default: 'Blue' },
            intervalDepthTop: { type: 'Float' },
            intervalDepthBottom: { type: 'Float' },
            idZoneSet: { type: 'Integer' },
            activeZone: { type: 'String' },
            lineMode: { type: 'Boolean', default: false },
            showLine: { type: 'Boolean', default: false },
            standalone: { type: 'Boolean', default: false },
            overlayLine: { type: 'String' },
            zoneset: { type: 'Object' }
        }
    },
    polygons: {
        type: 'Array',
        item: POLYGON_SCHEMA,
        default: []
    },
    regressionLines: {
        type: 'Array',
        item: {
            type: 'Object',
            properties: {
                idRegressionLine: { type: 'Integer' },
                lineStyle: {
                    type: 'Object',
                    properties: {
                        lineColor: { type: 'String', default: 'Blue' },
                        lineWidth: { type: 'Integer', default: 1 },
                        lineStyle: {
                            type: 'Array',
                            item: { type: 'Integer' },
                            default: []
                        },
                    }
                },
                displayLine: { type: 'Boolean', default: true },
                displayEquation: { type: 'Boolean', default: true },
                regType: {
                    type: 'Enum',
                    values: ['Linear', 'Exponent', 'Powerwer'],
                    default: 'Linear'
                },
                inverseReg: { type: 'Boolean', default: false },
                exclude: { type: 'Boolean', default: false },
                polygons: {
                    type: 'Array',
                    item: POLYGON_SCHEMA,
                    default: []
                },
                fitX: { type: 'Float' },
                fitY: { type: 'Float' }
            }
        },
        default: []
    }
};

Crossplot.prototype.getProperties = function() {
    return Utils.getProperties(this);
}

Crossplot.prototype.setProperties = function(props) {
    Utils.setProperties(this, props);
}

Crossplot.prototype.getViewportX = function() {
    return [this.paddingLeft, this.bodyContainer.node().clientWidth - this.paddingRight - this.rectZWidth];
}

Crossplot.prototype.getViewportY = function() {
    return [this.bodyContainer.node().clientHeight - this.paddingBottom, this.paddingTop];
}

Crossplot.prototype.getWindowX = function() {
    return [this.pointSet.scaleLeft, this.pointSet.scaleRight];
}

Crossplot.prototype.getWindowY = function() {
    return [this.pointSet.scaleBottom, this.pointSet.scaleTop];
}

Crossplot.prototype.getWindowZ = function() {
    return [this.pointSet.scaleMin, this.pointSet.scaleMax];
}

Crossplot.prototype.getTransformX = function() {
    return d3.scaleLinear()
        .domain(this.getWindowX())
        .range(this.getViewportX());
}

Crossplot.prototype.getTransformY = function() {
    return d3.scaleLinear()
        .domain(this.getWindowY())
        .range(this.getViewportY());
}

Crossplot.prototype.getTransformZ = function() {
    return d3.scaleQuantize()
        .domain(this.getWindowZ())
        .range(this.colors);
}

Crossplot.prototype.getPlotRect = function() {
    return this.bodyContainer.node().getBoundingClientRect();
}

Crossplot.prototype.setMode = function(mode) {
    this.svgContainer.style('cursor', mode == null ? 'default' : 'copy');
    this.mode = mode;
}

Crossplot.prototype.init = function(domElem) {
    let self = this;
    this.root = typeof domElem == 'function' ? domElem : d3.select(domElem);
    this.createContainer();

    let rect = this.getPlotRect();

    this.axisContainer = this.bodyContainer.append('svg')
        .attr('class', 'vi-crossplot-axis-container')
        .attr('width', rect.width)
        .attr('height', rect.height);

    this.axisContainer
        .selectAll('g.vi-crossplot-axis-group')
        .data([
            'vi-crossplot-axis-ticks vi-crossplot-axis-x-ticks',
            'vi-crossplot-axis-grids vi-crossplot-axis-x-grids',
            'vi-crossplot-axis-ticks vi-crossplot-axis-y-ticks',
            'vi-crossplot-axis-grids vi-crossplot-axis-y-grids',
            'vi-crossplot-axis-ticks vi-crossplot-axis-z-ticks',
            'vi-crossplot-axis-z-rects'
        ])
        .enter()
            .append('g')
            .attr('class', function(d) { return 'vi-crossplot-axis-group ' + d; });

    this.axisContainer
        .selectAll('text.vi-crossplot-axis-label')
        .data(['vi-crossplot-axis-x-label', 'vi-crossplot-axis-y-label'])
        .enter()
            .append('text')
            .attr('class', function(d) { return 'vi-crossplot-axis-label ' + d; })
            .text('-');

    this.canvas = this.bodyContainer.append('canvas')
        .attr('width', rect.width)
        .attr('height', rect.height);

    this.ctx = this.canvas.node().getContext('2d');

    this.svgContainer = this.bodyContainer.append('svg')
        .attr('class', 'vi-crossplot-svg-container')
        .attr('width', rect.width)
        .attr('height', rect.height);

    this.svgContainer.append('clipPath')
        .attr('id', this.getSvgClipId())
        .append('rect');

    this.svgContainer.append('g')
        .attr('class', 'vi-crossplot-polygons');

    this.svgContainer.append('g')
        .attr('class', 'vi-crossplot-regression-lines');

    this.svgContainer.append('g')
        .attr('class', 'vi-crossplot-equations');

    d3.select(window)
        .on('resize', function() {
            self.doPlot();
        });

    this.doPlot();

    this.on('mousedown', function() { self.mouseDownCallback() });
    this.on('mousemove', function() { self.mouseMoveCallback() });
}

Crossplot.prototype.createContainer = function() {
    this.container = this.root.append('div')
        .attr('class', 'vi-crossplot-container');

    this.headerContainer = this.container.append('div')
        .attr('class', 'vi-crossplot-header-container');

    this.headerContainer
        .selectAll('div.vi-crossplot-header-row')
        .data(['vi-crossplot-header-name', 'vi-crossplot-header-reference'])
        .enter()
        .append('div')
            .attr('class', function(d) { return 'vi-crossplot-header-row ' + d; })
            .text('-');

    this.bodyContainer = this.container.append('div')
        .attr('class', 'vi-crossplot-body-container');
}

Crossplot.prototype.adjustSize = function() {
    let rect = this.getPlotRect();
    this.canvas
        .attr('width', rect.width)
        .attr('height', rect.height);

    this.axisContainer
        .attr('width', rect.width)
        .attr('height', rect.height);

    this.svgContainer
        .attr('width', rect.width)
        .attr('height', rect.height);
}

Crossplot.prototype.doPlot = function() {
    if (!this.pointSet || !this.pointSet.curveX || !this.pointSet.curveY) return;

    this.prepareData();
    this.genColorList();
    this.rectZWidth = this.pointSet.curveZ ? 20 : 0;

    this.adjustSize();
    this.updateHeader();
    this.updateAxises();
    this.plotSymbols();
    this.updateClipPath();

    this.plotPolygons();
    this.plotRegressionLines();
}

Crossplot.prototype.updateClipPath = function() {
    let vpX = this.getViewportX();
    let vpY = this.getViewportY();

    this.svgContainer.select('clipPath')
        .attr('id', this.getSvgClipId())
        .select('rect')
        .attr('x', d3.min(vpX))
        .attr('y', d3.min(vpY))
        .attr('width', Math.abs(vpX[0] - vpX[1]))
        .attr('height', Math.abs(vpY[0] - vpY[1]));
}

Crossplot.prototype.updateHeader = function() {
    this.headerContainer
        .selectAll('div.vi-crossplot-header-row')
        .data(['Crossplot: ' + this.name, 'Reference: [' + this.pointSet.intervalDepthTop + ' - ' + this.pointSet.intervalDepthBottom + ']'])
        .text(function(d) { return d; });
}

Crossplot.prototype.updateAxises = function() {
    this.updateAxisTicks();
    this.updateAxisGrids();
    this.updateAxisZRects();
    this.updateAxisLabels();
}

Crossplot.prototype.updateAxisTicks = function() {
    let wdX = this.getWindowX();
    let wdY = this.getWindowY();
    let vpX = this.getViewportX();
    let vpY = this.getViewportY();

    let stepX = (wdX[1]-wdX[0]) / (this.pointSet.majorX || 1);
    let stepY = (wdY[1]-wdY[0]) / (this.pointSet.majorY || 1);

    let axisX = d3.axisBottom(this.getTransformX())
        .tickValues(d3.range(wdX[0], wdX[1] + stepX/2, stepX))
        .tickFormat(Utils.getDecimalFormatter(this.pointSet.decimalsX));

    let axisY = d3.axisLeft(this.getTransformY())
        .tickValues(d3.range(wdY[0], wdY[1] + stepY/2, stepY))
        .tickFormat(Utils.getDecimalFormatter(this.pointSet.decimalsY));

    this.axisContainer.select('g.vi-crossplot-axis-x-ticks')
        .call(axisX)
        .style('transform', 'translateY(' + vpY[0] + 'px)');

    this.axisContainer.select('g.vi-crossplot-axis-y-ticks')
        .call(axisY)
        .style('transform', 'translateX(' + vpX[0] + 'px)');

    if (!this.pointSet.curveZ) return;

    let wdZ = this.getWindowZ();
    let stepZ = (wdZ[1]-wdZ[0]) / (this.pointSet.numColor || 1);

    let transformZ = d3.scaleLinear()
        .domain(wdZ)
        .range(vpY);

    let axisZ = d3.axisRight(transformZ)
        .tickValues(d3.range(wdZ[0], wdZ[1] + stepZ/2, stepZ))
        .tickFormat(Utils.getDecimalFormatter(this.pointSet.decimalsZ));

    this.axisContainer.select('g.vi-crossplot-axis-z-ticks')
        .call(axisZ)
        .style('transform', 'translateX(' + (vpX[1] + this.rectZWidth) +  'px)');
}

Crossplot.prototype.updateAxisGrids = function() {
    let self = this;

    let wdX = this.getWindowX();
    let wdY = this.getWindowY();
    let vpX = this.getViewportX();
    let vpY = this.getViewportY();

    let stepX = (wdX[1]-wdX[0]) / (this.pointSet.majorX*this.pointSet.minorX || 1);
    let stepY = (wdY[1]-wdY[0]) / (this.pointSet.majorY*this.pointSet.minorY || 1);

    let gridX = d3.axisBottom(this.getTransformX())
        .tickValues(d3.range(wdX[0], wdX[1] + stepX/2, stepX))
        .tickFormat('')
        .tickSize(-Math.abs(vpY[1] - vpY[0]));

    let gridY = d3.axisLeft(this.getTransformY())
        .tickValues(d3.range(wdY[0], wdY[1] + stepY/2, stepY))
        .tickFormat('')
        .tickSize(-Math.abs(vpX[1] - vpX[0]));

    this.axisContainer.select('g.vi-crossplot-axis-x-grids')
        .call(gridX)
        .style('transform', 'translateY(' + vpY[0] + 'px)')
        .selectAll('.tick line')
            .attr('class', function(d, i) {
                return (!self.pointSet.minorX || i % self.pointSet.minorX == 0) ? 'vi-major-tick' : 'vi-minor-tick';
            });

    this.axisContainer.select('g.vi-crossplot-axis-y-grids')
        .call(gridY)
        .style('transform', 'translateX(' + vpX[0] + 'px)')
        .selectAll('.tick line')
            .attr('class', function(d, i) {
                return (!self.pointSet.minorY || i % self.pointSet.minorY == 0) ? 'vi-major-tick' : 'vi-minor-tick';
            });
}

Crossplot.prototype.updateAxisZRects = function() {
    let rectGroup = this.axisContainer.select('.vi-crossplot-axis-z-rects');
    if (!this.pointSet.curveZ) {
        rectGroup.style('display', 'none');
        return;
    }

    rectGroup.style('display', 'block');

    let vpY = this.getViewportY();
    let stepY = (vpY[1]-vpY[0]) / (this.pointSet.numColor || 1);
    let colors = this.colors;
    let MARGIN_LEFT = 4;

    rectGroup.selectAll('rect').remove();

    rectGroup.selectAll('rect')
        .data(d3.range(vpY[0], vpY[1], stepY).map(function(d, i) {
            return {
                y: d,
                fill: colors[i]
            }
        }))
        .enter()
        .append('rect')
            .attr('x', this.getViewportX()[1] + MARGIN_LEFT)
            .attr('y', function(d) { return d.y + stepY; })
            .attr('width', this.rectZWidth - MARGIN_LEFT)
            .attr('height', -stepY)
            .attr('fill', function(d) { return d.fill; });
}

Crossplot.prototype.updateAxisLabels = function() {
    let rect = this.getPlotRect();
    let vpX = this.getViewportX();
    let vpY = this.getViewportY();
    let PADDING_BOTTOM = 10;
    let PADDING_LEFT = 10;

    let labelXElem = this.axisContainer.select('text.vi-crossplot-axis-x-label')
        .text(this.pointSet.labelX);
    let bbX = labelXElem.node().getBBox();
    labelXElem
        .attr('transform',
            'translate('
            + ((vpX[1]-vpX[0])/2 + vpX[0] - bbX.width/2)
            + ','
            + (rect.height - PADDING_BOTTOM)
            + ')'
        );

    let labelYElem = this.axisContainer.select('text.vi-crossplot-axis-y-label')
        .text(this.pointSet.labelY);
    let bbY = labelYElem.node().getBBox();
    labelYElem
        .attr('text-anchor', 'middle')
        .attr('transform',
            'translate('
            + (PADDING_LEFT)
            + ','
            + ((vpY[1]-vpY[0])/2 + vpY[0] - bbY.height/2)
            + ')rotate(-90)'
        );
}

Crossplot.prototype.filterByPolygons = function(polygons, data, exclude) {
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

Crossplot.prototype.plotEquations = function() {
    let self = this;

    let equationContainer = this.svgContainer.select('g.vi-crossplot-equations');
    let eqData = this.regressionLines.filter(function(r) {
        return r.displayEquation && r.regFunc != null;
    });
    let equations = equationContainer.selectAll('text').data(eqData);

    const HEIGHT = 14;
    equations.enter().append('text')
        .merge(equations)
        .attr('x', 0)
        .attr('y', function(d, i) { return (i+1)*HEIGHT; })
        .attr('fill', function(d) { return d.lineStyle.lineColor; })
        .text(function(d) { return d.regFunc.equation; });
    equations.exit().remove();

    let gWidth = equationContainer.node().getBoundingClientRect().width;
    equationContainer.attr('transform', 'translate(' + (this.getViewportX()[1] - gWidth) + ',' + this.getViewportY()[1] + ')' );
}

Crossplot.prototype.plotRegressionLines = function() {
    if (this.data.length == 0) return;
    this.prepareRegressionLines();

    let transformX = this.getTransformX();
    let transformY = this.getTransformY();

    let line = d3.line()
        .x(function(d) { return transformX(d.x); })
        .y(function(d) { return transformY(d.y); });

    let regLineContainer = this.svgContainer.select('g.vi-crossplot-regression-lines')
        .attr('clip-path', 'url(#' + this.getSvgClipId() + ')');

    let regLines = regLineContainer.selectAll('path')
        .data(this.regressionLines.filter(function(r) {
            return r.regFunc != null;
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
        .style('display', function(d) { return d.displayLine ? 'block' : 'none'; });
    regLines.exit().remove();

    this.plotEquations();
}

Crossplot.prototype.prepareRegressionLines = function() {
    let regLines = this.regressionLines;

    let self = this;
    regLines.forEach(function(l) {
        let polygons = self.polygons.filter(function(p) {
            return l.polygons.map(function(lp){
                return lp.idPolygon;
            }).indexOf(p.idPolygon) > -1;
        });
        let data = self.filterByPolygons(polygons, self.data, l.exclude);
        if (data.length == 0) {
            l.regFunc = null;
            return;
        }
        let regFunc = self.getRegressionFunc(data);
        l.data = [self.pointSet.scaleLeft, self.pointSet.scaleRight].map(function(d) {
            return {
                x: d,
                y: regFunc(d)
            }
        });
        l.regFunc = regFunc;
    });
}

Crossplot.prototype.getRegressionFunc = function(data) {
    let reducer = function(sum, current) { return sum + current; };

    let dataX = data.map(function(d) { return d.x; });
    let dataY = data.map(function(d) { return d.y; });

    let meanX = dataX.reduce(reducer) * 1.0 / dataX.length;
    let meanY = dataY.reduce(reducer) * 1.0 / dataY.length;

    let XX = dataX.map(function(d) { return Math.pow(d-meanX, 2); }).reduce(reducer);
    let XY = dataX.map(function(d, i) { return (d-meanX) * (dataY[i]-meanY); }).reduce(reducer);

    let slope = XY / XX;
    let intercept = meanY - (meanX * slope);

    let regFunc = function(x) {
        return x*slope + intercept;
    };
    let a = +slope.toFixed(6);
    let b = +intercept.toFixed(6);
    regFunc.equation = 'y=' + a + '*x' + (b < 0 ? b : ('+' + b));

    return regFunc;
}

Crossplot.prototype.plotPolygons = function() {
    let transformX = this.getTransformX();
    let transformY = this.getTransformY();

    let line = d3.line()
        .x(function(d) { return transformX(d.x); })
        .y(function(d) { return transformY(d.y); });

    let polygonContainer = this.svgContainer.select('g.vi-crossplot-polygons')
        .attr('clip-path', 'url(#' + this.getSvgClipId() + ')')

    let polygons = polygonContainer.selectAll('path')
        .data(this.polygons);

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

Crossplot.prototype.plotSymbols = function() {
    let self = this;
    let transformX = this.getTransformX();
    let transformY = this.getTransformY();
    let transformZ;
    if (self.pointSet.curveZ) {
        transformZ = this.getTransformZ();
    }
    let vpX = this.getViewportX();
    let vpY = this.getViewportY();
    let rect = this.getPlotRect();

    let ctx = this.ctx;
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.save();

    ctx.rect(d3.min(vpX), d3.min(vpY), d3.max(vpX)-d3.min(vpX), d3.max(vpY)-d3.min(vpY));
    ctx.clip();

    let helper = new CanvasHelper(ctx, {
        strokeStyle: this.pointSet.pointColor,
        fillStyle: this.pointSet.pointColor,
        size: this.pointSet.pointSize
    });

    let plotFunc = helper[Utils.lowercase(this.pointSet.pointSymbol)];
    if (typeof plotFunc != 'function') return;

    this.data.forEach(function(d) {
        if (self.pointSet.curveZ) {
            helper.strokeStyle = transformZ(d.z);
            helper.fillStyle = transformZ(d.z);
        }
        plotFunc.call(helper, transformX(d.x), transformY(d.y));
    });
    ctx.restore();
}

Crossplot.prototype.prepareData = function() {
    if (!this.pointSet.curveX || !this.pointSet.curveY || !this.pointSet.curveX.data || !this.pointSet.curveY.data)
        return;

    Utils.setIfSelfNull(this.pointSet, 'scaleLeft', (this.pointSet.curveX || {}).minX);
    Utils.setIfSelfNull(this.pointSet, 'scaleRight', (this.pointSet.curveX || {}).maxX);
    Utils.setIfSelfNull(this.pointSet, 'labelX', (this.pointSet.curveX || {}).name);

    Utils.setIfSelfNull(this.pointSet, 'scaleBottom', (this.pointSet.curveY || {}).minX);
    Utils.setIfSelfNull(this.pointSet, 'scaleTop', (this.pointSet.curveY || {}).maxX);
    Utils.setIfSelfNull(this.pointSet, 'labelY', (this.pointSet.curveY || {}).name);

    Utils.setIfSelfNull(this.pointSet, 'scaleMin', (this.pointSet.curveZ || {}).minX);
    Utils.setIfSelfNull(this.pointSet, 'scaleMax', (this.pointSet.curveZ || {}).maxX);

    this.data = [];

    let mapX = {};
    Utils.parseData(this.pointSet.curveX.data).forEach(function(d) {
        mapX[d.y] = d.x;
    });

    let mapZ = {};
    if (this.pointSet.curveZ && this.pointSet.curveZ.data) {
        Utils.parseData(this.pointSet.curveZ.data).forEach(function(d) {
            mapZ[d.y] = d.x;
        })
    }

    let self = this;
    Utils.parseData(this.pointSet.curveY.data).forEach(function(d) {
        if (self.pointSet.intervalDepthTop != null && d.y < self.pointSet.intervalDepthTop) return;
        if (self.pointSet.intervalDepthBottom != null && d.y > self.pointSet.intervalDepthBottom) return;

        if (d.y != null && d.x != null && mapX[d.y] != null && !isNaN(d.y) && !isNaN(d.x) && !isNaN(mapX[d.y])) {
            self.data.push({
                x: mapX[d.y],
                y: d.x,
                z: mapZ[d.y]
            });
        }
    });
}

Crossplot.prototype.genColorList = function() {
    function rand(x) {
        return Math.floor(Math.random() * x);
    }

    const DEFAULT_COLORS = ['Red', 'Blue', 'Yellow', 'Green', 'Black', 'Brown', 'DarkGoldenRod', 'DimGray', 'Indigo', 'Navy'];
    if (this.pointSet.numColor <=  DEFAULT_COLORS.length) {
        this.colors = DEFAULT_COLORS.slice(0, this.pointSet.numColor);
        return;
    }

    let colors = DEFAULT_COLORS.map(function(c) {
        return d3.color(c).toString();
    });

    let i = colors.length;
    let color;
    while (i < this.pointSet.numColor) {
        do {
            color = d3.rgb(rand(255), rand(255), rand(255)).toString();
        }
        while (colors.indexOf(color) >= 0);
        colors.push(color);
        i += 1;
    }
    this.colors = colors;
}

Crossplot.prototype.genColor = function() {
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

Crossplot.prototype.getSvgClipId = function() {
    return 'vi-crossplot-svg-clip-' + this.idCrossplot;
}

Crossplot.prototype.on = function(type, cb) {
    this.svgContainer.on(type, cb);
}

Crossplot.prototype.mouseMoveCallback = function() {
    let mouse = d3.mouse(this.svgContainer.node());
    let vpX = this.getViewportX();
    let vpY = this.getViewportY();

    if (mouse[0] < d3.min(vpX) || mouse[0] > d3.max(vpX) || mouse[1] < d3.min(vpY) || mouse[1] > d3.max(vpY))
        return;

    let x = this.getTransformX().invert(mouse[0]);
    let y = this.getTransformY().invert(mouse[1]);

    if (this.mode == 'PlotPolygon') {
        if (!this.tmpPolygon) return;
        if (!this.tmpPolygonPoint) {
            this.tmpPolygonPoint = {x: x, y: y};
            this.tmpPolygon.points.push(this.tmpPolygonPoint);
        }
        else {
            this.tmpPolygonPoint.x = x;
            this.tmpPolygonPoint.y = y;
        }
        this.plotPolygons();
    }
}

Crossplot.prototype.mouseDownCallback = function() {
    let mouse = d3.mouse(this.svgContainer.node());
    let vpX = this.getViewportX();
    let vpY = this.getViewportY();

    if (mouse[0] < d3.min(vpX) || mouse[0] > d3.max(vpX) || mouse[1] < d3.min(vpY) || mouse[1] > d3.max(vpY))
        return;

    let x = this.getTransformX().invert(mouse[0]);
    let y = this.getTransformY().invert(mouse[1]);

    if (this.mode == 'PlotPolygon') {
        if (d3.event.button == 2) return;
        if (!this.tmpPolygon) {
            this.tmpPolygon = {
                lineStyle: this.genColor(),
                display: true,
                points: [{x: x, y: y}]
            };
            this.polygons.push(this.tmpPolygon);
        }
        this.tmpPolygonPoint = null;
        this.plotPolygons();
    }
}

Crossplot.prototype.startAddPolygon = function() {
    this.setMode('PlotPolygon');
}

Crossplot.prototype.endAddPolygon = function() {
    this.setMode(null);
    if (this.tmpPolygonPoint) {
        this.tmpPolygon.points.pop();
    }
    let addedPolygon = this.tmpPolygon;
    this.tmpPolygon = null;
    this.plotPolygons();
    return addedPolygon;
}

Crossplot.prototype.startEditPolygon = function(id) {
    let polygon = this.polygons.filter(function(p) {
        return p.idPolygon == id;
    })[0];
    if (!polygon) return;

    this.setMode('PlotPolygon');
    this.tmpPolygon = polygon;
    this.tmpPolygonPoint = Utils.clone(polygon.points[polygon.points.length -1]);
    this.tmpPolygon.points.push(this.tmpPolygonPoint);
}

Crossplot.prototype.endEditPolygon = function() {
    this.setMode(null);
    if (this.tmpPolygonPoint) {
        this.tmpPolygon.points.pop();
    }
    let edittedPolygon = this.tmpPolygon;
    this.tmpPolygon = null;
    this.plotPolygons();
    return edittedPolygon;
}
