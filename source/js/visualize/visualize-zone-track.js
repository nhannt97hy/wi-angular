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
    this.drawings = config.zones || []; // Array of visualize zones

    this.currentDrawing = null;
    this.previousDrawing = null;
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
    return this.drawings.filter(function(d) {
        return d.isZone();
    });
}

/**
 * @returns {Object} The current visualize zone object
 */
ZoneTrack.prototype.getCurrentZone = function() {
    let current = this.currentDrawing;
    if (current && current.isZone && current.isZone()) return current;
    return null;
}

/**
 * @returns {Object} The current visualize drawing object
 */
ZoneTrack.prototype.getCurrentDrawing = function() {
    return this.currentDrawing;
}

/**
 * @param {Object} zone - The new drawing to set current
 */
ZoneTrack.prototype.setCurrentDrawing = function(drawing) {
    if (drawing == this.currentDrawing) return;
    this.previousDrawing = this.currentDrawing;
    this.currentDrawing = drawing;

    this.plotDrawing(this.previousDrawing);
    this.plotDrawing(this.currentDrawing);

    this.highlightHeader(this.previousDrawing);
    this.highlightHeader(this.currentDrawing);
}

/**
 * Initialize DOM elements for the track
 * param {Object} domElem - The DOM element to contain the track
 */
ZoneTrack.prototype.init = function(baseElement) {
    Track.prototype.init.call(this, baseElement);
    let self = this;
    this.trackContainer
        .classed('vi-zone-track-container', true)
        .on('mousedown', function() {
            self.setCurrentDrawing(null);
        });

    this.svgContainer = this.plotContainer.append('svg')
        .attr('class', 'vi-track-drawing vi-track-svg-container');
}


/**
 * Actually draw the track
 * @param {Boolean} [highlight] - Indicate whether to call highlight callback
 */
ZoneTrack.prototype.doPlot = function(highlight) {
    Track.prototype.doPlot.call(this, highlight);
    this.plotAllDrawings();
}

/**
 * Plot all drawings
 */
ZoneTrack.prototype.plotAllDrawings = function() {
    let self = this;
    this.drawings.forEach(function(d) {
        self.plotDrawing(d);
    });
}

/**
 * Plot a specific drawing
 * @param {Object} drawing - a visualize drawing
 */
ZoneTrack.prototype.plotDrawing = function(drawing) {
    if (!drawing || !drawing.doPlot) return;
    let windowY = this.getWindowY();
    drawing.minY = windowY[0];
    drawing.maxY = windowY[1];
    if (drawing == this.currentDrawing) {
        drawing.doPlot(true);
        drawing.raise();
    }
    else {
        drawing.doPlot(false);
    }
}

/**
 * Plot a specific zone
 * @param {Object} zone - a visualize zone
 */
ZoneTrack.prototype.plotZone = function(zone) {
    if (zone && zone.isZone && zone.isZone())
        this.plotDrawing(zone);
}

/**
 * Add a zone to zone track
 */
ZoneTrack.prototype.addZone = function(config) {
    if (!config.fill) {
        config.fill = {
            pattern: {
                name: 'chert',
                background: this.genColor(),
                foreground: 'white'
            }
        }
    }
    let zone = new Zone(config);
    zone.init(this.plotContainer);
    zone.header = this.addZoneHeader(zone);
    zone.on('mousedown', function() {
        self.drawingMouseDownCallback(zone);
    })
    this.drawings.push(zone);
    return zone;
}

/**
 * Auto rename zone from 1 to zone length
 */
ZoneTrack.prototype.autoName = function(cb) {
    let zones = this.getZones();
    zones.forEach(function(zone, i) {
        zone.name = i;
    });
    if (cb) cb(zones);
}

/**
 * @params {Object} drawing - The drawing to remove
 */
ZoneTrack.prototype.removeDrawing = function(drawing) {
    if (!drawing) return;
    drawing.destroy();
    let idx = this.drawings.indexOf(drawing);
    this.drawings.splice(idx, 1);

    if (drawing == this.currentDrawing)
        this.currentDrawing = null;
}

/**
 * @params {Object} zone - The zone to remove
 */
ZoneTrack.prototype.removeZone = function(zone) {
    if (!zone || !zone.isZone || !zone.isZone()) return;
    this.removeDrawing(zone);
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
            self.drawingHeaderMouseDownCallback(zone);
        });

    header.append('div')
        .attr('class', 'vi-drawing-header-highlight-area vi-drawing-header-name vi-zone-header-name');

    let rect = header.node().getBoundingClientRect();
    header.append('svg')
        .attr('class', 'vi-drawing-header-fill vi-zone-header-fill')
        .attr('width', rect.width)
        .attr('height', rect.height);
    return header;
}

ZoneTrack.prototype.onZoneMouseDown = function(zone, cb) {
    let self = this;
    zone.on('mousedown', function() {
        self.drawingMouseDownCallback(zone);
        cb();
    });
}

ZoneTrack.prototype.onZoneHeaderMouseDown = function(zone, cb) {
    let self = this;
    zone.header.on('mousedown', function() {
        self.drawingHeaderMouseDownCallback(zone);
        cb();
    });
}

ZoneTrack.prototype.drawingMouseDownCallback = function(drawing) {
    this.setCurrentDrawing(drawing);
    d3.event.stopPropagation();
    this.trackContainer.node().focus();
}

ZoneTrack.prototype.drawingHeaderMouseDownCallback = function(drawing) {
    this.setCurrentDrawing(drawing);
}

ZoneTrack.prototype.highlightHeader = function(drawing) {
    if (!drawing || !drawing.header) return;
    let self = this;
    drawing.header.select('.vi-drawing-header-highlight-area')
        .style('background-color', drawing == self.currentDrawing ? self.HEADER_HIGHLIGHT_COLOR : 'white');
}
