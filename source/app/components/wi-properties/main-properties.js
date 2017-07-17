let wiList = require('./wi-list');
let wiProperties = require('./wi-properties');

// models
let wiProperty = require('./wi-property.model');
let wiListview = require('./wi-listview.model');

let wiComponentService = require('./wi-component-service');

let app = angular.module('helloapp',
    [
        wiProperties.name,
        wiList.name,

        wiProperty.name,
        wiListview.name,

        wiComponentService.name
    ]);

app.controller('WiDummy', function ($scope, wiComponentService, WiProperty) {
    let myConfig;

    let myProperty = new WiProperty();
    myProperty.addNewItemListview('list-1', 'list 1', {ok1: 'ok12', ok2: 'ok22'});

    let myProperty2 = new WiProperty();
    myProperty2.addNewItemListview('list-2', 'list 2', {ok2: 'ok12', ok22: 'ok22'});
    myProperty2.addNewItemListview('list-3', 'list 3', {ok2341: 'ok12', ok2342: 'ok22'});

    $scope.changeList = function () {
        myConfig = (myConfig === myProperty) ? myProperty2 : myProperty;
        // myConfig = myProperty.listConfig;

        wiComponentService.emit('update-properties', myConfig.listConfig);

        console.log('main scope myConfig', myConfig);
    }
});

LIST_CONFIG_TEST_1 = [
    {
        name: 'list1',
        heading: 'List 1',
        data: [
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
        data: [
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
        data: [
            {
                key: 'key3',
                value: 'value'
            }
        ]
    },
    {
        name: 'list4',
        heading: 'List 4',
        data: [
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