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
    for( let i = 0; i < nSamples; i++ ) {
        samples.push({y:i, x: Math.random()});
    }
    return samples;
}

function Controller($scope, wiComponentService) {
    var self = this;
    var tracks = new Array();
    this.addTrack = function() {
        var graph = wiComponentService.getComponent('GRAPH');
        var track = graph.createLogTrack(TRACK_CFG, document.getElementById(self.plotAreaId));
        //track.trackPointer(true);
        var len = tracks.push(track);
        self.setDepthRangeFromSlidingBar();
        track.doPlot();
        var dragMan = wiComponentService.getComponent('DRAG_MAN');
        track.onDrop(function(){
            if( dragMan.dragging ) {
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

    this.setDepthRangeFromSlidingBar = function() {
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
        return (maxDepth > 0)?maxDepth: 100000;
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
        } );
    }
    this.$onInit = function () {
        self.plotAreaId = self.name + 'PlotArea';
        if (self.name) {
            wiComponentService.putComponent(self.name, self);
        }
    };
    this.contextMenu = function(event) {
        console.log('context menu', event, event.button == 2);

        if(event.button != 2) return;
        event.stopPropagation();
        wiComponentService.getComponent('ContextMenu').open(event.clientX, event.clientY, [{
            name: "NewDepthTrack",
            label: "Add depth track",
            handler: function() {
                self.addDepthTrack();
            }
        }, {
            separator: '1'
        }, {
            name: "NewLogTrack",
            label: "Add new track ... ",
            handler: function() {
                self.addTrack();
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
