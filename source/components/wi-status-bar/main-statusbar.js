let wiStatusBar = require('./wi-status-bar');

let app = angular.module('helloapp', [wiStatusBar.name]);
app.controller('WiDummy', function($scope) {

});