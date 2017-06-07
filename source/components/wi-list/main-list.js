wiList = require('./wi-list');

var app = angular.module('helloapp', ['ui.bootstrap', wiList.name]);
app.controller('WiDummy', function($scope) {
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
    ]
});