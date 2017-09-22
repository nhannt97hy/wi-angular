let Utils = require('./visualize-utils');

module.exports = Drawing;

/**
 * Represent a general drawing
 * @constructor
 */
function Drawing(config) {
    if (typeof config != 'object') config = {};
    this.minY = config.minY;
    this.maxY = config.maxY;
    this.type = Utils.pascalCaseToLowerDash(this.constructor.name);
}

/**
 * Check if class of this instance is Curve
 * @returns {Boolean}
 */
Drawing.prototype.isCurve = function() {
    return this.constructor.name == 'Curve';
}

/**
 * Check if class of this instance is Shading
 * @returns {Boolean}
 */
Drawing.prototype.isShading = function() {
    return this.constructor.name == 'Shading';
}

/**
 * Check if class of this instance is Zone
 * @returns {Boolean}
 */
Drawing.prototype.isZone = function() {
    return this.constructor.name == 'Zone';
}

/**
 * Check if class of this instance is ViImage
 * @returns {Boolean}
 */
Drawing.prototype.isImage = function() {
    return this.constructor.name == 'ViImage';
}

/**
 * Check if class of this instance is Marker
 * @returns {Boolean}
 */
Drawing.prototype.isMarker = function() {
    return this.constructor.name == 'Marker';
}

/**
 * Check if the drawing near a point
 * @param {Number} x - x coordinate of the point
 * @param {Number} y - y coordinate of the point
 * @param {Number} e - error in pixel
 * @returns {Boolean}
 */
Drawing.prototype.nearPoint = function(x, y, e) {
    if (!this.ctx) return false;

    e = e <= 0 ? 1 : e;
    let imgData = this.ctx.getImageData(x-e, y-e, e*2, e*2);
    let r, g, b, a;
    for (let i = 0; i < imgData.width * imgData.height; i ++) {
        r = imgData.data[i * 4];
        g = imgData.data[i * 4 + 1];
        b = imgData.data[i * 4 + 2];
        a = imgData.data[i * 4 + 3];

        if (r > 0 || g > 0 || b > 0 || a > 0)
            return true;
    }
    return false;
}

/**
 * Re-insert the drawing to the end of its parent
 */
Drawing.prototype.raise = function() {
    if (this.canvas) this.canvas.raise();
    if (this.svgGroup) this.svgGroup.raise();
}

/**
 * Re-insert the drawing to the beginning of its parent
 */
Drawing.prototype.lower = function() {
    if (this.canvas) this.canvas.lower();
    if (this.svgGroup) this.svgGroup.lower();
}

/**
 * Adjust drawing size when bounding rectangle changes
 */
Drawing.prototype.adjustSize = function() {
    let rect = this.root.node().getBoundingClientRect();
    if (this.canvas) {
        this.canvas
            .attr('width', rect.width)
            .attr('height', rect.height);
    }
}

/**
 * Destroy DOM elements of the drawing
 */
Drawing.prototype.destroy = function() {
    if (this.canvas) this.canvas.remove();
    if (this.svgGroup) this.svgGroup.remove();
    if (this.header) this.header.remove();
}

/**
 * Get y window of the drawing
 * @returns {Array} Range of actual y values to show
 */
Drawing.prototype.getWindowY = function() {
    return [this.minY, this.maxY];
}

/**
 * Get x viewport of the drawing
 * @return {Array} Range of transformed x values to show
 */
Drawing.prototype.getViewportX = function() {
    return [0, this.root.node().clientWidth];
}

/**
 * Get y viewport of the drawing
 * @return {Array} Range of transformed y values to show
 */
Drawing.prototype.getViewportY = function() {
    return [0, this.root.node().clientHeight];
}

/**
 * Get transform function for y coordinate
 */
Drawing.prototype.getTransformY = function() {
    let windowY = this.getWindowY();
    let viewportY = this.getViewportY();
    return d3.scaleLinear()
        .domain(windowY)
        .range(viewportY);
}

/**
 * Initialize DOM elements
 * @param {Object} plotContainer - The DOM element to contain the curve
 */
Drawing.prototype.init = function(plotContainer) {
    this.root = (typeof plotContainer.node == 'function') ? plotContainer : d3.select(plotContainer);
}

Drawing.prototype.doPlot = function(highlight) {
    this.adjustSize();
}

Drawing.prototype.updateHeader = function() {
    if (!this.header) return;
    this.header.select('.vi-drawing-header-name')
        .text(this.name);
}
