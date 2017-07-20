module.exports = Shading;

/**
 * Represents a Shading
 * @constructor
 * @param {Object} config - Configurations of new shading
 * @param {String} [config.name] - Name of new shading
 * @param {String} [config.color] - CSS color of new shading
 * @param {Number} [config.refX] - x coordiate of reference line for custom shading
 * @todos Pending
 */
function Shading(config) {
    let self = this;
    let canvas;
    let ctx;
    let clientRect;

    let _leftCurve;
    let _rightCurve;
    let _color = config.color || 'green';
    let _name = config.name || 'Noname';

    /**
     * Get name property of the shading
     */
    this.getName = function() {
        return _name;
    }

    /**
     * Get color property of the shading
     */
    this.getColor = function() {
        return _color;
    }

    /**
     * Set name property for the shading
     * @param {String} name - New name
     */
    this.setName = function(name) {
        _name = name;
    }

    /**
     * Set color property for the shading
     * @param {String} color - New color
     */
    this.setColor = function(color) {
        _color = color;
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
        return self;
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
     * Destroy DOM elements of the shading
     */
    this.destroy = function() {
        canvas.remove();
    }

    /**
     * Actually plot the shading
     * @todos Pending
     */
    this.doPlot = function(viewportX, viewportY, transformX, transformY, refX, yStep) {
        ctx.clearRect(0, 0, clientRect.width, clientRect.height);

        let filteredData = [_leftCurve.getData(), _rightCurve.getData().slice().reverse()].map(function(data) {
            return data.filter(function(item) {
                let ret = (item.x >= viewportX[0] &&
                   item.x <= viewportX[1] &&
                   item.y * yStep >= viewportY[0] &&
                   item.y * yStep <= viewportY[1]);
                return ret;
            });
        });

        let plotSamples = [].concat.apply([], filteredData);
        if (plotSamples.length == 0) return;
        ctx.fillStyle = _color;
        ctx.lineWidth = 0;

        ctx.beginPath();
        ctx.moveTo(transformX(plotSamples[0].x), transformY(plotSamples[0].y * yStep));
        plotSamples.forEach(function(item) {
            ctx.lineTo(transformX(item.x), transformY(item.y * yStep));
        });
        ctx.fill();
    }
}
