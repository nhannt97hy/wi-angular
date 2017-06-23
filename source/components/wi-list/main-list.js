wiList = require('./wi-list');
wiComponentService = require('./wi-component-service');

var app = angular.module('helloapp', [wiList.name, wiComponentService.name]);
app.controller('WiDummy', function ($scope, $timeout, wiComponentService) {
    $scope.myListItems = [
        {
            imgUrl: '',
            key: 'key',
            value: 'value'
        },
        {
            imgUrl: '',
            key: 'key',
            value: 'value'
        },
        {
            imgUrl: '',
            key: 'key',
            value: 'value'
        },
        {
            imgUrl: '',
            key: 'key',
            value: 'value'
        }
    ];

    $scope.myHandler = function () {
        var wiListController = wiComponentService.getComponent('MyList1');
        wiListController.heading = 'New heading ' + Date.now();
    };

    var itemCount = 0;
    $scope.tick = function () {
        var newItem = {
            imgUrl: '',
            key: 'key',
            value: 'value'
        };
        $scope.myListItems.push(newItem);
        itemCount++;

        if (itemCount < 5) {
            $timeout($scope.tick, 1000);
        }
    };
    $timeout($scope.tick, 1000);
});