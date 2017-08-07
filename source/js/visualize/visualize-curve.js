let Utils = require('./visualize-utils');
let Drawing = require('./visualize-drawing');
let CanvasHelper = require('./visualize-canvas-helper');

module.exports = Curve;

Utils.extend(Drawing, Curve);

/**
 * Represents a Curve
 * @constructor
 * @param {Object} config - Configurations of new curve
 * @param {Number} [config.id] - The id of this line(curve) in backend (idLine field)
 * @param {Number} [config.idCurve] - The id of this line(curve) in backend (idCurve field)
 * @param {Number} [config.idDataset] - The id of the dataset in backend (idDataset field)
 * @param {String} [config.name] - Name of new curve
 * @param {Array} [config.data] - Data containing x, y coordinates or the curve
 * @param {String} [config.unit] - Unit of data
 * @param {Number} [config.minX] - Mininum x value to show
 * @param {Number} [config.maxX] - Maximum x value to show
 * @param {Number} [config.minY] - Mininum y value to show
 * @param {Number} [config.maxY] - Maximum y value to show
 * @param {String} [config.scale] - Scale type (Linear or Logarithmic)
 * @param {String} [config.alias] - Text to show on header
 * @param {Boolean} [config.showHeader] - Flag to show or hide header
 * @param {String} [config.blockPosition] - Display curve as blocks with the data point at specified position (start, middle, end, none)
 * @param {Object} [config.line] - Configuration to draw line
 * @param {String} [config.line.color] - Line color
 * @param {Number} [config.line.width] - Line width
 * @param {Array} [config.line.dash] - Line dash style
 * @param {Object} [config.symbol] - Configuration to draw symbol
 * @param {String} [config.symbol.style] - Symbol style (circle, square, cross, diamond, plus, star)
 * @param {String} [config.symbol.fillStyle] - Symbol fill style
 * @param {String} [config.symbol.strokeStyle] - Symbol stroke style
 * @param {Number} [config.symbol.lineWidth] - Symbol line width
 * @param {Array} [config.symbol.lineDash] - Symbol line dash
 * @param {Number} [config.symbol.size] - Symbol size
 */
function Curve(config) {
    Drawing.call(this, config);
    if (typeof config != 'object') config = {};

    this.id = config.id;
    this.idCurve = config.idCurve;
    this.idDataset = config.idDataset;
    this.name = config.name || 'Noname';
    this.unit = config.unit || 'm3';

    this.minX = config.minX;
    this.maxX = config.maxX;
    this.minY = config.minY;
    this.maxY = config.maxY;

    this.scale = config.scale || 'Linear';
    this.alias = config.alias || this.name;
    this.line = config.line;
    this.symbol = config.symbol;
    this.showHeader = (config.showHeader == null) ? true : config.showHeader;

    this.blockPosition = config.blockPosition || 'none';

    this.yStep = config.yStep || 1;
    this.offsetY = config.offsetY || 0;

    this.raw_data = config.data || [];
    this.data = Utils.parseData(this.raw_data);
    this.data = Utils.trimData(this.data);
    // this.data = Utils.interpolateData(this.data);

    let self = this;
    this.data = this.data.map(function(d) {
        return {
            x: d.x,
            y: d.y * self.yStep + self.offsetY
        };
    });

    if (this.minX == null || this.maxX == null)
        this.autoScaleX();

    if (this.minY == null || this.maxY == null) {
        let extentY = this.getExtentY();
        this.minY = extentY[0];
        this.maxY = extentY[1];
    }
}

/**
 * @returns {Object} Properties of the curve
 */
Curve.prototype.getProperties = function() {
    let self = this;
    function getDisplayMode() {
        if (self.line && self.symbol) return 'Both';
        if (self.line && !self.symbol) return 'Line';
        if (!self.line && self.symbol) return 'Symbol';
        return 'None';
    }

    let line = this.line || {};
    let symbol = this.symbol || {};
    return {
        idLine: this.id,
        idCurve: this.idCurve,
        idDataset: this.idDataset,
        alias: this.alias,
        name: this.name,
        showHeader: this.showHeader,
        showDataset: false,
        minValue: this.minX,
        maxValue: this.maxX,
        autoValueScale: false,
        diplayMode: getDisplayMode(),
        wrapMode: 'None',
        blockPosition: Utils.capitalize(this.blockPosition),
        ignoreMissingValues: false,
        displayType: Utils.capitalize(this.scale),
        displayAs: 'Normal',
        lineStyle: line.dash,
        lineWidth: line.width,
        lineColor: line.color,
        symbolName: Utils.capitalize(symbol.style),
        symbolSize: symbol.size,
        symbolStrokeStyle: symbol.strokeStyle,
        symbolFillStyle: symbol.fillStyle,
        symbolLineWidth: symbol.lineWidth,
        symbolLineDash: symbol.lineDash
    }
}

