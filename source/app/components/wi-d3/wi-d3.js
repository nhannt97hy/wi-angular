const componentName = 'wiD3';
const moduleName = 'wi-d3';

var TRACK_CFG = {
    xNTicks: 4,
    yNTicks: 10,
    xAxisPosition: 'top',
    xFormatter: '.2f',
    yFormatter: '.2f',
    xPadding: 1,
    yPadding: 5,
    yStep: 0.25,
    plotWidth: 120 
}

var DTRACK_CFG = {
    xNTicks: 4,
    yNTicks: 10,
    xAxisPosition: 'top',
    xFormatter: '.2f',
    yFormatter: '.2f',
    xPadding: 1,
    yPadding: 5,
    yStep: 0.25,
    plotWidth: 60 
}
function Controller($scope, wiComponentService) {
    var self = this;
    var tracks = new Array();
    this.addTrack = function() {
        var graph = wiComponentService.getComponent('GRAPH');
        var track = graph.createLogTrack(TRACK_CFG, document.getElementById(self.plotAreaId));
        //track.trackPointer(true);
        var len = tracks.push(track);

        return len - 1;
    }
    this.addDepthTrack = function() {
        var graph = wiComponentService.getComponent('GRAPH');
        var track = graph.createDepthTrack(DTRACK_CFG, document.getElementById(self.plotAreaId));
        var len = tracks.push(track);

        return len - 1;
    },
    this.setDepthRange = function(deepRange) {
        tracks.forEach(function(track) {
            track.setYRange(deepRange);
        });
    }
    this.getMaxDepth = function() {
        return d3.max(tracks, function(track) { 
            if (track.getYMax) return track.getYMax();
            return -1;
        });
    }
    this.setData = function(trackIdx, data) {
        tracks[trackIdx].setData(data, 'Rock', 'm3', 0, 200);
        tracks[trackIdx].adjustXRange(1);
    }
    this.plot = function(trackIdx) {
        tracks[trackIdx].doPlot();
    }
    this.plotAll = function() {
        tracks.forEach(function(track) {
            track.doPlot();
            //if( track.trackPointer ) track.trackPointer(true);
        } );
    }
    this.$onInit = function () {
        self.plotAreaId = self.name + 'PlotArea';
        if (self.name) {
            console.log('putComponent:', self.name);
            wiComponentService.putComponent(self.name, self);
        }
    }
}

var app = angular.module(moduleName, []);
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
