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

function Controller($scope, wiComponentService, $timeout, ModalService) {
    let self = this;
    let _tracks = new Array();
    let _currentTrack = null;
    let _previousTrack = null;

    this.getCurrentTrack = function () {
        return _currentTrack
    }

    this.getTracks = function() {
        return _tracks;
    }

    this.addLogTrack = function () {
        let graph = wiComponentService.getComponent('GRAPH');
        let track = graph.createLogTrack(TRACK_CFG, document.getElementById(self.plotAreaId));
        //track.trackPointer(true);
        let len = _tracks.push(track);
        _setCurrentTrack(track);
        self.setDepthRangeFromSlidingBar();
        track.doPlot();

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
        track.onPlotMouseDown(function() {
            _onPlotMouseDownCallback(track);
        });
        track.onHeaderMouseDown(function() {
            _onHeaderMouseDownCallback(track);
        });

        return track;
    };

    this.addDepthTrack = function () {
        let graph = wiComponentService.getComponent('GRAPH');
        let track = graph.createDepthTrack(DTRACK_CFG, document.getElementById(self.plotAreaId));
        let len = _tracks.push(track);
        _setCurrentTrack(track);
        self.setDepthRangeFromSlidingBar();
        self.plot(track);
        track.onMouseDown(function () {
            _setCurrentTrack(track);
        });
        return track;
    };

    this.addCurveToTrack = function(track, data, config) {
        if (!track || !track.addCurve) return;
        let curveIdx = track.addCurve(data, config);
        track.adjustXRange(1);
        self.setDepthRangeFromSlidingBar();
        track.doPlot();

        let curveHeader = track.getCurveHeaders()[curveIdx];
        curveHeader
            .on('mousedown', function() {
                _setCurrentTrack(track);

                let currentCurveIdx = track.getCurveHeaders().indexOf(curveHeader);
                track.setCurrentCurveIdx(currentCurveIdx);
                if (d3.event.button == 2) {
                    _curveOnRightClick();
                }
            })
            .on('contextmenu', function() {
                d3.event.stopPropagation();
                d3.event.preventDefault();
            })
    }

    this.addShadingToTrack = function (track, leftCurveIdx, rightCurveIdx, config) {
        if (!track || !track.addShading) return;
        config = typeof config != 'object' ? {} : config;
        track.addShading(leftCurveIdx, rightCurveIdx, config);
        track.doPlot();
    };

    this.setDepthRange = function (deepRange) {
        _tracks.forEach(function (track) {
            track.setYRange(deepRange);
        });
    };

    this.setDepthRangeFromSlidingBar = function () {
        let slidingBar = wiComponentService.getSlidingBarForD3Area(self.name);
        let maxDepth = self.getMaxDepth();

        let low = slidingBar.slidingBarState.top * maxDepth / 100;
        let high = (slidingBar.slidingBarState.top + slidingBar.slidingBarState.range) * maxDepth / 100;
        self.setDepthRange([low, high]);
    };

    this.getMaxDepth = function () {
        let maxDepth = d3.max(_tracks, function (track) {
            if (track.getYMax) return track.getYMax();
            return -1;
        });
        return (maxDepth > 0) ? maxDepth : 100000;
    };

    this.setColor = function (track, color) {
        if (track && track.setCurrentCurveColor) {
            track.setCurrentCurveColor(color);
        }
    };

    this.removeCurrentCurve = function() {
        if (!_currentTrack.getCurrentCurveIdx) return false;
        return self.removeCurveFromTrack(_currentTrack, _currentTrack.getCurrentCurveIdx());
    };

    this.removeCurveFromTrack = function (track, curveIdx) {
        if (!track || !track.removeCurve) return;
        track.removeCurve(curveIdx);
    };

    this.removeCurrentTrack = function () {
        return self.removeTrack(_currentTrack);
    };

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
        _clearPreviousHighlight();
    }

    function _clearPreviousHighlight() {
        if (_previousTrack != null
            && _previousTrack != _currentTrack
            && _previousTrack.setCurrentCurveIdx) {
            _previousTrack.setCurrentCurveIdx(-1);
        }
    }

    function _onPlotMouseDownCallback(track) {
        _setCurrentTrack(track);

        let i;
        let curves = _currentTrack.getCurves();
        for (i = 0; i < curves.length; i ++) {
            if (curves[i].nearPoint(d3.event.offsetX, d3.event.offsetY))
                break;
        }
        i = i == curves.length ? -1 : i;
        _currentTrack.setCurrentCurveIdx(i);
        if (i >= 0 && d3.event.button == 2) {
            _curveOnRightClick();
        }
    }

    function _onHeaderMouseDownCallback(track) {
        _setCurrentTrack(track);
        _currentTrack.setCurrentCurveIdx(-1);
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
                        console.log('Track properties');

                        //ModalService
                        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
                        DialogUtils.newProjectDialog(ModalService, function (data) {
                            let utils = wiComponentService.getComponent(wiComponentService.UTILS);
                            utils.projectOpen(self.wiComponentService, data);
                        });
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
        name: '@'
    }
});

exports.name = moduleName;
