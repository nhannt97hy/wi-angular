let wiButton = require('./wi-button');
let wiSlidingbar = require('./wi-slidingbar.js');
let wiWorkingtabs = require('./wi-workingtabs');
let wiLogplot = require('./wi-logplot.js');

let wiComponentService = require('./wi-component-service');

let WORKING_TABS = [
    {
        type: 'dogs',
        name: 'dogsTab',
        heading: 'Item 1.2.1 (dogs)',
        closable: 'true',
        active: false
    },
    {
        type: 'cars',
        name: 'carTab',
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

let app = angular.module('helloapp', [wiButton.name, wiSlidingbar.name, wiWorkingtabs.name, wiLogplot.name, wiComponentService.name]);
app.controller('WiDummy', function ($scope, wiComponentService) {
    $scope.workingTabs = WORKING_TABS;
});

