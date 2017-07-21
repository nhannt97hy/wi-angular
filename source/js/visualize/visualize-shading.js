var Utils = require('./visualize-utils');

module.exports = Shading;

/**
 * Represents a Shading
 * @constructor
 * @param {Object} config - Configurations of new shading
 * @param {String} [config.name] - Name of new shading
 * @param {String} [config.fillStyle] - Canvas fill style
 * @param {Number} [config.refX] - x coordiate of reference line for custom shading
 * @todos Pending
 */
function Shading(config) {
    let self = this;
    let canvas;
    let ctx;
    let svg;
    let clientRect;
    let refLine;

    let _leftCurve;
    let _rightCurve;
    let _fillStyle = config.fillStyle || 'green';
    let _name = config.name || 'Noname';
    let _refX = config.refX;
    let _header;

    let refLineWidth = 2;
    let refLineColor = '#3e3e3e';

    /**
     * Get name property of the shading
     */
    this.getName = function() {
        return _name;
    }

    /**
     * Get fillStyle property of the shading
     */
    this.getFillStyle = function() {
        return _fillStyle;
    }

    /**
     * Get refX property of the shading
     */
    this.getRefX = function() {
        return _refX;
    }

    /**
     * Get width of reference line
     */
    this.getRefLineWidth = function() {
        return refLineWidth;
    }

    /**
     * Get header of the shading
     */
    this.getHeader = function() {
        return _header;
    }

    /**
     * Set name property for the shading
     * @param {String} name - New name
     */
    this.setName = function(name) {
        _name = name;
    }

    /**
     * Set fillStyle property for the shading
     * @param {String|Object} fillStyle - New canvas fillStyle
     */
    this.setFillStyle = function(fillStyle) {
        _fillStyle = fillStyle;
    }

    /**
     * Set refX property of the shading
     * @param {Number} refX - x coordinate of reference line
     */
    this.setRefX = function(refX) {
        _refX = refX;
    }

    /**
     * Set header property of the shading
     * @param {Object} header - shading header
     */
    this.setHeader = function(header) {
        _header = header;
    }

    /**
     * Re-insert the shading to the end of its parent
     */
    this.raise = function() {
        canvas.raise();
    }

    /**
     * Initialize DOM elements
     * @param {Object} plotContainer - The DOM element to contain the shading
     * @param {Object} leftCurveIdx - Left curve, null if drawing left shading
     * @param {Object} rightCurveIdx - Right curve, null if drawing right shading
     */
    this.init = function(plotContainer, leftCurve, rightCurve) {
        _leftCurve = leftCurve;
        _rightCurve = rightCurve;
        clientRect = plotContainer.node().getBoundingClientRect();

        canvas = plotContainer.append('canvas')
            .attr('width', clientRect.width)
            .attr('height', clientRect.height);

        ctx = canvas.node().getContext('2d');
        svg = plotContainer.select('svg');

        if (_refX != null) {
            refLine = svg.append('line').attr('class', 'ref-line')
                .attr('x1', _refX)
                .attr('x2', _refX)
                .attr('y1', 0)
                .attr('y2', clientRect.height)
                .attr('style', 'stroke:' + refLineColor +'; stroke-width:' + refLineWidth)
                .raise();
        }

        return self;
    }

    /**
     * Adjust shading when bounding rectangle changes
     * @param {Object} rect - The bounding rectangle
     */
    this.adjustSize = function(rect) {
        canvas
            .attr('width', rect.width)
            .attr('height', rect.height);

        svg
            .attr('width', rect.width)
            .attr('height', rect.height);

        if (refLine) {
            _refX = rect.width / clientRect.width * _refX;

            refLine
                .attr('x1', _refX)
                .attr('x2', _refX);
        }
        clientRect = rect;
    }

    /**
     * Destroy DOM elements of the shading
     */
    this.destroy = function() {
        canvas.remove();
        if (_header) _header.remove();
    }

    /**
     * Check if the shading near a point
     * @param {Number} x - x coordinate of the point
     * @param {Number} y - y coordinate of the point
     * @returns {Boolean}
     */
    this.nearPoint = function(x, y) {
        let e = 1;
        let imgData = ctx.getImageData(x-e, y-e, e*2, e*2);
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
     * Actually draw the shading
     * @param {Array} domainY
     * @param {Array} rangeX
     * @param {Array} rangeY
     * @param {Object} config
     * @param {Number} [config.yStep] - Step to scale y coordinate
     * @todos Pending
     */
    this.doPlot = function(domainY, rangeX, rangeY, config) {
        if (_refX != null) _drawRefLine();
        let yStep = config.yStep || 1;

        let leftData = _prepareData(_leftCurve, domainY, rangeX, rangeY, yStep);
        let rightData = _prepareData(_rightCurve, domainY, rangeX, rangeY, yStep).reverse();

        if (leftData.length == 0 && rightData.length == 0) return;

        if (leftData.length == 0) {
            let x = _refX == null ? rangeX[0] : _refX;
            leftData = [
                {x: x, y: rangeY[0]},
                {x: x, y: rangeY[1]}
            ];
        }

        if (rightData.length == 0) {
            let x = _refX == null ? rangeX[1] : _refX;
            rightData = [
                {x: x, y: rangeY[1]},
                {x: x, y: rangeY[0]}
            ];
        }

        let plotSamples = leftData.concat(rightData);

        ctx.clearRect(0, 0, clientRect.width, clientRect.height);
        ctx.fillStyle = _fillStyle;
        ctx.lineWidth = 0;

        ctx.beginPath();
        ctx.moveTo(plotSamples[0].x, plotSamples[0].y);
        plotSamples.forEach(function(item) {
            ctx.lineTo(item.x, item.y);
        });
        ctx.fill();
    }

    /**
     * Register drag event on ref line
     * @param {Function} cb - Callback function
     */
    this.onRefLineDrag = function(cb) {
        if (_refX != null)
            refLine.call(d3.drag().on('drag', cb));
    }


    function _prepareData(curve, domainY, rangeX, rangeY, yStep) {
        if (!curve) return [];

        let scaleX = curve.getScaleFunc();
        let transformX = scaleX().domain(curve.getXRange()).range(rangeX);
        let transformY = d3.scaleLinear().domain(domainY).range(rangeY);
        let data = curve.getData()
            .filter(function(item) {
                return Utils.isWithin(item, curve.getXRange(), [domainY[0] / yStep, domainY[1] / yStep]);
            })
            .map(function(item) {
                return {
                    x: transformX(item.x),
                    y: transformY(item.y * yStep)
                }
            });
        return data.slice();
    }

    function _drawRefLine() {
        refLine.attr('x1', _refX)
            .attr('x2', _refX)
            .attr('y1', 0)
            .attr('y2', clientRect.height)
            .attr('stroke', refLineColor)
            .raise();
    }
}
