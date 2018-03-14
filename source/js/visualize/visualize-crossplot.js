let Utils = require('./visualize-utils');
let CommonSchema = require('./visualize-common-schema');
let CanvasHelper = require('./visualize-canvas-helper');
let SvgHelper = require('./visualize-svg-helper');
let Curve = require('./visualize-curve');
let Selection = require('./visualize-selection');

module.exports = Crossplot;

function newCurve(config, data, step, offset) {
    if (step) config.yStep = parseFloat(step);
    if (offset) config.offsetY = parseFloat(offset);
    config._data = data;
    return new Curve(config);
}

function Crossplot(config) {
    this.setProperties(config);
    //this.paddingLeft = 100;
    //this.paddingRight = 50;
    //this.paddingTop = 50;
    //this.paddingBottom = 50;
    this.paddingLeft = 50;
    this.paddingRight = 50;
    this.paddingTop = 20;
    this.paddingBottom = 50;

    this.rectZWidth = 0;

    this.viSelection = null;
}

Crossplot.prototype.AREA_LINE_COLOR = 'DarkCyan';
Crossplot.prototype.AREA_LINE_WIDTH = 4;
Crossplot.prototype.AREA_BACKGROUND = 'rgba(255, 255, 0, 0.5)';
Crossplot.prototype.TERNARY_VERTEX_COLOR = 'Green';
Crossplot.prototype.TERNARY_POINT_COLOR = 'Red';
Crossplot.prototype.TERNARY_VERTEX_SIZE = 6;
Crossplot.prototype.TERNARY_EDGE_WIDTH = 2;

const POLYGON_SCHEMA = {
    type: 'Object',
    properties: {
        idPolygon: { type: 'Integer' },
        lineStyle: { type: 'String', default: 'Blue' },
        display: { type: 'Boolean', default: true },
        points: CommonSchema.POINT_ARRAY_SCHEMA
    }
};

const REGRESSION_LINE_SCHEMA = {
    type: 'Object',
    properties: {
        idRegressionLine: { type: 'Integer' },
        lineStyle: CommonSchema.LINE_STYLE_SCHEMA,
        displayLine: { type: 'Boolean', default: false },
        displayEquation: { type: 'Boolean', default: false },
        regType: {
            type: 'Enum',
            values: ['Linear', 'Exponent', 'Power'],
            default: 'Linear'
        },
        inverseReg: { type: 'Boolean', default: false },
        exclude: { type: 'Boolean', default: false },
        polygons: {
            type: 'Array',
            item: { type: 'Integer' },
            default: []
        },
        fitX: { type: 'Float' },
        fitY: { type: 'Float' }
    }
};

const ZONE_SCHEMA = {
    type: 'Object',
    properties: {
        idZone: { type: 'Integer' },
        name: { type: 'String' },
        startDepth: { type: 'Float' },
        endDepth: { type: 'Float' },
        fill: { type: 'Object' }
    }
};

const SELECTION_SCHEMA = {
    type: 'Object',
    properties: {
        selectionDepths: { type: 'Array' }
        // selectionData: { type: 'Object' },
        // idSelection: { type: 'Integer' }
        // name: { type: 'String' },
        // startDepth: { type: 'Float' },
        // endDepth: { type: 'Float' },
        // fill: { type: 'Object' }
    }
};

const POINTSET_SCHEMA = {
    type: 'Object',
    properties: {
        idPointSet: { type: 'Integer' },
        idCurveX: { type: 'Integer' },
        idCurveY: { type: 'Integer' },
        idCurveZ: { type: 'Integer' },
        idOverlayLine: { type: 'String' },
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
        zoneset: { type: 'Object' },
        lineMode: { type: 'Boolean', default: false },
        showLine: { type: 'Boolean', default: false },
        standalone: { type: 'Boolean', default: false },
        overlayLine: { type: 'String' },
        activeZone: { type: 'String' },
        overlayLine: { type: 'Object' },
        zones: {
            type: 'Array',
            item: ZONE_SCHEMA,
            default: []
        },
        selections: {
            type: 'Array',
            item: SELECTION_SCHEMA,
            default: []
        },
        depthType: { type: 'String' }
    }
};

const AREA_SCHEMA = {
    type: 'Object',
    properties: {
        lineStyle: CommonSchema.LINE_STYLE_SCHEMA,
        points: CommonSchema.POINT_ARRAY_SCHEMA
    }
};

const USER_LINE_SCHEMA = {
    type: 'Object',
    properties: {
        lineStyle: CommonSchema.LINE_STYLE_SCHEMA,
        points: CommonSchema.POINT_ARRAY_SCHEMA
    }
};

const USER_DEFINE_LINE_SCHEMA = {
    type: 'Object',
    properties: {
        idUserDefineLine: { type: 'Integer' },
        function: { type: 'String' },
        lineStyle: CommonSchema.LINE_STYLE_SCHEMA,
        displayLine: { type: 'Boolean', default: true },
        displayEquation: { type: 'Boolean', default: true },
        invalid: { type: 'Boolean', default: false }
    }
};

const TERNARY_SCHEMA = {
    type: 'Object',
    properties: {
        vertices : {
            type: 'Array',
            item: {
                type: 'Object',
                properties: {
                    idVertex: { type: 'Integer' },
                    x: { type: 'Float' },
                    y: { type: 'Float' },
                    name: { type: 'String' },
                    style: { type: 'Enum', values: ['Circle', 'Square'], default: 'Circle' },
                    used: { type: 'Boolean', default: false },
                    showed: { type: 'Boolean', default: true }
                }
            },
            default: []
        },
        calculate: {
            type: 'Object',
            properties: {
                type: { type: 'Enum', values: ['Point', 'Area', 'All'], default: 'All' },
                point: {
                    type: 'Object',
                    properties: {
                        x: { type: 'Float', default: null },
                        y: { type: 'Float', default: null }
                    }
                },
                area: {
                    type: 'Object',
                    properties: {
                        polygons: {
                            type: 'Array',
                            item: { type: 'Integer' },
                            default: []
                        },
                        exclude: { type: 'Boolean', default: false }
                    }
                }
            }

        },
        result: { type: 'Object'}
    }
}