/**
 * @param {Object} props - New properties for the curve
 */
Curve.prototype.setProperties = function(props) {
    let self = this;

    this.id = props.idLine;
    this.idCurve = props.idCurve;
    this.idDataset = props.idDataset;
    this.alias = props.alias;
    this.name = props.name;
    this.showHeader = props.showHeader;
    this.minX = props.minValue;
    this.maxX = props.maxValue;
    this.scale = Utils.capitalize(props.displayType);
    this.blockPosition = Utils.lowercase(props.blockPosition);

    if (props.displayMode == 'Both' || props.displayMode == 'Line') {
        this.line = {
            dash: eval(props.lineStyle),
            width: parseInt(props.lineWidth),
            color: Utils.convertColorToRGB(props.lineColor)
        }
        if (props.displayMode == 'Line') this.symbol = null;
    }

    if (props.displayMode == 'Both' || props.displayMode == 'Symbol') {
        this.symbol = {
            style: Utils.lowercase(props.symbolName),
            size: parseInt(props.symbolSize),
            strokeStyle: Utils.convertColorToRGB(props.symbolStrokeStyle),
            fillStyle: Utils.convertColorToRGB(props.symbolFillStyle),
            lineWidth: parseInt(props.symbolLineWidth),
            lineDash: eval(props.symbolLineDash)
        }
        if (props.displayMode == 'Symbol') this.line = null;
    }
}

/**
 * Get x window of curve
 * @returns {Array} Range of x values to show
 */
Curve.prototype.getWindowX = function() {
    return [this.minX, this.maxX];
}

/**
 * Get y window of curve
 * @returns {Array} Range of y values to show
 */
Curve.prototype.getWindowY = function() {
    return [this.minY, this.maxY];
}

/**
 * Get x extent of curve
 * @returns {Array} Extent of y values
 */
Curve.prototype.getExtentX = function() {
    let xs = this.data.map(function(d) {
        return d.x;
    })
    return [d3.min(xs), d3.max(xs)];
}

/**
 * Get y extent of curve
 * @returns {Array} Extent of y values
 */
Curve.prototype.getExtentY = function() {
    let ys = this.data.map(function(d) {
        return d.y;
    })
    return [d3.min(ys), d3.max(ys)];
}

/**
 * Get scale function of curve
 * @returns {Function} d3 scale function
 */
Curve.prototype.getScaleFunc = function() {
    return {
        'Linear': d3.scaleLinear,
        'Logarithmic': d3.scaleLog
    }[this.scale];
}

/**
 * Auto set x window by x extent
 * @param {Number} granularity - level of detail to round
 */
Curve.prototype.autoScaleX = function(granularity) {
    if (!granularity) granularity = this.yStep;
    let extentX = this.getExtentX();
    this.minX = Utils.roundDown(extentX[0], granularity);
    this.maxX = Utils.roundUp(extentX[1], granularity);
}

/**
 * Initialize DOM elements and bind data for the curve
 * @param {Object} plotContainer - The DOM element to contain the curve
 * @param {Array} data - Array of objects containing x, y coordinates
 */
Curve.prototype.init = function(plotContainer) {
    this.root = plotContainer;
    let rect = plotContainer
        .node()
        .getBoundingClientRect();

    this.canvas = plotContainer.append('canvas')
        .attr('class', 'vi-track-drawing')
        .style('cursor', 'crosshair')
        .style('position', 'absolute');

    this.adjustSize(rect);

    this.ctx = this.canvas.node().getContext('2d');
    return this;
}

/**
 * Check if the curve near a point
 * @param {Number} x - x coordinate of the point
 * @param {Number} y - y coordinate of the point
 * @returns {Boolean}
 */
Curve.prototype.nearPoint = function(x, y) {
    return Drawing.prototype.nearPoint.call(this, x, y, 4);
}

