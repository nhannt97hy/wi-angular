let Utils = require('./visualize-utils');
let gUtils = require('./../utils');
let Drawing = require('./visualize-drawing');
let CanvasHelper = require('./visualize-canvas-helper');

module.exports = Selection;

Utils.extend(Drawing, Selection);

function Selection(config) {
    // this.maskData = config.maskData || [];
    this.maskData = config.data || {};
    this.id = config.id;
    this.color = config.color;
}

Selection.prototype.setProperties = function (props) {
    Utils.setIfNotNull(this, 'maskData', props.maskData);
}

Selection.prototype.getProperties = function () {
    let self = this;

    return {
        maskData: this.maskData
    };
}

Selection.prototype.setMode = function (newMode) {
    this.mode = newMode;
    this.plotContainer
        .style('cursor', newMode == null ? 'default' : 'copy');
}

Selection.prototype.init = function (plotContainer, track) {
    Drawing.prototype.init.call(this, plotContainer);

    this.track = track;
    this.canvas = plotContainer.append('canvas')
        .attr('class', 'vi-track-drawing vi-track-selection')
        .lower();

    this.adjustSize();

    this.selectionDrawingArea = this.canvas.node().getContext('2d');
    // this.selectionDrawingArea.fillStyle = 'yellow';
    // this.selectionDrawingArea.fillRect(minX, minY, rect.width, maxY - minY);
    return this;
}

Selection.prototype.doPlot = function () {
    let start, end, flag = false;
    let transformY = this.getTransformY();
    this.rect = Utils.getBoundingClientDimension(this.root.node());
    for (let y = this.minY; y <= this.maxY; y++) {
        if (this.maskData[Math.round(y)]) {
            if (flag) continue;
            else flag = true;
            if (!start) start = transformY(y);
        } else {
            if (!flag) continue;
            else flag = false;
            end = transformY(--y);
            this.selectionDrawingArea.fillStyle = this.color;
            this.selectionDrawingArea.fillRect(0, start, this.rect.width, end - start);
            start = null;
            end = null;
        }
        // this.selectionDrawingArea.moveTo(0, transformY(y));
        // this.selectionDrawingArea.lineTo(this.rect.width, transformY(y));
        // this.selectionDrawingArea.lineWidth = 1;
        // this.selectionDrawingArea.strokeStyle = this.color;
        // this.selectionDrawingArea.stroke();
    }
}