var Utils = require('./visualize-utils.js');
var Track = require('./visualize-track.js');

module.exports = DepthTrack;

Utils.extend(Track, DepthTrack);

/**
 * Represents a depth track
 * @constructor
 * @param {Object} config - Contain configurations.
 * @param {Number} [config.id] - The id of this track in backend (idDepthAxis field)
 * @param {String} [config.type] - The type of this track ('depth-track' of 'log-track')
 * @param {Number} [config.orderNum] - The order of this track in the plot (orderNum field)
 * @param {Boolean} [config.showTitle] - Flag to indicate whether to show title
 * @param {String} [config.name] - Name of the track
 * @param {Number} [config.width] - Width in pixel of the bounding rectangle. Default: 60
 * @param {Number} [config.minY] - Min y value to show
 * @param {Number} [config.maxY] - Max y value to show
 * @param {String} [config.unit] - Depth unit. Default: 'm'
 * @param {Number} [config.yNTicks] - Number of ticks shown in y axis. Default: 10
 * @param {String} [config.yFormatter] - d3 formatter for numbers in y axis. Default: '.2f'
 * @param {Number} [config.xPadding] - Horizontal padding for inner drawings. Default: 1
 * @param {Number} [config.yPadding] - Vertical padding for inner drawings. Default: 5
 * @param {Number} [config.yStep] - Y gap between two consecutive points
 * @param {String} [config.bgColor] - Background color for the track
 */
function DepthTrack(config) {
    Track.call(this, config);

    this.id = config.id;
    this.type = config.type;
    this.orderNum = config.orderNum;

    this.showTitle = (config.showTitle == null) ? true : config.showTitle;
    this.name = config.name || 'Depth';
    this.width = config.width || 60;

    this.minY = config.minY;
    this.maxY = config.maxY;
    this.unit = config.unit || 'm';

    this.yNTicks = config.yNTicks || 10;
    this.yFormatter = config.yFormatter || '.2f';

    this.xPadding = config.xPadding || 1;
    this.yPadding = config.yPadding || 5;

    this.MIN_WIDTH = 60;
}

/**
 * Get y window of the track
 * @returns {Array} Range of x values to show
 */
DepthTrack.prototype.getWindowY = function() {
    let windowY = (this.minY != null && this.maxY != null)
        ? [this.minY, this.maxY]
        : [0, 10000];

    windowY[0] = this.offsetY + Utils.roundUp(windowY[0] - this.offsetY, this.yStep);
    windowY[1] = this.offsetY + Utils.roundDown(windowY[1] - this.offsetY, this.yStep);
    return windowY;
}

/**
 * Initialize DOM elements for the track
 * param {Object} domElem - The DOM element to contain the track
 */
DepthTrack.prototype.init = function(baseElement) {
    Track.prototype.init.call(this, baseElement);

    this.svgContainer = this.plotContainer.append('svg')
        .attr('class', 'vi-track-drawing')
        .style('position', 'absolute')
        .style('overflow', 'visible');

    this.yAxisGroupLeft = this.svgContainer.append('g')
        .attr('class', 'vi-track-axis')

    this.yAxisGroupRight = this.svgContainer.append('g')
        .attr('class', 'vi-track-axis')

    this.drawingHeaderContainer.append('div')
        .attr('class', 'vi-track-unit')
        .style('border', this.HEADER_ITEM_BORDER_WIDTH + 'px solid black');
}


/**
 * Actually draw the track
 * @param {Boolean} [highlight] - Indicate whether to call highlight callback
 */
DepthTrack.prototype.doPlot = function(highlight) {
    let self = this;
    this.updateHeader();
    this.updateBody();

    let windowY = this.getWindowY();
    let rect = this.plotContainer
        .node()
        .getBoundingClientRect();

    let transformY = d3.scaleLinear()
        .domain(windowY)
        .range([0, rect.height]);
    let start = windowY[0];
    let end = windowY[1];
    let step = (end - start) / this.yNTicks;
    let yAxisRight = d3.axisLeft(transformY)
        .tickValues(d3.range(start, end + step, step))
        .tickFormat(d3.format(self.yFormatter))
        .tickSize(5);

    let yAxisLeft = d3.axisRight(transformY)
        .tickValues(d3.range(start, end + step, step))
        .tickFormat('')
        .tickSize(5);

    this.yAxisGroupRight.call(yAxisRight);
    this.yAxisGroupLeft.call(yAxisLeft);

    Track.prototype.doPlot.call(this, highlight);
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
    this.headerNameBlock
        .text(this.name);
    this.drawingHeaderContainer.select('.vi-track-unit')
        .text(this.unit);
}

/**
 * Update body container
 */
DepthTrack.prototype.updateBody = function() {
    let rect = this.plotContainer
        .style('top', this.yPadding + 'px')
        .style('bottom', this.yPadding + 'px')
        .style('left', this.xPadding + 'px')
        .style('right', this.xPadding + 'px')
        .node()
        .getBoundingClientRect();

    this.plotContainer
        .selectAll('.vi-track-drawing')
        .attr('width', rect.width)
        .attr('height', rect.height);

    this.yAxisGroupRight
        .style('transform', 'translateX(' + rect.width + 'px)');
}
