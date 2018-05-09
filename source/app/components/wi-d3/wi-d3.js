const componentName = 'wiD3';
const moduleName = 'wi-d3';

function Controller($scope, wiComponentService, $timeout, ModalService, wiApiService, $compile) {
    let self = this;
    let graph = wiComponentService.getComponent(wiComponentService.GRAPH);
    let Utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let LayoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
    let logplotHandlers = {};

    //self.Tracks = null

    /*
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
    */

    let _referenceLine = true;
    let _fitWindow = false;
    //let _depthRange = [0, 100000];
    self._minY = 0;
    self._maxY = 100000;
    let contextMenu = [{
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
            }]
    // var commonCtxMenu = null;
    // let _tracks = [];
    let _currentTrack = null;
    let _previousTrack = null;
    let _tooltip = true;
    this.compileFunc = $compile;
    this.scopeObj = $scope;
    this.trackComponents = [];
    this.getContextMenu = function() {
        return contextMenu;
    }

    /*
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
    */
    /*
    this.subscribeTrackCtrlWithD3Ctrl = function (trackComponentCtrl) {
        // this.trackComponents.find(function(track) {
        //    return self.getTrackName(track) == trackComponentCtrl.name;
        // }).controller = trackComponentCtrl;
        // _tracks.push(trackComponentCtrl.viTrack);

        
        //let depthRange = self.getDepthRangeFromSlidingBar();
        //self.setDepthRangeForTrack(trackComponentCtrl.viTrack, depthRange);
        //_registerTrackHorizontalResizerDragCallback();
        ////_registerTrackCallback(trackComponentCtrl.viTrack);
        //_registerTrackCallback(trackComponentCtrl);
        //_registerTrackDragCallback(trackComponentCtrl.viTrack);
        // _registerTrackDragCallback(trackComponentCtrl);
        //_setCurrentTrack(trackComponentCtrl.getProperties());

        // trackComponentCtrl.viTrack.on('keydown', function () {
        //     _onTrackKeyPressCallback(trackComponentCtrl.viTrack);
        // })
        //graph.rearrangeTracks(self);
        //self.updateScale();
        updateSlider();
    }
    */
    this.adjustHeaderHeight = function(curViTrack) {
        self.trackComponents.forEach((tc) => {
            if (!tc.controller || !tc.controller.viTrack || tc.controller.viTrack == curViTrack) return;
            tc.controller.viTrack.horizontalResizerDragCallback();
        });
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
        /*
        _fitWindow = !_fitWindow;
        let logplotElem = $('wi-logplot#' + self.wiLogplotCtrl.id + '>.logplot-header');
        let slidingBarElem = $('wi-logplot#' + self.wiLogplotCtrl.id + '>.logplot-main-content>.slidingbar')
        let plotAreaWidth = logplotElem.width() - slidingBarElem.width()/2 - slidingBarElem.outerWidth()/2;
        // console.log("width", _tracks);
        let sumOfOriWidth = 0;
        let widths = [];
        _tracks.forEach(function(t) {
            widths.push(t.width);
            sumOfOriWidth += t.width;
        });
        let ratioWidth = plotAreaWidth/sumOfOriWidth;
        */

        /*_tracks.forEach(function(t, index) {
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
        })*/
    }
    this.pushTrackComponent = function(trackProperties) {
        let html = generateHtml(trackProperties);
        let trackName = getTrackName(trackProperties);
        
        // TO BE REVIEWED
        // this.trackComponents.push({
        //    name: trackName,
        //    props: trackProperties,
        // });
        $('#' + self.plotAreaId).append(
            self.compileFunc(html)(self.scopeObj)
        );
        // return self.trackComponents.find(function(component) { return component.name == trackName});
    }
    this.showContextMenu = function (event) {
        console.log('wi-d3 contextMenu is opened');
        if (event.button != 2) return;
       
        event.stopPropagation();
        wiComponentService.getComponent('ContextMenu')
            .open(event.clientX, event.clientY, self.contextMenu, function () {});
    }
    this.getListWells = function () {
        return _.uniq(this.trackComponents
                    .map(function(tc) {
                        if(tc.controller && tc.controller.getWellProps) {
                            let wellProps = tc.controller.getWellProps();
                            if(wellProps) {
                                return wellProps;
                            }
                        }
                        return {};
                    }).filter(function(wellProps) {
                        return !!wellProps.idWell;
                    }), 'idWell');
    }
    this.getMaxDepth = function () {

        let defaultBottomDepth = 100000.;

        let _maxDepth = defaultBottomDepth;
        let listWells = self.getListWells();
        if(listWells.length) {
            _maxDepth = d3.max(listWells, function (wellProps) {
                return parseFloat(wellProps.bottomDepth);
            })
        }

        return _maxDepth;
        // let wellProps = self.getWellProps();
        // if (wellProps.bottomDepth)
        // return parseFloat(wellProps.bottomDepth);

        // // TO BE REMOVED
        // // let maxDepth = d3.max(_tracks, function (track) {
        // //     if (track.getExtentY) return track.getExtentY()[1];
        // //     return -1;
        // // });
        // let maxDepth = d3.max(self.trackComponents, function (tc) {
        //     if (tc.controller.viTrack.getExtentY) return tc.controller.viTrack.getExtentY()[1];
        //     return -1;
        // });
        // maxDepth = (maxDepth > 0) ? maxDepth : 100000;
        // return maxDepth;
    };
    this.getMinDepth = function () {
        let defaultTopDepth = 0.;
        let _minDepth = defaultTopDepth;
        let listWells = self.getListWells();
        if(listWells.length) {
            _minDepth = d3.min(listWells, function (wellProps) {
                return parseFloat(wellProps.topDepth);
            })
        }

        return _minDepth;
        // let minDepth = -1;
        // minDepth = d3.min(self.trackComponents, function (tc) {
        //     if(tc.controller.getWellProps) {
        //         let wellProps = tc.controller.getWellProps();
        //         if(wellProps)
        //             return parseFloat(wellProps.topDepth);
        //     }
        //     return 100000;
        // });
        
        // return (minDepth > 0 && minDepth < 100000) ? minDepth : 0;
        // ******************** 
        // let wellProps = self.getWellProps();
        // return parseFloat(wellProps.topDepth) || 0;
    }

    this.getDepthRange = function () {
        let _depthRange = [self._minY, self._maxY];
        return _depthRange.map(function (d) {
            return Math.round(d * 10000) / 10000;
        });
    }
    this.getDepthRangeRaw = function () {
        //return _depthRange;
        return [self._minY, self._maxY];
    }
    this.getDepthRangeFromSlidingBar = function () {
        let slidingBar = wiComponentService.getSlidingBarForD3Area(self.name);
        let maxDepth = self.getMaxDepth();
        let minDepth = self.getMinDepth();
        let low = minDepth + slidingBar.slidingBarState.top * (maxDepth - minDepth) / 100;
        let high = low + (slidingBar.slidingBarState.range) * (maxDepth - minDepth) / 100;
        return [low, high];
    }
    // this.getWellProps = _getWellProps;
    this.getLogplotHandler = function () {
        return logplotHandlers;
    }
    this.getOrderKey = getOrderKey;
    /*
    this.setContextMenu = function (ctxMenu) {
        if(!ctxMenu) {
            self.contextMenu = commonCtxMenu;
        }
        self.contextMenu = ctxMenu;
    }
    */

    this.shouldShowSlider = function() {
        return self.contentWidth > self.sliderWidth + 45;
    }
    this.adjustSlidingBarFromDepthRange = function (vY) {
        let slidingBar = wiComponentService.getSlidingBarForD3Area(self.name);
        let maxDepth = self.getMaxDepth();
        let minDepth = self.getMinDepth();

        let top = (vY[0] - minDepth) * 100 / (maxDepth - minDepth);
        let range = (vY[1] - minDepth) * 100 / (maxDepth - minDepth) - top;
        // slidingBar.resetView();
        slidingBar.updateSlidingHandlerByPercent(top, range);
    }
    this.toggleTooltip = function() {
        _tooltip = !_tooltip;
    }
    /*
    this.verifyDroppedIdCurve = function (idCurve) {
        let well1 = self.getWellProps();
        let well2 = Utils.findWellByCurve(idCurve) || {properties: {}};
        if (!well1.idWell || !well2.properties.idWell) return -1;
        if (well1.idWell && well2.properties.idWell && (well1.idWell == well2.properties.idWell)) return 1;
        return 0;
    }
    */
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
                self.trackComponents.push(depthTrack);
                self.trackComponents.sort((track1, track2) => {
                    return track1.orderNum.localeCompare(track2.orderNum);
                });
                //self.pushDepthTrack(depthTrack);
                $timeout(callback);
            });
        }
        else {
            Utils.error('can not create depth track');
        }
    }
    this.addLogTrack = async function (trackTitle) {
        var trackOrder = getOrderKey();
        if (trackOrder) {
            const logTrackComps = self.trackComponents.filter(tc => tc.idTrack);

            let logTrackProps = await new Promise(function(resolve) {
                wiApiService.createLogTrack(self.wiLogplotCtrl.id, trackOrder, function(ret) {
                    resolve(ret);
                }, {
                    title: trackTitle || 'Track ' + (logTrackComps.length + 1)
                });
            });
            
            logTrackProps = await new Promise(function(resolve){
                wiApiService.infoTrack(logTrackProps.idTrack, function(logTrack) {
                    resolve(logTrack);
                });
            });
            self.trackComponents.push(logTrackProps);
            self.trackComponents.sort(function(t1, t2) {
                return t1.orderNum.localeCompare(t2.orderNum);
            });
            return logTrackProps;
        }
        else {
            toastr.error('Cannot add Log track');
        }
    }
    this.addZoneTrack = function (callback) {
        let trackOrder = getOrderKey();
        if (trackOrder) {
            const zoneTracks = self.trackComponents.filter(tc => tc.idZoneTrack);
            let zoneTrackProps = {
                idPlot: self.wiLogplotCtrl.id,
                orderNum: trackOrder,
                showTitle: true,
                title: "Zone Track " + (zoneTracks.length + 1),
                topJustification: "center",
                color: '#ffffff',
                width: 1,
                parameterSet: null,
                zoomFactor: 1.0
            }
            DialogUtils.zoneTrackPropertiesDialog(ModalService, zoneTrackProps, function(props) {
                zoneTrackProps = props;
				self.trackComponents.push(zoneTrackProps);
				self.trackComponents.sort(function(t1, t2) {
					return t1.orderNum.localeCompare(t2.orderNum);
				});
			});
        }
        else {
            toastr.error('Cannot create zone track');
        }
    }
    this.addImageTrack = function (callback) {
        let trackOrder = getOrderKey();
        if (trackOrder) {
            const imageTracks = self.trackComponents.filter(tc => tc.idImageTrack);
            const defaultImageTrackProp = {
                showTitle: true,
                title: "Image Track " + (imageTracks.length + 1),
                topJustification: "center",
                bottomJustification: "center",
                background: '#ffffff',
                width: Utils.inchToPixel(1),
                zoomFactor: 1.0
            }
            DialogUtils.imageTrackPropertiesDialog(ModalService, defaultImageTrackProp, function (imageTrackProperties) {
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
                    // self.pushImageTrack(returnImageTrack);
                    self.trackComponents.push(returnImageTrack);
                    self.trackComponents.sort(function(t1, t2) {
                        return t1.orderNum.localeCompare(t2.orderNum);
                    });
                })
            })
        } else {
            console.error('add new image track error!');
        }
    }
    this.addObjectTrack = function (callback) {
        let trackOrder = getOrderKey();
        if (trackOrder) {
            const objectTracks = self.trackComponents.filter(tc => tc.idObjectTrack);
            const defaultObjectTrackProp = {
                showTitle: true,
                title: "Object Track " + (objectTracks.length + 1),
                topJustification: "center",
                width: Utils.inchToPixel(2.5),
                zoomFactor: 1.0
            }
            DialogUtils.objectTrackPropertiesDialog(ModalService, defaultObjectTrackProp, function (objectTrackProp) {
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
                    // self.pushObjectTrack(returnObjectTrack);
                    self.trackComponents.push(returnObjectTrack);
                    self.trackComponents.sort(function(t1, t2) {
                        return t1.orderNum.localeCompare(t2.orderNum);
                    });
                });
            })
        } else {
            console.error('Cannot add new Html Object Track');
        }
    }

    /*
    this.pushDepthTrack = function (depthTrackProps) {
        self.pushTrackComponent(depthTrackProps);
    }
    this.pushLogTrack = function (logTrackProps) {
        self.pushTrackComponent(logTrackProps);
        $timeout(function() {
            let trackD3Ctrl = getComponentCtrlByProperties(logTrackProps);
            let viTrack = trackD3Ctrl.viTrack;
            if (self.containerName) {
                let well = Utils.findWellByLogplot(self.wiLogplotCtrl.id);
                self.selections.forEach(function(selectionConfig) {
                    selectionConfig.wellForLogplot = well;
                    trackD3Ctrl.addViSelectionToTrack(viTrack, selectionConfig);
                })
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
    */

    this.reloadTrack = function(tc) {
        let idx = self.trackComponents.findIndex((item) => item == tc);
        wiApiService.infoTrack(tc.idTrack, function(trackProps) {
            self.trackComponents[idx] = trackProps;
        });
    }
    
    this.plotAll = _.throttle(function () {
        self.trackComponents.forEach(tc => {
            tc.controller.viTrack.doPlot(tc == _currentTrack);
        });
        // _tracks.forEach(function (track) {
        //     track.doPlot(track == _currentTrack);
        // });
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
        self.trackComponents.forEach(tc => {
            if (tc.idDepthAxis && tc.controller.viTrack) 
                tc.controller.viTrack.updateScale(self.scale);
        });
        /*_tracks.filter(track => track.isDepthTrack()).forEach(function (depthTrack) {
            depthTrack.updateScale(self.scale);
        });*/
        this.wiLogplotCtrl.updateScale(this.scale);
    }
    this.setCurrentTrack = function (trackComponent) {
        _setCurrentTrack(trackComponent);
    }
    this.setDepthRange = function (depthRange, notPlot) {
        self._minY = depthRange[0];
        self._maxY = depthRange[1];
    };
    /*
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
    */
    this.scroll = function () {
        let slidingBar = wiComponentService.getSlidingBarForD3Area(self.name);
        let value = (d3.event.deltaY<0)? 1 : -1;
        slidingBar.scroll(value);
        // _drawTooltip(_currentTrack);
		// _currentTrack.controller.drawTooltip();
    }
    this.zoom = function (zoomOut) {
        const fixedScales = [1, 2, 4, 5, 10, 20, 50, 100, 200, 300, 500, 1000, 2000, 2500, 3000, 5000, 10000, 20000, 50000, 100000];
        let scale = +this.scale.scale.replace('1:', '');
        if (fixedScales.indexOf(scale) < 0) fixedScales.push(scale);
        fixedScales.sort((a, b) => a - b);
        if (zoomOut) {
            scale = fixedScales[fixedScales.indexOf(scale) + 1] || 'Full';
        } else {
            scale = fixedScales[fixedScales.indexOf(scale) - 1];
        }
        const handler = logplotHandlers['Scale' + scale + 'ButtonClicked'];
        if (typeof handler === 'function') handler();
    }
    this.processZoomFactor = function () {
        let maxZoomFactor = d3.max(self.trackComponents, function (tc) {
            return tc.zoomFactor;
        });

        // let topDepth = parseFloat(self.getWellProps().topDepth);
        // let bottomDepth = parseFloat(self.getWellProps().bottomDepth);
        let topDepth = self.getMaxDepth();
        let bottomDepth = self.getMinDepth();

        //let shouldRescaleWindowY = !(_depthRange[0] == topDepth && _depthRange[1] == bottomDepth);
        let shouldRescaleWindowY = !(self._minY == topDepth && self._maxY == bottomDepth);
        for (let tc of self.trackComponents) {
            tc.controller.viTrack._maxZoomFactor = maxZoomFactor;
            tc.controller.viTrack._shouldRescaleWindowY = shouldRescaleWindowY;
        }
    }

    this.getTrackComponents = function() { return self.trackComponents; }
    this.getCurrentTrack = function () {
        return _currentTrack;
    }
    this.removeCurrentTrack = function () {
        self.removeTrack(_currentTrack);
    }
    this.removeTrack = function(trackComponent) {
        self.trackComponents = self.trackComponents.filter(function(tc) {
            return trackComponent !== tc;
        });
    }
    /*
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
    }*/
    /*
    this.getTracks = function () {
        return _tracks;
    }
    */

    this.getComponentCtrlByViTrack = getComponentCtrlByViTrack;
    this.getComponentCtrlByProperties = getComponentCtrlByProperties;
    /*
    this.updateTrack = function (viTrack) {
        getComponentCtrlByViTrack(viTrack).update();
    }
    */

    /***************** TO BE MOVE AWAY INTO INDIVIDUAL TRACKS ************
    // image track
    this.addImageZoneToTrack = function (track, config) {
        return getComponentCtrlByViTrack(track).addImageZoneToTrack(track, config);
    }
    // log track
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

    /******************** END TO BE MOVE AWAY .... ****************/

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
    this.onReady = function () {

        let sensor = new ResizeSensor($('#' + self.plotAreaId), function () {
            updateSlider();
            self.plotAll();
        });
        function handler() {
            if (!sensor || !sensor.detach) return;
            sensor.detach();
            sensor = new ResizeSensor($('#' + self.plotAreaId), function () {
                updateSlider();
                self.plotAll();
            });
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
    this.updateMultiWellState = function() {
        let wiSlidingBarCtrl = self.wiLogplotCtrl.getSlidingbarCtrl();
        wiSlidingBarCtrl.createPreview();
        self.adjustSlidingBarFromDepthRange(self.getDepthRange());
        wiSlidingBarCtrl.scroll(0);    
        /*
        if(self.wiLogplotCtrl.cropDisplay) {
            wiSlidingBarCtrl.scaleView(wiSlidingBarCtrl.slidingBarState.top0, wiSlidingBarCtrl.slidingBarState.range0, true);
            wiSlidingBarCtrl.updateWid3(); 
        } else {
            wiSlidingBarCtrl.scroll(0);    
        }
        */
    }

    this.init = _.debounce(function () {
        Utils.getPalettes(async function (paletteList) {
            let logplotCtrl = self.wiLogplotCtrl;
            let logplotModel = await logplotCtrl.getLogplotModelAsync();
            let wiD3Ctrl = self;
            let well = Utils.findWellByLogplot(logplotModel.properties.idPlot);
            wiApiService.getLogplot(logplotModel.id,
                function (plot, err) {
                    if (err) return;
                    let tracks = [].concat(plot.tracks || [])
                        .concat(plot.depth_axes || [])
                        .concat(plot.zone_tracks || [])
                        .concat(plot.image_tracks || [])
                        .concat(plot.object_tracks || [])
                        .sort((track1, track2) => {
                            return track1.orderNum.localeCompare(track2.orderNum);
                        });
                    //self.Tracks = tracks;
                    
                    let currentState = JSON.parse(plot.currentState);
                    let depthRange = [currentState.top, currentState.bottom];
                    let wiSlidingBarCtrl = logplotCtrl.getSlidingbarCtrl();

                    logplotCtrl.cropDisplay = plot.cropDisplay;
                    wiSlidingBarCtrl.slidingBarState.top0 = currentState.top0;
                    wiSlidingBarCtrl.slidingBarState.range0 = currentState.range0;

                    self._minY = depthRange[0];
                    self._maxY = depthRange[1];

                    wiSlidingBarCtrl.createPreview(plot.referenceCurve, function() {
                        self.trackComponents = tracks;

                        let timerHandle = setInterval(function() {
                            let isReady = !self.trackComponents.filter((tc) => {
                                if(!tc.controller) return true;
                                if(tc.idTrack) return !tc.controller.isFree;
                            }).length;
                            if(isReady) {
                                clearInterval(timerHandle);
                                self.adjustSlidingBarFromDepthRange(depthRange);
                                if(plot.cropDisplay) {
                                    wiSlidingBarCtrl.scaleView(currentState.top0, currentState.range0, true);
                                    wiSlidingBarCtrl.updateWid3(); 
                                } else {
                                    wiSlidingBarCtrl.scroll(0);    
                                }
                                self.isReady = true;
                            }
                        }, 100);
                    })

                    /*
                    let currentState = JSON.parse(plot.currentState);
                    let depthRange = [currentState.top, currentState.bottom];
                    self._minY =  depthRange[0];
                    self._maxY =  depthRange[1];

                    self.trackComponents = tracks;

                    $timeout(function() {
                        if (logplotModel.properties.referenceCurve) {
                            logplotCtrl.getSlidingbarCtrl().createPreview(plot.referenceCurve);
                        }
                        self.adjustSlidingBarFromDepthRange(depthRange);
                        if(plot.cropDisplay) {
                            logplotCtrl.getSlidingbarCtrl().scaleView(currentState.top0, currentState.range0, true);
                        }
                        self.updateScale();
                        self.isReady = true;
                    }, 500)
                    */

                    /*
                    let currentState = JSON.parse(plot.currentState);
                    $timeout(function () {
                        if (logplotModel.properties.referenceCurve) {
                            logplotCtrl.getSlidingbarCtrl().createPreview(plot.referenceCurve);
                        }
                        if (currentState.top && currentState.bottom){
                            let depthRange = [currentState.top, currentState.bottom];
                            self.adjustSlidingBarFromDepthRange(depthRange);
                        }
                        if(plot.cropDisplay) {
                            logplotCtrl.getSlidingbarCtrl().scaleView(currentState.top0, currentState.range0, true);
                        }
                        self.updateScale();
                        self.isReady = true;
                    }, 10000);

                    // let drange = self.getDepthRangeFromSlidingBar();
                    let drange = [currentState.top, currentState.bottom];
                    self._minY = drange[0];
                    self._maxY = drange[1];

                    self.trackComponents = tracks;
					wiComponentService.emit(wiComponentService.LOGPLOT_LOADED_EVENT, logplotModel);
                    */
 		
/*
                    async.eachOfSeries(tracks, function(aTrack, idx, _callback) {
                        if (aTrack.idDepthAxis) {
                            wiD3Ctrl.pushDepthTrack(aTrack);
                            async.setImmediate(_callback);
                        } else if (aTrack.idTrack) {
                            wiD3Ctrl.pushLogTrack(aTrack);
                            async.setImmediate(_callback);
                        } else if (aTrack.idZoneTrack) {
                            wiD3Ctrl.pushZoneTrack(aTrack);
                            async.setImmediate(_callback);
                        } else if(aTrack.idImageTrack) {
                            wiD3Ctrl.pushImageTrack(aTrack);
                            async.setImmediate(_callback);
                        } else if(aTrack.idObjectTrack) {
                            wiD3Ctrl.pushObjectTrack(aTrack);
                            async.setImmediate(_callback);
                        } else {
                            async.setImmediate(_callback);
                        }
                    }, function(error) {
                        buildTracks();
                    });
*/
/*
                    function buildTracks() {
                        let loadedTracks = wiD3Ctrl.getTracks();
                        async.eachOf(loadedTracks, function(aTrack, idx, _cb){
                            if (aTrack.type == "depth-track") {
                                console.log('depth track');
                                async.setImmediate(_cb);
                            }
                            else if (aTrack.type == "log-track") {
                                wiD3Ctrl.getComponentCtrlByViTrack(aTrack).update(function () {
                                    aTrack.setCurrentDrawing(null);
                                    _cb();
                                });
                            }
                            else if (aTrack.type == "zone-track") {
                                _cb();
                            }
                            else if (aTrack.type == "image-track") {
                                _cb();
                            }
                            else if (aTrack.type == "object-track") {
                                if(!tracks[idx].object_of_tracks || !tracks[idx].object_of_tracks.length) {
                                    async.setImmediate(_cb);
                                } else {
                                    for (let objectOfTrack of tracks[idx].object_of_tracks) {
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
*/
                }
            );
        });
    }, 100);
    $scope.safeApply = function (fn) {
        const phase = this.$root.$$phase;
        if (phase == '$apply' || phase == '$digest') {
            if (fn && (typeof (fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

    /* private method*/
    /*
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
    */
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
    self.getTrackName = getTrackName;

    function updateSlider() {
        let wholeWidth = $(`wi-logplot[name=${self.wiLogplotCtrl.name}]`).width();
        let slidingBarWidth = $(`wi-slidingbar[name=${self.wiLogplotCtrl.name + "Slidingbar"}]`).width();
        self.contentWidth = $("#" + self.plotAreaId).width();
        self.sliderWidth = wholeWidth - slidingBarWidth - 56;
        if (!self.shouldShowSlider()) self.slider.noUiSlider.reset();
        self.slider.noUiSlider.updateOptions({}); // fire event 'update';
        $scope.safeApply();
    }
    /*
    function openTrackPropertiesDialog() {
        console.log('open track properties');
        //let controller = getComponentCtrlByViTrack(_currentTrack);
        let controller = _currentTrack.controller;
        if(controller) {
            controller.openPropertiesDialog();
        }
    }
    this.openTrackPropertiesDialog = openTrackPropertiesDialog;
    */

    function getOrderKey(trackComponent) {
        let length = self.trackComponents.length;
        if (length <= 0) {
            return 'm';
        }
        if (!trackComponent) trackComponent = _currentTrack || self.trackComponents[length - 1];
        let currentIdx = self.trackComponents.indexOf(trackComponent);

        if (currentIdx < 0 || currentIdx >= (length - 1)) {
            currentIdx = length - 1;
            let currentOrderKey = trackComponent.orderNum;
            var key = String.fromCharCode(currentOrderKey.charCodeAt(0) + 1);
            return key;
        }
        return trackComponent.orderNum + self.trackComponents[currentIdx + 1].orderNum;
    }
    // function _getWellProps() {
    //     let well = Utils.findWellByLogplot(self.wiLogplotCtrl.id) || {};
    //     return well.properties || {};
    // }
    function unHightlightTrack(trackComponent) {
        let controller = trackComponent.controller;
        let viTrack = controller.viTrack;
        if (viTrack.setCurrentDrawing) viTrack.setCurrentDrawing(null);
        viTrack.doPlot(false);
    }
    function _clearPreviousHighlight() {
        if (!_previousTrack) return;
        if (_previousTrack != _currentTrack) {
            unHightlightTrack(_previousTrack);
        }
    }

    this.trackUnderMouse = null;

    /*
    function _registerTrackCallback(trackCtrl) {
        let trackComponent = trackCtrl.getProperties();
        let viTrack = trackCtrl.viTrack;
        viTrack.on('focus', function () {
            _setCurrentTrack(trackComponent);
        });
        viTrack.on('mousedown', function () {
            d3.event.stopPropagation();
            _setCurrentTrack(trackComponent);
            // if (d3.event.button == 2) _trackOnRightClick(track);
        });
        viTrack.on('dblclick', function () {
            _setCurrentTrack(trackComponent);
            openTrackPropertiesDialog();
        });
        viTrack.onVerticalResizerDrag(function () {
            if(_fitWindow) return ;
            if (trackComponent.idTrack) {
                wiApiService.editTrack({ 
                    idTrack: trackComponent.idTrack, 
                    width: Utils.pixelToInch(viTrack.width) 
                }, null, { silent: true });
                _fitWindow = false;
            } 
            else if (trackComponent.idDepthAxis) {
                wiApiService.editDepthTrack({ 
                    idDepthAxis: trackComponent.idDepthAxis, 
                    width: Utils.pixelToInch(viTrack.width) 
                }, null, { 
                    silent: true 
                });
                _fitWindow = false;
            } 
            else if (trackComponent.idZoneTrack) {
                wiApiService.editZoneTrack({ 
                    idZoneTrack: trackComponent.idZoneTrack, 
                    width: Utils.pixelToInch(viTrack.width) 
                }, null, { 
                    silent: true 
                });
                _fitWindow = false;
            } 
            else if (trackComponent.idImageTrack) {
                wiApiService.editImageTrack({ 
                    idImageTrack: trackComponent.idImageTrack, 
                    width: Utils.pixelToInch(viTrack.width) 
                }, null, { 
                    silent: true 
                });
                _fitWindow = false;
            } else if (trackComponent.idObjectTrack) {
                wiApiService.editObjectTrack({ 
                    idObjectTrack: trackComponent.idObjectTrack, 
                    width: Utils.pixelToInch(viTrack.width) 
                }, null, { 
                    silent: true
                });
                _fitWindow = false;
            }
        });
    }
    */
    function _onPlotMouseWheelCallback() {
        if (!self.trackComponents || !self.trackComponents.length) return;
        let mouse = d3.mouse(self.trackComponents[0].controller.viTrack.plotContainer.node());
        if (mouse[1] < 0) return;

        if (d3.event.ctrlKey) {
            self.zoom(d3.event.deltaY > 0);
            d3.event.preventDefault();
            d3.event.stopPropagation();
        }
        else
            self.scroll();
    }
/* TUNG
    function _trackOnRightClick() {
        let componentCtrl = self.trackComponents.find(function(trackComponent) {
            return trackComponent.controller.viTrack == _currentTrack;
        }).controller;
        if(componentCtrl) {
            // componentCtrl.buildContextMenu();
        }
    }
*/
    function _setCurrentTrack(trackComponent) {
        if (_currentTrack == trackComponent) {
            _currentTrack.controller.viTrack.highlightCallback();
            return;
        }
        _previousTrack = _currentTrack;
        _currentTrack = trackComponent;
        _currentTrack.controller.viTrack.highlightCallback();
        _clearPreviousHighlight();
    }
    function editOrderNum(tc, orderNum) {
        tc.orderNum = orderNum;
        tc.controller.setOrderNum(orderNum);
        return new Promise(function(resolve) {
            let id = ( 
                tc.idTrack || tc.idDepthAxis || 
                tc.idZoneTrack || tc.idImageTrack || 
                tc.idObjectTrack 
            );
            if (tc.idTrack) {
                wiApiService.editTrack({idTrack: id, orderNum: tc.orderNum}, success);
            } 
            else if (tc.idDepthAxis) {
                wiApiService.editDepthTrack({idDepthAxis: id, orderNum: tc.orderNum}, success)
            } 
            else if (tc.idZoneTrack) {
                wiApiService.editZoneTrack({idZoneTrack: id, orderNum: tc.orderNum}, success)
            } 
            else if (tc.idImageTrack) {
                wiApiService.editImageTrack({idImageTrack: id, orderNum: tc.orderNum}, success)
            } 
            else if (tc.idObjectTrack) {
                wiApiService.editObjectTrack({idObjectTrack: id, orderNum: tc.orderNum}, success)
            }
                
            function success(err) {
                if(err) toastr.error(err.message);
                resolve();
            }
        });
    }
    function reindexAllTracks() {
        let tcs = self.trackComponents;
        for (let i = 0; i < tcs.length; i++) {
            let orderNum;
            if (i == 0) orderNum = 'm';
            else orderNum = String.fromCharCode(tcs[i - 1].orderNum.charCodeAt(0) + 1);
            tcs[i].orderNum = orderNum;
            tcs[i].controller.setOrderNum(orderNum);
        }
        async.eachOf(self.trackComponents, function(tc, idx, done) {
            let id = ( 
                tc.idTrack || tc.idDepthAxis || 
                tc.idZoneTrack || tc.idImageTrack || 
                tc.idObjectTrack 
            );
            if (tc.idTrack) {
                wiApiService.editTrack({idTrack: id, orderNum: tc.orderNum}, function () {
                    done();
                })
            } 
            else if (tc.idDepthAxis) {
                wiApiService.editDepthTrack({idDepthAxis: id, orderNum: tc.orderNum}, function () {
                    done();
                })
            } 
            else if (tc.idZoneTrack) {
                wiApiService.editZoneTrack({idZoneTrack: id, orderNum: tc.orderNum}, function () {
                    done();
                })
            } 
            else if (tc.idImageTrack) {
                wiApiService.editImageTrack({idImageTrack: id, orderNum: tc.orderNum}, function () {
                    done();
                })
            } 
            else if (tc.idObjectTrack) {
                wiApiService.editObjectTrack({idObjectTrack: id, orderNum: tc.orderNum}, function () {
                    done();
                })
            }
            
        }, function(err) {
            if(err) toastr.error(err.message);
            self.trackComponents.sort((track1, track2) => {
                return track1.orderNum.localeCompare(track2.orderNum);
            });
        });
    }

    this.registerTrackDragCallback = _registerTrackDragCallback;
    function _registerTrackDragCallback(trackCtrl) {
        let viTrack = trackCtrl.viTrack;
        let trackComponent = trackCtrl.getProperties();
        let originalOrderNum = viTrack.orderNum;
        viTrack.onTrackDrag(
            function (desTrack) {
                let orderNum;
                let desTrackIndex = self.trackComponents.findIndex(
                    track => track.orderNum == desTrack.orderNum
                );
                if (desTrackIndex == 0) {
                    orderNum = String.fromCharCode(self.trackComponents[0].orderNum.charCodeAt(0) - 1);
                }
                else {
                    let desTc;
                    if (self.getCurrentTrack().orderNum.localeCompare(desTrack.orderNum) < 0)
                        desTc = self.trackComponents[desTrackIndex];
                    else 
                        desTc = self.trackComponents[desTrackIndex - 1];

                    orderNum = getOrderKey(desTc);
                }
                if (orderNum.length > 50 || 
                    self.trackComponents[0].orderNum[0].localeCompare('a') < 0 || 
                    self.trackComponents[self.trackComponents.length - 1].orderNum[0].localeCompare('z') > 0) 
                {
                    reindexAllTracks();
                    return;
                }
                if (trackComponent.orderNum === orderNum ) return;
                editOrderNum(trackComponent, orderNum).then(function () {
                    self.trackComponents.sort((track1, track2) => {
                        return track1.orderNum.localeCompare(track2.orderNum);
                    });
                }).catch(function (err) {
                    console.log(err);
                });
            }
        );
    }
    function getComponentCtrlByViTrack(viTrack) {
        // TUNG return _.get(self.trackComponents.find(component => component.controller.viTrack == viTrack), 'controller');
        return _.get(self.trackComponents.find(function(component) {
            return component.controller.viTrack == viTrack;
        }), 'controller');
    }
    function getComponentCtrlByProperties(props) {
        let nameOfTrack = getTrackName(props);
        //return _.get(self.trackComponents.find(component => component.name == nameOfTrack), 'controller');
        return _.get(self.trackComponents.find(function(component) {
            return component.controller && component.controller.name == nameOfTrack;
        }), 'controller');
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
        // selections: '<',
        containerName: '@'
    }
});

exports.name = moduleName;
exports.controller = Controller;
