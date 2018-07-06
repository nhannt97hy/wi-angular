String.prototype.capitalize = function () {
    if (this.length < 1) return this;
    return this.replace(this[0], this[0].toUpperCase());
}
/**
 * Returns a number whose value is limited to the given range.
 *
 * Example: limit the output of this computation to between 0 and 255
 * (x * 255).clamp(0, 255)
 *
 * @param {Number} min The lower boundary of the output range
 * @param {Number} max The upper boundary of the output range
 * @returns A number in the range [min, max]
 * @type Number
 */
Number.prototype.clamp = function (min, max) {
    return Math.min(Math.max(this, min), max);
};

Object.defineProperty(Array.prototype, "binarySearch", {
    enumerable: false,
    value: function (accessFunc, searchValue) {
        return this.find(accessFunc, searchValue);
    }
});
let queryString = require('query-string');
let ngInfiniteScroll = require('ng-infinite-scroll');
let utils = require('./utils');

let DialogUtils = require('./DialogUtils');
// let WorkFlowUtils = require('./WorkFlowUtils');

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

let wiPlot = require('./wi-plot');
let wiZoneTemplateManager = require('./wi-zone-template-manager');
let wiZoneManager = require('./wi-zone-manager');
let wiZoneSetManager = require('./wi-zone-set-manager');
let wiParameterSet = require('./wi-parameter-set');

let wiInventory = require('./wi-inventory');
// let wiExport = require('./wi-export');
let wiExportFromInventory = require('./wi-export-from-inventory');
let wiExportFromProject = require('./wi-export-from-project');
let wiTask = require('./wi-task');
let wiFlowDesigner = require('./wi-flow-designer');
let wiFlowEngine = require('./wi-flow-engine');
let wiPetrophysics = require('./wi-petrophysics');
let wiWorkflow = require('./wi-workflow');
let wiWorkflowPlayer = require('./wi-workflow-player');
let wiWFMachineLearning = require('./wi-workflow-machine-learning');
let wiNeuralNetwork = require('./wi-neural-network');
let wiCurveListing = require('./wi-curve-listing');
let wiD3Histogram = require('./wi-d3-histogram');
let wiD3Crossplot = require('./wi-d3-crossplot');

let wiD3DepthTrack = require('./wi-d3-depth-track');
let wiD3ZoneTrack = require('./wi-d3-zone-track');
let wiD3ImageTrack = require('./wi-d3-image-track');
let wiD3ObjectTrack = require('./wi-d3-object-track');
let wiD3LogTrack = require('./wi-d3-log-track');
let wiD3CorrelationTrack = require('./wi-d3-correlation-track');

let wiD3 = require('./wi-d3');
// let wiD3 = require('./wi-d3-new');
let wiHistogram = require('./wi-histogram');
let wiCrossplot = require('./wi-crossplot');
let wiLogplot = require('./wi-logplot');
let wiExplorer = require('./wi-explorer');
let wiProperties = require('./wi-properties');
let wiMultiInput = require('./wi-multi-input');
let wiCustomInput = require('./wi-custom-input');
let wiProps = require('./wi-props');


let wiComboview = require('./wi-comboview');
let wiD3Comboview = require('./wi-d3-comboview');
let wiScroll = require('./wi-scroll');
let wiItemDropdown = require('./wi-item-dropdown');

let wiiExplorer = require('./wii-explorer');
let wiiItems = require('./wii-items');
let wiiProperties = require('./wii-properties');

let layoutManager = require('./layout');
let historyState = require('./historyState');

let handlers = require('./handlers');
let logplotHandlers = require('./wi-logplot-handlers');
let explorerHandlers = require('./wi-explorer-handlers');
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
let wiInputRangeLimit = require('./wi-input-range-limit');
let wiResizable = require('./wi-resizable');

// models
// let wiDepth = require('./wi-depth.model');
// let wiCurve = require('./wi-curve.model');
// let wiDataset = require('./wi-dataset.model');
// let wiProperty = require('./wi-property.model');
// let wiListview = require('./wi-listview.model');
// let wiTreeConfig = require('./wi-tree-config.model');
// let wiTreeItem = require('./wi-tree-item.model');
// let wiWell = require('./wi-well.model');
// let wiLogplotsModel = require('./wi-logplots.model');
// let wiLogplotModel = require('./wi-logplot.model');
let wiZone = require('./wi-zone');
let wiUser = require('./wi-user');
let wiMultiselect = require('./wi-multiselect');
let wiApiService = require('./wi-api-service');
let wiOnlineInvService = require('./wi-online-inv-service');
let wiMachineLearningApiService = require('./wi-machine-learning-api-service');
let wiComponentService = require('./wi-component-service');
let wiPatternService = require('./wi-pattern-service');


let wiConditionNode = require('./wi-condition-node');

