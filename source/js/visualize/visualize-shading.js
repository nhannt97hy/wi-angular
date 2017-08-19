let Utils = require('./visualize-utils');
let Drawing = require('./visualize-drawing');

module.exports = Shading;

Utils.extend(Drawing, Shading);

/**
 * Represents a Shading
 * @constructor
 * @param {Object} config - Configurations of new shading
 * @param {Number} [config.id] - Id of the shading
 * @param {String} [config.name] - Name of new shading
 * @param {Object} [config.leftCurve] - Left side of the shading, null if plotting left shading
 * @param {Object} [config.rightCurve] - Right side of the shading, null if plotting right shading
 * @param {Object} [config.selectedCurve] - The curve to compare values against
 * @param {Number} [config.refX] - x coordiate of reference line for custom shading
 * @param {Number} [config.leftX] - Fix value of left curve
 * @param {Number} [config.rightX] - Fix value of right curve
 * @param {Number} [config.minY] - Mininum y value to show
 * @param {Number} [config.maxY] - Maximum y value to show
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
 * @param {Boolean} [config.isNegPosFilling] - Indicate whether to plot with negative and positive styles
 * @param {Object} [config.negativeFill] - Configurations of fill style for negative values
 * @param {Object} [config.positiveFill] - Configurations of fill style for positive values
 * @param {Number} [config.refLineWidth] - Width in pixel of reference line
 * @param {String} [config.refLineColor] - Color of reference line
 * @param {Boolean} [config.showRefLine] - Indicate whether to plot reference line
 */
function Shading(config) {
    Drawing.call(this, config);
    if (typeof config != 'object') config = {};

    this.id = config.id;
    this.idTrack = config.idTrack;
    this.name = config.name || 'Noname';

    this.fill = config.fill;
    this.negativeFill = config.negativeFill;
    this.positiveFill = config.positiveFill;
    this.isNegPosFilling = config.isNegPosFilling == null ? false : config.isNegPosFilling;

    this.leftCurve = config.leftCurve;
    this.rightCurve = config.rightCurve;
    this.refX = config.refX;
    this.leftX = config.leftX;
    this.rightX = config.rightX;

    this.refLineWidth = config.refLineWidth || 2;
    this.refLineColor = config.refLineColor || '#3e3e3e';
    this.showRefLine = config.showRefLine == null ? true : config.showRefLine;

    this.vpX = {
        left: null,
        right: null,
        ref: null
    };

    this.leftCurve = config.leftCurve;
    this.rightCurve = config.rightCurve;
    this.selectedCurve = config.selectedCurve || this.leftCurve || this.rightCurve;

    if (this.refX == null){
        this.refX = (this.leftCurve && !this.rightCurve)
            ? this.selectedCurve.maxX
            : this.selectedCurve.minX;
    }
}

Shading.prototype.getProperties = function() {
    let leftCurve = this.leftCurve;
    let rightCurve = this.rightCurve
    let leftX = this.leftX;
    let rightX = this.rightX;
    // Server does not allow right curve to be null
    if (!rightCurve && leftCurve) {
        rightCurve = leftCurve;
        rightX = leftX;
        leftCurve = this.rightCurve;
        leftX = this.rightX;
    }
    if (!leftCurve && rightCurve) {
        leftX = leftX == null ? this.refX : leftX;
    }

    let e = 0.000001;
    let type;

    if (Math.abs(this.refX - this.selectedCurve.maxX) < e)
        type = 'right';
    else if (Math.abs(this.refX - this.selectedCurve.minX) < e)
        type = 'left';
    else
        type = 'custom';

    return {
        idShading: this.id,
        idTrack: this.idTrack,
        name: this.name,
        fill: this.isNegPosFilling ? null: this.fill,
        negativeFill: this.isNegPosFilling ? this.negativeFill : null,
        positiveFill: this.isNegPosFilling ? this.positiveFill : this.fill,
        isNegPosFilling: this.isNegPosFilling,
        idLeftLine: (leftCurve || {}).id,
        idRightLine: (rightCurve || {}).id,
        leftFixedValue: leftX,
        rightFixedValue: rightX,
        idControlCurve: (this.selectedCurve || {}).idCurve,
        type: type
    }
}

