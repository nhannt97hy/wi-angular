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
    width: 120
};

let DTRACK_CFG = {
    xNTicks: 4,
    yNTicks: 10,
    xAxisPosition: 'top',
    xFormatter: '.2f',
    yFormatter: '.2f',
    xPadding: 1,
    yPadding: 5,
    width: 60
};
let WiLogplotModel = {
    "idWell": 6,
    "name": "W4",
    "topDepth": "1119.8352",
    "bottomDepth": "2184.8064",
    "step": "0.1524",
    "createdAt": "2017-07-24T10:54:55.000Z",
    "updatedAt": "2017-07-24T10:54:55.000Z",
    "idProject": 2,
    "datasets": [
        {
            "idDataset": 6,
            "name": "W4",
            "datasetKey": "W4",
            "datasetLabel": "W4",
            "createdAt": "2017-07-24T10:54:55.000Z",
            "updatedAt": "2017-07-24T10:54:55.000Z",
            "idWell": 6,
            "curves": [
                {
                    "idCurve": 5,
                    "name": "DEPTH",
                    "dataset": "W4",
                    "family": "VNU",
                    "unit": "M",
                    "initValue": "abc",
                    "createdAt": "2017-07-24T10:54:55.000Z",
                    "updatedAt": "2017-07-24T10:54:55.000Z",
                    "idDataset": 6,
                    "idFamily": null
                },
                {
                    "idCurve": 6,
                    "name": "DTCO3",
                    "dataset": "W4",
                    "family": "VNU",
                    "unit": "US/F",
                    "initValue": "abc",
                    "createdAt": "2017-07-24T10:54:55.000Z",
                    "updatedAt": "2017-07-24T10:54:55.000Z",
                    "idDataset": 6,
                    "idFamily": 127
                },
                {
                    "idCurve": 7,
                    "name": "ECGR",
                    "dataset": "W4",
                    "family": "VNU",
                    "unit": "GAPI",
                    "initValue": "abc",
                    "createdAt": "2017-07-24T10:54:55.000Z",
                    "updatedAt": "2017-07-24T10:54:55.000Z",
                    "idDataset": 6,
                    "idFamily": 2
                }
            ]
        }
    ],
    "plots": [
        {
            "idPlot": 1,
            "name": "mock test",
            "option": "blank-plot",
            "createdAt": "2017-07-24T10:57:32.000Z",
            "updatedAt": "2017-07-24T10:57:32.000Z",
            "idWell": 6,
            "tracks": [],
            "depth_axes": []
        }
    ]
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

    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);

    this.getCurrentTrack = function () {
        return _currentTrack;
    };

    this.getTracks = function () {
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
        track.onPlotMouseOver(function () {
            if (!dragMan.dragging) return;
            dragMan.wiD3Ctrl = self;
            dragMan.track = track;
        });
        track.onPlotMouseLeave(function () {
            if (!dragMan.dragging) return;
            dragMan.wiD3Ctrl = null;
            dragMan.track = null;
        });
        track.onPlotMouseWheel(function () {
            _onPlotMouseWheelCallback(track);
        });
        track.onPlotMouseDown(function () {
            _onPlotMouseDownCallback(track);
        });
        track.onHeaderMouseDown(function () {
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
        // wiApiService.post()

    };

    this.addCurveToTrack = function (track, data, config) {
        if (!track || !track.addCurve) return;
        let curve = track.addCurve(data, config);

        let depthRange = self.getDepthRangeFromSlidingBar();
        self.setDepthRangeForTrack(track, depthRange);
        track.onCurveHeaderMouseDown(curve, function() {
            _setCurrentTrack(track);
            if (d3.event.button == 2) {
                _curveOnRightClick();
            }
        });
    }

    this.addLeftShadingToTrack = function (track, curve, config) {
        if (!track || !track.addShading) return;
        let shading =track.addShading(null, curve, null, config);
        track.plotShading(shading);
        _registerShadingHeaderMouseDownCallback(track, shading);
    };

    this.addRightShadingToTrack = function (track, curve, config) {
        if (!track || !track.addShading) return;
        let shading = track.addShading(curve, null, null, config);
        track.plotShading(shading);
        _registerShadingHeaderMouseDownCallback(track, shading);
    };

    this.addCustomShadingToTrack = function (track, curve, value, config) {
        if (!track || !track.addShading) return;
        let shading = track.addShading(curve, null, value, config);
        track.plotShading(shading);
        _registerShadingHeaderMouseDownCallback(track, shading);
    };

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
        DialogUtils.confirmDialog(ModalService, "Delete Track", "Are you sure to delete track: " + track.name + "?", function (yes) {
            if (yes) {
                let trackIdx = _tracks.indexOf(track);
                if (trackIdx < 0) return;

                if (track == _currentTrack) {
                    _currentTrack = null;
                }
                _previousTrack = null;
                if (track.removeAllDrawings) {
                    track.removeAllDrawings();
                }

                let graph = wiComponentService.getComponent('GRAPH');
                graph.removeTrack(trackIdx, document.getElementById(self.plotAreaId));

                _tracks.splice(trackIdx, 1);
            }
        })
    }

    this.plot = function (track) {
        if (track && track.doPlot) track.doPlot();
    };

    this.plotAll = function () {
        _tracks.forEach(function (track) {
            track.doPlot();
        });
    };


    this.setDepthRange = function(depthRange) {
        _depthRange = depthRange;
        _tracks.forEach(function(track) {
            track.windowY = depthRange;
        });
        self.plotAll();
    };

    this.setDepthRangeForTrack = function(track, depthRange) {
        if (_depthRange[0] != depthRange[0] || _depthRange[1] != depthRange[1]) {
            self.setDepthRange(depthRange);
        }
        else {
            track.windowY = depthRange;
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
            if (track.getExtentY) return track.getExtentY()[1];
            return -1;
        });
        _maxDepth = (maxDepth > 0) ? maxDepth : 100000;
        return _maxDepth;
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
            if (_previousTrack.setCurrentDrawing)
                _previousTrack.setCurrentDrawing(null);
            _previousTrack.setBackgroundColor('transparent');
        }

    }

    function _onPlotMouseDownCallback(track) {
        _setCurrentTrack(track);
        if (d3.event.currentDrawing && d3.event.button == 2) {
            if (d3.event.currentDrawing.isCurve()) {
                _curveOnRightClick();
            }
            else if (d3.event.currentDrawing.isShading()) {
                _shadingOnRightClick();
            }
        }
    }

    function _registerShadingHeaderMouseDownCallback(track, shading) {
        track.setCurrentDrawing(shading);
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
        if (d3.event.deltaY < 0) {
            low = _depthRange[0] - range * 0.2;
            high = _depthRange[1] + range * 0.2;
        }
        else {
            low = _depthRange[0] + range * 0.2;
            high = _depthRange[1] - range * 0.2;
        }
        low = low < 0 ? 0 : Math.floor(low);
        high = high > maxDepth ? maxDepth : Math.ceil(high);
        self.setDepthRange([low, high]);
        self.adjustSlidingBarFromDepthRange([low, high]);
    }

    function _onHeaderMouseDownCallback(track) {
        _setCurrentTrack(track);
        _currentTrack.setCurrentDrawing(null);
    }

    function _shadingOnRightClick() {
        //let posX = d3.event.clientX, posY = d3.event.clientY;
        self.setContextMenu([{
            name: "RemoveShading",
            label: "Remove Shading",
            handler: function () {
                self.removeCurrentShading();
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
                console.log("$$", currentCurve);
                DialogUtils.curvePropertiesDialog(ModalService, wiComponentService, DialogUtils, currentCurve, function(props) {
                    if (props) {
                        console.log(props);
                    }
                })
            }
        }, {
            name: "EditCurve",
            label: "Edit Curve",
            icon: "edit-curve-text-16x16",
            handler: function () {

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
                self.removeCurrentCurve();
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

            }
        }
        ]);
        /*$timeout(function() {
            console.log('++++++++++++', wiComponentService, wiComponentService.getComponent('ContextMenu'));
            wiComponentService.getComponent('ContextMenu').open(posX, posY, [{
                name: "RemoveCurve",
                label: "Remove Curve",
                handler: function () {
                    self.removeCurrentCurve();
                }
            }]);
        }, 1000);*/
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

    var commonCtxMenu = [
        {
            name: "TrackProperties",
            label: "Track Properties",
            icon: 'track-properties-16x16',
            handler: function () {
                let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
                if (!_currentTrack) return;
                if (_currentTrack.isLogTrack()) {
                    DialogUtils.logTrackPropertiesDialog(ModalService, WiLogplotModel, _currentTrack, function (props) {
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
