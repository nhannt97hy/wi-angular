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
    let nSamples = 1000;
    let samples = new Array();
    for (let i = 0; i < nSamples; i++) {
        samples.push({y: i, x: Math.random()});
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
        currentTrackIdx = len - 1;
        self.setDepthRangeFromSlidingBar();
        track.doPlot();
        let dragMan = wiComponentService.getComponent('DRAG_MAN');
        track.onDrop(function () {
            if (dragMan.dragging) {
                if (dragMan.cancelingId) {
                    clearTimeout(dragMan.cancelingId);
                    dragMan.cancellingId = null;
                    dragMan.dragging = false;
                    let data = getCurveFromName(dragMan.draggedObj);
                    let max = 1;
                    track.addCurve(data, dragMan.draggedObj, 'm3', 0, max);
                    self.setDepthRangeFromSlidingBar();
                    track.adjustXRange(1);
                    track.doPlot();
                    dragMan.draggedObj = null;
                }
            }
        }, dragMan);
        track.onMouseDown(function () {
            previousTrackIdx = currentTrackIdx;
            currentTrackIdx = _tracks.indexOf(track);
            _clearHighlight();

            let i;
            let curves = _tracks[currentTrackIdx].getCurves();
            for (i = 0; i < curves.length; i++) {
                if (curves[i].nearPoint(d3.event.offsetX, d3.event.offsetY))
                    break;
            }
            i = i == curves.length ? -1 : i;
            _tracks[currentTrackIdx].highlight(i);
        });
        return len - 1;
    };

    this.addDepthTrack = function () {
        let graph = wiComponentService.getComponent('GRAPH');
        let track = graph.createDepthTrack(DTRACK_CFG, document.getElementById(self.plotAreaId));
        let len = _tracks.push(track);
        self.setDepthRangeFromSlidingBar();
        self.plot(len - 1);

        track.onMouseDown(function () {
            previousTrackIdx = currentTrackIdx;
            currentTrackIdx = _tracks.indexOf(track);
            _clearHighlight();
        });
        return len - 1;
    };

    this.addCurve = function (trackIdx, data, curveName, curveUnit) {
        if (trackIdx < 0 || trackIdx >= _tracks.length) return;
        if (!_tracks[trackIdx].addCurve) return;
        let curveIdx = _tracks[trackIdx].addCurve(data, curveName, curveUnit, 0, 200);
        _tracks[trackIdx].adjustXRange(1);
        self.setDepthRangeFromSlidingBar();
        _tracks[trackIdx].doPlot();
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

    this.removeCurve = function (trackIdx, curveIdx) {
        if (trackIdx < 0 || trackIdx >= _tracks.length) return false;
        if (!_tracks[trackIdx].removeCurve) return false;
        return _tracks[trackIdx].removeCurve(curveIdx);
    };

    this.removeCurrentCurve = function () {
        return self.removeCurve(currentTrackIdx, _tracks[currentTrackIdx].getCurrentCurveIdx());
    };

    this.removeCurrentTrack = function () {
        self.removeTrack(self.getCurrentTrackIdx());
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
        let base = d3.select(document.getElementById(self.plotAreaId));
        base.selectAll('.track-container')
            .filter(function (d, i) {
                return i == trackIdx;
            })
            .remove();

        base.selectAll('.track-resizer')
            .filter(function (d, i) {
                return i == trackIdx;
            })
            .remove();

        _tracks.splice(trackIdx, 1);
    }

    this.plot = function (trackIdx) {
        if (trackIdx < 0 || trackIdx >= _tracks.length) return;
        _tracks[trackIdx].doPlot();
    };

    this.toggleShading = function (trackIdx) {
        if (trackIdx < 0 || trackIdx >= _tracks.length) return;
        _tracks[trackIdx].toggleShading();
        this.plot(trackIdx);
    };

    this.plotAll = function () {
        _tracks.forEach(function (track) {
            track.doPlot();
            //if( track.trackPointer ) track.trackPointer(true);
        });
    };

    function _clearHighlight() {
        if (previousTrackIdx >= 0
            && previousTrackIdx != currentTrackIdx
            && _tracks[previousTrackIdx].highlight) {
            _tracks[previousTrackIdx].highlight(-1);
        }
    }

    this.$onInit = function () {
        self.plotAreaId = self.name + 'PlotArea';
        if (self.name) {
            wiComponentService.putComponent(self.name, self);
            wiComponentService.emit(self.name);
        }
    };

    this.contextMenu = function (event) {
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
                    handler: function () {
                        self.addDepthTrack();
                    }
                },
                {
                    name: "AddLogTrack",
                    label: "Add Log Track",
                    handler: function () {
                        self.addTrack();
                    }
                },
                {
                    name: "AddZonationTrack",
                    label: "Add Zonation Track",
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
                    handler: function () {
                        console.log('Switch To Logarithmic');
                    }
                },
                {
                    name: "Add Annotation",
                    label: "Add Annotation",
                    handler: function () {
                        console.log('Switch To Logarithmic');
                    }
                },
                {
                    name: "Add Image",
                    label: "Add Image",
                    handler: function () {
                        console.log('Switch To Logarithmic');
                    }
                },
                {
                    name: "Create Shading",
                    label: "Create Shading",
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
                    handler: function () {
                        console.log('Switch To Logarithmic');
                    }
                },
                {
                    name: "DeleteTrack",
                    label: "Delete Track",
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
