const componentName = 'wiD3';
const moduleName = 'wi-d3';

function getCurveFromName(name) {
    console.log("-", name);
    let nSamples = 1000;
    let samples = new Array();
    for (let i = 0; i < nSamples; i++) {
        samples.push({ y: i, x: Math.random() });
    }
    return samples;
}

function Controller($scope, wiComponentService, $timeout, ModalService, wiApiService) {
    let self = this;
    let graph = wiComponentService.getComponent('GRAPH');
    let _tracks = [];
    let _currentTrack = null;
    let _previousTrack = null;
    let _tooltip = true;
    //let WiLogplotModel = null;
    let _depthRange = [0, 100000];

    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let Utils = wiComponentService.getComponent(wiComponentService.UTILS);

    function error(message) {
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        DialogUtils.errorMessageDialog(ModalService, message );
    }
    function getOrderKey() {
        if (_tracks.length <= 0) {
            return 'a';
        }
        var currentIdx = _tracks.indexOf(_currentTrack);
        if(currentIdx < 0 || currentIdx == (_tracks.length - 1)) {
            currentIdx = _tracks.length - 1;
            let currentOrderKey = _tracks[currentIdx].orderNum;
            if ( currentOrderKey < 'z' ) {
                var key = String.fromCharCode(currentOrderKey.charCodeAt(0) + 1);
                console.log(key);
                return key;
            }
            return null; // ERROR
        }
        return _tracks[currentIdx].orderNum + _tracks[currentIdx + 1].orderNum;
    }

    /**
     * If param is absent, return a boolean indicating whether tooltip is on or off
     * If param is present, set tooltip on/off
     */
    this.tooltip = function(on) {
        if (on === undefined) return _tooltip;
        _tooltip = on;
    }

    this.getDepthRange = function() {
        return _depthRange;
    }

    this.getMaxOrderNum = function() {
        return _tracks.reduce(function(max, item) {
            return Math.max(max, item.orderNum);
        }, 0);
    }

    this.getCurrentTrack = function () {
        return _currentTrack;
    };

    this.getTracks = function () {
        return _tracks;
    };

    this.getLines = function () {
        let lines = [];
        _tracks.forEach(function (track) {
            if (track.isLogTrack()) {
                track.drawings.forEach(function (line) {
                    lines.push(line);
                })
            }
        })
        return lines;
    }

    this.addLogTrack = function(callback) {
        var trackOrder = getOrderKey();
        if (trackOrder) {
            wiApiService.createLogTrack(self.logPlotCtrl.id, trackOrder, function(ret) {
                wiApiService.infoTrack(ret.idTrack, function(logTrack) {
                    logTrack.title = 'Track '+ logTrack.idTrack;
                    let viTrack = self.pushLogTrack(logTrack);
                    wiApiService.editTrack(logTrack);
                    // if (!callback) return;
                    // callback(viTrack);
                });
            });
        }
        else {
            error('Cannot add Log track');
        }
    }

    this.pushLogTrack = function (logTrack) {
        console.log('pushLogTrack:', logTrack);
        // track config
        let config = {
            id: logTrack.idTrack,
            idPlot: logTrack.idPlot,
            orderNum: logTrack.orderNum,
            name: logTrack.title,
            yStep: parseFloat(_getWellProps().step),
            offsetY: parseFloat(_getWellProps().topDepth),
            width: Utils.inchToPixel(logTrack.width)
        };
        let track = graph.createLogTrack(config, document.getElementById(self.plotAreaId));
        graph.rearangeTracks(self);

        _tracks.push(track);
        _tracks.sort(function(track1, track2) {
            return track1.orderNum.localeCompare(track2.orderNum);
        });
        _setCurrentTrack(track);

        let depthRange = self.getDepthRangeFromSlidingBar();
        self.setDepthRangeForTrack(track, depthRange);

        _registerLogTrackCallback(track);
        _registerTrackHorizontalResizerDragCallback();
        return track;
    };

    this.addDepthTrack = function(callback) {
        var trackOrder = getOrderKey();
        console.log(trackOrder);
        if (trackOrder) {
            wiApiService.createDepthTrack(self.logPlotCtrl.id, trackOrder, function (depthTrack) {
                console.log("Success: ", depthTrack);
                self.pushDepthTrack(depthTrack);
                if (callback) callback();
            });
        }
        else {
            error("Cannot create depth track");
        }
    }
    this.pushDepthTrack = function (depthTrack) {
        //let graph = wiComponentService.getComponent('GRAPH');
        console.log('pushDepthTrack:', depthTrack);
        let config = {
            id: depthTrack.idDepthAxis,
            idPlot: depthTrack.idPlot,
            name: depthTrack.title,
            orderNum: depthTrack.orderNum,
            yStep: parseFloat(_getWellProps().step),
            offsetY: parseFloat(_getWellProps().topDepth),
            showTitle: depthTrack.showTitle,
            justification: depthTrack.justification,
            width: Utils.inchToPixel(depthTrack.width),
            depthType: depthTrack.depthType,
            unit: depthTrack.unitType,
            bgColor: depthTrack.trackBackground,
            decimal: depthTrack.decimals
        };
        console.log("config", config);

        let track = graph.createDepthTrack(config, document.getElementById(self.plotAreaId));
        graph.rearangeTracks(self);

        _tracks.push(track);
        _tracks.sort(function(track1, track2) {
            return track1.orderNum.localeCompare(track2.orderNum);
        });

        _setCurrentTrack(track);

        let depthRange = self.getDepthRangeFromSlidingBar();
        self.setDepthRangeForTrack(track, depthRange);

        _registerTrackCallback(track);
        _registerTrackHorizontalResizerDragCallback();
    };

    this.addZoneTrack = function(callback) {
        let trackOrder = getOrderKey();
        if (trackOrder) {
            DialogUtils.zoneTrackPropertiesDialog(ModalService, self.logPlotCtrl, null, function (zoneTrackProperties) {
                let dataRequest = {
                    idPlot: self.logPlotCtrl.id,
                    title: zoneTrackProperties.title,
                    showTitle: zoneTrackProperties.isShowTitle,
                    topJustification: zoneTrackProperties.topJustification,
                    bottomJustification: zoneTrackProperties.bottomJustification,
                    color: zoneTrackProperties.trackColor,
                    width: zoneTrackProperties.width,
                    idZoneSet: zoneTrackProperties.idZoneSet,
                    orderNum: trackOrder
                }
                wiApiService.createZoneTrack(dataRequest, function (returnZoneTrack) {
                    let zoneTrack = dataRequest;
                    zoneTrack.idZoneTrack = returnZoneTrack.idZoneTrack;
                    wiApiService.getZoneSet(zoneTrack.idZoneSet, function (zoneset) {
                        let viTrack = self.pushZoneTrack(zoneTrack);
                        for (let zone of zoneset.zones) {
                            self.addZoneToTrack(viTrack, zone);
                        }
                    })
                })
            })
        }
        else {
            error('Cannot create zone track');
        }
    }

    this.pushZoneTrack = function(zoneTrack) {
        let config = angular.copy(zoneTrack);
        config.id = zoneTrack.idZoneTrack;
        config.name = zoneTrack.title;
        config.yStep = parseFloat(_getWellProps().step);
        config.offsetY = parseFloat(_getWellProps().topDepth);
        config.width = Utils.inchToPixel(zoneTrack.width);
        console.log(config);

        let track = graph.createZoneTrack(config, document.getElementById(self.plotAreaId));
        graph.rearangeTracks(self);
        _tracks.push(track);
        _tracks.sort(function(track1, track2) {
            return track1.orderNum.localeCompare(track2.orderNum);
        });
        _setCurrentTrack(track);

        let depthRange = self.getDepthRangeFromSlidingBar();
        self.setDepthRangeForTrack(track, depthRange);

        _registerZoneTrackCallback(track);
        _registerTrackHorizontalResizerDragCallback();
        return track;
    }

    this.addCurveToTrack = function (track, data, config) {
        if (!track || !track.addCurve) return;
        let curve = track.addCurve(data, config);

        let depthRange = self.getDepthRangeFromSlidingBar();
        self.setDepthRangeForTrack(track, depthRange);
        track.plotCurve(curve);
        track.onCurveHeaderMouseDown(curve, function() {
            if (d3.event.button == 2) {
                _curveOnRightClick();
            }
        });
        curve.header.on('dblclick', function() {
            // Mousedown already set the curve to be current curve
            _curveOnDoubleClick();
        });
        return curve;
    };

    this.addZoneToTrack = function (track, config) {
        if (!track || !track.addZone) return;
        if (!config || !config.idZoneSet) {
            config.idZoneSet = _currentTrack.isZoneTrack() ? _currentTrack.idZoneSet : undefined;
        }
        if (!config.idZoneSet) return;
        let zone = track.addZone(config);
        track.plotZone(zone);
        track.onZoneMouseDown(zone, function() {
            if (track.mode == 'SplitZone') {
                _splitZone(track, zone);
                track.setMode(null);
            }
            if (d3.event.button == 2) {
                _zoneOnRightClick();
            }
        });
        track.onZoneHeaderMouseDown(zone, function() {
            if (d3.event.button == 2) {
                _zoneOnRightClick();
            }
        });
        zone.on('dblclick', _zoneOnDoubleClick);
        zone.header.on('dblclick', _zoneOnDoubleClick);
        zone.onLineDragEnd(function() {
            let zones = track.adjustZonesOnZoneChange(zone);
            let updatedZones = zones[0];
            let deletedZones = zones[1];
            updatedZones.push(zone);
            // send api to add or delete zones
            console.log('updated zones', updatedZones);
            for (let updatedZone of updatedZones) {
                updatedZone.idZone = updatedZone.id;
                wiApiService.editZone(updatedZone, function () { });
            }
            for (let deletedZone of deletedZones) {
                wiApiService.removeZone(deletedZone.id, function () { })
            }
        })
        return zone;
    }

    this.addMarker = function () {
        if (_currentTrack && _currentTrack.addMarker && _currentTrack.setMode) {
            _currentTrack.setMode('AddMarker');
        }
    }

    this.addMarkerToTrack = function(track, config) {
        if (!track || !track.addMarker) return;
        let marker = track.addMarker(config);
        track.plotMarker(marker);
        track.onMarkerMouseDown(marker, function() {
            if (d3.event.button == 2) {
                _markerOnRightClick();
            }
        });
        marker.on('dblclick', _markerOnDoubleClick);
        marker.onLineDragEnd(function() {
            // send api to update this marker
            wiApiService.editMarker(marker.getProperties(), function () {});
        });
        return marker;
    }

    this.addImageToTrack = function(track, config) {
        if (!track || !track.addImage) return;
        let image = track.addImage(config);
        track.plotDrawing(image);
    }
    this.editImage = function (track, newConfig) {
        track.removeDrawing(track.getImages()[0]);
        let image = track.addImage(newConfig);
        track.plotDrawing(image);
    }
    this.removeImage = function (track) {
        track.removeDrawing(track.getImages()[0]);
    }

    this.addLeftShadingToTrack = function (track, curve, config) {
        if (!track || !track.addShading) return;
        let shading = track.addShading(null, curve, null, config);
        track.plotShading(shading);
        _registerShadingHeaderMouseDownCallback(track, shading);
        return shading;
    };

    this.addRightShadingToTrack = function (track, curve, config) {
        if (!track || !track.addShading) return;
        let shading = track.addShading(curve, null, null, config);
        track.plotShading(shading);
        _registerShadingHeaderMouseDownCallback(track, shading);
        return shading;
    };

    this.addCustomShadingToTrack = function (track, curve, value, config) {
        if (!track || !track.addShading) return;
        let shading = track.addShading(null, curve, value, config);
        track.plotShading(shading);
        _registerShadingHeaderMouseDownCallback(track, shading);
        console.log('shading', shading);
        return shading;
    };

    this.addCustomShadingToTrackWithLeftCurve = function (track, curve, value, config) {
        if (!track || !track.addShading) return;
        let shading = track.addShading(curve, null, value, config);
        track.plotShading(shading);
        _registerShadingHeaderMouseDownCallback(track, shading);
        console.log('shading', shading);
        return shading;
    };

    this.addPairShadingToTrack = function(track, lCurve, rCurve, config) {
        if (!track || !track.addShading) return;
        let shading = track.addShading(lCurve, rCurve, null, config);
        track.plotShading(shading);
        _registerShadingHeaderMouseDownCallback(track, shading);
        return shading;
    }

    this.removeCurrentCurve = function() {
        if (!_currentTrack.getCurrentCurve) return;
        self.removeCurveFromTrack(_currentTrack, _currentTrack.getCurrentCurve());
    }

    this.removeCurrentShading = function () {
        if (!_currentTrack.getCurrentShading) return;
        self.removeShadingFromTrack(_currentTrack, _currentTrack.getCurrentShading());
    }

    this.removeCurveFromTrack = function (track, curve) {
        if (!track || !track.removeCurve) return;
        track.removeCurve(curve);
    }

    this.removeShadingFromTrack = function (track, shading) {
        if (!track || !track.removeShading) return;
        track.removeShading(shading);
    }

    this.removeMarkerFromTrack = function(track, marker) {
        if (!track || !track.removeMarker) return;
        track.removeMarker(marker);
    }

    this.removeCurrentTrack = function () {
        return self.removeTrack(_currentTrack);
    }

    this.removeTrack = function (track) {
        let trackIdx = _tracks.indexOf(track);
        if (trackIdx < 0) return;

        if (track == _currentTrack) {
            _currentTrack = null;
        }
        _previousTrack = null;
        if (track.removeAllDrawings) {
            track.removeAllDrawings();
        }

        //let graph = wiComponentService.getComponent('GRAPH');
        graph.removeTrack(track);

        _tracks.splice(trackIdx, 1);
    }

    this.plot = function (track) {
        if (track && track.doPlot) track.doPlot(track == _currentTrack);
    };

    this.plotAll = function () {
        _tracks.forEach(function (track) {
            track.doPlot(track == _currentTrack);
        });
    };


    this.setDepthRange = function(depthRange) {
        _depthRange = depthRange;
        _tracks.forEach(function(track) {
            track.minY = depthRange[0];
            track.maxY = depthRange[1];
        });
        self.plotAll();
    };

    this.setDepthRangeForTrack = function(track, depthRange) {
        if (_depthRange[0] != depthRange[0] || _depthRange[1] != depthRange[1]) {
            self.setDepthRange(depthRange);
        }
        else {
            track.minY = depthRange[0];
            track.maxY = depthRange[1];
            self.plot(track);
            _depthRange = depthRange;
        }
    }

    this.getDepthRangeFromSlidingBar = function() {
        let slidingBar = wiComponentService.getSlidingBarForD3Area(self.name);
        let maxDepth = self.getMaxDepth();
        let minDepth = self.getMinDepth();
        let low = minDepth + slidingBar.slidingBarState.top * (maxDepth - minDepth) / 100;
        let high = low + (slidingBar.slidingBarState.range) * (maxDepth - minDepth) / 100;
        return [low, high];
    }

    this.adjustSlidingBarFromDepthRange = function(vY) {
        let slidingBar = wiComponentService.getSlidingBarForD3Area(self.name);
        let maxDepth = self.getMaxDepth();
        let minDepth = self.getMinDepth();

        let top = (vY[0] - minDepth) * 100 / (maxDepth - minDepth);
        let range = (vY[1] - minDepth) * 100 / (maxDepth - minDepth) - top;
        slidingBar.updateSlidingHandlerByPercent(top, range);
    }

    this.getMaxDepth = function() {
        let wellProps = _getWellProps();
        if (wellProps.bottomDepth)
            return parseFloat(wellProps.bottomDepth);

        let maxDepth = d3.max(_tracks, function (track) {
            if (track.getExtentY) return track.getExtentY()[1];
            return -1;
        });
        _maxDepth = (maxDepth > 0) ? maxDepth : 100000;
        return _maxDepth;
    };

    this.getMinDepth = function() {
        let wellProps = _getWellProps();
        return parseFloat(wellProps.topDepth) || 0;
    }

    this.zoom = function(zoomOut) {
        let range = _depthRange[1] - _depthRange[0];
        let low, high;
        let maxDepth = self.getMaxDepth();
        let minDepth = self.getMinDepth();
        let yStep = parseFloat(_getWellProps().step) || 1;
        if (zoomOut) {
            low = _depthRange[0] - range * 0.2;
            high = _depthRange[1] + range * 0.2;
        }
        else {
            low = _depthRange[0] + range * 0.2;
            high = _depthRange[1] - range * 0.2;
        }
        if (low + 2*yStep >= high) return;
        low = low < minDepth ? minDepth : low;
        high = high > maxDepth ? maxDepth : high;
        self.setDepthRange([low, high]);
        self.adjustSlidingBarFromDepthRange([low, high]);
    }

    /* Private Begin */
    function _splitZone(track, zone) {
        let props = Utils.objClone(zone.getProperties());
        let zone1 = self.addZoneToTrack(track, {});
        let zone2 = self.addZoneToTrack(track, {});

        zone1.setProperties(props);
        zone2.setProperties(props);

        let fill = props.fill;
        let fill1 = Utils.objClone(fill);
        fill1.pattern.background = track.genColor();
        zone1.fill = fill1;

        let fill2 = Utils.objClone(fill);
        fill2.pattern.background = track.genColor();
        zone2.fill = fill2;

        let y = d3.mouse(track.plotContainer.node())[1];
        let depth = zone.getTransformY().invert(y);
        console.log('--------------------------', props);
        // Send api to remove zone
        wiApiService.removeZone(zone.id, function () {
            zone1.endDepth = depth;
            zone2.startDepth = depth;
            zone2.name = parseInt(depth);
            // Send api to create zones;
            wiApiService.createZone(zone1.getProperties(), function (zone1Return, err) {
                if (err) return;
                zone1.id = zone1Return.idZone;
                wiApiService.createZone(zone2.getProperties(), function (zone2Return, err) {
                    if (err) return;
                    zone2.id = zone2Return.idZone;
                    track.plotZone(zone1);
                    track.plotZone(zone2);
                    track.removeZone(zone);
                })
            })
        })
    }

    function _drawTooltip(track) {
        if (!_tooltip) return;
        let svg = document.getElementById(self.svgId);
        track.drawTooltipText(svg);
        graph.createTooltipLines(svg);
    }

    function _removeTooltip(track) {
        if (!_tooltip) return;
        let svg = document.getElementById(self.svgId);
        track.removeTooltipText(svg);
        graph.removeTooltipLines(svg);
    }

    function _setCurrentTrack(track) {
        if (_currentTrack == track) return;
        _previousTrack = _currentTrack;
        _currentTrack = track;
        _currentTrack.highlightCallback();
        _clearPreviousHighlight();
    }

    function _clearPreviousHighlight() {
        if (!_previousTrack) return;
        if (_previousTrack != _currentTrack) {
            if (_previousTrack.setCurrentDrawing)
                _previousTrack.setCurrentDrawing(null);
            _previousTrack.doPlot(false);
        }

    }

    function _onPlotMouseDownCallback(track) {
        if (track.mode == 'AddMarker') {
            let y = d3.mouse(track.plotContainer.node())[1];

            let marker = self.addMarkerToTrack(track, {
                minY: track.minY,
                maxY: track.maxY,
                idTrack: track.id
            });

            let transformY = track.getTransformY();
            let depth = transformY.invert(y);
            marker.setProperties({
                depth: depth
            });

            // send api to create new marker
            wiApiService.createMarker(marker.getProperties(), function (returnMarker) {
                marker.setProperties({ idMarker: returnMarker.idMarker });
                track.setCurrentDrawing(marker);
                track.plotDrawing(marker);
                track.setMode(null);
            });
            return;
        }
        if (d3.event.currentDrawing && d3.event.button == 2) {
            if (d3.event.currentDrawing.isCurve()) {
                _curveOnRightClick();
            }
            else if (d3.event.currentDrawing.isShading()) {
                _shadingOnRightClick();
            }
        }
    }

    function _onPlotDoubleClickCallback(track) {
        if (d3.event.currentDrawing) {
            if (d3.event.currentDrawing.isCurve()) {
                _curveOnDoubleClick();
            }
            else if (d3.event.currentDrawing.isShading()) {
                _shadingOnDoubleClick();
            }
        }
    }

    function _registerLogTrackCallback(track) {
        let dragMan = wiComponentService.getComponent(wiComponentService.DRAG_MAN);
        track.onPlotMouseOver(function () {
            if (!dragMan.dragging) return;
            dragMan.wiD3Ctrl = self;
            dragMan.track = track;
        });
        track.onPlotMouseLeave(function () {
            _removeTooltip(track);
            if (!dragMan.dragging) return;
            dragMan.wiD3Ctrl = null;
            dragMan.track = null;
        });
        track.onPlotMouseWheel(function () {
            _onPlotMouseWheelCallback();
        });
        track.onPlotMouseDown(function () {
            _onPlotMouseDownCallback(track);
        });
        track.onHeaderMouseDown(function () {
            _onHeaderMouseDownCallback(track);
        });
        track.onPlotDoubleClick(function() {
            _onPlotDoubleClickCallback(track);
        });
        track.plotContainer.on('mousemove', function() {
            _drawTooltip(track);
        });
        track.on('keydown', function() {
            _onTrackKeyPressCallback(track);
        });
        _registerTrackCallback(track);
    }

    function _registerZoneTrackCallback(track) {
        let zone;
        track.plotContainer.call(d3.drag()
            .on('start', function() {
                track.setCurrentDrawing(null);
                if (track.mode != 'AddZone') return;
                track.startY = d3.mouse(track.plotContainer.node())[1];
            })
            .on('drag', function() {
                if (track.mode != 'AddZone') return;
                let y1 = d3.mouse(track.plotContainer.node())[1];
                let y2 = track.startY;
                let minY = d3.min([y1, y2]);
                let maxY = d3.max([y1, y2]);
                zone = track.getCurrentZone();

                if (!zone) {
                    zone = self.addZoneToTrack(track, {
                        minY: track.minY,
                        maxY: track.maxY
                    });
                    track.setCurrentDrawing(zone);
                }
                if (!zone) {
                    track.setMode(null);
                    return;
                }
                let transformY = zone.getTransformY();
                let startDepth = transformY.invert(minY);
                let endDepth = transformY.invert(maxY);
                zone.setProperties({
                    name: parseInt(startDepth),
                    startDepth: startDepth,
                    endDepth: endDepth
                });
                track.plotZone(zone);
            })
            .on('end', function() {
                if (track.mode != 'AddZone') return;
                // Send api to create new zone on server
                if (!track.idZoneSet) {
                    track.idZoneSet = _currentTrack.isZoneTrack() ? _currentTrack.idZoneSet : undefined;
                    if (!track.idZoneSet) return;
                }
                console.log(track);
                let zoneData = {
                    idZoneSet: track.idZoneSet,
                    name: zone.name,
                    startDepth: zone.startDepth,
                    endDepth: zone.endDepth,
                    fill: zone.fill
                }
                wiApiService.createZone(zoneData, function (createdZone, err) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    zone.setProperties(createdZone);
                })
                let modifiedZones = track.adjustZonesOnZoneChange(zone);
                let updatedZones = modifiedZones[0];
                let deletedZones = modifiedZones[1];
                // Send api to update or delete zones
                if (updatedZones && updatedZones.length) {
                    updatedZones.forEach(function (updatingZone) {
                        updatingZone.idZone = updatingZone.id;
                        console.log(updatingZone);
                        wiApiService.editZone(updatingZone, function () { });
                    });
                }
                if (deletedZones && deletedZones.length) {
                    deletedZones.forEach(function (deletingZone) {
                        wiApiService.removeZone(deletingZone.id, function () { });
                    });
                }
                track.setMode(null);
            })
        );
        track.on('keydown', function() {
            _onTrackKeyPressCallback(track);
        });
        _registerTrackCallback(track);
    }

    function _registerTrackCallback(track) {
        track.on('focus', function() {
            _setCurrentTrack(track);
        });
        track.on('mousedown', function() {
            if (d3.event.button == 2) _trackOnRightClick(track);
        })
        track.on('dblclick', function() {
            openTrackPropertiesDialog();
        });
    }

    function _registerShadingHeaderMouseDownCallback(track, shading) {
        track.setCurrentDrawing(shading);
        track.onShadingHeaderMouseDown(shading, function() {
            if (d3.event.button == 2) {
                _shadingOnRightClick();
            }
        });
        shading.header.on('dblclick', function() {
            // Mousedown already set the shading to be current shading
            _shadingOnDoubleClick();
        });
    }

    function _registerTrackHorizontalResizerDragCallback(track) {
        _tracks.forEach(function(track) {
            track.onHorizontalResizerDrag(function() {
                _tracks.forEach(function(t) {
                    if (track == t) return;
                    t.horizontalResizerDragCallback();
                })
            });
        })
    }

    function _onPlotMouseWheelCallback(track) {
        self.zoom(d3.event.deltaY < 0)
    }

    function _onHeaderMouseDownCallback(track) {
        track.setCurrentDrawing(null);
    }

    function _onTrackKeyPressCallback(track) {
        if (!d3.event) return;
        console.log(d3.event.key);
        switch (d3.event.key) {
            case 'Backspace':
            case 'Delete':
                let drawing = track.getCurrentDrawing();
                if (!drawing) return;

                if (drawing.isCurve()) {
                    let curve = drawing;
                    let props = curve.getProperties();
                    console.log(props);
                    let idLine = props.idLine;
                    wiApiService.removeLine(idLine, function() {
                       track.removeCurve(curve);
                    });
                }
                else if (drawing.isShading()) {
                    // TO DO
                    // Send api before deleting
                    track.removeDrawing(drawing);
                }
                else if (drawing.isZone()) {
                    // Send api before deleting
                    wiApiService.removeZone(drawing.id, function () {
                        track.removeDrawing(drawing);
                    })
                }

                return;
            case 'Escape':
                // Bug
                if (track && track.setMode) track.setMode(null);
                return;
        }
    }

    function _markerOnDoubleClick() {
        console.log('Marker double clicked');
        markerProperties();
        d3.event.stopPropagation();
    }

    function _zoneOnDoubleClick() {
        zoneProperties();
        // Prevent track properties dialog from opening
        d3.event.stopPropagation();
    }

    function _shadingOnDoubleClick() {
        console.log('Shading double clicked');
        let currentShading = _currentTrack.getCurrentShading();
            console.log("Shading Properties", currentShading);
            DialogUtils.logTrackPropertiesDialog(ModalService, _currentTrack, self.wiLogplotCtrl, wiApiService, function (props) {
                if (props) {
                    console.log('logTrackPropertiesData', props);
                }
            }, {
                tabs:['false', 'false', 'true'],
                shadingOnly: true
            });
        // Prevent track properties dialog from opening
        d3.event.stopPropagation();
    }

    function _curveOnDoubleClick() {
        let currentCurve = _currentTrack.getCurrentCurve();
        DialogUtils.curvePropertiesDialog(
            ModalService,
            wiComponentService,
            wiApiService,
            DialogUtils,
            currentCurve,
            _currentTrack,
            self.wiLogplotCtrl
        );

        // Prevent track properties dialog from opening
        d3.event.stopPropagation();
    }

    function zoneProperties () {
        let zone = _currentTrack.getCurrentZone();
        DialogUtils.zonePropertiesDialog(ModalService, zone.getProperties(), function (props) {
            wiApiService.editZone(props, function () {
                zone.setProperties(props);
                zone.doPlot();
            })
        })
    }

    function markerProperties (marker) {
        if (!marker) {
            marker = _currentTrack.getCurrentMarker();
            console.log(_currentTrack.getCurrentMarker());
        }
        DialogUtils.markerPropertiesDialog(ModalService, marker.getProperties(), function (props) {
            wiApiService.editMarker(props, function () {
                marker.setProperties(props);
                marker.doPlot();
            })
        })
    }

    function _markerOnRightClick() {
        let marker = _currentTrack.getCurrentMarker();
        self.setContextMenu([
            {
                name: "MarkerProperties",
                label: "Marker Properties",
                icon: "marker-properties-16x16",
                handler: function () {
                    markerProperties(marker);
                }
            }, {
                name: "RemoveMarker",
                label: "Remove Marker",
                icon: "marker-delete-16x16",
                handler: function () {
                    // send api to remove marker
                    wiApiService.removeMarker(marker.id, function () {
                        _currentTrack.removeMarker(marker);
                    })
                }
            }
        ]);
    }

    function _zoneOnRightClick() {
        let zone = _currentTrack.getCurrentZone();

        self.setContextMenu([
            {
                name: "AutoZoneNamed",
                label: "Auto Zone Named",
                handler: function () {}
            }, {
                name: "ZoneProperties",
                label: "Zone Properties",
                icon: "zone-edit-16x16",
                handler: zoneProperties
            }, {
                name: "RemoveZone",
                label: "Remove Zone",
                icon: "zone-delete-16x16",
                handler: function () {
                    wiApiService.removeZone(zone.id, function () {
                        _currentTrack.removeZone(zone);
                    });
                }
            }, {
                name: "ZoneTable",
                label: "Zone Table",
                icon: "zone-table-16x16",
                handler: function () {
                }
            }, {
                name: "SplitZone",
                label: "Split Zone",
                handler: function () {
                    _currentTrack.setMode('SplitZone');
                }
            }
        ]);
    }

    function _shadingOnRightClick() {
        //let posX = d3.event.clientX, posY = d3.event.clientY;
        self.setContextMenu([{
            name: "ShadingProperties",
            label: "Shading Properties",
            icon: "shading-properties-16x16",
            handler: function() {
                let currentShading = _currentTrack.getCurrentShading();
                console.log("Shading Properties", currentShading);
                DialogUtils.logTrackPropertiesDialog(ModalService, _currentTrack, self.wiLogplotCtrl, wiApiService, function (props) {
                    if (props) {
                        console.log('logTrackPropertiesData', props);
                    }
                }, {
                    tabs:['false', 'false', 'true'],
                    shadingOnly: true
                });
            }
        },
        {
            name: "RemoveShading",
            label: "Remove Shading",
            icon: "shading-delete-16x16",
            handler: function () {
                let currentShading = _currentTrack.getCurrentShading();
                wiApiService.removeShading(currentShading.id, function(ret){
                    console.log(ret, currentShading);
                    self.removeShadingFromTrack(_currentTrack, currentShading);
                });
                // self.addLeftShadingToTrack(_currentTrack, _currentTrack.getCurrentCurve(), {});

            }
        }]);
        /*$timeout(function() {
            wiComponentService.getComponent('ContextMenu').open(posX, posY, [{
                name: "RemoveShading",
                label: "Remove Shading",
                handler: function () {
                    self.removeCurrentShading();
                }
            }]);
        });*/
    }

    function _curveOnRightClick() {
        //let posX = d3.event.clientX, posY = d3.event.clientY;
        //console.log('-------------');
        self.setContextMenu([{
            name: "CurveProperties",
            label: "Curve Properties",
            icon: "curve-properties-16x16",
            handler: function () {
                let currentCurve = _currentTrack.getCurrentCurve();
                DialogUtils.curvePropertiesDialog(
                    ModalService,
                    wiComponentService,
                    wiApiService,
                    DialogUtils,
                    currentCurve,
                    _currentTrack,
                    self.wiLogplotCtrl)
            }
        }, {
            name: "EditCurve",
            label: "Edit Curve",
            icon: "edit-curve-text-16x16",
            handler: function () {
                Utils.error("Feature is not implemented");
            }
        }, {
            name: "DepthShift",
            label: "Depth Shift",
            icon: "",
            handler: function () {

            }
        }, {
            name: "RemoveCurve",
            label: "Remove Curve",
            icon: "curve-hide-16x16",
            handler: function () {
                let idLine = _currentTrack.getCurrentCurve().id;
                wiApiService.removeLine(idLine, self.removeCurrentCurve());
            }
        }, {
            name: "BaseLineShift",
            label: "BaseLine Shift",
            handler: function () {

            }
        }, {
            name: "ReverseDisplaay",
            label: "Reverse Displaay",
            handler: function () {

            }
        }, {
            name: "CrossPlot",
            label: "Cross plot",
            icon: "crossplot-blank-16x16",
            handler: self.createCrossplot
        }, {
            name: "Histogram",
            label: "Histogram",
            icon: "histogram-new-16x16",
            handler: function () {

            }
        }, {
            name: "CreateShading",
            label: "Create Shading",
            icon: "shading-add-16x16",
            handler: function () {
                let curve1 = _currentTrack.getCurrentCurve();
                let curve2 = _currentTrack.getTmpCurve();
                console.log("create shading!!", curve1);
                if (!curve1) return;
                var config = {
                        isNegPosFill : false,
                        fill: {
                            display: true,
                            pattern: {
                                name: "none",
                                foreground: "transparent",
                                background: "blue"
                            }
                        },
                        positiveFill: {
                            display: false,
                            pattern: {
                                name: "none",
                                foreground: "transparent",
                                background: "blue"
                            }
                        },
                        negativeFill: {
                            display: false,
                            pattern: {
                                name: "none",
                                foreground: "transparent",
                                background: "blue"
                            }
                        },
                        showRefLine: false
                    };

                    console.log("curve1", _currentTrack, curve1);
                    let shadingObj = {
                        idTrack: _currentTrack.id,
                        name: 'Default_shading',
                        negativeFill: config.negativeFill,
                        positiveFill: config.positiveFill,
                        fill: config.fill,
                        isNegPosFill: config.isNegPosFill,
                        idLeftLine: curve2?curve2.id:null,
                        idRightLine: curve1.id,
                        leftFixedValue: curve2?null:curve1.minX,
                        rightFixedValue: null,
                        idControlCurve: null
                    }
                    wiApiService.createShading(shadingObj, function(shading){
                        console.log("createShading", shading);
                        let shadingModel = Utils.shadingToTreeConfig(shading);
                        if (!curve2) {
                            // This should open dialog
                            self.addCustomShadingToTrack(_currentTrack, curve1, shadingModel.data.leftX, shadingModel.data);
                        }
                        else {
                            self.addPairShadingToTrack(_currentTrack, curve1, curve2, shadingModel.data);
                        }
                        DialogUtils.logTrackPropertiesDialog(ModalService, _currentTrack, self.wiLogplotCtrl, wiApiService, function (props) {
                            if (props) {
                                console.log('logTrackPropertiesData', props);
                            }
                        }, {
                            tabs:['false', 'false', 'true'],
                            shadingOnly: true
                        });
                    })
            }
        }
        ]);
    }
    this.createCrossplot = function () {
        let curve1 = _currentTrack.getCurrentCurve();
        let curve2 = _currentTrack.getTmpCurve();
        if (!curve1 || !curve2) {
            console.log('Two curves are needed');
        }
        else {
            console.log('Create crossplot', curve1, curve2);
            let promptConfig = {
                title: 'Create New Crossplot',
                inputName: 'Crossplot Name',
                input: curve1.name + '_' + curve2.name
            }
            DialogUtils.promptDialog(ModalService, promptConfig, function (crossplotName) {
                let idWell = self.wiLogplotCtrl.getLogplotModel().properties.idWell;
                Utils.createCrossplot(idWell, crossplotName, function (wiCrossplotCtrl) {
                    console.log("wiCrossplotCtrl", wiCrossplotCtrl);
                    let wiD3CrossplotCtrl = wiCrossplotCtrl.getWiD3CrossplotCtrl();
                    let dataPointSet = {
                        idCrossPlot: wiCrossplotCtrl.id,
                        idWell: idWell,
                        idCurveX: curve1.idCurve,
                        idCurveY: curve2.idCurve,
                    }
                    let wellProps = _getWellProps();
                    Utils.createPointSet(dataPointSet, function (pointSet) {
                        wiD3CrossplotCtrl.createVisualizeCrossplot(curve1, curve2, {
                            name: crossplotName,
                            idCrossPlot: wiCrossplotCtrl.id,
                            idWell: idWell,
                            topDepth: wellProps.topDepth,
                            bottomDepth: wellProps.bottomDepth
                        });
                    })
                });
            })
        }
    }
    function _trackOnRightClick(track) {
        if (track.isZoneTrack()) {
            self.setContextMenu([
                {
                    name: "TrackProperties",
                    label: "Track Properties",
                    icon: 'track-properties-16x16',
                    handler: openTrackPropertiesDialog
                }, {
                    separator: '1'
                }, {
                    name: "AddDepthTrack",
                    label: "Add Depth Track",
                    icon: 'depth-axis-add-16x16',
                    handler: function () {
                        self.addDepthTrack();
                    }
                }, {
                    name: "AddLogTrack",
                    label: "Add Log Track",
                    icon: 'logplot-blank-16x16',
                    handler: function () {
                        self.addLogTrack();
                    }
                }, {
                    name: "AddZonationTrack",
                    label: "Add Zonation Track",
                    icon: 'zonation-track-add-16x16',
                    handler: function () {
                        self.addZoneTrack();
                    }
                }, {
                    separator: '1'
                }, {
                    name: "AddZone",
                    label: "Add Zone",
                    icon: "zone-edit-16x16",
                    handler: function () {
                        if (!track.idZoneSet) {
                            Utils.error('Zone Set is required');
                            return;
                        }
                        track.setMode('AddZone');
                    }
                }, {
                    name: "DuplicateTrack",
                    label: "Duplicate Track",
                    icon: 'track-duplicate-16x16',
                    handler: function () {
                        logplotHandlers.DuplicateTrackButtonClicked();
                    }
                }, {
                    name: "DeleteTrack",
                    label: "Delete Track",
                    icon: 'track-delete-16x16',
                    handler: function () {
                        logplotHandlers.DeleteTrackButtonClicked();
                    }
                },
            ]);
        }
    }

    function _getWellProps() {
        let well = Utils.findWellByLogplot(self.logPlotCtrl.id) || {};
        return well.properties || {};
    }

    function getLogplotCtrl() {
        let logPlotName = self.name.replace("D3Area", "");
        return wiComponentService.getComponent(logPlotName);
    }
    /* Private End */

    function openTrackPropertiesDialog() {
        if (!_currentTrack) return;
        if (_currentTrack.isLogTrack()) {
            DialogUtils.logTrackPropertiesDialog(ModalService, _currentTrack, self.wiLogplotCtrl, wiApiService, function (props) {
                if (props) {
                    console.log('logTrackPropertiesData', props);
                }
            }, {
                tabs:['true', 'true','true']
            });
        } else if (_currentTrack.isDepthTrack()) {
            DialogUtils.depthTrackPropertiesDialog(ModalService, _currentTrack, wiApiService, function (props) {
                if (props) {
                    console.log('depthTrackPropertiesData', props);
                }
            });
        } else if (_currentTrack.isZoneTrack()) {
            DialogUtils.zoneTrackPropertiesDialog(ModalService, self.logPlotCtrl, _currentTrack.getProperties(), function (props) {
                if (props) {
                    props.idZoneTrack = _currentTrack.id;
                    console.log(props);
                    wiApiService.editZoneTrack(props, function () {
                        props.width = Utils.inchToPixel(props.width);
                        _currentTrack.setProperties(props);
                        _currentTrack.doPlot(true);
                    });
                }
            });
        }
    }

    this.openProptertiesDialog = function () {
        if (_currentTrack.isDepthTrack()) {
            openTrackPropertiesDialog();
            return;
        }
        let currentDrawing = _currentTrack.getCurrentDrawing();
        if (!currentDrawing) openTrackPropertiesDialog();
        else switch (currentDrawing.type) {
            case 'curve':
                _curveOnDoubleClick();
                break;
            case 'shading':
                _shadingOnDoubleClick();
                break;
            case 'marker':
                _markerOnDoubleClick();
                break;
            case 'zone':
                _zoneOnDoubleClick();
                break;
            default:
                break;
        }
    }

    let logplotHandlers = {};
    this.$onInit = function () {
        self.plotAreaId = self.name + 'PlotArea';
        self.svgId = self.plotAreaId + 'SVG';

        self.logPlotCtrl = getLogplotCtrl();
        //WiLogplotModel = self.wiLogplotCtrl.getLogplotModel();
        let handlers = wiComponentService.getComponent('LOGPLOT_HANDLERS');
        Utils.bindFunctions(logplotHandlers, handlers, {
            $scope: $scope,
            wiComponentService: wiComponentService,
            wiApiService: wiApiService,
            ModalService: ModalService,
            wiLogplot: self.logPlotCtrl
        });

        if (self.name) {
            wiComponentService.putComponent(self.name, self);
            wiComponentService.emit(self.name);
        }

        $timeout(function() {
            graph.sheetDraggable(document.getElementById(self.plotAreaId));
        }, 1000)
    };

    var commonCtxMenu = [
        {
            name: "TrackProperties",
            label: "Track Properties",
            icon: 'track-properties-16x16',
            handler: openTrackPropertiesDialog
        },
        {
            name: "SwitchToLogarithmic",
            label: "Switch To Logarithmic",
            icon: 'logarithmic-switch-16x16',
            handler: function () {
                let scale = _currentTrack.scale;
                if (scale.toLowerCase() == 'linear')
                    _currentTrack.scale = 'logarithmic';
                else if (scale.toLowerCase() == 'logarithmic')
                    _currentTrack.scale = 'linear';
                _currentTrack.doPlot(true);
            }
        },
        {
            separator: '1'
        },
        {
            name: "AddDepthTrack",
            label: "Add Depth Track",
            icon: 'depth-axis-add-16x16',
            handler: function () {
                self.addDepthTrack();
            }
        },
        {
            name: "AddLogTrack",
            label: "Add Log Track",
            icon: 'logplot-blank-16x16',
            handler: function () {
                self.addLogTrack();
            }
        },
        {
            name: "AddZonationTrack",
            label: "Add Zonation Track",
            icon: 'zonation-track-add-16x16',
            handler: function () {
                self.addZoneTrack();
            }
        },
        {
            separator: '1'
        },
        {
            name: "AddMarker",
            label: "Add Marker",
            icon: 'marker-add-16x16',
            handler: function () {
                self.addMarker();
            }
        },
        {
            name: "Add Annotation",
            label: "Add Annotation",
            icon: 'annotation-16x16',
            handler: function () {
                console.log('Switch To Logarithmic');
            }
        },
        {
            name: "Add Image",
            label: "Add Image",
            icon: 'image-add-16x16',
            handler: function () {
                logplotHandlers.AddImageButtonClicked();
            }
        },
        {
            name: "RemoveImage",
            label: "Remove Image",
            icon: 'image-delete-16x16',
            handler: function () {
                logplotHandlers.RemoveImageButtonClicked();
            }
        },
        {
            name: "Create Shading",
            label: "Create Shading",
            icon: 'shading-add-16x16',
            handler: function () {
                console.log('Create Shading');
            }
        },
        {
            separator: '1'
        },
        {
            name: "DuplicateTrack",
            label: "Duplicate Track",
            icon: 'track-duplicate-16x16',
            handler: function () {
                logplotHandlers.DuplicateTrackButtonClicked();
            }
        },
        {
            name: "DeleteTrack",
            label: "Delete Track",
            icon: 'track-delete-16x16',
            handler: function () {
                logplotHandlers.DeleteTrackButtonClicked();
            }
        },
    ];

    this.contextMenu = commonCtxMenu;

    this.showContextMenu = function (event) {
        if (event.button != 2) return;
        event.stopPropagation();
        wiComponentService.getComponent('ContextMenu')
            .open(event.clientX, event.clientY, self.contextMenu, function () {
                self.contextMenu = commonCtxMenu;
            });
    }
    this.setContextMenu = function (ctxMenu) {
        self.contextMenu = ctxMenu;
    }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-d3.html',
    controller: Controller,
    controllerAs: componentName,
    transclude: true,
    bindings: {
        name: '@',
        wiLogplotCtrl: '<'
    }
});

exports.name = moduleName;
