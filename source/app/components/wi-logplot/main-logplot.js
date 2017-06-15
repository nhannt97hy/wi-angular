wiButton = require('./wi-button.js');
wiToolbar = require('./wi-toolbar.js');
wiLogplot = require('./wi-logplot.js');

var app = angular.module('helloapp', [wiButton.name, wiToolbar.name, wiLogplot.name]);
app.controller('WiDummy', function ($scope) {

});