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

function Controller($scope, wiComponentService) {
    let self = this;
    let _tracks = new Array();
    let currentTrackIdx = -1;
    let previousTrackIdx = -1;

    this.getCurrentTrack = function () {
        return _tracks[currentTrackIdx];
    };
    this.getCurrentTrackIdx = function () {
        return currentTrackIdx;
    };

    this.addTrack = function () {
        let graph = wiComponentService.getComponent('GRAPH');
        let track = graph.createLogTrack(TRACK_CFG, document.getElementById(self.plotAreaId));
        //track.trackPointer(true);
        let len = _tracks.push(track);
        _setCurrentTrackIdx(len -1);
        self.setDepthRangeFromSlidingBar();
        track.doPlot();

        let dragMan = wiComponentService.getComponent(wiComponentService.DRAG_MAN);
        track.configMouseMovementEventForDropping(dragMan, self);
        track.onPlotMouseDown(function() {
            _onPlotMouseDownCallback(track);
        });
        track.onHeaderMouseDown(function() {
            _onHeaderMouseDownCallback(track);
        });

        return len - 1;
    };

    this.addDepthTrack = function () {
        let graph = wiComponentService.getComponent('GRAPH');
        let track = graph.createDepthTrack(DTRACK_CFG, document.getElementById(self.plotAreaId));
        let len = _tracks.push(track);
        _setCurrentTrackIdx(len -1);
        self.setDepthRangeFromSlidingBar();
        self.plot(len - 1);
        track.onMouseDown(function () {
            _setCurrentTrackIdx(_tracks.indexOf(track));
        });
        return len - 1;
    };

    /* Tung add this */
    this.addCurveToTrack = function(track, data, curveName, curveUnit) {
        let curveIdx = track.addCurve(data, curveName, curveUnit, 0, 200);
        track.adjustXRange(1);
        self.setDepthRangeFromSlidingBar();
        track.doPlot();

        let curveHeader = track.getCurveHeaders()[curveIdx];
        curveHeader.on('mousedown', function() {
            _setCurrentTrackIdx(_tracks.indexOf(track));

            let currentCurveIdx = track.getCurveHeaders().indexOf(curveHeader);
            track.highlight(currentCurveIdx);
            if (d3.event.button == 2) {
                _curveOnRightClick();
            }
        });
    }

    this.addCurve = function (trackIdx, data, curveName, curveUnit) {
        if (trackIdx < 0 || trackIdx >= _tracks.length) return;

        let track = _tracks[trackIdx];
        if (!track.addCurve) return;
        self.addCurveToTrack(track, data, curveName, curveUnit);
    };

    this.addShading = function (trackIdx, leftCurveIdx, rightCurveIdx, config) {
        config = typeof config != 'object' ? {} : config;
        if (trackIdx < 0 || trackIdx >= _tracks.length) return false;
        if (!_tracks[trackIdx].addShading) return false;
        _tracks[trackIdx].addShading(leftCurveIdx, rightCurveIdx, config);
        _tracks[trackIdx].doPlot();
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

    this.setColor = function (trackIdx, color) {
        if (trackIdx < 0 || trackIdx >= _tracks.length) return;
        if (_tracks[trackIdx].setColor && _tracks[trackIdx].setColor(color)) {
            _tracks[trackIdx].doPlot();
        }
    };

    this.removeCurrentCurve = function() {
        if (!_tracks[currentTrackIdx].getCurrentCurveIdx) return false;
        return self.removeCurve(currentTrackIdx, _tracks[currentTrackIdx].getCurrentCurveIdx());
    };

    this.removeCurve = function (trackIdx, curveIdx) {
        if (trackIdx < 0 || trackIdx >= _tracks.length) return false;
        if (!_tracks[trackIdx].removeCurve) return false;
        return _tracks[trackIdx].removeCurve(curveIdx);
    };

    this.removeCurrentTrack = function () {
        return self.removeTrack(currentTrackIdx);
    };

    this.removeTrack = function (trackIdx) {
        if (trackIdx < 0 || trackIdx >= _tracks.length) return;
        if (trackIdx == currentTrackIdx) {
            currentTrackIdx = -1;
        }
        else if (trackIdx < currentTrackIdx) {
            currentTrackIdx -= 1;
        }
        previousTrackIdx = -1;
        if (_tracks[trackIdx].removeAllCurves) {
            _tracks[trackIdx].removeAllCurves();
        }

        let graph = wiComponentService.getComponent('GRAPH');
        graph.removeTrack(trackIdx, document.getElementById(self.plotAreaId));

        _tracks.splice(trackIdx, 1);
        return trackIdx;
    }

    this.plot = function (trackIdx) {
        if (trackIdx < 0 || trackIdx >= _tracks.length) return;
        _tracks[trackIdx].doPlot();
    };

    this.plotAll = function () {
        _tracks.forEach(function (track) {
            track.doPlot();
            //if( track.trackPointer ) track.trackPointer(true);
        });
    };


    /* Private Begin */
    function _setCurrentTrackIdx(idx) {
        previousTrackIdx = currentTrackIdx;
        currentTrackIdx = idx;
        _clearPreviousHighlight();
    }

    function _clearPreviousHighlight() {
        if (previousTrackIdx >= 0
            && previousTrackIdx != currentTrackIdx
            && _tracks[previousTrackIdx].highlight) {
            _tracks[previousTrackIdx].highlight(-1);
        }
    }

    function _onPlotMouseDownCallback(track) {
        _setCurrentTrackIdx(_tracks.indexOf(track));

        let i;
        let curves = _tracks[currentTrackIdx].getCurves();
        for (i = 0; i < curves.length; i ++) {
            if (curves[i].nearPoint(d3.event.offsetX, d3.event.offsetY))
                break;
        }
        i = i == curves.length ? -1 : i;
        _tracks[currentTrackIdx].highlight(i);
        if (i >= 0 && d3.event.button == 2) {
            _curveOnRightClick();
        }
    }

    function _onHeaderMouseDownCallback(track) {
        _setCurrentTrackIdx(_tracks.indexOf(track));
        _tracks[currentTrackIdx].highlight(-1);
    }

    function _curveOnRightClick() {
        console.log('Curve Right Click');
        // wiComponentService.getComponent('ContextMenu').open(d3.event.clientX, d3.event.clientY, [{
        //     name: "RemoveCurve",
        //     label: "Remove Curve",
        //     handler: function () {
        //         self.removeCurrentCurve();
        //     }
        // }]);
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
                        self.addTrack();
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
