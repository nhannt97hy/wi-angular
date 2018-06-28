let Track = require('./visualize-track');
let Curve = require('./visualize-curve');
let Shading = require('./visualize-shading');
let ViImage = require('./visualize-image');
let Marker = require('./visualize-marker');
let Annotation = require('./visualize-annotation');
let Utils = require('./visualize-utils');
let Zone = require('./visualize-zone');
let Selection = require('./visualize-selection');

module.exports = LogTrack;

Utils.extend(Track, LogTrack);

/**
 * Represents a log track
 * @constructor
 * @param {Object} config - Contain configurations.
 * @param {Number} [config.id] - The id of this track in backend (idTrack field)
 * @param {String} [config.type] - The type of this track ('depth-track' of 'log-track')
 * @param {String} [config.name] - Name of the track
 * @param {Boolean} [config.showTitle] - Indicate whether to show title
 * @param {Boolean} [config.showXGrids] - Indicate whether to show value grids
 * @param {Boolean} [config.showYGrids] - Indicate whether to show depth grids
 * @param {Boolean} [config.justification] - Alignment of the title (left, center, right)
 * @param {Number} [config.xMajorTicks] - Number of major ticks shown in x axis. Default: 4
 * @param {Number} [config.xMinorTicks] - Number of minor ticks shown in x axis. Default: 2
 * @param {Number} [config.yTicks] - addaddNumber of ticks shown in y axis. Default: 10
 * @param {Number} [config.width] - Width in pixel of the bounding rectangle. Default: 120
 * @param {String} [config.bgColor] - Background color for the track
 * @param {Number} [config.yStep] - Y gap between two consecutive points
 * @param {Number} [config.offsetY] - Offset to increase all y coordinates
 * @param {Number} [config.xPadding] - Horizontal padding for inner drawings. Default: 1
 * @param {Number} [config.yPadding] - Vertical padding for inner drawings. Default: 5
 * @param {Number} [config.xDecimal] - Precision of float number in x axis. Default: 2
 * @param {Number} [config.yDecimal] - Precision of float number in y axis. Default: 2
 * @param {Boolean} [config.showLabels] - Indicate whether to show labels
 * @param {Boolean} [config.showEndLabels] - Indicate whether to show labels at two ends
 * @param {Boolean} [config.labelFormat]
 */
function LogTrack(config, wiApiService) {
    Track.call(this, config);
    if (!wiApiService) console.error("wiApiService is null, fix it!!!");
    this.wiApiService = wiApiService;
    this.id = config.id;
    this.idPlot = config.idPlot;

    this.showYGrids = (config.showYGrids == null) ? true : config.showYGrids;
    this.showXGrids = (config.showXGrids == null) ? true : config.showXGrids;
    this.xMajorTicks = config.xMajorTicks || 4;
    this.xMinorTicks = config.xMinorTicks || 4;
    this.yTicks = config.yTicks || 10;

    this.name = config.name || 'Track';
    this.width = config.width || 120;
    this.bgColor = config.color;

    this.drawings = [];
    this.minX = config.minX;
    this.maxX = config.maxX;

    this.xDecimal = (config.xDecimal == null) ? 2 : config.xDecimal;
    this.yDecimal = (config.yDecimal == null) ? 2 : config.yDecimal;
    this.scale = config.scale || 'linear';

    this.showLabels = config.showLabels == null ? false : config.showLabels;
    this.showEndLabels = config.showEndLabels == null ? true : config.showEndLabels;
    this.showXGrids = config.showValueGrid == null ? false : config.showValueGrid;
    this.showYGrids = config.showDepthGrid == null ? false : config.showDepthGrid;
    this.labelFormat = config.labelFormat;
    this.gridColor = 'gray';

    this.curvesRemoved = 0;
    this.mode = null;

    this.showZoneSet = config.showZoneSet;
}

LogTrack.prototype.getProperties = function() {
    return {
        idTrack: this.id,
        idPlot: this.idPlot,
        orderNum: this.orderNum,
        showTitle: this.showTitle,
        title: this.name,
        topJustification: Utils.capitalize(this.justification),
        bottomJustification: 'Center',
        showLabels: this.showLabels,
        showValueGrid: this.showXGrids,
        showDepthGrid: this.showYGrids,
        majorTicks: this.xMajorTicks,
        minorTicks: this.xMinorTicks,
        width: this.width,
        color: this.bgColor,
        showEndLabels: this.showEndLabels,
        displayType: Utils.capitalize(this.scale),
        labelFormat: this.labelFormat,
        zoomFactor: this.zoomFactor,
        idZoneSet: this.idZoneSet,
        showZoneSet: this.showZoneSet
    }
}

LogTrack.prototype.setProperties = function(props) {
    Utils.setIfNotNull(this, 'id', props.idTrack);
    Utils.setIfNotNull(this, 'idPlot', props.idPlot);
    Utils.setIfNotNull(this, 'orderNum', props.orderNum);
    Utils.setIfNotNull(this, 'showTitle', props.showTitle);
    Utils.setIfNotNull(this, 'name', props.title);
    Utils.setIfNotNull(this, 'justification', Utils.lowercase(props.topJustification));
    Utils.setIfNotNull(this, 'showLabels', props.showLabels);
    Utils.setIfNotNull(this, 'showEndLabels', props.showEndLabels);
    Utils.setIfNotNull(this, 'showXGrids', props.showValueGrid);
    Utils.setIfNotNull(this, 'showYGrids', props.showDepthGrid);
    Utils.setIfNotNull(this, 'xMajorTicks', parseInt(props.majorTicks));
    Utils.setIfNotNull(this, 'xMinorTicks', parseInt(props.minorTicks));
    Utils.setIfNotNull(this, 'width', props.width);
    Utils.setIfNotNull(this, 'bgColor', Utils.convertColorToRGB(props.color));
    Utils.setIfNotNull(this, 'scale', Utils.lowercase(props.displayType));
    Utils.setIfNotUndefined(this, 'labelFormat', props.labelFormat);
    Utils.setIfNotNull(this, 'zoomFactor', props.zoomFactor);
    Utils.setIfNotNull(this, 'idZoneSet', props.idZoneSet);
    Utils.setIfNotNull(this, 'showZoneSet', props.showZoneSet);
}

