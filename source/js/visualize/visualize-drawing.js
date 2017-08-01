module.exports = Drawing;

/**
 * Represent a general drawing
 * @constructor
 */
function Drawing() {}

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
 * Check if the drawing near a point
 * @param {Number} x - x coordinate of the point
 * @param {Number} y - y coordinate of the point
 * @param {Number} e - error in pixel
 * @returns {Boolean}
 */
Drawing.prototype.nearPoint = function(x, y, e) {
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
    this.canvas.raise();
}

/**
 * Adjust drawing size when bounding rectangle changes
 * @param {Object} rect - The bounding rectangle
 */
Drawing.prototype.adjustSize = function(rect) {
    this.canvas
        .attr('width', rect.width)
        .attr('height', rect.height);
}

/**
 * Destroy DOM elements of the drawing
 */
Drawing.prototype.destroy = function() {
    if (this.canvas) this.canvas.remove();
    if (this.header) this.header.remove();
}
