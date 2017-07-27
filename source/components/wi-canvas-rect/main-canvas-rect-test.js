let wiCanvasRect = require('./wi-canvas-rect');
let wiComponentService = require('./wi-component-service');
let wiElementReady = require('./wi-element-ready');

let graph = require('./visualize/visualize');

let app = angular.module('helloapp', [wiCanvasRect.name, wiComponentService.name, wiElementReady.name]);
app.controller('WiDummy', function ($scope, wiComponentService) {
	wiComponentService.putComponent(wiComponentService.GRAPH, graph);
	console.log("&&", wiComponentService);
});