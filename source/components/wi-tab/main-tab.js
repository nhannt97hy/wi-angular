wiButton = require('./wi-button.js');
wiToolbar = require('./wi-toolbar.js');
wiTab = require('./wi-tab.js');

var app = angular.module('helloapp', ['ui.bootstrap', wiButton.name, wiToolbar.name, wiTab.name]);
app.controller('TestTabset', function ($scope) {
    $scope.myHandlers = {
        onclick: function () {
            console.log('click');
        },
        onmouseover: function () {
            console.log('mouse over');
        }
    }
});