LogTrack.prototype.setMode = function(newMode) {
    this.mode = newMode;
    this.plotContainer
        .style('cursor', newMode == null ? 'default' : 'copy');
}

LogTrack.prototype.updateScaleInfo = function(scaleOpt) {
    let self = this;
    if (scaleOpt) {
        this.scale = scaleOpt.scale? scaleOpt.scale.toLowerCase() : this.scale.toLowerCase();
        this.minX = scaleOpt.leftVal;
        this.maxX = scaleOpt.rightVal;
        if (this.scale.toLowerCase() == 'logarithmic') {
            this.minX = (this.minX <= 0)?0.01:this.minX;
            this.maxX = (this.maxX <= 0)?0.01:this.maxX;
        }
    }
    if (!this.minX || !this.maxX) {
        let aCurve = null;
        for (let drawing of this.drawings) {
            if (drawing.isCurve() && drawing.scale.toLowerCase() == this.scale) {
                aCurve = drawing;
                break;
            }
        }
        if (aCurve) {
            this.minX = aCurve.minX;
            this.maxX = aCurve.maxX;
        }
        else {
            this.minX = 1;
            this.maxX = 2;
        }
    }

    let windowX = self.getWindowX();
    this.getZones().forEach(zone => {
        zone.setProperties({
            scaleLeft: windowX[0],  
            scaleRight: windowX[1]
        })
        zone.doPlot();
    })
}

/**
 * Get x window of track
 * @returns {Array} Range of actual x values to show
 */
LogTrack.prototype.getWindowX = function() {
    return (this.minX == null || this.maxX == null)
        ? [1, 2]
        : [this.minX, this.maxX];
}
LogTrack.prototype.getCurrentDrawing = function() {
    return this.currentDrawing;
}

/**
 * Get current curve object
 * @returns {Object}
 */
LogTrack.prototype.getCurrentCurve = function() {
    let current = this.currentDrawing;
    if (current && current.isCurve()) return current;
    return null;
}

/**
 * Get current shading object
 * @returns {Object}
 */
LogTrack.prototype.getCurrentShading = function() {
    let current = this.currentDrawing;
    if (current && current.isShading()) return current;
    return null;
}

LogTrack.prototype.getCurrentMarker = function() {
    let current = this.currentDrawing;
    if (current && current.isMarker()) return current;
    return null;
}

/**
 * Get all the curves
 * @returns {Array}
 */
LogTrack.prototype.getCurves = function() {
    return this.drawings.filter(function(d) {
        return d.isCurve();
    })
    .sort(function (c1, c2) {
        return (c1.orderNum + c1.name).localeCompare(c2.orderNum + c2.name);
    });
}

/**
 * Get all the shadings
 * @returns {Array}
 */
LogTrack.prototype.getShadings = function() {
    return this.drawings.filter(d => d.isShading())
        .sort((a, b) => a.orderNum.localeCompare(b.orderNum));
}

LogTrack.prototype.getImages = function() {
    return this.drawings.filter(function(d) {
        return d.isImage();
    });
}

LogTrack.prototype.getMarkers = function() {
    return this.drawings.filter(function(d) {
        return d.isMarker();
    });
}

LogTrack.prototype.getAnnotations = function() {
    return this.drawings.filter(function(d) {
        return d.isAnnotation();
    })
}
LogTrack.prototype.getZones = function() {
    return this.drawings.filter(function(d) {
        return d.isZone();
    })
}

/**
 * Get temporary curve to create pair shading
 */
LogTrack.prototype.getTmpCurve = function() {
    return this.tmpCurve;
}

/**
 * Get extent of y value among all drawings, [-1, -1] if there is no drawing
 * @return {Array}
 */
LogTrack.prototype.getExtentY = function() {
    if (this.drawings.length == 0) return [-1, -1];
    let ys = [];
    this.drawings.forEach(function(d) {
        if (d.getExtentY)
            ys = ys.concat(d.getExtentY());
    })
    let minY = Utils.roundDown(d3.min(ys), 100 * this.yStep);
    let maxY = Utils.roundUp(d3.max(ys), 100 * this.yStep);
    return [minY, maxY];
}

LogTrack.prototype.getSelection = function(id) {
    return this.drawings.find(d => d.isSelection() && d.idSelectionTool == id);
}

/**
 * Set temporary curve to create pair shading
 * @param {Object} curve - The temporary curve
 */
LogTrack.prototype.setTmpCurve = function(curve) {
    let currentCurve = this.getCurrentCurve();
    this.tmpCurve = (currentCurve && curve && curve.isCurve && curve.isCurve()) ? curve : null;
    if (this.tmpCurve) {
        this.plotAllDrawings();
        this.highlightHeader();
    }
}

/**
 * Set current drawing and re-draw to highlight
 * @param {Object} drawing - The drawing to be current
 */
LogTrack.prototype.setCurrentDrawing = function(drawing) {
    if (drawing == this.currentDrawing) return;
    this.currentDrawing = drawing;
    this.tmpCurve = null;
    this.plotAllDrawings();
    if (drawing && drawing.isCurve()) {
        this.updateScaleInfo({
            leftVal:drawing.minX,
            rightVal:drawing.maxX,
            scale: Utils.lowercase(drawing.scale)
        });
        this.updateAxis();
    } else if (drawing && drawing.isZone()) {
        if(drawing.params) {
            this.drawControlLinesOnCurvesHeaders(drawing.params)
        }
    }
    this.highlightHeader();
}

