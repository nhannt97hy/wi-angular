const componentName = 'wiD3';
const moduleName = 'wi-d3';

var TRACK_CFG = {
    xNTicks: 4,
    yNTicks: 10,
    xAxisPosition: 'top',
    xFormatter: '.2f',
    yFormatter: '.2f',
    xPadding: 50,
    yPadding: 10,
    yStep: 0.25,
    plotWidth: 250 
}

function Controller($scope, wiComponentService) {
    var self = this;
    console.log('wi-d3: Init');
    var tracks = new Array();
    this.addTrack = function() {
        var graph = wiComponentService.getComponent('GRAPH');
        var track = graph.createLogPlot(TRACK_CFG, document.getElementById(self.plotAreaId));
        track.trackPointer(true);
        var len = tracks.push(track);

        return len - 1;
    }
    this.setDepthRange = function(deepRange) {
        tracks.forEach(function(track) {
            track.setYRange(deepRange);
        });
    }
    this.getMaxDepth = function() {
        return d3.max(tracks, function(track) { return track.getYMax();});
    }
    this.setData = function(trackIdx, data) {
        tracks[trackIdx].setData(data);
        tracks[trackIdx].adjustXRange();
    }
    this.plot = function(trackIdx) {
        tracks[trackIdx].doPlot();
    }
    this.plotAll = function() {
        tracks.forEach(function(track) {
            track.doPlot();
            track.trackPointer(true);
        } );
    }
    this.$onInit = function () {
        console.log('wi-d3: onInit');
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
