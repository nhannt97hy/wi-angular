let wiList = require('./wi-list');

let wiComponentService = require('./wi-component-service');

let app = angular.module('helloapp', [wiList.name, wiComponentService.name]);

app.controller('WiDummy', function ($scope, wiComponentService) {
    $scope.myListItems = [
        {
            key: 'key',
            value: 'value'
        },
        {
            key: 'key',
            value: 'value'
        },
        {
            key: 'key',
            value: 'value'
        }
    ];

    $scope.myListItems2 = [
        {
            key: 'key',
            value: 'value'
        },
        {
            key: 'key',
            value: 'value'
        }
    ];

    $scope.myHandler = function () {
        let wiListController = wiComponentService.getComponent('MyList1');
        wiListController.heading = 'New heading ' + Date.now();
    };

    $scope.addMoreItem = function () {
        wiComponentService.getComponent('MyList2').addItem('key' + Date.now(), 'value' + Date.now());
    };
});