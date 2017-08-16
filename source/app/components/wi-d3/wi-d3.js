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

    this.addLogTrack = function(trackTitle, callback) {
        var trackOrder = getOrderKey();
        if (trackOrder) {
            wiApiService.createLogTrack(self.logPlotCtrl.id, trackOrder, function(ret) {
                wiApiService.infoTrack(ret.idTrack, function(logTrack) {
                    logTrack.title = trackTitle;
                    let viTrack = self.pushLogTrack(logTrack);
                    wiApiService.editTrack(logTrack);
                    if (!callback) return;
                    callback(viTrack);
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
            orderNum: depthTrack.orderNum,
            yStep: parseFloat(_getWellProps().step),
            offsetY: parseFloat(_getWellProps().topDepth)
        };

        let track = graph.createDepthTrack(config, document.getElementById(self.plotAreaId));
        graph.rearangeTracks(self);

        _tracks.push(track);
        _tracks.sort(function(track1, track2) {
            return track1.orderNum.localeCompare(track2.orderNum);
        });

        _setCurrentTrack(track);

        let depthRange = self.getDepthRangeFromSlidingBar();
        self.setDepthRangeForTrack(track, depthRange);

        track.on('focus', function () {
            _setCurrentTrack(track);
        });
        track.on('dblclick', function() {
            openTrackPropertiesDialog();
        });
        _registerTrackHorizontalResizerDragCallback();
    };

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
        let shading = track.addShading(curve, null, value, config);
        track.plotShading(shading);
        _registerShadingHeaderMouseDownCallback(track, shading);
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
        track.on('focus', function() {
            _setCurrentTrack(track);
        });
        track.on('keydown', function() {
            _onTrackKeyPressCallback(track);
        });
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
        switch (d3.event.key) {
            case 'Backspace':
            case 'Delete':
                let curve = track.getCurrentCurve();
                console.log(curve);

                if(curve) {
                    let props = curve.getProperties();
                    console.log(props);
                    let idLine = props.idLine;
                    wiApiService.removeLine(idLine, function() {
                       track.removeCurve(curve);
                    });
                }


                return;
        }
    }

    function _shadingOnDoubleClick() {
        console.log('Shading double clicked');

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

    function _shadingOnRightClick() {
        //let posX = d3.event.clientX, posY = d3.event.clientY;
        self.setContextMenu([{
            name: "RemoveShading",
            label: "Remove Shading",
            handler: function () {
                self.removeCurrentShading();
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
                DialogUtils.curvePropertiesDialog(ModalService, wiComponentService, wiApiService, DialogUtils, currentCurve, _currentTrack, self.wiLogplotCtrl)
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
            handler: function () {
                let curve1 = _currentTrack.getCurrentCurve();
                let curve2 = _currentTrack.getTmpCurve();
                if (!curve1 || !curve2) {
                    console.log('Two curves are needed');
                }
                else {
                    console.log('Create crossplot', curve1, curve2);
                }
            }
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

                if (!curve1) return;
                if (!curve2) {
                    // This should open dialog
                    self.addLeftShadingToTrack(_currentTrack, curve1, {});
                }
                else {
                    self.addPairShadingToTrack(_currentTrack, curve1, curve2, {});
                }
            }
        }
        ]);
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
            });
        } else if (_currentTrack.isDepthTrack()) {
            DialogUtils.depthTrackPropertiesDialog(ModalService, function (props) {
                if (props) {
                    console.log('depthTrackPropertiesData', props);
                }
            });
        } else { //TODO: zoneTrack condition
            DialogUtils.zoneTrackPropertiesDialog(ModalService, function (props) {
                if (props) {
                    console.log('zoneTrackPropertiesData', props);
                }
            });
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
                console.log('Switch To Logarithmic');
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
                console.log('Switch To Logarithmic');
            }
        },
        {
            separator: '1'
        },
        {
            name: "AddMaker",
            label: "Add Maker",
            icon: 'marker-add-16x16',
            handler: function () {
                console.log('Switch To Logarithmic');
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
                console.log('Switch To Logarithmic');
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
