let Utils = require('./visualize-utils');
let gUtils = require('./../utils');
let Drawing = require('./visualize-drawing');
let CanvasHelper = require('./visualize-canvas-helper');

module.exports = Selection;

Utils.extend(Drawing, Selection);

function Selection(config) {
    // this.maskData = config.maskData || [];
    this.maskData = config.data || {};
    this.selectionData = [];
    this.selectionBins = [];
    this.currentMask = null;
    this.id = config.id;
    this.name = config.name;
    this.color = config.color;
}

Selection.prototype.setProperties = function (props) {
    Utils.setIfNotNull(this, 'maskData', Object.assign({}, this.maskData, props.maskData));
    Utils.setIfNotNull(this, 'currentMask', props.maskData);
}

Selection.prototype.updateSelectionData = function () {
    this.selectionData.push(this.currentMask);
    return this.selectionData;
}

Selection.prototype.setSelectionBins = function (selectionBins) {
    this.selectionBins = selectionBins;
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

Selection.prototype.initCanvas = function (plotContainer, place) {
    Drawing.prototype.init.call(this, plotContainer);

    this.canvas = plotContainer.append('canvas')
        .attr('class', 'vi-track-drawing vi-track-selection')
        .attr('id', (place + this.id + this.name).replace(/\s+/g, ''))
        .lower();

    this.adjustSize();

    this.selectionDrawingArea = this.canvas.node().getContext('2d');
    return this;
}

Selection.prototype.initSvg = function (plotContainer, place) {
    Drawing.prototype.init.call(this, plotContainer);

    this.svg = plotContainer.append('svg')
        .attr('class', 'vi-selection-histogram-svg')
        .attr('id', (place + this.id + this.name).replace(/\s+/g, ''))
        .attr('width', $(plotContainer.node()).width())
        .attr('height', $(plotContainer.node()).height())
        .style('position', 'absolute')
        .lower();

    this.adjustSize();
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
    }
}