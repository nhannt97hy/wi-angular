let wiSlidingbar = require('./wi-slidingbar');
let wiComponentService = require('./wi-component-service');

let app = angular.module('helloapp', [wiSlidingbar.name, wiComponentService.name]);
app.controller('WiDummy', function ($scope, wiComponentService) {
    $scope.getSlidingbarComponent = function () {
        $scope.wiSlidingbar = wiComponentService.getComponent('MySlidingBar1');
    };
});
