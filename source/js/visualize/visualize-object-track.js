let Utils = require('./visualize-utils');
let Track = require('./visualize-track');
let ObjectOfTrack = require('./visualize-object');

module.exports = ObjectTrack;

Utils.extend(Track, ObjectTrack);

function ObjectTrack(config) {
    Track.call(this, config);
    this.MIN_WIDTH = 0;

    this.id = config.id || config.idObjectTrack;
    this.name = config.title || 'Object Track';
    this.width = config.width || this.MIN_WIDTH;
    this.width = (this.width < this.MIN_WIDTH)?this.MIN_WIDTH:this.width;
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
        width: this.width,
        idObjectTrack: this.id,
        zoomFactor: this.zoomFactor
    }
};

ObjectTrack.prototype.setProperties = function (props) {
    Utils.setIfNotNull(this, 'id', props.idObjectTrack);
    Utils.setIfNotNull(this, 'name', props.title);
    Utils.setIfNotNull(this, 'showTitle', props.showTitle);
    Utils.setIfNotNull(this, 'justification', Utils.lowercase(props.topJustification));
    Utils.setIfNotNull(this, 'width', props.width);
    Utils.setIfNotNull(this, 'zoomFactor', props.zoomFactor);
};

ObjectTrack.prototype.init = function (baseElement) {
    Track.prototype.init.call(this, baseElement);
    let self = this;
    this.trackContainer
        .classed('vi-object-track-container', true)
        .on('mousedown', function () {
            self.setCurrentDrawing(null);
        });

    this.svgContainer.classed('vi-object-svg-container', true);
    // this.svgContainer = this.plotContainer.append('svg')
    //     .attr('class', 'vi-track-drawing vi-track-svg-container vi-object-svg-container');
    
    this.svgTooltipContainer = this.plotContainer.append('svg')
        .attr('class', 'vi-track-drawing vi-track-svg-container vi-tooltip-svg-container')
        .attr('pointer-events', 'none');
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

ObjectTrack.prototype.addObject = function (config, wiComponentService, wiApiService) {
    let self = this;
    config.idObjectTrack = this.id;

    if (config.minY == null) config.minY = this.minY;
    if (config.maxY == null) config.maxY = this.maxY;
    if (config.minX == null) config.minX = d3.min(this.getViewportX());
    if (config.maxX == null) config.maxX = d3.max(this.getViewportX());

    let object = new ObjectOfTrack(config);
    object.init(this.plotContainer, wiComponentService, wiApiService);
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
    object.header.on('click', function() {
        self.drawingMouseDownCallback(object);
        self.plotObject(object);
    });
    object.header.on('mousedown', function () {
        callback();
    });
};

ObjectTrack.prototype.drawTooltipLines = function(depth, drawVertical) {
    let plotRect = Utils.getBoundingClientDimension(this.plotContainer.node());
    let svg = this.svgTooltipContainer;
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
    lines.raise();
}

ObjectTrack.prototype.removeTooltipLines = function() {
    this.svgTooltipContainer.selectAll('line.tooltip-line').remove();
}
ObjectTrack.prototype.drawTooltipText = function(depth, showDepth) {

    let plotMouse = d3.mouse(this.plotContainer.node());
    let plotRect = Utils.getBoundingClientDimension(this.plotContainer.node());
    let y = this.getTransformY()(depth);
    let svg = this.svgTooltipContainer;

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
        this.removeTooltipText();
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

ObjectTrack.prototype.removeTooltipText = function() {
    this.svgTooltipContainer.selectAll('text.tooltip-text, rect.tooltip-rect').remove();
}
