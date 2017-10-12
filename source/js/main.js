String.prototype.capitalize = function() {
    if (this.length < 1) return this;
    return this.replace(this[0], this[0].toUpperCase());
}

let appConfig = require('./app.config');
let utils = require('./utils');

let DialogUtils = require('./DialogUtils');

let wiButton = require('./wi-button.js');
let wiDropdown = require('./wi-dropdown.js');
let wiToolbar = require('./wi-toolbar.js');
let wiTabs = require('./wi-tabs.js');
let wiCanvasRect = require('./wi-canvas-rect.js');
let wiLevelMenu = require('./wi-level-menu.js');


let wiTreeview = require('./wi-treeview');
let wiStatusBar = require('./wi-status-bar');
let wiSlidingbar = require('./wi-slidingbar');

let wiList = require('./wi-list');

let wiContextMenu = require('./wi-context-menu');
let wiSpinner = require('./wi-spinner');
let wiResizableX = require('./wi-resizable-x');
let wiContainer = require('./wi-container');
let wiReferenceWindow = require('./wi-reference-window');

let wiD3Histogram = require('./wi-d3-histogram');
let wiD3Crossplot = require('./wi-d3-crossplot');
let wiD3 = require('./wi-d3');
let wiHistogram = require('./wi-histogram');
let wiCrossplot = require('./wi-crossplot');
let wiLogplot = require('./wi-logplot');
let wiExplorer = require('./wi-explorer');
let wiProperties = require('./wi-properties');

let layoutManager = require('./layout');

let handlers = require('./handlers');
let logplotHandlers = require('./wi-logplot-handlers');
let explorerHandlers = require('./wi-explorer-handlers');
let treeviewHandlers = require('./wi-treeview-handlers');
let crossplotHanders = require('./wi-crossplot-handlers');
let histogramHandlers = require('./wi-histogram-handlers');

let graph = require('./visualize/visualize');
let dragMan = {
    dragging: false,
    wiD3Ctrl: null,
    track: null,
    wiSlidingBarCtrl: null
};

let wiElementReady = require('./wi-element-ready');
let wiRightClick = require('./wi-right-click');
let wiEnter = require('./wi-enter');
let wiDecimalPlaces = require('./wi-decimal-places');

// models
let wiDepth = require('./wi-depth.model');
let wiCurve = require('./wi-curve.model');
let wiDataset = require('./wi-dataset.model');
let wiProperty = require('./wi-property.model');
let wiListview = require('./wi-listview.model');
let wiTreeConfig = require('./wi-tree-config.model');
let wiTreeItem = require('./wi-tree-item.model');
let wiWell = require('./wi-well.model');
let wiLogplotsModel = require('./wi-logplots.model');
let wiLogplotModel = require('./wi-logplot.model');
let wiZone = require('./wi-zone');
let wiUser = require('./wi-user');

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
        wiSpinner.name,
        wiResizableX.name,
        wiD3Crossplot.name,
        wiD3Histogram.name,
        wiD3.name,
        wiHistogram.name,
        wiCrossplot.name,
        wiLogplot.name,
        wiExplorer.name,
        wiProperties.name,

        wiElementReady.name,
        wiRightClick.name,
        wiEnter.name,
        wiDecimalPlaces.name,
        wiLevelMenu.name,

        // models
        wiDepth.name,
        wiCurve.name,
        wiDataset.name,
        wiProperty.name,
        wiListview.name,
        wiTreeConfig.name,
        wiTreeItem.name,
        wiWell.name,
        wiLogplotsModel.name,
        wiLogplotModel.name,

        wiApiService.name,
        wiComponentService.name,

        wiCanvasRect.name,
        wiZone.name,
        wiContainer.name,
        wiReferenceWindow.name,
        wiUser.name,

        'angularModalService',
        'angularResizable',

        // 3rd lib
        'ngFileUpload',
        'ngSanitize',
        'ui.select',
        'angularjs-dropdown-multiselect'
    ]);

