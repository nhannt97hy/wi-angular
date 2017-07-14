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
        samples.push({ y: i, x: Math.random() });
    }
    return samples;
}

function Controller($scope, wiComponentService) {
    var self = this;
    var tracks = new Array();
    this.addLogTrack = function () {
        var graph = wiComponentService.getComponent('GRAPH');
        var track = graph.createLogTrack(TRACK_CFG, document.getElementById(self.plotAreaId));
        //track.trackPointer(true);
        var len = tracks.push(track);
        self.setDepthRangeFromSlidingBar();
        track.doPlot();
        var dragMan = wiComponentService.getComponent('DRAG_MAN');
        track.onDrop(function () {
            if (dragMan.dragging) {
                console.log('mouseover');
                if (dragMan.cancelingId) {
                    clearTimeout(dragMan.cancelingId);
                    dragMan.cancellingId = null;
                    dragMan.dragging = false;
                    var data = getCurveFromName(dragMan.draggedObj);
                    var max = 1;
                    console.log('data:', data);
                    track.setData(data, dragMan.draggedObj, 'm3', 0, max);
                    self.setDepthRangeFromSlidingBar();
                    track.adjustXRange(1);
                    track.doPlot();
                    dragMan.draggedObj = null;
                }
            }
        }, dragMan);
        return len - 1;
    };

    this.addDepthTrack = function () {
        let graph = wiComponentService.getComponent('GRAPH');
        let track = graph.createDepthTrack(DTRACK_CFG, document.getElementById(self.plotAreaId));
        let len = tracks.push(track);
        self.setDepthRangeFromSlidingBar();
        self.plot(len - 1);
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
        console.log(slidingBar.slidingBarState, low, high, maxDepth);
        self.setDepthRange([low, high]);
    };

    this.getMaxDepth = function () {
        var maxDepth = d3.max(tracks, function (track) {
            if (track.getYMax) return track.getYMax();
            return -1;
        });
        return (maxDepth > 0) ? maxDepth : 100000;
    };

    this.setData = function (trackIdx, data) {
        tracks[trackIdx].setData(data, 'Rock', 'm3', 0, 200);
        tracks[trackIdx].adjustXRange(1);
    };

    this.plot = function (trackIdx) {
        tracks[trackIdx].doPlot();
    };

    this.plotAll = function () {
        tracks.forEach(function (track) {
            track.doPlot();
            //if( track.trackPointer ) track.trackPointer(true);
        });
    }
    this.$onInit = function () {
        self.plotAreaId = self.name + 'PlotArea';
        if (self.name) {
            wiComponentService.putComponent(self.name, self);
        }
    };

    const defaultD3CtxMenu = [
        {
            name: "TrackPropertites",
            label: "Track Propertites",
            icon: "",
            handler: function () {

            }
        }, {
            name: "SwitchToLogarithmic",
            label: "Switch To Logarithmic",
            icon: "logarithmic-switch-16x16",
            handler: function () {

            }
        }, {
            separator: '1'
        }, {
            name: "AddDepthTrack",
            label: "Add Depth Track",
            icon: "depth-axis-add-16x16",
            handler: function () {
                self.addDepthTrack();
            }
        }, {
            name: "AddLogTrack",
            label: "Add Log Track",
            icon: "logplot-blank-16x16",
            handler: function () {
                self.addLogTrack();
            }
        }, {
            name: "AddZonationTrack",
            label: "Add Zonation Track",
            icon: "zonation-track-add-16x16",
            handler: function () {

            }
        }, {
            separator: '1'
        }, {
            name: "AddMarker",
            label: "Add Marker",
            icon: "marker-add-16x16",
            handler: function () {

            }
        }, {
            name: "AddAnnotation",
            label: "Add Annotation",
            icon: "annotation-16x16",
            handler: function () {

            }
        }, {
            name: "AddImage",
            label: "Add Image",
            icon: "image-add-16x16",
            handler: function () {

            }
        }, {
            name: "CreateShading",
            label: "Create Shading",
            icon: "shading-add-16x16",
            handler: function () {

            }
        }, {
            separator: '1'
        }, {
            name: "DuplicateTrack",
            label: "Duplicate Track",
            icon: "track-duplicate-16x16",
            handler: function () {

            }
        }, {
            name: "DeleteTrack",
            label: "Delete Track",
            icon: "track-delete-16x16",
            handler: function () {

            }
        }
    ]
    this.showContextMenu = function ($event) {
        let contextMenu = defaultD3CtxMenu;
        wiComponentService.getComponent('ContextMenu').open($event.clientX, $event.clientY, contextMenu);
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
