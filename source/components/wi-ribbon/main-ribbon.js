wiRibbon = require('./wi-ribbon.js');
wiButton = require('./wi-buttons.js');

var app = angular.module('helloapp', ['ui.bootstrap', wiRibbon.name, wiButton.name]);
app.controller('WiRibbonController', function($scope) {
    $scope.myHandlers = {
        onclick: function () {
            console.log('click');
        },
        onmouseover: function () {
            console.log('onmouseover');
        }
    };
});