let Utils = require('./visualize-utils');
let Drawing = require('./visualize-drawing');

module.exports = Marker;

Utils.extend(Drawing, Marker);

/**
 * Represents an Image
 * @constructor
 * @param {Object} config - Configurations of new image
 * @param {Number} [config.idMarker] - The id of this marker in backend
 * @param {String} [config.name] - Name of the marker
 * @param {String} [config.nameHAlign] - Horizontal alignment of name (Left, Center, Right)
 * @param {String} [config.nameVAlign] - Vertical alignment of name (High, Center, Low, None)
 * @param {Number} [config.depth] - Depth of the marker
 * @param {String} [config.depthHAlign] - Horizontal alignment of depth (Left, Center, Right)
 * @param {String} [config.depthVAlign] - Vertical alignment of depth (High, Center, Low, None)
 * @param {Number} [config.precision] - Precision of depth
 * @param {Number} [config.lineWidth] - Width of marker line (in pixel)
 * @param {Array} [config.lineDash] - Dash array of marker line
 * @param {String} [config.lineColor] - CSS color of marker line
 * @param {Boolean} [config.showSymbol] - Indicate whether to show symbol on marker
 * @param {String} [config.symbolName] - Name of marker symbol (Circle, Square, Cross, Diamond, Plus, Star)
 * @param {Number} [config.symbolSize] - Size of marker symbol (in pixel)
 * @param {String} [config.symbolStrokeStyle] - Stroke style of marker symbol
 * @param {String} [config.symbolFillStyle] - Fill style of marker symbol
 * @param {Number} [config.symbolLineWidth] - Line width of marker symbol (in pixel)
 * @param {Array} [config.symbolLineDash] - Dash array of marker line
 */
function Marker(config) {
    Drawing.call(this, config);
    this.setProperties(config);
}

Marker.prototype.PROPERTIES = [
    'name', 'nameHAlign', 'nameVAlign',
    'depth', 'depthHAlign', 'depthVAlign',
    'precision',
    'lineWidth', 'lineDash', 'lineColor',
    'showSymbol', 'symbolName', 'symbolSize',
    'symbolStrokeStyle', 'symbolFillStyle',
    'symbolLineWidth', 'symbolLineDash'
];
Marker.prototype.FLOAT_PROPERTIES = ['depth'];
Marker.prototype.INTEGER_PROPERTIES = ['precision', 'lineWidth', 'symbolSize', 'symbolLineWidth'];
Marker.prototype.ARRAY_PROPERTIES = ['lineDash', 'symbolLineDash'];

Marker.prototype.getProperties = function() {
    let props = Utils.only(this, this.PROPERTIES);
    props.idMarker = this.id;
    return props;
}

Marker.prototype.setProperties = function(props) {
    let self = this;
    Utils.merge(this, Utils.only(props, this.PROPERTIES), function(props, key) {
        let value = props[key];
        if (self.FLOAT_PROPERTIES.indexOf(key) > -1) return parseFloat(value);
        if (self.INTEGER_PROPERTIES.indexOf(key) > -1) return parseInt(value);
        if (self.ARRAY_PROPERTIES.indexOf(key) > -1) return eval(value);
        return value;
    });
    Utils.setIfNotNull(this, 'id', props.idMarker);
}

Marker.prototype.init = function(plotContainer) {
    Drawing.prototype.init(this, plotContainer);
    this.canvas = plotContainer.append('canvas')
        .attr('class', 'vi-track-drawing');
    this.ctx = this.canvas.node().getContext('2d');
}

Marker.prototype.doPlot = function(highlight) {
    Drawing.prototype.doPlot.call(this, highlight);
}
