let appConfig = require('./app.config');
let utils = require('./utils');

let DialogUtils = require('./DialogUtils');

let wiButton = require('./wi-button.js');
let wiDropdown = require('./wi-dropdown.js');
let wiToolbar = require('./wi-toolbar.js');
let wiTabs = require('./wi-tabs.js');

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
        wiTabs.name,
        wiTreeview.name,
        wiStatusBar.name,
        wiSlidingbar.name,
        wiList.name,

        wiD3.name,
        wiLogplot.name,
        wiExplorer.name,
        wiProperties.name,

        wiComponentService.name,

        'angularModalService'

    ]);

app.controller('AppController', function ($scope, $timeout, $compile, wiComponentService, ModalService) {
    $scope.handlers = {};

    // config explorer block - treeview
    $scope.myTreeviewConfig = appConfig.TREE_CONFIG_TEST;
    //wiComponentService.treeFunctions = bindAll(appConfig.TREE_FUNCTIONS, $scope, wiComponentService);

    // config properties - list block
    $scope.myPropertiesConfig = appConfig.LIST_CONFIG_TEST;
    bindFunctions($scope.handlers, handlers, $scope, wiComponentService, ModalService);
    console.log('-----------------------');
    // utils.copyProperties($scope.handlers, bindAll(logplotHandlers, $scope, wiComponentService, ModalService));
    bindFunctions($scope.handlers, logplotHandlers, $scope, wiComponentService, ModalService);

    console.log('-----------------------');
    /* ========== IMPORTANT! ================== */
    // wiComponentService.putComponent('TREE_FUNCTIONS',
    //     bindAll(appConfig.TREE_FUNCTIONS, $scope, wiComponentService, ModalService));
    wiComponentService.putComponent('GRAPH', graph);
    /* ======================================== */
    wiComponentService.putComponent('DIALOG_UTILS', DialogUtils);

    layoutManager.createLayout('myLayout', $scope, $compile);
    layoutManager.putLeft('explorer-block', 'Explorer');
    layoutManager.putLeft('property-block', 'Properties');
    layoutManager.putWiLogPlotRight('myLogPlot', 'my plot');

    // Install 
    wiComponentService.on('add-logplot-event', function (title) {
        layoutManager.putWiLogPlotRight('myLogPlot' + Date.now(), title);
    });

});

function bindFunctions(destHandlers, sourceHandlers, $scope, wiComponentService, ModalService) {
    for (let handler in sourceHandlers) {
        destHandlers[handler] = sourceHandlers[handler].bind({
            $scope: $scope,
            wiComponentService: wiComponentService,
            ModalService: ModalService
        });

        console.log('handler', handler)
    }

    console.log('========================');
}
