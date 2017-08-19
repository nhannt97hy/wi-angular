let Utils = require('./visualize-utils');
let Track = require('./visualize-track');
let Zone = require('./visualize-zone');

module.exports = ZoneTrack;

Utils.extend(Track, ZoneTrack);

/**
 * Represents a zone track
 * @constructor
 * @param {Object} config - Contain configurations.
 * @param {Number} [config.id] - The id of this track in backend (idZoneTrack field)
 * @param {String} [config.type] - The type of this track ('depth-track' or 'log-track' or 'zone-track')
 * @param {Boolean} [config.showTitle] - Flag to indicate whether to show title
 * @param {Boolean} [config.justification] - Alignment of the title (left, center, right)
 * @param {String} [config.name] - Name of the track
 * @param {Number} [config.width] - Width in pixel of the bounding rectangle. Default: 60
 * @param {Number} [config.minY] - Min y value to show
 * @param {Number} [config.maxY] - Max y value to show
 * @param {String} [config.bgColor] - Background color for the track
 * @param {Number} [config.yDecimal] - Precision of float number. Default: 2
 * @param {Number} [config.idZoneSet] - The id of the zoneset in backend
 * @param {Number} [config.nameZoneSet] - The name of the zoneset
 * @param {Array} [config.zones] - Visualize zones in this zoneset
 * @param {Number} [config.xPadding] - Horizontal padding for inner drawings. Default: 1
 * @param {Number} [config.yPadding] - Vertical padding for inner drawings. Default: 5
 */
function ZoneTrack(config) {
    Track.call(this, config);
    this.MIN_WIDTH = 120;

    this.id = config.id;
    this.name = config.name || 'Zone';
    this.width = config.width || this.MIN_WIDTH;
    this.minY = config.minY;
    this.maxY = config.maxY;
    this.yDecimal = (config.decimal == null) ? 2 : config.decimal;

    this.idZoneSet = config.idZoneSet;
    this.nameZoneSet = config.nameZoneSet;
    this.zones = config.zones || []; // Array of visualize zones

    this.currentZone = null;
    this.previousZone = null;
}

/**
 * @returns {Object} Params to send to backend
 */
ZoneTrack.prototype.getProperties = function() {
    return {
        idZoneTrack: this.id,
        title: this.name,
        showTitle: this.showTitle,
        topJustification: Utils.capitalize(this.justification),
        bottomJustification: 'Center',
        color: Utils.convertColorToRGB(this.color),
        width: this.width,
        nameZoneSet: this.nameZoneSet,
        idZoneSet: this.idZoneSet
    }
}

/**
 * @param {Object} props - New properties of zone track
 */
ZoneTrack.prototype.setProperties = function(props) {
    Utils.setIfNotNull(this, 'id', props.idZoneTrack);
    Utils.setIfNotNull(this, 'name', props.title);
    Utils.setIfNotNull(this, 'showTitle', props.showTitle);
    Utils.setIfNotNull(this, 'justification', Utils.lowercase(props.topJustification));
    Utils.setIfNotNull(this, 'color', Utils.convertColorToRGB(props.color));
    Utils.setIfNotNull(this, 'width', props.width);
    Utils.setIfNotNull(this, 'nameZoneSet', props.nameZoneSet);
    Utils.setIfNotNull(this, 'idZoneSet', props.idZoneSet);

    let self = this;
    if (!props.zones) return;
    props.zones.forEach(function(z) {
        self.addZone(z);
    })
}

/**
 * @returns {Array} All visualize zones in this track
 */
ZoneTrack.prototype.getZones = function() {
    return this.zones;
}

/**
 * @returns {Object} The current visualize zone object
 */
ZoneTrack.prototype.getCurrentZone = function() {
    return this.currentZone;
}

/**
 * @param {Object} drawing - The new drawing to set current
 */
ZoneTrack.prototype.setCurrentDrawing = function(drawing) {
    this.setCurrentZone(drawing);
}

/**
 * @param {Object} zone - The new zone to set current
 */
ZoneTrack.prototype.setCurrentZone = function(zone) {
    if (zone == this.currentZone) return;
    this.previousZone = this.currentZone;
    this.currentZone = zone;

    this.plotZone(this.previousZone);
    this.plotZone(this.currentZone);

    this.highlightHeader(this.previousZone);
    this.highlightHeader(this.currentZone);
}

/**
 * Initialize DOM elements for the track
 * param {Object} domElem - The DOM element to contain the track
 */
ZoneTrack.prototype.init = function(baseElement) {
    Track.prototype.init.call(this, baseElement);
    this.trackContainer
        .classed('vi-zone-track-container', true);

    this.svgContainer = this.plotContainer.append('svg')
        .attr('class', 'vi-track-drawing vi-track-svg-container');
}


/**
 * Actually draw the track
 * @param {Boolean} [highlight] - Indicate whether to call highlight callback
 */
ZoneTrack.prototype.doPlot = function(highlight) {
    Track.prototype.doPlot.call(this, highlight);
    this.plotAllZones();
}

/**
 * Plot all zones
 */
ZoneTrack.prototype.plotAllZones = function() {
    let self = this;
    this.zones.forEach(function(z) {
        self.plotZone(z);
    });
}

/**
 * Plot a specific zone
 * @param {Object} zone - a visualize zone
 */
ZoneTrack.prototype.plotZone = function(zone) {
    if (!zone || !zone.doPlot) return;
    let windowY = this.getWindowY();
    zone.minY = windowY[0];
    zone.maxY = windowY[1];
    zone.doPlot(zone == this.currentZone);
}

/**
 * Add a zone to zone track
 */
ZoneTrack.prototype.addZone = function(config) {
    if (!config.name) config.name = '' + this.zones.length;
    let zone = new Zone(config);
    zone.init(this.plotContainer);
    zone.header = this.addZoneHeader(zone);
    this.zones.push(zone);
    return zone;
}

/**
 * @params {Object} zone - The zone to remove
 */
ZoneTrack.prototype.removeZone = function(zone) {
    if (!zone) return;
    zone.destroy();
}

/**
 * Add a zone header to zone track
 */
ZoneTrack.prototype.addZoneHeader = function(zone) {
    let self = this;

    let header = this.drawingHeaderContainer.append('div')
        .attr('class', 'vi-zone-header')
        .style('border', this.HEADER_ITEM_BORDER_WIDTH + 'px solid black')
        .style('margin-bottom', this.HEADER_ITEM_MARGIN_BOTTOM + 'px')
        .on('mousedown', function() {
            self.zoneHeaderMouseDownCallback(zone);
        });

    let nameBlock = header.append('div')
        .attr('class', 'vi-drawing-header-name vi-zone-header-name');

    return header;
}

ZoneTrack.prototype.onZoneHeaderMouseDown = function(zone, cb) {
    let self = this;
    zone.header
        .on('mousedown', function() {
            self.zoneHeaderMouseDownCallback(zone);
            cb();
        });
}

ZoneTrack.prototype.zoneHeaderMouseDownCallback = function(zone) {
    this.setCurrentZone(zone);
}

ZoneTrack.prototype.highlightHeader = function(zone) {
    if (!zone) return;
    let self = this;
    zone.header.select('.vi-drawing-header-name')
        .style('background-color', zone == self.currentZone ? self.HEADER_HIGHLIGHT_COLOR : 'white');
}
