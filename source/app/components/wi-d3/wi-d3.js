const componentName = 'wiD3';
const moduleName = 'wi-d3';

// function getCurveFromName(name) {
//     console.log("-", name);
//     let nSamples = 1000;
//     let samples = new Array();
//     for (let i = 0; i < nSamples; i++) {
//         samples.push({y: i, x: Math.random()});
//     }
//     return samples;
// }

function Controller($scope, wiComponentService, $timeout, ModalService, wiApiService, $compile) {
    let self = this;
    this.scopeObj = $scope;
    this.compileFunc = $compile;
    
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
        DialogUtils.errorMessageDialog(ModalService, message);
    }

    function getOrderKey(track) {
        if (_tracks.length <= 0) {
            return 'm';
        }
        if (!track) track = _currentTrack;
        var currentIdx = _tracks.indexOf(track);
        if (currentIdx < 0 || currentIdx == (_tracks.length - 1)) {
            currentIdx = _tracks.length - 1;
            let currentOrderKey = _tracks[currentIdx].orderNum;
            var key = String.fromCharCode(currentOrderKey.charCodeAt(0) + 1);
            console.log(key);
            return key;
        }
        return _tracks[currentIdx].orderNum + _tracks[currentIdx + 1].orderNum;
    }
    this.getOrderKey = getOrderKey;

    /**
     * If param is absent, return a boolean indicating whether tooltip is on or off
     * If param is present, set tooltip on/off
     */
    this.tooltip = function (on) {
        if (on === undefined) return _tooltip;
        _tooltip = on;
    }

    this.getDepthRange = function () {
        return _depthRange.map(function (d) {
            return Math.round(d * 10000) / 10000;
        });
    }

    this.getDepthRangeRaw = function () {
        return _depthRange;
    }

    this.getMaxOrderNum = function () {
        return _tracks.reduce(function (max, item) {
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

    this.addLogTrack = function (trackTitle, callback) {
        var trackOrder = getOrderKey();
        if (trackOrder) {
            const logTracks = self.getTracks().filter(track => track.type == 'log-track');
            wiApiService.createLogTrack(self.logPlotCtrl.id, trackOrder, function (ret) {
                wiApiService.infoTrack(ret.idTrack, function (logTrack) {
                    logTrack.title = trackTitle || 'Track ' + (logTracks.length + 1);
                    let viTrack = self.pushLogTrack(logTrack);
                    wiApiService.editTrack(logTrack, function () {
                        if (!callback) return;
                        callback(viTrack);
                    });
                });
            });
        }
        else {
            error('Cannot add Log track');
        }
    }

    this.pushLogTrack = function (logTrack) {
        console.log('pushLogTrack:', logTrack);
        let config = {
            id: logTrack.idTrack,
            idPlot: logTrack.idPlot,
            orderNum: logTrack.orderNum,
            name: logTrack.title,
            yStep: parseFloat(_getWellProps().step),
            offsetY: parseFloat(_getWellProps().topDepth),
            width: Utils.inchToPixel(logTrack.width),
            zoomFactor: logTrack.zoomFactor,
            xMajorTicks: logTrack.majorTicks,
            xMinorTicks: logTrack.minorTicks,

            topJustification: logTrack.topJustification,
            bottomJustification: logTrack.bottomJustification,
            color: logTrack.color,
            showDepthGrid: logTrack.showDepthGrid,
            showLabels: logTrack.showLabels,
            showEndLabels: logTrack.showEndLabels,
            showTitle: logTrack.showTitle,
            showValueGrid: logTrack.showValueGrid,

            labelFormat: logTrack.labelFormat,
            displayType: logTrack.displayType
        };
        let track = graph.createLogTrack(config, document.getElementById(self.plotAreaId), wiApiService);
        graph.rearrangeTracks(self);

        _tracks.push(track);
        _tracks.sort(function (track1, track2) {
            return track1.orderNum.localeCompare(track2.orderNum);
        });

        this.processZoomFactor();
        if (!track._shouldRescaleWindowY) {
            _tracks.forEach(function (tr) {
                if (tr != track) tr.doPlot();
            })
        }

        _setCurrentTrack(track);
        let depthRange = self.getDepthRangeFromSlidingBar();
        self.setDepthRangeForTrack(track, depthRange);

        _registerLogTrackCallback(track);
        _registerTrackHorizontalResizerDragCallback();
        _registerTrackDragCallback(track);
        track.setCurrentDrawing(null);
        return track;
    };

    this.updateLogTrack = function (viTrack) {
        if (!viTrack.isLogTrack()) return;
        
        viTrack.drawings.forEach(function(d) {
            if (d.isShading) self.removeShadingFromTrack(viTrack, d);
        })
        let trackProps = viTrack.getProperties();
        let palettes = wiComponentService.getComponent(wiComponentService.PALETTES);
        function _addShadingToTrack (shading) {
            wiApiService.dataCurve(shading.idControlCurve, function(dataCurve) {
                let shadingModel = Utils.shadingToTreeConfig(shading, palettes);
                shadingModel.data.selectedCurve = graph.buildCurve({idCurve: shading.idControlCurve}, dataCurve, _getWellProps());
                if (!shadingModel.idRightLine) return;
                if (!shadingModel.idLeftLine) {
                    let lineObj1 = viTrack.getCurves().find(viCurve => viCurve.id == shading.idRightLine);
                    if (!lineObj1) return;
                    self.addCustomShadingToTrack(viTrack, lineObj1, shadingModel.data.leftX, shadingModel.data);
                }
                else {
                    let lineObj1 = viTrack.getCurves().find(viCurve => viCurve.id == shading.idRightLine);
                    let lineObj2 = viTrack.getCurves().find(viCurve => viCurve.id == shading.idLeftLine);
                    if (!lineObj1 || ! lineObj2) return;
                    self.addPairShadingToTrack(viTrack, lineObj2, lineObj1, shadingModel.data);
                }
            })
        }
        wiApiService.infoTrack(trackProps.idTrack, function (logTrack) {
            viTrack.getMarkers().forEach(viMarker => {
                let marker = logTrack.markers.find(marker => marker.idMarker == viMarker.id);
                viTrack.removeDrawing(viMarker);
                if (marker) {
                    self.addMarkerToTrack(viTrack, marker);
                } // add if viMarker in track
            });
            logTrack.markers.forEach(marker => {
                if(!viTrack.getMarkers().find(viMarker => viMarker.id == marker.idMarker)) {
                    self.addMarkerToTrack(viTrack, marker);
                } // add if marker not in viTrack
            });
            viTrack.getAnnotations().forEach(viAnno => {
                let anno = logTrack.annotations.find(anno => anno.idAnnotation == viAnno.id);
                viTrack.removeDrawing(viAnno);
                if (anno) {
                    self.addAnnotationToTrack(viTrack, anno);
                }
            });
            logTrack.annotations.forEach(anno => {
                if(!viTrack.getAnnotations().find(viAnno => viAnno.id == anno.idAnnotation)) {
                    self.addAnnotationToTrack(viTrack, anno);
                }
            });
            let promises = [];
            viTrack.getCurves().forEach(viCurve => {
                let line = logTrack.lines.find(line => line.idLine == viCurve.id);
                let curveData = viCurve.rawData;
                viTrack.removeDrawing(viCurve);
                if (line) {
                    self.addCurveToTrack(viTrack, curveData, Utils.lineToTreeConfig(line).data);
                }
            });
            logTrack.lines.forEach(line => {
                if(!viTrack.getCurves().find(viCurve => viCurve.id == line.idLine)) {
                    promises.push(new Promise(resolve => {
                        wiApiService.dataCurve(line.idCurve, function (curveData) {
                            self.addCurveToTrack(viTrack, curveData, Utils.lineToTreeConfig(line).data);
                            resolve();
                        })
                    }))
                }
            });
            Promise.all(promises)
                .then(function () {
                    viTrack.getShadings().forEach(viShading => {
                        let shading = logTrack.shadings.find(shading => shading.idShading == viShading.id);
                        viTrack.removeDrawing(viShading);
                        if (!shading) return;
                        _addShadingToTrack(shading);
                    });
                    logTrack.shadings.forEach(shading => {
                        if(viTrack.getShadings().find(viShading => viShading.id == shading.idShading)) return;
                        _addShadingToTrack(shading);
                    });

                    logTrack.width = Utils.inchToPixel(logTrack.width);
                    viTrack.setProperties(logTrack);
                    viTrack.doPlot();
                })
                .catch(function (err) {
                    console.error(err);
                })
        });
    }

    this.addDepthTrack = function (callback) {
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
        graph.rearrangeTracks(self);

        _tracks.push(track);
        _tracks.sort(function (track1, track2) {
            return track1.orderNum.localeCompare(track2.orderNum);
        });

        _setCurrentTrack(track);

        let depthRange = self.getDepthRangeFromSlidingBar();
        self.setDepthRangeForTrack(track, depthRange);

        _registerTrackCallback(track);
        _registerTrackHorizontalResizerDragCallback();
        _registerTrackDragCallback(track);
        // track.onPlotMouseWheel(function () {
        //     _onPlotMouseWheelCallback();
        // });
        self.updateScale();
    };

    this.addImageTrack = function (callback) {
        let trackOrder = getOrderKey();
        if (trackOrder) {
            const imageTracks = self.getTracks().filter(track => track.type == 'image-track');
            const defaultImageTrackProp = {
                showTitle: true,
                title: "Image Track " + (imageTracks.length + 1),
                topJustification: "center",
                bottomJustification: "center",
                background: '#ffffff',
                width: Utils.inchToPixel(1)
            }
            DialogUtils.imageTrackPropertiesDialog(ModalService, self.logPlotCtrl, defaultImageTrackProp, function (imageTrackProperties) {
                let dataRequest = {
                    idPlot: self.logPlotCtrl.id,
                    title: imageTrackProperties.title,
                    showTitle: imageTrackProperties.showTitle,
                    topJustification: imageTrackProperties.topJustification,
                    bottomJustification: imageTrackProperties.bottomJustification,
                    background: imageTrackProperties.background,
                    width: imageTrackProperties.width,
                    orderNum: trackOrder
                }
                wiApiService.createImageTrack(dataRequest, function (returnImageTrack) {
                    let viTrack = self.pushImageTrack(returnImageTrack);
                })
            })
        } else {
            console.error('add new image track error!');
        }
    }

    this.pushImageTrack = function (imageTrack) {
        let config = angular.copy(imageTrack);
        config.id = imageTrack.idImageTrack;
        config.name = imageTrack.title;
        config.yStep = parseFloat(_getWellProps().step);
        config.offsetY = parseFloat(_getWellProps().topDepth);
        config.width = Utils.inchToPixel(imageTrack.width);
        config.wiComponentService = wiComponentService;
        config.bgColor = imageTrack.background;

        console.log('image track config', config);

        let track = graph.createImageTrack(config, document.getElementById(self.plotAreaId));
        graph.rearrangeTracks(self);
        _tracks.push(track);
        _tracks.sort(function (track1, track2) {
            return track1.orderNum.localeCompare(track2.orderNum);
        });
        _setCurrentTrack(track);

        let depthRange = self.getDepthRangeFromSlidingBar();
        self.setDepthRangeForTrack(track, depthRange);

        _registerImageTrackCallback(track);
        _registerTrackHorizontalResizerDragCallback();
        _registerTrackDragCallback(track);
        wiComponentService.putComponent('vi-image-track-' + config.id, track);
        return track;
    }

    this.addZoneTrack = function (callback) {
        let trackOrder = getOrderKey();
        if (trackOrder) {
            const zoneTracks = self.getTracks().filter(track => track.type == 'zone-track');
            const defaultZoneTrackProp = {
                showTitle: true,
                title: "Zone Track " + (zoneTracks.length + 1),
                topJustification: "center",
                color: '#ffffff',
                width: Utils.inchToPixel(1),
                parameterSet: null
            }
            DialogUtils.zoneTrackPropertiesDialog(ModalService, self.logPlotCtrl, defaultZoneTrackProp, function (zoneTrackProperties) {
                let dataRequest = {
                    idPlot: self.logPlotCtrl.id,
                    title: zoneTrackProperties.title,
                    showTitle: zoneTrackProperties.isShowTitle,
                    topJustification: zoneTrackProperties.topJustification,
                    bottomJustification: zoneTrackProperties.bottomJustification,
                    color: zoneTrackProperties.color,
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

    this.pushZoneTrack = function (zoneTrack) {
        let config = angular.copy(zoneTrack);
        config.id = zoneTrack.idZoneTrack;
        config.name = zoneTrack.title;
        config.yStep = parseFloat(_getWellProps().step);
        config.offsetY = parseFloat(_getWellProps().topDepth);
        config.width = Utils.inchToPixel(zoneTrack.width);
        config.bgColor = zoneTrack.color;

        config.wiComponentService = wiComponentService;
        console.log(config);

        let track = graph.createZoneTrack(config, document.getElementById(self.plotAreaId));
        graph.rearrangeTracks(self);
        _tracks.push(track);
        _tracks.sort(function (track1, track2) {
            return track1.orderNum.localeCompare(track2.orderNum);
        });
        _setCurrentTrack(track);

        let depthRange = self.getDepthRangeFromSlidingBar();
        self.setDepthRangeForTrack(track, depthRange);

        _registerZoneTrackCallback(track);
        _registerTrackHorizontalResizerDragCallback();
        _registerTrackDragCallback(track);
        wiComponentService.putComponent('vi-zone-track-' + config.id, track);
        return track;
    }

    this.addObjectTrack = function () {
        let trackOrder = getOrderKey();
        if (trackOrder) {
            const objectTracks = self.getTracks().filter(track => track.type == 'object-track');
            const defaultObjectTrackProp = {
                showTitle: true,
                title: "Object Track " + (objectTracks.length + 1),
                topJustification: "center",
                width: Utils.inchToPixel(2.5),
            }
            DialogUtils.objectTrackPropertiesDialog(ModalService, self.logPlotCtrl, defaultObjectTrackProp, function (objectTrackProp) {
                let dataRequest = {
                    idPlot: self.logPlotCtrl.id,
                    title: objectTrackProp.title,
                    showTitle: objectTrackProp.showTitle,
                    topJustification: objectTrackProp.topJustification,
                    width: objectTrackProp.width,
                    orderNum: trackOrder
                };
                wiApiService.createObjectTrack(dataRequest, function (returnObjectTrack) {
                    console.log("returned object track: ", returnObjectTrack);
                    let viTrack = self.pushObjectTrack(returnObjectTrack);
                });
            })
        } else {
            console.error('Cannot add new Html Object Track');
        }
    }

    this.pushObjectTrack = function (trackConfig) {
        let config = angular.copy(trackConfig);
        config.id = trackConfig.idObjectTrack;
        config.name = trackConfig.title;
        config.yStep = parseFloat(_getWellProps().step);
        config.offsetY = parseFloat(_getWellProps().topDepth);
        config.width = Utils.inchToPixel(trackConfig.width);
        //config.wiComponentService = wiComponentService;
        console.log(config);

        let track = graph.createObjectTrack(config, document.getElementById(self.plotAreaId));
        graph.rearrangeTracks(self);
        _tracks.push(track);
        _tracks.sort(function (track1, track2) {
            return track1.orderNum.localeCompare(track2.orderNum);
        });
        _setCurrentTrack(track);

        let depthRange = self.getDepthRangeFromSlidingBar();
        self.setDepthRangeForTrack(track, depthRange);

        _registerObjectTrackCallback(track);
        _registerTrackHorizontalResizerDragCallback();
        _registerTrackDragCallback(track);
        wiComponentService.putComponent('vi-object-track-' + config.id, track);

        return track;
    }

    this.addCurveToTrack = function (track, data, config) {
        if (!track || !track.addCurve) return;
        let curve = track.addCurve(data, config);

        let depthRange = self.getDepthRangeFromSlidingBar();
        self.setDepthRangeForTrack(track, depthRange);
        track.updateScaleInfo({
            leftVal:config.minX,
            rightVal:config.maxX,
            scale: config.scale
        });
        track.updateAxis();
        track.plotCurve(curve);
        track.onCurveHeaderMouseDown(curve, function () {
            if (d3.event.button == 2) {
                _curveOnRightClick();
            }
        });
        curve.header.on('dblclick', function () {
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
        track.rearrangeHeaders();
        track.onZoneMouseDown(zone, function () {
            if (track.mode == 'SplitZone') {
                _splitZone(track, zone);
                track.setMode(null);
            }
            if (d3.event.button == 2) {
                _zoneOnRightClick();
            }
        });
        track.onZoneHeaderMouseDown(zone, function () {
            if (d3.event.button == 2) {
                _zoneOnRightClick();
            }
        });
        zone.on('dblclick', _zoneOnDoubleClick);
        zone.header.on('dblclick', _zoneOnDoubleClick);
        zone.onLineDragEnd(function () {
            let zones = track.adjustZonesOnZoneChange(zone);
            let updatedZones = zones[0];
            let deletedZones = zones[1];
            updatedZones.push(zone);
            // send api to add or delete zones
            for (let updatedZone of updatedZones) {
                updatedZone.idZone = updatedZone.id;
                wiApiService.editZone(updatedZone, function () {
                });
            }
            for (let deletedZone of deletedZones) {
                wiApiService.removeZone(deletedZone.id, function () {
                })
            }
            _plotZoneSet(track);
            Utils.refreshProjectState();
        })
        return zone;
    }

    this.addObjectToTrack = function (track, config) {
        let self = this;
        if (!track || !track.addObject) return;
        if (!config) {
            console.log('there are no configurations of object');
        }
        let object = track.addObject(config, wiComponentService, wiApiService);
        track.plotObject(object);
        //track.rearrangeHeaders();
        track.onObjectMouseDown(object, function () {
            _setCurrentTrack(track);
            if (d3.event.button == 2) {
                _objectOnRightClick();
            }
        });
        track.onObjectHeaderMouseDown(object, function () {
            _setCurrentTrack(track);
            let depthRange = object.getDepthRange();
            let rangeValue = depthRange[1] - depthRange[0];
            depthRange[0] -= rangeValue * 0.5;
            depthRange[1] += rangeValue * 0.5;

            self.setDepthRange(depthRange);
            self.adjustSlidingBarFromDepthRange(depthRange);
            if (d3.event.button == 2) {
                _objectOnRightClick();
            }
        });

        object.on('dblclick', _objectOnDoubleClick);
        object.header.on('dblclick', _objectOnDoubleClick);

        return object;
    }

    this.addImageZoneToTrack = function (track, config) {
        if (!track || !track.addImageZone) return;
        let imgzone = track.addImageZone(config, track);

        if (imgzone.idImageOfTrack) imgzone.header.attr('id', 'id' + imgzone.idImageOfTrack);

        track.plotImageZone(imgzone);
        track.rearrangeHeaders();
        track.onImageZoneMouseDown(imgzone, function() {
            _setCurrentTrack(track);
            if (d3.event.button == 2) {
                _imageZoneOnRightClick();
            }
        });
        track.onImageZoneHeaderMouseDown(imgzone, function() {
            _setCurrentTrack(track);
            let depthRange = imgzone.getDepthRange();
            let rangeValue = depthRange[1] - depthRange[0];
            depthRange[0] -= rangeValue * 0.5;
            depthRange[1] += rangeValue * 0.5;

            self.setDepthRange(depthRange);
            self.adjustSlidingBarFromDepthRange(depthRange);
            if (d3.event.button == 2) {
                _imageZoneOnRightClick();
            }
        });

        imgzone.on('dblclick', _imageZoneOnDoubleClick);
        imgzone.header.on('dblclick', _imageZoneOnDoubleClick);
        imgzone.onLineDragEnd(function () {
            let image = track.adjustImage(imgzone);
            image.idImageOfTrack = imgzone.idImageOfTrack;
            // send api to edit image
            wiApiService.editImage(image, function (imgProps) {
                if (imgProps) {
                    $timeout(function () {
                        imgzone.setProperties(imgProps);
                    });
                }
            });
            track.plotImageZone(imgzone);
            track.setMode(null);
            track.rearrangeHeaders();
        });
        return imgzone;
    }

    this.addMarker = function () {
        if (_currentTrack && _currentTrack.addMarker && _currentTrack.setMode) {
            _currentTrack.setMode('AddMarker');
        }
    }

    this.addAnnotation = function () {
        if (!_currentTrack.isLogTrack()) return;
        let [topDepth, bottomDepth] = self.getDepthRangeFromSlidingBar();
        let range = bottomDepth - topDepth;
        let top = (topDepth + bottomDepth) / 2;
        let bottom = top + (range / 10);
        let defaultAnn = {
            idTrack: _currentTrack.id,
            text: 'Type some text here',
            textStyle: {
                fontSize: '12px',
                fill: 'Black'
            },
            background: "Yellow",
            top: top,
            bottom: bottom,
            left: 0,
            width: 100,
            vAlign: 'Center',
            hAlign: 'Center',
            justification: 'Center',
            fitBounds: true,
            deviceSpace: true,
            shadow: false,
            vertical: false
        }
        wiApiService.createAnnotation(defaultAnn, function (annotation) {
            let viAnno = self.addAnnotationToTrack(_currentTrack, annotation);
            DialogUtils.annotationPropertiesDialog(ModalService, annotation, function (annotationConfig) {
                wiApiService.editAnnotation(annotationConfig, function (annotation) {
                    viAnno.setProperties(annotation);
                    viAnno.doPlot(true);
                })
            })
        })
    }

    this.addAnnotationToTrack = function (track, config) {
        if (!track || !track.addAnnotation) return;
        let ann = track.addAnnotation(config);
        track.plotDrawing(ann);
        track.onDrawingMouseDown(ann, function () {
            if (d3.event.button == 2) {
                _annotationOnRightClick();
            }
        });
        ann.on('dblclick', _annotationOnDoubleClick);
        ann.onRectDragEnd(function () {
            // Send api to update annotation
            let annoConfig = ann.getProperties();
            delete annoConfig.textStyle;
            wiApiService.editAnnotation(annoConfig, function () {
            });
        });
        ann.onLineDragEnd(function () {
            // Send api to update annotation
            let annoConfig = ann.getProperties();
            delete annoConfig.textStyle;
            wiApiService.editAnnotation(annoConfig, function () {
            });
        })
        return ann;
    }

    this.addMarkerToTrack = function (track, config) {
        if (!track || !track.addMarker) return;
        let marker = track.addMarker(config);
        track.plotMarker(marker);
        track.onMarkerMouseDown(marker, function () {
            if (d3.event.button == 2) {
                _markerOnRightClick();
            }
        });
        marker.on('dblclick', function () {
            _markerOnDoubleClick(marker);
        });
        marker.onLineDragEnd(function () {
            // send api to update this marker
            wiApiService.editMarker(marker.getProperties(), function () {
            });
        });
        return marker;
    }

    this.drawImageZone = function (imgzone, props, isNewDraw) {
        if (!imgzone) return;
        let imageConfig = {
            fill: props.fill,
            imageUrl: props.imageUrl,
            smartDisplay: props.smartDisplay
        };
        imgzone.drawImage(imageConfig, isNewDraw);
    }

    this.addImageToTrack = function (track, config) {
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

    this.addPairShadingToTrack = function (track, lCurve, rCurve, config) {
        if (!track || !track.addShading) return;
        let shading = track.addShading(lCurve, rCurve, null, config);
        track.plotShading(shading);
        _registerShadingHeaderMouseDownCallback(track, shading);
        return shading;
    }

    this.removeCurrentCurve = function () {
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

    this.removeMarkerFromTrack = function (track, marker) {
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

        let maxZoomFactor = d3.max(_tracks, function (track) {
            return track.zoomFactor;
        });

        if (_tracks.length && maxZoomFactor != _tracks[0]._maxZoomFactor && !_tracks[0]._shouldRescaleWindowY) {
            this.processZoomFactor();
            this.plotAll();
        }
    }

    this.plot = function (track) {
        if (track && track.doPlot) track.doPlot(track == _currentTrack);
    };

    this.plotAll = function () {
        _tracks.forEach(function (track) {
            track.doPlot(track == _currentTrack);
        });
    };

    this.updateScale = function () {
        let trackPlot = $(`wi-logplot[name=${self.wiLogplotCtrl.name}] .vi-track-plot-container .vi-track-drawing`)[0];
        if (!trackPlot) return;
        let trackPlotHeight = trackPlot.getAttribute('height');
        let dpCm = Utils.getDpcm();
        let heightCm = trackPlotHeight / dpCm;
        let depthRange = this.getDepthRange();
        let scale = (depthRange[1] - depthRange[0]) * 100 / heightCm;
        this.scale = scale.toFixed(0);
        _tracks.filter(track => track.isDepthTrack()).forEach(function (depthTrack) {
            depthTrack.updateScale(self.scale);
        })
    }

    this.setDepthRange = function (depthRange, notPlot) {
        _depthRange = depthRange;
        _tracks.forEach(function (track) {
            track.minY = depthRange[0];
            track.maxY = depthRange[1];
        });

        if (!notPlot)
            self.plotAll();
        this.updateScale();
    };

    this.setDepthRangeForTrack = function (track, depthRange) {
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

    this.getDepthRangeFromSlidingBar = function () {
        let slidingBar = wiComponentService.getSlidingBarForD3Area(self.name);
        let maxDepth = self.getMaxDepth();
        let minDepth = self.getMinDepth();
        let low = minDepth + slidingBar.slidingBarState.top * (maxDepth - minDepth) / 100;
        let high = low + (slidingBar.slidingBarState.range) * (maxDepth - minDepth) / 100;
        return [low, high];
    }

    this.adjustSlidingBarFromDepthRange = function (vY) {
        let slidingBar = wiComponentService.getSlidingBarForD3Area(self.name);
        let maxDepth = self.getMaxDepth();
        let minDepth = self.getMinDepth();

        let top = (vY[0] - minDepth) * 100 / (maxDepth - minDepth);
        let range = (vY[1] - minDepth) * 100 / (maxDepth - minDepth) - top;
        slidingBar.resetView();
        slidingBar.updateSlidingHandlerByPercent(top, range);
    }

    this.getMaxDepth = function () {
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

    this.getMinDepth = function () {
        let wellProps = _getWellProps();
        return parseFloat(wellProps.topDepth) || 0;
    }

    this.processZoomFactor = function () {
        let maxZoomFactor = d3.max(_tracks, function (track) {
            return track.zoomFactor;
        });

        let topDepth = parseFloat(_getWellProps().topDepth);
        let bottomDepth = parseFloat(_getWellProps().bottomDepth);

        let shouldRescaleWindowY = !(_depthRange[0] == topDepth && _depthRange[1] == bottomDepth);
        for (let track of _tracks) {
            track._maxZoomFactor = maxZoomFactor;
            track._shouldRescaleWindowY = shouldRescaleWindowY;
        }
    }

    this.scroll = function () {
        /*
        let low = _depthRange[0]
        let high = _depthRange[1];
        let maxDepth = self.getMaxDepth();
        let minDepth = self.getMinDepth();
        let wd = _currentTrack.getWindowY();
        let yStep = parseFloat(_getWellProps().step) || 1;

        let num = Math.round((wd[1] - wd[0]) / yStep / 10);
        if (num < 1) num = 1;

        let dy = d3.event.deltaY < 0 ? -yStep*num : yStep*num;

        if (dy + low < minDepth) {
            dy = minDepth - low;
        }
        else if (dy + high > maxDepth) {
            dy = maxDepth - high;
        }

        low += dy;
        high += dy;
        self.setDepthRange([low, high]);
        self.adjustSlidingBarFromDepthRange([low, high]);
        */

    /*
        let slidingBar = wiComponentService.getSlidingBarForD3Area(self.name);
        let sign = (d3.event.deltaY<0)?"":"-";
        //let sign = (d3.event.deltaY<0)?"-":"";
        let absDelta = Math.abs(d3.event.deltaY);
        let value = (absDelta > 4) ? (absDelta / 3) : absDelta;
        slidingBar.scroll(parseInt(sign + value));
    */
        let slidingBar = wiComponentService.getSlidingBarForD3Area(self.name);
        //let sign = (d3.event.deltaY<0)?"":"-";
        let value = (d3.event.deltaY<0)? 1 : -1;
        slidingBar.scroll(value);
        _drawTooltip(_currentTrack);
    }

    this.zoom = function (zoomOut) {
        const MIN_STEPS_OF_VIEW = 20; // Dupplicate code . See wi-slidingbar.js, getMinRange() function
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
        if (low + MIN_STEPS_OF_VIEW * yStep >= high) return;

        low = low < minDepth ? minDepth : low;
        high = high > maxDepth ? maxDepth : high;

        self.setDepthRange([low, high], true);
        self.processZoomFactor();
        self.plotAll();
        self.adjustSlidingBarFromDepthRange([low, high]);
        _drawTooltip(_currentTrack);
    }

    this.updateTrack = function (viTrack) {
        if (viTrack.isLogTrack()) {
            self.updateLogTrack(viTrack);
            return;
        }
        if (viTrack.isDepthTrack()) {
            self.updateDepthTrack(viTrack);
            return;
        }
        if (viTrack.isZoneTrack()) {
            self.updateZoneTrack(viTrack);
            return;
        }
        if (viTrack.isImageTrack()) {
            self.updateImageTrack(viTrack);
            return;
        }
        if (viTrack.isObjectTrack()) {
            self.updateObjectTrack(viTrack);
            return;
        }
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
                    track.rearrangeHeaders();
                    _plotZoneSet(track);
                    Utils.refreshProjectState();
                })
            })
        })
    }

    function _drawTooltip(track) {
        if (!_tooltip) return;

        let plotMouse = d3.mouse(track.plotContainer.node());
        let x = plotMouse[0];
        let y = plotMouse[1];
        let plotDim = track.plotContainer.node().getBoundingClientRect();

        if (x < 0 || x > plotDim.width || y < 0 || y > plotDim.height) return;

        let depth = track.getTransformY().invert(plotMouse[1]);

        _tracks.forEach(function(tr) {
            if (tr.drawTooltipLines) tr.drawTooltipLines(depth);
            if (tr.drawTooltipText) tr.drawTooltipText(depth, tr == track);
        })
        // graph.createTooltipLines(svg);
    }

    function _removeTooltip(track) {
        _tracks.forEach(function(tr) {
            if (tr.removeTooltipLines) tr.removeTooltipLines();
            if (tr.removeTooltipText) tr.removeTooltipText();
        })

        // graph.removeTooltipLines(svg);
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
                marker.setProperties({idMarker: returnMarker.idMarker});
                track.setCurrentDrawing(marker);
                track.plotDrawing(marker);
                track.setMode(null);
            });
            return;
        }
        if (d3.event.currentDrawing && d3.event.button == 2) {
            if (d3.event.currentDrawing.isCurve()) {
                _curveOnRightClick();
            } else if (d3.event.currentDrawing.isShading()) {
                _shadingOnRightClick();
            } else if (d3.event.currentDrawing.isAnnotation()) {
                _annotationOnRightClick();
            } else if (d3.event.currentDrawing.isMarker()) {
                _markerOnRightClick();
            }
        }
    }

    function _onPlotDoubleClickCallback(track) {
        if (d3.event.currentDrawing) {
            if (d3.event.currentDrawing.isCurve()) {
                _curveOnDoubleClick();
            } else if (d3.event.currentDrawing.isShading()) {
                _shadingOnDoubleClick();
            } else if (d3.event.currentDrawing.isAnnotation()) {
                _annotationOnDoubleClick();
            } else if (d3.event.currentDrawing.isMarker()) {
                _markerOnDoubleClick();
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
        // track.onPlotMouseWheel(function () {
        //     _onPlotMouseWheelCallback();
        // });
        track.onPlotMouseDown(function () {
            _onPlotMouseDownCallback(track);
        });
        track.onHeaderMouseDown(function () {
            _onHeaderMouseDownCallback(track);
        });
        track.onPlotDoubleClick(function () {
            _onPlotDoubleClickCallback(track);
        });
        track.plotContainer.on('mousemove', function () {
            _drawTooltip(track);
        });
        track.on('keydown', function () {
            _onTrackKeyPressCallback(track);
        });
        track.onCurveDrag(function (desTrack) {
            let currentCurve = track.getCurrentCurve();
            let curve = currentCurve.getProperties();
            curve.idTrack = desTrack.id;
            wiApiService.editLine(curve, function (res) {
                self.updateTrack(track);
                self.updateTrack(desTrack);
            });
        });
        _registerTrackCallback(track);
    }

    function _plotZoneTrack(sourceViZoneTrack, viZoneTrack) {
        if (!viZoneTrack) return;
        viZoneTrack.removeAllZones();
        sourceViZoneTrack.getZones().forEach(function (sourceZone) {
            const zoneConfig = angular.copy(sourceZone);
            zoneConfig.idZoneTrack = viZoneTrack.id;
            let wiD3 = wiComponentService.getComponent('logplot' + viZoneTrack.idPlot).getwiD3Ctrl();
            wiD3.addZoneToTrack(viZoneTrack, zoneConfig);
        })
    }

    function _plotZoneSet(sourceZoneTrack) {
        let layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
        // plot this logplot
        let viZoneTracks = self.getTracks().filter(track => (track.isZoneTrack() && track.id != sourceZoneTrack.id));
        viZoneTracks.forEach(function (viZoneTrack) {
            if (viZoneTrack.idZoneSet != sourceZoneTrack.idZoneSet) return;
            _plotZoneTrack(sourceZoneTrack, viZoneTrack);
        })
        // plot others logplots
        let logplotModel = self.wiLogplotCtrl.getLogplotModel();
        let well = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED).wells.find(well => well.idWell == logplotModel.properties.idWell);
        well.plots.forEach(function (aLogplot) {
            if (aLogplot.idPlot != sourceZoneTrack.idPlot) {
                if (!layoutManager.getItemById('logplot' + aLogplot.idPlot)) return;
                wiApiService.getLogplot(aLogplot.idPlot, function (logplot) {
                    logplot.zone_tracks.forEach(function (zoneTrack) {
                        if (zoneTrack.idZoneSet != sourceZoneTrack.idZoneSet) return;
                        let viZoneTrack = wiComponentService.getComponent('vi-zone-track-' + zoneTrack.idZoneTrack);
                        if (!viZoneTrack) return;
                        _plotZoneTrack(sourceZoneTrack, viZoneTrack);
                    });
                })
            }
        });
    }

    function _registerObjectTrackCallback(track) {
        let object;
        /*
        track.plotContainer.call(d3.drag()
            .on('start', function () {
                track.setCurrentDrawing(null);
                if (track.mode != 'AddObject') return;
                track.startY = d3.mouse(track.plotContainer.node())[1];
            })
            .on('drag', function (event, ui) {
                if (track.mode != 'AddObject') return;
                let y1 = track.startY;
                let y2 = d3.mouse(track.plotContainer.node())[1];

                let minY = d3.min([y1, y2]);
                let maxY = d3.max([y1, y2]);

                object = track.getCurrentDrawing();

                if (!object) {
                    object = self.addObjectToTrack(track, {
                        minY: track.minY,
                        maxY: track.maxY,
                    });
                    track.setCurrentDrawing(object);
                }
                if (!object) {
                    track.setMode(null);
                    return;
                }
                var transformY = object.getTransformY();
                let startDepth = transformY.invert(minY);
                let endDepth = transformY.invert(maxY);
                object.setProperties({
                    startDepth: startDepth,
                    endDepth: endDepth
                });
                track.plotObject(object);
                object.showTooltip(event, ui);
            })
            .on('end', function () {
                if (track.mode != 'AddObject') return;
                if (object && track.getCurrentQuest && track.getCurrentQuest() && track.setCurrentQuest) {
                    let currQuest = track.getCurrentQuest();
                    track.setCurrentQuest(null);
                    object.handleQuest(currQuest, _getWellProps());
                }
                let dataRequest = object.exportsProperties();

                wiApiService.createObjectOfObjectTrack(dataRequest, function (returnedObject) {
                    console.log('object created Object: ', returnedObject);
                    object.setProperties(returnedObject);
                    object.refreshObjectOfTrack(null, wiApiService, function() {
                        Utils.refreshProjectState();
                        object.hideTooltip();
                    })
                });

                track.setMode(null);
            })
        );
        */
        track.on('keydown', function () {
            _onTrackKeyPressCallback(track);
        });
        // track.onPlotMouseWheel(function () {
        //     _onPlotMouseWheelCallback();
        // });
        _registerTrackCallback(track);
    }

    function _registerZoneTrackCallback(track) {
        let zone;
        track.plotContainer.call(d3.drag()
            .on('start', function () {
                track.setCurrentDrawing(null);
                if (track.mode != 'AddZone') return;
                track.startY = d3.mouse(track.plotContainer.node())[1];
            })
            .on('drag', function () {
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
            .on('end', function () {
                if (track.mode != 'AddZone') return;
                // Send api to create new zone on server
                if (!track.idZoneSet) {
                    track.idZoneSet = _currentTrack.isZoneTrack() ? _currentTrack.idZoneSet : undefined;
                    if (!track.idZoneSet) return;
                }
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
                    let modifiedZones = track.adjustZonesOnZoneChange(zone);
                    let updatedZones = modifiedZones[0];
                    let deletedZones = modifiedZones[1];
                    // Send api to update or delete zones
                    if (updatedZones && updatedZones.length) {
                        updatedZones.forEach(function (updatingZone) {
                            updatingZone.idZone = updatingZone.id;
                            wiApiService.editZone(updatingZone, function () {
                            });
                        });
                    }
                    if (deletedZones && deletedZones.length) {
                        deletedZones.forEach(function (deletingZone) {
                            wiApiService.removeZone(deletingZone.id, function () {
                            });
                        });
                    }
                    _plotZoneSet(track);
                    Utils.refreshProjectState();
                    track.setMode(null);
                    track.rearrangeHeaders();
                })
            })
        );
        track.on('keydown', function () {
            _onTrackKeyPressCallback(track);
        });
        // track.onPlotMouseWheel(function () {
        //     _onPlotMouseWheelCallback();
        // });
        _registerTrackCallback(track);
    }

    function _registerImageTrackCallback(track) {
        let imgzone;
        track.plotContainer.call(d3.drag()
            .on('start', function () {
                track.setCurrentDrawing(null);
                if (track.mode != 'AddImageZone') return;
                track.startY = d3.mouse(track.plotContainer.node())[1];
            })
            .on('drag', function () {
                if (track.mode != 'AddImageZone') return;
                let y1 = d3.mouse(track.plotContainer.node())[1];
                let y2 = track.startY;
                let minY = d3.min([y1, y2]);
                let maxY = d3.max([y1, y2]);
                imgzone = track.getCurrentImageZone();

                if (!imgzone) {
                    imgzone = self.addImageZoneToTrack(track, {
                        minY: track.minY,
                        maxY: track.maxY
                    });
                    track.setCurrentDrawing(imgzone);
                }
                if (!imgzone) {
                    track.setMode(null);
                    return;
                }
                let transformY = imgzone.getTransformY();
                let topDepth = transformY.invert(minY);
                let bottomDepth = transformY.invert(maxY);
                imgzone.setProperties({
                    topDepth: topDepth,
                    bottomDepth: bottomDepth,
                    fill: 'white'
                });
                track.plotImageZone(imgzone);
            })
            .on('end', function () {
                if (track.mode != 'AddImageZone') return;

                let _currentImage = imgzone.getProperties();
                _currentImage.isNewDraw = true;

                DialogUtils.imageZonePropertiesDialog(ModalService, _currentImage, function (props) {
                    if (!props) {
                        track.removeImage(imgzone);
                        return;
                    } else if (props === true) {
                        return;
                    }
                    let isNewDraw = props.isNewDraw;
                    props.idImageTrack = track.id;
                    delete props.isNewDraw;
                    if (isNewDraw) {
                        wiApiService.createImage(props, function (imgProps) {
                            if (imgProps) {
                                $timeout(function () {
                                    imgzone.setProperties(imgProps);
                                    imgzone.header.attr('id', 'id' + imgzone.idImageOfTrack);
                                    if (!imgzone.showName) imgzone.header.select('div').remove();
                                    self.drawImageZone(imgzone, imgProps, isNewDraw);
                                    track.plotImageZone(imgzone);
                                    track.rearrangeHeaders();
                                    _currentImage = imgzone.getProperties();
                                });
                            }
                        });
                    } else {
                        props.idImageOfTrack = _currentImage.idImageOfTrack;
                        wiApiService.editImage(props, function (imgProps) {
                            if (imgProps) {
                                $timeout(function () {
                                    imgzone.setProperties(imgProps);
                                    if (!imgzone.showName) imgzone.header.select('div').remove();
                                    else {
                                        imgzone.header.select('div').remove();
                                        delete imgzone.header;
                                        imgzone.header = track.addImageZoneHeader(imgzone, false);
                                    }
                                    self.drawImageZone(imgzone, imgProps, isNewDraw);
                                    track.onImageZoneHeaderMouseDown(imgzone, function() {
                                        _setCurrentTrack(track);
                                        let depthRange = imgzone.getDepthRange();
                                        let rangeValue = depthRange[1] - depthRange[0];
                                        depthRange[0] -= rangeValue * 0.5;
                                        depthRange[1] += rangeValue * 0.5;

                                        self.setDepthRange(depthRange);
                                        self.adjustSlidingBarFromDepthRange(depthRange);
                                        if (d3.event.button == 2) {
                                            _imageZoneOnRightClick();
                                        }
                                    });
                                    imgzone.doPlot();
                                    track.plotImageZone(imgzone);
                                    track.rearrangeHeaders();
                                    _currentImage = imgzone.getProperties();
                                });
                            }
                        });
                    }
                });
                track.setMode(null);
            })
        );
        track.on('keydown', function () {
            _onTrackKeyPressCallback(track);
        });
        // track.onPlotMouseWheel(function () {
        //     _onPlotMouseWheelCallback();
        // });
        _registerTrackCallback(track);
    }

    function _registerTrackCallback(track) {
        track.on('focus', function () {
            _setCurrentTrack(track);
        });
        track.on('mousedown', function () {
            if (d3.event.button == 2) _trackOnRightClick(track);
        })
        track.on('dblclick', function () {
            openTrackPropertiesDialog();
        });
        track.onVerticalResizerDrag(function () {
            if (track.isLogTrack()) {
                wiApiService.editTrack({idTrack: track.id, width: Utils.pixelToInch(track.width)}, function () {
                })
            } else if (track.isDepthTrack()) {
                wiApiService.editDepthTrack({
                    idDepthAxis: track.id,
                    width: Utils.pixelToInch(track.width)
                }, function () {
                })
            } else if (track.isZoneTrack()) {
                wiApiService.editZoneTrack({idZoneTrack: track.id, width: Utils.pixelToInch(track.width)}, function () {
                })
            } else if (track.isImageTrack()) {
                wiApiService.editImageTrack({
                    idImageTrack: track.id,
                    width: Utils.pixelToInch(track.width)
                }, function () {
                })
            } else if (track.isObjectTrack()) {
                wiApiService.editObjectTrack({
                    idObjectTrack: track.id,
                    width: Utils.pixelToInch(track.width)
                }, function () {
                })
            }
        });
    }

    function _registerShadingHeaderMouseDownCallback(track, shading) {
        track.setCurrentDrawing(shading);
        track.onShadingHeaderMouseDown(shading, function () {
            if (d3.event.button == 2) {
                _shadingOnRightClick();
            }
        });
        shading.header.on('dblclick', function () {
            // Mousedown already set the shading to be current shading
            _shadingOnDoubleClick();
        });
    }

    function _registerTrackHorizontalResizerDragCallback() {
        _tracks.forEach(function (track) {
            track.onHorizontalResizerDrag(function () {
                _tracks.forEach(function (t) {
                    if (track == t) return;
                    t.horizontalResizerDragCallback();
                })
                self.updateScale();
            });
        })
    }

    function orderTrack(viTrack, orderNum) {
        viTrack.orderNum = orderNum;
        viTrack.updateOrderNum();
        _tracks.sort(function (track1, track2) {
            return track1.orderNum.localeCompare(track2.orderNum);
        });
        graph.rearrangeTracks(self);
    }

    function editOrderNum(viTrack, orderNum) {
        return new Promise((resolve, reject) => {
            if (viTrack.isLogTrack()) {
                wiApiService.editTrack({idTrack: viTrack.id, orderNum: orderNum}, function () {
                    resolve();
                })
            } else if (viTrack.isDepthTrack()) {
                wiApiService.editDepthTrack({idDepthAxis: viTrack.id, orderNum: orderNum}, function () {
                    resolve();
                })
            } else if (viTrack.isZoneTrack()) {
                wiApiService.editZoneTrack({idZoneTrack: viTrack.id, orderNum: orderNum}, function () {
                    resolve();
                })
            } else if (viTrack.isImageTrack()) {
                wiApiService.editImageTrack({idImageTrack: viTrack.id, orderNum: orderNum}, function () {
                    resolve();
                })
            } else if (viTrack.isObjectTrack()) {
                wiApiService.editObjectTrack({idObjectTrack: viTrack.id, orderNum: orderNum}, function () {
                    resolve();
                })
            }
        }).then(function () {
            viTrack.orderNum = orderNum;
            viTrack.updateOrderNum();
            _tracks.sort(function (track1, track2) {
                return track1.orderNum.localeCompare(track2.orderNum);
            });
            graph.rearrangeTracks(self);
        })
    }

    function reindexAllTracks() {
        let promises = [];
        let backupTracks = angular.copy(_tracks);
        for (var i = 0; i < _tracks.length; i++) {
            let viTrack = _tracks[i];
            let orderNum;
            if (i == 0) orderNum = 'm';
            else orderNum = String.fromCharCode(_tracks[i - 1].orderNum.charCodeAt(0) + 1);
            viTrack.orderNum = orderNum;
            promises.push(new Promise((resolve, reject) => {
                if (viTrack.isLogTrack()) {
                    wiApiService.editTrack({idTrack: viTrack.id, orderNum: orderNum}, function () {
                        resolve();
                    })
                } else if (viTrack.isDepthTrack()) {
                    wiApiService.editDepthTrack({idDepthAxis: viTrack.id, orderNum: orderNum}, function () {
                        resolve();
                    })
                } else if (viTrack.isZoneTrack()) {
                    wiApiService.editZoneTrack({idZoneTrack: viTrack.id, orderNum: orderNum}, function () {
                        resolve();
                    })
                } else if (viTrack.isImageTrack()) {
                    wiApiService.editImageTrack({idImageTrack: viTrack.id, orderNum: orderNum}, function () {
                        resolve();
                    })
                } else if (viTrack.isObjectTrack()) {
                    wiApiService.editObjectTrack({idObjectTrack: viTrack.id, orderNum: orderNum}, function () {
                        resolve();
                    })
                }
            }).then(function () {
                viTrack.updateOrderNum();
            }));
        }
        Promise.all(promises)
            .then(function () {
                _tracks.sort(function (track1, track2) {
                    return track1.orderNum.localeCompare(track2.orderNum);
                });
                graph.rearrangeTracks(self);
                console.log(_tracks.map(t => t.orderNum));
            }).catch(function (err) {
            if (err) {
                _tracks = backupTracks;
            }
        });
    }

    function _registerTrackDragCallback(viTrack) {
        let originalOrderNum = viTrack.orderNum;
        viTrack.onTrackDrag(
            function (desTrack) {
                let orderNum = getOrderKey(desTrack);
                if (viTrack.orderNum > desTrack.orderNum) {
                    let desTrackIndex = _tracks.findIndex(track => track == desTrack);
                    if (desTrackIndex == 0) {
                        orderNum = String.fromCharCode(_tracks[0].orderNum.charCodeAt(0) - 1);
                    } else {
                        desTrack = _tracks[desTrackIndex - 1];
                        orderNum = getOrderKey(desTrack);
                    }
                }
                editOrderNum(viTrack, orderNum).then(function () {
                    console.log(_tracks.map(t => t.orderNum));
                    if (orderNum.length > 50 || _tracks[0].orderNum < 'a' || _tracks[_tracks.length - 1].orderNum > 'z') {
                        reindexAllTracks();
                    }
                }).catch(function (err) {
                    console.log(err);
                    orderTrack(viTrack, originalOrderNum);
                })
            });
    }

    function _onPlotMouseWheelCallback(track) {
        if (!_tracks || !_tracks.length) return;
        let mouse = d3.mouse(_tracks[0].plotContainer.node());
        if (mouse[1] < 0) return;

        if (d3.event.ctrlKey) {
            self.zoom(d3.event.deltaY < 0);
            d3.event.preventDefault();
            d3.event.stopPropagation();
        }
        else
            self.scroll();
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
                    wiApiService.removeLine(idLine, function (res) {
                        track.removeCurve(curve);
                        if (Array.isArray(res.shadings) && res.shadings.length) {
                            res.shadings.forEach(function(s) {
                                let shading = utils.getVisualizeShading(track, s.idShading);
                                track.removeDrawing(shading);
                            });
                        }
                    });
                }
                else if (drawing.isShading()) {
                    wiApiService.removeShading(drawing.id, function() {
                        track.removeDrawing(drawing);
                    });
                }
                else if (drawing.isZone()) {
                    // Send api before deleting
                    wiApiService.removeZone(drawing.id, function () {
                        track.removeDrawing(drawing);
                        _plotZoneSet(track);
                        Utils.refreshProjectState();
                    })
                }
                else if (drawing.isAnnotation()) {
                    // Send api before deleting
                    wiApiService.removeAnnotation(drawing.idAnnotation, function () {
                        track.removeDrawing(drawing);
                    })
                }
                else if (drawing.isImageZone()) {
                    // Send api before deleting
                    wiApiService.removeImage(drawing.idImageOfTrack, function () {
                        track.removeDrawing(drawing);
                    })
                }
                else if (drawing.isObject()) {
                    // Send api before deleting
                    removeAnObjectOfObjectTrack();
                }

                return;
            case 'Escape':
                // Bug
                if (track && track.setMode) track.setMode(null);
                return;
        }
    }

    function _annotationOnDoubleClick() {
        annotationProperties();
        d3.event.stopPropagation();
    }

    function _markerOnDoubleClick() {
        markerProperties();
        d3.event.stopPropagation();
    }

    function _zoneOnDoubleClick() {
        zoneProperties();
        // Prevent track properties dialog from opening
        d3.event.stopPropagation();
    }

    function _imageZoneOnDoubleClick() {
        imageProperties();
        // Prevent track properties dialog from opening
        d3.event.stopPropagation();
    }

    function _objectOnDoubleClick() {
        objectProperties();
        d3.event.stopPropagation();
    }

    function _shadingOnDoubleClick() {
        console.log('Shading double clicked');
        let currentShading = _currentTrack.getCurrentShading();
        let shadingOptions = currentShading.getProperties();
        let well = Utils.findWellByLogplot(self.wiLogplotCtrl.id) || {};
        this.shadingList = _currentTrack.getShadings();

        console.log("Shading Properties", currentShading);
        DialogUtils.shadingAttributeDialog(ModalService, wiApiService, function(options) {
            let request = angular.copy(options);
            if(options.idLeftLine == -3) {
                options.type = 'custom';
            };
            if(options.idLeftLine == -2) {
                options.type = 'right';
            };
            if(options.idLeftLine == -1) {
                options.type = 'left';
            };
            if(options.idLeftLine > 0) {
                options.type = 'pair';
            }
            delete request.leftLine;
            delete request.rightLine;

            if (options.idLeftLine < 0) {
                request.idLeftLine = null;
                options.leftLine = null;
                options.idLeftLine = null;
            }
            else {
                    request.leftFixedValue = null;
                    request.idLeftLine = parseInt(options.idLeftLine);
                }
            console.log("update shadingAttributeDialog", options, request);
            wiApiService.editShading(request, function (shading) {
                Utils.getPalettes(function(paletteList){
                    wiApiService.dataCurve(options.idControlCurve, function (curveData) {
                        options.controlCurve = graph.buildCurve({ idCurve: options.idControlCurve }, curveData, well.properties);
                        if(!options.isNegPosFill) {
                            if(options.fill.varShading && options.fill.varShading.palName)
                                options.fill.varShading.palette = paletteList[options.fill.varShading.palName];
                        }
                        else {
                            if(options.positiveFill.varShading && options.positiveFill.varShading.palName)
                                options.positiveFill.varShading.palette = paletteList[options.positiveFill.varShading.palName];
                            if(options.negativeFill.varShading && options.negativeFill.varShading.palName)
                                options.negativeFill.varShading.palette = paletteList[options.negativeFill.varShading.palName];
                        }
                        currentShading.setProperties(options);
                        $timeout(function() {
                            _currentTrack.plotAllDrawings();
                        });

                    });
                });
            });
        }, shadingOptions, _currentTrack, self.wiLogplotCtrl);
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
            self.wiLogplotCtrl,
            function() {
                _currentTrack.updateScaleInfo({
                    leftVal:currentCurve.minX,
                    rightVal:currentCurve.maxX,
                    scale: currentCurve.scale
                });
                _currentTrack.updateAxis();
            }
        );

        // Prevent track properties dialog from opening
        d3.event.stopPropagation();
    }

    function zoneProperties() {
        let zone = _currentTrack.getCurrentZone();
        DialogUtils.zonePropertiesDialog(ModalService, zone.getProperties(), function (props) {
            wiApiService.editZone(props, function () {
                zone.setProperties(props);
                _plotZoneSet(_currentTrack);
                zone.doPlot();
                Utils.refreshProjectState();
            })
        })
    }

    function imageProperties() {
        let track = _currentTrack;
        let imgzone = track.getCurrentImageZone();
        imgzone.setProperties({
            done: true
        });
        let _currentImage = imgzone.getProperties();
        DialogUtils.imageZonePropertiesDialog(ModalService, _currentImage, function (props) {
            if (!props || props === true) return;
            wiApiService.editImage(props, function (imgProps) {
                if (imgProps) {
                    $timeout(function () {
                        imgzone.setProperties(imgProps);
                        imgzone.header.select('div').remove();
                        delete imgzone.header;
                        imgzone.header = track.addImageZoneHeader(imgzone, false);
                		self.drawImageZone(imgzone, imgProps, false);
                        imgzone.doPlot();
                        track.onImageZoneHeaderMouseDown(imgzone, function() {
                            _setCurrentTrack(track);
                            let depthRange = imgzone.getDepthRange();
                            let rangeValue = depthRange[1] - depthRange[0];
                            depthRange[0] -= rangeValue * 0.5;
                            depthRange[1] += rangeValue * 0.5;

                            self.setDepthRange(depthRange);
                            self.adjustSlidingBarFromDepthRange(depthRange);
                            if (d3.event.button == 2) {
                                _imageZoneOnRightClick();
                            }
                        });
                        track.plotImageZone(imgzone);
                        track.rearrangeHeaders();
                    });
                    track.setMode(null);
                }
            });
        });
    }

    function showImage() {
        let track = _currentTrack;
        let imgzone = track.getCurrentImageZone();
        DialogUtils.showImageDialog(ModalService, imgzone.getProperties(), function () {
        });
    }

    function objectProperties() {
        let object = _currentTrack.getCurrentDrawing();

        if (!object) {
            return;
        }
        // TODO
    }

    function markerProperties(marker) {
        if (!marker) {
            marker = _currentTrack.getCurrentMarker();
            console.log(_currentTrack.getCurrentMarker());
        }
        DialogUtils.markerPropertiesDialog(ModalService, marker.getProperties(), function (props) {
            wiApiService.editMarker(props, function () {
                marker.setProperties(props);
                marker.doPlot(true);
            })
        })
    }

    function annotationProperties(anno) {
        if (!anno) anno = _currentTrack.getCurrentDrawing();
        console.log(anno);
        DialogUtils.annotationPropertiesDialog(ModalService, anno.getProperties(), function (annotationConfig) {
            annotationConfig.idTrack = _currentTrack.id;
            wiApiService.editAnnotation(annotationConfig, function () {
                anno.setProperties(annotationConfig);
                anno.doPlot(true);
            })
        })
    }

    function _annotationOnRightClick() {
        let anno = _currentTrack.getCurrentDrawing();
        self.setContextMenu([
            {
                name: "AnnotationProperties",
                label: "Annotation Properties",
                icon: "annotation-16x16-edit",
                handler: function () {
                    annotationProperties(anno);
                }
            }, {
                name: "RemoveAnnotation",
                label: "Remove Annotation",
                icon: "annotation-delete-16x16",
                handler: function () {
                    wiApiService.removeAnnotation(anno.idAnnotation, function () {
                        _currentTrack.removeDrawing(anno);
                    })
                }
            }
        ]);
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
        console.log(zone);
        self.setContextMenu([
            {
                name: "AutoZoneNamed",
                label: "Auto Zone Named",
                handler: function () {
                    _currentTrack.autoName().forEach(function (zone) {
                        wiApiService.editZone(zone.getProperties(), function () {
                            _plotZoneSet(_currentTrack);
                            Utils.refreshProjectState();
                        });
                    });
                    _currentTrack.doPlot(true);
                }
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
                        _plotZoneSet(_currentTrack);
                        Utils.refreshProjectState();
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

    this.removeAnObjectOfObjectTrack = function (track, object) {
        _currentTrack = track;
        _currentTrack.setCurrentDrawing(object);
        removeAnObjectOfObjectTrack();
    }

    function removeAnObjectOfObjectTrack() {
        if(!_currentTrack.isObjectTrack() || (_currentTrack.isObjectTrack() && !_currentTrack.getCurrentDrawing)) {
            console.log('not an object track');
            return;
        }
        let object = _currentTrack.getCurrentDrawing();
        console.log("Removing: ", object);
        wiApiService.removeObjectOfObjectTrack(object.id, function () {
            switch (object.currentDraw) {
                case "Crossplot":
                    wiApiService.removeCrossplot(object.idCrossplot, function () {
                        console.log("crossplot removed");
                        Utils.refreshProjectState();
                    });
                    break;
                case "Histogram" :
                    wiApiService.removeHistogram(object.idHistogram, function () {
                        console.log("histogram removed");
                        Utils.refreshProjectState();
                    })
                    break;
                default:
                    break;
            }
            _currentTrack.removeObject(object);
            // _plotZoneSet(_currentTrack);
            console.log("Remove complete");
        });
    }

    function _objectOnRightClick() {
        let object = _currentTrack.getCurrentDrawing();

        let contextMenu = [
            {
                name: 'RemoveObject',
                label: 'Remove Object',
                icon: '',
                handler: function () {
                    removeAnObjectOfObjectTrack();
                }
            }, {
                name: 'ObjectProperties',
                label: 'Object Properties',
                icon: '',
                handler: function () {
                    objectProperties();
                }
            }, {
                separator: '1'
            }
        ];

        self.setContextMenu(contextMenu);
    }

    function _imageZoneOnRightClick() {
        let imgzone = _currentTrack.getCurrentImageZone();
        self.setContextMenu([
            {
                name: "ImageProperties",
                label: "Image Properties",
                icon: "imgzone-edit-16x16",
                handler: imageProperties
            }, {
                name: "ShowImage",
                label: "Show Image",
                icon: "imgzone-show-16x16",
                handler: showImage
            }, {
                name: "RemoveImage",
                label: "Remove Image",
                icon: "imgzone-delete-16x16",
                handler: function () {
                    wiApiService.removeImage(imgzone.idImageOfTrack, function () {
                        _currentTrack.removeImage(imgzone);
                    });
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
            handler: function () {
                let currentShading = _currentTrack.getCurrentShading();
                console.log("Shading Properties", currentShading);
                DialogUtils.logTrackPropertiesDialog(ModalService, _currentTrack, self.wiLogplotCtrl, wiApiService, function (props) {
                    if (props) {
                        console.log('logTrackPropertiesData', props);
                    }
                }, {
                    tabs: ['false', 'false', 'true'],
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
                    wiApiService.removeShading(currentShading.id, self.removeCurrentShading);
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

        if (!_currentTrack.getCurrentCurve) {
            return;
        }

        let currentCurve = _currentTrack.getCurrentCurve();
        self.setContextMenu([{
            name: "CurveProperties",
            label: "Curve Properties",
            icon: "curve-properties-16x16",
            handler: function () {
                DialogUtils.curvePropertiesDialog(
                    ModalService,
                    wiComponentService,
                    wiApiService,
                    DialogUtils,
                    currentCurve,
                    _currentTrack,
                    self.wiLogplotCtrl,
                    function() {
                        _currentTrack.updateScaleInfo({
                            leftVal:currentCurve.minX,
                            rightVal:currentCurve.maxX,
                            scale: currentCurve.scale
                        });
                        _currentTrack.updateAxis();
                    }
                );
            }
        }, {
            name: "EditCurve",
            label: "Edit Curve",
            icon: "edit-curve-text-16x16",
            handler: function () {
                // Utils.error("Feature is not implemented");

                let rootNodes = wiComponentService.getComponent(wiComponentService.WI_EXPLORER).treeConfig;
                let datasetModel = Utils.getModel('dataset', currentCurve.idDataset);
                let wellModel = Utils.getModel('well', datasetModel.properties.idWell);
                let request = {
                    projectName: rootNodes.name,
                    wellName: wellModel.properties.name,
                    idDataset: currentCurve.idDataset,
                    idSrcCurve: currentCurve.idCurve,
                    // idDesCurve: idDesCurve
                    newCurvename: "new_curve",
                    idLine: currentCurve.id,
                    data: currentCurve.data.map(d => d.x),
                    isBackup: true
                }
                wiApiService.editDataCurve(request, function (response) {
                    console.log('edit curve response', response);
                });
            }
        }, {
                name: "DepthShift",
                label: "Depth Shift",
                icon: "curve-depth-shift-16x16",
                handler: function () {
                    self.depthShiftDialog();
                }
            }, {
                name: "RemoveCurve",
                label: "Remove Curve",
                icon: "curve-hide-16x16",
                handler: function () {
                    let idLine = _currentTrack.getCurrentCurve().id;
                    wiApiService.removeLine(idLine, function(res){
                        self.removeCurrentCurve();
                        if (Array.isArray(res.shadings) && res.shadings.length) {
                            res.shadings.forEach(function(s) {
                                let shading = utils.getVisualizeShading(track, s.idShading);
                                track.removeDrawing(shading);
                            });
                        }
                    });
                }
            }, {
                name: "BaseLineShift",
                label: "BaseLine Shift",
                icon: "curve-interactive-baseline-edit-16x16",
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
                handler: self.createHistogram
            }, {
                name: "Create Shading",
                label: "Create Shading",
                icon: "shading-add-16x16",
                handler: self.createShadingForSelectedCurve
            }, {
                name: "createHistogramTrack",
                label: "Create Histogram Track",
                icon: "",
                handler: function () {
                }
            }
        ]);
    }
    this.createShadingForSelectedCurve = function () {
        
        let curve1 = _currentTrack.getCurrentCurve();
        let curve2 = _currentTrack.getTmpCurve();
        if (!curve1) return;
        var config = {
            isNegPosFill: false,
            fill: {
                display: true,
                pattern: {
                    name: "none",
                    foreground: "black",
                    background: "blue"
                }
            },
            positiveFill: {
                display: false,
                pattern: {
                    name: "none",
                    foreground: "black",
                    background: "blue"
                }
            },
            negativeFill: {
                display: false,
                pattern: {
                    name: "none",
                    foreground: "black",
                    background: "blue"
                }
            },
            showRefLine: false
        };

        let shadingObj = {
            idTrack: _currentTrack.id,
            name: curve2 ? (curve1.name + '-' + curve2.name)
                : (curve1.name + '-left'),
            negativeFill: config.negativeFill,
            positiveFill: config.positiveFill,
            fill: config.fill,
            isNegPosFill: config.isNegPosFill,
            idLeftLine: curve2 ? curve2.id : null,
            idRightLine: curve1.id,
            leftFixedValue: curve2 ? null : curve1.minX,
            rightFixedValue: null,
            idControlCurve: null
        }
        wiApiService.createShading(shadingObj, function (shading) {
            let shadingModel = Utils.shadingToTreeConfig(shading);
            if (!curve2) {
                self.addCustomShadingToTrack(_currentTrack, curve1, shadingModel.data.leftX, shadingModel.data);
            }
            else {
                self.addPairShadingToTrack(_currentTrack, curve1, curve2, shadingModel.data);
            }
            let currentShading = _currentTrack.getCurrentShading();
            let shadingOptions = currentShading.getProperties();
            let well = Utils.findWellByLogplot(self.wiLogplotCtrl.id) || {};
            this.shadingList = _currentTrack.getShadings();

            DialogUtils.shadingAttributeDialog(ModalService, wiApiService, function(options) {
                let request = angular.copy(options);
                if(options.idLeftLine == -3) {
                    options.type = 'custom';
                };
                if(options.idLeftLine == -2) {
                    options.type = 'right';
                };
                if(options.idLeftLine == -1) {
                    options.type = 'left';
                };
                if(options.idLeftLine > 0) {
                    options.type = 'pair';
                }
                delete request.leftLine;
                delete request.rightLine;

                if (options.idLeftLine < 0) {
                    request.idLeftLine = null;
                    options.leftLine = null;
                    options.idLeftLine = null;
                }
                else {
                        request.leftFixedValue = null;
                        request.idLeftLine = parseInt(options.idLeftLine);
                    }
                wiApiService.editShading(request, function (shading) {
                    Utils.getPalettes(function(paletteList){
                        wiApiService.dataCurve(options.idControlCurve, function (curveData) {
                            options.controlCurve = graph.buildCurve({ idCurve: options.idControlCurve }, curveData, well.properties);
                            if(!options.isNegPosFill) {
                                if(options.fill.varShading && options.fill.varShading.palName)
                                    options.fill.varShading.palette = paletteList[options.fill.varShading.palName];
                            }
                            else {
                                if(options.positiveFill.varShading && options.positiveFill.varShading.palName)
                                    options.positiveFill.varShading.palette = paletteList[options.positiveFill.varShading.palName];
                                if(options.negativeFill.varShading && options.negativeFill.varShading.palName)
                                    options.negativeFill.varShading.palette = paletteList[options.negativeFill.varShading.palName];
                            }
                            currentShading.setProperties(options);
                            $timeout(function() {
                                _currentTrack.plotAllDrawings();
                            });

                        });
                    });
                });
            }, shadingOptions, _currentTrack, self.wiLogplotCtrl);
        })
    }
    
    this.createCrossplot = function () {
        let curve1 = _currentTrack.getCurrentCurve();
        let curve2 = _currentTrack.getTmpCurve();
        if (!curve1 || !curve2) {
            DialogUtils.errorMessageDialog(ModalService, 'You must select 2 curves to create a cross plot.');
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
                Utils.createCrossplot(idWell, crossplotName, function(err, crossplotModel) {
                    if (err) {
                        console.error(err);
                        Utils.error(crossplotName + " existed!", function () {
                            self.createCrossplot.call(self);
                        });
                    }
                    else {
                        Utils.openCrossplotTab(crossplotModel);
                    }
                }, null, {
                    CurveX: curve1,
                    CurveY: curve2
                });
            });
        }
    }
    this.createHistogram = function () {
        let curve = _currentTrack.getCurrentCurve();
        if (!curve) {
            DialogUtils.errorMessageDialog(ModalService, 'Please select a curve for creating a histogram!');
        }
        else {
            console.log('Create histogram', curve);
            let promptConfig = {
                title: 'Create New Histogram',
                inputName: 'Histogram Name',
                input: curve.name + 'histogram'
            }
            DialogUtils.promptDialog(ModalService, promptConfig, function (histogramName) {
                let idWell = self.wiLogplotCtrl.getLogplotModel().properties.idWell;
                Utils.createHistogram(idWell, curve, histogramName);
            })
        }
    }

    this.depthShiftDialog = function(){
        let curve = _currentTrack.getCurrentCurve();
        if(!curve){
            DialogUtils.errorMessageDialog(ModalService, 'Please select a curve for depth shift!');
        }else{
            let well = Utils.findWellByLogplot(self.logPlotCtrl.id);
            DialogUtils.depthShiftDialog(ModalService, well, curve);
        }
    }

    function getAllCurves() {
        for (let i = 0; i < _tracks.length; ++i) {
            if (_tracks[i].isLogTrack() && _tracks[i].getCurves) {
                return _tracks[i].getCurves();
            }
        }
    }

    function getAllCurvesOfWell() {
        return new Promise(function(resolve, reject) {
            let availableCurves = getAllCurves();
            wiApiService.getWell(_getWellProps().idWell, function (wellInfo) {
                let allCurves = [];
                wellInfo.datasets.forEach(function (dataset) {
                    allCurves = allCurves.concat(dataset.curves);
                });
                let unAvailableCurves = allCurves.filter(function (curve) {
                    return availableCurves.filter(function (avaiCurve) { return avaiCurve.idCurve == curve.idCurve}).length == 0;
                });
                if(unAvailableCurves.length == 0) {
                    resolve(availableCurves);
                } else {
                    for(let i = 0; i < unAvailableCurves.length; ++i) {
                        wiApiService.infoCurve(unAvailableCurves[i].idCurve, function(infoCurve) {

                            unAvailableCurves[i].minX = infoCurve.LineProperty.minScale;
                            unAvailableCurves[i].maxX = infoCurve.LineProperty.maxScale;

                            if(i == unAvailableCurves.length - 1) {
                                resolve(availableCurves.concat(unAvailableCurves));
                            }
                        });
                    }
                }

            });
        });
    }

    function prepareCurveData(curve) {
        return new Promise(function(resolve, reject) {
            if(!curve) {
                resolve(curve);
            } else if(curve && curve.rawData) {
                resolve(curve);
            } else {
                wiApiService.dataCurve(curve.idCurve, function(curveData) {
                    resolve(graph.buildCurve(curve, curveData, _getWellProps()));
                });
            }
        });
    }

    function _trackOnRightClick(track) {
        if (track.isLogTrack()) {
            self.setContextMenu( [
                {
                    name: "TrackProperties",
                    label: "Track Properties",
                    icon: 'track-properties-16x16',
                    handler: openTrackPropertiesDialog
                },
                {
                    name: "SwitchToLogarithmic",
                    label: "Switch Linear/Logarithmic",
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
                    name: 'AddImageTrack',
                    label: 'Add Image Track',
                    icon: 'image-track-16x16',
                    handler: function () {
                        self.addImageTrack();
                    }
                }, {
                    name: "AddZonationTrack",
                    label: "Add Zonation Track",
                    icon: 'zonation-track-add-16x16',
                    handler: function () {
                        self.addZoneTrack();
                    }
                }, {
                    name: "AddObjectTrack",
                    label: "Add Object Track",
                    icon: '',
                    handler: function () {
                        self.addObjectTrack();
                    }
                }, {
                    separator: '1'
                }, {
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
                        self.addAnnotation();
                    }
                },
                {
                    name: "Create Shading",
                    label: "Create Shading",
                    icon: 'shading-add-16x16',
                    handler: function () {
                        DialogUtils.logTrackPropertiesDialog(ModalService, _currentTrack, self.wiLogplotCtrl, wiApiService, function (props) {
                            if (props) {
                                console.log('logTrackPropertiesData', props);
                            }
                        }, {
                            tabs: ['false', 'false', 'true'],
                            shadingOnly: true
                        });
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
                }, {
                    name: "ExportTrack",
                    label: "Export Track",
                    // icon: "track-delete-16x16",
                    handler: function () {
                        logplotHandlers.ExportTrackButtonClicked();
                    }
                }, {
                    name: "ImportTrack",
                    label: "Import Track",
                    // icon: "track-delete-16x16",
                    handler: function () {
                        logplotHandlers.ImportTrackButtonClicked();
                    }
                },
            ])
        } else if (track.isZoneTrack()) {
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
                    name: 'AddImageTrack',
                    label: 'Add Image Track',
                    icon: 'image-track-16x16',
                    handler: function () {
                        self.addImageTrack();
                    }
                }, {
                    name: "AddZonationTrack",
                    label: "Add Zonation Track",
                    icon: 'zonation-track-add-16x16',
                    handler: function () {
                        self.addZoneTrack();
                    }
                }, {

                    name: "AddObjectTrack",
                    label: "Add Object Track",
                    icon: '',
                    handler: function () {
                        self.addObjectTrack();
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
                    name: "DeleteTrack",
                    label: "Delete Track",
                    icon: 'track-delete-16x16',
                    handler: function () {
                        logplotHandlers.DeleteTrackButtonClicked();
                    }
                },
            ]);
        } else if (track.isObjectTrack()) {
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
                    name: 'AddImageTrack',
                    label: 'Add Image Track',
                    icon: 'image-track-16x16',
                    handler: function () {
                        self.addImageTrack();
                    }
                }, {
                    name: "AddZonationTrack",
                    label: "Add Zonation Track",
                    icon: 'zonation-track-add-16x16',
                    handler: function () {
                        self.addZoneTrack();
                    }
                }, {
                    name: "AddObjectTrack",
                    label: "Add Object Track",
                    icon: '',
                    handler: function () {
                        self.addObjectTrack();
                    }
                }, {
                    separator: '1'
                }, {
                    name: 'AddHistogram',
                    label: 'Add Histogram',
                    icon: 'histogram-new-16x16',
                    handler: function () {
                        let windowY = self.getDepthRangeFromSlidingBar();
                        let range = windowY[1] - windowY[0];
                        let newHistogramProps = {
                            divisions: 10,
                            plot: 'Bar',
                            color: 'blue',
                            showGrid: true,
                            idWell: _getWellProps().idWell,
                            intervalDepthTop: windowY[0] + range/4.,
                            intervalDepthBottom: windowY[1] - range/4.,
                            name: "Histogram - " + (Math.random().toString(36).substr(2, 3))
                        };

                        let newHistogram;
                        let newOoT;
                        async.series([ function(callback) {
                            wiApiService.createHistogram(newHistogramProps, function(createdHistogram) {
                                if(!createdHistogram.idHistogram) {
                                    DialogUtils.errorMessageDialog(ModalService, "Error! " + createdHistogram);
                                    callback(createdHistogram);
                                }
                                else {
                                    newHistogram = createdHistogram;
                                    callback();
                                }
                            });
                        }, function(callback) {
                            Utils.refreshProjectState().then(function() {
                                callback();
                            });
                        }, function(callback) {
                            DialogUtils.histogramFormatDialog(ModalService, newHistogram.idHistogram, function(histogramProps) {
                                newHistogram = histogramProps
                                callback();
                            }, function() {
                                callback('cancel');
                            }, {
                                hideApply: true,
                                autoName: true
                            });
                        }, function(callback) {
                            wiApiService.createObjectOfObjectTrack({
                                idObjectTrack: _currentTrack.id,
                                topDepth: newHistogram.intervalDepthTop,
                                bottomDepth: newHistogram.intervalDepthBottom,
                                object: JSON.stringify({
                                    type: 'Histogram',
                                    idHistogram: newHistogram.idHistogram,
                                    background: 'white'
                                })
                            }, function(returnedObject) {
                                if (returnedObject.idObjectOfTrack) {
                                    newOoT = returnedObject;
                                    callback();
                                }
                                else {
                                    newOoT = null;
                                    callback(returnedObject);
                                }
                            });
                        }, function(callback) {
                            Utils.refreshProjectState().then(function() {
                                callback();
                            });
                        }, function(callback) {
                            if (!_currentTrack) return;
                            let transformY = _currentTrack.getTransformY();

                            let object = self.addObjectToTrack(_currentTrack, newOoT);
                            _currentTrack.setCurrentDrawing(object);
                            object.createHistogram(newHistogram.idHistogram, newHistogram.name, $scope, $compile, self.containerName);
                            callback();
                        }]);
                    }
                }, {
                    name: 'AddCrossplot',
                    label: 'Add Crossplot',
                    icon: 'crossplot-new-16x16',
                    handler: function () {
                        let windowY = self.getDepthRangeFromSlidingBar();
                        let range = windowY[1] - windowY[0];
                        let newCrossplotModel = null;
                        let newOoT;
                        async.series([ function(callback) {
                            utils.createCrossplot(_getWellProps().idWell, 
                                "Crossplot - " + (Math.random().toString(36).substr(2, 3)),
                                function(err, crossplotModel) {
                                    if (err) {
                                        console.error(err);
                                        utils.error(err, function() {
                                            callback();
                                        });
                                    }
                                    else {
                                        newCrossplotModel = crossplotModel;
                                        callback();
                                    }
                                }
                            );
                        }, function(callback) {
                            let pointSet = newCrossplotModel.properties.pointsets[0];
                            pointSet.intervalDepthTop = windowY[0] + range/4.;
                            pointSet.intervalDepthBottom = windowY[1] - range/4.;
                            wiApiService.editPointSet(pointSet, function(returnData) {
                                newCrossplotModel.properties.pointsets[0] = returnData;
                                callback();
                            });
                        }, function(callback) {
                            DialogUtils.crossplotFormatDialog(ModalService, newCrossplotModel.properties.idCrossPlot, function(crossplotProps) {
                                newCrossplotModel.properties = crossplotProps;
                                async.parallel([ function(cb) {
                                    wiApiService.editCrossplot(newCrossplotModel.properties, function(returnData) {
                                        cb();
                                    });
                                }, function(cb) {
                                    wiApiService.editPointSet(newCrossplotModel.properties.pointsets[0], function(returnData) {
                                        cb();
                                    });
                                }], function(err, result) {
                                    callback();
                                });
                            }, function() {
                                callback('cancel');
                            }, {
                                hideApply: true,
                                autoName: true
                            });
                        }, function(callback) {
                            wiApiService.createObjectOfObjectTrack({
                                idObjectTrack: _currentTrack.id,
                                topDepth: newCrossplotModel.properties.pointsets[0].intervalDepthTop,
                                bottomDepth: newCrossplotModel.properties.pointsets[0].intervalDepthBottom,
                                object: JSON.stringify({
                                    type: 'Crossplot',
                                    idCrossplot: newCrossplotModel.properties.idCrossPlot,
                                    background: 'white'
                                })
                            }, function(returnedObject) {
                                if (returnedObject.idObjectOfTrack) {
                                    newOoT = returnedObject;
                                    callback();
                                }
                                else {
                                    newOoT = null;
                                    callback(returnedObject);
                                }
                            });
                        }, function(callback) {
                            if (!_currentTrack) return;
                            let transformY = _currentTrack.getTransformY();

                            let object = self.addObjectToTrack(_currentTrack, newOoT);
                            _currentTrack.setCurrentDrawing(object);
                            object.createCrossplot(newCrossplotModel.properties.idCrossPlot, 
                                newCrossplotModel.properties.name, $scope, $compile, self.containerName);
                            callback();
                        }]);
                    }
                }, {
                    name: "DeleteTrack",
                    label: "Delete Track",
                    icon: 'track-delete-16x16',
                    handler: function () {
                        logplotHandlers.DeleteTrackButtonClicked();
                    }
                }]);
        } else if (track.isImageTrack()) {
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
                    name: 'AddImageTrack',
                    label: 'Add Image Track',
                    icon: 'image-track-16x16',
                    handler: function () {
                        self.addImageTrack();
                    }
                }, {
                    name: "AddZonationTrack",
                    label: "Add Zonation Track",
                    icon: 'zonation-track-add-16x16',
                    handler: function () {
                        self.addZoneTrack();
                    }
                }, {
                    name: "AddObjectTrack",
                    label: "Add Object Track",
                    icon: '',
                    handler: function () {
                        self.addObjectTrack();
                    }
                }, {
                    separator: '1'
                }, {
                    name: "AddImage",
                    label: "Add Image",
                    icon: "image-16x16",
                    handler: function () {
                        track.setMode('AddImageZone');
                    }
                }, {
                    name: "DeleteTrack",
                    label: "Delete Track",
                    icon: 'track-delete-16x16',
                    handler: function () {
                        logplotHandlers.DeleteTrackButtonClicked();
                    }
                }
            ]);
        }
    }

    function _getWellProps() {
        let well = Utils.findWellByLogplot(self.logPlotCtrl.id) || {};
        return well.properties || {};
    }

    function getLogplotCtrl() {
        let logPlotName = self.name.replace("D3Area", "");
        // let logPlotName = self.name.slice(0, 8);
        return wiComponentService.getComponent(logPlotName);
    }

    function openTrackPropertiesDialog() {
        if (!_currentTrack) return;
        if (_currentTrack.isLogTrack()) {
            DialogUtils.logTrackPropertiesDialog(ModalService, _currentTrack, self.wiLogplotCtrl, wiApiService, function (props) {
                if (props) {
                    console.log('logTrackPropertiesData', props);
                }
            }, {
                tabs: ['true', 'true', 'true']
            });
        } else if (_currentTrack.isDepthTrack()) {
            DialogUtils.depthTrackPropertiesDialog(ModalService, _currentTrack, wiApiService, function (props) {
                if (props) {
                    console.log('depthTrackPropertiesData', props);
                }
            });
        } else if (_currentTrack.isZoneTrack()) {
            const idZoneSetCurrent = _currentTrack.getProperties().idZoneSet;
            DialogUtils.zoneTrackPropertiesDialog(ModalService, self.logPlotCtrl, _currentTrack.getProperties(), function (props) {
                if (props) {
                    props.idZoneTrack = _currentTrack.id;
                    console.log(props);
                    wiApiService.editZoneTrack(props, function () {
                        props.width = Utils.inchToPixel(props.width);
                        _currentTrack.setProperties(props);
                        if (idZoneSetCurrent != _currentTrack.idZoneSet) {
                            wiApiService.getZoneSet(_currentTrack.idZoneSet, function (zoneset) {
                                _currentTrack.removeAllZones();
                                for (let zone of zoneset.zones) {
                                    self.addZoneToTrack(_currentTrack, zone);
                                }
                            })
                        }
                        _currentTrack.doPlot(true);
                    });
                }
            });
        } else if (_currentTrack.isImageTrack()) {
            let track = _currentTrack.getProperties();
            track.isCreated = true;
            DialogUtils.imageTrackPropertiesDialog(ModalService, self.logPlotCtrl, track, function (props) {
                if (props) {
                    _currentTrack.removeAllDrawings();
                    props.idImageTrack = _currentTrack.id;
                    console.log(props);
                    wiApiService.editImageTrack(props, function (data) {
                        $timeout(function () {
                            data.width = Utils.inchToPixel(data.width);
                            _currentTrack.setProperties(data);
                            for (let img of data.image_of_tracks) {
                                self.addImageZoneToTrack(_currentTrack, img);
                            }
                            _currentTrack.doPlot(true);
                        });
                    });
                }
            });
        } else if (_currentTrack.isObjectTrack()) {
            DialogUtils.objectTrackPropertiesDialog(ModalService, self.logPlotCtrl, _currentTrack.getProperties(), function (props) {
                if (props) {
                    props.idObjectTrack = _currentTrack.id;
                    console.log("Track new properties: ", props);
                    wiApiService.editObjectTrack(props, function () {
                        props.width = Utils.inchToPixel(props.width);
                        _currentTrack.setProperties(props);
                        _currentTrack.doPlot(true);
                    })
                }
            })
        }
    }

    /* Private End */
    this.verifyDroppedIdCurve = function (idCurve) {
        let well1 = _getWellProps();
        let well2 = Utils.findWellByCurve(idCurve) || {properties: {}};
        if (!well1.idWell || !well2.properties.idWell) return -1;
        if (well1.idWell && well2.properties.idWell && (well1.idWell == well2.properties.idWell)) return 1;
        return 0;
    }
    this.openPropertiesDialog = function () {
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
            case 'imagezone':
                _imageZoneOnDoubleClick();
                break;
            case 'object':
                _objectOnDoubleClick();
                break;
            default:
                break;
        }
    }

    let logplotHandlers = {};
    this.$onInit = function () {
        self.plotAreaId = self.name + 'PlotArea';
        // self.svgId = self.plotAreaId + 'SVG';
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
        self.init();
        $timeout(function () {
            d3.select('#' + self.plotAreaId).on('mousewheel', function() {
                _onPlotMouseWheelCallback();
            });

            //graph.sheetDraggable(document.getElementById(self.plotAreaId));
            let dragMan = wiComponentService.getComponent(wiComponentService.DRAG_MAN);
            let domElement = $(`wi-d3[name=${self.name}]`);
            domElement.on('mouseover', function () {
                if (!dragMan.dragging) return;
                dragMan.wiD3Ctrl = self;
            });
            // domElement.on('mouseleave', function () {
            //     if (!dragMan.dragging) return;
            //     dragMan.wiD3Ctrl = null;
            // });
        }, 1000)
    };

    $scope.safeApply = function (fn) {
        var phase = this.$root.$$phase;
        if (phase == '$apply' || phase == '$digest') {
            if (fn && (typeof (fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

    this.shouldShowSlider = function() {
        return self.contentWidth > self.sliderWidth + 45;
    }
    function updateSlider() {
        let wholeWidth = $(`wi-logplot[name=${self.logPlotCtrl.name}]`).width();
        let slidingBarWidth = $(`wi-slidingbar[name=${self.logPlotCtrl.name + "Slidingbar"}]`).width();
        self.contentWidth = $("#" + self.plotAreaId).width();
        self.sliderWidth = wholeWidth - slidingBarWidth - 56;
        if (!self.shouldShowSlider()) self.slider.noUiSlider.reset();
        $scope.safeApply();
    }
    this.onReady = function(args) {
        function handler () {
            self.plotAll();
            updateSlider();
        }
        self.resizeHandler = function (event) {
            let model = event.model;
            if(!self.isReady) return;
            if (self.containerName) {
                if (model.type == 'logplot') return;
                let comboviewId = +self.containerName.replace('comboview', '');
                if (model.type == 'comboview' && comboviewId == model.properties.id) handler();
            } else {
                if (model.type == 'logplot' && self.wiLogplotCtrl.id == model.properties.idPlot) handler();
            }
        }
        document.addEventListener('resize', self.resizeHandler);
    }

    this.onSliderReady = function() {
        self.slider = $($('#' + self.plotAreaId).siblings()[0]).children()[0];
        noUiSlider.create(self.slider, {
            start: [0],
            connect: [true, false],
            range: {
                'min': 0,
                'max': 100
            }
        });
        self.slider.noUiSlider.on('update', function(values) {
            // console.log('value', values);
            let difference = self.contentWidth - self.sliderWidth + 20;
            let val = parseFloat(values[0]);
            let left = -1*difference * val / 100.;
            $(`#${self.plotAreaId}`).css('left', left + 'px');
        });
        updateSlider();
    }

    var commonCtxMenu = [
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
            name: 'AddImageTrack',
            label: 'Add Image Track',
            icon: 'image-track-16x16',
            handler: function () {
                self.addImageTrack();
            }
        }, {
            name: "AddZonationTrack",
            label: "Add Zonation Track",
            icon: 'zonation-track-add-16x16',
            handler: function () {
                self.addZoneTrack();
            }
        }, {
            name: "AddObjectTrack",
            label: "Add Object Track",
            icon: '',
            handler: function () {
                self.addObjectTrack();
            }
        }, {
            separator: '1'
        }, {
            name: "DeleteTrack",
            label: "Delete Track",
            icon: 'track-delete-16x16',
            handler: function () {
                logplotHandlers.DeleteTrackButtonClicked();
            }
        }
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

    this.init = _.debounce(function () {
        Utils.getPalettes(function (paletteList) {
            let logplotCtrl = self.logPlotCtrl;
            let logplotModel = logplotCtrl.getLogplotModel();
            let wiD3Ctrl = self;
            let well = Utils.findWellByLogplot(logplotModel.properties.idPlot);
            wiApiService.getLogplot(logplotModel.id,
                function (plot) {
                    if (logplotModel.properties.referenceCurve) {
                        logplotCtrl.getSlidingbarCtrl().createPreview(plot.referenceCurve);
                    }
                    let tracks = new Array();
                    if (plot.depth_axes && plot.depth_axes.length) {
                        plot.depth_axes.forEach(function (depthTrack) {
                            tracks.push(depthTrack);
                        });
                    }
                    if (plot.tracks && plot.tracks.length) {
                        plot.tracks.forEach(function (track) {
                            tracks.push(track);
                        });
                    }
                    if (plot.zone_tracks && plot.zone_tracks.length) {
                        plot.zone_tracks.forEach(function (zoneTrack) {
                            tracks.push(zoneTrack);
                        })
                    }
                    if (plot.image_tracks && plot.image_tracks.length) {
                        plot.image_tracks.forEach(function (imageTrack) {
                            tracks.push(imageTrack);
                        })
                    }
                    if(plot.object_tracks && plot.object_tracks.length) {
                        plot.object_tracks.forEach(function (objectTrack) {
                            tracks.push(objectTrack);
                        })
                    }
                    function drawAllShadings(someTrack, trackObj, callback) {
                        someTrack.shadings.forEach(function (shading) {
                            wiApiService.dataCurve(shading.idControlCurve, function(dataCurve) {
                                let shadingModel = Utils.shadingToTreeConfig(shading, paletteList);
                                shadingModel.data.selectedCurve = graph.buildCurve({idCurve: shading.idControlCurve}, dataCurve, well.properties);
                                let linesOfTrack = trackObj.getCurves();
                                console.log("LinhTinh:", linesOfTrack, shading, shadingModel);
                                let lineObj1 = null;
                                let lineObj2 = null;
                                if (!shadingModel.idRightLine) return;
                                if (!shadingModel.idLeftLine) {
                                    for (let line of linesOfTrack) {
                                        if (line.id == shading.idRightLine) {
                                            lineObj1 = line;
                                        }
                                    }
                                    wiD3Ctrl.addCustomShadingToTrack(trackObj, lineObj1, shadingModel.data.leftX, shadingModel.data);
                                    if(callback) callback();
                                }
                                else {
                                    for (let line of linesOfTrack) {
                                        if (line.id == shading.idRightLine) {
                                            lineObj1 = line;
                                        }
                                        if (line.id == shading.idLeftLine) {
                                            lineObj2 = line;
                                        }
                                    }
                                    wiD3Ctrl.addPairShadingToTrack(trackObj, lineObj2, lineObj1, shadingModel.data);
                                    if(callback) callback();
                                }
                            })
                        });
                    };
                    let trackProps = new Array();
                    async.eachOfSeries(tracks, function(aTrack, idx, _callback) {
                        if (aTrack.idDepthAxis) {
                            wiD3Ctrl.pushDepthTrack(aTrack);
                            trackProps.push(aTrack);
                            async.setImmediate(_callback);
                        }
                        else if (aTrack.idTrack) {
                            let trackObj = wiD3Ctrl.pushLogTrack(aTrack);
                            trackProps.push(aTrack);
                            async.setImmediate(_callback);
                        } else if (aTrack.idZoneTrack) {
                            let viTrack = wiD3Ctrl.pushZoneTrack(aTrack);
                            trackProps.push(aTrack);
                            async.setImmediate(_callback);
                        } else if(aTrack.idImageTrack) {
                            let viTrack = wiD3Ctrl.pushImageTrack(aTrack);
                            trackProps.push(aTrack);
                            async.setImmediate(_callback);
                        } else if(aTrack.idObjectTrack) {
                            let viTrack = wiD3Ctrl.pushObjectTrack(aTrack);
                            trackProps.push(aTrack);
                            async.setImmediate(_callback);
                        } else {
                            async.setImmediate(_callback);
                        }
                    }, function(error) {
                        buildTracks();
                    });
                    function buildTracks() {
                        trackProps.sort(function (track1, track2) {
                            return track1.orderNum.localeCompare(track2.orderNum);
                        });
                        let loadedTracks = wiD3Ctrl.getTracks();
                        async.eachOf(loadedTracks, function(aTrack, idx, _cb){
                            if (aTrack.type == "depth-track") {
                                console.log('depth track');
                                async.setImmediate(_cb);
                            }
                            else if (aTrack.type == "log-track") {
                                trackProps[idx].markers.forEach(function (marker) {
                                    wiD3Ctrl.addMarkerToTrack(aTrack, marker);
                                });
                                trackProps[idx].annotations.forEach(function (anno) {
                                    wiD3Ctrl.addAnnotationToTrack(aTrack, anno);
                                })
                                if (!trackProps[idx].lines || trackProps[idx].lines.length == 0) {
                                    async.setImmediate(_cb);
                                }
                                let lineCount = 0;
                                let lineNum = trackProps[idx].lines.length;
                                let eventEmitter = new EventEmitter();
                                eventEmitter.on('line-drawed', function (someTrack) {
                                    console.log(someTrack);
                                    lineCount++;
                                    if (lineCount == lineNum) {
                                        drawAllShadings(someTrack, aTrack, function(){
                                            aTrack.setCurrentDrawing(null);
                                        });
                                        _cb();
                                    }
                                });
                                trackProps[idx].lines.forEach(function (line) {
                                    Utils.getCurveData(wiApiService, line.idCurve, function (err, data) {
                                        let lineModel = Utils.lineToTreeConfig(line);
                                        if (!err) {
                                            wiD3Ctrl.addCurveToTrack(aTrack, data, lineModel.data);
                                        }
                                        else {
                                            console.error(err);
                                            wiComponentService.getComponent(wiComponentService.UTILS).error(err);
                                        }
                                        eventEmitter.emitEvent('line-drawed', [trackProps[idx]]);
                                    });
                                });
                            }
                            else if (aTrack.type == "zone-track") {
                                if (!trackProps[idx].zoneset) {
                                    async.setImmediate(_cb);
                                }
                                wiApiService.getZoneSet(trackProps[idx].zoneset.idZoneSet, function (zoneset) {
                                    for (let zone of zoneset.zones) {
                                        wiD3Ctrl.addZoneToTrack(aTrack, zone);
                                    }
                                    _cb();
                                });
                            }
                            else if (aTrack.type == "image-track") {
                                wiApiService.getImagesOfTrack(trackProps[idx].idImageTrack, function (images) {
                                    for (let img of images) {
                                        wiD3Ctrl.addImageZoneToTrack(aTrack, img);
                                    }
                                    _cb();
                                });
                            }
                            else if (aTrack.type == "object-track") {
                                if(!trackProps[idx].object_of_tracks || !trackProps[idx].object_of_tracks.length) {
                                    async.setImmediate(_cb);
                                } else {
                                    for (let objectOfTrack of trackProps[idx].object_of_tracks) {
                                        let anObject = wiD3Ctrl.addObjectToTrack(aTrack, objectOfTrack);
                                        let objectProps = JSON.parse(objectOfTrack.object);
                                        switch(objectProps.type) {
                                            case 'Histogram' :
                                                if (objectProps.idHistogram) {
                                                    let histogramModel = Utils.findHistogramModelById(objectProps.idHistogram);
                                                    if (histogramModel && histogramModel.properties) {
                                                        anObject.createHistogram(
                                                            histogramModel.properties.idHistogram, 
                                                            histogramModel.properties.name, 
                                                            wiD3Ctrl.scopeObj, wiD3Ctrl.compileFunc, wiD3Ctrl.containerName
                                                        );
                                                    }
                                                    else {
                                                       // TODO 
                                                    }
                                                }
                                                else {
                                                    // TODO
                                                }
                                                break;
                                            case 'Crossplot':
                                                if (objectProps.idCrossplot) {
                                                    let crossplotModel = Utils.getModel('crossplot', objectProps.idCrossplot);
                                                    if (crossplotModel && crossplotModel.properties) {
                                                        anObject.createCrossplot(
                                                            crossplotModel.properties.idCrossPlot, 
                                                            crossplotModel.properties.name, 
                                                            wiD3Ctrl.scopeObj, wiD3Ctrl.compileFunc, wiD3Ctrl.containerName
                                                        );
                                                    }
                                                    else {
                                                       // TODO 
                                                    }
                                                }
                                                else {
                                                    // TODO
                                                }
                                                break;
                                                objectProps.intervalDepthTop = objectOfTrack.topDepth;
                                                objectProps.intervalDepthBottom = objectOfTrack.bottomDepth;
                                                wiApiService.getCrossplot(objectProps.idCrossPlot, function(crossplot) {
                                                    if(crossplot.idCrossPlot) {
                                                        wiApiService.getPointSet(objectProps.idPointSet, function(pointSet) {
                                                            wiApiService.infoCurve(pointSet.idCurveX, function(curveX) {
                                                                wiApiService.dataCurve(pointSet.idCurveX, function(dataCurveX) {
                                                                    curveX.rawData = dataCurveX;
                                                                    if(pointSet.idCurveX == pointSet.idCurveY) {
                                                                        let curveY = curveX;
                                                                        Utils.createCrossplotToObjectOfTrack(anObject, curveX, curveY, pointSet, objectProps, wiApiService);
                                                                    } else {
                                                                        wiApiService.infoCurve(pointSet.idCurveY, function(curveY) {
                                                                            wiApiService.dataCurve(pointSet.idCurveY, function(dataCurveY) {
                                                                                curveY.rawData = dataCurveY;
                                                                                Utils.createCrossplotToObjectOfTrack(anObject, curveX, curveY, pointSet, objectProps, wiApiService);
                                                                            })
                                                                        })
                                                                    }
                                                                })
                                                            })
                                                        });
                                                    } else {
                                                        wiD3Ctrl.removeAnObjectOfObjectTrack(aTrack, anObject);
                                                    }
                                                });
                                                break;
                                            default:
                                                break;
                                        }
                                    }
                                    async.setImmediate(_cb);
                                }
                            }
                        }, function(err) {
                            let currentState = JSON.parse(plot.currentState);
                            if (currentState.top && currentState.bottom){
                                logplotCtrl.handlers.ScalePreviousState(currentState.top, currentState.bottom);
                            } else {
                                logplotCtrl.handlers.Scale100ButtonClicked();
                            }
                            setTimeout(function () {
                                if(plot.cropDisplay) {
                                    logplotCtrl.getSlidingbarCtrl().scaleView(currentState.top0, currentState.range0, true);
                                } else {
                                    logplotCtrl.handlers.ViewWholeWellButtonClicked();
                                }
                            },500);
                            self.isReady = true;
                            wiComponentService.emit(wiComponentService.LOGPLOT_LOADED_EVENT, logplotModel);
                        });
                    }
                });
        });
    }, 100);

	this.$onDestroy = function () {
        wiComponentService.dropComponent(self.name);
        document.removeEventListener('resize', self.resizeHandler);
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
        wiLogplotCtrl: '<',
        containerName: '@'
    }
});

exports.name = moduleName;
exports.controller = Controller;