/**
 * Initialize DOM elements for the track
 * param {Object} domElem - The DOM element to contain the track
 */
LogTrack.prototype.init = function(baseElement) {
    Track.prototype.init.call(this, baseElement);

    let self = this;
    this.trackContainer
        .classed('vi-log-track-container', true)

    this.plotContainer
        .on('mousedown', function(){
            self.plotMouseDownCallback();
        });

    this.axisContainer = this.plotContainer.append('svg')
        .attr('class', 'vi-track-drawing')
        .style('cursor', 'crosshair')
        .style('overflow', 'visible');

    this.svgContainer.style('cursor', 'crosshair');
    // this.svgContainer = this.plotContainer.append('svg')
    //     .attr('class', 'vi-track-drawing vi-track-svg-container')
    //     .style('cursor', 'crosshair');
        // .style('overflow', 'visible');

    this.xAxisGroup = this.axisContainer.append('g')
        .attr('class', 'vi-track-axis');

    this.yAxisGroup = this.axisContainer.append('g')
        .attr('class', 'vi-track-axis');
}

/**
 * Draw axes, curves and shadings
 * @param {Boolean} [highlight] - Indicate whether to call highlight callback
 */
LogTrack.prototype.doPlot = function(highlight) {
    Track.prototype.doPlot.call(this, highlight);
    this.plotAllDrawings();
    this.updateScaleInfo();
    this.updateAxis();
}

LogTrack.prototype.getCurveOrderKey = function (curve) {
    let curves = this.getCurves();
    if (curves.length <= 0) {
        return 'm';
    }
    if (!curve) curve = curves[curves.length-1];
    let currentIdx = curves.indexOf(curve);
    if (currentIdx < 0 || currentIdx == (curves.length - 1)) {
        currentIdx = curves.length - 1;
        let currentOrderKey = curves[currentIdx].orderNum;
        let key = String.fromCharCode(currentOrderKey.charCodeAt(0) + 1);
        console.log(key);
        return key;
    }
    return curves[currentIdx].orderNum + curves[currentIdx + 1].orderNum;
}

LogTrack.prototype.rearrangeCurves = function () {
    this.headerContainer.selectAll('.vi-curve-header').sort((a,b) => b.localeCompare(a));
}

/**
 * Add curve to track
 * @param {Object} data - Array of objects containing x, y coordinates
 * @param {Object} config - Configurations of new curve
 * @param {Number} [config.id] - The id of this line in backend (idLine field)
 * @param {String} [config.name] - Name of new curve. Default: auto generate
 * @param {String} [config.unit] - Unit of data. Default: 'm3'
 * @param {Number} [config.minX] - Mininum x value to show. Default: auto detect
 * @param {Number} [config.maxX] - Maximum x value to show. Default: auto detect
 * @param {String} [config.color] - CSS color of new curve. Default: auto generate
 * @return {Object} The created curve
 */
LogTrack.prototype.addCurve = function(data, config) {
    config.name = config.name || ('Curve ' + (this.getCurves().length + this.curvesRemoved));
    if (!config.line && !config.symbol) {
        config.line = {
            color: this.genColor(),
            width: 1,
            dash: [0]
        };
    }
    config._data = data;
    config.yStep = config.yStep; // || this.yStep;
    config.offsetY = config.offsetY; // || this.offsetY;
    config.orderNum = config.orderNum || this.getCurveOrderKey();

    let curve = new Curve(config);

    curve.init(this.plotContainer, this);
    curve.header = this.addCurveHeader(curve);
    this.drawings.push(curve);
    this.rearrangeCurves();

    return curve;
}

LogTrack.prototype.getShadingOrderKey = function (shading) {
    let shadings = this.getShadings();
    if (shadings.length <= 0) {
        return 'm';
    }
    if (!shading) shading = shadings[shadings.length-1];
    let currentIdx = shadings.indexOf(shading);
    if (currentIdx < 0 || currentIdx == (shadings.length - 1)) {
        currentIdx = shadings.length - 1;
        let currentOrderKey = shadings[currentIdx].orderNum;
        return String.fromCharCode(currentOrderKey.charCodeAt(0) + 1);
    }
    return shadings[currentIdx].orderNum + shadings[currentIdx + 1].orderNum;
}

LogTrack.prototype.rearrangeShadings = function () {
    // this.plotContainer.selectAll(this.getShadings().filter(s => s !== this.currentDrawing).map(s => s.canvas.node())).sort();
    let currentDatum = null;
    try {
        currentDatum = this.currentDrawing.canvas.datum();
    } catch (error) {}
    this.plotContainer.selectAll('.vi-track-shading').filter((d) => d !== currentDatum).sort();
    this.headerContainer.selectAll('.vi-shading-header').sort((a,b) => b.localeCompare(a));
};

function onShadingHeaderDrag(shading, callbackDrop) {
    const headerElem = shading.header.node();
    function dropHandler(event) {
        if (shading === event.desShading) return;
        callbackDrop && callbackDrop(event.desShading);
    }
    $(headerElem).draggable({
        axis: 'y',
        containment: headerElem.parentNode.parentNode,
        helper: function () {
            const canvasData = $(headerElem).find('canvas.vi-shading-header-canvas').get(0).toDataURL();
            const $elem = $(headerElem).clone().css({ width: headerElem.clientWidth, 'z-index': 2 });
            $elem.find('canvas.vi-shading-header-canvas').replaceWith(
                $('<img></img>')
                    .prop({ src: canvasData })
                    .css({
                        position: 'absolute',
                        top: 0,
                        left: 0
                    })
            );
            return $elem;
        },
        distance: 10,
        scope: 'shading-header',
        start: function (event, ui) {
            document.addEventListener('onshadingdrop', dropHandler);
        },
        stop: function () {
            document.removeEventListener('onshadingdrop', dropHandler);
        }
    })
    $(headerElem).droppable({
        accept: '.vi-shading-header',
        scope: 'shading-header',
        tolerance: 'pointer',
        drop: function (event, ui) {
            let e = new Event('onshadingdrop');
            e.desShading = shading;
            document.dispatchEvent(e);
        }
    });
}

