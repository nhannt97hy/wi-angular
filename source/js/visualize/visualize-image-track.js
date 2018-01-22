let Utils = require('./visualize-utils');
let Track = require('./visualize-track');
let ImageZone = require('./visualize-image-zone');

module.exports = ImageTrack;

Utils.extend(Track, ImageTrack);

function ImageTrack(config) {
    Track.call(this, config);
    this.MIN_WIDTH = 0;

    this.id = config.id || config.idImageTrack;
    this.idPlot = config.idPlot;

    this.name = config.name || 'Image';
    this.width = config.width || this.MIN_WIDTH;
    this.minY = config.minY;
    this.maxY = config.maxY;

    this.drawings = config.imgzones || []; // Array of visualize imgzones

    this.currentDrawing = null;
    this.previousDrawing = null;
    this.mode = null;
}

ImageTrack.prototype.getProperties = function() {
    return {
        idImageTrack: this.id,
        title: this.name,
        showTitle: this.showTitle,
        topJustification: Utils.capitalize(this.justification),
        bottomJustification: 'Center',
        background: Utils.convertColorToRGB(this.bgColor),
        width: this.width
    }
}

ImageTrack.prototype.setProperties = function(props) {
    Utils.setIfNotNull(this, 'id', props.idImageTrack);
    Utils.setIfNotNull(this, 'idPlot', props.idPlot);
    Utils.setIfNotNull(this, 'name', props.title);
    Utils.setIfNotNull(this, 'showTitle', props.showTitle);
    Utils.setIfNotNull(this, 'justification', Utils.lowercase(props.topJustification));
    Utils.setIfNotNull(this, 'bgColor', Utils.convertColorToRGB(props.background));
    Utils.setIfNotNull(this, 'width', props.width);
}

ImageTrack.prototype.setMode = function(newMode) {
    this.mode = newMode;
    this.trackContainer.style('cursor', newMode == null ? 'default' : 'copy');
}

ImageTrack.prototype.getImages = function () {
    return this.drawings.filter(function (d) {
        return d.isImageZone();
    });
}

ImageTrack.prototype.getCurrentImageZone = function() {
    let current = this.currentDrawing;
    if (current && current.isImageZone && current.isImageZone()) return current;
    return null;
}

ImageTrack.prototype.getCurrentDrawing = function() {
    return this.currentDrawing;
}

ImageTrack.prototype.setCurrentDrawing = function(drawing) {
    if (drawing == this.currentDrawing) return;
    this.previousDrawing = this.currentDrawing;
    this.currentDrawing = drawing;

    this.plotDrawing(this.previousDrawing);
    this.plotDrawing(this.currentDrawing);

    this.highlightHeader(this.previousDrawing);
    this.highlightHeader(this.currentDrawing);
}

ImageTrack.prototype.init = function(baseElement) {
    Track.prototype.init.call(this, baseElement);
    let self = this;
    this.trackContainer
        .classed('vi-image-track-container', true)
        .on('mousedown', function() {
            self.setCurrentDrawing(null);
        });

    this.svgContainer = this.plotContainer.append('svg')
        .attr('class', 'vi-track-drawing vi-track-svg-container');
}


ImageTrack.prototype.doPlot = function(highlight) {
    Track.prototype.doPlot.call(this, highlight);
    this.plotAllDrawings();
    this.rearrangeHeaders();
}

ImageTrack.prototype.rearrangeHeaders = function() {
    d3.select('.vi-track-drawing-header-container').selectAll('.vi-image-zone-header').sort(function (a, b) {
        return a.dataset.topdepth.localeCompare(b.dataset.topdepth);
    });
}

ImageTrack.prototype.plotAllDrawings = function() {
    let self = this;
    this.drawings.forEach(function(d) {
        self.plotDrawing(d);
    });
}

ImageTrack.prototype.plotDrawing = function(drawing) {
    if (!drawing || !drawing.doPlot) return;
    let windowY = this.getWindowY();
    drawing.minY = windowY[0];
    drawing.maxY = windowY[1];
    if (drawing == this.currentDrawing) {
        drawing.doPlot(true);
        if (drawing.isImageZone())
            drawing.svgGroup.raise();
        else
            drawing.raise();
    }
    else {
        drawing.doPlot(false);
    }
}

