wiDropdown = require('./wi-dropdown');
wiButton = require('./wi-button');

var app = angular.module('helloapp', [wiDropdown.name, wiButton.name]);
app.controller('WiDummy', function($scope) {

});
