wiSlidingbar = require('./wi-slidingbar');

var app = angular.module('helloapp', [wiSlidingbar.name]);
app.controller('WiDummy', function($scope, wiSlidingbar) {
    console.log(wiSlidingbar);
    $scope.top = wiSlidingbar.top;
    $scope.range = wiSlidingbar.range;
});
