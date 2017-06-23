wiButton = require('./wi-button.js');
wiToolbar = require('./wi-toolbar.js');
wiSlidingbar = require('./wi-slidingbar.js');
wiLogplot = require('./wi-logplot.js');

wiComponentService = require('./wi-component-service');

var app = angular.module('helloapp',
    [wiLogplot.name, wiButton.name, wiToolbar.name, wiSlidingbar.name, wiComponentService.name]);
app.controller('WiDummy', function ($scope) {

});