let wiDropdown = require('./wi-dropdown');
let wiButton = require('./wi-button');
let wiComponentService = require('./wi-component-service');

let app = angular.module('helloapp', [wiDropdown.name, wiButton.name, wiComponentService.name]);
app.controller('WiDummy', function($scope, wiComponentService) {
    $scope.myHandler = function () {
        let dropdown1Controller = wiComponentService.getComponent('MyDropdown1');
        dropdown1Controller.label = 'New Label';
    };
});