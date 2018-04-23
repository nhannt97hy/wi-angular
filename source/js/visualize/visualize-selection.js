let Utils = require('./visualize-utils');
let gUtils = require('./../utils');
let Drawing = require('./visualize-drawing');
let CanvasHelper = require('./visualize-canvas-helper');

module.exports = Selection;

Utils.extend(Drawing, Selection);

function Selection(config) {
    // this.maskData = config.maskData || [];
    this.maskData = config.data || {};
    this.selectionPointData = [];
    this.newSelectionData = config.newSelectionData || [];
    this.wellForLogplot = config.wellForLogplot || null;
    this.selectionBins = [];
    this.currentMask = null;
    this.idCombinedBoxTool = config.idCombinedBoxTool;
    this.idCombinedBox = config.idCombinedBox;
    this.idSelectionTool = config.idSelectionTool;
    this.data = config.data || [];
    this.name = config.name || '';
    this.color = config.color || 'ffffe0';
    this.mode = null;
}

Selection.prototype.setProperties = function (props) {
    Utils.setIfNotUndefined(this, 'idCombinedBoxTool', props.idCombinedBoxTool);
    Utils.setIfNotUndefined(this, 'idCombinedBox', props.idCombinedBox);
    Utils.setIfNotUndefined(this, 'idSelectionTool', props.idSelectionTool);
    Utils.setIfNotNull(this, 'data', props.data);
    // Utils.setIfNotNull(this, 'maskData', Object.assign({}, this.maskData, props.maskData));
    Utils.setIfNotNull(this, 'maskData', props.maskData);
    Utils.setIfNotNull(this, 'currentMask', props.maskData);
}

Selection.prototype.setData = function (maskData) {
    let dArr = [];
    for (let d in maskData) {
        dArr.push(d);
    }
    let props = {
        startDepth: dArr[0],
        stopDepth: dArr.pop()
    }
    this.data.push(props);
}

Selection.prototype.setSelectionBins = function (selectionBins) {
    this.selectionBins = selectionBins;
}

Selection.prototype.setMode = function (mode, place) {
    switch (place) {
        case 'logplot':
            if (!this.canvasLogtrack) break;
            this.canvasLogtrack.raise();
            this.canvasLogtrack.style('cursor', mode == null ? 'default' : 'copy');
            break;
        case 'histogram':
            if (!this.svg) break;
            this.svg.raise();
            this.svg.style('cursor', mode == null ? 'default' : 'copy');
            break;
        case 'crossplot':
            if (!this.canvas) break;
            this.canvas.raise();
            this.canvas.style('cursor', mode == null ? 'default' : 'copy');
            break;
    }
    this.mode = mode;
}

Selection.prototype.getProperties = function () {
    let self = this;

    return {
        maskData: this.maskData
    };
}

Selection.prototype.initCanvasLogtrack = function (plotContainer, place) {
    Drawing.prototype.init.call(this, plotContainer);

    this.canvasLogtrack = plotContainer.append('canvas')
        .attr('class', 'vi-track-drawing vi-track-selection')
        // .attr('id', (place + this.idSelectionTool + this.name).replace(/\s+/g, ''))
        .lower();

    this.adjustSize();

    this.selectionDrawingArea = this.canvasLogtrack.node().getContext('2d');
    return this;
}

Selection.prototype.initCanvas = function (plotContainer, place) {
    Drawing.prototype.init.call(this, plotContainer);

    this.canvas = plotContainer.append('canvas')
        .attr('class', 'vi-track-drawing vi-track-selection')
        .attr('id', (place + this.idSelectionTool + this.name).replace(/\s+/g, ''))
        .lower();

    this.adjustSize();

    return this;
}

Selection.prototype.initSvg = function (plotContainer, place) {
    Drawing.prototype.init.call(this, plotContainer);

    this.svg = plotContainer.append('svg')
        .attr('class', 'vi-selection-histogram-svg')
        .attr('id', (place + this.idSelectionTool + this.name).replace(/\s+/g, ''))
        .attr('width', $(plotContainer.node()).width())
        .attr('height', $(plotContainer.node()).height())
        .style('position', 'absolute')
        .lower();

    this.adjustSize();
    return this;
}

Selection.prototype._doPlot = function () {
    // this.root = d3.select(this.selectionDrawingArea.canvas);
    let transformY = this.getTransformY();
    let rect = Utils.getBoundingClientDimension(this.root.node());

    let start = transformY(Math.min(this.maskData.startDepth, this.maskData.endDepth));
    let end = transformY(Math.max(this.maskData.startDepth, this.maskData.endDepth));

    this.selectionDrawingArea.fillStyle = this.color;
    this.selectionDrawingArea.fillRect(0, start, rect.width, end - start);
}

Selection.prototype.doPlot = function () {
    let transformY = this.getTransformY();
    const topDepth = +this.wellForLogplot.topDepth;
    const step = +this.wellForLogplot.step;

    if (this.newSelectionData.length) {
        this.newSelectionData.forEach(d => {
            let depth = topDepth + step * d;
            let pxlY = transformY(depth);
            this.rect = Utils.getBoundingClientDimension(this.root.node());
            this.canvasLogtrack.raise();
            this.selectionDrawingArea.strokeStyle = this.color;
            this.selectionDrawingArea.beginPath();
            this.selectionDrawingArea.moveTo(0, pxlY);
            this.selectionDrawingArea.lineTo(this.rect.width, pxlY);
            this.selectionDrawingArea.stroke();
        });
        this.newSelectionData = [];
    } else {
        this.rect = Utils.getBoundingClientDimension(this.root.node());
        if (this.data.length) {
            this.data.forEach(d => {
                let depth = topDepth + step * d;
                let pxlY = transformY(depth);
                this.canvasLogtrack.raise();
                this.selectionDrawingArea.strokeStyle = this.color;
                this.selectionDrawingArea.beginPath();
                this.selectionDrawingArea.moveTo(0, pxlY);
                this.selectionDrawingArea.lineTo(this.rect.width, pxlY);
                this.selectionDrawingArea.stroke();
            });
        } else {
            this.selectionDrawingArea.clearRect(0, 0, this.rect.width, this.rect.height);
        }
    }
}