var utils = require('./visualize-utils.js');
var roundUp = utils.roundUp;
var roundDown = utils.roundDown;
var appendTrack = utils.appendTrack;

module.exports = DepthTrack;

function appendDepthHeader(base, unit) {
    var trackHeader = base.selectAll('.track-header');
    trackHeader.append('label')
        .attr('class', 'data-header double-height text-center')
        .text(unit);
}

/**
 * Represents a DepthTrack
 * @constructor
 * @param {Object} config - Contain configurations.
 * @param {String} [config.unit] - Depth unit. Default: 'm'
 * @param {String} [config.xAxisPosition] - Position of the x axis. Default: 'top'
 * @param {String} [config.yAxisPosition] - Position of the y axis. Default: 'left'
 * @param {Number} [config.xNTicks] - Number of ticks shown in x axis. Default: 4
 * @param {Number} [config.yNTicks] - Number of ticks shown in y axis. Default: 20
 * @param {Number} [config.plotWidth] - Width in pixel of the bounding rectangle. Default: 200
 * @param {String} [config.xFormatter] - d3 formatter for numbers in x axis. Default: 'g'
 * @param {String} [config.yFormatter] - d3 formatter for numbers in y axis. Default: 'g'
 * @param {Number} [config.yStep] - Step to scale y ordinate. Default: 1.0
 * @param {Number} [config.xPadding] - Horizontal padding for inner drawings. Default: 0
 * @param {Number} [config.yPadding] - Vertical padding for inner drawings. Default: 0
 */
function DepthTrack(config) {
    var self = this;
    var _viewportX = new Array(), _viewportY = new Array();

    if( !config ) {
        console.error("config must not be null");
        return;
    }
    var unit = config.unit || 'm';
    var trackContainer;
    var plotContainer;
    var svg;
    var clientRect;
    var yAxisGroup;
    var yAxisGroup1;
    var transformY;
    var yAxisClass = 'depthtrack';
    var yNTicks = config.yNTicks || 20;
    var plotWidth = config.plotWidth || 200;
    var yStep = config.yStep || 1.0;
    var yFormatter = d3.format(config.yFormatter || 'g');
    var xPadding = config.xPadding || 0, yPadding = config.yPadding || 0;
    this.getYStep = function() {
        return yStep;
    }

    /**
     * Initialize DOM elements for the track
     * param {Object} domElem - The DOM element to contain the track
     */
    this.init = function(baseElement) {
        trackContainer = appendTrack(baseElement, 'Depth', plotWidth);
        plotContainer = trackContainer.select('.plot-container');
        appendDepthHeader(trackContainer, unit);
        clientRect = plotContainer.node().getBoundingClientRect();

        svg = plotContainer.append('svg')
                .attr('width', clientRect.width)
                .attr('height', clientRect.height);
        yAxisGroup = svg.append('g')
            .attr('class', yAxisClass)
            .attr('transform', 'translate(' + (clientRect.width - xPadding) + ', 0)');
        yAxisGroup1 = svg.append('g')
            .attr('class', yAxisClass);
            //.attr('transform', 'translate(' + (clientRect.width - xPadding) + ', 0)');
        new ResizeSensor(plotContainer.node(), function() {
            clientRect = plotContainer.node().getBoundingClientRect();

            svg.attr('width', clientRect.width)
                .attr('height', clientRect.height);
            yAxisGroup.attr('transform', 'translate(' + (clientRect.width - xPadding) + ', 0)');
            if( _viewportY.length == 2 ) _doPlot();
        });
    }

    function _doPlot() {
        transformY = d3.scaleLinear().domain(_viewportY).range([yPadding, clientRect.height - yPadding]);
        function setupAxes() {
            var start = roundUp(_viewportY[0], yStep);
            var end = roundDown(_viewportY[1], yStep);
            var step = (end - start) / yNTicks;
            var yAxis = d3.axisLeft(transformY)
                .tickValues(d3.range(start, end + step, step))
                .tickFormat(yFormatter)
                .tickSize(5);
            var yAxis1 = d3.axisRight(transformY)
                .tickValues(d3.range(start, end + step, step))
                .tickFormat('')
                .tickSize(5);

            yAxisGroup.call(yAxis);
            yAxisGroup1.call(yAxis1);
        }
        setupAxes();
    }

    /**
     * Actually draw the track
     */
    this.doPlot = function() {
        _doPlot();
    }

    /**
     * Set y range for viewport
     */
    this.setViewportY = function(vY) {
        _viewportY[0] = vY[0];
        _viewportY[1] = vY[1];
    }

    this.onMouseDown = function(mouseDownCallback) {
        trackContainer.on('mousedown', function() {
            mouseDownCallback();
        });
    }
}