/**
 * Get all colors used by the curve
 * @returns {Array}
 */
Curve.prototype.getAllColors = function() {
    let colors = [];
    if (this.line && d3.color(this.line.color))
        colors.push(d3.color(this.line.color).toString());
    if (this.symbol && d3.color(this.symbol.strokeStyle))
        colors.push(d3.color(this.symbol.strokeStyle).toString());
    if (this.symbol && d3.color(this.symbol.fillStyle))
        colors.push(d3.color(this.symbol.fillStyle).toString());
    return colors;
}

/**
 * Actually draw the curve
 * @param {Boolean} highlight
 */
Curve.prototype.doPlot = function(highlight) {
    let self = this;
    let rect = this.root.node().getBoundingClientRect();
    this.adjustSize(rect);
    this.updateHeader();

    let windowX = this.getWindowX();
    let windowY = this.getWindowY();

    let scaleFunc = this.getScaleFunc();
    let transformX = scaleFunc()
        .domain(windowX)
        .range([0, rect.width]);

    let transformY = d3.scaleLinear()
        .domain(windowY)
        .range([0, rect.height]);

    let plotSamples = this.data.filter(function(item) {
        return Utils.isWithinYRange(item, windowY);
    });
    if (plotSamples.length == 0) return;
    this.ctx.clearRect(0, 0, rect.width, rect.height);

    Utils.clusterData(plotSamples).forEach(function(clustered) {
        let data = clustered.map(function(s) {
            return {
                x: transformX(s.x),
                y: transformY(s.y)
            }
        });

        if (self.line)
            plotLine(self, data, highlight);
        if (self.symbol)
            plotSymbol(self, data, highlight);
    });

    return this;
}

Curve.prototype.updateHeader = function() {
    if (!this.header) return;

    let self = this;
    this.header
        .style('display', this.showHeader ? 'block' : 'none')
        .select('.vi-curve-name')
        .text(this.alias);

    this.header
        .select('.vi-curve-data')
        .selectAll('div')
        .each(function(d, i) {
            let elem = d3.select(this);
            if (i == 0) elem.text(self.minX);
            if (i == 1) elem.text(self.unit);
            if (i == 2) elem.text(self.maxX);
        })
}

Curve.prototype.calculateDataForBlockPosition = function(originData) {
    let self = this;
    let data = [];
    originData.forEach(function(d, i) {
        data.push(d);
        if (i == originData.length - 1) return;
        if (d.x == null || originData[i+1].x == null) return;

        switch (Utils.lowercase(self.blockPosition)) {
            case 'start':
                data.push({
                    x: d.x,
                    y: originData[i+1].y
                })
                return;
            case 'middle':
                data.push({
                    x: d.x,
                    y: (d.y + originData[i+1].y) / 2
                });
                data.push({
                    x: originData[i+1].x,
                    y: (d.y + originData[i+1].y) / 2
                })
                return;
            case 'end':
                data.push({
                    x: originData[i+1].x,
                    y: d.y
                });
                return;
        }
    });

    return data;
}

function plotLine(curve, data, highlight) {
    if (typeof curve.line != 'object') return;
    let ctx = curve.ctx;
    let line = curve.line;
    ctx.save();

    ctx.strokeStyle = highlight ? 'red' : (line.color || 'blue');
    ctx.lineWidth = line.width || '1';
    if (line.dash) ctx.setLineDash(line.dash);

    let samples = curve.calculateDataForBlockPosition(data);
    ctx.beginPath();
    ctx.moveTo(samples[0].x, samples[0].y);
    samples.forEach(function(d) {
        ctx.lineTo(d.x, d.y);
    });
    ctx.stroke();

    ctx.restore();
}

function plotSymbol(curve, data, highlight) {
    if (typeof curve.symbol != 'object') return;
    let ctx = curve.ctx;
    let symbol = curve.symbol;

    let helper = new CanvasHelper(ctx, {
        strokeStyle: highlight ? 'red' : symbol.strokeStyle,
        fillStyle: symbol.fillStyle,
        lineWidth: symbol.lineWidth,
        lineDash: symbol.lineDash,
        size: symbol.size
    })

    let plotFunc = helper[symbol.style.toLowerCase()];
    if (typeof plotFunc != 'function') return;

    data.forEach(function(d) {
        plotFunc.call(helper, d.x, d.y);
    });
}
