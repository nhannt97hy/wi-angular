wiSlidingbar = require('./wi-slidingbar');

var app = angular.module('helloapp', [wiSlidingbar.name]);

app.controller('WiDummy', ['$scope', 'wiSlidingbar', function ($scope, wiSlidingbar) {
    $scope.wiSlidingbar = wiSlidingbar;
}]);