let app = angular.module('wiapp',
    [
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

        wiD3DepthTrack.name,
        wiD3ZoneTrack.name,
        wiD3ImageTrack.name,
        wiD3ObjectTrack.name,
        wiD3LogTrack.name,
        wiD3CorrelationTrack.name,

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
        wiExportFromInventory.name,
        wiExportFromProject.name,
        wiTask.name,
        wiFlowDesigner.name,
        wiFlowEngine.name,
        wiPetrophysics.name,
        wiWorkflow.name,
        wiWorkflowPlayer.name,
        wiWFMachineLearning.name,
        wiNeuralNetwork.name,
        wiPlot.name,
        wiProps.name,

        wiComboview.name,
        wiD3Comboview.name,
        wiScroll.name,
        wiItemDropdown.name,

        wiElementReady.name,
        wiRightClick.name,
        wiEnter.name,
        wiDecimalPlaces.name,
        wiInputRangeLimit.name,
        wiResizable.name,

        // models
        // wiDepth.name,
        // wiCurve.name,
        // wiDataset.name,
        // wiProperty.name,
        // wiListview.name,
        // wiTreeConfig.name,
        // wiTreeItem.name,
        // wiWell.name,
        // wiLogplotsModel.name,
        // wiLogplotModel.name,

        wiApiService.name,
        wiMachineLearningApiService.name,
        wiOnlineInvService.name,
        wiComponentService.name,
        wiPatternService.name,

        wiZoneManager.name,
        wiZoneTemplateManager.name,
        wiZoneSetManager.name,
        wiParameterSet.name,

        wiCanvasRect.name,
        wiZone.name,
        wiContainer.name,
        wiReferenceWindow.name,
        wiUser.name,
        wiMultiselect.name,

        wiConditionNode.name,

        wiiExplorer.name,
        wiiItems.name,
        wiiProperties.name,

        ngInfiniteScroll,

        'angularModalService',
        'angularResizable',
        'ng-mfb',

        // 3rd lib

        'ngFileUpload',
        'ui.bootstrap',
        'ngSanitize',
        'ui.select',
        'angularjs-dropdown-multiselect',
        'mgo-angular-wizard',

        // chat module
        'chatModule'
    ]);

/*var onChangeHandlers = {
    'well' : function(props) {
        console.log("onchangehandler for well", props);
    },
    'dataset' : function(props) {
        console.log("onchangehandler for dataset", props);
    },
    'curve' : function(props) {
        console.log("onchangehandler for curve", props);
    },
    'logplot' : function(props) {
        console.log("onchangehandler for logplot", props);
    }
}*/

function appEntry($scope, $rootScope, $timeout, $compile, wiComponentService, ModalService, wiApiService, wiOnlineInvService) {
    // SETUP HANDLER FUNCTIONS
    let globalHandlers = {};
    let treeHandlers = {};
    let wiExplorerHandlers = {};
    let functionBindingProp = {
        $scope,
        wiComponentService,
        ModalService,
        wiApiService,
        wiOnlineInvService,
        $timeout
    };
    // Logplot Handlers
    wiComponentService.putComponent(wiComponentService.LOGPLOT_HANDLERS, logplotHandlers);
    // Crossplot Handlers
    wiComponentService.putComponent(wiComponentService.CROSSPLOT_HANDLERS, crossplotHanders);
    // dependency 3rd component

    utils.bindFunctions(globalHandlers, handlers, functionBindingProp);
    utils.bindFunctions(wiExplorerHandlers, explorerHandlers, functionBindingProp);

    wiComponentService.putComponent(wiComponentService.GLOBAL_HANDLERS, globalHandlers);
    // wiComponentService.putComponent(wiComponentService.TREE_FUNCTIONS, treeHandlers);
    wiComponentService.putComponent(wiComponentService.WI_EXPLORER_HANDLERS, wiExplorerHandlers);
    wiComponentService.putComponent(wiComponentService.HISTOGRAM_HANDLERS, histogramHandlers);

    wiComponentService.putComponent(wiComponentService.COMBOVIEW_HANDLERS, comboviewHandlers);
    $.getJSON( "./js/configFile.json", function(data) {
        wiComponentService.putComponent(wiComponentService.LIST_CONFIG_PROPERTIES, data);
    });
    // Hook globalHandler into $scope
    $scope.handlers = wiComponentService.getComponent(wiComponentService.GLOBAL_HANDLERS);

    // config explorer block - treeview
    $scope.myTreeviewConfig = {};
    // wiComponentService.treeFunctions = bindAll(appConfig.TREE_FUNCTIONS, $scope, wiComponentService);
    
    // config properties - list block
    // $scope.myPropertiesConfig = appConfig.LIST_CONFIG_TEST;
    wiComponentService.on('update-properties', function(data){
        $timeout(function() {
            $scope.inputProps = data.props;
            $scope.configData = wiComponentService.getComponent(wiComponentService.LIST_CONFIG_PROPERTIES)[data.type];
            $scope.typeProps = data.type;
            $scope.onChangeProps = utils.onChangeHandlers[data.type];
        }, 200);
    })
    // $scope.myPropertiesConfig = {};
    

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
    layoutManager.putLeft('explorer-block', 'Project');
    layoutManager.putLeft('property-block', 'Properties');

    wiComponentService.on(wiComponentService.PROJECT_LOADED_EVENT, function () {
        historyState.createHistory();
        wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER).removeAllRightTabs();
        let openedTabModels = [];
        if (historyState.getPlotsLengthFromHistory()) {
            let plots = historyState.getPlotsFromHistory();
            for (const type in plots) {
                const tabIds = plots[type];
                tabIds.forEach(id => {
                    const model = utils.getModel(type, id);
                    if (!model) return;
                    openedTabModels.push(model);
                })
            }
        }
        if (openedTabModels.length) {
            DialogUtils.confirmDialog(ModalService, 'Restore Opened Plot Tabs', 'Do you want to restore opened plot tabs?', function (ret) {
                if (ret) {
                    openedTabModels.forEach(model => {
                        switch (model.type) {
                            case 'logplot':
                                utils.openLogplotTab(wiComponentService, model);
                                break;
                            case 'crossplot':
                                utils.openCrossplotTab(model);
                                break;
                            case 'histogram':
                                utils.openHistogramTab(model);
                                break;
                            case 'comboview':
                                utils.openComboviewTab(model);
                                break;
                        }
                    });
                } else {
                    historyState.removeHistory();
                    historyState.createHistory();
                }
            })
        } else {
            historyState.removeHistory();
            historyState.createHistory();
        }
    });
    wiComponentService.on(wiComponentService.PROJECT_UNLOADED_EVENT, function () {
        wiComponentService.dropComponent(wiComponentService.PROJECT_LOADED);
        wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER).removeAllRightTabs();
        historyState.removeHistory();
    });

    // update size when container is resized
    $(window).on('resize', function () {
        layoutManager.updateSize();
    });

    $scope.onRibbonToggle = function (isCollapsed) {
        if (isCollapsed) {
            $('.ribbon-wrapper').css('height', 'auto');
        }
        else {
            $('.ribbon-wrapper').css('height', '120px');
        }
        setTimeout(function () {
            layoutManager.updateSize();
        }, 500);
    }

    // toastr config
    toastr.options.escapeHtml = true;
    toastr.options.progressBar = true;
    toastr.options.timeOut = 5000;
    toastr.options.extendedTimeOut = 10000;
    toastr.options.preventDuplicates = true;
}

