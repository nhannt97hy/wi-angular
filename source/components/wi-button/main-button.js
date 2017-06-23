wiButton = require('./wi-button');

wiComponentService = require('./wi-component-service');

var app = angular.module('helloapp', [wiButton.name, wiComponentService.name]);
app.controller('WiDummy', function ($scope, wiComponentService) {
    $scope.myHandler =  function() {
        var buttonController = wiComponentService.getComponent('TestButton');
        console.log(buttonController);
        buttonController.label = 'New label';
    }
});


function myHandler() {
    console.log('click from main test');
    wiComponentService.getComponent('TestButton');
}

