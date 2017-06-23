wiButton = require('./wi-button');

wiComponentService = require('./wi-component-service');

var app = angular.module('helloapp', [wiButton.name, wiComponentService.name]);
app.controller('WiDummy', function ($scope, wiComponentService) {
    $scope.buttonCfg = buttonCfg;
//    $scope.myHandler = myHandler;
    $scope.myHandler =  function() {
        var buttonController = wiComponentService.getComponent('TestButton');
        console.log(buttonController);
        buttonController.label = 'New label';
    }
});

buttonCfg = {
    type: 'button',
    imgUrl: 'img/32x32/project_new_32x32.png',
    label: 'New Project',
    layout: 'icon-left',
    handler: myHandler
};

function myHandler() {
    console.log('click from main test');
    wiComponentService.getComponent('TestButton');
}

