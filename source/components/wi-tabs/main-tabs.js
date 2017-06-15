wiButton = require('./wi-button.js');
wiToolbar = require('./wi-toolbar.js');
wiTabs = require('./wi-tabs.js');

var app = angular.module('helloapp', [wiButton.name, wiToolbar.name, wiTabs.name]);
app.controller('WiDummy', function ($scope) {

});