wiList = require('./wi-list');

var app = angular.module('helloapp', ['ui.bootstrap', wiList.name]);
app.controller('WiDummy', function($scope, $timeout) {
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

    $scope.tick = function() {
        var newItem = {
            imgUrl: '',
            key: 'key',
            value: 'value'
        };
        $scope.myListItems.push(newItem);
        console.log('push', newItem);

        $timeout($scope.tick, 1000);
    };
    $timeout($scope.tick, 1000);
});