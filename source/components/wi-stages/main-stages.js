let wiStages = require('./wi-stages.js');

console.log(wiStages.name);

let app = angular.module('helloapp', [wiStages.name]);
app.controller('WiDummy', function ($scope) {

});