/**
 * Add shading to track
 * @param {Object} leftCurve - Left curve, null if drawing left shading
 * @param {Object} rightCurve - Right curve, null if drawing right shading
 * @param {Number} refX - x coordiate of reference line for custom shading
 * @param {Object} config - Configurations of new shading
 * @param {String} [config.name] - Name of new shading. Default: auto generate
 * @param {String} [config.fillStyle] - Canvas fillStyle of new shading. Default: auto generate
 * @returns {Object} The created shading
 */
LogTrack.prototype.addShading = function(leftCurve, rightCurve, refX, config) {
    if (!leftCurve && !rightCurve) return;

    let leftName = leftCurve ? leftCurve.name : 'left';
    let rightName = rightCurve ? rightCurve.name : 'right';
    config.name = config.name || (leftName + ' - ' + rightName);
    config.yStep = config.yStep || this.yStep;

//    if (config.isNegPosFilling == null && !config.fill) {
    if (config.isNegPosFill == null && !config.fill) {
        config.fill = {
            pattern: {
                name: 'none',
                background: this.genColor(),
                foreground: 'black'
            }
        }
    }
    config.refX = refX;
    config.leftCurve = leftCurve;
    config.rightCurve = rightCurve;
    config.idTrack = this.id;
    let shading = new Shading(config);
    shading.init(this.plotContainer);
    shading.header = this.addShadingHeader(shading);

    let self = this;
    shading.onRefLineDrag(function() {
        let rWidth = shading.refLineWidth;
        let leftMost = rWidth / 2;
        let rightMost = self.plotContainer.node().clientWidth - rWidth;
        let vpRefX = d3.event.x;
        vpRefX = vpRefX > rightMost ? rightMost : vpRefX;
        vpRefX = vpRefX < leftMost ? leftMost : vpRefX;
        shading.refX = shading.getTransformX(shading.rightCurve).invert(vpRefX);
        shading.drawRootTooltip();
        self.plotShading(shading);
        scheduleUpdateShading(shading, function(res){
            console.log("udpate shading", res);
        });
    });
    let timeHandle = null;
    function scheduleUpdateShading (shading, callback) {
        if (timeHandle) {
            clearTimeout(timeHandle);
        }
        timeHandle = setTimeout(function(){
            updateShading(shading, callback);
            timeHandle = null;
        }, 500);
    }
    function updateShading(shading, callback) {
        let request = shading.getProperties();
        self.wiApiService.editShading(request, function(res, err) {
            if (callback) callback(res, err);
        })
    }
    this.drawings.push(shading);

    onShadingHeaderDrag(shading, function (desShading) {
        let orderNum = self.getShadingOrderKey(desShading);
        let shadings = self.getShadings();
        if (shading.orderNum > desShading.orderNum) {
            let desTrackIndex = shadings.findIndex(track => track == desShading);
            if (desTrackIndex === 0) {
                orderNum = String.fromCharCode(shadings[0].orderNum.charCodeAt(0) - 1);
            } else {
                desShading = shadings[desTrackIndex - 1];
                orderNum = self.getShadingOrderKey(desShading);
            }
        }
        const orderBackup = shading.orderNum;
        shading.orderNum = orderNum;
        updateShading(shading, function (res, err) {
            if (err) return shading.orderNum = orderBackup;
            shading.updateOrderNum();
            self.rearrangeShadings();
        });
    });
    return shading;
}

LogTrack.prototype.addImage = function(config) {
    if (config.top == null) config.top = this.minY;
    if (config.bottom == null) config.bottom = this.maxY;
    let image = new ViImage(config);
    image.init(this.plotContainer);
    image.lower();
    this.drawings.push(image);
    return image;
}

LogTrack.prototype.addMarker = function(config) {
    let marker = new Marker(config);
    marker.init(this.plotContainer);
    this.drawings.push(marker);
    return marker;
}

LogTrack.prototype.addAnnotation= function(config) {
    let ann = new Annotation(config);
    ann.init(this.plotContainer);
    this.drawings.push(ann);
    return ann;
}

/**
 * Remove a drawing from track
 * @param {Object} drawing - The curve or shading object to remove
 */
LogTrack.prototype.removeDrawing = function(drawing) {
    if (!drawing) return;
    drawing.destroy();

    let idx = this.drawings.indexOf(drawing);
    this.drawings.splice(idx, 1);

    if (drawing == this.currentDrawing)
        this.currentDrawing = null;
}

/**
 * Remove a curve from track
 * @param {Object} curve - The curve object to remove
 */
LogTrack.prototype.removeCurve = function(curve) {
    if (curve && curve.isCurve())
        this.removeDrawing(curve);
}

/**
 * Remove a shading from track
 * @param {Object} shading - The shading object to remove
 */
LogTrack.prototype.removeShading = function(shading) {
    if (shading && shading.isShading())

        this.removeDrawing(shading);
}

LogTrack.prototype.removeMarker = function(marker) {
    if (marker && marker.isMarker())
        this.removeDrawing(marker);
}

/**
 * Remove curve by its id
 */
LogTrack.prototype.removeCurveById = function(id) {
    let curves = this.getCurves().filter(function(c) {
        return c.id == id;
    });
    this.removeCurve(curves[0]);
}

/**
 * Remove shading by its id
 */
LogTrack.prototype.removeShadingById = function(id) {
    let shadings = this.getShadings().filter(function(sh) {
        return sh.id == id;
    });
    this.removeShading(shadings[0]);
}

