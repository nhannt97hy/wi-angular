let Utils = require('./visualize-utils');
let Drawing = require('./visualize-drawing');
let DragLine = require('./visualize-dragline');

module.exports = ShiftPoint;

Utils.extend(Drawing, ShiftPoint);


function ShiftPoint(config) {
    Drawing.call(this, config);
    this.setProperties(config);
}

ShiftPoint.prototype.PROPERTIES = {
    depth: { type: 'Float' }
}

ShiftPoint.prototype.init = function(plotContainer) {
    Drawing.prototype.init.call(this, plotContainer);

    this.svgContainer = plotContainer.append('svg')
        .attr('class', 'vi-track-drawing vi-shift-point-container');

    this.svgGroup = new DragLine({
        points: [{x: 0, y: 0}, {x: 0, y: 0}],
        direction: 'Vertical'
    })
        .init(self.svgContainer);

    return this;
}

ShiftPoint.prototype.doPlot = function(highlight) {
    Drawing.prototype.doPlot.call(this, highlight);
    let transformY = this.getTransformY();
    let viewportX = this.getViewportX();

    let y = transformY(this.depth);
    let minX = d3.min(viewportX);
    let maxX = d3.max(viewportX);

    this.svgGroup
        .setProperties({
            points: [{x: minX, y: y}, {x: maxX, y: y}]
        })
        .doPlot();
    return this;
}
