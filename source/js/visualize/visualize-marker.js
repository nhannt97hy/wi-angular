let Utils = require('./visualize-utils');
let Drawing = require('./visualize-drawing');
let SvgHelper = require('./visualize-svg-helper');

module.exports = Marker;

Utils.extend(Drawing, Marker);

/**
 * Represents an Image
 * @constructor
 * @param {Object} config - Configurations of new image
 * @param {Number} [config.idMarker] - The id of this marker in backend
 * @param {Number} [config.idTrack] - The id of the track in backend
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
 * @param {String} [config.symbolName] - Name of marker symbol (Circle, Square)
 * @param {Number} [config.symbolSize] - Size of marker symbol (in pixel)
 * @param {String} [config.symbolStrokeStyle] - Stroke style of marker symbol
 * @param {String} [config.symbolFillStyle] - Fill style of marker symbol
 * @param {Number} [config.symbolLineWidth] - Line width of marker symbol (in pixel)
 * @param {Array} [config.symbolLineDash] - Dash array of marker line
 */
function Marker(config) {
    Drawing.call(this, config);

    // Set default values
    this.id = config.idMarker || config.id;
    this.idTrack = config.idTrack;
    this.name = 'Marker';
    this.nameHAlign = 'Left';
    this.nameVAlign = 'None';
    this.depth = this.minY;
    this.depthHAlign = 'Right';
    this.depthVAlign = 'Top';
    this.precision = 2;
    this.lineWidth = 2;
    this.lineDash = [];
    this.lineColor = 'black';
    this.showSymbol = false;
    this.symbolName = 'Circle';
    this.symbolSize = 10;
    this.symbolStrokeStyle = 'black';
    this.symbolFillStyle = 'red';
    this.symbolLineWidth = 1;
    this.symbolLineDash = [];

    // Override default if config contains the key
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
    props.idTrack = this.idTrack;
    props.lineDash = JSON.stringify(this.lineDash);
    props.symbolLineDash = JSON.stringify(this.symbolLineDash);
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
    Drawing.prototype.init.call(this, plotContainer);
    this.svgContainer = plotContainer.select('.vi-track-svg-container');
    this.svgGroup = this.svgContainer.append('g')
        .classed('vi-marker-svg-group', true);

    this.line = this.svgGroup.append('line')
        .attr('class', 'vi-marker-line');
    this.highlightGroup = this.svgGroup.append('g');
    this.symbol = null;
    this.nameLabel = this.svgGroup.append('text')
        .attr('class', 'vi-marker-name');

    this.depthLabel = this.svgGroup.append('text')
        .attr('class', 'vi-marker-depth');
}

Marker.prototype.doPlot = function(highlight) {
    Drawing.prototype.doPlot.call(this, highlight);
    let transformY = this.getTransformY();
    let viewportX = this.getViewportX();

    let y = transformY(this.depth);
    let minX = d3.min(viewportX);
    let maxX = d3.max(viewportX);

    this.line
        .attr('x1', minX)
        .attr('y1', y)
        .attr('x2', maxX)
        .attr('y2', y)
        .attr('stroke', this.lineColor || 'black')
        .attr('stroke-width', this.lineWidth || 1)
        .attr('stroke-dasharray', this.lineDash || '');

    this.drawSymbol();
    this.drawText();
    this.updateHighlight();
    this.highlightGroup.style('display', highlight ? 'block' : 'none');
}

Marker.prototype.lineDragCallback = function() {
    // let dy = d3.event.currentY - d3.event.preY;
    // let y = this.getTransformY()(this.depth) + dy;
    let y = d3.event.currentY;

    let viewportY = this.getViewportY();
    let margin = this.lineWidth / 2;
    if (y < viewportY[0] + margin) y = viewportY[0] + margin;
    if (y > viewportY[1] - margin) y = viewportY[1] - margin;

    let transformY = this.getTransformY();
    this.depth = transformY.invert(y);
    this.doPlot(true);

    // Draw tooltip
    let rect = this.root.node().getBoundingClientRect();
    let mouse = d3.mouse(this.root.node());
    if (mouse[0] < 0 || mouse[0] > rect.width || mouse[1] < 0 || mouse[1] > rect.height) {
        if (typeof this.root.on('mouseleave') == 'function')
            this.root.on('mouseleave')();
    }
    else {
        if (typeof this.root.on('mousemove') == 'function')
            this.root.on('mousemove')();
    }
}

