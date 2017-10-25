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

    this.minY = config.minY;
    this.maxY = config.maxY;
    this.unit = config.unit || 'm';

    this.yTicks = config.yTicks || 10;
    this.yDecimal = (config.decimal == null) ? 2 : config.decimal;

    this.MIN_WIDTH = 60;
}

/**
 * Initialize DOM elements for the track
 * param {Object} domElem - The DOM element to contain the track
 */
DepthTrack.prototype.init = function(baseElement) {
    Track.prototype.init.call(this, baseElement);

    this.svgContainer = this.plotContainer.append('svg')
        .attr('class', 'vi-track-drawing')
        .style('overflow', 'visible');

    this.yAxisGroupLeft = this.svgContainer.append('g')
        .attr('class', 'vi-track-axis')

    this.yAxisGroupRight = this.svgContainer.append('g')
        .attr('class', 'vi-track-axis')

    this.drawingHeaderContainer.append('div')
        .attr('class', 'vi-track-unit')
        .style('border', this.HEADER_ITEM_BORDER_WIDTH + 'px solid black');
}

DepthTrack.prototype.getProperties = function() {
    return {
        idDepthAxis: this.id,
        idPlot: this.idPlot,
        orderNum: this.orderNum,
        showTitle: this.showTitle,
        title: this.name,
        trackBackground: this.bgColor,
        geometryWidth: this.width,
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
    Utils.setIfNotNull(this, 'bgColor', props.trackBackground);
    Utils.setIfNotNull(this, 'width', props.geometryWidth);
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

    // let start = windowY[0];
    // let end = windowY[1];
    // let step = (end - start) / this.yTicks;
    // let yAxisRight = d3.axisLeft(transformY)
    //     .tickValues(d3.range(start, end + step / 2, step))
    //     .tickFormat(self.getDecimalFormatter(self.yDecimal))
    //     .tickSize(5);


    let step = Math.pow(10, Math.round(Math.log((windowY[1] - windowY[0]) / this.yTicks) / Math.log(10))) * 2;
    let start = Utils.roundUp(windowY[0], step);
    let end = Utils.roundDown(windowY[1], step);
    let yAxisRight = d3.axisLeft(transformY)
        .tickValues(d3.range(start, end + step / 2, step))
        .tickFormat(self.getDecimalFormatter(self.yDecimal))
        .tickSize(5);

    let yAxisLeft = d3.axisRight(transformY)
        .tickValues(d3.range(start, end + step, step))
        .tickFormat('')
        .tickSize(5);

    this.yAxisGroupRight.call(yAxisRight);
    this.yAxisGroupLeft.call(yAxisLeft);
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