LogTrack.prototype.removeMarkerById = function(id) {
    let markers = this.getMarkers().filter(function(m) {
        return m.id == id;
    });
    this.removeMarker(markers[0]);
}

LogTrack.prototype.findCurveById = function(id) {
    return this.getCurves().filter(function(c) {
        return c.id == id;
    })[0];
}

LogTrack.prototype.findShadingById = function(id) {
    return this.getShadings().filter(function(sh) {
        return sh.id == id;
    })[0];
}

LogTrack.prototype.findMarkerById = function(m) {
    return this.getMarkers().filter(function(m) {
        return m.id == id;
    })[0];
}

LogTrack.prototype.findCurves = function(props) {
    return this.getCurves().filter(function(c) {
        let cProps = c.getProperties();
        let match = true;
        Object.keys(props).forEach(function(k) {
            match = match && (cProps[k] == props[k]);
        });
        return match;
    });
}

LogTrack.prototype.findShadings = function(props) {
    return this.getShadings().filter(function(sh) {
        let shProps = sh.getProperties();
        let match = true;
        Object.keys(props).forEach(function(k) {
            match = match && (shProps[k] == props[k]);
        });
        return match;
    });
}

LogTrack.prototype.findMarkers = function(props) {
    return this.getMarkers().filter(function(m) {
        let mProps = m.getProperties();
        let match = true;
        Object.keys(props).forEach(function(k) {
            match = match && (mProps[k] == props[k]);
        });
        return match;
    });
}

/**
 * Remove current curve from track
 */
LogTrack.prototype.removeCurrentCurve = function() {
    this.removeCurve(this.currentDrawing);
}

/**
 * Remove current shading from track
 */
LogTrack.prototype.removeCurrentShading = function() {
    this.removeShading(this.currentDrawing);
}

LogTrack.prototype.removeCurrentMarker = function() {
    this.removeMarker(this.currentDrawing);
}

/**
 * Remove current drawing (curve or shading) from track
 */
LogTrack.prototype.removeCurrentDrawing = function() {
    this.removeDrawing(this.currentDrawing);
}

/**
 * Remove all drawings from (curves and shadings) from track
 */
LogTrack.prototype.removeAllDrawings = function() {
    this.currentDrawing = null;
    this.drawings.forEach(function(d) {
        d.destroy();
    });
    this.drawings = [];
}

/**
 * Plot one draw (curve or shading)
 * @param {Object} drawing - The drawing to plot
 */
LogTrack.prototype.plotDrawing = function(drawing) {
    if (!drawing || !drawing.doPlot) return;
    let windowY = this.getWindowY();
    drawing.minY = windowY[0];
    drawing.maxY = windowY[1];
    if (drawing == this.currentDrawing || drawing == this.tmpCurve) {
        drawing.doPlot(true);
        setTimeout(() => {
            drawing.raise();
        }, 10);
    }
    else {
        drawing.doPlot();
    }
    this.getShadings().filter(s => s !== this.currentDrawing).forEach(s => s.lower());
    this.getImages().forEach(function (img) { img.lower(); });
    this.getMarkers().forEach(function(marker) { marker.raise(); });
    // this.getZones().forEach(zone => zone.lower());
    this.svgContainer.raise();
    this.axisContainer.lower();
}

/**
 * Plot one curve
 * @param {Object} curve - The curve to plot
 */
LogTrack.prototype.plotCurve = function(curve) {
    if (!curve || !curve.isCurve || !curve.isCurve()) return;
    this.plotDrawing(curve);
    curve.updateOrderNum();
    this.rearrangeCurves();
}

/**
 * Plot one shading
 * @param {Object} shading - The shading to plot
 */
LogTrack.prototype.plotShading = function(shading) {
    if (!shading || !shading.isShading || !shading.isShading()) return;
    this.plotDrawing(shading);
    shading.updateOrderNum();
    this.rearrangeShadings();
}

LogTrack.prototype.plotMarker = function(marker) {
    if (!marker || !marker.isMarker || !marker.isMarker()) return;
    this.plotDrawing(marker);
}

/**
 * Plot all drawings (curves and shadings)
 */
LogTrack.prototype.plotAllDrawings = function() {
    let self = this;
    this.drawings.forEach(function (d) {
        self.plotDrawing(d);
    });
    self.rearrangeShadings();
}

/**
 * Register event when mouse over the plot area
 */
LogTrack.prototype.onPlotMouseOver = function(cb){
    this.plotContainer
        .on('mouseover', cb);
}

/**
 * Register event when mouse leave the plot area
 */
LogTrack.prototype.onPlotMouseLeave = function(cb) {
    this.plotContainer
        .on('mouseleave', cb);
}

/**
 * Register event when mouse wheel on the plot area
LogTrack.prototype.onPlotMouseWheel = function(cb) {
    this.plotContainer
        .on('mousewheel', cb);
}
 */

/**
 * Register event when mouse down the plot area
 */
LogTrack.prototype.onPlotMouseDown = function(cb) {
    let self = this;
    this.plotContainer
        .on('mousedown', function() {
            self.plotMouseDownCallback();
            cb();
        })
        .on('contextmenu', function() {
            d3.event.currentDrawing = self.currentDrawing;
            cb();
        });
}

/**
 * Register event when double click the plot area
 */
LogTrack.prototype.onPlotDoubleClick = function(cb) {
    let self = this;
    this.plotContainer
        .on('dblclick', function() {
            self.plotMouseDownCallback();
            cb();
        });
}

LogTrack.prototype.onMarkerMouseDown = function(marker, cb) {
    let self = this;
    marker.on('mousedown', function() {
        self.markerMouseDownCallback(marker);
        cb();
    });
}

LogTrack.prototype.onDrawingMouseDown = function(drawing, cb) {
    let self = this;
    drawing.on('mousedown', function() {
        self.drawingMouseDownCallback(drawing);
        cb();
    })
}

