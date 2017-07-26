let Utils = require('./visualize-utils');
let Drawing = require('./visualize-drawing');

module.exports = Shading;

Utils.extend(Drawing, Shading);

/**
 * Represents a Shading
 * @constructor
 * @param {Object} config - Configurations of new shading
 * @param {String} [config.name] - Name of new shading
 * @param {String} [config.fillStyle] - Canvas fill style
 * @param {Number} [config.refX] - x coordiate of reference line for custom shading
 */
function Shading(config) {
    Drawing.call(this);
    if (typeof config != 'object') config = {};

    this.fillStyle = config.fillStyle || 'green';
    this.name = config.name || 'Noname';
    this.refX = config.refX;

    this.refLineWidth = 2;
    this.refLineColor = '#3e3e3e';
}

/**
 * Get y extent of shading
 * @returns {Array}
 */
Shading.prototype.getExtentY = function() {
    let ys = [];
    if (this.leftCurve) ys = ys.concat(this.leftCurve.getExtentY());
    if (this.rightCurve) ys = ys.concat(this.rightCurve.getExtentY());
    return [d3.min(ys), d3.max(ys)];
}

/**
 * Initialize DOM elements
 * @param {Object} plotContainer - The DOM element to contain the shading
 * @param {Object} leftCurve - Left curve, null if drawing left shading
 * @param {Object} rightCurve - Right curve, null if drawing right shading
 */
Shading.prototype.init = function(plotContainer, leftCurve, rightCurve) {
    this.leftCurve = leftCurve;
    this.rightCurve = rightCurve;
    this.clientRect = plotContainer.node().getBoundingClientRect();

    this.canvas = plotContainer.append('canvas')
        .attr('width', this.clientRect.width)
        .attr('height', this.clientRect.height);

    this.ctx = this.canvas.node().getContext('2d');
    this.svg = plotContainer.select('svg');

    if (this.refX != null) {
        this.refLine = this.svg.append('line').attr('class', 'ref-line')
            .attr('x1', this.refX)
            .attr('x2', this.refX)
            .attr('y1', 0)
            .attr('y2', this.clientRect.height)
            .attr('style', 'stroke:' + this.refLineColor +'; stroke-width:' + this.refLineWidth)
            .raise();
    }
    return this;
}

/**
 * Destroy DOM element of the shading
 */
Shading.prototype.destroy = function() {
    Drawing.prototype.destroy.call(this);
    if (this.refLine) this.refLine.remove();
}

/**
 * Adjust shading when bounding rectangle changes
 * @param {Object} rect - The bounding rectangle
 */
Shading.prototype.adjustSize = function(rect) {
    if (this.refLine) {
        this.refX = rect.width / this.clientRect.width * this.refX;
        this.refLine
            .attr('x1', this.refX)
            .attr('x2', this.refX);
    }
    Drawing.prototype.adjustSize.call(this, rect);
    return this;
}

/**
 * Check if the shading near a point
 * @param {Number} x - x coordinate of the point
 * @param {Number} y - y coordinate of the point
 * @returns {Boolean}
 */
Shading.prototype.nearPoint = function(x, y) {
    return Drawing.prototype.nearPoint.call(this, x, y, 1);
}

/**
 * Get all colors used by the shading
 * @returns {Array}
 */
Shading.prototype.getAllColors = function() {
    let colors = [];
    if (d3.color(this.fillStyle))
        colors.push(d3.color(this.fillStyle).toString());
    return colors;
}

/**
 * Actually draw the shading
 * @param {Array} domainY
 * @param {Array} rangeX
 * @param {Array} rangeY
 * @param {Boolean} highlight
 */
Shading.prototype.doPlot = function(domainY, rangeX, rangeY, highlight) {
    if (this.refX != null) drawRefLine(this);

    let leftData = prepareData(this.leftCurve, domainY, rangeX, rangeY);
    let rightData = prepareData(this.rightCurve, domainY, rangeX, rangeY).reverse();

    if (leftData.length == 0 && rightData.length == 0) return;

    if (leftData.length == 0) {
        let x = this.refX == null ? rangeX[0] : this.refX;
        leftData = [
            {x: x, y: rangeY[0]},
            {x: x, y: rangeY[1]}
        ];
    }

    if (rightData.length == 0) {
        let x = this.refX == null ? rangeX[1] : this.refX;
        rightData = [
            {x: x, y: rangeY[1]},
            {x: x, y: rangeY[0]}
        ];
    }

    let plotSamples = leftData.concat(rightData);
    let ctx = this.ctx;

    ctx.clearRect(0, 0, this.clientRect.width, this.clientRect.height);
    ctx.fillStyle = this.fillStyle;
    ctx.lineWidth = 0;

    ctx.beginPath();
    ctx.moveTo(plotSamples[0].x, plotSamples[0].y);
    plotSamples.forEach(function(item) {
        ctx.lineTo(item.x, item.y);
    });
    ctx.fill();
    return this;
}

/**
 * Register drag event on ref line
 * @param {Function} cb - Callback function
 */
Shading.prototype.onRefLineDrag = function(cb) {
    if (this.refX != null)
        this.refLine.call(d3.drag().on('drag', cb));
    return this;
}


function prepareData(curve, domainY, rangeX, rangeY) {
    if (!curve) return [];

    let scaleX = curve.getScaleFunc();
    let transformX = scaleX().domain(curve.getWindowX()).range(rangeX);
    let transformY = d3.scaleLinear().domain(domainY).range(rangeY);
    let data = curve.data
        .filter(function(item) {
            return Utils.isWithinYRange(item, domainY);
        })
        .map(function(item) {
            return {
                x: transformX(item.x),
                y: transformY(item.y)
            }
        });
    return data.slice();
}

function drawRefLine(shading) {
    shading.refLine.attr('x1', shading.refX)
        .attr('x2', shading.refX)
        .attr('y1', 0)
        .attr('y2', shading.clientRect.height)
        .attr('stroke', shading.refLineColor)
        .raise();
}
