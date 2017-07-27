let Utils = require('./visualize-utils');
let Drawing = require('./visualize-drawing');

module.exports = Shading;

Utils.extend(Drawing, Shading);

/**
 * Represents a Shading
 * @constructor
 * @param {Object} config - Configurations of new shading
 * @param {String} [config.name] - Name of new shading
 * @param {Number} [config.refX] - x coordiate of reference line for custom shading
 * @param {Number} [config.leftX] - Fix value of left curve
 * @param {Number} [config.rightX] - Fix value of right curve
 * @param {Object} [config.fill] - Configurations of fill style (contain only one key: color, pattern, or gradient)
 * @param {String} [config.fill.color]
 * @param {Object} [config.fill.pattern]
 * @param {String} [config.fill.pattern.name]
 * @param {String} [config.fill.pattern.foreground]
 * @param {String} [config.fill.pattern.background]
 * @param {Object} [config.fill.gradient]
 * @param {Number} [config.fill.gradient.startX]
 * @param {Number} [config.fill.gradient.endX]
 * @param {String} [config.fill.gradient.startColor]
 * @param {String} [config.fill.gradient.endColor]
 * @param {Boolean} [config.isNegPosFilling] - Indicate whether to draw with negative and positive styles
 * @param {Object} [config.negativeFill] - Configurations of fill style for negative values
 * @param {Object} [config.positiveFill] - Configurations of fill style for positive values
 * @param {Number} [config.refLineWidth] - Width in pixel of reference line
 * @param {String} [config.refLineColor] - Color of reference line
 */
function Shading(config) {
    Drawing.call(this);
    if (typeof config != 'object') config = {};

    this.fill = config.fill;
    this.negativeFill = config.negativeFill;
    this.positiveFill = config.positiveFill;
    this.isNegPosFilling = config.isNegPosFilling;

    this.name = config.name || 'Noname';
    this.refX = config.refX;
    this.leftX = config.leftX;
    this.rightX = config.rightX;

    this.refLineWidth = config.refLineWidth || 2;
    this.refLineColor = config.refLineColor || '#3e3e3e';
    this.showRefLine = config.showRefLine;

    if (this.showRefLine == null && this.refX != null) {
        this.showRefLine = true;
    }

    this.vpX = {
        left: null,
        right: null,
        ref: null
    };
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
    let self = this;

    this.leftCurve = leftCurve;
    this.rightCurve = rightCurve;
    this.selectedCurve = this.leftCurve || this.rightCurve;

    this.clientRect = plotContainer.node().getBoundingClientRect();

    this.canvas = plotContainer.append('canvas')
        .attr('width', this.clientRect.width)
        .attr('height', this.clientRect.height);

    this.ctx = this.canvas.node().getContext('2d');
    this.svg = plotContainer.select('svg');

    this.refLine = this.svg
        .append('line')
        .attr('class', 'ref-line')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', 0)
        .attr('y2', this.clientRect.height);

    return this;
}

/**
 * Destroy DOM element of the shading
 */
Shading.prototype.destroy = function() {
    Drawing.prototype.destroy.call(this);
    this.refLine.remove();
}

/**
 * Adjust shading when bounding rectangle changes
 * @param {Object} rect - The bounding rectangle
 */
