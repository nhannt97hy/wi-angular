wiSlidingbar = require('./wi-slidingbar');
wiComponentService = require('./wi-component-service');

var app = angular.module('helloapp', [wiSlidingbar.name, wiComponentService.name]);
app.controller('WiDummy', function ($scope, wiComponentService) {
    $scope.getSlidingbarComponent = function () {
        $scope.wiSlidingbar = wiComponentService.getComponent('MySlidingBar1');
    };
});
