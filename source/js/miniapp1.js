String.prototype.capitalize = function() {
    if (this.length < 1) return this;
    return this.replace(this[0], this[0].toUpperCase());
}

Object.defineProperty(Array.prototype, "binarySearch", {
    enumerable: false,
    value: function(accessFunc, searchValue) {
        return this.find(accessFunc, searchValue);
    }
});
let queryString = require('query-string');
let ngInfiniteScroll = require('ng-infinite-scroll');
let utils = require('./utils');

let DialogUtils = require('./DialogUtils');

let wiInitialization = require('./wi-initialization.js');
let wiButton = require('./wi-button.js');
let wiDropdown = require('./wi-dropdown.js');
let wiToolbar = require('./wi-toolbar.js');
let wiTabs = require('./wi-tabs.js');
let wiCanvasRect = require('./wi-canvas-rect.js');

let wiTreeview = require('./wi-treeview');
let wiBaseTreeview = require('./wi-base-treeview');

let wiExplorerTreeview = require('./wi-explorer-treeview');
let wiInventoryTreeview = require('./wi-inventory-treeview');

let wiStatusBar = require('./wi-status-bar');
let wiSlidingbar = require('./wi-slidingbar');

let wiList = require('./wi-list');

let wiContextMenu = require('./wi-context-menu');
let wiSpinner = require('./wi-spinner');
let wiResizableX = require('./wi-resizable-x');
let wiContainer = require('./wi-container');
let wiReferenceWindow = require('./wi-reference-window');

let wiMigration = require('./wi-migration');
let wiInventory = require('./wi-inventory');
let wiCurveListing = require('./wi-curve-listing');
let wiD3Histogram = require('./wi-d3-histogram');
let wiD3Crossplot = require('./wi-d3-crossplot');
let wiD3 = require('./wi-d3');
let wiHistogram = require('./wi-histogram');
let wiCrossplot = require('./wi-crossplot');
let wiLogplot = require('./wi-logplot');
let wiExplorer = require('./wi-explorer');
let wiProperties = require('./wi-properties');
let wiMultiInput = require('./wi-multi-input');
let wiCustomInput = require('./wi-custom-input');

let wiComboview = require('./wi-comboview');
let wiD3Comboview = require('./wi-d3-comboview');

let layoutManager = require('./layout');
let historyState = require('./historyState');

let handlers = require('./handlers');
let logplotHandlers = require('./wi-logplot-handlers');
let explorerHandlers = require('./wi-explorer-handlers');
let treeviewHandlers = require('./wi-treeview-handlers');
let crossplotHanders = require('./wi-crossplot-handlers');
let histogramHandlers = require('./wi-histogram-handlers');

let comboviewHandlers = require('./wi-comboview-handlers');

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
let wiMultiselect = require('./wi-multiselect');
let wiApiService = require('./wi-api-service');
let wiComponentService = require('./wi-component-service');

let wiConditionNode = require('./wi-condition-node');

