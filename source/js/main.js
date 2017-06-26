let appConfig = require('./app.config');
let wiButton = require('./wi-button.js');
let wiDropdown = require('./wi-dropdown.js');
let wiToolbar = require('./wi-toolbar.js');
let wiTabs = require('./wi-tabs.js');
let wiWorkingtabs = require('./wi-workingtabs.js');
let wiTreeview = require('./wi-treeview');
let wiStatusBar = require('./wi-status-bar');
let wiSlidingbar = require('./wi-slidingbar');
let wiD3 = require('./wi-d3');
let wiLogplot = require('./wi-logplot.js');

let wiList = require('./wi-list');

let layoutManager = require('./layout.js');

let handlers = require('./handlers.js');
let logplotHandlers = require('./wi-logplot-handlers');

let graph = require('./graph.js');

function genSamples(nSamples) {
    let samples = [];
    for (let i = 0; i < nSamples; i++) {
        samples.push({y: i, x: Math.random()});
    }
    return samples;
}

wiComponentService = require('./wi-component-service.js');

let app = angular.module('wiapp',
    [
        wiButton.name,
        wiDropdown.name,
        wiToolbar.name,
        wiTabs.name,
        wiWorkingtabs.name,
        wiTreeview.name,
        wiStatusBar.name,
        wiSlidingbar.name,
        wiLogplot.name,
        wiD3.name,
        wiList.name,
        wiComponentService.name
    ]);

app.controller('AppController', function ($scope, $timeout, $compile, wiComponentService) {
    $scope.myConfig = appConfig.TREE_CONFIG_TEST;

    function bindAll($scope, wiComponentService) {
        let newHandlers = {};
        for (let handler in handlers) {
            newHandlers[handler] = handlers[handler].bind({
                $scope: $scope,
                wiComponentService: wiComponentService
            });
        }

        for (let handler in logplotHandlers) {
            newHandlers[handler] = logplotHandlers[handler].bind({
                $scope: $scope,
                wiComponentService: wiComponentService
            });
        }

        return newHandlers;
    }

    $scope.handlers = bindAll($scope, wiComponentService);

    wiComponentService.putComponent('GRAPH', graph);

    $scope.listItems = [
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
        },
        {
            key: 'key',
            value: 'value'
        }
    ];

    $scope.listItems2 = [
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

    $scope.workingTabs = appConfig.WORKING_TABS;

    layoutManager.createLayout('myLayout', $scope, $compile);
    layoutManager.putLeft('explorer-block', 'Explorer');
    layoutManager.putLeft('property-block', 'Properties');

    wiComponentService.on('new-logplot-tab', function (title) {
        layoutManager.putWiLogPlotRight('myLogPlot' + Date.now(), title);
    });
});

