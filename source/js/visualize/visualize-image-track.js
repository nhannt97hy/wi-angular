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
        width: this.width,
        zoomFactor: this.zoomFactor
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
    Utils.setIfNotNull(this, 'zoomFactor', props.zoomFactor);
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

    // this.svgContainer = this.plotContainer.append('svg')
    //     .attr('class', 'vi-track-drawing vi-track-svg-container');
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

/****************** MOVE TO SUPPER CLASS ************************
ImageTrack.prototype.drawTooltipLines = function(depth, drawVertical) {
    let plotRect = Utils.getBoundingClientDimension(this.plotContainer.node());
    let svg = this.svgContainer;
    let y = this.getTransformY()(depth);
    let x = d3.mouse(this.plotContainer.node())[0];
    let lineData = drawVertical ? [
        {x1: x, y1: 0, x2: x, y2: plotRect.height},
        {x1: 0, y1: y, x2: plotRect.width, y2: y}
    ] : [
        {x1: 0, y1: y, x2: plotRect.width, y2: y}
    ];

    let lines = svg.selectAll('line.tooltip-line')
        .data(lineData);

    lines.enter().append('line')
        .attr('class', 'tooltip-line');

    lines
        .attr('x1', function(d) { return d.x1; })
        .attr('x2', function(d) { return d.x2; })
        .attr('y1', function(d) { return d.y1; })
        .attr('y2', function(d) { return d.y2; });
}

ImageTrack.prototype.removeTooltipLines = function() {
    this.svgContainer.selectAll('line.tooltip-line').remove();
}

ImageTrack.prototype.drawTooltipText = function(depth, showDepth) {

    let plotMouse = d3.mouse(this.plotContainer.node());
    let plotRect = Utils.getBoundingClientDimension(this.plotContainer.node());
    let y = this.getTransformY()(depth);
    let svg = this.svgContainer;

    svg.selectAll('text.tooltip-text, rect.tooltip-rect').remove();
    let tooltip = svg.append('text')
        .attr('class', 'tooltip-text')
        .attr('y', y);

    let yFormatter = this.getDecimalFormatter(2);

    let textData = showDepth ? [{
        text: 'Depth: ' + yFormatter(this.getTransformY().invert(y)),
        color: 'black'
    }] : [];
    if(!showDepth) {
        this.removeTooltipText()
        return;
    }

    tooltip.selectAll('tspan')
        .data(textData)
        .enter()
        .append('tspan')
            .style('fill', function(d) { return d.color; })
            .attr('dy', '1.2em')
            .text(function(d) { return d.text; });

    let bbox = tooltip.node().getBBox();
    let offset = 20;
    let rectX = bbox.x + offset;
    let rectY = bbox.y - offset - bbox.height;

    if (rectY < 0) rectY = bbox.y + offset - 10;

    tooltip.attr('y', rectY).selectAll('tspan').attr('x', rectX);

    bbox = tooltip.node().getBBox();
    let padding = 2;
    let rect = svg.append('rect')
        .attr('class', 'tooltip-rect')
        .attr('y', bbox.y - padding)
        .attr('width', bbox.width + padding*2)
        .attr('height', bbox.height + padding*2);

    Utils.alignSvg(rect, this.plotContainer, Utils.ALIGN.RIGHT);
    let x = parseFloat(rect.attr('x')) + padding;
    tooltip.selectAll('tspan')
        .attr('x', x);
    Utils.alignSvg(rect, this.plotContainer, Utils.ALIGN.TOP);
    y = parseFloat(rect.attr('y'));
    tooltip.attr('y', y)

    tooltip.raise();
}

ImageTrack.prototype.removeTooltipText = function() {
    this.svgContainer.selectAll('text.tooltip-text, rect.tooltip-rect').remove();
}
****************** END MOVE TO SUPPER CLASS *********************/
