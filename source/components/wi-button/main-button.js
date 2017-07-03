let wiButton = require('./wi-button');

let wiElementReadyDirective = require('./wi-element-ready-directive');

let wiComponentService = require('./wi-component-service');

let app = angular.module('helloapp', [wiButton.name, wiElementReadyDirective.name, wiComponentService.name]);
app.controller('WiDummy', function ($scope, wiComponentService) {
    $scope.myHandler = function () {
        let buttonController = wiComponentService.getComponent('TestButton');
        console.log(buttonController);
        buttonController.label = 'New label';
    }
});