/**
 * Register event when mouse down the header area
 */
LogTrack.prototype.onHeaderMouseDown = function(cb) {
    this.headerContainer
        .on('mousedown',cb);
}

/**
 * Register event when mouse down the shading header area
 */
LogTrack.prototype.onShadingHeaderMouseDown = function(shading, cb) {
    if (!shading) return;
    let self = this;
    shading.header
        .on('mousedown', function() {
            self.drawingHeaderMouseDownCallback(shading);
            cb();
        });
}

/**
 * Register event when mouse down the curve header area
 */
LogTrack.prototype.onCurveHeaderMouseDown = function(curve, cb) {
    if (!curve) return;
    let self = this;
    curve.header
        .on('mousedown', function() {
            self.drawingHeaderMouseDownCallback(curve);
            cb();
        });
}

function genLogTickValues(minVal, maxVal) {
    var tickValues = new Array();
    var leftExponent = Math.floor(Math.log10(minVal));
    var rightExponent = Math.ceil(Math.log10(maxVal));
    for (let i = leftExponent; i <= rightExponent; i++) {
        for (let j = 1; j < 10; j++) {
            let value = j * Math.pow(10, i);
            if (value >= minVal && value <= maxVal)
                tickValues.push(value);
        }
    }
    return tickValues;
}

LogTrack.prototype.genXTickValues = function() {
    let self = this;
    let windowX = this.getWindowX();
    if (self.scale == 'logarithmic') {
        if (windowX[0] < windowX[1])
            return Utils.genLogTickValues(windowX[0], windowX[1]);
        else {
            return Utils.genLogTickValues(windowX[1], windowX[0]).reverse();

        }
    }
    else {
        return d3.range(windowX[0], windowX[1], (windowX[1] - windowX[0])/(self.xMajorTicks * self.xMinorTicks));
    }
}

LogTrack.prototype.getTransformX = function() {
    let self = this;
    if (!self.scale) self.scale = 'linear';
    let rangeX = this.getViewportX();
    let windowX = this.getWindowX();
    return Utils.getScaleFunc(self.scale).domain(windowX).range(rangeX);
}

/**
 * Update axis or create new if not exist
 */
LogTrack.prototype.updateAxis = function() {
    let self = this;
    let rect = this.plotContainer.node().getBoundingClientRect();
    let windowY = this.getWindowY();
    let windowX = this.getWindowX();
    let transformY = this.getTransformY();
    let transformX = this.getTransformX();
    let xTickValues = this.genXTickValues();

    let majorTest = (this.scale.toLowerCase() == 'logarithmic')?logMajorTest:linearMajorTest;
    let xAxis = d3.axisTop(transformX)
        .tickValues(xTickValues)
        .tickFormat('')
        .tickSize(-rect.height);

    // let step = (transformY.invert(Utils.getDpcm()) - windowY[0]) * (this.shouldRescaleWindowY() ? this.zoomFactor : this.zoomFactor / this._maxZoomFactor);
    // let start = Utils.roundUp(windowY[0], step);
    // let end = Utils.roundDown(windowY[1], step);
    let yTicks = this.prepareTicks();
    let yShownTicks = yTicks.filter(function(d) {
        return d >= windowY[0];
    });

    let yAxis = d3.axisLeft(transformY)
        .tickValues(yShownTicks)
        .tickFormat(this.showLabels ? this.getDecimalFormatter(this.yDecimal) : '')
        .tickSize(-rect.width);

    this.xAxisGroup.call(xAxis);
    this.yAxisGroup.call(yAxis);

    this.xAxisGroup
        .style('display', this.showXGrids ? 'block' : 'none');

    if (this.showLabels && this.labelFormat)
        this.yAxisGroup.selectAll('.tick text').text(this.labelFormat);

    this.yAxisGroup
        .style('display', this.showYGrids ? 'block' : 'none')
        .selectAll('.tick text')
            .attr('x', function(d, i) {
                let parentWidth = self.plotContainer.node().clientWidth;
                let textWidth = this.clientWidth;
                let x = (parentWidth + textWidth) / 2;
                return x;
            })
            .style('display', function(d, i) {
                return ((i == 0 || i == yShownTicks.length-1) && !self.showEndLabels) ? 'none' : 'block';
            });

    this.xAxisGroup.selectAll('.tick')
        .classed('major', function(d,i) {
            return majorTest(i);
        });

    this.yAxisGroup.selectAll('.tick')
        .classed('major', function(d) {
            return yTicks.indexOf(d) % 5 == 0;
        });

    function linearMajorTest(i) {
        return (!self.xMinorTicks || i % self.xMinorTicks == 0) ? true:false;
    }

    function logMajorTest(i) {
        return Number.isInteger(Math.log10(xTickValues[i]))?true:false;
    }
}

LogTrack.prototype.updateHeader = function() {
    Track.prototype.updateHeader.call(this);
}

LogTrack.prototype.updateBody = function() {
    Track.prototype.updateBody.call(this);
    // let rect = this.plotContainer
    //     .style('top', this.yPadding + 'px')
    //     .style('bottom', this.yPadding + 'px')
    //     .style('left', this.xPadding + 'px')
    //     .style('right', this.xPadding + 'px')
    //     .node()
    //     .getBoundingClientRect();

    // this.svgContainer
    //     .attr('width', rect.width)
    //     .attr('height', rect.height);

    // this.axisContainer
    //     .attr('width', rect.width)
    //     .attr('height', rect.height);
}

