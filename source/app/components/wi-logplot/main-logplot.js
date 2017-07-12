let wiButton = require('./wi-button.js');
let wiToolbar = require('./wi-toolbar.js');
let wiSlidingbar = require('./wi-slidingbar.js');
let wiContextMenu = require('./wi-context-menu.js');

let graph = require('./visualize/visualize.js');
console.log('graph:', graph);
let wiD3 = require('./wi-d3.js');
let wiLogplot = require('./wi-logplot.js');
let wiElementReadyDirective = require('./wi-element-ready-directive');

let wiComponentService = require('./wi-component-service');

let utils = require('./utils');

let dragMan = {
    dragging: false,
    draggedObj: null,
    cancelingId: null
};


let app = angular.module('helloapp',
    [wiLogplot.name, wiButton.name, wiToolbar.name, wiSlidingbar.name, wiContextMenu.name, wiD3.name, wiComponentService.name,
        wiElementReadyDirective.name,
        'angularModalService']);

app.controller('WiDummy', function ($scope, wiComponentService) {
    wiComponentService.putComponent("GRAPH", graph);
    wiComponentService.putComponent("UTILS", utils);
    wiComponentService.putComponent('DRAG_MAN', dragMan);

    var wiD3Ctrl = null;
    wiComponentService.on('myPlotD3Area', function(param) {
        console.log('myPlotD3Area loaded', param);
        wiD3Ctrl = wiComponentService.getComponent('myPlotD3Area');
    });

    $scope.handlers = handlers;

    $scope.depthTrackButtonClick = function() {
        wiD3Ctrl.addDepthTrack();
    }

    $scope.trackButtonClick = function() {
        var wiD3Ctrl = wiComponentService.getComponent('myPlotD3Area');
        wiD3Ctrl.addTrack();
    }

    $scope.addData1ButtonClick = function() {
        console.log('addData1');
        trackIdx = wiD3Ctrl.getCurrentTrackIdx();
        if (trackIdx == -1) return;
        wiD3Ctrl.addCurve(trackIdx, genSamples([0,1], [0,1000]), 'Data1', 'm3');
        wiD3Ctrl.setDepthRangeFromSlidingBar();
        wiD3Ctrl.plot(trackIdx);
    }

    $scope.addData2ButtonClick = function() {
        var wiD3Ctrl = wiComponentService.getComponent('myPlotD3Area');
        trackIdx = wiD3Ctrl.getCurrentTrackIdx();
        if (trackIdx == -1) return;
        wiD3Ctrl.addCurve(trackIdx, genSamples([1,2], [0,1000]), 'Data2', 'kg');
        wiD3Ctrl.setDepthRangeFromSlidingBar();
        wiD3Ctrl.plot(trackIdx);
    }

    $scope.toggleShadingButtonClick = function() {
        var wiD3Ctrl = wiComponentService.getComponent('myPlotD3Area');
        trackIdx = wiD3Ctrl.getCurrentTrackIdx();
        wiD3Ctrl.toggleShading(trackIdx);
    }

    $scope.changeColor = function() {
        var wiD3Ctrl = wiComponentService.getComponent('myPlotD3Area');
        wiD3Ctrl.setColor(wiD3Ctrl.getCurrentTrackIdx(), $scope.color);
    }

    $scope.removeCurveButtonClick = function() {
        let wiD3Ctrl = wiComponentService.getComponent('myPlotD3Area')
        wiD3Ctrl.removeSelectedCurve();
    }

    $scope.removeTrackButtonClick = function() {
        let wiD3Ctrl = wiComponentService.getComponent('myPlotD3Area')
        wiD3Ctrl.removeTrack(wiD3Ctrl.getCurrentTrackIdx());
    }

    function genSamples(extentX, extentY) {
        let samples = [];
        let transform = d3.scaleLinear().domain([0,1]).range(extentX);

        for (let i = extentY[0]; i <= extentY[1]; i++) {
            samples.push({y: i, x: transform(Math.random())});
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