Shading.prototype.adjustSize = function(rect) {
    let vpRefX = this.getTransformX()(this.refX);
    this.refLine
        .attr('x1', this.rangeX[0] + vpRefX)
        .attr('x2', this.rangeX[0] + vpRefX);
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
    if (!this.leftCurve && !this.rightCurve) return;
    let leftData = this.prepareData(this.leftCurve, domainY, rangeX, rangeY);
    let rightData = this.prepareData(this.rightCurve, domainY, rangeX, rangeY).reverse();

    let vpRefX = this.vpX.ref;
    let vpLeftX = this.vpX.left;
    let vpRightX = this.vpX.right;

    leftData = (vpLeftX == null && leftData.length > 0) ? leftData : [
            {x: vpLeftX == null ? vpRefX : vpLeftX, y: rangeY[0]},
            {x: vpLeftX == null ? vpRefX : vpLeftX, y: rangeY[1]}
        ];
    rightData = (vpRightX == null && rightData.length > 0) ? rightData : [
            {x: vpRightX == null ? vpRefX : vpRightX, y: rangeY[1]},
            {x: vpRightX == null ? vpRefX : vpRightX, y: rangeY[0]}
        ];
    let plotSamples = leftData.concat(rightData);
    if (plotSamples.length == 0) return;

    let ctx = this.ctx;
    let fill = Utils.createFillStyle(this.ctx, this.fill);
    let posFill, negFill;

    if (this.isNegPosFilling) {
        posFill = Utils.createFillStyle(this.ctx, this.positiveFill);
        negFill = Utils.createFillStyle(this.ctx, this.negativeFill);
    }
    else {
        posFill = negFill = fill;
    }

    ctx.clearRect(0, 0, this.clientRect.width, this.clientRect.height);
    ctx.lineWidth = 0;

    // Draw negative regions
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = negFill;
    drawCurveLine(ctx, plotSamples);
    ctx.clip();
    ctx.fillRect(rangeX[0], rangeY[0], vpRefX, rangeY[1] - rangeY[0]);
    ctx.restore();

    // Draw postive regions
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = posFill;
    drawCurveLine(ctx, plotSamples);
    ctx.clip();
    ctx.fillRect(rangeX[0] + vpRefX, rangeY[0], rangeX[1] - vpRefX, rangeY[1] - rangeY[0]);
    ctx.restore();

    drawHeader(this);
    drawRefLine(this);
    return this;
}

/**
 * Register drag event on ref line
 * @param {Function} cb - Callback function
 */
Shading.prototype.onRefLineDrag = function(cb) {
    this.refLine.call(d3.drag().on('drag', cb));
    return this;
}

Shading.prototype.prepareData = function(curve, domainY, rangeX, rangeY) {
    if (!curve) return [];
    this.rangeX = rangeX;
    this.rangeY = rangeY;

    let scaleX = curve.getScaleFunc();
    let transformX = scaleX().domain(curve.getWindowX()).range(rangeX);
    let transformY = d3.scaleLinear().domain(domainY).range(rangeY);

    if (curve == this.selectedCurve) {
        this.vpX.ref = (this.refX == null) ?
            (this.leftCurve && !this.rightCurve ? rangeX[1] : rangeX[0]) :
            transformX(this.refX);
        if (this.refX == null)
            this.refX = this.getTransformX().invert(this.vpX.ref);
    }

    if (curve == this.leftCurve && this.leftX != null)
        this.vpX.left = transformX(this.leftX);

    if (curve == this.rightCurve && this.rightX != null)
        this.vpX.right = transformX(this.rightX);

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

Shading.prototype.getTransformX = function(x) {
    let curve = this.selectedCurve;
    return curve.getScaleFunc()()
        .domain(curve.getWindowX())
        .range(this.rangeX);
}

function drawCurveLine(ctx, data) {
    ctx.moveTo(data[0].x, data[0].y);
    data.forEach(function(item) {
        ctx.lineTo(item.x, item.y);
    });
}

function drawRefLine(shading) {
    shading.refLine
        .attr('x1', shading.rangeX[0] + shading.vpX.ref)
        .attr('x2', shading.rangeX[0] + shading.vpX.ref)
        .attr('y1', 0)
        .attr('y2', shading.clientRect.height)
        .attr('stroke', shading.refLineColor)
        .attr('stroke-width', shading.refLineWidth)
        .style('display', shading.showRefLine ? 'block' : 'none')
        .raise();
}

function drawHeader(shading) {
    let header = shading.header;
    if (!header) return;
    header
        .select('.shading-name-header')
        .text(shading.name);

    let rect = header.node().getBoundingClientRect();
    let width = rect.width -2;
    let height = rect.height -2;
    let hCanvas = header
        .select('canvas')
        .attr('width', width)
        .attr('height', height)

    let hCtx = hCanvas.node().getContext('2d');
    hCtx.save();
    if (shading.isNegPosFilling) {
        hCtx.fillStyle = Utils.createFillStyle(hCtx, shading.negativeFill);
        hCtx.fillRect(0, 0, width / 2, height);
        hCtx.fillStyle = Utils.createFillStyle(hCtx, shading.positiveFill);
        hCtx.fillRect(width / 2, 0, width / 2, height);
    }
    else {
        hCtx.fillStyle = Utils.createFillStyle(hCtx, shading.fill);
        hCtx.fillRect(0, 0, width, height);
    }
    hCtx.restore();
}