LogTrack.prototype.addCurveHeader = function(curve) {
    let self = this;
    let curveHeader = this.drawingHeaderContainer
        .append('div')
            .attr('class', 'vi-curve-header')
            .style('color', curve.line.color)
            .datum(curve.orderNum + curve.name)
            .on('mousedown', function() {
                self.drawingHeaderMouseDownCallback(curve);
            });

    curveHeader.append('div')
        .attr('class', 'vi-curve-name')
        // .style('margin-bottom', this.HEADER_ITEM_MARGIN_BOTTOM + 'px')
        .style('cursor', 'default')
        .text(name);

    curveHeader.append('canvas')
        .attr('class', 'vi-curve-header-canvas');

    curveHeader.append('div')
        .attr('class', 'vi-curve-data')
        // .style('margin-bottom', this.HEADER_ITEM_MARGIN_BOTTOM + 'px')
        .style('cursor', 'default')
        .style('position', 'relative')
        .style('height', '18px')
        .selectAll('div')
        .data(['min', 'unit', 'max'])
        .enter()
        .append('div')
            .style('padding', '0 2px')
            .style('text-align', function(d, i) {
                switch(i) {
                    case 0:
                        return 'left';
                    case 1:
                        return 'center';
                    case 2:
                        return 'right';
                }
                return '';
            })
            .style('position', 'absolute')
            .style('width', '100%')
            .text(function(d) { return d; });

    this.drawingHeaderContainer.selectAll('.vi-shading-header').raise();
    this.drawingHeaderContainer.selectAll('.vi-zone-header').raise();
    return curveHeader;
}

LogTrack.prototype.addShadingHeader = function(shading) {
    let self = this;

    let header = this.drawingHeaderContainer.append('div')
        .attr('class', 'vi-shading-header')
        .style('position', 'relative')
        .style('padding', '2px 0 2px 0')
        .style('border', this.HEADER_ITEM_BORDER_WIDTH + 'px solid black')
        .style('margin-bottom', this.HEADER_ITEM_MARGIN_BOTTOM + 'px')
        .on('mousedown', function() {
            self.drawingHeaderMouseDownCallback(shading);
        });

    let valueClasses = ['vi-shading-left-value', 'vi-shading-name', 'vi-shading-right-value'];
    let valueBlocks = header.selectAll('div')
        .data(valueClasses)
        .enter()
        .append('div')
            .attr('class', d => d)
            .classed('vi-shading-header-item', true)
            .text('.');


    let rect = header.node().getBoundingClientRect();
    let headerCanvas = header.append('canvas')
        .attr('class', 'vi-shading-header-canvas')
        .attr('width', rect.width)
        .attr('height', rect.height)
        .style('position', 'absolute')
        .style('top', 0)
        .style('left', 0);

    this.drawingHeaderContainer.selectAll('.vi-zone-header').raise();

    return header;
}

LogTrack.prototype.highlightHeader = function() {
    let self = this;
    this.drawings.forEach(function(d, i) {
        let elem, bgColor;
        if (d.isCurve()) {
            elem = d.header;
            bgColor = (d == self.currentDrawing || d == self.tmpCurve) ? self.HEADER_HIGHLIGHT_COLOR : 'transparent';
        }
        else if (d.isShading()) {
            elem = d.header.select('.vi-shading-name');
            bgColor = d == self.currentDrawing ? self.HEADER_HIGHLIGHT_COLOR : 'white';
        }
        else return;
        elem.style('background-color', bgColor);
    });
}


LogTrack.prototype.drawingHeaderMouseDownCallback = function(drawing) {
    if (d3.event.button != 0) {
        if (!this.currentDrawing) this.setCurrentDrawing(drawing);
        d3.event.currentDrawing = this.currentDrawing;
        return;
    }
    if (d3.event.ctrlKey) {
        if (!this.currentDrawing) this.setCurrentDrawing(drawing);
        else this.setTmpCurve(drawing);
    }
    else {
        this.setCurrentDrawing(drawing);
        this.setTmpCurve(null);
    }
}

LogTrack.prototype.markerMouseDownCallback = function(marker) {
    this.setCurrentDrawing(marker);
}

LogTrack.prototype.drawingMouseDownCallback = function(drawing) {
    this.setCurrentDrawing(drawing);
}

LogTrack.prototype.plotMouseDownCallback = function() {
    let current = null;
    let x = d3.event.offsetX;
    let y = d3.event.offsetY;

    this.trackContainer.node().focus();
    if (d3.event.button != 0) {
        d3.event.currentDrawing = this.currentDrawing;
        return;
    }

    if (this.currentDrawing && this.currentDrawing.nearPoint(x, y)) {
        d3.event.currentDrawing = this.currentDrawing;
        return;
    }
    // selection priorities: curves ... biggest orderNum shading ... smallest orderNum shading
    this.getCurves().concat(this.getShadings().reverse()).forEach(function(d) {
        if (!current && d.nearPoint(x, y)) {
            current = d;
            d3.event.currentDrawing = current;
        }
    });

    // Current drawing is already set when mouse down
    if (d3.event.type == 'dblclick') return;

    if (d3.event.ctrlKey) {
        this.setTmpCurve(current);
    }
    else {
        this.setCurrentDrawing(current);
    }
}

/***************** MOVE TO SUPER CLASS ****************************
LogTrack.prototype.drawTooltipLines = function(depth, drawVertical) {
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

LogTrack.prototype.removeTooltipLines = function() {
    this.svgContainer.selectAll('line.tooltip-line').remove();
}

LogTrack.prototype.drawTooltipText = function(depth, showDepth) {

    let plotMouse = d3.mouse(this.plotContainer.node());
    let plotRect = Utils.getBoundingClientDimension(this.plotContainer.node());
    let y = this.getTransformY()(depth);
    let svg = this.svgContainer;

    svg.selectAll('text.tooltip-text, rect.tooltip-rect').remove();
    if (!this.getCurves().length) return;
    let tooltip = svg.append('text')
        .attr('class', 'tooltip-text')
        .attr('y', y);

    let xFormatter = this.getDecimalFormatter(this.xDecimal);
    let yFormatter = this.getDecimalFormatter(this.yDecimal);

    let textData = showDepth ? [{
        text: 'Depth: ' + yFormatter(this.getTransformY().invert(y)),
        color: 'black'
    }] : [];
    this.getCurves().forEach(function(curve) {
        let curveY = curve.getTransformY().invert(y);
        curveY = curve.offsetY + Utils.round(curveY - curve.offsetY, curve.yStep);

        let value = curve.dataMap[curveY];
        value = value == null ? null : xFormatter(value);
        textData.push({
            text: curve.alias + ': ' + value,
            color: curve.line ? curve.line.color : (curve.symbol ? curve.symbol.fillStyle : 'black')
        });
    })

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

LogTrack.prototype.removeTooltipText = function() {
    this.svgContainer.selectAll('text.tooltip-text, rect.tooltip-rect').remove();
}

******************************** END MOVING TO SUPPER CLASS **************************/

