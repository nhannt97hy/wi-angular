wiDropdown = require('./wi-dropdown');
wiButton = require('./wi-button');
wiComponentService = require('./wi-component-service');

var app = angular.module('helloapp', [wiDropdown.name, wiButton.name, wiComponentService.name]);
app.controller('WiDummy', function($scope, wiComponentService) {
    $scope.myHandler = function () {
        var dropdown1Controller = wiComponentService.getComponent('MyDropdown1');
        dropdown1Controller.label = 'New Label';
    };
});