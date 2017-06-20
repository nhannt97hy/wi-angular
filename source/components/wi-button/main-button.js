wiRibbon = require('./wi-button');

var app = angular.module('helloapp', [wiRibbon.name]);
app.controller('WiDummy', function ($scope) {
    $scope.buttonCfg = buttonCfg;
    $scope.myHandler = myHandler;
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
}