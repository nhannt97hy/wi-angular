const componentName = 'wiD3';
const moduleName = 'wi-d3';

function Controller($scope, wiComponentService, $timeout, ModalService, wiApiService, $compile) {
    let self = this;
    let graph = wiComponentService.getComponent(wiComponentService.GRAPH);
    let Utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let LayoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
    let logplotHandlers = {};

    let _referenceLine = true;
    let _fitWindow = false;
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
    let _currentTrack = null;
    let _previousTrack = null;
    let _tooltip = true;
    this.compileFunc = $compile;
    this.scopeObj = $scope;
    this.trackComponents = [];
    this.getContextMenu = function() {
        return contextMenu;
    }
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
    this.showContextMenu = function (event) {
        console.log('wi-d3 contextMenu is opened');
        if (event.button != 2) return;
       
        event.stopPropagation();
        wiComponentService.getComponent('ContextMenu')
            .open(event.clientX, event.clientY, self.getContextMenu(), function () {});
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
    }

    this.getDepthRange = function () {
        let _depthRange = [self._minY, self._maxY];
        return _depthRange.map(function (d) {
            return Math.round(d * 10000) / 10000;
        });
    }
    this.getDepthRangeRaw = function () {
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
    this.getLogplotHandler = function () {
        return logplotHandlers;
    }
    this.getOrderKey = getOrderKey;

    this.shouldShowSlider = function() {
        return self.contentWidth > self.sliderWidth + 45;
    }
    this.shouldHaveCorrelationTrack = function(index) {
        let currTC = self.trackComponents[index];
        let prevTC = self.trackComponents[index-1];
        if(!prevTC)  return false;
        let currTCWellProps = currTC.controller ? currTC.controller.getWellProps() : null;
        let prevTCWellProps = prevTC.controller ? prevTC.controller.getWellProps() : null;
        if(currTCWellProps && prevTCWellProps && currTCWellProps.idWell != prevTCWellProps.idWell) {
            return true;
        }
        return false;
    }
    this.getPropertiesForCorrelationTrack = function(index) {
        return {
            name: 'Correlation ' + index,
            width: 1
        }
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

        // BUG: sometime trackPlotHeight = 0 because the svg element is not ready yet.
        // let trackPlotHeight = trackPlot.getAttribute('height');
        // FIXED(TO BE REVIEWED): use actual height of parent element instead
        let trackPlotHeight = $(trackPlot.parentElement).height();

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
        this.wiLogplotCtrl.updateScale(this.scale);
    }
    this.setCurrentTrack = function (trackComponent) {
        _setCurrentTrack(trackComponent);
    }
    this.setDepthRange = function (depthRange, notPlot) {
        if(Number.isNaN(depthRange[0] || Number.isNaN(depthRange[1]))) return;
        self._minY = depthRange[0];
        self._maxY = depthRange[1];
    };
    this.scroll = function () {
        let slidingBar = wiComponentService.getSlidingBarForD3Area(self.name);
        let value = (d3.event.deltaY<0)? 1 : -1;
        slidingBar.scroll(value);

        if(!self.trackUnderMouse) return;
        let trackController = self.trackUnderMouse.controller;
        let mouse = d3.mouse(trackController.viTrack.plotContainer.node());
		let depth = trackController.viTrack.getTransformY().invert(mouse[1]);
		self.trackComponents.forEach(tc => tc.controller.drawTooltip(depth));
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

        let topDepth = self.getMaxDepth();
        let bottomDepth = self.getMinDepth();

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
        self.updateMultiWellState();
    }

    this.getComponentCtrlByViTrack = getComponentCtrlByViTrack;
    this.getComponentCtrlByProperties = getComponentCtrlByProperties;

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
                    
                    let currentState = JSON.parse(plot.currentState);
                    let depthRange = [];
                    if(_.isNumber(currentState.top) && _.isNumber(currentState.bottom)) {
                        depthRange = [currentState.top, currentState.bottom];
                    } else {
                        // default depth range for logplot (1/10 sliding bar)
                        depthRange = [self.getMinDepth(), self.getMaxDepth() / 10];
                    }
                    let wiSlidingBarCtrl = logplotCtrl.getSlidingbarCtrl();

                    self._minY = depthRange[0];
                    self._maxY = depthRange[1];

                    wiSlidingBarCtrl.createPreview(plot.referenceCurve, function() {
                        self.trackComponents = tracks;

                        let timerHandle = setInterval(function() {
                            let isReady = !self.trackComponents.filter((tc) => {
                                if(!tc.controller) return true;
                                if(tc.idTrack) return !tc.controller.isIdle;
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
                                wiComponentService.emit(wiComponentService.LOGPLOT_LOADED_EVENT); 
                                self.isReady = true;
                            }
                        }, 100);
                    })
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
        self.sliderWidth = self.sliderWidth < 0 ? 0:self.sliderWidth;
        if (!self.shouldShowSlider()) self.slider.noUiSlider.reset();
        self.slider.noUiSlider.updateOptions({}); // fire event 'update';
        $scope.safeApply();
    }

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
    this.autoOrganizeTrackByWell = function() {
        reindexAllTracks({byWell: true});
    }
    function reindexAllTracks(options) {
        let tcs = self.trackComponents;
        let listWells = self.getListWells();
        for (let i = 0; i < tcs.length; i++) {
            let orderNum;
            if(options.byWell) {
                if(tcs[i].controller.getWellProps) {
                    let wellProps = tcs[i].controller.getWellProps();
                    idxWell = listWells.indexOf(wellProps);   
                    orderNum = String.fromCharCode(77 + idxWell);
                } else {
                    orderNum = 'L';
                }
                if (i == 0) orderNum += 'm';
                else orderNum += String.fromCharCode(tcs[i - 1].orderNum.charCodeAt(1) + 1);
            } else {
                if (i == 0) orderNum = 'm';
                else orderNum = String.fromCharCode(tcs[i - 1].orderNum.charCodeAt(0) + 1);
            }
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
        containerName: '@'
    }
});

exports.name = moduleName;
exports.controller = Controller;
