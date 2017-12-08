let Utils = require('./visualize-utils');
let Track = require('./visualize-track');
let ObjectOfTrack = require('./visualize-object');

module.exports = ObjectTrack;

Utils.extend(Track, ObjectTrack);

function ObjectTrack(config) {
    Track.call(this, config);
    this.MIN_WIDTH = 200;
    this.wiComponentService = config.wiComponentService;

    this.id = config.id || config.idObjectTrack;
    this.idPlot = config.idPlot;
    this.name = config.title || 'Object Track';
    this.width = config.width || this.MIN_WIDTH;
    this.minY = config.minY;
    this.maxY = config.maxY;
    this.justification = config.topJustification || "center";

    this.drawings = config.objects || []; // Array of visualize object
    this.showTitle = true;
    this.currentDrawing = null;
    this.previousDrawing = null;
    this.mode = null;
    this.currentQuest = null;
}

ObjectTrack.prototype.getProperties = function () {
    return {
        showTitle: this.showTitle,
        topJustification: this.justification || "center",
        title: this.name,
        width: this.width
    }
};

ObjectTrack.prototype.setProperties = function (props) {
    Utils.setIfNotNull(this, 'id', props.idObjectTrack);
    Utils.setIfNotNull(this, 'name', props.title);
    Utils.setIfNotNull(this, 'showTitle', props.showTitle);
    Utils.setIfNotNull(this, 'justification', Utils.lowercase(props.topJustification));
    Utils.setIfNotNull(this, 'width', props.width);
    Utils.setIfNotNull(this, 'idPlot', props.idPlot);
};

ObjectTrack.prototype.init = function (baseElement) {
    Track.prototype.init.call(this, baseElement);
    let self = this;
    this.trackContainer
        .classed('vi-object-track-container', true)
        .on('mousedown', function () {
            self.setCurrentDrawing(null);
        });

    this.svgContainer = this.plotContainer.append('svg')
        .attr('class', 'vi-track-drawing vi-track-svg-container');
}

ObjectTrack.prototype.setCurrentDrawing = function (drawing) {
    if (drawing == this.currentDrawing) return;
    this.previousDrawing = this.currentDrawing;
    this.currentDrawing = drawing;

    this.highlightHeader(this.currentDrawing);
    this.highlightHeader(this.previousDrawing);
}

ObjectTrack.prototype.plotDrawing = function (drawing) {
    if (!drawing || !drawing.doPlot) return;
    let windowY = this.getWindowY();
    drawing.minY = windowY[0];
    drawing.maxY = windowY[1];
    if (drawing == this.currentDrawing) {
        drawing.doPlot(true);
        if (drawing.isObject()) {
            drawing.raise();
        }
    }
    else {
        drawing.doPlot(false);
    }
}

ObjectTrack.prototype.doPlot = function (highlight) {
    Track.prototype.doPlot.call(this, highlight);
    this.plotAllDrawings();
}

ObjectTrack.prototype.rearrangeHeaders = function () {
    this.trackContainer.selectAll('.vi-html-object-header').sort();
}

ObjectTrack.prototype.plotAllDrawings = function () {
    let self = this;
    this.drawings.forEach(function (d) {
        self.plotDrawing(d);
    });
}

ObjectTrack.prototype.getCurrentDrawing = function () {
    let current = this.currentDrawing;
    if (current && current.isObject && current.isObject()) return current;
    return null;
}

ObjectTrack.prototype.setMode = function (newMode) {
    this.mode = newMode;
    this.trackContainer.style('cursor', newMode == null ? 'default' : 'copy');
}

ObjectTrack.prototype.addObjectHeader = function (object) {
    let self = this;

    let header = this.drawingHeaderContainer.append('div')
        .attr('class', 'vi-object-header')
        .style('border', this.HEADER_ITEM_BORDER_WIDTH + 'px solid black')
        .style('margin-bottom', this.HEADER_ITEM_MARGIN_BOTTOM + 'px')
        .on('mousedown', function () {
            self.setCurrentDrawing(object);
        });

    header.append('div')
        .attr('class', 'vi-drawing-header-highlight-area vi-drawing-header-name vi-object-header-name');

    let rect = header.node().getBoundingClientRect();
    header.append('svg')
        .attr('class', 'vi-drawing-header-fill vi-object-header-fill')
        .attr('width', rect.width)
        .attr('height', rect.height);
    return header;
}

ObjectTrack.prototype.addObject = function (config, $scope, wiApiService, __Utils) {
    let self = this;
    config.idObjectTrack = this.id;

    if (config.minY == null) config.minY = this.minY;
    if (config.maxY == null) config.maxY = this.maxY;
    if (config.minX == null) config.minX = d3.min(this.getViewportX());
    if (config.maxX == null) config.maxX = d3.max(this.getViewportX());

    let object = new ObjectOfTrack(config);
    object.init(this.plotContainer, $scope, wiApiService, __Utils);
    object.header = this.addObjectHeader(object);
    object.on('mousedown', function () {
        self.drawingMouseDownCallback(object);
    });
    this.drawings.push(object);
    return object;
}

ObjectTrack.prototype.plotObject = function (object) {
    if (object && object.isObject && object.isObject())
        this.plotDrawing(object);
}

ObjectTrack.prototype.setCurrentQuest = function (newQuest) {
    this.currentQuest = newQuest;
}

ObjectTrack.prototype.getCurrentQuest = function () {
    return this.currentQuest;
}

ObjectTrack.prototype.removeDrawing = function (drawing) {
    if (!drawing) return;
    drawing.destroy();
    let idx = this.drawings.indexOf(drawing);
    this.drawings.splice(idx, 1);

    if (drawing == this.currentDrawing)
        this.currentDrawing = null;
}

ObjectTrack.prototype.removeObject = function (object) {
    if (!object || !object.isObject || !object.isObject()) return;
    this.removeDrawing(object);
}

ObjectTrack.prototype.onObjectMouseDown = function (object, cb) {
    let self = this;
    object.on('mousedown', function () {
        self.drawingMouseDownCallback(object);
        // object.raise();
        self.plotObject(object);
        cb();
    });
}

ObjectTrack.prototype.drawingMouseDownCallback = function (drawing) {
    this.setCurrentDrawing(drawing);
    d3.event.stopPropagation();
}

ObjectTrack.prototype.plotAllDrawings = function () {
    let self = this;
    this.drawings.forEach(function (d) {
        self.plotDrawing(d);
    });
}

ObjectTrack.prototype.highlightHeader = function (drawing) {
    if (!drawing || !drawing.header) return;
    let self = this;
    drawing.header.select('.vi-drawing-header-highlight-area')
        .style('background-color', drawing == self.currentDrawing ? self.HEADER_HIGHLIGHT_COLOR : 'white');
};

ObjectTrack.prototype.onObjectHeaderMouseDown = function (object, callback) {
    let self = this;
    object.header.on('mousedown', function () {
        self.drawingMouseDownCallback(object);
        self.plotObject(object);
        callback();
    });
};
