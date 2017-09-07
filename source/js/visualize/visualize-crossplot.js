let Utils = require('./visualize-utils');
let CanvasHelper = require('./visualize-canvas-helper');

module.exports = Crossplot;

function Crossplot(config) {
    this.setProperties(config);

    this.scaleLeft = this.scaleLeft == null ? (this.curveX || {}).minX : this.scaleLeft;
    this.scaleRight = this.scaleRight == null ? (this.curveX || {}).maxX : this.scaleRight;
    this.labelX = this.labelX || (this.curveX || {}).name;

    this.scaleBottom = this.scaleBottom == null ? (this.curveY || {}).minX : this.scaleBottom;
    this.scaleTop = this.scaleTop == null ? (this.curveY || {}).maxX : this.scaleTop;
    this.labelY = this.labelY || (this.curveY || {}).name;

    this.scaleMin = this.scaleMin == null ? (this.curveZ || {}).minX : this.scaleMin;
    this.scaleMax = this.scaleMax == null ? (this.curveZ || {}).maxX : this.scaleMax;

    this.paddingLeft = 100;
    this.paddingRight = 50;
    this.paddingTop = 50;
    this.paddingBottom = 50;

    this.rectZWidth = 0;
}

Crossplot.prototype.PROPERTIES = {
    idCrossplot: { type: 'Integer' },
    idWell: { type: 'Integer'},
    name: { type: 'String', default: 'Noname' },
    curveX: { type: 'Object' },
    logX: { type: 'Boolean', default: false },
    majorX: { type: 'Integer', default: 5 },
    minorX : { type: 'Integer', default: 1 },
    scaleLeft: { type: 'Float' },
    scaleRight: { type: 'Float' },
    labelX: { type: 'String' },
    decimalsX: { type: 'Integer', default: 2 },
    curveY: { type: 'Object' },
    logY: { type: 'Boolean', default: false },
    majorY: { type: 'Integer', default: 5 },
    minorY: { type: 'Integer', default: 1 },
    scaleBottom: { type: 'Float' },
    scaleTop: { type: 'Float' },
    labelY: { type: 'String' },
    decimalsY: { type: 'Integer', default: 2 },
    curveZ: { type: 'Object' },
    scaleMin: { type: 'Float' },
    scaleMax: { type: 'Float' },
    numColor: { type: 'Integer', default: 5 },
    decimalsZ: { type: 'Float', default: 2 },
    pointSymbol: { type: 'Enum', values: ['Circle', 'Square', 'Cross', 'Diamond', 'Plus', 'Star'], default: 'Circle' },
    pointSize: { type: 'Integer', default: 2 },
    pointColor: { type: 'String', default: 'Blue' },
    topDepth: { type: 'Float' },
    bottomDepth: { type: 'Float' }
};

Crossplot.prototype.getProperties = function() {
    let props = Utils.only(this, Object.keys(this.PROPERTIES));
    props.idCurveX = (this.curveX || {}).idCurve;
    props.idCurveY = (this.curveY || {}).idCurve;
    props.idCurveZ = (this.curveZ || {}).idCurve;
    return props;
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
    return [this.scaleLeft, this.scaleRight];
}

Crossplot.prototype.getWindowY = function() {
    return [this.scaleBottom, this.scaleTop];
}

Crossplot.prototype.getWindowZ = function() {
    return [this.scaleMin, this.scaleMax];
}

Crossplot.prototype.getTransformX = function() {
    return d3.scaleLinear()
        .domain(this.getWindowX())
        .range(this.getViewportX())
        .clamp(true);
}

Crossplot.prototype.getTransformY = function() {
    return d3.scaleLinear()
        .domain(this.getWindowY())
        .range(this.getViewportY())
        .clamp(true);
}

Crossplot.prototype.getTransformZ = function() {
    return d3.scaleQuantize()
        .domain(this.getWindowZ())
        .range(this.colors);
}

Crossplot.prototype.getPlotRect = function() {
    return this.bodyContainer.node().getBoundingClientRect();
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
            .attr('class', function(d) { return 'vi-crossplot-axis-label ' +d; })
            .text('-');

    this.canvas = this.bodyContainer.append('canvas')
        .attr('width', rect.width)
        .attr('height', rect.height);

    this.ctx = this.canvas.node().getContext('2d');

    this.svgContainer = this.bodyContainer.append('svg')
        .attr('class', 'vi-crossplot-svg-container')
        .attr('width', rect.width)
        .attr('height', rect.height);

    d3.select(window)
        .on('resize', function() {
            self.doPlot();
        });

    this.doPlot();
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
    this.prepareData();
    this.genColorList();
    this.rectZWidth = this.curveZ ? 20 : 0;

    this.adjustSize();
    this.updateHeader();
    this.updateAxis();
    this.plotSymbol();
}

