var Utils = require('./visualize-utils.js');
var Track = require('./visualize-track.js');

module.exports = DepthTrack;

Utils.extend(Track, DepthTrack);

/**
 * Represents a depth track
 * @constructor
 * @param {Object} config - Contain configurations.
 * @param {String} [config.unit] - Depth unit. Default: 'm'
 * @param {String} [config.xAxisPosition] - Position of the x axis. Default: 'top'
 * @param {String} [config.yAxisPosition] - Position of the y axis. Default: 'left'
 * @param {Number} [config.xNTicks] - Number of ticks shown in x axis. Default: 4
 * @param {Number} [config.yNTicks] - Number of ticks shown in y axis. Default: 20
 * @param {String} [config.xFormatter] - d3 formatter for numbers in x axis. Default: 'g'
 * @param {String} [config.yFormatter] - d3 formatter for numbers in y axis. Default: 'g'
 * @param {Number} [config.xPadding] - Horizontal padding for inner drawings. Default: 0
 * @param {Number} [config.yPadding] - Vertical padding for inner drawings. Default: 0
 * @param {Number} [config.width] - Width in pixel of the bounding rectangle. Default: 200
 */
function DepthTrack(config) {
    Track.call(this);

    this.windowY = [];
    this.unit = config.unit || 'm';
    this.yAxisClass = 'depthtrack';
    this.yNTicks = config.yNTicks || 20;
    this.width = config.width || 200;
    this.yFormatter = d3.format(config.yFormatter || 'g');
    this.xPadding = config.xPadding || 0;
    this.yPadding = config.yPadding || 0;
}
/**
 * Set background color for the track
 * @param {String} color - CSS color string
 */
DepthTrack.prototype.setBackgroundColor = function(color) {
    this.trackContainer
        .style('background-color', color)
}

/**
 * Initialize DOM elements for the track
 * param {Object} domElem - The DOM element to contain the track
 */
DepthTrack.prototype.init = function(baseElement) {
    let self = this;
    this.trackContainer = Utils.appendTrack(baseElement, 'Depth', this.width);
    this.plotContainer = this.trackContainer.select('.plot-container');
    appendDepthHeader(this.trackContainer, this.unit);
    this.clientRect = this.plotContainer.node().getBoundingClientRect();

    this.svg = this.plotContainer.append('svg')
            .attr('width', this.clientRect.width)
            .attr('height', this.clientRect.height);
    this.yAxisGroup = this.svg.append('g')
        .attr('class', this.yAxisClass)
        .attr('transform', 'translate(' + (this.clientRect.width - this.xPadding) + ', 0)');
    this.yAxisGroup2 = this.svg.append('g')
        .attr('class', this.yAxisClass);
        //.attr('transform', 'translate(' + (clientRect.width - xPadding) + ', 0)');

    new ResizeSensor(self.plotContainer.node(), function() {
        self.clientRect = self.plotContainer.node().getBoundingClientRect();

        self.svg
            .attr('width', self.clientRect.width)
            .attr('height', self.clientRect.height);
        self.yAxisGroup.attr('transform', 'translate(' + (self.clientRect.width - self.xPadding) + ', 0)');
        if( self.windowY.length == 2 ) self.doPlot();
    });
}


/**
 * Actually draw the track
 */
DepthTrack.prototype.doPlot = function () {
    let transformY = d3.scaleLinear().domain(this.windowY).range([this.yPadding, this.clientRect.height - this.yPadding]);
    var start = Utils.roundUp(this.windowY[0], 1);
    var end = Utils.roundDown(this.windowY[1], 1);
    var step = (end - start) / this.yNTicks;
    var yAxis = d3.axisLeft(transformY)
        .tickValues(d3.range(start, end + step, step))
        .tickFormat(this.yFormatter)
        .tickSize(5);
    var yAxis1 = d3.axisRight(transformY)
        .tickValues(d3.range(start, end + step, step))
        .tickFormat('')
        .tickSize(5);

    this.yAxisGroup.call(yAxis);
    this.yAxisGroup2.call(yAxis1);
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

function appendDepthHeader(base, unit) {
    var trackHeader = base.selectAll('.track-header-viewport');
    trackHeader.append('label')
        .attr('class', 'data-header double-height text-center')
        .text(unit);
}
