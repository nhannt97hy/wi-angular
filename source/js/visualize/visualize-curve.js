module.exports = Curve;

/**
 * Represents a Curve
 * @constructor
 * @param {Object} config - Configurations of new curve
 * @param {String} [config.name] - Name of new curve
 * @param {String} [config.unit] - Unit of data
 * @param {Number} [config.xMin] - Mininum x value to show
 * @param {Number} [config.xMax] - Maximum x value to show
 * @param {String} [config.color] - CSS color of new curve
 * @param {String} [config.scale] - Scale type (linear or log)
 */

function Curve(config) {
    let self = this;
    let canvas;
    let ctx;
    let clientRect;

    let _data;
    let _color = config.color || 'blue';
    let _name = config.name || 'Noname';
    let _unit = config.unit || 'm3';
    let _xMin = config.xMin || 0;
    let _xMax = config.xMax || 200;
    let _scale = config.scale || 'linear';

    /**
     * Get data property of curve
     * @returns {Array} Data which the curve represents
     */
    this.getData = function() {
        return _data;
    }

    /**
     * Get name property of curve
     * @returns {String} Name of the curve
     */
    this.getName = function() {
        return _name;
    }

    /**
     * Get color property of curve
     * @returns {String} Curve color
     */
    this.getColor = function() {
        return _color;
    }

    /**
     * Get unit property of curve
     * @returns {String} Data unit of the curve
     */
    this.getUnit = function() {
        return _unit;
    }

    /**
     * Get xMax property of curve
     * @returns {Number} Maximum x value to show
     */
    this.getXMax = function() {
        return _xMax;
    }

    /**
     * Get xMin property of curve
     * @returns {Number} Minimum x value to show
     */
    this.getXMin = function() {
        return _xMin;
    }

    /**
     * Get scale property of curve
     * @returns {String} Scale type of curve
     */
    this.getScale = function() {
        return _scale;
    }

    /**
     * Set name property for curve
     * @param {String} name - New name for curve
     */
    this.setName = function(name) {
        _name = name;
    }

    /**
     * Set color property for curve
     * @param {String} color - New color for curve
     */
    this.setColor = function(color) {
        _color = color
    }

    /**
     * Set unit for data in curve
     * @param {String} unit - New unit for curve
     * @todos Pending
     */
    this.setUnit = function(unit) {}

    /**
     * Set maximum x value to show
     * @param {Number} xMax - New xMax value for curve
     * @todos Pending
     */
    this.setXMax = function(xMax) {}

    /**
     * Set minimum x value to show
     * @param {Number} xMin - New xMin value for curve
     * @todos Pending
     */
    this.setXMin = function(xMin) {}

    /**
     * Set scale type for curve
     * @param {String} scale - New scale type (linear or log)
     * @todos Pending
     */
    this.setScale = function(scale) {
        _scale = scale;
    }

    /**
     * Adjust curve when bounding rectangle changes
     * @param {Object} rect - The bounding rectangle
     */
    this.adjustSize = function(rect) {
        clientRect = rect;
        canvas
            .attr('width', clientRect.width)
            .attr('height', clientRect.height);
    }

    /**
     * Initialize DOM elements and bind data for the curve
     * @param {Object} plotContainer - The DOM element to contain the curve
     * @param {Array} data - Array of objects containing x, y coordinates
     */
    this.init = function(plotContainer, data) {
        _data = data;
        clientRect = plotContainer.node().getBoundingClientRect();

        canvas = plotContainer.append('canvas')
            .attr('width', clientRect.width)
            .attr('height', clientRect.height);

        ctx = canvas.node().getContext('2d');
        return self;
    }

    /**
     * Destroy DOM elements of the curve
     */
    this.destroy = function() {
        canvas.remove();
    }

    /**
     * Check if the curve near a point
     * @param {Number} x - x coordinate of the point
     * @param {Number} y - y coordinate of the point
     * @returns {Boolean}
     */
    this.nearPoint = function(x, y) {
        let e = 4;
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
     * Actually draw the curve
     * @param {Array} domainY
     * @param {Array} rangeX
     * @param {Array} rangeY
     * @param {Object} config
     * @param {Number} [config.lineWidth] - Width in pixel of the line. Default: 1
     * @param {Number} [config.yStep] - Step to scale y coordinate
     * @param {Number} [config.xStep] - Step to scale x coordinate
     * @todos Pending
     */
    this.doPlot = function(domainY, rangeX, rangeY, config) {
        let scaleFunc = _getScaleFunc();
        let transformX = scaleFunc().domain([_xMin, _xMax]).range(rangeX);
        let transformY = scaleFunc().domain(domainY).range(rangeY);
        let lineWidth = config.lineWidth || 1;
        let yStep = config.yStep || 1;

        ctx.clearRect(0, 0, clientRect.width, clientRect.height);
        let plotSamples = _data.filter(function(item) {
            let ret =(item.x >= _xMin &&
                   item.x <= _xMax &&
                   item.y * yStep >= domainY[0] &&
                   item.y * yStep <= domainY[1]);
            return ret;
        });
        if (plotSamples.length == 0) return;

        ctx.strokeStyle = _color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(transformX(plotSamples[0].x), transformY(plotSamples[0].y * yStep));
        plotSamples.forEach(function(item) {
            ctx.lineTo(transformX(item.x), transformY(item.y * yStep));
        });
        ctx.stroke();
    }

    function _getScaleFunc() {
        return {
            'linear': d3.scaleLinear,
            'log': d3.scaleLog
        }[_scale]
    }
}

