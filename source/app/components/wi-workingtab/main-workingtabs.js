wiButton = require('./wi-button');
wiWorkingtabs = require('./wi-workingtabs');

wiComponentService = require('./wi-component-service');

var WORKING_TABS = [
    {
        type: 'dogs',
        heading: 'Item 1.2.1 (dogs)',
        closable: 'true',
        active: false
    },
    {
        type: 'cars',
        heading: 'Item 1.2.2 (cars)',
        closable: 'true',
        active: false
    },
    {
        type: 'logplot',
        name: 'MyLogplot1',
        heading: 'blank logplot',
        closable: 'true',
        active: false
    },
    {
        type: 'logplot',
        name: 'MyLogplot2',
        heading: 'blank logplot',
        closable: 'true',
        active: false
    }
];

var app = angular.module('helloapp', [wiButton.name, wiWorkingtabs.name, wiComponentService.name]);
app.controller('WiDummy', function ($scope, wiComponentService) {
    $scope.workingTabs = WORKING_TABS;
});