Marker.prototype.onLineDragEnd = function(cb) {
    let self = this;
    let preY;
    this.svgGroup.call(d3.drag()
        .on('start', function() {
            preY = d3.mouse(self.root.node())[1];
        })
        .on('drag', function() {
            d3.event.preY = preY;
            preY = d3.mouse(self.root.node())[1];
            d3.event.currentY = preY;
            self.lineDragCallback();
        })
        .on('end', cb)
    );
}

Marker.prototype.drawText = function() {
    let formatter = Utils.getDecimalFormatter(this.precision);
    this.depthLabel.text(formatter(this.depth));
    this.updateTextPosition(this.depthLabel, this.depthHAlign, this.depthVAlign);

    this.nameLabel.text(this.name);
    this.updateTextPosition(this.nameLabel, this.nameHAlign, this.nameVAlign);
}

Marker.prototype.drawSymbol = function() {
    let transformY = this.getTransformY();
    let viewportX = this.getViewportX();

    let y = transformY(this.depth);
    let minX = d3.min(viewportX);
    let maxX = d3.max(viewportX);

    let helper = new SvgHelper(this.svgGroup, {
        fillStyle: this.symbolFillStyle,
        strokeStyle: this.symbolStrokeStyle,
        lineWidth: this.symbolLineWidth,
        lineDash: this.symbolLineDash,
        size: this.symbolSize
    });
    let plotFunc = helper[Utils.lowercase(this.symbolName)];
    if (typeof plotFunc == 'function') {
        if (this.symbol) this.symbol.remove();
        this.symbol = plotFunc.call(helper, (minX + maxX) / 2 + minX, y);
        this.symbol
            .attr('display', this.showSymbol ? 'block' : 'none')
            .classed('vi-marker-symbol', true);
    }
}

Marker.prototype.updateTextPosition = function(element, hAlign, vAlign) {
    let transformY = this.getTransformY();
    let viewportX = this.getViewportX();

    let y = transformY(this.depth);
    let minX = d3.min(viewportX);
    let maxX = d3.max(viewportX);

    let textX, textY;
    let textRect = element.node().getBBox();
    element.attr('display', 'block');
    let padding = 5;
    switch (hAlign) {
        case 'Left':
            textX = minX + padding;
            break;
        case 'Center':
            textX = minX + textRect.width / 2 + (maxX - minX) / 2;
            break;
        case 'Right':
            textX = maxX - textRect.width - padding;
            break;
        default:
            textX = minX + padding;
            break;
    }
    switch (vAlign) {
        case 'High':
            textY = y - padding;
            break;
        case 'Center':
            textY = y - textRect.height / 2;
            break;
        case 'Low':
            textY = y - textRect.height + padding;
            break;
        case 'None':
            element.attr('display', 'none');
            break;
        default:
            textY = y - padding;
            break;
    }
    element
        .attr('x', textX)
        .attr('y', textY);
}

Marker.prototype.updateHighlight = function() {
    let g = this.highlightGroup;
    g.selectAll('.vi-marker-highlight-item').remove();
    let helper = new SvgHelper(g, {
        fillStyle: 'red',
        strokeStyle: 'black',
        lineWidth: 1,
        size: 4
    });
    let y = this.getTransformY()(this.depth);
    let minX = this.getViewportX()[0];
    let maxX = this.getViewportX()[1];

    [minX, minX + (maxX - minX) / 2, maxX].forEach(function(x) {
        helper.square(x, y).classed('vi-marker-highlight-item', true);
    });
}

Marker.prototype.on = function(type, cb) {
    this.svgGroup.on(type, cb);
}
