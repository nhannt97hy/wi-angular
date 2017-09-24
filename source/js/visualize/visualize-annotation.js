let Utils = require('./visualize-utils');
let Drawing = require('./visualize-drawing');
let CanvasHelper = require('./visualize-canvas-helper');

module.exports = Annotation;

Utils.extend(Drawing, Annotation);

function Annotation(config) {
    Drawing.call(this, config);
    this.setProperties(config);
}

Annotation.prototype.PROPERTIES = {
    idAnnotation: { type: 'Integer' },
    text: { type: 'String' },
    textStyle: { type: 'String', default: 'Black' },
    background: { type: 'String', default: 'Yellow' },
    left: { type: 'Float', default: 0 },
    top: { type: 'Float' },
    bottom: { type: 'Float' },
    width: { type: 'Float', default: 1 },
    vAlign: {
        type: 'Enum',
        values: ['Top', 'Center', 'Bottom'],
        default: 'Top'
    },
    hAlign: {
        type: 'Enum',
        values: ['Left', 'Center', 'Right'],
        default: 'Left'
    },
    fitBounds: { type: 'Boolean', default: false },
    deviceSpace: { type: 'Boolean', default: false },
    vertical: { type: 'Boolean', default: false },
    shadow: { type: 'Boolean', default: false }
}

Annotation.prototype.init = function(plotContainer) {
    Drawing.prototype.init.call(this, plotContainer);
    let self = this;

    this.svgContainer = plotContainer.append('svg')
        .attr('class', 'vi-track-drawing vi-annotation-container');

    this.svgGroup = this.svgContainer.append('g')
        .attr('class', 'vi-annotation-svg-group')

    this.svgGroup.append('rect')
        .attr('class', 'vi-annotation-bounding-rect');

    this.svgGroup.selectAll('g.vi-annotation-drag-group')
        .data([
            'vi-annotation-vertical-drag-group',
            'vi-annotation-vertical-drag-group',
            'vi-annotation-horizontal-drag-group',
            'vi-annotation-horizontal-drag-group'
        ])
        .enter()
        .append('g')
        .attr('class', function(d) { return 'vi-annotation-drag-group ' + d });

    this.svgGroup.append('text')
        .attr('class', 'vi-annotation-text');
}

Annotation.prototype.doPlot = function(highlight) {
    Drawing.prototype.doPlot.call(this, highlight);
    if (this.top === undefined || this.bottom == undefined) return;

    let viewportX = this.getViewportX();
    let transformY = this.getTransformY();

    let vpWidth = viewportX[1] - viewportX[0];
    let top = transformY(this.top);
    let bottom = transformY(this.bottom);
    let left = viewportX[0] + this.left * vpWidth;
    let width = this.width * vpWidth;

    let rect = this.svgGroup.select('rect.vi-annotation-bounding-rect')
        .attr('x', left)
        .attr('y', top)
        .attr('width', width)
        .attr('height', bottom - top)
        .attr('fill', this.background);

    let text = this.svgGroup.select('text.vi-annotation-text')
        .attr('x', left)
        .text(this.text);

    let textRect = text.node().getBBox();
    text.attr('y', top + textRect.height);
}

Annotation.prototype.destroy = function() {
    this.svgContainer.destroy();
}

Annotation.prototype.on = function(type, cb) {
    this.svgGroup.on(type, cb);
}

Annotation.prototype.onRectDragEnd = function(cb) {
    let self = this;
    this.svgGroup.call(d3.drag()
        .on('start', function() {})
        .on('drag', function() {
            self.dragCallback();
        })
        .on('end', cb)
    );
}

Annotation.prototype.dragCallback = function() {
    let transformY = this.getTransformY();
    let dy = transformY.invert(d3.event.dy);
    this.top += dy;
    this.bottom += dy;

    let viewportX = this.getViewportX();
    let vpWidth = viewportX[1] - viewportX[0];

    this.left += d3.event.dx / vpWidth;
    this.doPlot();

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
