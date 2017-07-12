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
    var nSamples = 1000;
    var samples = new Array();
    for (let i = 0; i < nSamples; i++) {
        samples.push({y: i, x: Math.random()});
    }
    return samples;
}

function Controller($scope, wiComponentService) {
    var self = this;
    var tracks = new Array();
    var currentTrackIdx = -1;
    var previousTrackIdx = -1;

    this.addTrack = function() {
        var graph = wiComponentService.getComponent('GRAPH');
        var track = graph.createLogTrack(TRACK_CFG, document.getElementById(self.plotAreaId));
        //track.trackPointer(true);
        var len = tracks.push(track);
        currentTrackIdx = len -1;
        self.setDepthRangeFromSlidingBar();
        track.doPlot();
        var dragMan = wiComponentService.getComponent('DRAG_MAN');
        track.onDrop(function(){
            if( dragMan.dragging ) {
                if (dragMan.cancelingId) {
                    clearTimeout(dragMan.cancelingId);
                    dragMan.cancellingId = null;
                    dragMan.dragging = false;
                    var data = getCurveFromName(dragMan.draggedObj);
                    var max = 1;
                    track.addCurve(data, dragMan.draggedObj, 'm3', 0, max);
                    self.setDepthRangeFromSlidingBar();
                    track.adjustXRange(1);
                    track.doPlot();
                    dragMan.draggedObj = null;
                }
            }
        }, dragMan);
        track.onMouseDown(function() {
            previousTrackIdx = currentTrackIdx;
            currentTrackIdx = tracks.indexOf(track);
            _clearHighlight();

            let i;
            let curves = tracks[currentTrackIdx].getCurves();
            for (i = 0; i < curves.length; i ++) {
                if (curves[i].nearPoint(d3.event.offsetX, d3.event.offsetY))
                    break;
            }
            i = i == curves.length ? -1 : i;
            tracks[currentTrackIdx].highlight(i);
        });
        return len - 1;
    };

    this.addDepthTrack = function () {
        let graph = wiComponentService.getComponent('GRAPH');
        let track = graph.createDepthTrack(DTRACK_CFG, document.getElementById(self.plotAreaId));
        let len = tracks.push(track);
        self.setDepthRangeFromSlidingBar();
        self.plot(len - 1);

        track.onMouseDown(function() {
            previousTrackIdx = currentTrackIdx;
            currentTrackIdx = tracks.indexOf(track);
            _clearHighlight();
        });
        return len - 1;
    };

    this.setDepthRange = function (deepRange) {
        tracks.forEach(function (track) {
            track.setYRange(deepRange);
        });
    };

    this.setDepthRangeFromSlidingBar = function () {
        var slidingBar = wiComponentService.getSlidingBarForD3Area(self.name);
        var maxDepth = self.getMaxDepth();

        var low = slidingBar.slidingBarState.top * maxDepth / 100;
        var high = (slidingBar.slidingBarState.top + slidingBar.slidingBarState.range) * maxDepth / 100;
        self.setDepthRange([low, high]);
    };

    this.getMaxDepth = function () {
        var maxDepth = d3.max(tracks, function (track) {
            if (track.getYMax) return track.getYMax();
            return -1;
        });
        return (maxDepth > 0) ? maxDepth : 100000;
    };

    this.getCurrentTrackIdx = function() {
        return currentTrackIdx;
    };

    this.setColor = function(trackIx, color) {
        if (trackIdx < 0 || trackIdx >= tracks.length) return;
        if (tracks[trackIdx].setColor && tracks[trackIdx].setColor(color)) {
            tracks[trackIdx].doPlot();
        }
    }

    this.addCurve = function (trackIdx, data, curveName, curveUnit) {
        if (trackIdx < 0 || trackIdx >= tracks.length) return;
        if (tracks[trackIdx].addCurve) {
            tracks[trackIdx].addCurve(data, curveName, curveUnit, 0, 200);
            tracks[trackIdx].adjustXRange(1);
        }
    };

    this.removeSelectedCurve = function() {
        if (currentTrackIdx >= 0 && tracks[currentTrackIdx].removeCurve) {
            tracks[currentTrackIdx].removeCurve();
            tracks[currentTrackIdx].doPlot();
        }
    };


    this.removeTrack = function(trackIdx) {
        if (trackIdx < 0 || trackIdx >= tracks.length) return;
        if (trackIdx == currentTrackIdx) {
            currentTrackIdx = -1;
        }
        else if (trackIdx < currentTrackIdx) {
            currentTrackIdx -= 1;
        }
        previousTrackIdx = -1;
        if (tracks[trackIdx].removeAllCurves) {
            tracks[trackIdx].removeAllCurves();
        }
        let base = d3.select(document.getElementById(self.plotAreaId));
        base.selectAll('.track-container')
            .filter(function(d, i) { return i == trackIdx; })
            .remove();

        base.selectAll('.track-resizer')
            .filter(function(d, i) { return i == trackIdx; })
            .remove();

        tracks.splice(trackIdx, 1);
    }

    this.plot = function (trackIdx) {
        if (trackIdx < 0 || trackIdx >= tracks.length) return;
        tracks[trackIdx].doPlot();
    };

    this.toggleShading = function(trackIdx) {
        if (trackIdx < 0 || trackIdx >= tracks.length) return;
        tracks[trackIdx].toggleShading();
        this.plot(trackIdx);
    };

    this.plotAll = function () {
        tracks.forEach(function (track) {
            track.doPlot();
            //if( track.trackPointer ) track.trackPointer(true);
        } );
    };

    function _clearHighlight() {
        if (previousTrackIdx >= 0
            && previousTrackIdx != currentTrackIdx
            && tracks[previousTrackIdx].highlight) {
            tracks[previousTrackIdx].highlight(-1);
        }
    }

    this.$onInit = function () {
        self.plotAreaId = self.name + 'PlotArea';
        if (self.name) {
            wiComponentService.putComponent(self.name, self);
            wiComponentService.emit(self.name);
        }
    };
    this.contextMenu = function(event) {
        if(event.button != 2) return;
        event.stopPropagation();
        wiComponentService.getComponent('ContextMenu').open(event.clientX, event.clientY, [{
            name: "NewDepthTrack",
            label: "Add depth track",
            handler: function () {
                self.addDepthTrack();
            }
        }, {
            separator: '1'
        }, {
            name: "NewLogTrack",
            label: "Add new track ... ",
            handler: function () {
                self.addTrack();
            }
        },{
            name: "hhhhh",
            label: "HHHHHHHH",
            handler: function() {
                console.log(self);
            }
        }]);
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
