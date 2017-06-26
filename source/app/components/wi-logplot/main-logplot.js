let wiButton = require('./wi-button.js');
let wiToolbar = require('./wi-toolbar.js');
let wiSlidingbar = require('./wi-slidingbar.js');
let wiLogplot = require('./wi-logplot.js');

let wiComponentService = require('./wi-component-service');

let app = angular.module('helloapp',
    [wiLogplot.name, wiButton.name, wiToolbar.name, wiSlidingbar.name, wiComponentService.name]);
app.controller('WiDummy', function ($scope) {

});