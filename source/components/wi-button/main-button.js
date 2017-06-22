wiRibbon = require('./wi-button');

var app = angular.module('helloapp', [wiRibbon.name]);
app.controller('WiDummy', function ($scope) {
    $scope.myHandler = myHandler;
});



function myHandler() {
    console.log('click from main test');
}