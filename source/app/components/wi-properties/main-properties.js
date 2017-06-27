let wiList = require('./wi-list');
let wiProperties = require('./wi-properties');

let wiComponentService = require('./wi-component-service');

let app = angular.module('helloapp', [wiProperties.name, wiList.name, wiComponentService.name]);

app.controller('WiDummy', function ($scope, wiComponentService) {
    $scope.myConfig = LIST_CONFIG_TEST_1;

    $scope.changeList = function () {
        $scope.myConfig = ($scope.myConfig === LIST_CONFIG_TEST_1) ? LIST_CONFIG_TEST_2 : LIST_CONFIG_TEST_1;
    }
});

LIST_CONFIG_TEST_1 = [
    {
        name: 'list1',
        heading: 'List 1',
        data : [
            {
                key: 'key1',
                value: 'value'
            },
            {
                key: 'key1',
                value: 'value'
            },
            {
                key: 'key1',
                value: 'value'
            }
        ]
    },
    {
        name: 'list2',
        heading: 'List 2',
        data : [
            {
                key: 'key2',
                value: 'value'
            },
            {
                key: 'key2',
                value: 'value'
            }
        ]
    }
];

LIST_CONFIG_TEST_2 = [
    {
        name: 'list3',
        heading: 'List 3',
        data : [
            {
                key: 'key3',
                value: 'value'
            }
        ]
    },
    {
        name: 'list4',
        heading: 'List 4',
        data : [
            {
                key: 'key4',
                value: 'value'
            },
            {
                key: 'key4',
                value: 'value'
            },
            {
                key: 'key4',
                value: 'value'
            },
            {
                key: 'key4',
                value: 'value'
            }
        ]
    }
];