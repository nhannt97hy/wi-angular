wiSlidingbar = require('./wi-slidingbar');

var app = angular.module('helloapp', [wiSlidingbar.name]);

app.controller('WiDummy', ['$scope', 'wiSlidingbar', function ($scope, wiSlidingbar) {
    $scope.wiSlidingbar = wiSlidingbar;

    console.log(wiSlidingbar);
    console.log($scope.wiSlidingbar);

    setInterval(function () {
        console.log(wiSlidingbar);
        console.log('scope: ', $scope.wiSlidingbar);
    }, 1000);
}]);
