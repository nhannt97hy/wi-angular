let Utils = require('./visualize-utils');
let Drawing = require('./visualize-drawing');
let CanvasHelper = require('./visualize-canvas-helper');

module.exports = ImageZone;

Utils.extend(Drawing, ImageZone);

function ImageZone(config) {
    Drawing.call(this, config);

    this.idImageTrack = config.idImageTrack;
    this.idImageOfTrack = config.idImageOfTrack;

    this.fill = config.fill || 'white';

    this.name = config.name || '';
    this.showName = config.showName == null ? false : config.showName;

    this.imageUrl = config.imageUrl || '';
    this.done = config.done || false;

    this.topDepth = config.topDepth;
    this.bottomDepth = config.bottomDepth;
}

ImageZone.prototype.getProperties = function() {
    return {
        idImageTrack: this.idImageTrack,
        idImageOfTrack: this.idImageOfTrack,
        name: this.name,
        showName: this.showName,
        topDepth: this.topDepth,
        bottomDepth: this.bottomDepth,
        imageUrl: this.imageUrl,
        done: this.done,
        fill: this.fill
    }
}

ImageZone.prototype.setProperties = function(props) {
    Utils.setIfNotNull(this, 'idImageTrack', props.idImageTrack);
    Utils.setIfNotNull(this, 'idImageOfTrack', props.idImageOfTrack);
    Utils.setIfNotNull(this, 'name', props.name);
    Utils.setIfNotNull(this, 'showName', props.showName);
    Utils.setIfNotNull(this, 'topDepth', props.topDepth);
    Utils.setIfNotNull(this, 'bottomDepth', props.bottomDepth);
    Utils.setIfNotNull(this, 'fill', props.fill);
    Utils.setIfNotNull(this, 'imageUrl', props.imageUrl);
    Utils.setIfNotNull(this, 'done', props.done);

    if (this.topDepth > this.bottomDepth) {
        let tmp = this.topDepth;
        this.topDepth = this.bottomDepth;
        this.bottomDepth = tmp;
    }
}

ImageZone.prototype.init = function(plotContainer) {
    Drawing.prototype.init.call(this, plotContainer);
    let self = this;

    this.svgContainer = plotContainer.select('.vi-track-svg-container');
    this.svgGroup = this.svgContainer.append('g')
        .classed('vi-image-zone-svg-group', true);

    this.rect = this.svgGroup.append('rect')
        .style('fill', 'white');

    this.foreignObject = this.svgGroup.append('foreignObject');

    this.lines = this.svgGroup.selectAll('line.vi-image-zone-line')
        .data(['', ''])
        .enter()
        .append('line')
        .attr('class', 'vi-image-zone-line');

    this.lines.call(d3.drag()
        .on('drag', function() {
            self.lineDragCallback(d3.select(this));
        })
    );
}

ImageZone.prototype.doPlot = function(highlight) {
    let self = this;

    if (this.topDepth == null || this.bottomDepth == null) return;

    let transformY = this.getTransformY();

    let viewportX = this.getViewportX();

    let minY = transformY(this.topDepth);
    let maxY = transformY(this.bottomDepth);

    let minX = d3.min(viewportX);
    let maxX = d3.max(viewportX);

    this.lines
        .data([
            { x1: minX, y1: minY, x2: maxX, y2: minY },
            { x1: minX, y1: maxY, x2: maxX, y2: maxY }
        ])
        .attr('x1', function(d) { return d.x1; })
        .attr('x2', function(d) { return d.x2; })
        .attr('y1', function(d) { return d.y1; })
        .attr('y2', function(d) { return d.y2; })
        .attr('stroke', 'gray')
        .attr('stroke-width', highlight ? 5 : 2);

    this.rect
        .attr('x', minX)
        .attr('y', minY)
        .attr('width', maxX - minX)
        .attr('height', maxY - minY)
        .style('position', 'relative');

    this.updateHeader();

    self.onViewportChange(minX, maxX, minY, maxY);    
}

ImageZone.prototype.on = function(type, cb) {
    this.svgGroup.on(type, cb);
}

ImageZone.prototype.changeImage = function(config) {
    if (!config) return;
    this.rect
        .style('fill', config.fill);
    this.foreignObject
        .select('img')
        .attr('class', 'img-responsive')
        .attr('src', config.imageUrl)
        .style('object-fit', 'contain')
        .style('width', '100%')
        .style('height', '100%');
}

