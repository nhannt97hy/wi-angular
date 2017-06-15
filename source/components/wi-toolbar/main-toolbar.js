wiRibbon = require('./wi-button.js');
wiToolbar = require('./wi-toolbar.js');

app = angular.module('helloapp', [wiToolbar.name, wiRibbon.name]);
app.controller('WiDummy', function ($scope) {

});