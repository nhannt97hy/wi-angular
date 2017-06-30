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
let explorerHandlers = require('./wi-explorer-handlers');
let treeviewHandlers = require('./wi-treeview-handlers');

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
__WICS = null;
app.controller('AppController', function ($scope, $rootScope, $timeout, $compile, wiComponentService, ModalService) {
    // SETUP HANDLER FUNCTIONS
    let globalHandlers = {};
    let treeHandlers = {};
    bindFunctions(globalHandlers, handlers, $scope, wiComponentService, ModalService);
    bindFunctions(globalHandlers, logplotHandlers, $scope, wiComponentService, ModalService);
    bindFunctions(globalHandlers, explorerHandlers, $scope, wiComponentService, ModalService);
    bindFunctions(treeHandlers, treeviewHandlers, $scope, wiComponentService, ModalService);
    wiComponentService.putComponent('GLOBAL_HANDLERS', globalHandlers);
    wiComponentService.putComponent('TREE_FUNCTIONS', treeHandlers);

    // Hook globalHandler into $scope
    $scope.handlers = wiComponentService.getComponent('GLOBAL_HANDLERS');


    // config explorer block - treeview
    $scope.myTreeviewConfig = appConfig.TREE_CONFIG_TEST;
    //wiComponentService.treeFunctions = bindAll(appConfig.TREE_FUNCTIONS, $scope, wiComponentService);

    // config properties - list block
    $scope.myPropertiesConfig = appConfig.LIST_CONFIG_TEST;

    /* ========== IMPORTANT! ================== */
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
    }
}