let app = angular.module('wiapp',
    [
        wiInitialization.name,
        wiButton.name,
        wiDropdown.name,
        wiToolbar.name,
        wiTabs.name,
        wiTreeview.name,
        wiBaseTreeview.name,

        wiExplorerTreeview.name,
        wiInventoryTreeview.name,

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
        wiMultiInput.name,
        wiCustomInput.name,
        wiCurveListing.name,
        wiInventory.name,
        wiMigration.name,

        wiComboview.name,
        wiD3Comboview.name,

        wiElementReady.name,
        wiRightClick.name,
        wiEnter.name,
        wiDecimalPlaces.name,

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
        wiMultiselect.name,

        wiConditionNode.name,
        ngInfiniteScroll,

        'angularModalService',
        'angularResizable',

        // 3rd lib
        'ngFileUpload',
        'ui.bootstrap',
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

    wiComponentService.putComponent(wiComponentService.COMBOVIEW_HANDLERS, comboviewHandlers);

    // Hook globalHandler into $scope
    $scope.handlers = wiComponentService.getComponent(wiComponentService.GLOBAL_HANDLERS);
    window.__HANDLERS = globalHandlers;

    // config explorer block - treeview
    // $scope.myTreeviewConfig = appConfig.TREE_CONFIG_TEST;
    $scope.myTreeviewConfig = {};
    // wiComponentService.treeFunctions = bindAll(appConfig.TREE_FUNCTIONS, $scope, wiComponentService);

    // config properties - list block
    // $scope.myPropertiesConfig = appConfig.LIST_CONFIG_TEST;
    $scope.myPropertiesConfig = {};

    $scope.onRibbonToggle = function(isCollapsed) {
        if (isCollapsed) {
            $('.ribbon-wrapper').css('height', 'auto');
        }
        else {
            $('.ribbon-wrapper').css('height', 'auto');
        }
        setTimeout(function(){
            layoutManager.updateSize();
        }, 500);
    }

    /* ========== IMPORTANT! ================== */
    wiComponentService.putComponent(wiComponentService.GRAPH, graph);
    wiComponentService.putComponent(wiComponentService.DRAG_MAN, dragMan);
    /* ======================================== */
    let boundedLayoutManager = layoutManager;
    layoutManager = {};
    utils.bindFunctions(layoutManager, boundedLayoutManager, functionBindingProp);
    wiComponentService.putComponent(wiComponentService.LAYOUT_MANAGER, layoutManager);
    wiComponentService.putComponent(wiComponentService.HISTORYSTATE, historyState);
    window.HS = historyState;

    layoutManager.createLayout('myLayout', $scope, $compile);

    // update size when container is resized
    $(window).on('resize', function () {
        layoutManager.updateSize();
    });

    // toastr config
    toastr.options.escapeHtml = true;
    toastr.options.progressBar = true;
    toastr.options.timeOut = 5000;
    toastr.options.extendedTimeOut = 10000;
    toastr.options.preventDuplicates = true;

}
app.controller('AppController', function ($scope, $rootScope, $timeout, $compile, wiComponentService, ModalService, wiApiService) {
    let functionBindingProp = {
        $scope,
        wiComponentService,
        ModalService,
        wiApiService,
        $timeout
    };
    window.utils = utils;
    utils.setGlobalObj(functionBindingProp);
    wiComponentService.putComponent(wiComponentService.UTILS, utils);
    wiComponentService.putComponent(wiComponentService.DIALOG_UTILS, DialogUtils);
    appEntry($scope, $rootScope, $timeout, $compile, wiComponentService, ModalService, wiApiService);
    layoutManager.putLeft('explorer-block', 'Project');
    layoutManager.putLeft('property-block', 'Properties');
    if(!window.localStorage.getItem('rememberAuth')) {
        utils.doLogin(function () {
            onInit();
        });
    }
    else {
        $scope.$on('initialized', onInit);
    }
    function onInit() {
        let query = queryString.parse(location.search);
        if (query.idPlot) {
            viewPlot(query.idPlot);
        }
    }
    function viewPlot(idPlot) {
        let idWell;
        async.series([function(done) {
            try {
                wiApiService.getLogplot(idPlot, function(plotProps) {
                    idWell = plotProps.idWell;
                    done(null, plotProps);
                });
            }
            catch(err) {
                done(err);
            }
        }, function(done) {
            try {
                wiApiService.getWell(idWell, function(wellProps) {
                    done(null, wellProps);
                });
            }
            catch(err) {
                done(err);
            }
        }], function(err, result) {
            console.log(err, result);
            let utils = wiComponentService.getComponent(wiComponentService.UTILS);
            let wiExplorer = wiComponentService.getComponent(wiComponentService.WI_EXPLORER);

            //let wellModel = utils.createWellModel(result[1]);
            let wellModel = utils.wellToTreeConfig(result[1]);
            //wiComponentService.putComponent('WELL_MODEL', wellModel);
            let plotModel = utils.logplotToTreeConfig(result[0], {wellModel : wellModel});
            //wellModel.children.push(plotModel);
            $timeout(function() {
                wiExplorer.treeConfig = [wellModel];
                try {
                    utils.openLogplotTab(wiComponentService, plotModel, null, false);
                }
                catch(err) {
                    console.error(err);
                }
            });
        });
    }
});
