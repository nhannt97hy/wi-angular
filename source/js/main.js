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

let wiContextMenu = require('./wi-context-menu');

let wiD3 = require('./wi-d3');
let wiLogplot = require('./wi-logplot');
let wiExplorer = require('./wi-explorer');
let wiProperties = require('./wi-properties');

let layoutManager = require('./layout');

let handlers = require('./handlers');
let logplotHandlers = require('./wi-logplot-handlers');
let explorerHandlers = require('./wi-explorer-handlers');
let treeviewHandlers = require('./wi-treeview-handlers');

let graph = require('./visualize/visualize');
let dragMan = {
    dragging: false,
    wiD3Ctrl: null,
    track: null
};

let wiElementReady = require('./wi-element-ready');
let wiRightClick = require('./wi-right-click');

// models
let wiDepth = require('./wi-depth.model');
let wiCurve = require('./wi-curve.model');
let wiDataset = require('./wi-dataset.model');
let wiProperty = require('./wi-property.model');
let wiListview = require('./wi-listview.model');
let wiTreeConfig = require('./wi-tree-config.model');
let wiTreeItem = require('./wi-tree-item.model');
let wiWell = require('./wi-well.model');

let wiApiService = require('./wi-api-service');
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
        wiContextMenu.name,
        wiD3.name,
        wiLogplot.name,
        wiExplorer.name,
        wiProperties.name,

        wiElementReady.name,
        wiRightClick.name,

        // models
        wiDepth.name,
        wiCurve.name,
        wiDataset.name,
        wiProperty.name,
        wiListview.name,
        wiTreeConfig.name,
        wiTreeItem.name,
        wiWell.name,

        wiApiService.name,
        wiComponentService.name,
        'angularModalService',

        // 3rd lib
        'ngFileUpload',
        'kendo.directives'
    ]);
app.controller('AppController', function ($scope, $rootScope, $timeout, $compile, wiComponentService, ModalService) {
    // UTIL FUNCTIONS
    wiComponentService.putComponent(wiComponentService.UTILS, utils);
    // Logplot Handlers
    wiComponentService.putComponent(wiComponentService.LOGPLOT_HANDLERS, logplotHandlers);

    // dependency 3rd component
    // wiComponentService.putComponent(wiComponentService.MOMENT, moment);


    // SETUP HANDLER FUNCTIONS
    let globalHandlers = {};
    let treeHandlers = {};
    utils.bindFunctions(globalHandlers, handlers, {
        $scope: $scope,
        wiComponentService: wiComponentService,
        ModalService: ModalService,
        $timeout: $timeout
    });
    utils.bindFunctions(globalHandlers, logplotHandlers, {
        $scope: $scope,
        wiComponentService: wiComponentService,
        ModalService: ModalService,
        $timeout: $timeout
    });
    utils.bindFunctions(globalHandlers, explorerHandlers, {
        $scope: $scope,
        wiComponentService: wiComponentService,
        ModalService: ModalService,
        $timeout: $timeout
    });
    utils.bindFunctions(treeHandlers, treeviewHandlers, {
        $scope: $scope,
        wiComponentService: wiComponentService,
        ModalService: ModalService,
        $timeout: $timeout
    });
    wiComponentService.putComponent(wiComponentService.GLOBAL_HANDLERS, globalHandlers);
    wiComponentService.putComponent(wiComponentService.TREE_FUNCTIONS, treeHandlers);

    // Hook globalHandler into $scope
    $scope.handlers = wiComponentService.getComponent(wiComponentService.GLOBAL_HANDLERS);


    // config explorer block - treeview
    // $scope.myTreeviewConfig = appConfig.TREE_CONFIG_TEST;
    $scope.myTreeviewConfig = {};
    //wiComponentService.treeFunctions = bindAll(appConfig.TREE_FUNCTIONS, $scope, wiComponentService);

    // config properties - list block
    // $scope.myPropertiesConfig = appConfig.LIST_CONFIG_TEST;
    $scope.myPropertiesConfig = {};

    /* ========== IMPORTANT! ================== */
    wiComponentService.putComponent(wiComponentService.GRAPH, graph);
    wiComponentService.putComponent(wiComponentService.DRAG_MAN, dragMan);
    /* ======================================== */
    wiComponentService.putComponent(wiComponentService.DIALOG_UTILS, DialogUtils);
    wiComponentService.putComponent(wiComponentService.LAYOUT_MANAGER, layoutManager);

    layoutManager.createLayout('myLayout', $scope, $compile);
    layoutManager.putLeft('explorer-block', 'Project');
    layoutManager.putLeft('property-block', 'Properties');
    layoutManager.putWiLogPlotRight('myLogPlot', 'my plot');

    // Install 
    wiComponentService.on(wiComponentService.ADD_LOGPLOT_EVENT, function (title) {
        layoutManager.putWiLogPlotRight('myLogPlot' + Date.now(), title);
    });

    wiComponentService.on(wiComponentService.PROJECT_UNLOADED_EVENT, function () {
        console.log('project-unloaded-event');
        // layoutManager.removeAllRightTabs();
    });
});
