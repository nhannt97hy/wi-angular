let wiButton = require('./wi-button.js');
let wiToolbar = require('./wi-toolbar.js');
let wiSlidingbar = require('./wi-slidingbar.js');

let graph = require('./graph.js');
let wiD3 = require('./wi-d3.js');
let wiLogplot = require('./wi-logplot.js');

let wiComponentService = require('./wi-component-service');

let app = angular.module('helloapp',
    [wiLogplot.name, wiButton.name, wiToolbar.name, wiSlidingbar.name, wiD3.name, wiComponentService.name]);

app.controller('WiDummy', function ($scope, wiComponentService) {
    wiComponentService.putComponent("GRAPH", graph);

    $scope.handlers = handlers;

    $scope.doClick = function () {
        let myPlot = wiComponentService.getComponent('myPlot').getwiD3Ctrl();
        let idx = myPlot.addTrack();
        myPlot.setData(idx, genSamples(1000));
        myPlot.setDepthRange([10, 100]);
        myPlot.plotAll();
    };

    function genSamples(nSamples) {
        let samples = [];
        for (let i = 0; i < nSamples; i++) {
            samples.push({y: i, x: Math.random()});
        }
        return samples;
    }
});

handlers = {
    Button1ButtonClicked: function () {
        console.log('Button1Button is clicked');
    },

    Button2ButtonClicked: function () {
        console.log('Button2Button is clicked');
    },

    Button3ButtonClicked: function () {
        console.log('Button3Button is clicked');
    }
};