function appEntry($scope, $rootScope, $timeout, $compile, wiComponentService, ModalService, wiApiService) {
    // SETUP HANDLER FUNCTIONS
    let globalHandlers = {};
    let treeHandlers = {};
    let wiExplorerHandlers = {};
    let functionBindingProp = {
        $scope,
        wiComponentService,
        ModalService,
        wiApiService,
        $timeout
    };
    // UTIL FUNCTIONS
    utils.setGlobalObj(functionBindingProp);
    wiComponentService.putComponent(wiComponentService.UTILS, utils);
    // Logplot Handlers
    wiComponentService.putComponent(wiComponentService.LOGPLOT_HANDLERS, logplotHandlers);
    // Crossplot Handlers
    wiComponentService.putComponent(wiComponentService.CROSSPLOT_HANDLERS, crossplotHanders);
    // dependency 3rd component
    // wiComponentService.putComponent(wiComponentService.MOMENT, moment);

    utils.bindFunctions(globalHandlers, handlers, functionBindingProp);
    utils.bindFunctions(wiExplorerHandlers, explorerHandlers, functionBindingProp);
    utils.bindFunctions(treeHandlers, treeviewHandlers, functionBindingProp);

    wiComponentService.putComponent(wiComponentService.GLOBAL_HANDLERS, globalHandlers);
    wiComponentService.putComponent(wiComponentService.TREE_FUNCTIONS, treeHandlers);
    wiComponentService.putComponent(wiComponentService.WI_EXPLORER_HANDLERS, wiExplorerHandlers);
    wiComponentService.putComponent(wiComponentService.HISTOGRAM_HANDLERS, histogramHandlers);

    // Hook globalHandler into $scope
    $scope.handlers = wiComponentService.getComponent(wiComponentService.GLOBAL_HANDLERS);
    window.__HANDLERS = globalHandlers;

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
    let boundedLayoutManager = layoutManager;
    layoutManager = {};
    utils.bindFunctions(layoutManager, boundedLayoutManager, functionBindingProp);
    wiComponentService.putComponent(wiComponentService.LAYOUT_MANAGER, layoutManager);

    layoutManager.createLayout('myLayout', $scope, $compile);
    layoutManager.putLeft('explorer-block', 'Project');
    layoutManager.putLeft('property-block', 'Properties');

    wiComponentService.on(wiComponentService.PROJECT_LOADED_EVENT, function () {
        wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER).removeAllRightTabs();
    });
    wiComponentService.on(wiComponentService.PROJECT_UNLOADED_EVENT, function () {
        wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER).removeAllRightTabs();
    });
    wiComponentService.on(wiComponentService.ADD_LOGPLOT_EVENT, function (logplotModel) {
        console.log(logplotModel);
        layoutManager.putTabRightWithModel(logplotModel);
    });

    // update size when container is resized
    $(window).on('resize', function () {
        layoutManager.updateSize();
    });

    $scope.onRibbonToggle = function(isCollapsed) {
        if (isCollapsed) {
            $('.ribbon-wrapper').css('height', 'auto');
        }
        else {
            $('.ribbon-wrapper').css('height', '120px');
        }
        setTimeout(function(){
            layoutManager.updateSize();
        }, 500);
    }
}
app.controller('AppController', function ($scope, $rootScope, $timeout, $compile, wiComponentService, ModalService, wiApiService) {
    if(!window.localStorage.getItem('rememberAuth')) {
        DialogUtils.authenticationDialog(ModalService, function (userInfo) {
            if (userInfo.remember) {
                window.localStorage.setItem('rememberAuth', true);
            }
            window.localStorage.setItem('username', userInfo.username);
            window.localStorage.setItem('password', userInfo.password);
            window.localStorage.setItem('token', userInfo.token);
            wiComponentService.getComponent('user').userUpdate();
            appEntry($scope, $rootScope, $timeout, $compile, wiComponentService, ModalService, wiApiService);
        });
    }else{
        appEntry($scope, $rootScope, $timeout, $compile, wiComponentService, ModalService, wiApiService);
    }
});
