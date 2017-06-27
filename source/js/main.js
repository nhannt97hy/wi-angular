let appConfig = require('./app.config');
let wiButton = require('./wi-button');
let wiDropdown = require('./wi-dropdown');
let wiToolbar = require('./wi-toolbar');
let wiWorkingtabs = require('./wi-workingtabs');
let wiTreeview = require('./wi-treeview');
let wiStatusBar = require('./wi-status-bar');
let wiSlidingbar = require('./wi-slidingbar');

let wiList = require('./wi-list');

let wiD3 = require('./wi-d3');
let wiLogplot = require('./wi-logplot');
let wiExplorer = require('./wi-explorer');
let wiProperties = require('./wi-properties');

let layoutManager = require('./layout');

let handlers = require('./handlers');
let logplotHandlers = require('./wi-logplot-handlers');

let graph = require('./graph');


function genSamples(nSamples) {
    let samples = [];
    for (let i = 0; i < nSamples; i++) {
        samples.push({y: i, x: Math.random()});
    }
    return samples;
}

let wiComponentService = require('./wi-component-service');

let app = angular.module('wiapp',
    [
        wiButton.name,
        wiDropdown.name,
        wiToolbar.name,
        wiWorkingtabs.name,
        wiTreeview.name,
        wiStatusBar.name,
        wiSlidingbar.name,
        wiList.name,

        wiD3.name,
        wiLogplot.name,
        wiExplorer.name,
        wiProperties.name,

        wiComponentService.name
    ]);

app.controller('AppController', function ($scope, $timeout, $compile, wiComponentService) {
    // config explorer block - treeview
    $scope.myTreeviewConfig = appConfig.TREE_CONFIG_TEST;
    wiComponentService.treeFunctions = bindAll(appConfig.TREE_FUNCTIONS, $scope, wiComponentService);

    // config properties - list block
    $scope.myPropertiesConfig = appConfig.LIST_CONFIG_TEST;

    $scope.handlers = bindAll(handlers, $scope, wiComponentService);

    wiComponentService.putComponent('GRAPH', graph);

    layoutManager.createLayout('myLayout', $scope, $compile);
    layoutManager.putLeft('explorer-block', 'Explorer');
    layoutManager.putLeft('property-block', 'Properties');

    wiComponentService.on('new-logplot-tab', function (title) {
        layoutManager.putWiLogPlotRight('myLogPlot' + Date.now(), title);
    });
});

function bindAll(handlers, $scope, wiComponentService) {
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