const componentName = 'wiD3';
const moduleName = 'wi-d3';

function Controller($scope, wiComponentService, $timeout, ModalService, wiApiService, $compile) {
    let self = this;
    let graph = wiComponentService.getComponent(wiComponentService.GRAPH);
    let Utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let LayoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
    let logplotHandlers = {};

    /* private variables */
    const contextMenu_constantItems = {
        separator: [{
                separator: '1'
            }],
        trackProperties: [{
                name: "TrackProperties",
                label: "Track Properties",
                icon: 'track-properties-16x16',
                handler: openTrackPropertiesDialog
            }],
        trackCreation : [{
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
            }],
        trackHandle : [{
                name: "DeleteTrack",
                label: "Delete Track",
                icon: 'track-delete-16x16',
                handler: function () {
                    logplotHandlers.DeleteTrackButtonClicked();
                }
            }],
        trackItemsCreation: []
    }

    let _referenceLine = true;
    let _fitWindow = false;
    let _depthRange = [0, 100000];
    var commonCtxMenu = null;
    let _tracks = [];
    let _currentTrack = null;
    let _previousTrack = null;
    let _tooltip = true;
    /* public variables */
    this.compileFunc = $compile;
    this.scopeObj = $scope;
    this.trackComponents = [];

    /* public method */
    this.buildContextMenu = function (contextMenuItems) {
        let contextMenu = [];
        if(contextMenuItems.trackProperties.length) {
            contextMenu = contextMenu.concat(contextMenuItems.trackProperties);
        }
        if(contextMenuItems.trackCreation.length) {
            contextMenu = contextMenu.concat(contextMenuItems.separator);
            contextMenu = contextMenu.concat(contextMenuItems.trackCreation);
        }
        if(contextMenuItems.trackItemsCreation.length) {
            contextMenu = contextMenu.concat(contextMenuItems.separator);
            contextMenu = contextMenu.concat(contextMenuItems.trackItemsCreation);
        }
        if(contextMenuItems.trackHandle.length) {
            contextMenu = contextMenu.concat(contextMenuItems.separator);
            contextMenu = contextMenu.concat(contextMenuItems.trackHandle);
        }
        return contextMenu;
    }
    this.getCommonContextMenuItems = function () {
        let obj = {};
        for (let attr in contextMenu_constantItems) {
            obj[attr] = contextMenu_constantItems[attr].slice();
        }
        return obj;
    }
    this.subscribeTrackCtrlWithD3Ctrl = function (trackComponentCtrl) {
        d3.select(trackComponentCtrl.viTrack.root.node().parentNode)
            .datum(trackComponentCtrl.viTrack.orderNum)
            .attr('class', 'wi-d3-track-component')
            .attr('data-order-num', function(d) { return d;});
        this.trackComponents.find(function(trackComponent) {
            return trackComponent.name == trackComponentCtrl.name;
        }).controller = trackComponentCtrl;
        _tracks.push(trackComponentCtrl.viTrack);
        _tracks.sort(function (track1, track2) {
            return track1.orderNum.localeCompare(track2.orderNum);
        });

        let depthRange = self.getDepthRangeFromSlidingBar();
        self.setDepthRangeForTrack(trackComponentCtrl.viTrack, depthRange);
        _registerTrackHorizontalResizerDragCallback();
        _registerTrackCallback(trackComponentCtrl.viTrack);
        _registerTrackDragCallback(trackComponentCtrl.viTrack);
        _setCurrentTrack(trackComponentCtrl.viTrack);

        trackComponentCtrl.viTrack.on('keydown', function () {
            _onTrackKeyPressCallback(trackComponentCtrl.viTrack);
        })
        graph.rearrangeTracks(self);
        self.updateScale();
        updateSlider();
    }
    this.tooltip = function (on) {
        if (on === undefined) return _tooltip;
        _tooltip = on;
    }
    this.referenceLine = function(on) {
        if (on === undefined) return _referenceLine;
        _referenceLine = on;
    }
    this.fitWindow = function(on) {
        if (on === undefined) return _fitWindow;
        _fitWindow = on;
    }
    this.toggleTooltip = function() {
        _tooltip = !_tooltip;
    }
    this.toggleReferenceLine = function() {
        _referenceLine = !_referenceLine;
    }
    let originalWidths = [];
    this.toggleFitWindow = function() {
        _fitWindow = !_fitWindow;
        let logplotElem = $('wi-logplot#' + self.wiLogplotCtrl.id + '>.logplot-header');
        let slidingBarElem = $('wi-logplot#' + self.wiLogplotCtrl.id + '>.logplot-main-content>.slidingbar')
        let plotAreaWidth = logplotElem.width() - slidingBarElem.width()/2 - slidingBarElem.outerWidth()/2;
        console.log("width", _tracks);
        let sumOfOriWidth = 0;
        let widths = [];
        // let fitWindowWidths = [];
        _tracks.forEach(function(t) {
            widths.push(t.width);
            sumOfOriWidth += t.width;
        });
        let ratioWidth = plotAreaWidth/sumOfOriWidth;
        _tracks.forEach(function(t, index) {
            if(_fitWindow) {
                t.width = widths[index] * ratioWidth;
                originalWidths.push(widths[index]);
            }
            else {
                // t.width = originalWidths[index];
                if (t.isLogTrack()) {
                    wiApiService.infoTrack(t.id, function (logTrack) {
                        $timeout(function() {
                            t.width = Utils.inchToPixel(logTrack.width);
                            t.doPlot();
                        })
                    });
                }
                if (t.isDepthTrack()) {
                    wiApiService.infoDepthTrack(t.id, function (depthTrack) {
                        $timeout(function() {
                            t.width = Utils.inchToPixel(depthTrack.width);
                            t.doPlot();
                        })
                    });
                }
                if (t.isZoneTrack()) {
                    wiApiService.getZoneTrack(t.id, function (zoneTrack) {
                        $timeout(function() {
                            t.width = Utils.inchToPixel(zoneTrack.width);
                            t.doPlot();
                        })
                    });
                }
                if (t.isImageTrack()) {
                    wiApiService.getImageTrack(t.id, function (zoneTrack) {
                        $timeout(function() {
                            t.width = Utils.inchToPixel(zoneTrack.width);
                            t.doPlot();
                        })
                    });
                }
                if (t.isObjectTrack()) {
                    wiApiService.getObjectTrack(t.id, function (objectTrack) {
                        $timeout(function() {
                            t.width = Utils.inchToPixel(objectTrack.width);
                            t.doPlot();
                        })
                    });
                }
            }
            t.doPlot();
        })
    }
    this.pushTrackComponent = function(trackProperties) {
        let html = generateHtml(trackProperties);
        let trackName = getTrackName(trackProperties);
        this.trackComponents.push({
            name: trackName,
            props: trackProperties,
        });
        $('#' + self.plotAreaId).append(
            self.compileFunc(html)(self.scopeObj)
        );
        // return self.trackComponents.find(function(component) { return component.name == trackName});
    }
    this.showContextMenu = function (event) {
        console.log('contextMenu is opened');
        if (event.button != 2) return;
        if(!self.contextMenu) {
            commonCtxMenu = commonCtxMenu || self.buildContextMenu(contextMenu_constantItems);
            self.contextMenu = commonCtxMenu;
        }
        event.stopPropagation();
        wiComponentService.getComponent('ContextMenu')
            .open(event.clientX, event.clientY, self.contextMenu, function () {
                self.contextMenu = commonCtxMenu;
            });
    }
    this.getMaxDepth = function () {
        let wellProps = self.getWellProps();
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
        let wellProps = self.getWellProps();
        return parseFloat(wellProps.topDepth) || 0;
    }

    this.getDepthRange = function () {
        return _depthRange.map(function (d) {
            return Math.round(d * 10000) / 10000;
        });
    }
    this.getDepthRangeRaw = function () {
        return _depthRange;
    }
    this.getDepthRangeFromSlidingBar = function () {
        let slidingBar = wiComponentService.getSlidingBarForD3Area(self.name);
        let maxDepth = self.getMaxDepth();
        let minDepth = self.getMinDepth();
        let low = minDepth + slidingBar.slidingBarState.top * (maxDepth - minDepth) / 100;
        let high = low + (slidingBar.slidingBarState.range) * (maxDepth - minDepth) / 100;
        return [low, high];
    }
    this.getWellProps = _getWellProps;
    this.getLogplotHandler = function () {
        return logplotHandlers;
    }
    this.getOrderKey = getOrderKey;
    this.setContextMenu = function (ctxMenu) {
        if(!ctxMenu) {
            self.contextMenu = commonCtxMenu;
        }
        self.contextMenu = ctxMenu;
    }

    this.shouldShowSlider = function() {
        return self.contentWidth > self.sliderWidth + 45;
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
    this._removeTooltip = _removeTooltip;
    this._drawTooltip = _drawTooltip;
    this.toggleTooltip = function() {
        _tooltip = !_tooltip;
    }
    this.verifyDroppedIdCurve = function (idCurve) {
        let well1 = self.getWellProps();
        let well2 = Utils.findWellByCurve(idCurve) || {properties: {}};
        if (!well1.idWell || !well2.properties.idWell) return -1;
        if (well1.idWell && well2.properties.idWell && (well1.idWell == well2.properties.idWell)) return 1;
        return 0;
    }
    this.verifyDroppedIdCurveOnTrack = function (idCurve, track) {
        let curveWell = Utils.findWellByCurve(idCurve) || {properties: {}};
        let trackWell = {properties: {}};
        if(track.isLogTrack() && track.drawings.length) {
            let curveOnTrack = track.drawings[0];
            trackWell = Utils.findWellByCurve(curveOnTrack.idCurve);
        }
        if(curveWell.properties.idWell && track.isLogTrack() && !track.drawings.length) return 1;
        if(!curveWell.properties.idWell || !trackWell.properties.idWell) return -1;
        if(curveWell.properties.idWell && trackWell.properties.idWell && (curveWell.properties.idWell == trackWell.properties.idWell)) return 1;
        return 0;
    }
    this.depthShiftDialog = function () {
        if(!_currentTrack.isLogTrack()) {
            DialogUtils.errorMessageDialog(ModalService, 'This track is not a Log track. Please select a log track and try again.');
            return;
        }
        let trackComponentCtrl = getComponentCtrlByViTrack(_currentTrack);
        trackComponentCtrl.depthShiftDialog();
    }


    /* handle context menu */
    this.addDepthTrack = function (callback) {
        var trackOrder = getOrderKey();
        if (trackOrder) {
            wiApiService.createDepthTrack({
                idPlot: self.wiLogplotCtrl.id,
                orderNum: trackOrder,
                width: 0.65
            }, function (depthTrack) {
                self.pushDepthTrack(depthTrack);
                $timeout(callback);
            });
        }
        else {
            Utils.error('can not create depth track');
        }
    }
    this.addLogTrack = function (trackTitle, idCurve, onFinished) {
        var trackOrder = getOrderKey();
        if (trackOrder) {
            const logTracks = self.getTracks().filter(track => track.type == 'log-track');
            let createdLogTrack;
            let logTrack;
            async.series([
                function (callback) {
                    wiApiService.createLogTrack(self.wiLogplotCtrl.id, trackOrder, function (ret) {
                        console.log('created log track: ', ret);
                        createdLogTrack = ret;
                        callback();
                    });
                }, function (callback) {
                    wiApiService.infoTrack(createdLogTrack.idTrack, function(logtrack) {
                        console.log('info track: ', logtrack);
                        logTrack = logtrack;
                        callback();
                    });
                }, function (callback) {
                    let title = trackTitle || 'Track ' + (logTracks.length + 1);
                    logTrack.title = title;
                    wiApiService.editTrack(logTrack, function (logtrack) {
                        if(!logtrack) return;
                        console.log('track edited: ', logtrack);
                        logTrack = logtrack;
                        callback();
                    });
                }, function (callback) {
                    self.pushLogTrack(logTrack);
                    callback();
                }, function (callback) {
                    $timeout(function() {
                        if (idCurve && !isNaN(idCurve)) {
                            let LogtrackController = self.trackComponents.find(function (component) { return component.props == logTrack; }).controller;
                            let newViTrack = LogtrackController.viTrack;
                            wiApiService.createLine({
                                idTrack: newViTrack.id,
                                idCurve: idCurve,
                                orderNum: newViTrack.getCurveOrderKey()
                            }, function (line) {
                                let lineModel = Utils.lineToTreeConfig(line);
                                Utils.getCurveData(wiApiService, idCurve, function (err, data) {
                                    if (!err) LogtrackController.addCurveToTrack(newViTrack, data, lineModel.data);
                                });
                                console.log('created Line', line);
                                callback();
                            });
                        } else callback();
                    })
                }
            ], function (err, results) {
                if (!err && typeof onFinished === 'function') onFinished();
            });
        }
        else {
            error('Cannot add Log track');
        }
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
                parameterSet: null,
                zoomFactor: 1.0
            }
            DialogUtils.zoneTrackPropertiesDialog(ModalService, self.wiLogplotCtrl, defaultZoneTrackProp, function (zoneTrackProperties) {
                let dataRequest = {
                    idPlot: self.wiLogplotCtrl.id,
                    title: zoneTrackProperties.title,
                    showTitle: zoneTrackProperties.isShowTitle,
                    topJustification: zoneTrackProperties.topJustification,
                    bottomJustification: zoneTrackProperties.bottomJustification,
                    color: zoneTrackProperties.color,
                    width: zoneTrackProperties.width,
                    idZoneSet: zoneTrackProperties.idZoneSet,
                    orderNum: trackOrder,
                    zoomFactor: zoneTrackProperties.zoomFactor
                }
                wiApiService.createZoneTrack(dataRequest, function (returnZoneTrack) {
                    let zoneTrack = dataRequest;
                    zoneTrack.idZoneTrack = returnZoneTrack.idZoneTrack;
                    // wiApiService.getZoneSet(zoneTrack.idZoneSet, function (zoneset) {
                    //     let viTrack = self.pushZoneTrack(zoneTrack);
                    //     for (let zone of zoneset.zones) {
                    //         self.addZoneToTrack(viTrack, zone);
                    //     }
                    // })

                    self.pushZoneTrack(zoneTrack);
                })
            })
        }
        else {
            error('Cannot create zone track');
        }
    }
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
                width: Utils.inchToPixel(1),
                zoomFactor: 1.0
            }
            DialogUtils.imageTrackPropertiesDialog(ModalService, self.wiLogplotCtrl, defaultImageTrackProp, function (imageTrackProperties) {
                let dataRequest = {
                    idPlot: self.wiLogplotCtrl.id,
                    title: imageTrackProperties.title,
                    showTitle: imageTrackProperties.showTitle,
                    topJustification: imageTrackProperties.topJustification,
                    bottomJustification: imageTrackProperties.bottomJustification,
                    background: imageTrackProperties.background,
                    width: imageTrackProperties.width,
                    orderNum: trackOrder,
                    zoomFactor: imageTrackProperties.zoomFactor
                }
                wiApiService.createImageTrack(dataRequest, function (returnImageTrack) {
                    self.pushImageTrack(returnImageTrack);
                })
            })
        } else {
            console.error('add new image track error!');
        }
    }
    this.addObjectTrack = function (callback) {
        let trackOrder = getOrderKey();
        if (trackOrder) {
            const objectTracks = self.getTracks().filter(track => track.type == 'object-track');
            const defaultObjectTrackProp = {
                showTitle: true,
                title: "Object Track " + (objectTracks.length + 1),
                topJustification: "center",
                width: Utils.inchToPixel(2.5),
                zoomFactor: 1.0
            }
            DialogUtils.objectTrackPropertiesDialog(ModalService, self.wiLogplotCtrl, defaultObjectTrackProp, function (objectTrackProp) {
                let dataRequest = {
                    idPlot: self.wiLogplotCtrl.id,
                    title: objectTrackProp.title,
                    showTitle: objectTrackProp.showTitle,
                    topJustification: objectTrackProp.topJustification,
                    width: objectTrackProp.width,
                    orderNum: trackOrder,
                    zoomFactor: objectTrackProp.zoomFactor
                };
                wiApiService.createObjectTrack(dataRequest, function (returnObjectTrack) {
                    self.pushObjectTrack(returnObjectTrack);
                });
            })
        } else {
            console.error('Cannot add new Html Object Track');
        }
    }

    this.pushDepthTrack = function (depthTrackProps) {
        self.pushTrackComponent(depthTrackProps);
    }
    this.pushLogTrack = function (logTrackProps) {
        self.pushTrackComponent(logTrackProps);
        $timeout(function() {
            let track = getComponentCtrlByProperties(logTrackProps).viTrack;
            if (self.containerName) {
                track.initSelectionArea(self.viSelections);
                track.pushSelectionAreas();
            }
        });
    }
    this.pushZoneTrack = function (zoneTrackProps) {
        self.pushTrackComponent(zoneTrackProps);
    }
    this.pushImageTrack = function (imageTrackProps) {
        self.pushTrackComponent(imageTrackProps);
    }
    this.pushObjectTrack = function (objectTrackProps) {
        self.pushTrackComponent(objectTrackProps);
    }
    this.plot = function (track) {
        if (track && track.doPlot) track.doPlot(track == _currentTrack);
    };

    /* connect with visualize track */
    this.plotAll = _.throttle(function () {
        _tracks.forEach(function (track) {
            track.doPlot(track == _currentTrack);
        });
        self.updateScale();
    }, 50);
    this.getDisplayView = function () {
        let slidingBar = wiComponentService.getSlidingBarForD3Area(self.name);
        let maxDepth = this.getMaxDepth();
        let minDepth = this.getMinDepth();
        let minDisplay = minDepth + (maxDepth - minDepth) * slidingBar.slidingBarState.top0 / 100.;
        let maxDisplay = minDisplay + (maxDepth - minDepth) * slidingBar.slidingBarState.range0 / 100.;
        return [minDisplay.toFixed(2), maxDisplay.toFixed(2)];
    }
    this.updateScale = function () {
        let trackPlot = $(`wi-logplot[id=${self.wiLogplotCtrl.id}] .vi-track-plot-container .vi-track-drawing`)[0];
        if (!trackPlot) return;
        let trackPlotHeight = trackPlot.getAttribute('height');
        let dpCm = Utils.getDpcm();
        let heightCm = trackPlotHeight / dpCm;
        let depthRange = this.getDepthRange();
        let scale = (depthRange[1] - depthRange[0]) * 100 / heightCm;
        this.scale = {
            scale: '1:' + scale.toFixed(0),
            displayView: self.getDisplayView(),
            currentView: [depthRange[0].toFixed(2), depthRange[1].toFixed(2)]
        };
        _tracks.filter(track => track.isDepthTrack()).forEach(function (depthTrack) {
            depthTrack.updateScale(self.scale);
        });
        this.wiLogplotCtrl.updateScale(this.scale);
    }
    this.setCurrentTrack = function (track) {
        if (_currentTrack == track) return;
        _previousTrack = _currentTrack;
        _currentTrack = track;
        _currentTrack.highlightCallback();
        _clearPreviousHighlight();
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
    this.scroll = function () {
        let slidingBar = wiComponentService.getSlidingBarForD3Area(self.name);
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
        // _drawTooltip(_currentTrack);
    }
    this.processZoomFactor = function () {
        let maxZoomFactor = d3.max(_tracks, function (track) {
            return track.zoomFactor;
        });

        let topDepth = parseFloat(self.getWellProps().topDepth);
        let bottomDepth = parseFloat(self.getWellProps().bottomDepth);

        let shouldRescaleWindowY = !(_depthRange[0] == topDepth && _depthRange[1] == bottomDepth);
        for (let track of _tracks) {
            track._maxZoomFactor = maxZoomFactor;
            track._shouldRescaleWindowY = shouldRescaleWindowY;
        }
    }
    this.getCurrentTrack = function () {
        return _currentTrack;
    }
    this.removeCurrentTrack = function () {
        self.removeTrack(_currentTrack);
    }
    this.removeTrack = function (track) {
        // remove visualizeTrack
        let trackIdx = _tracks.indexOf(track);
        if (trackIdx < 0) return;
        if (track == _currentTrack) {
            _currentTrack = null;
        }
        _previousTrack = null;
        if (track.removeAllDrawings) {
            track.removeAllDrawings();
        }
        graph.removeTrack(track);
        _tracks.splice(trackIdx, 1);
        let maxZoomFactor = d3.max(_tracks, function (track) {
            return track.zoomFactor;
        });
        if (_tracks.length && maxZoomFactor != _tracks[0]._maxZoomFactor && !_tracks[0]._shouldRescaleWindowY) {
            this.processZoomFactor();
            this.plotAll();
        }
        // remove track component
        let component = self.trackComponents.find(function (trackComponent) {
            return trackComponent.controller.viTrack == track;
        });
        let name = component.controller.name;
        $(`[name=`+ component.controller.name +`]`).remove();
        self.trackComponents.splice(self.trackComponents.indexOf(component), 1);
        // wiComponentService.putComponent(name, null);
        updateSlider();
    }
    this.getTracks = function () {
        return _tracks;
    }
    this.getComponentCtrlByViTrack = getComponentCtrlByViTrack;
    this.getComponentCtrlByProperties = getComponentCtrlByProperties;
    this.updateTrack = function (viTrack) {
        getComponentCtrlByViTrack(viTrack).update();
    }
    // image track
    this.addImageZoneToTrack = function (track, config) {
        return getComponentCtrlByViTrack(track).addImageZoneToTrack(track, config);
    }
    // log track
    this.createShadingForSelectedCurve = function () {
        if(!_currentTrack || !_currentTrack.isLogTrack()) {
            // DialogUtils.errorMessageDialog(ModalService, 'This track is not a Log track. Please select a log track and try again.');
            toastr.error('This track is not a log track. Please select a log track and try again.', 'Error')
            return;
        }
        let trackComponentCtrl = getComponentCtrlByViTrack(_currentTrack);
        trackComponentCtrl.createShadingForSelectedCurve();
    }
    this.addAnnotation = function () {
        if(!_currentTrack || !_currentTrack.isLogTrack()) {
            // DialogUtils.errorMessageDialog(ModalService, 'This track is not a Log track. Please select a log track and try again.');
            toastr.error('This track is not a log track. Please select a log track and try again.', 'Error');
            return;
        }
        let trackComponentCtrl = getComponentCtrlByViTrack(_currentTrack);
        trackComponentCtrl.addAnnotation();
    }
    this.addMarker = function () {
        if(!_currentTrack || !_currentTrack.isLogTrack()) {
            // DialogUtils.errorMessageDialog(ModalService, 'This track is not a Log track. Please select a log track and try again.');
            toastr.error('This track is not a log track. Please select a log track and try again.', 'Error');
            return;
        }
        let trackComponentCtrl = getComponentCtrlByViTrack(_currentTrack);
        trackComponentCtrl.addMarker();
    }
    this.createHistogram = function () {
        if(!_currentTrack || !_currentTrack.isLogTrack()) {
            // DialogUtils.errorMessageDialog(ModalService, 'This track is not a Log track. Please select a log track and try again.');
            toastr.error('This track is not a log track. Please select a log track and try again.', 'Error')
            return;
        }
        let trackComponentCtrl = getComponentCtrlByViTrack(_currentTrack);
        trackComponentCtrl.createHistogram();
    }
    this.createCrossplot = function () {
        if(!_currentTrack || !_currentTrack.isLogTrack()) {
            // DialogUtils.errorMessageDialog(ModalService, 'This track is not a Log track. Please select a log track and try again.');
            toastr.error('This track is not a log track. Please select a log track and try again.', 'Error')
            return;
        }
        let trackComponentCtrl = getComponentCtrlByViTrack(_currentTrack);
        trackComponentCtrl.createCrossplot();
    }

    /* creational methods */
    this.$onInit = function() {
        self.plotAreaId = self.name + 'PlotArea';
        if (self.containerName == undefined || self.containerName == null) self.containerName = '';
        // binding with logplot handlers
        let handlers = wiComponentService.getComponent('LOGPLOT_HANDLERS');
        Utils.bindFunctions(logplotHandlers, handlers, {
            $scope: $scope,
            $timeout: $timeout,
            wiComponentService: wiComponentService,
            wiApiService: wiApiService,
            ModalService: ModalService,
            wiLogplot: self.wiLogplotCtrl
        });

        // subscribe with wiComponentService
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

        window._WiD3CTRL = self;
    }
    this.$onDestroy = function () {
        wiComponentService.dropComponent(self.name);
        document.removeEventListener('resize', self.resizeHandler);
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
                if (model.type == 'comboview' && comboviewId == model.properties.idCombinedBox) handler();
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
    this.init = _.debounce(function () {
        Utils.getPalettes(function (paletteList) {
            let logplotCtrl = self.wiLogplotCtrl;
            let logplotModel = logplotCtrl.getLogplotModel();
            let wiD3Ctrl = self;
            let well = Utils.findWellByLogplot(logplotModel.properties.idPlot);
            wiApiService.getLogplot(logplotModel.id,
                function (plot, err) {
                console.log("getLogplot", plot);
                    if (err) return;
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
                                    wiD3Ctrl.getComponentCtrlByViTrack(trackObj).addCustomShadingToTrack(trackObj, lineObj1, shadingModel.data.leftX, shadingModel.data);
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
                                    wiD3Ctrl.getComponentCtrlByViTrack(trackObj).addPairShadingToTrack(trackObj, lineObj2, lineObj1, shadingModel.data);
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
                                    wiD3Ctrl.getComponentCtrlByViTrack(aTrack).addMarkerToTrack(aTrack, marker);
                                });
                                trackProps[idx].annotations.forEach(function (anno) {
                                    wiD3Ctrl.getComponentCtrlByViTrack(aTrack).addAnnotationToTrack(aTrack, anno);
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
                                            wiD3Ctrl.getComponentCtrlByViTrack(aTrack).addCurveToTrack(aTrack, data, lineModel.data);
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
                                /*
                                if (!trackProps[idx].zoneset) {
                                    async.setImmediate(_cb);
                                }
                                wiApiService.getZoneSet(trackProps[idx].zoneset.idZoneSet, function (zoneset) {
                                    for (let zone of zoneset.zones) {
                                        wiD3Ctrl.addZoneToTrack(aTrack, zone);
                                    }
                                    _cb();
                                });
                                */
                                _cb();
                            }
                            else if (aTrack.type == "image-track") {
                                /*
                                wiApiService.getImagesOfTrack(trackProps[idx].idImageTrack, function (images) {
                                    for (let img of images) {
                                        wiD3Ctrl.addImageZoneToTrack(aTrack, img);
                                    }
                                    _cb();
                                });
                                */
                                _cb();
                            }
                            else if (aTrack.type == "object-track") {
                                if(!trackProps[idx].object_of_tracks || !trackProps[idx].object_of_tracks.length) {
                                    async.setImmediate(_cb);
                                } else {
                                    for (let objectOfTrack of trackProps[idx].object_of_tracks) {
                                        let anObject = wiD3Ctrl.getComponentCtrlByViTrack(aTrack).addObjectToTrack(aTrack, objectOfTrack);
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
                                                        wiD3Ctrl.getComponentCtrlByViTrack(aTrack).removeAnObjectOfObjectTrack(anObject);
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
                                // logplotCtrl.handlers.Scale100ButtonClicked();
                                // commented to keep default scale
                            }
                            setTimeout(function () {
                                if(plot.cropDisplay) {
                                    logplotCtrl.getSlidingbarCtrl().scaleView(currentState.top0, currentState.range0, true);
                                } else {
                                    // logplotCtrl.handlers.ViewWholeWellButtonClicked();
                                }
                            });
                            self.isReady = true;
                            wiComponentService.emit(wiComponentService.LOGPLOT_LOADED_EVENT, logplotModel);
                            self.plotAll();
                            updateSlider();
                        });
                    }
                });
        });
    }, 100);
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

    /* private method*/
    function generateHtml(trackProperties) {
        let d3Ctrl_String = ' wi-d3-ctrl="'+ componentName +'" ';
        // let orderNum_String = ' data-order-num="'+ track.orderNum +'" ';
        let commonStyle_String = ' style="display: flex; flex-direction: column; outline: none;" ';
        // let classed = ' class="wi-d3-track-component" data-order-num=' + trackProperties.orderNum + ' ';
        // commonStyle_String += classed;

        if(trackProperties.idDepthAxis) {
            return '<wi-d3-depth-track name="'
                    + getTrackName(trackProperties) + '" '
                    + d3Ctrl_String + commonStyle_String + '></wi-d3-depth-track>';
        } else if (trackProperties.idZoneTrack) {
            return '<wi-d3-zone-track name="'
                    + getTrackName(trackProperties) + '" '
                    + d3Ctrl_String + commonStyle_String + '></wi-d3-zone-track>';
        } else if (trackProperties.idImageTrack) {
            return '<wi-d3-image-track name="'
                    + getTrackName(trackProperties) + '" '
                    + d3Ctrl_String + commonStyle_String + '></wi-d3-image-track>';
        } else if (trackProperties.idObjectTrack) {
            return '<wi-d3-object-track name="'
                    + getTrackName(trackProperties) + '" '
                    + d3Ctrl_String + commonStyle_String + '></wi-d3-object-track>';
        } else if (trackProperties.idTrack) {
            return '<wi-d3-log-track name="'
                    + getTrackName(trackProperties) + '" '
                    + d3Ctrl_String + commonStyle_String + '></wi-d3-log-track>';
        }
    }
    function getTrackName(trackProperties) {
        if(trackProperties.idDepthAxis) {
            return self.name + 'DepthTrack' + trackProperties.idDepthAxis;
        } else if (trackProperties.idZoneTrack) {
            return self.name + 'ZoneTrack' + trackProperties.idZoneTrack;
        } else if (trackProperties.idImageTrack) {
            return self.name + 'ImageTrack' + trackProperties.idImageTrack;
        } else if (trackProperties.idObjectTrack) {
            return self.name + 'ObjectTrack' + trackProperties.idObjectTrack;
        } else if(trackProperties.idTrack) {
            return self.name + 'LogTrack' + trackProperties.idTrack;
        }else {
            return self.name + 'UnknownTrack';
        }
    }

    function updateSlider() {
        let wholeWidth = $(`wi-logplot[name=${self.wiLogplotCtrl.name}]`).width();
        let slidingBarWidth = $(`wi-slidingbar[name=${self.wiLogplotCtrl.name + "Slidingbar"}]`).width();
        self.contentWidth = $("#" + self.plotAreaId).width();
        self.sliderWidth = wholeWidth - slidingBarWidth - 56;
        if (!self.shouldShowSlider()) self.slider.noUiSlider.reset();
        $scope.safeApply();
    }
    function openTrackPropertiesDialog() {
        console.log('open track properties');
        let controller = getComponentCtrlByViTrack(_currentTrack);
        if(controller) {
            controller.openPropertiesDialog();
        }
    }
    this.openTrackPropertiesDialog = openTrackPropertiesDialog;
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
    function _getWellProps() {
        let well = Utils.findWellByLogplot(self.wiLogplotCtrl.id) || {};
        return well.properties || {};
    }
    function _clearPreviousHighlight() {
        if (!_previousTrack) return;
        if (_previousTrack != _currentTrack) {
            if (_previousTrack.setCurrentDrawing)
                _previousTrack.setCurrentDrawing(null);
            _previousTrack.doPlot(false);
        }
    }
    function _registerTrackCallback(track) {
        track.on('focus', function () {
            _setCurrentTrack(track);
        });
        track.on('mousedown', function () {
            _setCurrentTrack(track);
            // if (d3.event.button == 2) _trackOnRightClick(track);
        });
        track.on('dblclick', function () {
            _setCurrentTrack(track);
            openTrackPropertiesDialog();
        });
        track.plotContainer.on('mousemove', function() {
            _drawTooltip(track);
        });
        track.plotContainer.on('mouseleave', function () {
            _removeTooltip(track);
        })
        track.onVerticalResizerDrag(function () {
            if (track.isLogTrack()) {
                wiApiService.editTrack({ idTrack: track.id, width: Utils.pixelToInch(track.width) }, null, { silent: true })
                _fitWindow = false;
            } else if (track.isDepthTrack()) {
                wiApiService.editDepthTrack({ idDepthAxis: track.id, width: Utils.pixelToInch(track.width) }, null, { silent: true })
                _fitWindow = false;
            } else if (track.isZoneTrack()) {
                wiApiService.editZoneTrack({ idZoneTrack: track.id, width: Utils.pixelToInch(track.width) }, null, { silent: true })
                _fitWindow = false;
            } else if (track.isImageTrack()) {
                wiApiService.editImageTrack({ idImageTrack: track.id, width: Utils.pixelToInch(track.width) }, null, { silent: true })
                _fitWindow = false;
            } else if (track.isObjectTrack()) {
                wiApiService.editObjectTrack({ idObjectTrack: track.id, width: Utils.pixelToInch(track.width) }, null, { silent: true})
                _fitWindow = false;
            }
            LayoutManager.triggerResize();
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
    function _drawTooltip(track) {
        let plotMouse, x, y, plotDim;
        if (!track) {
            for (let tr of _tracks) {
                plotMouse = d3.mouse(tr.plotContainer.node());
                x = plotMouse[0];
                y = plotMouse[1];
                plotDim = tr.plotContainer.node().getBoundingClientRect();

                if (Number.isNaN(x) || Number.isNaN(y)) continue;
                if (x > 0 && x < plotDim.width && y > 0 && y < plotDim.height) {
                    track = tr;
                    break;
                }
            }
        }
        if (!track) track = _currentTrack;
        y = d3.mouse(track.plotContainer.node())[1];
        let depth = track.getTransformY().invert(y);

        _tracks.forEach(function(tr) {
            if (_referenceLine && tr.drawTooltipLines) tr.drawTooltipLines(depth);
            if (_tooltip && tr.drawTooltipText) tr.drawTooltipText(depth, tr == track);
        })
        // graph.createTooltipLines(svg);
    }
    function _removeTooltip(track) {
        if (!_tooltip) return;
        _tracks.forEach(function(tr) {
            if (tr.removeTooltipLines) tr.removeTooltipLines();
            if (tr.removeTooltipText) tr.removeTooltipText();
        })
    }
    function _trackOnRightClick() {
        let componentCtrl = self.trackComponents.find(function(trackComponent) {
            return trackComponent.controller.viTrack == _currentTrack;
        }).controller;
        if(componentCtrl) {
            // componentCtrl.buildContextMenu();
        }
    }
    function _setCurrentTrack(track) {
        if (_currentTrack == track) return;
        _previousTrack = _currentTrack;
        _currentTrack = track;
        _currentTrack.highlightCallback();
        _clearPreviousHighlight();
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
    function _registerTrackHorizontalResizerDragCallback() {
        _tracks.forEach(function (track) {
            track.onHorizontalResizerDrag(function () {
                _tracks.forEach(function (t) {
                    if (track == t) return;
                    t.horizontalResizerDragCallback();
                });
                self.updateScale();
            });
        })
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
                        /*
                        _plotZoneSet(track);
                        Utils.refreshProjectState();
                        */
                        track.removeDrawing(drawing);
                        Utils.emitEvent('zone-updated', track);
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
                    getComponentCtrlByViTrack(track).removeAnObjectOfObjectTrack();
                }

                return;
            case 'Escape':
                // Bug
                if (track && track.setMode) track.setMode(null);
                return;
        }
    }
    function getComponentCtrlByViTrack(viTrack) {
        return self.trackComponents.find(component => component.controller.viTrack == viTrack).controller || {};
    }
    function getComponentCtrlByProperties(props) {
        let nameOfTrack = getTrackName(props);
        return self.trackComponents.find(component => component.name == nameOfTrack).controller || {};
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
        viSelections: '<',
        containerName: '@'
    }
});

exports.name = moduleName;
exports.controller = Controller;