const WELL_SCHEMA = {
    type: 'Object',
    properties: {
        idWell: { type: 'Integer' },
        bottomDepth: { type: 'Float' },
        topDepth: { type: 'Float' },
        step: { type: 'Float' }
    }
}

Crossplot.prototype.PROPERTIES = {
    idCrossPlot: { type: 'Integer' },
    idWell: { type: 'Integer'},
    name: { type: 'String', default: 'Noname' },
    pointSet: POINTSET_SCHEMA,
    polygons: {
        type: 'Array',
        item: POLYGON_SCHEMA,
        default: []
    },
    regressionLines: {
        type: 'Array',
        item: REGRESSION_LINE_SCHEMA,
        default: []
    },
    area: AREA_SCHEMA,
    userLine: USER_LINE_SCHEMA,
    userDefineLines: {
        type: 'Array',
        item: USER_DEFINE_LINE_SCHEMA,
        default: []
    },
    ternary: TERNARY_SCHEMA,
    discriminatorData: {
        type: 'Array',
        item: {
            type: 'Boolean'
        },
        default: []
    },
    well: WELL_SCHEMA,
    isDefineDepthColors: {
        type: 'Boolean',
        default: false
    },
    axisColors: {
        type: 'Array',
        item: {
            type: 'Object',
            properties: {
                minValue: { type: 'Float' },
                maxValue: { type: 'Float' },
                color: { type: 'String' }
            },
        },
        default: []
    },
    title: {
        type: 'Object',
        properties: {
            title: { type: 'String' },
            labelX: { type: 'String' },
            labelY: { type: 'String' },
            labelZ: { type: 'String' }
        }
    }
};

Crossplot.prototype.getProperties = function() {
    let props = Utils.getProperties(this);
    if (props.pointSet && typeof props.pointSet.activeZone == 'array') {
        props.pointSet.activeZone = props.pointSet.activeZone[0];
    }
    return props;
}

Crossplot.prototype.setProperties = function(props) {
    Utils.setProperties(this, props);

    //if(props.pointsets && props.pointsets.length) this.pointSet = props.pointsets[0];
    // if (props.pointSet && props.pointSet.idZoneSet != null) {
    //     this.pointSet.depthType = 'zonalDepth';
    // }
    return this;
}

Crossplot.prototype.setSelection = function(viSelection) {
    this.viSelection = viSelection;
}

Crossplot.prototype.getViewportX = function() {
    return [this.paddingLeft, this.bodyContainer.node().clientWidth - this.paddingRight - this.rectZWidth];
}

Crossplot.prototype.getViewportY = function() {
    return [this.bodyContainer.node().clientHeight - this.paddingBottom, this.paddingTop];
}

Crossplot.prototype.getWindowX = function() {
    if(this.pointSet.logX) {
        let left = this.pointSet.scaleLeft > 0 ? this.pointSet.scaleLeft : 0.001;
        let right = this.pointSet.scaleRight ? this.pointSet.scaleRight : 0.001;

        return [left, right];
    }
    return [this.pointSet.scaleLeft, this.pointSet.scaleRight];
}

Crossplot.prototype.getWindowY = function() {
    if(this.pointSet.logY) {
        let bottom = this.pointSet.scaleBottom > 0 ? this.pointSet.scaleBottom : 0.001;
        let top = this.pointSet.scaleTop ? this.pointSet.scaleTop : 0.001;

        return [bottom, top];
    }
    return [this.pointSet.scaleBottom, this.pointSet.scaleTop];
}

Crossplot.prototype.getWindowZ = function() {
    return [this.pointSet.scaleMin, this.pointSet.scaleMax];
}

Crossplot.prototype.getTransformX = function() {
    let scaleFunc = this.pointSet.logX ? d3.scaleLog():d3.scaleLinear();
    return scaleFunc
        .domain(this.getWindowX())
        .range(this.getViewportX());
}

Crossplot.prototype.getTransformY = function() {
    let scaleFunc = this.pointSet.logY ? d3.scaleLog():d3.scaleLinear();
    return scaleFunc
        .domain(this.getWindowY())
        .range(this.getViewportY());
}

Crossplot.prototype.getTransformZ = function() {
    if (this.pointSet.depthType == 'intervalDepth') {
        let wdZ = this.getWindowZ();
        let reverse = wdZ[0] > wdZ[1];
        if (this.shouldUseAxisColors()) {
            let domain = [];
            let range = ['transparent'];
            let colors = this.axisColors.sort(function(a, b) {
                return a.minValue - b.minValue;
            });
            colors.forEach(function(c) {
                domain.push(c.minValue);
                domain.push(c.maxValue);
                range.push(c.color);
                range.push('transparent');
            });
            return d3.scaleQuantile().domain(domain).range(range);
        }
        else {
            return d3.scaleQuantize()
                .domain(Utils.sort(wdZ))
                .range(reverse ? Utils.clone(this.colors).reverse() : this.colors);
        }
    }
    else if (this.pointSet.depthType == 'zonalDepth') {
        let domain = [];
        let range = ['transparent']
        let zones = this.pointSet.zones.sort(function(a, b) {
            return a.startDepth - b.startDepth;
        })
        zones.forEach(function(z) {
            domain.push(z.startDepth);
            domain.push(z.endDepth);
            range.push(z.fill.pattern.background);
            range.push('transparent');
        });
        return d3.scaleQuantile()
            .domain(domain)
            .range(range);
    }
    return null;
}

Crossplot.prototype.getLabelX = function() {
    return this.title.labelX || (this.pointSet.curveX || {}).name;
}

Crossplot.prototype.getLabelY = function() {
    return this.title.labelY || (this.pointSet.curveY || {}).name;
}

