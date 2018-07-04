const d3plus = require('d3plus');
let Utils = require('./visualize-utils');
let Drawing = require('./visualize-drawing');
let CanvasHelper = require('./visualize-canvas-helper');
let DragLine = require('./visualize-dragline');

module.exports = Annotation;

Utils.extend(Drawing, Annotation);

function Annotation(config) {
    Drawing.call(this, config);
    this.setProperties(config);
}

Annotation.prototype.PROPERTIES = {
    idAnnotation: { type: 'Integer' },
    text: { type: 'String' },
    textStyle: {
        type: 'Object',
        properties: {
            fontSize: { type: 'Integer', default: 12 },
            fill: { type: 'String', default: 'Black'},
            lineColor: { type: 'String', default: 'Black' },
            lineWidth: { type: 'Integer', default: 0 },
            lineStyle: {
                type: 'Array',
                item: { type: 'Integer' },
                default: []
            },
        }
    },
    background: { type: 'String', default: 'Yellow' },
    left: { type: 'Float', default: 0 },
    top: { type: 'Float' },
    bottom: { type: 'Float' },
    width: { type: 'Float', default: 1 },
    vAlign: {
        type: 'Enum',
        values: ['Top', 'Middle', 'Bottom'],
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

    this.svgContainer = plotContainer.select('.vi-track-svg-container');
    // this.svgContainer = plotContainer.append('svg')
    //     .attr('class', 'vi-track-drawing vi-annotation-container');

    this.svgGroup = this.svgContainer.append('g')
        .attr('class', 'vi-annotation-svg-group')
        .attr('id', 'vi-annotation-svg-group-' + this.idAnnotation);

    this.svgGroup.append('rect')
        .attr('class', 'vi-annotation-bounding-rect');

    // this.svgGroup.append('text')
    //     .attr('class', 'vi-annotation-text');

    this.draglineGroups = Utils.range(1,4).map(function(d) {
        let dragline = new DragLine({
            points: [{x: 0, y: 0}, {x: 0, y: 0}],
            direction: d % 2 == 1 ? 'Vertical' : 'Horizontal'
        });
        dragline.init(self.svgGroup);
        dragline.on('dragging', function() {
            let pos = {
                1: 'top',
                2: 'right',
                3: 'bottom',
                4: 'left'
            }[d];
            self.lineDragCallback(dragline, pos);
        });

        return dragline;
    });
}

Annotation.prototype.doPlot = function(highlight) {
    Drawing.prototype.doPlot.call(this, highlight);
    this.highlight = highlight;
    if (this.top === undefined || this.bottom == undefined) return;

    let self = this;
    let viewportX = this.getViewportX();
    let transformY = this.getTransformY();

    let vpWidth = viewportX[1] - viewportX[0];
    let top = transformY(this.top);
    let bottom = transformY(this.bottom);
    let left = viewportX[0] + this.left * vpWidth / 100;
    let width = this.width * vpWidth / 100;
    let right = left + width;

    this.updateBoundingRect(left, top, width, bottom-top);
    this.updateText();
    this.updateDraglineGroups(left, top, right, bottom);
}

Annotation.prototype.updateBoundingRect = function(x, y, width, height) {
    this.svgGroup.select('rect.vi-annotation-bounding-rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', width)
        .attr('height', height)
        .attr('fill', this.background);
}

Annotation.prototype.updateText = function() {
    let rectNode = this.svgGroup.select('rect.vi-annotation-bounding-rect').node();
    if (!rectNode) return;
    let rect = rectNode.getBBox();
    const PADDING = 5;
    const text = new d3plus.TextBox()
        .select(this.svgGroup.node())
        .data([{
            text: this.text,
            height: rect.height,
            width: rect.width,
            x: rect.x,
            y: rect.y
        }])
        .fontMin(1)
        .fontSize(this.textStyle.fontSize)
        .fontResize(this.fitBounds)
        .padding(PADDING)
        .verticalAlign(this.vAlign.toLowerCase());
    switch (this.hAlign) {
        case 'Left':
            text.textAnchor('start');
            break;
        case 'Center':
            text.textAnchor('middle');
            break;
        case 'Right':
            text.textAnchor('end');
            break;
        default:
            break;
    }
    text.render();
    /*
    let text = this.svgGroup.select('text.vi-annotation-text')
        .attr('fill', this.textStyle.fill)
        .attr('stroke', this.textStyle.lineColor)
        .attr('stroke-width', this.textStyle.lineWidth)
        .attr('stroke-dasharray', this.textStyle.lineStyle)
        .attr('font-size', this.textStyle.fontSize)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .text(this.text)
    let textRect = text.node().getBBox();
    if (this.fitBounds) {
        text.attr('font-size', Math.min(rect.width / textRect.width, rect.height / textRect.height) * 10 + 'px');
        textRect = text.node().getBBox();
        x = rect.x + rect.width / 2;
        y = rect.y + rect.height / 2;
    }
    else {
        switch(this.vAlign) {
            case 'Top':
                y = rect.y + textRect.height / 2 + PADDING;
                break;
            case 'Middle':
                y = rect.y + rect.height / 2;
                break;
            case 'Bottom':
                y = rect.y + rect.height - textRect.height / 2 - PADDING;
                break;
        }

        switch(this.hAlign) {
            case 'Left':
                x = rect.x + textRect.width / 2 + PADDING;
                break;
            case 'Center':
                x = rect.x + rect.width / 2;
                break;
            case 'Right':
                x = rect.x + rect.width - textRect.width / 2 - PADDING;
                break;
        }
    }
    text.attr('x', x).attr('y', y);
    */
}

Annotation.prototype.updateDraglineGroups = function(left, top, right, bottom, only) {
    let self = this;
    [
        [left, top, right, top],
        [right, top, right, bottom],
        [left, bottom, right, bottom],
        [left, top, left, bottom]
    ].map(function(d,i) {
        if (!only || only.indexOf(i) > -1) {
            self.draglineGroups[i].setProperties({
                points: [{x: d[0], y: d[1]}, {x: d[2], y: d[3]}]
            });
            self.draglineGroups[i].doPlot();
        }
        self.draglineGroups[i].svgGroup.style('display', self.highlight ? 'block' : 'none');
    });
}

Annotation.prototype.destroy = function() {
    this.svgGroup.remove();
}

Annotation.prototype.on = function(type, cb) {
    this.svgGroup.on(type, cb);
}

Annotation.prototype.onRectDragEnd = function(cb) {
    let self = this;
    let originalY, originalX;
    this.svgGroup.call(d3.drag()
        .on('start', function() {
            originalX = d3.event.x;
            originalY = d3.event.y;
        })
        .on('drag', function() {
            self.rectDragCallback();
        })
        .on('end', function () {
            if (Math.abs(originalY - d3.event.y) > 2 || Math.abs(originalX - d3.event.x) > 2) {
                cb && cb();
            }
        })
    );
}

Annotation.prototype.onLineDragEnd = function(cb) {
    this.draglineGroups.forEach(function(l) {
        l.on('dragEnd', cb);
    });
}

Annotation.prototype.lineDragCallback = function(dragline, pos) {
    let vLines = this.draglineGroups.filter(function(d) { return d.direction == 'Vertical'; });
    let hLines = this.draglineGroups.filter(function(d) { return d.direction == 'Horizontal'; });

    let ys = vLines.map(function(d) { return d.points[0].y; });
    let xs = hLines.map(function(d) { return d.points[0].x; });

    let top = d3.min(ys);
    let bottom = d3.max(ys);
    let left = d3.min(xs);
    let right = d3.max(xs);

    let transformY = this.getTransformY();
    this.top = transformY.invert(top);
    this.bottom = transformY.invert(bottom);

    let viewportX = this.getViewportX();
    let vpWidth = viewportX[1] - viewportX[0];
    this.left = (left - viewportX[0]) / vpWidth * 100;
    this.width = (right - left) / vpWidth * 100;

    this.updateBoundingRect(left, top, right-left, bottom-top);
    this.updateText();

    let only = null;
    if (pos == 'top' || pos == 'bottom')
        only = [1,3];
    else if (pos == 'left' || pos == 'right')
        only = [0, 2];

    this.updateDraglineGroups(left, top, right, bottom, only);
    this.drawRootTooltip();
}

Annotation.prototype.rectDragCallback = function() {
    let transformY = this.getTransformY();
    let dy = transformY.invert(d3.event.dy) - this.getWindowY()[0];
    this.top += dy;
    this.bottom += dy;

    let viewportX = this.getViewportX();
    let vpWidth = viewportX[1] - viewportX[0];

    this.left += d3.event.dx / vpWidth * 100;
    this.doPlot(true);

    this.drawRootTooltip();
}