ImageZone.prototype.addImage = function(config) {
    if (!config) return;
    this.rect
        .style('fill', config.fill);
    this.foreignObject
        .append('xhtml:img')
        .attr('class', 'img-responsive')
        .attr('src', config.imageUrl)
        .style('object-fit', 'contain')
        .style('width', '100%')
        .style('height', '100%');
}

ImageZone.prototype.updateHeader = function() {
    Drawing.prototype.updateHeader.call(this);
    if (!this.header) return;
    let rect = this.header.node().getBoundingClientRect();
    let headerBorderWidth = parseInt(this.header.style('border-width'));

    let width = rect.width - headerBorderWidth - 1;
    let height = rect.height - headerBorderWidth - 1;

    if (width < 0 || height < 0) return;

    let fillArea = this.header.select('.vi-drawing-header-fill')
        .attr('width', width)
        .attr('height', height);

    fillArea.selectAll('rect').remove();
    let fill = this.getProperties().fill;
    fillArea
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', height)
        .attr('fill', fill);

    this.header.datum(this.name);
}

ImageZone.prototype.lineDragCallback = function(line) {
    let self = this;

    let y = d3.mouse(this.root.node())[1];
    let transformY = this.getTransformY();

    let viewportX = this.getViewportX();

    let minX = d3.min(viewportX);
    let maxX = d3.max(viewportX);

    line
        .attr('y1', y)
        .attr('y2', y);

    let newYs = [];
    this.lines.each(function() {
        newYs.push(parseFloat(d3.select(this).attr('y1')));
    });

    let minY = d3.min(newYs);
    let maxY = d3.max(newYs);

    this.rect
        .attr('y', minY)
        .attr('height', maxY - minY);

    this.topDepth = transformY.invert(minY);
    this.bottomDepth = transformY.invert(maxY);

    self.onViewportChange(minX, maxX, minY, maxY);
}

ImageZone.prototype.onLineDragEnd = function(cb) {
    let self = this;
    xOffset = 10;
    yOffset = 30;
    this.lines.call(d3.drag()
        .on('drag', function() {
            self.lineDragCallback(d3.select(this));
        })
        .on('end', cb)
    );
}

ImageZone.prototype.getDepthRange = function(){
    return [this.topDepth, this.bottomDepth];
};

ImageZone.prototype.onViewportChange = function(minX, maxX, minY, maxY) {
    let viewportY = this.getViewportY()[1];
    // get out of viewport
    if(maxY > viewportY && minY > viewportY && minY < 0 && maxY < 0) { return; }

    // handle cases
    if ((minY == maxY)
        || (minY == viewportY)
        || (maxY == viewportY)) {
        this.foreignObject
            .attr('x', minX)
            .attr('y', minY + 2)
            .attr('width', maxX - minX)
            .attr('height', 0)
            .style('position', 'relative');
        return;
    } else if ((minY >= 0 && minY <= viewportY)
        && (maxY >= 0 && maxY <= viewportY)) {
        if (maxY - minY - 4 < 0) return;
        this.foreignObject
            .attr('x', minX)
            .attr('y', minY + 2)
            .attr('width', maxX - minX)
            .attr('height', maxY - minY - 4)
            .style('position', 'relative');
    } else if ((minY >= 0 && minY <= viewportY)
        && (maxY >= viewportY)) {
        if (viewportY - minY - 4 < 0) return;
        this.foreignObject
            .attr('x', minX)
            .attr('y', minY + 2)
            .attr('width', maxX - minX)
            .attr('height', viewportY - minY - 4)
            .style('position', 'relative');
    } else if ((minY <= 0)
        && (maxY >= 0 && maxY <= viewportY)) {
        if (maxY - 0 - 4 < 0) return;
        this.foreignObject
            .attr('x', minX)
            .attr('y', 0)
            .attr('width', maxX - minX)
            .attr('height', maxY - 0 - 4)
            .style('position', 'relative');
    } else if ((minY <= 0)
        && (maxY >= viewportY)) {
        if (viewportY - 0 - 4 < 0) return;
        this.foreignObject
            .attr('x', minX)
            .attr('y', 0)
            .attr('width', maxX - minX)
            .attr('height', viewportY - 0 - 4)
            .style('position', 'relative');
    } else if (((minY <= 0) && (maxY <= 0))
        || ((minY >= viewportY) && (maxY >= viewportY))) {
        this.foreignObject
            .attr('x', minX)
            .attr('y', 0)
            .attr('width', maxX - minX)
            .attr('height', 0)
            .style('position', 'relative');
    }
}