let wiRibbon = require('./wi-button.js');
let wiToolbar = require('./wi-toolbar.js');

let wiComponentService = require('./wi-component-service');

let app = angular.module('helloapp', [wiToolbar.name, wiRibbon.name, wiComponentService.name]);
app.controller('WiDummy', function ($scope, wiComponentService) {

});