wiRibbon = require('./wi-button.js');
wiToolbar = require('./wi-toolbar.js');

wiComponentService = require('./wi-component-service');

app = angular.module('helloapp', [wiToolbar.name, wiRibbon.name, wiComponentService.name]);
app.controller('WiDummy', function ($scope, wiComponentService) {

});