var Utils = require('./visualize-utils.js');
var Track = require('./visualize-track.js');

module.exports = DepthTrack;

Utils.extend(Track, DepthTrack);

/**
 * Represents a depth track
 * @constructor
 * @param {Object} config - Contain configurations.
 * @param {Number} [config.id] - The id of this track in backend (idDepthAxis field)
 * @param {Boolean} [config.showTitle] - Flag to indicate whether to show title
 * @param {Boolean} [config.justification] - Alignment of the title (left, center, right)
 * @param {String} [config.name] - Name of the track
 * @param {Number} [config.width] - Width in pixel of the bounding rectangle. Default: 60
 * @param {Number} [config.minY] - Min y value to show
 * @param {Number} [config.maxY] - Max y value to show
 * @param {String} [config.unit] - Depth unit. Default: 'm'
 * @param {Number} [config.yTicks] - Number of ticks shown in y axis. Default: 10
 * @param {Number} [config.xPadding] - Horizontal padding for inner drawings. Default: 1
 * @param {Number} [config.yPadding] - Vertical padding for inner drawings. Default: 5
 * @param {Number} [config.yStep] - Y gap between two consecutive points
 * @param {String} [config.bgColor] - Background color for the track
 * @param {Number} [config.decimal] - Precision of float number. Default: 2
 */
function DepthTrack(config) {
    Track.call(this, config);

    this.id = config.id;
    this.idPlot = config.idPlot;

    this.name = config.name || 'Depth';
    this.width = config.width || 60;

    this.unit = config.unit || 'm';

    this.yTicks = config.yTicks || 10;
    this.yDecimal = (config.decimal == null) ? 2 : config.decimal;

    this.MIN_WIDTH = 0;
}

/**
 * Initialize DOM elements for the track
 * param {Object} domElem - The DOM element to contain the track
 */
DepthTrack.prototype.init = function(baseElement) {
    Track.prototype.init.call(this, baseElement);

    this.trackContainer
        .classed('vi-depth-track-container', true);

    this.axisContainer = this.plotContainer.append('svg')
        .attr('class', 'vi-track-drawing vi-track-axis-container')
        .style('cursor', 'crosshair')
        .style('overflow', 'visible');

    this.svgContainer = this.plotContainer.append('svg')
        .attr('class', 'vi-track-drawing vi-track-svg-container')
        .style('cursor', 'crosshair');

    this.yAxisGroupLeft = this.axisContainer.append('g')
        .attr('class', 'vi-track-axis')

    this.yAxisGroupRight = this.axisContainer.append('g')
        .attr('class', 'vi-track-axis')

    this.drawingHeaderContainer.append('div')
        .attr('class', 'vi-track-unit')
        .style('border', this.HEADER_ITEM_BORDER_WIDTH + 'px solid black')
        .style('padding', '1.5 0');
}

DepthTrack.prototype.getProperties = function() {
    return {
        idDepthAxis: this.id,
        idPlot: this.idPlot,
        orderNum: this.orderNum,
        showTitle: this.showTitle,
        title: this.name,
        color: this.bgColor,
        width: this.width,
        justification: Utils.capitalize(this.justification),
        depthType: 'MD',
        unitType: this.unit,
        decimals: this.yDecimal
    };
}

DepthTrack.prototype.setProperties = function(props) {
    Utils.setIfNotNull(this, 'id', props.idDepthAxis);
    Utils.setIfNotNull(this, 'idPlot', props.idPlot);
    Utils.setIfNotNull(this, 'orderNum', props.orderNum);
    Utils.setIfNotNull(this, 'showTitle', props.showTitle);
    Utils.setIfNotNull(this, 'name', props.title);
    Utils.setIfNotNull(this, 'bgColor', props.color);
    Utils.setIfNotNull(this, 'width', props.width);
    Utils.setIfNotNull(this, 'justification', Utils.lowercase(props.justification));
    Utils.setIfNotNull(this, 'unit', props.unitType);
    Utils.setIfNotNull(this, 'yDecimal', props.decimals);
}

