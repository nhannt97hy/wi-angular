let graph = require('./graph.js');
let wiD3 = require('./wi-d3.js');
let wiComponentService = require('./wi-component-service');

let app = angular.module('helloapp', [wiD3.name, wiComponentService.name]);
app.controller('WiDummy', function ($scope, wiComponentService) {
    wiComponentService.putComponent("GRAPH", graph);

    $scope.doClick = function() {
        let myPlot = wiComponentService.getComponent('myPlot');
        let idx = myPlot.addTrack();
        myPlot.setData(idx, genSamples(1000));
        myPlot.setDepthRange([10, 100]);
        myPlot.plotAll();
    };

    function genSamples(nSamples) {
        let samples = [];
        for( let i = 0; i < nSamples; i++ ) {
            samples.push({y:i, x: Math.random()});
        }
        return samples;
    }
});