Crossplot.prototype.getLabelZ = function() {
    return this.title.labelZ || (this.pointSet.curveZ || {}).name;
}

Crossplot.prototype.getPlotRect = function() {
    return this.bodyContainer.node().getBoundingClientRect();
}

Crossplot.prototype.setMode = function(mode) {
    this.svgContainer.style('cursor', mode == null ? 'default' : 'copy');
    this.mode = mode;
}

Crossplot.prototype.showZonalOrInterval = function() {
    return this.pointSet.depthType;
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
        .data(['vi-crossplot-axis-x-label', 'vi-crossplot-axis-y-label', 'vi-crossplot-axis-z-label'])
        .enter()
            .append('text')
            .attr('class', function(d) { return 'vi-crossplot-axis-label ' + d; })
            .text('-');

    this.canvas = this.bodyContainer.append('canvas')
        .attr('width', rect.width)
        .attr('height', rect.height);

    this.ctx = this.canvas.node().getContext('2d');

    this.selectionCanvasContainer = [];

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
        .attr('class', 'vi-crossplot-user-define-lines');

    this.svgContainer.append('g')
        .attr('class', 'vi-crossplot-area');

    this.svgContainer.append('g')
        .attr('class', 'vi-crossplot-user-line');

    this.svgContainer.append('g')
        .attr('class', 'vi-crossplot-equations');

    this.svgContainer.append('g')
        .attr('class', 'vi-crossplot-ternary');

    this.svgContainer.append('g')
        .attr('class', 'vi-crossplot-overlay-line');
    
    this.svgContainer.append('g')
        .attr('class', 'vi-crossplot-tooltip');

    this.doPlot();

    this.on('mousedown', function() { self.mouseDownCallback() });
    this.on('mousemove', function() { self.mouseMoveCallback() });
    this.on('mouseleave', function() { self.tooltip(null, null, true);})
}

Crossplot.prototype.createContainer = function() {
    this.container = this.root.select('.vi-crossplot-container');
    //this.headerContainer = this.root.select('div.vi-crossplot-header-container'); TUNG

    this.bodyContainer = this.container.append('div')
        .attr('class', 'vi-crossplot-body-container');
    /*
    this.footerContainer = this.container.append('div')
        .attr('class', 'vi-crossplot-footer-container');
    */
    this.footerContainer = this.root.select('.vi-crossplot-footer-container');
    this.footerLeft = this.footerContainer.append('div')
        .attr('class', 'vi-crossplot-footer-left');
    this.footerRight = this.footerContainer.append('div')
        .attr('class', 'vi-crossplot-footer-right');
}

Crossplot.prototype.adjustSize = function() {
    let rect = this.getPlotRect();
    this.canvas
        .attr('width', rect.width)
        .attr('height', rect.height);

    // this.selectionCanvas
    //     .attr('width', rect.width)
    //     .attr('height', rect.height);
    this.selectionCanvasContainer.forEach(function(selectionCanvas) {
        selectionCanvas.canvas
            .attr('width', rect.width)
            .attr('height', rect.height);
    });

    this.axisContainer
        .attr('width', rect.width)
        .attr('height', rect.height);

    this.svgContainer
        .attr('width', rect.width)
        .attr('height', rect.height);
}

Crossplot.prototype.destroy = function() {
    this.bodyContainer.remove();
}

Crossplot.prototype.doPlot = function(){
    var self = this;
    if (self.timerHandle) {
        clearTimeout(self.timerHandle)
    }
    self.timerHandle = setTimeout(function() {
        self.timerHandle = null;
        self._doPlot();
    }, 500);
};

Crossplot.prototype._doPlot = function() {
    console.log('PLOT CROSSPLOT', this.getProperties());
    if (!this.pointSet || !this.pointSet.curveX || !this.pointSet.curveY) return;

    this.prepareData();
    if (!this.shouldUseAxisColors()) this.genColorList();
    this.rectZWidth = this.shouldPlotZAxis() ? 20 : 0;

    this.adjustSize();
    //this.updateHeader();
    this.updateAxises();
    this.plotSymbols();
    this.updateClipPath();

    this.plotPolygons();
    this.plotRegressionLines();
    this.plotUserDefineLines();
    this.plotTernary();
    this.plotArea();
    this.plotUserLine();
    this.plotOverlayLines();
    // if (this.viSelection) {
        this.plotSelections();
    // }

    let footerString = (this.data.length - this.outliers - this.nullDatas) +" points ploteed out of " 
                        + this.data.length + '( ' 
                        + this.outliers + ' outliers, ' 
                        + this.nullDatas + ' nulls)';
    this.footerRight
        .text(footerString);
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

/* TUNG
Crossplot.prototype.updateHeader = function() {
    this.headerContainer
        .selectAll('div.vi-crossplot-header-row')
        .data(['Crossplot: ' + this.name, 'Reference: [' + this.pointSet.intervalDepthTop + ' - ' + this.pointSet.intervalDepthBottom + ']'])
        .text(function(d) { return d; });
}
*/

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

    if (!this.shouldPlotZAxis()) {
        this.axisContainer.select('g.vi-crossplot-axis-z-ticks')
            .style('display', 'none');
        return;
    }

    let wdZ = this.getWindowZ();
    let stepZ, transformZ, tickValues;

    if (this.shouldUseAxisColors()) {
        let depths = [];
        this.axisColors.forEach(function(c) {
            depths.push(c.minValue);
            depths.push(c.maxValue);
        });
        depths = Utils.uniq(depths.sort());
        tickValues = depths;

        transformZ = d3.scaleLinear()
            .domain([d3.min(depths), d3.max(depths)])
            .range(vpY);

    }
    else {
        stepZ = (wdZ[1]-wdZ[0]) / (this.pointSet.numColor || 1);
        tickValues = d3.range(wdZ[0], wdZ[1] + stepZ/2, stepZ);
        transformZ = d3.scaleLinear()
            .domain(wdZ)
            .range(vpY);
    }

    let axisZ = d3.axisRight(transformZ)
        .tickValues(tickValues)
        .tickFormat(Utils.getDecimalFormatter(this.pointSet.decimalsZ));

    this.axisContainer.select('g.vi-crossplot-axis-z-ticks')
        .call(axisZ)
        .style('transform', 'translateX(' + (vpX[1] + this.rectZWidth) +  'px)')
        .style('display', 'block');
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
    if (!this.shouldPlotZAxis()) {
        rectGroup.style('display', 'none');
        return;
    }

    rectGroup.style('display', 'block');

    let MARGIN_LEFT = 4;
    let vpY = this.getViewportY();

    rectGroup.selectAll('rect').remove();

    if (this.shouldUseAxisColors()) {
        let depths = [];
        this.axisColors.forEach(function(c) {
            depths.push(c.minValue);
            depths.push(c.maxValue);
        });
        depths = Utils.uniq(depths.sort());
        transformZ = d3.scaleLinear()
            .domain([d3.min(depths), d3.max(depths)])
            .range(vpY);
        rectGroup.selectAll('rect')
            .data(this.axisColors.map(function(d) {
                return {
                    minValue: transformZ(d.minValue),
                    maxValue: transformZ(d.maxValue),
                    color: d.color
                }
            }))
            .enter()
            .append('rect')
                .attr('x', this.getViewportX()[1] + MARGIN_LEFT)
                .attr('y', function(d) { return d.maxValue; })
                .attr('width', this.rectZWidth - MARGIN_LEFT)
                .attr('height', function(d) { return d.minValue - d.maxValue; })
                .attr('fill', function(d) { return d.color; });
    }
    else {
        let stepY, colors;
        stepY = (vpY[1]-vpY[0]) / (this.pointSet.numColor || 1);
        colors = this.colors;
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
                .attr('height', -stepY>=0 ? -stepY:0)
                .attr('fill', function(d) { return d.fill; });
    }



}

