let wiButton = require('./wi-button.js');
let wiToolbar = require('./wi-toolbar.js');
let wiTabs = require('./wi-tabs.js');

let app = angular.module('helloapp', [wiButton.name, wiToolbar.name, wiTabs.name]);
app.controller('WiDummy', function ($scope) {

});