wiButton = require('./wi-button');
wiComponentService = require('./wi-component-service');

var app = angular.module('helloapp', [wiButton.name, wiComponentService.name]);
app.controller('WiDummy', function ($scope, wiComponentService) {
    $scope.myHandler =  function() {
        console.log('test wiComponentService');
        var controller = wiComponentService.getComponent('TestButton');
        console.log(controller);
        controller.label = 'New label';
    }
});


function myHandler() {
    console.log('click from main test');
    wiComponentService.getComponent('TestButton');
}

