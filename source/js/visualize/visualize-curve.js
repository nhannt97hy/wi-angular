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
 * @param {String} [config.name] - Name of new curve
 * @param {String} [config.unit] - Unit of data
 * @param {Number} [config.minX] - Mininum x value to show
 * @param {Number} [config.maxX] - Maximum x value to show
 * @param {String} [config.scale] - Scale type (Linear or Logarithmic)
 * @param {String} [config.alias] - Text to show on header
 * @param {Boolean} [config.showHeader] - Flag to show or hide header
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
    Drawing.call(this);
    if (typeof config != 'object') config = {};

    this.id = config.id;
    this.idDataset = config.idDataset;
    this.name = config.name || 'Noname';
    this.unit = config.unit || 'm3';
    this.minX = config.minX;
    this.maxX = config.maxX;
    this.scale = config.scale || 'Linear';
    this.alias = config.alias || this.name;
    this.line = config.line;
    this.symbol = config.symbol;
    this.showHeader = (config.showHeader == null) || true;
}

/**
 * Get x window of curve
 * @returns {Array} Range of x values to show
 */
Curve.prototype.getWindowX = function() {
    return [this.minX, this.maxX];
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
    if (!granularity) granularity = 1;
    let extentX = this.getExtentX();
    this.minX = Utils.roundDown(extentX[0], granularity);
    this.maxX = Utils.roundUp(extentX[1], granularity);
}

/**
 * Initialize DOM elements and bind data for the curve
 * @param {Object} plotContainer - The DOM element to contain the curve
 * @param {Array} data - Array of objects containing x, y coordinates
 */
Curve.prototype.init = function(plotContainer, data) {
    Utils.parseData(data);
    this.data = Utils.trimData(data);
    Utils.interpolateData(this.data);

    if (this.minX == null || this.maxX == null) this.autoScaleX();

    this.clientRect = plotContainer.node().getBoundingClientRect();

    this.canvas = plotContainer.append('canvas')
        .attr('width', this.clientRect.width)
        .attr('height', this.clientRect.height);

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
 * @param {Array} domainY
 * @param {Array} rangeX
 * @param {Array} rangeY
 * @param {Boolean} highlight
 */
Curve.prototype.doPlot = function(domainY, rangeX, rangeY, highlight) {
    let scaleFunc = this.getScaleFunc();
    let transformX = scaleFunc().domain([this.minX, this.maxX]).range(rangeX);
    let transformY = d3.scaleLinear().domain(domainY).range(rangeY);

    let plotSamples = this.data.filter(function(item) {
        return Utils.isWithinYRange(item, domainY);
    });
    if (plotSamples.length == 0) return;

    let data = plotSamples.map(function(s) {
        return {
            x: transformX(s.x),
            y: transformY(s.y)
        }
    })

    redrawHeader(this);
    this.ctx.clearRect(0, 0, this.clientRect.width, this.clientRect.height);

    if (this.line)
        plotLine(this, data, highlight);
    if (this.symbol)
        plotSymbol(this, data, highlight);

    return this;
}

function redrawHeader(curve) {
    if (!curve.header) return;
    if (curve.showHeader) {
        let header = curve.header;
        header
            .style('display', 'block')
            .select('.data-header')
            .text(curve.alias);
        header
            .select('.unit-header')
            .selectAll('div')
            .each(function(d, i) {
                let elem = d3.select(this);
                if (i == 0) elem.text(curve.minX);
                if (i == 1) elem.text(curve.unit);
                if (i == 2) elem.text(curve.maxX);
            })
    }
    else {
        curve.header
            .style('display', 'none');
    }
}

function plotLine(curve, data, highlight) {
    if (typeof curve.line != 'object') return;
    let ctx = curve.ctx;
    let line = curve.line;
    ctx.save();

    ctx.strokeStyle = highlight ? 'red' : (line.color || 'blue');
    ctx.lineWidth = line.width || '1';
    if (line.dash) ctx.setLineDash(line.dash);

    ctx.beginPath();
    ctx.moveTo(data[0].x, data[0].y);
    data.forEach(function(d) {
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
        fillStyle: highlight ? 'red' : symbol.fillStyle,
        lineWidth: symbol.lineWidth,
        lineDash: symbol.lineDash,
        size: symbol.size
    })

    let plotFunc = helper[symbol.style];
    if (typeof plotFunc != 'function') return;

    data.forEach(function(d) {
        plotFunc.call(helper, d.x, d.y);
    });
}