/**
 * Register event when drag curve
 */
LogTrack.prototype.onCurveDrag = function (trackComponent, callbackDrop) {
    let self = this;
    function triggerClickPlot (event) {
        d3.event = event;
        self.plotContainer.on("mousedown")();
        self.trackContainer.node().focus();
    }
    function onCurveDropHandler(event) {
        if (self == event.desTrack) return;
        callbackDrop && callbackDrop(event.desTrack);
    }
    $(this.plotContainer.node()).draggable({
        axis: 'x',
        containment: self.root.node().parentNode.parentNode.parentNode,
        helper: function () {
            if (self.getCurrentCurve()) {
                let currentCurve = self.getCurrentCurve();
                return $('<img></img>').prop({src: currentCurve.canvas.node().toDataURL(), style: 'z-index: 99'});
            }
            return $('<span></span>');
        },
        distance: 10,
        scope: 'curve',
        drag: function (event, ui) {
            if (!self.getCurrentCurve()) {
                return false;
            }
        },
        start: function (event, ui) {
            triggerClickPlot(event);
            document.addEventListener('oncurvedrop', onCurveDropHandler);
        },
        stop: function () {
            document.removeEventListener('oncurvedrop', onCurveDropHandler);
        }
    })
    // .click(function (event) {
    //     triggerClickPlot(event);
    // });
    $(this.plotContainer.node()).droppable({
        accept: '.vi-track-plot-container',
        scope: 'curve',
        tolerance: 'pointer',
        drop: function (event, ui) {
            let onCurveDrop = new Event('oncurvedrop');
            onCurveDrop.desTrack = trackComponent;
            document.dispatchEvent(onCurveDrop);
        }
    });
}

LogTrack.prototype.initSelectionArea = function(viSelections) {
    let self = this;
    viSelections.forEach((viSelection) => {
        viSelection.initCanvasLogtrack(self.plotContainer, 'logplot');
        self.drawings.push(viSelection);
    });
}

LogTrack.prototype.pushSelectionAreas = function() {
    let self = this;
    this.drawings.forEach(function(drawing) {
        if (drawing.isSelection()) {
            let windowY = self.getWindowY();
            drawing.minY = windowY[0];
            drawing.maxY = windowY[1];
            drawing.doPlot();
        }
    });
}

LogTrack.prototype.addSelection = function(selectionConfig) {
    let viSelection = new Selection(selectionConfig);
    viSelection.initCanvasLogtrack(this.plotContainer, 'logplot');
    this.drawings.push(viSelection);
    viSelection.doPlot();
    return viSelection;
}

/**
 * This method is no longer needed
 *
LogTrack.prototype.addZoneSet = function(zonesetConfig) {
    let self = this;
    console.log("zoneset to vi log track", zonesetConfig);
    // self.idZoneSet = zonesetConfig.idZoneSet;
    // self.addZoneSetHeader(zonesetConfig);
    for(let zone of zonesetConfig.zones) {
        self.addZone(zone);
    }
    self.plotAllDrawings();
}
*/

LogTrack.prototype.removeAllZones = function() {
    let self = this;
    this.drawingHeaderContainer.selectAll('.vi-zone-header').remove();
    this.drawings.filter(d => d.isZone())
        .forEach(zone => {
            self.removeZone(zone);
        })
}

LogTrack.prototype.removeZone = function (zone) {
    if(zone && zone.isZone()) 
        this.removeDrawing(zone);
}

LogTrack.prototype.addZone = function(zoneConfig) {
    let self = this;
    let zone = new Zone(zoneConfig);
    zone.init(self.plotContainer);
    zone.svgGroup.attr('fill-opacity', '0.5');
    this.drawings.push(zone);
    return zone;
}
/*
LogTrack.prototype.addZoneSetHeader = function(zoneset) {
    let self = this;
    let header = this.drawingHeaderContainer.append('div')
        .attr('class', 'vi-zone-header')
        .style('border', this.HEADER_ITEM_BORDER_WIDTH + 'px solid black')
        .style('margin-bottom', this.HEADER_ITEM_MARGIN_BOTTOM + 'px')
        .on('mousedown', function() {
        });

    header.append('div')
        .attr('class', 'vi-drawing-header-highlight-area vi-drawing-header-name vi-zone-header-name')
        .text(zoneset.name);

    let rect = header.node().getBoundingClientRect();
    header.append('svg')
        .attr('class', 'vi-drawing-header-fill vi-zone-header-fill')
        .attr('width', rect.width)
        .attr('height', rect.height);
    return header;
}
*/
LogTrack.prototype.drawControlLinesOnCurvesHeaders = function(params) {
    this.getCurves().forEach(viCurve => viCurve.drawControlLines(params));
    this.getCurves().forEach(viCurve => viCurve.drawControlLineText(params));
}

LogTrack.prototype.removeControlLinesOnCurvesHeaders = function() {
    this.getCurves().forEach(viCurve => viCurve.drawControlLines([]));
}