ImageTrack.prototype.plotImageZone = function(imgzone) {
    if (imgzone && imgzone.isImageZone && imgzone.isImageZone())
        this.plotDrawing(imgzone);
}

ImageTrack.prototype.addImageZone = function(config, track) {
    let self = this;
    if (!config.fill) {
        config.fill = 'white';
    }
    if (config.minY == null) config.minY = track.minY;
    if (config.maxY == null) config.maxY = track.maxY;
    let imgzone = new ImageZone(config);
    imgzone.init(this.plotContainer);
    if (config.imageUrl) {
        imgzone.doPlot(true);
        imgzone.drawImage(config, true);
    }
    imgzone.header = this.addImageZoneHeader(imgzone, true);
    imgzone.on('mousedown', function() {
        self.drawingMouseDownCallback(imgzone);
    });
    this.drawings.push(imgzone);
    return imgzone;
}

ImageTrack.prototype.adjustImage = function(img) {
    let self = this;
    img.topDepth = Math.round(img.topDepth * 10000) / 10000;
    img.bottomDepth = Math.round(img.bottomDepth * 10000) / 10000;
    self.plotImageZone(img);
    return img;
}

ImageTrack.prototype.removeDrawing = function(drawing) {
    if (!drawing) return;
    drawing.destroy();
    let idx = this.drawings.indexOf(drawing);
    this.drawings.splice(idx, 1);

    if (drawing == this.currentDrawing)
        this.currentDrawing = null;
}

ImageTrack.prototype.removeAllDrawings = function() {
    let self = this;
    this.getImages().forEach(function (img) {
        self.removeImage(img);
    })
}

ImageTrack.prototype.removeImage = function(imgzone) {
    if (!imgzone || !imgzone.isImageZone || !imgzone.isImageZone()) return;
    this.removeDrawing(imgzone);
}

ImageTrack.prototype.addImageZoneHeader = function(imgzone, isNew) {
    let self = this;

    let header;

    if (isNew) {
        header = this.drawingHeaderContainer.append('div')
            .attr('class', 'vi-image-zone-header')
            .attr('data-topdepth', imgzone.topDepth)
            .style('border', this.HEADER_ITEM_BORDER_WIDTH + 'px solid black')
            .style('margin-bottom', this.HEADER_ITEM_MARGIN_BOTTOM + 'px')
    } else {
        header = this.drawingHeaderContainer.select('#id' + imgzone.idImageOfTrack);
    }

    if (imgzone.showName) {
        header.append('div')
            .attr('class', 'vi-drawing-header-highlight-area vi-drawing-header-name vi-image-zone-header-name');
    }

    if (isNew) {
        let rect = header.node().getBoundingClientRect();
        
        header.append('svg')
            .attr('class', 'vi-drawing-header-fill vi-image-zone-header-fill')
            .attr('width', rect.width)
            .attr('height', rect.height);
    }

    return header;
}

ImageTrack.prototype.drawingMouseDownCallback = function(drawing) {
    this.setCurrentDrawing(drawing);
    d3.event.stopPropagation();
    this.trackContainer.node().focus();
}

ImageTrack.prototype.drawingHeaderMouseDownCallback = function(drawing) {
    this.setCurrentDrawing(drawing);
}

ImageTrack.prototype.onImageZoneMouseDown = function(imgzone, cb) {
    let self = this;
    imgzone.on('mousedown', function() {
        self.drawingMouseDownCallback(imgzone);
        d3.select(this).raise();
        cb();
    });
}

ImageTrack.prototype.onImageZoneHeaderMouseDown = function(imgzone, cb) {
    let self = this;
    imgzone.header.on('mousedown', function() {
        self.drawingHeaderMouseDownCallback(imgzone);
        self.plotImageZone(imgzone);
        cb();
    });
}

ImageTrack.prototype.highlightHeader = function(drawing) {
    if (!drawing || !drawing.header) return;
    let self = this;
    drawing.header.select('.vi-drawing-header-highlight-area')
        .style('background-color', drawing == self.currentDrawing ? self.HEADER_HIGHLIGHT_COLOR : 'white');
}