Crossplot.prototype.updateAxisLabels = function() {
    let rect = this.getPlotRect();
    let vpX = this.getViewportX();
    let vpY = this.getViewportY();
    let PADDING_BOTTOM = 10;
    let PADDING_LEFT = 10;

    let labelXElem = this.axisContainer.select('text.vi-crossplot-axis-x-label')
        .text(this.getLabelX());
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
        .text(this.getLabelY());
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

    let labelZElem = this.axisContainer.select('text.vi-crossplot-axis-z-label')
    if (!this.shouldPlotZAxis()) {
        labelZElem.style('display', 'none');
        return;
    }

    labelZElem.text(this.getLabelZ())
        .style('display', 'block');
    let bbZ = labelZElem.node().getBBox();
    labelZElem
        .attr('transform',
            'translate('
            + (vpX[1] - bbX.width)
            + ','
            + (bbX.height)
            + ')'
        );
}

Crossplot.prototype.isInZones = function(point, zones) {
    for (let i = 0; i < zones.length; i ++) {
        if (Utils.isWithinYRange(point, [zones[i].startDepth, zones[i].endDepth]))
            return true;
    }
    return false;
}

Crossplot.prototype.isInSelections = function(point, data) {
    // for (let i = 0; i < data.length; i++) {
        // if (Utils.isWithinYRange(point, [selections[i][0], selections[i][selections[i].length - 1]]))

        // assuming 'selections' is only 1 'selection', above is true
        if (Utils.isWithinYRange(point, [data.startDepth, data.stopDepth]))
            return true;
    // }
    return false;
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

Crossplot.prototype.plotOverlayLines = function() {
    let overlayLineContainer = this.svgContainer.select('g.vi-crossplot-overlay-line')
        .attr('clip-path', 'url(#' + this.getSvgClipId() + ')');

    let transformX = this.getTransformX();
    let transformY = this.getTransformY();
    window.tX = transformX;
    window.tY = transformY;
    let isSwap = (this.pointSet.overlayLine || {}).isSwap;

    let line = d3.line()
        .x(function(d) { return transformX(parseFloat(isSwap ? d.x : d.y)); })
        .y(function(d) { return transformY(parseFloat(isSwap ? d.y : d.x)); })
        .defined(function(d) {
            return !isNaN(d.x) && !isNaN(d.y);
        });

    let data = (this.pointSet.overlayLine || {}).lines || [];
    for (let i = 0; i < data.length; i ++) {
        data[i].data = data[i].data.filter(function(d) {
            return !isNaN(d.x) && !isNaN(d.y);
        });
    }
    let overlayLines = overlayLineContainer.selectAll('path.line')
        .data(data);

    overlayLines.enter().append('path')
        .merge(overlayLines)
        .attr('class', 'line')
        .attr('d', function(d) {
            return line(d.data);
        })
        .attr('stroke', function(d) {
            let color = d.color;
            if (d.names == 'SS') color = 'Green';
            if (d.names == 'LS') color = 'Blue';
            if (d.names == 'DOL') color = 'Pink';
            return color.replace('Dk', 'Dark');
        })
        .attr('stroke-width', 2)
        .attr('fill', 'none');

    overlayLines.exit().remove();
    overlayLineContainer.selectAll('path.tick').remove();
    overlayLineContainer.selectAll('text').remove();

    for (let line of data) {
        let color = line.color;
        let name = line.names;

        if (name == 'SS') color = 'Green';
        if (name == 'LS') color = 'Blue';
        if (name == 'DOL') color = 'Pink';

        let points = line.data.map(function(d) {
            return {
                x: transformX(parseFloat(isSwap ? d.x : d.y)),
                y: transformY(parseFloat(isSwap ? d.y : d.x)),
                type: d.type
            }
        });
        if (points.length <= 1) break;
        let sign = 1;
        if (points[0].x < points[1].x) sign = -1;

        overlayLineContainer.append('text')
            .attr('x', points[0].x + 10 * sign)
            .attr('y', points[0].y)
            .text(name)
            .attr('stroke', color.replace('Dk', 'Dark'))
            .attr('fill', color.replace('Dk', 'Dark'));

        for (let i = 0; i < points.length; i ++) {
            let a, b;
            if (i == points.length -1) {
                a = points[i];
                b = points[i-1];
            }
            else {
                a = points[i];
                b = points[i+1];
            }
            let v_x = b.y - a.y;
            let v_y = a.x - b.x;
            let v_length = Math.sqrt(v_x*v_x + v_y*v_y)
            v_x /= v_length;
            v_y /= v_length;
            if (isNaN(v_x) || isNaN(v_y)) continue
            /*overlayLineContainer.append('circle')
                .attr('cx', a.x)
                .attr('cy', a.y)
                .attr('r', 5)
                .attr('stroke', 'black')*/
            let TICK_SIZE = 5
            overlayLineContainer.append('path')
                .attr('class', 'tick')
                .attr('d', 'M ' + (a.x+v_x * TICK_SIZE) + ' ' + (a.y+v_y*TICK_SIZE) + ' '
                          +'L ' + (a.x-v_x * TICK_SIZE) + ' ' + (a.y-v_y*TICK_SIZE))
                .attr('stroke', 'black')
                .attr('stroke-width', 1);


            if (!isNaN(points[i].type)) {
                //rad = Math.atan(v_x/v_y);
                //deg = rad * (180/Math.PI);
                overlayLineContainer.append('text')
                    .attr('x', a.x - 7)
                    .attr('y', a.y - 7)
                    .text(points[i].type);
            }
        }
    }
}

Crossplot.prototype.plotUserDefineLines = function() {
    this.prepareUserDefineLines();

    let transformX = this.getTransformX();
    let transformY = this.getTransformY();

    let line = d3.line()
        .x(function(d) { return transformX(d.x); })
        .y(function(d) { return transformY(d.y); })
        .defined(function(d) {
            return !isNaN(d.x) && !isNaN(d.y) && d.y != Infinity && d.y != -Infinity;
        });

    let userDefineLineContainer = this.svgContainer.select('g.vi-crossplot-user-define-lines')
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

Crossplot.prototype.plotRegressionLines = function() {
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

Crossplot.prototype.prepareUserDefineLines = function() {
    let lines = this.userDefineLines;

    let self = this;
    lines.forEach(function(l) {
        let func = self.getUserDefineFunc(l.function);
        if (!func) {
            l.invalid = true;
            return;
        }
        l.invalid = false;
        l.func = func;

        let start = self.pointSet.scaleLeft;
        let end = self.pointSet.scaleRight;
        let step = (end - start) / 1000;

        l.data = Utils.range(start, end, step).map(function(d) {
            return {
                x: d,
                y: func(d)
            };
        });
    });
}

Crossplot.prototype.prepareRegressionLines = function() {
    let regLines = this.regressionLines;

    let self = this;
    regLines.forEach(function(l) {
        let polygons = self.polygons.filter(function(p) {
            return l.polygons.indexOf(p.idPolygon) > -1;
        });
        let data = self.filterByPolygons(polygons, self.data, l.exclude);
        if (data.length == 0) {
            l.func = null;
            return;
        }
        let func = self.getRegressionFunc(data, l.regType, l.inverseReg, l.fitX, l.fitY);
        if (!func) return;
        let start = self.pointSet.scaleLeft;
        let end = self.pointSet.scaleRight;
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

Crossplot.prototype.getUserDefineFunc = function(funcStr) {
    let func = new Function('x', 'return ' + funcStr);
    try {
        let y = func(0.5);
        if (y === undefined) return null;
        func.equation = 'y=' + funcStr;
        return func;
    }
    catch (e) { return null; }
}

Crossplot.prototype.getRegressionFunc = function(data, type, inverse, fitX, fitY) {
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

Crossplot.prototype.plotUserLine = function() {
    let userLineContainer = this.svgContainer.select('g.vi-crossplot-user-line');
    userLineContainer.selectAll('path').remove();
    this.footerLeft.text('');

    if (!this.userLine || !this.userLine.points || this.userLine.points.length < 2) return;

    let transformX = this.getTransformX();
    let transformY = this.getTransformY();

    let line = d3.line()
        .x(function(d) { return transformX(d.x); })
        .y(function(d) { return transformY(d.y); });

    let userLine = userLineContainer.append('path')
        .datum(this.userLine)
        .attr('d', function(d) { return line(d.points); })
        .attr('stroke', this.AREA_LINE_COLOR)
        .attr('stroke-width', this.AREA_LINE_WIDTH);

    let equation = Utils.getLinearEquation(this.userLine.points[0], this.userLine.points[1]);
    equation = equation.replace('x', this.getLabelX());
    equation = equation.replace('y', this.getLabelY());
    this.footerLeft.text(equation);
}

Crossplot.prototype.plotArea = function() {
    let areaContainer = this.svgContainer.select('g.vi-crossplot-area');
    areaContainer.selectAll('.vi-crossplot-area-item').remove();
    if (!this.area || !this.area.points || this.area.points.length < 2) return;

    let transformX = this.getTransformX();
    let transformY = this.getTransformY();

    let line = d3.line()
        .x(function(d) { return transformX(d.x); })
        .y(function(d) { return transformY(d.y); });

    let area = areaContainer.append('path')
        .datum(this.area)
        .attr('d', function(d) {
            if (d === self.tmpPolygon)
                return line(d.points);
            else
                return line(d.points.concat([d.points[0]]));
        })
        .classed('vi-crossplot-area-item', true)
        .attr('stroke', this.AREA_LINE_COLOR)
        .attr('stroke-width', this.AREA_LINE_WIDTH)
        .attr('fill-rule', 'evenodd')
        .attr('fill', this.AREA_BACKGROUND);
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

Crossplot.prototype.shouldPlotZAxis = function() {
    return this.pointSet.curveZ && this.pointSet.depthType == 'intervalDepth';
}

Crossplot.prototype.shouldUseAxisColors = function() {
    return this.isDefineDepthColors && this.axisColors && this.axisColors.length;
}

Crossplot.prototype.plotSymbols = function() {
    let self = this;
    let depthType = self.pointSet.depthType;
    let shouldPlotZ = (depthType == 'intervalDepth' && self.pointSet.curveZ) || (depthType == 'zonalDepth' && self.pointSet.zones.length > 0);

    let transformX = this.getTransformX();
    let transformY = this.getTransformY();
    let transformZ;
    if (shouldPlotZ) {
        transformZ = this.getTransformZ();
    }
    let vpX = this.getViewportX();
    let vpY = this.getViewportY();
    let rect = this.getPlotRect();
    let windowX = this.getWindowX();
    let windowY = this.getWindowY();

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
    this.outliers = 0;
    this.data.forEach(function(d) {
        if (shouldPlotZ) {
            helper.strokeStyle = transformZ(d.z);
            helper.fillStyle = transformZ(d.z);
        }
        if(!(d.x >= d3.min(windowX) && d.x <= d3.max(windowX) && d.y >= d3.min(windowY) && d.y <= d3.max(windowY))) {
            self.outliers ++;
        }
        plotFunc.call(helper, transformX(d.x), transformY(d.y));
    });
    ctx.restore();
}

Crossplot.prototype.plotSelections = function() {
    let self = this;
    let depthType = self.pointSet.depthType;

    let transformX = this.getTransformX();
    let transformY = this.getTransformY();
    let vpX = this.getViewportX();
    let vpY = this.getViewportY();
    let rect = this.getPlotRect();

    this.selectionCanvasContainer.forEach(function(selectionCanvas) {
        let canvas = selectionCanvas.canvas.raise();
        let selectionCtx = canvas.node().getContext('2d');
        selectionCtx.clearRect(0, 0, rect.width, rect.height);
        selectionCtx.save();

        selectionCtx.rect(d3.min(vpX), d3.min(vpY), d3.max(vpX)-d3.min(vpX), d3.max(vpY)-d3.min(vpY));
        selectionCtx.clip();

        let helper = new CanvasHelper(selectionCtx, {
            strokeStyle: selectionCanvas.color,
            fillStyle: selectionCanvas.color,
            size: self.pointSet.pointSize
        });

        let plotFunc = helper[Utils.lowercase(self.pointSet.pointSymbol)];
        if (typeof plotFunc != 'function') return;
        let processedSelectionData = self.prepareSelectionData(selectionCanvas.data);
        processedSelectionData.forEach(function(data) {
            data.forEach(function(d) {
                plotFunc.call(helper, transformX(d.x), transformY(d.y));
            });
        });
        selectionCtx.restore();
    });
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
    let zonalOrInterval = this.showZonalOrInterval();
    let zones = [];
    if (zonalOrInterval == 'zonalDepth') {
        if (self.pointSet.activeZone instanceof Array) {
            zones = self.pointSet.zones.filter(function(zone) {
                return self.pointSet.activeZone.indexOf(zone.idZone) > -1;
            });
        }
        else if (Utils.lowercase(self.pointSet.activeZone) == 'all') {
            zones = self.pointSet.zones;
        }
        else {
            zones = self.pointSet.zones.filter(function(zone) {
                return zone.idZone == self.pointSet.activeZone;
            });
        }
    }
    self.nullDatas = 0;
    Utils.parseData(this.pointSet.curveY.data).forEach(function(d) {
        if (zonalOrInterval == 'zonalDepth') {
            if (!self.isInZones(d, zones)) return;
        }
        else if (zonalOrInterval == 'intervalDepth') {
            if (self.pointSet.intervalDepthTop != null && d.y < self.pointSet.intervalDepthTop) {
                return;
            }
            if (self.pointSet.intervalDepthBottom != null && d.y > self.pointSet.intervalDepthBottom) {
                return;
            }
        }

        if (self.discriminatorData.length) {
            let well = self.well;
            let index = Math.round((d.y - well.topDepth) / well.step);
            if (!self.discriminatorData[index]) return;
        }

        if (d.y != null && d.x != null && mapX[d.y] != null && !isNaN(d.y) && !isNaN(d.x) && !isNaN(mapX[d.y])) {
            self.data.push({
                x: mapX[d.y],
                y: d.x,
                z: self.pointSet.depthType == 'intervalDepth' ? mapZ[d.y] : d.y,
                depth: d.y
            });
        } else {
            self.nullDatas ++;
        }
    });
}

Crossplot.prototype.prepareSelectionData = function(depthData) {
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

    let mapX = {};
    Utils.parseData(this.pointSet.curveX.data).forEach(function (d) {
        mapX[d.y] = d.x;
    });

    let mapZ = {};
    if (this.pointSet.curveZ && this.pointSet.curveZ.data) {
        Utils.parseData(this.pointSet.curveZ.data).forEach(function (d) {
            mapZ[d.y] = d.x;
        })
    }

    let self = this;
    let selectionData = [];
    depthData.forEach(function(data) {
        let selectionPoints = [];
        Utils.parseData(self.pointSet.curveY.data).forEach(function(d) {
            if (!self.isInSelections(d, data)) return;
            if (self.discriminatorData.length) {
                let well = self.well;
                let index = Math.round((d.y - well.topDepth) / well.step);
                if (!self.discriminatorData[index]) return;
            }

            if (d.y != null && d.x != null && mapX[d.y] != null && !isNaN(d.y) && !isNaN(d.x) && !isNaN(mapX[d.y])) {
                selectionPoints.push({
                    x: mapX[d.y],
                    y: d.x,
                    z: self.pointSet.depthType == 'intervalDepth' ? mapZ[d.y] : d.y,
                    depth: d.y
                });
            }
        });
        selectionData.push(selectionPoints);
    });
    return selectionData;
}

Crossplot.prototype.plotTernary = function() {
    let ternaryContainer = this.svgContainer.select('g.vi-crossplot-ternary');
    ternaryContainer.selectAll('.vi-crossplot-ternary-item').remove();

    let vertices = this.ternary.vertices.filter(function(v) { return v.showed; });

    let self = this;
    let transformX = this.getTransformX();
    let transformY = this.getTransformY();

    let helper = new SvgHelper(ternaryContainer, {
        fillStyle: self.TERNARY_VERTEX_COLOR,
        strokeStyle: self.TERNARY_VERTEX_COLOR,
        size: self.TERNARY_VERTEX_SIZE,
    });

    vertices.filter(function(v){
        return v.x != null && v.y != null && !isNaN(v.x) && !isNaN(v.y);
    }).forEach(function(v) {
        let x = transformX(v.x);
        let y = transformY(v.y);
        helper[Utils.lowercase(v.style)](x, y).classed('vi-crossplot-ternary-item', true);
        ternaryContainer.append('text')
            .classed('vi-crossplot-ternary-item', true)
            .attr('x', x+self.TERNARY_VERTEX_SIZE)
            .attr('y', y-self.TERNARY_VERTEX_SIZE)
            .text(v.name);
    });

    vertices = this.ternary.vertices.filter(function(v) {
        return v.used && v.x != null && v.y != null && !isNaN(v.x) && !isNaN(v.y);
    });
    this.plotTernaryPoint();

    if (vertices.length != 3) return;

    let line = d3.line()
        .x(function(d) { return transformX(d.x); })
        .y(function(d) { return transformY(d.y); });

    ternaryContainer.append('path')
        .classed('vi-crossplot-ternary-item', true)
        .datum(vertices.concat([vertices[0]]))
        .attr('d', line)
        .attr('stroke', self.TERNARY_VERTEX_COLOR)
        .attr('stroke-width', self.TERNARY_EDGE_WIDTH)
        .attr('fill', function(d) {
            let color = d3.color(self.TERNARY_VERTEX_COLOR);
            color.opacity = 0.1;
            return color.toString();
        });

    let v1, v2, v3;
    for (let i = 0; i < 3; i ++) {
        v1 = vertices[(i+2) % 3];
        v2 = vertices[i];
        v3 = vertices[(i+1) % 3];
        Utils.range(1/5, 4/5, 1/5).forEach(function(i) {
            ternaryContainer.append('path')
                .classed('vi-crossplot-ternary-item', true)
                .datum([ Utils.getPointByFraction(v2, v1, i), Utils.getPointByFraction(v2, v3, i) ])
                .attr('d', line)
                .attr('stroke', self.TERNARY_VERTEX_COLOR)
                .attr('stroke-width', self.TERNARY_EDGE_WIDTH / 2)
                .attr('fill', 'none');
        });
    }

}

Crossplot.prototype.plotTernaryPoint = function() {
    let ternaryContainer = this.svgContainer.select('g.vi-crossplot-ternary');
    ternaryContainer.selectAll('.vi-crossplot-ternary-point').remove();
    if (!this.ternary.calculate) return;
    let point = this.ternary.calculate.point;
    if (!point || point.x == null || point.y == null || isNaN(point.x) || isNaN(point.y)) return;
    let self = this;
    let helper = new SvgHelper(ternaryContainer, {
        fillStyle: self.TERNARY_POINT_COLOR,
        strokeStyle: self.TERNARY_POINT_COLOR,
        size: self.TERNARY_VERTEX_SIZE,
    });
    helper
        .circle(self.getTransformX()(point.x), self.getTransformY()(point.y))
        .classed('vi-crossplot-ternary-point', true);
}

Crossplot.prototype.calculateTernary = function() {
    let vertices = this.ternary.vertices.filter(function(d) { return d.used; });
    if (vertices.length != 3) return { error: 'There must be three used vertices'};

    let self = this;
    let calc = this.ternary.calculate;
    let points = [];

    if (calc.type == 'Point') {
        points = [calc.point];
    }
    else if (calc.type == 'Area') {
        let idCalcPolygons = calc.area.polygons;
        let polygons = self.polygons.filter(function(p) { return idCalcPolygons.indexOf(p.idPolygon) > -1; });
        points = self.filterByPolygons(polygons, self.data, calc.area.exclude);
    }
    else if (calc.type == 'All') {
        points = self.data;
    }

    points = this.filterByPolygons([{ points: vertices }], points);
    if (!points.length) return { error: 'There is no point in ternary' };

    let v1 = vertices[0], v2 = vertices[1], v3 = vertices[2];
    let f1 = Utils.getLineFuncFromTwoPoints(v2, v3),
        f2 = Utils.getLineFuncFromTwoPoints(v3, v1),
        f3 = Utils.getLineFuncFromTwoPoints(v1, v2);

    let curves = [[], [], []];

    points.forEach(function(p) {
        let parallelLine1 = Utils.getLineFunc(f1.slope, p);
        let parallelLine2 = Utils.getLineFunc(f2.slope, p);
        let i1 = Utils.getIntersection(parallelLine2, f3);
        let i2 = Utils.getIntersection(parallelLine1, f3);
        let d = Utils.getDistance(v1, v2);

        curves[0].push({ x: Utils.getDistance(v1, i1) / d, y: p.depth });
        curves[1].push({ x: Utils.getDistance(i1, i2) / d, y: p.depth });
        curves[2].push({ x: Utils.getDistance(i2, v2) / d, y: p.depth });
    });

    return {
        materials: curves.map(function(c) {
            return Utils.mean(c.map(function(p) { return p.x; }))
        }),
        curves: curves
    };
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
    return 'vi-crossplot-svg-clip-' + this.idCrossPlot;
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
    else if (this.mode == 'PlotAreaPolygon') {
        if (!this.tmpPolygon) return;
        if (!this.tmpPolygonPoint) {
            this.tmpPolygonPoint = {x: x, y: y};
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
                    {x: x, y: y}
                ]
            };
            this.plotUserLine();
        }
    }
    else {
        this.tooltip(x, y);
    }
}

Crossplot.prototype.onMouseDown = function(callback) {
    let self = this;
    this.on('mousedown', function() {
        let ret = self.mouseDownCallback();
        callback(ret);
    })
}

Crossplot.prototype.mouseDownCallback = function() {
    let mouse = d3.mouse(this.svgContainer.node());
    let vpX = this.getViewportX();
    let vpY = this.getViewportY();

    if (mouse[0] < d3.min(vpX) || mouse[0] > d3.max(vpX) || mouse[1] < d3.min(vpY) || mouse[1] > d3.max(vpY))
        return;

    let x = this.getTransformX().invert(mouse[0]);
    let y = this.getTransformY().invert(mouse[1]);

    if (d3.event.button == 2) return;
    if (this.mode == 'PlotPolygon') {
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
    else if (this.mode == 'PlotAreaPolygon') {
        if (!this.tmpPolygon) {
            this.tmpPolygon = { points: [{x: x, y: y}] };
            this.area = this.tmpPolygon;
        }
        this.tmpPolygonPoint = null;
        this.plotArea();
    }
    else if (this.mode == 'PlotAreaRectangle') {
        if (!this.area) {
            this.area = { points: [{x: x, y: y}] };
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
            this.userLine = { points: [{x: x, y: y}] };
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

Crossplot.prototype.startAddTernaryVertex = function(idx) {
    this.setMode('PlotTernaryVertex');
    if (idx == null) this.tmpVertex = null;
    else this.tmpVertex = this.ternary.vertices[idx];
}

Crossplot.prototype.endAddTernaryVertex = function() {
    this.setMode(null);
}

Crossplot.prototype.startAddTernaryPoint = function() {
    this.setMode('PlotTernaryPoint');
}

Crossplot.prototype.endAddTernaryPoint = function() {
    this.setMode(null);
}

Crossplot.prototype.startAddUserLine = function() {
    this.setMode('PlotUserLine');
    this.userLine = null;
}

Crossplot.prototype.endAddUserLine = function() {
    this.setMode(null);
    return this.userLine;
}

Crossplot.prototype.startAddAreaPolygon = function() {
    this.setMode('PlotAreaPolygon');
}

Crossplot.prototype.endAddAreaPolygon = function() {
    this.setMode(null);
    if (!this.tmpPolygon) return null;
    if (this.tmpPolygonPoint) {
        this.tmpPolygon.points.pop();
    }
    this.tmpPolygon = null;
    this.plotArea();
    return this.area;
}

Crossplot.prototype.startAddAreaRectangle = function() {
    this.setMode('PlotAreaRectangle');
    this.area = null;
}

Crossplot.prototype.endAddAreaRectangle = function() {
    this.setMode(null);
    return this.area;
}

Crossplot.prototype.startAddPolygon = function() {
    this.setMode('PlotPolygon');
}

Crossplot.prototype.endAddPolygon = function() {
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
    if (!this.tmpPolygon) return null;
    if (this.tmpPolygonPoint) {
        this.tmpPolygon.points.pop();
    }
    let edittedPolygon = this.tmpPolygon;
    this.tmpPolygon = null;
    this.plotPolygons();
    return edittedPolygon;
}

Crossplot.prototype.initSelectionArea = function(viSelections) {
    let self = this;
    viSelections.forEach((viSelection) => {
        viSelection.initCanvas(self.bodyContainer, 'crossplot');
        self.selectionCanvasContainer.push(viSelection);
    });
}

Crossplot.prototype.getSelection = function(id) {
    return this.selectionCanvasContainer.find(d => d.isSelection() && d.idSelectionTool == id);
}

Crossplot.prototype.tooltip = function(x, y, notShow) {
    let self = this;
    let transformX = self.getTransformX();
    let transformY = self.getTransformY();
    let tooltipData = {x: x, y: y};

    let xCoord = transformX(x) + 15;
    let yCoord = transformY(y) + 15;
    let container = self.svgContainer.select('.vi-crossplot-tooltip');
    if(notShow || isNaN(xCoord) || isNaN(yCoord)  || !x || !y) {
        container.selectAll('*').remove();
        return;       
    }

    let text = container.selectAll('text')
        .data([x, y]);
    text.enter()
        .append('text')
        .style('font-size', 14)
        .style('font-weight', 'bold')
        .attr('x', xCoord)
        .attr('y', (d, i) => { return yCoord + 15 + 20*i;})
        .text(function (d, i) { 
            return (i == 0 ? 'X(' + self.getLabelX():'Y(' + self.getLabelY()) + '): ' + d.toFixed(2);
        });
    text.attr('x', xCoord)
        .attr('y', (d, i) => { return yCoord + 15 + 20*i;})
        .text(function (d, i) { 
        return (i == 0 ? 'X(' + self.getLabelX():'Y(' + self.getLabelY()) + '): ' + d.toFixed(2);
    });
    text.exit().remove();

    let maxWidth = d3.max(container.selectAll('text').nodes().map(function(node) { return node.getBBox().width;}));
    let maxHeight = container.select('text').node().getBBox().height * 2.5;
    let rect = container.selectAll('rect')
        .data([{x: xCoord,y: yCoord}]);
    rect.enter()
        .append('rect')
            .attr('x', (d)=> d.x - 5)
            .attr('y', (d)=> d.y - 5)
            .attr('width', maxWidth + 10)
            .attr('height', maxHeight + 10)
            .attr('fill', 'lightgreen')
            .attr('fill-opacity', 0.9)
            .attr('stroke', '#444')
            .attr('rx', 7)
            .attr('ry', 7); 
    rect.attr('x', (d)=> d.x - 5)
        .attr('y', (d)=> d.y - 5)
        .attr('width', maxWidth + 10)
        .attr('height', maxHeight + 10);
    rect.exit().remove();
    text.raise();
}