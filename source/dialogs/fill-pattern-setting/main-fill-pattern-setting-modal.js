var DialogUtils = require('./DialogUtils');
var wiComponentService = require('./wi-component-service');
var wiCanvasRect = require('./wi-canvas-rect');
var wiElementReady = require('./wi-element-ready');

var graph = require('./visualize/visualize');

var app = angular.module('app', ['angularModalService', 'kendo.directives', 'ngSanitize', 'ui.select', wiComponentService.name, wiCanvasRect.name, wiElementReady.name]);

app.controller('SampleController', function($scope, ModalService, wiComponentService) {
	wiComponentService.putComponent(wiComponentService.GRAPH, graph);
    $scope.show = function() {
        DialogUtils.fillPatternSettingDialog(ModalService, function(ret) {
        	console.log(ret);
        });
    }

});