Crossplot.prototype.updateHeader = function() {
    this.headerContainer
        .selectAll('div.vi-crossplot-header-row')
        .data([this.name, 'Reference: [' + this.topDepth + ' - ' + this.bottomDepth + ']'])
        .text(function(d) { return d; });
}

Crossplot.prototype.updateAxis = function() {
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

    let stepX = (wdX[1]-wdX[0]) / (this.majorX*this.minorX || 1);
    let stepY = (wdY[1]-wdY[0]) / (this.majorY*this.minorY || 1);

    let axisX = d3.axisBottom(this.getTransformX())
        .tickValues(d3.range(wdX[0], wdX[1] + stepX/2, stepX))
        .tickFormat(Utils.getDecimalFormatter(this.decimalsX));

    let axisY = d3.axisLeft(this.getTransformY())
        .tickValues(d3.range(wdY[0], wdY[1] + stepY/2, stepY))
        .tickFormat(Utils.getDecimalFormatter(this.decimalsY));

    this.axisContainer.select('g.vi-crossplot-axis-x-ticks')
        .call(axisX)
        .style('transform', 'translateY(' + vpY[0] + 'px)');

    this.axisContainer.select('g.vi-crossplot-axis-y-ticks')
        .call(axisY)
        .style('transform', 'translateX(' + vpX[0] + 'px)');

    if (!this.curveZ) return;

    let wdZ = this.getWindowZ();
    let stepZ = (wdZ[1]-wdZ[0]) / (this.numColor || 1);

    let transformZ = d3.scaleLinear()
        .domain(wdZ)
        .range(vpY);

    let axisZ = d3.axisRight(transformZ)
        .tickValues(d3.range(wdZ[0], wdZ[1] + stepZ/2, stepZ))
        .tickFormat(Utils.getDecimalFormatter(this.decimalsZ));

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

    let stepX = (wdX[1]-wdX[0]) / (this.majorX*this.minorX || 1);
    let stepY = (wdY[1]-wdY[0]) / (this.majorY*this.minorY || 1);

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
                return (!self.minorX || i % self.minorX == 0) ? 'vi-major-tick' : 'vi-minor-tick';
            });

    this.axisContainer.select('g.vi-crossplot-axis-y-grids')
        .call(gridY)
        .style('transform', 'translateX(' + vpX[0] + 'px)')
        .selectAll('.tick line')
            .attr('class', function(d, i) {
                return (!self.minorY || i % self.minorY == 0) ? 'vi-major-tick' : 'vi-minor-tick';
            });
}

Crossplot.prototype.updateAxisZRects = function() {
    let rectGroup = this.axisContainer.select('.vi-crossplot-axis-z-rects');
    if (!this.curveZ) {
        rectGroup.style('display', 'none');
        return;
    }

    rectGroup.style('display', 'block');

    let vpY = this.getViewportY();
    let stepY = (vpY[1]-vpY[0]) / (this.numColor || 1);
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
        .text(this.labelX);
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
        .text(this.labelY);
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

Crossplot.prototype.plotSymbol = function() {
    let transformX = this.getTransformX();
    let transformY = this.getTransformY();
    let transformZ = this.getTransformZ();

    let ctx = this.ctx;
    let helper = new CanvasHelper(ctx, {
        strokeStyle: 'none',
        fillStyle: this.pointColor,
        size: this.pointSize
    });

    let plotFunc = helper[Utils.lowercase(this.pointSymbol)];
    if (typeof plotFunc != 'function') return;

    let self = this;
    this.data.forEach(function(d) {
        if (self.curveZ) {
            helper.fillStyle = transformZ(d.z);
        }
        plotFunc.call(helper, transformX(d.x), transformY(d.y));
    });
}

Crossplot.prototype.prepareData = function() {
    this.data = [];
    if (!this.curveX || !this.curveY || !this.curveX.data || !this.curveY.data)
        return;

    let mapX = {};
    this.curveX.data.forEach(function(d) {
        mapX[d.y] = d.x;
    });

    let mapZ = {};
    if (this.curveZ && this.curveZ.data) {
        this.curveZ.data.forEach(function(d) {
            mapZ[d.y] = d.x;
        })
    }

    let self = this;
    this.curveY.data.forEach(function(d) {
        if (self.topDepth != null && d.y < self.topDepth) return;
        if (self.bottomDepth != null & d.y > self.bottomDepth) return;
        if (d.y != null && mapX[d.y] != null) {
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
    if (this.numColor <=  DEFAULT_COLORS.length) {
        this.colors = DEFAULT_COLORS.slice(0, this.numColor);
        return;
    }

    let colors = DEFAULT_COLORS.map(function(c) {
        return d3.color(c).toString();
    });

    let i = colors.length;
    let color;
    while (i < this.numColor) {
        do {
            color = d3.rgb(rand(255), rand(255), rand(255)).toString();
        }
        while (colors.indexOf(color) >= 0);
        colors.push(color);
        i += 1;
    }
    this.colors = colors;
}
