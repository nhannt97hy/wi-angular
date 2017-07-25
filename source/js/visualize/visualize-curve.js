let Utils = require('./visualize-utils');
let Drawing = require('./visualize-drawing');

module.exports = Curve;

Utils.extend(Drawing, Curve);

/**
 * Represents a Curve
 * @constructor
 * @param {Object} config - Configurations of new curve
 * @param {String} [config.name] - Name of new curve
 * @param {String} [config.unit] - Unit of data
 * @param {Number} [config.minX] - Mininum x value to show
 * @param {Number} [config.maxX] - Maximum x value to show
 * @param {String} [config.color] - CSS color of new curve
 * @param {String} [config.scale] - Scale type (linear or log)
 */
function Curve(config) {
    Drawing.call(this);

    this.color = config.color || 'blue';
    this.name = config.name || 'Noname';
    this.unit = config.unit || 'm3';
    this.minX = config.minX || null;
    this.maxX = config.maxX || null;
    this.scale = config.scale || 'linear';
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
        'linear': d3.scaleLinear,
        'log': d3.scaleLog
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
 * Actually draw the curve
 * @param {Array} domainY
 * @param {Array} rangeX
 * @param {Array} rangeY
 * @param {Object} config
 * @param {Number} [config.lineWidth] - Width in pixel of the line. Default: 1
 * @todos Pending
 */
Curve.prototype.doPlot = function(domainY, rangeX, rangeY, config) {
    let scaleFunc = this.getScaleFunc();
    let transformX = scaleFunc().domain([this.minX, this.maxX]).range(rangeX);
    let transformY = d3.scaleLinear().domain(domainY).range(rangeY);
    let lineWidth = config.lineWidth || 1;

    let plotSamples = this.data.filter(function(item) {
        return Utils.isWithinYRange(item, domainY);
    });
    if (plotSamples.length == 0) return;

    let ctx = this.ctx;

    ctx.clearRect(0, 0, this.clientRect.width, this.clientRect.height);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(transformX(plotSamples[0].x), transformY(plotSamples[0].y));
    plotSamples.forEach(function(item) {
        ctx.lineTo(transformX(item.x), transformY(item.y));
    });
    ctx.stroke();
    return this;
}

