const componentName = 'wiD3LogTrack';
const moduleName = 'wi-d3-log-track';
const componentAlias = 'wiD3Track';

let wiD3AbstractTrack = require('./wi-d3-abstract-track.js');
Controller.prototype = Object.create(wiD3AbstractTrack.prototype);
Controller.prototype.constructor = Controller;

function Controller ($scope, wiComponentService, wiApiService, ModalService, $timeout) {
    wiD3AbstractTrack.call(this, wiApiService, wiComponentService);
    let self = this;
    let Utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let graph = wiComponentService.getComponent(wiComponentService.GRAPH);
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let logplotHandlers = null;
    let lastWell = null;
    let contextMenu = [{
        name: "TrackProperties",
        label: "Track Properties",
        icon: 'track-properties-16x16',
        handler: function() {
            self.openPropertiesDialog()
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
    }, {
        name: "Add Annotation",
        label: "Add Annotation",
        icon: 'annotation-16x16',
        handler: function () {
            self.addAnnotation();
        }
    }, {
        name: "Create Shading",
        label: "Create Shading",
        icon: 'shading-add-16x16',
        handler: function () {
            let options = {
                tabs: ['false', 'false', 'true'],
                shadingOnly: true
            };
            DialogUtils.logTrackPropertiesDialog(ModalService, self.getProperties(), options, function (props) {
                if (props) {
                    console.log('logTrackPropertiesData', props);
                }
            });
        }
    }, {
        separator: '1'
    }];

    let extraContextMenu = [{
        name: "DuplicateTrack",
        label: "Duplicate Track",
        icon: 'track-duplicate-16x16',
        handler: function () {
            logplotHandlers.DuplicateTrackButtonClicked();
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
    }, {
        separator: '1'
    }];

    let markerCtxMenu = [{
        name: "makeZoneset",
        label: "Make Zoneset From Markerset",
        icon: "zone-add-plus-16x16",
        handler: function () {
            toastr.info('make zoneset from markerset button clicked');
        }
    }];

    let zonesetCtxMenu = [{
        name: "makeZoneset",
        label: "Make Markerset From Zoneset",
        icon: "marker-add-16x16",
        handler: function () {
            toastr.info('make markerset from zoneset button clicked');
        }
    }];

    this.getContextMenu = function () {
        if (self.wiD3Ctrl && self.wiD3Ctrl.containerName && self.viTrack.mode == 'UseSelector') {
            let combinedPlotD3Ctrl = wiComponentService.getComponent(self.wiD3Ctrl.containerName + 'D3Area');
            return [
                {
                    name: "End",
                    label: "End",
                    icon: "",
                    handler: function () {
                        combinedPlotD3Ctrl.endAllSelections();
                    }
                }
            ]
        } else {
            let currDrawing = self.currentDrawingRightClicked;
            self.currentDrawingRightClicked = null;
            switch (currDrawing) {
                case 'curve':
                    return _getCurveContextMenu();
                case 'marker':
                    return _getMarkerContextMenu();
                case 'annotation':
                    return _getAnnotationContextMenu();
                case 'shading':
                    return _getShadingContextMenu();
                default:
                    return _(contextMenu)
                        .concat(self.viTrack.idMarkerSet ? markerCtxMenu:[])
                        .concat(self.viTrack.idZoneSet ? zonesetCtxMenu:[])
                        .concat(logplotHandlers ? extraContextMenu:[])
                        .concat(self.wiD3Ctrl ? self.wiD3Ctrl.getContextMenu():[]).value();
            }
        }
    }

    this.verifyDroppedIdCurve = function(idCurve) {
        if(!self.viTrack.getCurves().length) return 1;
        else {
            let wellProps = self.getWellProps();      
            if(!wellProps) return 1;
            else {
                let curveWell = Utils.findWellByCurve(idCurve).properties;
                if(curveWell.idWell == wellProps.idWell) return 1;
                else return 0;
            }
        }
    }

    this.openPropertiesDialog = function () {
        let options = {
            tabs: ['true', 'true', 'true']
        };
        DialogUtils.logTrackPropertiesDialog(ModalService, self.getProperties(), options, function (props) {
            if (props) {
                console.log('logTrackPropertiesData', props);
            }
        });
    }

    this.openPropertiesWindow = function () {
        let props = self.getProperties().controller.viTrack.getProperties();
        props.wellProps = self.getWellProps();
        props.zoneSet = props.idZoneSet ? 
                        utils.getModel('zoneset', props.idZoneSet).properties : 
                        {idZoneSet: null, name: null};
        props.markerSet = props.idMarkerSet ? 
                        utils.getModel('markerset', props.idMarkerSet).properties : 
                        {idMarkerSet: null, name: null};
        props.width = utils.pixelToInch(props.width);
        wiComponentService.emit("update-properties", {
            type: 'd3-logtrack', 
            props: props
        });
    }

    this.update = update;
    this.isIdle = false;
    function update(callback) {
        let viTrack = self.viTrack;
        let trackProps = viTrack.getProperties();
        let palettes = wiComponentService.getComponent(wiComponentService.PALETTES);

        // update track without track id (anonymous track - for preview purpose)
        if(!trackProps.idTrack) {
            if (self.getProperties().zone_set) {
                self.addZoneSetToTrack(self.getProperties().zone_set); 
            }
            let lines = self.getProperties().lines;
            if (lines && lines.length) {
                let promises = [];
                self.viTrack.getCurves().forEach(viCurve => {
                    let line = lines.find(line => line.idCurve == viCurve.idCurve);
                    viTrack.removeDrawing(viCurve)
                    let curveData = viCurve.rawData;
                    if(line && curveData && curveData.length) {
                        self.addCurveToTrack(curveData, line); 
                    }
                });
                lines.forEach(line => {
                    if (!viTrack.getCurves().find(viCurve => viCurve.idCurve == line.idCurve)) {
                        promises.push(new Promise((resolve) => {
                            wiApiService.dataCurve(line.idCurve, curveData => {
                                self.addCurveToTrack(curveData, line);
                                resolve();
                            })
                        }));
                    }
                });

                Promise.all(promises).then(() => {
                    let wellProps = self.getWellProps();
                    if(wellProps) {
                        if(!self.minY) self.minY = Number(wellProps.topDepth);
                        if(!self.maxY) self.maxY = Number(wellProps.bottomDepth);
                    }
                    self.isIdle = true;
                })
            }
            return;
        }

        // update whole track by synchronizing with server
        wiApiService.infoTrack(trackProps.idTrack, function (logTrack) {
            // viTrack.getMarkers().forEach(viMarker => {
            //     let marker = logTrack.markers.find(marker => marker.idMarker == viMarker.id);
            //     viTrack.removeDrawing(viMarker);
            //     if (marker) {
            //         self.addMarkerToTrack(viTrack, marker);
            //     } // add if viMarker in track
            // });
            // logTrack.markers.forEach(marker => {
            //     if(!viTrack.getMarkers().find(viMarker => viMarker.id == marker.idMarker)) {
            //         self.addMarkerToTrack(viTrack, marker);
            //     } // add if marker not in viTrack
            // });

            // update annotations
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
            // update lines
            viTrack.getCurves().forEach(viCurve => {
                let line = logTrack.lines.find(line => line.idLine == viCurve.id);
                viTrack.removeDrawing(viCurve);
                let curveData = viCurve.rawData;
                if (line && curveData && curveData.length) {
                    self.addCurveToTrack(curveData, Utils.lineToTreeConfig(line).data);
                }
            });
            logTrack.lines.forEach(line => {
                if(!viTrack.getCurves().find(viCurve => viCurve.id == line.idLine)) {
                    promises.push(new Promise(resolve => {
                        wiApiService.dataCurve(line.idCurve, function (curveData) {
                            self.addCurveToTrack(curveData, Utils.lineToTreeConfig(line).data);
                            resolve();
                        })
                    }))
                }
            });

            promises.push(new Promise(resolve => {
                // update zoneset
                if(logTrack.idZoneSet && logTrack.zone_set) {
                    self.addZoneSetToTrack(logTrack.zone_set); 
                } else {
                    viTrack.removeAllZones(); 
                }                

                // update markerset
                if(logTrack.idMarkerSet && logTrack.marker_set) {
                    self.addMarkerSetToTrack(logTrack.marker_set); 
                } else {
                    viTrack.removeAllMarkers(); 
                }

                resolve();
            }))
            Promise.all(promises)
                .then(function () {
                    updateTrackWellStatus();
                    viTrack.getShadings().forEach(viShading => {
                        let shading = logTrack.shadings.find(shading => shading.idShading == viShading.id);
                        viTrack.removeDrawing(viShading);
                        if (!shading) return;
                    });
                    logTrack.shadings.forEach(shading => {
                        if(viTrack.getShadings().find(viShading => viShading.id == shading.idShading)) return;
                        _addShadingToTrack(shading);
                    });
                    logTrack.width = Utils.inchToPixel(logTrack.width);
                    viTrack.setProperties(logTrack);
                    updateCurvesUnit().then(function() {
                        viTrack.doPlot();
                        callback && callback();
                        self.isIdle = true; 
                    })
                })
                .catch(function (err) {
                    console.error(err);
                })
        });

        function updateCurvesUnit()  {
            return new Promise(function(resolve){
                let _promises = [];
                async.eachSeries(self.viTrack.getCurves(), function(viCurve, cb) {
                    wiApiService.infoCurve(viCurve.idCurve, function(curveInfo) {
                        if(viCurve.unit !== curveInfo.unit && curveInfo.idFamily) {
                            wiApiService.getListUnit({idCurve: viCurve.idCurve}, function(units) {
                                let defaultUnit = units.find(u => u.name === curveInfo.unit);
                                let currUnit = units.find(u => u.name === viCurve.unit);
                                viCurve.changeUnitValue(defaultUnit, currUnit);
                                cb();
                            })
                        } else cb();
                    })
                }, function(err) {
                    if(err) console.error(err);
                    resolve();
                })
            })
        }

        function updateTrackWellStatus() {
            let wellProps = self.getWellProps();
            if(wellProps) {
                if(!lastWell && self.wiD3Ctrl) {
                    self.wiD3Ctrl.updateMultiWellState();
                }
                let wellColor = Utils.getWellColor(wellProps.idWell);
                viTrack.headerNameBlock.style('background-color', wellColor);
                viTrack.wellName = wellProps.name;
                lastWell = wellProps;
                return;
            }
            // default
            if(lastWell && self.wiD3Ctrl) {
                self.wiD3Ctrl.updateMultiWellState();
            }
            viTrack.headerNameBlock.style('background-color', viTrack.HEADER_NAME_COLOR);
            viTrack.wellName = null;
            lastWell = null;
        }

        function getDataCurve(idCurve, _cb) {
            const line = viTrack.getCurves().find(l => l.idCurve === idCurve) || {};
            let dataCurve = line.rawData;
            if (Array.isArray(dataCurve)) _cb(dataCurve);
            else wiApiService.dataCurve(idCurve, function (dataCurve, err) {
                if (err) _cb(null, err);
                else _cb(dataCurve);
            });
        }
        function _addShadingToTrack (shading) {
            getDataCurve(shading.idControlCurve, function (dataCurve, err) {
                if (err) return;
                let shadingModel = Utils.shadingToTreeConfig(shading, palettes);
                shadingModel.data.selectedCurve = graph.buildCurve({ idCurve: shading.idControlCurve }, dataCurve, self.getWellProps());
                if (!shadingModel.idRightLine) return;
                if (!shadingModel.idLeftLine) {
                    let lineObj1 = viTrack.getCurves().find(viCurve => viCurve.id == shading.idRightLine);
                    if (!lineObj1) return;
                    self.addCustomShadingToTrack(viTrack, lineObj1, shadingModel.data.leftX, shadingModel.data);
                }
                else {
                    let lineObj1 = viTrack.getCurves().find(viCurve => viCurve.id == shading.idRightLine);
                    let lineObj2 = viTrack.getCurves().find(viCurve => viCurve.id == shading.idLeftLine);
                    if (!lineObj1 || !lineObj2) return;
                    self.addPairShadingToTrack(viTrack, lineObj2, lineObj1, shadingModel.data);
                }
            });
        }
    }

    this.depthShiftDialog = function () {
        let curve = self.viTrack.getCurrentCurve();
        if(!curve){
            DialogUtils.errorMessageDialog(ModalService, 'Please select a curve for depth shift!');
        }else{
            let well = Utils.findWellByLogplot(self.getProperties().idPlot);
            DialogUtils.depthShiftDialog(ModalService, well, curve);
        }
    }

    this.addMarker = function () {
        if (self.viTrack && self.viTrack.addMarker && self.viTrack.setMode) {
            self.viTrack.setMode('AddMarker');
        }
    }

    this.addMarkerToTrack = function (config) {
        let track = self.viTrack;
        if (!track || !track.addMarker) return;
        let marker = track.addMarker(config);
        track.plotMarker(marker);
        track.onMarkerMouseDown(marker, function () {
            if (d3.event.button == 2) {
                self.currentDrawingRightClicked = 'marker';
                // _markerOnRightClick();
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

    this.addMarkerSetToTrack = function (markerSet) {
        this.viTrack.removeAllMarkers();
        markerSet.markers.forEach(function (marker) {
            if (marker) {
                self.addMarkerToTrack(marker); 
            }
        })
    }

    this.addZoneSetToTrack = function (zoneset) {
        self.properties.zone_set = zoneset;
        self.viTrack.removeAllZones();
        for(let zone of zoneset.zones) {
            if(zone.showOnTrack) {
                let viZone = self.viTrack.addZone(zone);
                viZone.svgGroup.style('pointer-events', 'none');
                viZone.onControlLinesDrag(function(param) {
                    if(self.viTrack.currentDrawing != viZone) {
                        self.viTrack.setCurrentDrawing(viZone);
                    }
                    self.drawTooltip();
                    self.viTrack.drawControlLinesOnCurvesHeaders(zone.params); 
                    $scope.$apply();
                });
                self.viTrack.onDrawingMouseDown(viZone, function() {
                    $timeout(function() {
                        self.viTrack.setCurrentDrawing(viZone);
                    })
                })
            }
        }
    }

    this.addAnnotation = function () {
        if (!self.viTrack.isLogTrack()) return;
        // let [topDepth, bottomDepth] = self.wiD3Ctrl.getDepthRangeFromSlidingBar();
        let [topDepth, bottomDepth] = [self.minY, self.maxY];
        let range = bottomDepth - topDepth;
        let top = (topDepth + bottomDepth) / 2;
        let bottom = top + (range / 10);
        let defaultAnn = {
            idTrack: self.viTrack.id,
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
            let viAnno = self.addAnnotationToTrack(self.viTrack, annotation);
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
                self.currentDrawingRightClicked = 'annotation';
                // _annotationOnRightClick();
            }
        });
        ann.on('dblclick', _annotationOnDoubleClick);
        ann.onRectDragEnd(function () {
            // Send api to update annotation
            let annoConfig = ann.getProperties();
            delete annoConfig.textStyle;
            wiApiService.editAnnotation(annoConfig, function () {});
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

    this.addCurveToTrack = function (data, config) {
        let track = self.viTrack;
        if (!track || !track.addCurve) return;

        // get well properties for curve config
        let wellProps = utils.findWellByCurve(config.idCurve).properties;
        config.yStep = parseFloat(wellProps.step);
        config.offsetY = parseFloat(wellProps.topDepth);

        let curve = track.addCurve(data, config);

        //let depthRange = self.wiD3Ctrl.getDepthRangeFromSlidingBar();
        //self.wiD3Ctrl.setDepthRangeForTrack(track, depthRange);
        track.updateScaleInfo({
            leftVal:config.minX,
            rightVal:config.maxX,
            scale: config.scale
        });
        track.updateAxis();
        track.plotCurve(curve);
        track.onCurveHeaderMouseDown(curve, function () {
            if (d3.event.button == 2) {
                // _curveOnRightClick();
                self.currentDrawingRightClicked = 'curve';
            }
        });
        curve.header.on('dblclick', function () {
            // Mousedown already set the curve to be current curve
            _curveOnDoubleClick();
        });
        return curve;
    };

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

    this.removeCurrentShading = function () {
        if (!self.viTrack.getCurrentShading) return;
        self.removeShadingFromTrack(self.viTrack, self.viTrack.getCurrentShading());
    }

    this.removeShadingFromTrack = function (track, shading) {
        if (!track || !track.removeShading) return;
        track.removeShading(shading);
    }

    this.removeCurveFromTrack = function (track, curve) {
        if (!track || !track.removeCurve) return;
        track.removeCurve(curve);
    }

    this.removeMarkerFromTrack = function (track, marker) {
        if (!track || !track.removeMarker) return;
        track.removeMarker(marker);
    }

    this.removeCurrentCurve = function () {
        if (!self.viTrack.getCurrentCurve) return;
        self.removeCurveFromTrack(self.viTrack, self.viTrack.getCurrentCurve());
    }

    this.createShadingForSelectedCurve = function () {
        let curve1 = self.viTrack.getCurrentCurve();
        let curve2 = self.viTrack.getTmpCurve();
        if (!curve1) return;
        var config = {
            isNegPosFill: false,
            fill: {
                display: true,
                shadingType: 'pattern',
                pattern: {
                    displayType : true,
                    name: "none",
                    foreground: "black",
                    background: "blue"
                }
            },
            positiveFill: {
                display: false,
                shadingType: 'pattern',
                pattern: {
                    displayType : false,
                    name: "none",
                    foreground: "black",
                    background: "blue"
                }
            },
            negativeFill: {
                display: false,
                shadingType: 'pattern',
                pattern: {
                    displayType : false,
                    name: "none",
                    foreground: "black",
                    background: "blue"
                }
            },
            showRefLine: false
        };

        let shadingObj = {
            idTrack: self.viTrack.id,
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
            idControlCurve: curve2 ? curve2.idCurve : curve1.idCurve,
            orderNum: self.viTrack.getShadingOrderKey()
        }
        wiApiService.createShading(shadingObj, function (shading) {
            let shadingModel = Utils.shadingToTreeConfig(shading);
            if (!curve2) {
                self.addCustomShadingToTrack(self.viTrack, curve1, shadingModel.data.leftX, shadingModel.data);
            }
            else {
                self.addPairShadingToTrack(self.viTrack, curve1, curve2, shadingModel.data);
            }
            _openShadingAttributeDialog();
        })
    }

    function _openShadingAttributeDialog () {
        let currentShading = self.viTrack.getCurrentShading();
        let shadingOptions = currentShading.getProperties();
        console.log("onWiD3", shadingOptions);
        DialogUtils.shadingAttributeDialog(ModalService, shadingOptions, self.getProperties(), function(options) {
            let leftCurveBk = options.leftCurve;
            options.leftCurve = null;
            let rightCurveBk = options.rightCurve;
            options.rightCurve = null;

            let request = angular.copy(options);

            request.leftCurve = leftCurveBk;
            request.rightCurve = rightCurveBk;
            options.leftCurve = leftCurveBk;
            options.rightCurve = rightCurveBk;

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
            delete request.leftCurve;
            delete request.rightCurve;

            if (options.idLeftLine < 0) {
                request.idLeftLine = null;
                options.leftCurve = null;
                options.idLeftLine = null;
            }
            else {
                request.leftFixedValue = null;
                request.idLeftLine = parseInt(options.idLeftLine);
            }
            options.rightCurve = options.rightCurve;
            options.leftCurve = options.leftCurve;
            delete options.rightCurve;
            delete options.leftCurve;

            let width = self.viTrack.width;
            wiApiService.editShading(request, function (shading) {
                self.update();
                $timeout(function() {
                    self.viTrack.width = width;
                    self.viTrack.doPlot();
                }, 1000);
            });
        });
    };

    this.createCrossplot = function () {
        let curve1 = self.viTrack.getCurrentCurve();
        let curve2 = self.viTrack.getTmpCurve();
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
                if(!crossplotName) return;
                let well = Utils.findWellByLogplot(self.getProperties().idPlot);
                // let idWell = self.wiLogplotCtrl.getLogplotModel().properties.idWell;
                Utils.createCrossplot(well.properties.idWell, crossplotName, function(err, crossplotModel) {
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
        let curve = self.viTrack.getCurrentCurve();
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
                if(!histogramName) return;
                let well = Utils.findWellByLogplot(self.getProperties().idPlot);
                // let idWell = self.wiLogplotCtrl.getLogplotModel().properties.idWell;
                Utils.createHistogram(well.properties.idWell, curve, histogramName);
            })
        }
    }

    this.addViSelectionToTrack = function (track, selectionConfig) {
        track.addSelection(selectionConfig);
    }
    
    this.onTrackKeyPressCallback = function () {
        if(!d3.event) return;
        let track = self.viTrack;
        switch(d3.event.key) {
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
                        self.update();
                        /*
                        track.removeCurve(curve);
                        if (Array.isArray(res.shadings) && res.shadings.length) {
                            res.shadings.forEach(function(s) {
                                let shading = utils.getVisualizeShading(track, s.idShading);
                                track.removeDrawing(shading);
                            });
                        }
                        */
                    });
                }
                else if (drawing.isShading()) {
                    wiApiService.removeShading(drawing.id, function() {
                        track.removeDrawing(drawing);
                    });
                }
                else if (drawing.isAnnotation()) {
                    // Send api before deleting
                    wiApiService.removeAnnotation(drawing.idAnnotation, function () {
                        track.removeDrawing(drawing);
                    })
                }
                else if (drawing.isMarker()) {
                    wiApiService.removeMarker(drawing.id, function () {
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

    this.$onInit = function () {
        wiD3AbstractTrack.prototype.$onInit.call(self);
        this.plotAreaId = self.name + 'PlotArea';
         // this.wiLogplotCtrl = self.wiD3Ctrl.wiLogplotCtrl;
        logplotHandlers = self.wiD3Ctrl ? self.wiD3Ctrl.getLogplotHandler() : null;
    }

    this.onDelete = function (model) {
        console.log('onDelete LogTrack: ', model);
        let hasCurve;
        switch(model.type){
            case 'curve':
                hasCurve = self.viTrack.getCurves().find(curve => curve.idCurve == model.id);
                if(hasCurve) {
                    console.log('updating log track', self.viTrack);
                    self.update();
                }
                break;

            case 'dataset':
                hasCurve = self.viTrack.getCurves().find(curve => curve.idDataset == model.id);
                if(hasCurve) {
                    console.log('updating log track', self.viTrack);
                    self.update();
                }
                break;
            case 'well': 
                let wellProps = self.getWellProps(); 
                if(wellProps && model.id == wellProps.idWell) {
                    console.log('updating log track', self);
                    self.update();
                }
                break;

            default:
                break;
        }
    }

    this.onModifiedCurve = function(curve){
        console.log('wi-d3-log-track onModifiedCurve', curve.idCurve);
        let hasCurve = self.viTrack.getCurves().find(c => c.idCurve == curve.idCurve);
        if (hasCurve) {
            if (curve.data) {
                hasCurve.setProperties({
                    rawData: curve.data.map((r, i) => {
                        return {
                            y: i,
                            x: r
                        }
                    })
                })
            } else {
                delete hasCurve.rawData;
            }
            self.update();
        }
    }

    this.mouseOverHandler = function() {
        wiD3AbstractTrack.prototype.mouseOverHandler.call(self);
        let dragMan = wiComponentService.getComponent(wiComponentService.DRAG_MAN);
        if (!dragMan.dragging) return;
        dragMan.wiD3Ctrl = self.wiD3Ctrl;
        // dragMan.track = self.viTrack;
        dragMan.track = self;
    }

    this.mouseLeaveHandler = function() {
        wiD3AbstractTrack.prototype.mouseLeaveHandler.call(self);
        let dragMan = wiComponentService.getComponent(wiComponentService.DRAG_MAN);
        if (!dragMan.dragging) return;
        dragMan.wiD3Ctrl = null;
        dragMan.track = null;
    }

    this.onReady = function () {
        self.viTrack = _createVisualizeLogTrack( self.getProperties() );
        self.registerTrackCallback();
        self.registerTrackHorizontalResizerDragCallback();
        self.viTrack.on('keydown', self.onTrackKeyPressCallback);
        self.registerTrackMouseEventHandlers();
        self.getProperties().controller = self;
        _registerLogTrackCallback(self.viTrack);
        if (self.wiD3Ctrl) self.wiD3Ctrl.registerTrackDragCallback(self);
        
        wiComponentService.on(wiComponentService.DELETE_MODEL, self.onDelete);
        wiComponentService.on(wiComponentService.MODIFIED_CURVE_DATA, self.onModifiedCurve);

        update(function () {
            self.viTrack.setCurrentDrawing(null);
        });
        
        $timeout(function() {
            if (self.wiD3Ctrl && self.wiD3Ctrl.containerName) {
                let well = Utils.findWellByLogplot(self.getProperties().idPlot);
                let combinedPlotD3Ctrl = wiComponentService.getComponent(self.wiD3Ctrl.containerName + 'D3Area');
                combinedPlotD3Ctrl.selections.forEach(function(selectionConfig) {
                    selectionConfig.wellForLogplot = well;
                    self.addViSelectionToTrack(self.viTrack, selectionConfig);
                })
            }
            wiComponentService.on('update-logtrack-' + self.getProperties().idTrack, function() {
               self.update();   
            });
        });
    }

    function _createVisualizeLogTrack(logTrack) {
        console.log('pushLogTrack:', logTrack);
        let config = {
            id: logTrack.idTrack,
            idPlot: logTrack.idPlot,
            orderNum: logTrack.orderNum,
            name: logTrack.title,
            
            // TO BE REMOVED
            // yStep: parseFloat(_getWellProps().step),
            // offsetY: parseFloat(_getWellProps().topDepth),

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
            displayType: logTrack.displayType,
        };
        let track = graph.createLogTrack(config, document.getElementById(self.plotAreaId), wiApiService);

        return track;
    }

    function _registerLogTrackCallback(track) {
        let dragMan = wiComponentService.getComponent(wiComponentService.DRAG_MAN);
        /*
        track.onPlotMouseOver(function () {
            if (!dragMan.dragging) return;
            dragMan.wiD3Ctrl = self;
            dragMan.track = track;
        });
        track.onPlotMouseLeave(function () {
            //self.wiD3Ctrl._removeTooltip(track);
            self.removeTooltip();
            if (!dragMan.dragging) return;
            dragMan.wiD3Ctrl = null;
            dragMan.track = null;
        });
        */
        // track.onPlotMouseWheel(function () {
        //     _onPlotMouseWheelCallback();
        // });
        track.onPlotMouseDown(function () {
            _onPlotMouseDownCallback(track);
        });
        track.onPlotClick(function() {
            _onPlotClickCallback(track);
        })
        track.onHeaderMouseDown(function () {
            _onHeaderMouseDownCallback(track);
        });
        track.onPlotDoubleClick(function () {
            _onPlotDoubleClickCallback(track);
        });
        self.wiD3Ctrl && track.onCurveDrag(self.getProperties(), function (desTrackComponent) {
            let currentCurve = track.getCurrentCurve();
            let curve = currentCurve.getProperties();
            let errorCode = desTrackComponent.controller.verifyDroppedIdCurve(curve.idCurve);
            if (errorCode > 0) {
                curve.idTrack = desTrackComponent.idTrack;
                wiApiService.editLine(curve, function (res) {
                    self.update();
                    desTrackComponent.controller.update();
                });
            } else {
                toastr.error("cannot drop curve from another well to this track");
            }
        });
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
                // _curveOnRightClick();
                self.currentDrawingRightClicked = 'curve';
            } else if (d3.event.currentDrawing.isShading()) {
                // _shadingOnRightClick();
                self.currentDrawingRightClicked = 'shading';
            } else if (d3.event.currentDrawing.isAnnotation()) {
                // _annotationOnRightClick();
                self.currentDrawingRightClicked = 'annotation';
            } else if (d3.event.currentDrawing.isMarker()) {
                // _markerOnRightClick();
                self.currentDrawingRightClicked = 'marker';
            }
        }
    }

    function _onPlotClickCallback(track) {
        if (d3.event.currentDrawing) {
            if (d3.event.currentDrawing.isCurve()) {
                let props = d3.event.currentDrawing.getProperties();
                wiComponentService.emit('update-properties', {
                    type: 'line',
                    props: props
                });
            } else if (d3.event.currentDrawing.isShading()) {
                let props = d3.event.currentDrawing.getProperties();
                props.leftCurve = d3.event.currentDrawing.leftCurve ? d3.event.currentDrawing.leftCurve.alias : null;
                props.rightCurve = d3.event.currentDrawing.rightCurve.alias;
                wiComponentService.emit('update-properties', {
                    type: 'shading',
                    props: props
                });
            } else if (d3.event.currentDrawing.isAnnotation()) {
                console.log("ann//");
            } else if (d3.event.currentDrawing.isMarker()) {
                console.log("marker//");
            }
        }
        d3.event.stopPropagation();
    }
    function _onHeaderMouseDownCallback(track) {
        track.setCurrentDrawing(null);
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

    function _markerOnDoubleClick() {
        _markerProperties();
        d3.event.stopPropagation();
    }

    function _getMarkerContextMenu() {
        let marker = self.viTrack.getCurrentMarker();
        return [
            {
                name: "MarkerProperties",
                label: "Marker Properties",
                icon: "marker-properties-16x16",
                handler: function () {
                    _markerProperties(marker);
                }
            }, {
                name: "RemoveMarker",
                label: "Remove Marker",
                icon: "marker-delete-16x16",
                handler: function () {
                    // send api to remove marker
                    wiApiService.removeMarker(marker.id, function () {
                        self.viTrack.removeMarker(marker);
                    })
                }
            }
        ];
    }

    function _markerProperties(marker) {
        if (!marker) {
            marker = self.viTrack.getCurrentMarker();
            console.log(self.viTrack.getCurrentMarker());
        }
        DialogUtils.markerPropertiesDialog(ModalService, marker.getProperties(), function (props) {
            wiApiService.editMarker(props, function () {
                marker.setProperties(props);
                marker.doPlot(true);
            })
        })
    }

    function _annotationOnDoubleClick() {
        _annotationProperties();
        d3.event.stopPropagation();
    }

    function _getAnnotationContextMenu() {
        let anno = self.viTrack.getCurrentDrawing();
        return [
            {
                name: "AnnotationProperties",
                label: "Annotation Properties",
                icon: "annotation-16x16-edit",
                handler: function () {
                    _annotationProperties(anno);
                }
            }, {
                name: "RemoveAnnotation",
                label: "Remove Annotation",
                icon: "annotation-delete-16x16",
                handler: function () {
                    wiApiService.removeAnnotation(anno.idAnnotation, function () {
                        self.viTrack.removeDrawing(anno);
                    })
                }
            }
        ];
        /*
        let anno = self.viTrack.getCurrentDrawing();
        self.setContextMenu([
            {
                name: "AnnotationProperties",
                label: "Annotation Properties",
                icon: "annotation-16x16-edit",
                handler: function () {
                    _annotationProperties(anno);
                }
            }, {
                name: "RemoveAnnotation",
                label: "Remove Annotation",
                icon: "annotation-delete-16x16",
                handler: function () {
                    wiApiService.removeAnnotation(anno.idAnnotation, function () {
                        self.viTrack.removeDrawing(anno);
                    })
                }
            }
        ]);
        */
    }

    function _annotationProperties(anno) {
        if (!anno) anno = self.viTrack.getCurrentDrawing();
        console.log(anno);
        DialogUtils.annotationPropertiesDialog(ModalService, anno.getProperties(), function (annotationConfig) {
            annotationConfig.idTrack = self.viTrack.id;
            wiApiService.editAnnotation(annotationConfig, function () {
                anno.setProperties(annotationConfig);
                anno.doPlot(true);
            })
        })
    }

    function _getCurveContextMenu() {
        let currentCurve = self.viTrack.getCurrentCurve();
        return [{
            name: "CurveProperties",
            label: "Curve Properties",
            icon: "curve-properties-16x16",
            handler: function () {
                DialogUtils.curvePropertiesDialog(
                    ModalService,
                    // wiComponentService,
                    // wiApiService,
                    // DialogUtils,
                    // currentCurve,
                    self.getProperties(),
                    //self.wiLogplotCtrl,
                    function() {
                        self.viTrack.updateScaleInfo({
                            leftVal:currentCurve.minX,
                            rightVal:currentCurve.maxX,
                            scale: currentCurve.scale
                        });
                        self.viTrack.updateAxis();
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
                    let idLine = self.viTrack.getCurrentCurve().id;
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
                icon: 'curve-interactive-baseline-edit-16x16',
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
            }
        ]
        /*
        //let posX = d3.event.clientX, posY = d3.event.clientY;
        //console.log('-------------');

        if (!self.viTrack.getCurrentCurve) {
            return;
        }

        let currentCurve = self.viTrack.getCurrentCurve();
        self.setContextMenu([{
            name: "CurveProperties",
            label: "Curve Properties",
            icon: "curve-properties-16x16",
            handler: function () {
                DialogUtils.curvePropertiesDialog(
                    ModalService,
                    // wiComponentService,
                    // wiApiService,
                    // DialogUtils,
                    // currentCurve,
                    self.getProperties(),
                    // self.wiLogplotCtrl,
                    function() {
                        self.viTrack.updateScaleInfo({
                            leftVal:currentCurve.minX,
                            rightVal:currentCurve.maxX,
                            scale: currentCurve.scale
                        });
                        self.viTrack.updateAxis();
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
                    let idLine = self.viTrack.getCurrentCurve().id;
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
                icon: 'curve-interactive-baseline-edit-16x16',
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
            }
        ]);
        */
    }

    function _curveOnDoubleClick() {
        DialogUtils.curvePropertiesDialog(
            ModalService,
            // wiComponentService,
            // wiApiService,
            // DialogUtils,
            // currentCurve,
            self.getProperties(),
            //self.wiLogplotCtrl,
            function() {
                self.viTrack.updateScaleInfo({
                    leftVal:currentCurve.minX,
                    rightVal:currentCurve.maxX,
                    scale: currentCurve.scale
                });
                self.viTrack.updateAxis();
            }
        );

        // Prevent track properties dialog from opening
        d3.event.stopPropagation();
    }

    function _getShadingContextMenu() {
        return [{
            name: "ShadingProperties",
            label: "Shading Properties",
            icon: "shading-properties-16x16",
            handler: function () {
                _shadingProperties();
            }
        }, {
            name: "RemoveShading",
            label: "Remove Shading",
            icon: "shading-delete-16x16",
            handler: function () {
                let currentShading = self.viTrack.getCurrentShading();
                wiApiService.removeShading(currentShading.id, self.removeCurrentShading);
            }
        }];
        /*
        //let posX = d3.event.clientX, posY = d3.event.clientY;
        self.setContextMenu([{
            name: "ShadingProperties",
            label: "Shading Properties",
            icon: "shading-properties-16x16",
            handler: function () {
                _shadingProperties();
            }
        }, {
            name: "RemoveShading",
            label: "Remove Shading",
            icon: "shading-delete-16x16",
            handler: function () {
                let currentShading = self.viTrack.getCurrentShading();
                wiApiService.removeShading(currentShading.id, self.removeCurrentShading);
            }
        }]);
        */
    }

    function _shadingOnDoubleClick() {
        _shadingProperties();
        // Prevent track properties dialog from opening
        d3.event.stopPropagation();
    }

    function _shadingProperties () {
        _openShadingAttributeDialog();
    };

    function _registerShadingHeaderMouseDownCallback(track, shading) {
        if(!shading) return;
        track.setCurrentDrawing(shading);
        track.onShadingHeaderMouseDown(shading, function () {
            if (d3.event.button == 2) {
                // _shadingOnRightClick();
                self.currentDrawingRightClicked = 'shading';
            }
        });
        shading.header.on('dblclick', function () {
            // Mousedown already set the shading to be current shading
            _shadingOnDoubleClick();
        });
    }

    this.$onDestroy = function(){
        wiComponentService.removeEvent(wiComponentService.DELETE_MODEL, self.onDelete);
    }
}


let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: '../wi-d3-track-template.html',
    controller: Controller,
    controllerAs: componentAlias,
    transclude: true,
    bindings: {
        name: '@',
        wiD3Ctrl: '<',
        properties: "<",
        minY: '<',
        maxY: '<',
        zoneset: '<'      
    }
});
exports.name = moduleName;