function restoreProject($timeout, wiApiService, ModalService) {
    let query = queryString.parse(location.search);
    if (Object.keys(query).length && query.idProject) {
        $timeout(function () {
            wiApiService.getProject({
                idProject: query.idProject,
                name: query.name,
                owner: query.owner,
                shared: query.shared
            }, function (projectData) {
                utils.projectOpen(projectData);
            })
        }, 100);
    } else {
        let lastProject = JSON.parse(window.localStorage.getItem('LProject'));
        if (lastProject) {
            $timeout(function () {
                wiApiService.getProjectInfo(lastProject.id, function (project, err) {
                    if (!err) {
                        DialogUtils.confirmDialog(ModalService, "Open Last Project", "The system recorded last time you are opening project <b>" + lastProject.name + "</b>.</br>Do you want to open it?", function (ret) {
                            if (ret) {
                                wiApiService.getProject({
                                    idProject: lastProject.id
                                }, function (projectData) {
                                    utils.projectOpen(projectData);
                                });
                            }
                        })
                    } else {
                        window.localStorage.removeItem('LProject');
                    }
                })
            }, 100);
        }
    }
}
app.controller('AppController', function ($scope, $rootScope, $timeout, $compile, wiComponentService, ModalService, wiApiService, wiOnlineInvService, wiPatternService) {
    let functionBindingProp = {
        $scope,
        wiComponentService,
        ModalService,
        wiApiService,
        wiOnlineInvService,
        wiPatternService,
        $timeout
    };
    window.utils = utils;
    utils.setGlobalObj(functionBindingProp);
    wiComponentService.putComponent(wiComponentService.UTILS, utils);
    wiComponentService.putComponent(wiComponentService.DIALOG_UTILS, DialogUtils);
    if (!window.localStorage.getItem('rememberAuth')) {
        utils.doLogin(function (sameUser) {
            appEntry($scope, $rootScope, $timeout, $compile, wiComponentService, ModalService, wiApiService, wiOnlineInvService);
            if (sameUser) restoreProject($timeout, wiApiService, ModalService);
            else window.localStorage.removeItem('LProject');
        })
    } else {
        appEntry($scope, $rootScope, $timeout, $compile, wiComponentService, ModalService, wiApiService, wiOnlineInvService);
        restoreProject($timeout, wiApiService, ModalService);
    }
    $scope.token = function() {
        return window.localStorage.getItem('token');
    }
    $scope.groupName = function() {
        var lp = window.localStorage.getItem('LProject');
        if(lp) lp = JSON.parse(lp);
        return (lp || {}).name;
    } 
    $scope.groupOwner = function() {
        var lp = window.localStorage.getItem('LProject');
        var username = window.localStorage.getItem('username');
        if(lp) lp = JSON.parse(lp);
        return (lp || {}).owner || username;
    }
    $scope.username = function() {
        return window.localStorage.getItem('username');
    }
    // $scope.showChatGroup = false;
    // $scope.showHelpDesk = false;
});