Shading.prototype.setProperties = function(props) {
    Utils.setIfNotNull(this,'idTrack', props.idTrack);
    Utils.setIfNotNull(this, 'id', props.idShading);
    Utils.setIfNotNull(this, 'name', props.name);
    Utils.setIfNotNull(this, 'isNegPosFilling', props.isNegPosFilling);
    if (props.isNegPosFilling) {
        Utils.setIfNotNull(this, 'positiveFill', Utils.isJson(props.positiveFill) ? JSON.parse(props.positiveFill) : props.positiveFill);
        Utils.setIfNotNull(this, 'negativeFill', Utils.isJson(props.negativeFill) ? JSON.parse(props.negativeFill) : props.negativeFill);
    }
    else {
        if (props.fill) 
            Utils.setIfNotNull(this, 'fill', Utils.isJson(props.fill) ? JSON.parse(props.fill) : props.fill);
        else Utils.setIfNotNull(this, 'fill', Utils.isJson(props.positiveFill) ? JSON.parse(props.positiveFill) : props.positiveFill);
    }

    if (!this.rightCurve && this.leftCurve) {
        Utils.setIfNotUndefined(this, 'rightCurve', props.leftCurve);
        Utils.setIfNotNull(this, 'refX', props.leftFixedValue);
        Utils.setIfNotNull(this, 'rightX', props.leftFixedValue);
        Utils.setIfNotUndefined(this, 'leftCurve', props.rightCurve);
        Utils.setIfNotNull(this, 'leftX', props.rightFixedValue);
    }
    else {
        Utils.setIfNotUndefined(this, 'leftCurve', props.leftCurve);
        Utils.setIfNotNull(this, 'refX', props.leftFixedValue);
        Utils.setIfNotNull(this, 'leftX', props.leftFixedValue);
        Utils.setIfNotUndefined(this, 'rightCurve', props.rightCurve);
        Utils.setIfNotNull(this, 'rightX', props.rightFixedValue);
    }

    Utils.setIfNotUndefined(this, 'selectedCurve', props.controlCurve);
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
 */
Shading.prototype.init = function(plotContainer) {
    Drawing.prototype.init.call(this, plotContainer);

    let self = this;
    this.canvas = plotContainer.append('canvas')
        .attr('class', 'vi-track-drawing')
        .style('cursor', 'crosshair');

    this.ctx = this.canvas.node().getContext('2d');
    this.svg = plotContainer.select('.vi-track-svg-container');

    this.refLine = this.svg.append('line')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', 0)
        .attr('y2', 0)
        .style('cursor', 'col-resize')
        .style('z-index', 2);

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
    let vpRefX = this.getTransformX(this.selectedCurve)(this.refX);
    this.refLine
        .attr('x1', vpRefX)
        .attr('x2', vpRefX);
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
    let fills = [this.fill, this.negativeFill, this.positiveFill];

    fills.forEach(function(f) {
        if (f && f.color && d3.color(f.color))
            colors.push(d3.color(f.color).toString());
    });
    return colors;
}

/**
 * Actually draw the shading
 * @param {Boolean} highlight
 */
Shading.prototype.doPlot = function(highlight) {
    function cloneCurveData(data, newX) {
        return data.map(function(d) {
            return {
                x: newX,
                y: d.y
            }
        })
    }

    if (!this.leftCurve && !this.rightCurve) return;
    let rect = this.root.node().getBoundingClientRect();
    this.adjustSize(rect);

    let leftData = this.prepareData(this.leftCurve);
    let rightData = this.prepareData(this.rightCurve);
    let vpRefX = this.vpX.ref = this.getTransformX(this.selectedCurve)(this.refX);
    let vpLeftX = this.vpX.left;
    let vpRightX = this.vpX.right;

    leftData = (vpLeftX != null)
        ? cloneCurveData(leftData, vpLeftX)
        : (this.leftCurve
            ? leftData
            : cloneCurveData(rightData, vpRefX)
        );

    rightData = (vpRightX != null)
        ? cloneCurveData(rightData, vpRightX)
        : (this.rightCurve
            ? rightData
            : cloneCurveData(leftData, vpRefX)
        );

    let ctx = this.ctx;
    let self = this;
    let plotSamples = Utils.clusterPairData(leftData, rightData);

    let fills = this.prepareFillStyles();
    Utils.createFillStyles(this.ctx, fills, function(fillStyles) {
        let fill = fillStyles[0];
        let posFill = fillStyles[1];
        let negFill = fillStyles[2];
        if (!self.isNegPosFilling) {
            posFill = negFill = fill;
        }

        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.save();
        plotSamples.forEach(function(clustered) {
            drawCluster(self, clustered, negFill, posFill, highlight);
        });
        ctx.restore();
        drawHeader(self);
        drawRefLine(self);
        self.canvas.lower();
    });
    return this;
}

Shading.prototype.prepareFillStyles = function(forHeader) {
    let self = this;
    let fills = [this.fill, this.positiveFill, this.negativeFill];
    let ret = [];
    fills.forEach(function(fill) {
        if (!fill || !fill.gradient) {
            ret.push(fill);
            return;
        }
        let gradient = Utils.clone(fill.gradient);

        if (forHeader) {
            let rect = self.header.node().getBoundingClientRect();
            gradient.startX = 0;
            gradient.endX = rect.width;
            gradient.data = Utils.range(0, 1, 0.1).map(function(d) {
                return {
                    x: d * rect.width,
                    y: d * rect.height
                }
            })
        }
        else {
            let transformX = self.getTransformX(self.selectedCurve);
            gradient.data = self.prepareData(self.selectedCurve);
            gradient.startX = transformX(gradient.startX);
            gradient.endX = transformX(gradient.endX);
        }
        ret.push({ gradient: gradient });
    });
    return ret;
}

/**
 * Register drag event on ref line
 * @param {Function} cb - Callback function
 */
Shading.prototype.onRefLineDrag = function(cb) {
    this.refLine.call(d3.drag().on('drag', cb));
    return this;
}

Shading.prototype.prepareData = function(curve) {
    if (!curve) return [];
    let rect = this.root
        .node()
        .getBoundingClientRect();

    let windowY = this.getWindowY();
    let transformX = this.getTransformX(curve);
    let transformY = this.getTransformY();

    if (curve == this.leftCurve && this.leftX != null)
        this.vpX.left = transformX(this.leftX);

    if (curve == this.rightCurve && this.rightX != null)
        this.vpX.right = transformX(this.rightX);

    let self = this;
    let data = curve.data
        .filter(function(item) {
            return Utils.isWithinYRange(item, windowY);
        })
        .map(function(item) {
            return {
                x: item.x == null ? null : transformX(item.x),
                y: transformY(item.y)
            }
        });
    return data;
}

Shading.prototype.getTransformX = function(curve) {
    return curve.getTransformX();
}

function drawCluster(shading, clustered, negFill, posFill, highlight) {
    let leftSide = clustered[0],
        rightSide = clustered[1],
        leftTranslateX = [],
        rightTranslateX = [];

    if (shading.leftCurve) {
        leftSide = shading.leftCurve.calculateDataForBlockPosition(leftSide);
        leftTranslateX = shading.leftCurve.getCanvasTranslateXForWrapMode();
    }
    if (shading.rightCurve) {
        rightSide = shading.rightCurve.calculateDataForBlockPosition(rightSide);
        rightTranslateX = shading.rightCurve.getCanvasTranslateXForWrapMode();
    }
    let data = leftSide.concat(rightSide.reverse());
    let translateX = Utils.uniq(leftTranslateX.concat(rightTranslateX));
    let ctx = shading.ctx;
    translateX.forEach(function(trX) {
        ctx.save();
        ctx.translate(trX, 0);
        drawNegAndPosRegions(shading, data, negFill, posFill, trX, highlight);
        ctx.restore();
    });
}

function drawNegAndPosRegions(shading, data, negFill, posFill, trX, highlight) {
    let ctx = shading.ctx;
    let rect = shading.root.node().getBoundingClientRect();
    let vpRefX = shading.vpX.ref;

    // Draw negative regions
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = negFill;
    drawCurveLine(ctx, data, highlight);
    ctx.clip();
    ctx.fillRect(-trX, 0, vpRefX, rect.height);
    ctx.restore();

    // Draw postive regions
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = posFill;
    drawCurveLine(ctx, data, highlight);
    ctx.clip();
    ctx.fillRect(vpRefX - trX, 0, rect.width - vpRefX, rect.height);
    ctx.restore();
}

function drawCurveLine(ctx, data, highlight) {
    ctx.moveTo(data[0].x, data[0].y);
    data.forEach(function(item) {
        ctx.lineTo(item.x, item.y);
    });
    if (highlight) {
        ctx.shadowColor = 'black';
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur = 2;
        ctx.lineWidth = 0;
        ctx.stroke();
    }
}

function drawRefLine(shading) {
    if (shading.vpX.ref < 0 || shading.vpX.ref > shading.root.node().clientWidth)
        return;

    shading.refLine
        .attr('x1', shading.vpX.ref)
        .attr('x2', shading.vpX.ref)
        .attr('y1', 0)
        .attr('y2', shading.root.node().clientHeight)
        .attr('stroke', shading.refLineColor)
        .attr('stroke-width', shading.refLineWidth)
        .style('display', shading.showRefLine ? 'block' : 'none')
        .raise();
}

function drawHeader(shading) {
    let header = shading.header;
    if (!header) return;
    header
        .select('.vi-shading-name')
        .text(shading.name);

    let rect = header.node().getBoundingClientRect();
    let headerBorderWidth = parseInt(header.style('border-width'));
    let width = rect.width - headerBorderWidth;
    let height = rect.height - headerBorderWidth;
    let hCanvas = header
        .select('canvas')
        .attr('width', width)
        .attr('height', height)

    let hCtx = hCanvas.node().getContext('2d');
    let fills = shading.prepareFillStyles(true);
    Utils.createFillStyles(hCtx, fills, function(fillStyles) {
        hCtx.save();
        if (shading.isNegPosFilling) {
            hCtx.fillStyle = fillStyles[2];
            hCtx.fillRect(0, 0, width / 2, height);
            hCtx.fillStyle = fillStyles[1];
            hCtx.fillRect(width / 2, 0, width / 2, height);
        }
        else {
            hCtx.fillStyle = fillStyles[0];
            hCtx.fillRect(0, 0, width, height);
        }
        hCtx.restore();
        hCanvas.lower();
    });
}
