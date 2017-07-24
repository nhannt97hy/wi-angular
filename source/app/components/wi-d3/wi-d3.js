const componentName = 'wiD3';
const moduleName = 'wi-d3';

let TRACK_CFG = {
    xNTicks: 4,
    yNTicks: 10,
    xAxisPosition: 'top',
    xFormatter: '.2f',
    yFormatter: '.2f',
    xPadding: 1,
    yPadding: 5,
    yStep: 0.25,
    plotWidth: 120
};

let DTRACK_CFG = {
    xNTicks: 4,
    yNTicks: 10,
    xAxisPosition: 'top',
    xFormatter: '.2f',
    yFormatter: '.2f',
    xPadding: 1,
    yPadding: 5,
    yStep: 0.25,
    plotWidth: 60
};

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
    let _tracks = [];
    let _currentTrack = null;
    let _previousTrack = null;
    let _depthRange = [0, 100000];
    let _selectedColor = '#ffffe0';

    this.getCurrentTrack = function () {
        return _currentTrack;
    };

    this.getTracks = function() {
        return _tracks;
    };

    this.addLogTrack = function () {
        let graph = wiComponentService.getComponent('GRAPH');
        let track = graph.createLogTrack(TRACK_CFG, document.getElementById(self.plotAreaId));
        _tracks.push(track);
        _setCurrentTrack(track);

        let depthRange = self.getDepthRangeFromSlidingBar();
        self.setDepthRangeForTrack(track, depthRange);

        let dragMan = wiComponentService.getComponent(wiComponentService.DRAG_MAN);
        track.onPlotMouseOver(function() {
            if( !dragMan.dragging ) return;
            dragMan.wiD3Ctrl = self;
            dragMan.track = track;
        });
        track.onPlotMouseLeave(function() {
            if( !dragMan.dragging ) return;
            dragMan.wiD3Ctrl = null;
            dragMan.track = null;
        });
        track.onPlotMouseWheel(function() {
            _onPlotMouseWheelCallback(track);
        });
        track.onPlotMouseDown(function() {
            _onPlotMouseDownCallback(track);
        });
        track.onHeaderMouseDown(function() {
            _onHeaderMouseDownCallback(track);
        });

        return track;
    };

    this.addDepthTrack = function (callback) {
        let graph = wiComponentService.getComponent('GRAPH');
        let track = graph.createDepthTrack(DTRACK_CFG, document.getElementById(self.plotAreaId));
        _tracks.push(track);
        _setCurrentTrack(track);

        let depthRange = self.getDepthRangeFromSlidingBar();
        self.setDepthRangeForTrack(track, depthRange);

        track.onMouseDown(function () {
            _setCurrentTrack(track);
        });

        // send http request
        wiApiService.post()

    };

    this.addCurveToTrack = function(track, data, config) {
        if (!track || !track.addCurve) return;
        let curve = track.addCurve(data, config);

        let depthRange = self.getDepthRangeFromSlidingBar();
        self.setDepthRangeForTrack(track, depthRange);

        track.onCurveHeaderMouseDown(curve, function() {
            _setCurrentTrack(track);
            track.setCurrentCurve(curve);
            if (d3.event.button == 2) {
                _curveOnRightClick();
            }
        });
    }

    this.addLeftShadingToTrack = function (track, config) {
        if (!track || !track.addLeftShading) return;
        let shading = track.addLeftShading(track.getCurrentCurve(), config);
        track.plotShading(shading);
        _registerShadingHeaderMouseDownCallback(track, shading);
    };

    this.addRightShadingToTrack = function (track, config) {
        if (!track || !track.addRightShading) return;
        let shading = track.addRightShading(track.getCurrentCurve(), config);
        track.plotShading(shading);
        _registerShadingHeaderMouseDownCallback(track, shading);
    };

    this.addCustomShadingToTrack = function (track, value, config) {
        if (!track || !track.addCustomShading) return;
        let shading = track.addCustomShading(track.getCurrentCurve(), value, config);
        track.plotShading(shading);
        _registerShadingHeaderMouseDownCallback(track, shading);
    };

    this.setDepthRange = function(depthRange) {
        _depthRange = depthRange;
        _tracks.forEach(function(track) {
            track.setViewportY(depthRange);
        });
        self.plotAll();
    };

    this.setDepthRangeForTrack = function(track, depthRange) {
        if (_depthRange[0] != depthRange[0] || _depthRange[1] != depthRange[1]) {
            self.setDepthRange(depthRange);
        }
        else {
            track.setViewportY(depthRange);
            self.plot(track);
            _depthRange = depthRange;
        }
    }

    this.getDepthRangeFromSlidingBar = function() {
        let slidingBar = wiComponentService.getSlidingBarForD3Area(self.name);
        let maxDepth = self.getMaxDepth();

        let low = slidingBar.slidingBarState.top * maxDepth / 100;
        let high = (slidingBar.slidingBarState.top + slidingBar.slidingBarState.range) * maxDepth / 100;
        return [low, high];
    }

    this.adjustSlidingBarFromDepthRange = function(vY) {
        let slidingBar = wiComponentService.getSlidingBarForD3Area(self.name);
        let maxDepth = self.getMaxDepth();

        let top = Math.round(vY[0] * 100 / maxDepth);
        let range = Math.round(vY[1] * 100 / maxDepth) - top;
        slidingBar.updateSlidingHandlerByPercent(top, range || 1);
    }

    this.getMaxDepth = function () {
        let maxDepth = d3.max(_tracks, function (track) {
            if (track.getYMax) return track.getYMax();
            return -1;
        });

        _maxDepth = (maxDepth > 0) ? maxDepth : 100000;
        return _maxDepth;
    };

    this.setColor = function (track, color) {
        if (track && track.setCurrentCurveColor) {
            track.setCurrentCurveColor(color);
        }
    };

    this.removeCurrentCurve = function() {
        if (!_currentTrack.getCurrentCurve) return;
        self.removeCurveFromTrack(_currentTrack, _currentTrack.getCurrentCurve());
    }

    this.removeCurrentShading = function() {
        if (!_currentTrack.getCurrentShading) return;
        self.removeShadingFromTrack(_currentTrack, _currentTrack.getCurrentShading());
    }

    this.removeCurveFromTrack = function(track, curve) {
        if (!track || !track.removeCurve) return;
        track.removeCurve(curve);
    }

    this.removeShadingFromTrack = function(track, shading) {
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
        if (track.removeAllCurves) {
            track.removeAllCurves();
        }

        let graph = wiComponentService.getComponent('GRAPH');
        graph.removeTrack(trackIdx, document.getElementById(self.plotAreaId));

        _tracks.splice(trackIdx, 1);
    }

    this.plot = function (track) {
        if (track && track.doPlot) track.doPlot();
    };

    this.plotAll = function () {
        _tracks.forEach(function (track) {
            track.doPlot();
        });
    };


    /* Private Begin */
    function _setCurrentTrack(track) {
        _previousTrack = _currentTrack;
        _currentTrack = track;
        _currentTrack.setBackgroundColor(_selectedColor);
        _clearPreviousHighlight();
    }

    function _clearPreviousHighlight() {
        if (!_previousTrack) return;
        if (_previousTrack != _currentTrack) {
            if (_previousTrack.setCurrentCurve)
                _previousTrack.setCurrentCurve(null);
            _previousTrack.setBackgroundColor('transparent');
        }

    }

    function _onPlotMouseDownCallback(track) {
        _setCurrentTrack(track);
        if (d3.event.curveMouseDown && d3.event.button == 2) {
            _curveOnRightClick();
            return;
        }

        if (d3.event.shadingMouseDown && d3.event.button == 2) {
            _shadingOnRightClick();
        }
    }

    function _registerShadingHeaderMouseDownCallback(track, shading) {
        track.onShadingHeaderMouseDown(shading, function() {
            _setCurrentTrack(track);
            if (d3.event.button == 2) {
                _shadingOnRightClick();
            }
        })
    }

    function _onPlotMouseWheelCallback(track) {
        let range = _depthRange[1] - _depthRange[0];
        let low, high, maxDepth = self.getMaxDepth();
        let yStep = track.getYStep();
        if (d3.event.deltaY < 0) {
            low = _depthRange[0] - range*0.2;
            high = _depthRange[1] + range*0.2;
        }
        else {
            low = _depthRange[0] + range*0.2;
            high = _depthRange[1] - range*0.2;
        }
        low = low < 0 ? 0 : Math.floor(low / yStep) * yStep;
        high = high > maxDepth ? maxDepth : Math.ceil(high / yStep) * yStep;
        self.setDepthRange([low, high]);
        self.adjustSlidingBarFromDepthRange([low, high]);
    }

    function _onHeaderMouseDownCallback(track) {
        _setCurrentTrack(track);
        _currentTrack.setCurrentCurve(null);
    }

    function _shadingOnRightClick() {
        let posX = d3.event.clientX, posY = d3.event.clientY;
        d3.event.stopPropagation();
        d3.event.preventDefault();
        $timeout(function() {
            wiComponentService.getComponent('ContextMenu').open(posX, posY, [{
                name: "RemoveShading",
                label: "Remove Shading",
                handler: function () {
                    self.removeCurrentShading();
                }
            }]);
        });
    }

    function _curveOnRightClick() {
        let posX = d3.event.clientX, posY = d3.event.clientY;
        d3.event.stopPropagation();
        d3.event.preventDefault();
        $timeout(function() {
            wiComponentService.getComponent('ContextMenu').open(posX, posY, [{
                name: "RemoveCurve",
                label: "Remove Curve",
                handler: function () {
                    self.removeCurrentCurve();
                }
            }]);
        });
    }

    /* Private End */

    this.$onInit = function () {
        self.plotAreaId = self.name + 'PlotArea';

        console.log('wiLogplotCtrl of wi-d3', self.wiLogplotCtrl);

        if (self.name) {
            wiComponentService.putComponent(self.name, self);
            wiComponentService.emit(self.name);
        }
    };

    this.showContextMenu = function (event) {
        if (event.button != 2) return;
        event.stopPropagation();
        wiComponentService.getComponent('ContextMenu')
            .open(event.clientX, event.clientY, [
                {
                    name: "TrackProperties",
                    label: "Track Properties",
                    icon: 'track-properties-16x16',
                    handler: function () {
                        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
                        if (!_currentTrack) return;
                        if (_currentTrack.isLogTrack()) {
                            DialogUtils.logTrackPropertiesDialog(ModalService, function (props) {
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
                        console.log('Switch To Logarithmic');
                    }
                },
                {
                    name: "DeleteTrack",
                    label: "Delete Track",
                    icon: 'track-delete-16x16',
                    handler: function () {
                        self.removeCurrentTrack();
                    }
                },
            ]);
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
