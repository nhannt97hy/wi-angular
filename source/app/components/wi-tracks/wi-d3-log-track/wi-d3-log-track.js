const componentName = 'wiD3LogTrack';
const moduleName = 'wi-d3-log-track';
const componentAlias = 'wiD3Track';

function Controller ($scope, wiComponentService, wiApiService, ModalService, $timeout) {
    let self = this;
    let Utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let graph = wiComponentService.getComponent(wiComponentService.GRAPH);
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let props = null;
    let _currentTrack = {};
    let logplotHandlers = {};

    this.showContextMenu = function (event) {
        _currentTrack = self.wiD3Ctrl.getCurrentTrack();
        switch(self.currentDrawingRightClicked) {
            case 'curve':
                _curveOnRightClick();
                break;
            case 'marker':
                _markerOnRightClick();
                break;
            case 'annotation':
                _annotationOnRightClick();
                break;
            case 'shading':
                _shadingOnRightClick();
                break;
            default:
                let items = self.wiD3Ctrl.getCommonContextMenuItems();
                items.trackProperties.push({
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
                });

                let trackItemsCreationArray = [{
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
                    }];
                items.trackItemsCreation = items.trackItemsCreation.concat(trackItemsCreationArray);
                items.trackHandle.unshift({
                    name: "DuplicateTrack",
                    label: "Duplicate Track",
                    icon: 'track-duplicate-16x16',
                    handler: function () {
                        logplotHandlers.DuplicateTrackButtonClicked();
                    }
                });
                items.trackHandle = items.trackHandle.concat([{
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
                }]);

                self.setContextMenu(self.wiD3Ctrl.buildContextMenu(items));
        }
        self.currentDrawingRightClicked = null;
    }
    this.setContextMenu = function (ctxMenu) {
        self.wiD3Ctrl.setContextMenu(ctxMenu);
    }
    this.openPropertiesDialog = function () {
        _currentTrack = self.wiD3Ctrl.getCurrentTrack();
        DialogUtils.logTrackPropertiesDialog(ModalService, _currentTrack, self.wiLogplotCtrl, wiApiService, function (props) {
            if (props) {
                console.log('logTrackPropertiesData', props);
            }
        }, {
            tabs: ['true', 'true', 'true']
        });
    }
    this.update = function () {
        let viTrack = this.viTrack;
        if (!viTrack.isLogTrack()) return;

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
                        // _addShadingToTrack(shading);
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
    this.depthShiftDialog = function () {
        _currentTrack = self.wiD3Ctrl.getCurrentTrack();
        let curve = _currentTrack.getCurrentCurve();
        if(!curve){
            DialogUtils.errorMessageDialog(ModalService, 'Please select a curve for depth shift!');
        }else{
            let well = Utils.findWellByLogplot(self.wiD3Ctrl.wiLogplotCtrl.id);
            DialogUtils.depthShiftDialog(ModalService, well, curve);
        }
    }

    this.addMarker = function () {
        _currentTrack = self.wiD3Ctrl.getCurrentTrack();
        if (_currentTrack && _currentTrack.addMarker && _currentTrack.setMode) {
            _currentTrack.setMode('AddMarker');
        }
    }
    this.addMarkerToTrack = function (track, config) {
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
    this.addAnnotation = function () {
        _currentTrack = self.wiD3Ctrl.getCurrentTrack();
        if (!_currentTrack.isLogTrack()) return;
        let [topDepth, bottomDepth] = self.wiD3Ctrl.getDepthRangeFromSlidingBar();
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
                self.currentDrawingRightClicked = 'annotation';
                // _annotationOnRightClick();
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
    this.addCurveToTrack = function (track, data, config) {
        if (!track || !track.addCurve) return;
        let curve = track.addCurve(data, config);

        let depthRange = self.wiD3Ctrl.getDepthRangeFromSlidingBar();
        self.wiD3Ctrl.setDepthRangeForTrack(track, depthRange);
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
        _currentTrack = self.wiD3Ctrl.getCurrentTrack();
        if (!_currentTrack.getCurrentShading) return;
        self.removeShadingFromTrack(_currentTrack, _currentTrack.getCurrentShading());
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
        _currentTrack = self.wiD3Ctrl.getCurrentTrack();
        if (!_currentTrack.getCurrentCurve) return;
        self.removeCurveFromTrack(_currentTrack, _currentTrack.getCurrentCurve());
    }
    this.createShadingForSelectedCurve = function () {
        _currentTrack = self.wiD3Ctrl.getCurrentTrack();

        let curve1 = _currentTrack.getCurrentCurve();
        let curve2 = _currentTrack.getTmpCurve();
        if (!curve1) return;
        var config = {
            isNegPosFill: false,
            fill: {
                display: true,
                shadingType: 'pattern',
                pattern: {
                    name: "none",
                    foreground: "black",
                    background: "blue"
                }
            },
            positiveFill: {
                display: false,
                shadingType: 'pattern',
                pattern: {
                    name: "none",
                    foreground: "black",
                    background: "blue"
                }
            },
            negativeFill: {
                display: false,
                shadingType: 'pattern',
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
            idControlCurve: curve2 ? curve2.idCurve : curve1.idCurve
        }
        wiApiService.createShading(shadingObj, function (shading) {
            let shadingModel = Utils.shadingToTreeConfig(shading);
            if (!curve2) {
                self.addCustomShadingToTrack(_currentTrack, curve1, shadingModel.data.leftX, shadingModel.data);
            }
            else {
                self.addPairShadingToTrack(_currentTrack, curve1, curve2, shadingModel.data);
            }
            openShadingAttributeDialog();
        })
    }
    function openShadingAttributeDialog () {
        let currentShading = _currentTrack.getCurrentShading();
        let shadingOptions = currentShading.getProperties();
        let well = Utils.findWellByLogplot(self.wiLogplotCtrl.id) || {};
        DialogUtils.shadingAttributeDialog(ModalService, wiApiService, function(options) {
            let leftLineBk = options.leftLine;
            options.leftLine = null;
            let rightLineBk = options.rightLine;
            options.rightLine = null;

            let request = angular.copy(options);

            request.leftLine = leftLineBk;
            request.rightLine = rightLineBk;
            options.leftLine = leftLineBk;
            options.rightLine = rightLineBk;

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
            options.rightCurve = options.rightLine;
            options.leftCurve = options.leftLine;
            delete options.rightLine;
            delete options.leftLine;

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
    };

    this.createCrossplot = function () {
        _currentTrack = self.wiD3Ctrl.getCurrentTrack();
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
        _currentTrack = self.wiD3Ctrl.getCurrentTrack();
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

    this.$onInit = function () {
        this.plotAreaId = self.name + 'PlotArea';
        _currentTrack = self.wiD3Ctrl.getCurrentTrack();
        this.wiLogplotCtrl = self.wiD3Ctrl.wiLogplotCtrl;
        logplotHandlers = self.wiD3Ctrl.getLogplotHandler();
    }
    this.onReady = function () {
        self.viTrack = createVisualizeLogTrack(getProperties());
        self.wiD3Ctrl.subscribeTrackCtrlWithD3Ctrl(self);

        Utils.listenEvent('curve-deleted', function (eventData) {
            console.log('curve deleted event: ', eventData);
            let hasCurve = self.viTrack.getCurves().find(function(curve) { return curve.idCurve == eventData.properties.idCurve;});
            if(hasCurve) {
                console.log('updating log track', self.viTrack);
                self.update();
            }
        })
        _registerLogTrackCallback(self.viTrack);
    }

    function createVisualizeLogTrack(logTrack) {
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

        return track;
    }
    function getProperties() {
        if(!props) {
            props = self.wiD3Ctrl.trackComponents.find(function(track) { return track.name == self.name}).props;
        }
        return props;
    }
    function _getWellProps() {
        return self.wiD3Ctrl.getWellProps();
    }
    function _registerLogTrackCallback(track) {
        let dragMan = wiComponentService.getComponent(wiComponentService.DRAG_MAN);
        track.onPlotMouseOver(function () {
            if (!dragMan.dragging) return;
            dragMan.wiD3Ctrl = self;
            dragMan.track = track;
        });
        track.onPlotMouseLeave(function () {
            self.wiD3Ctrl._removeTooltip(track);
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
            self.wiD3Ctrl._drawTooltip(track);
        });
        track.onCurveDrag(function (desTrack) {
            let currentCurve = track.getCurrentCurve();
            let curve = currentCurve.getProperties();
            curve.idTrack = desTrack.id;
            wiApiService.editLine(curve, function (res) {
                self.wiD3Ctrl.updateTrack(track);
                self.wiD3Ctrl.updateTrack(desTrack);
            });
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
        markerProperties();
        d3.event.stopPropagation();
    }
    function _markerOnRightClick() {
        _currentTrack = self.wiD3Ctrl.getCurrentTrack();
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
    function markerProperties(marker) {
        _currentTrack = self.wiD3Ctrl.getCurrentTrack();
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
    function _annotationOnDoubleClick() {
        annotationProperties();
        d3.event.stopPropagation();
    }
    function _annotationOnRightClick() {
        _currentTrack = self.wiD3Ctrl.getCurrentTrack();
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
    function annotationProperties(anno) {
        _currentTrack = self.wiD3Ctrl.getCurrentTrack();
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
    function _curveOnRightClick() {
        _currentTrack = self.wiD3Ctrl.getCurrentTrack();
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
    }
    function _curveOnDoubleClick() {
        _currentTrack = self.wiD3Ctrl.getCurrentTrack();
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
    function _shadingOnRightClick() {
        _currentTrack = self.wiD3Ctrl.getCurrentTrack();
        //let posX = d3.event.clientX, posY = d3.event.clientY;
        self.setContextMenu([{
            name: "ShadingProperties",
            label: "Shading Properties",
            icon: "shading-properties-16x16",
            handler: function () {
                shadingProperties();
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
    function _shadingOnDoubleClick() {
        shadingProperties();
        // Prevent track properties dialog from opening
        d3.event.stopPropagation();
    }
    function shadingProperties () {
        _currentTrack = self.wiD3Ctrl.getCurrentTrack();
        openShadingAttributeDialog();
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

}


let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: '../wi-d3-track-template.html',
    controller: Controller,
    controllerAs: componentAlias,
    transclude: true,
    bindings: {
        name: '@',
        wiD3Ctrl: '<'
    }
});
exports.name = moduleName;
