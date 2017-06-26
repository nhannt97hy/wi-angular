var wiD3 = require('./wi-d3.js');
var wiComponentService = require('./wi-component-service');
var graph = require('./graph.js');

var app = angular.module('helloapp', [wiD3.name, wiComponentService.name]);
app.controller('WiDummy', function ($scope, wiComponentService) {
    wiComponentService.putComponent("GRAPH", graph);
    console.log('Fuck');
    function genSamples(nSamples) {
        var samples = new Array();
        for( let i = 0; i < nSamples; i++ ) {
            samples.push({y:i, x: Math.random()});
        }
        return samples;
    }
    $scope.doClick = function() {
        console.log('Do click');
        var myPlot = wiComponentService.getComponent('myPlot')
        var idx = myPlot.addTrack();
        myPlot.setData(idx, genSamples(1000));
        myPlot.setDepthRange([10, 100]);
        myPlot.plotAll();
    }
});