/**
 * Actually draw the track
 * @param {Boolean} [highlight] - Indicate whether to call highlight callback
 */
DepthTrack.prototype.doPlot = function(highlight) {
    Track.prototype.doPlot.call(this, highlight);

    let self = this;
    let windowY = this.getWindowY();
    let transformY = this.getTransformY();

    let ticks = this.prepareTicks();
    let shownTicks = ticks.filter(function(d) {
        return d >= windowY[0];
    })

    let yAxisRight = d3.axisLeft(transformY)
        .tickValues(shownTicks)
        .tickFormat(function(d) {
            return majorTest(d) ? self.getDecimalFormatter(self.yDecimal)(d) : '';
        })
        .tickSize(5);

    let yAxisLeft = d3.axisRight(transformY)
        .tickValues(shownTicks)
        .tickFormat('')
        .tickSize(5);

    this.yAxisGroupRight.call(yAxisRight);
    this.yAxisGroupLeft.call(yAxisLeft);

    let plotDim = Utils.getBoundingClientDimension(this.plotContainer.node());
    this.yAxisGroupRight.selectAll('text')
        .attr('x', function() {
            let textDim = this.getBBox();
            if (plotDim.width < textDim.width) return 0;
            return -plotDim.width / 2 + textDim.width / 2;
        });

    // this.yAxisGroupRight.selectAll('g.tick line')
    //     .attr('x2', function(d) {
    //         if (majorTest(d)) return -7;
    //         return -5;
    //     });

    // this.yAxisGroupLeft.selectAll('g.tick line')
    //     .attr('x2', function(d) {
    //         if (majorTest(d)) return 7;
    //         return 5;
    //     });

    function majorTest(d) {
        return ticks.indexOf(d) % 5 == 0;
    }
}

/**
 * Register event when mouse down the depth track
 * @param {Function} mouseDownCallback
 */
DepthTrack.prototype.onMouseDown = function(mouseDownCallback) {
    this.trackContainer.on('mousedown', function() {
        mouseDownCallback();
    });
}

/**
 * Update track header
 */
DepthTrack.prototype.updateHeader = function() {
    Track.prototype.updateHeader.call(this);

    this.drawingHeaderContainer.select('.vi-track-unit')
        .html(this.unit + '<br>' + '1:' + this.scale);
}

/**
 * Update body container
 */
DepthTrack.prototype.updateBody = function() {
    Track.prototype.updateBody.call(this);

    this.yAxisGroupRight
        .style('transform', 'translateX(' + this.plotContainer.node().clientWidth + 'px)');
}

/**
 * Update scale in header
 */
DepthTrack.prototype.updateScale = function (scale) {
    this.scale = scale;
    this.updateHeader();
}

DepthTrack.prototype.drawTooltipLines = function(depth, drawVertical) {
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

DepthTrack.prototype.removeTooltipLines = function() {
    this.svgContainer.selectAll('line.tooltip-line').remove();
}

DepthTrack.prototype.drawTooltipText = function(depth, showDepth) {
    let plotMouse = d3.mouse(this.plotContainer.node());
    let plotRect = Utils.getBoundingClientDimension(this.plotContainer.node());
    let y = this.getTransformY()(depth);
    let svg = this.svgContainer;

    svg.selectAll('text.tooltip-text, rect.tooltip-rect').remove();
    let tooltip = svg.append('text')
        .attr('class', 'tooltip-text')
        .attr('y', y);

    let yFormatter = this.getDecimalFormatter(this.yDecimal);

    let textData = [{
        text: ''+yFormatter(this.getTransformY().invert(y)),
        color: 'black'
    }];

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

    Utils.alignSvg(rect, this.plotContainer, Utils.ALIGN.CENTER_X);
    let x = parseFloat(rect.attr('x')) + padding;
    tooltip.selectAll('tspan')
        .attr('x', x);

    tooltip.raise();
}

DepthTrack.prototype.removeTooltipText = function() {
    this.svgContainer.selectAll('text.tooltip-text, rect.tooltip-rect').remove();
}
