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

//let DialogUtils = require('./DialogUtils');
let DialogUtils = require('./SimpleDialogUtils');

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
let wiChunkedUpload = require('./wi-chunked-upload');
let wiProgressBar = require('./wi-progress-bar');

let wiComboview = require('./wi-comboview');
let wiD3Comboview = require('./wi-d3-comboview');
let wiStages = require('./wi-stages');

let wiItemList = require('./wi-item-list');
let wiItemDropdown = require('./wi-item-dropdown');
let wiScroll = require('./wi-scroll');
let wiWorkflow = require('./wi-workflow');
let wiStep = require('./wi-step');

let wiiExplorer = require('./wii-explorer');
let wiiItems = require('./wii-items');
let wiiProperties = require('./wii-properties');

let layoutManager = require('./layout');
let historyState = require('./historyState');

let handlers = require('./simple-layout-handlers');
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
let wiComponentService = require('./wi-component-service');
let wiChunkedUploadService = require('./wi-chunked-upload-service');
let wiBatchApiService = require('./wi-batch-api-service');
let wiOnlineInvService = require('./wi-online-inv-service');

let wiConditionNode = require('./wi-condition-node');

let wipm = require('./wi-predict-model');
let wiTest = require('./wi-test');

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

        wiComboview.name,
        wiD3Comboview.name,
        wiStages.name,
        wiItemList.name,
        wiItemDropdown.name,
        wiScroll.name,
        wiWorkflow.name,
        wiStep.name,

        wiElementReady.name,
        wiRightClick.name,
        wiEnter.name,
        wiDecimalPlaces.name,

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
        wiComponentService.name,
        wiChunkedUploadService.name,
        wiBatchApiService.name,
        wiOnlineInvService.name,

        wiCanvasRect.name,
        wiZone.name,
        wiContainer.name,
        wiReferenceWindow.name,
        wiUser.name,
        wiMultiselect.name,

        wiChunkedUpload.name,
        wiProgressBar.name,

        wiConditionNode.name,

        wiiExplorer.name,
        wiiItems.name,
        wiiProperties.name,

        ngInfiniteScroll,
        wipm.name,
        wiTest.name,
        'angularModalService',
        'angularResizable',

        // 3rd lib
        'ngFileUpload',
        'ui.bootstrap',
        'ngSanitize',
        'ui.select',
        'angularjs-dropdown-multiselect'
    ]);

function appEntry($scope, $rootScope, $timeout, $compile, wiComponentService, ModalService, wiApiService, wiChunkedUploadService, wiOnlineInvService, wiBatchApiService) {
    // SETUP HANDLER FUNCTIONS
    let globalHandlers = {};
    let treeHandlers = {};
    let wiExplorerHandlers = {};
    let functionBindingProp = {
        $scope,
        wiComponentService,
        ModalService,
        wiApiService,
        wiChunkedUploadService,
        wiOnlineInvService,
        wiBatchApiService,
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
    //window.__HANDLERS = globalHandlers;

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
            $('.ribbon-wrapper').css('height', '120px');
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

    layoutManager.setLayoutConfig({
        settings: {
            hasHeaders: false,
            showMaximiseIcon: false,
            showCloseIcon: false,
            showPopoutIcon: false
        },
        dimensions: {
            borderWidth: 5
        },
        content: [ ]
    });
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
app.controller('AppController', function ($scope, $rootScope, $timeout, $compile, wiComponentService, ModalService, wiApiService, wiChunkedUploadService, wiOnlineInvService, wiBatchApiService) {
    let functionBindingProp = {
        $scope,
        wiComponentService,
        ModalService,
        wiApiService,
        $timeout
    };
    $scope.wiBatchApiService = wiBatchApiService;
    window.utils = utils;
    utils.setGlobalObj(functionBindingProp);
    wiComponentService.putComponent(wiComponentService.UTILS, utils);
    wiComponentService.putComponent(wiComponentService.DIALOG_UTILS, DialogUtils);
    appEntry($scope, $rootScope, $timeout, $compile, wiComponentService, ModalService, wiApiService, wiChunkedUploadService, wiOnlineInvService, wiBatchApiService);
    if(!window.localStorage.getItem('rememberAuth')) {
        utils.doLogin(function () {
            onInit();
        });
    }
    else {
        $scope.$on('initialized', onInit);
    }
    $scope.helpClick = function() {
        console.log('Help clicked');
    }
    $scope.onItemSelect = function(viewIndex, modelIndex, selectedItem) {
        console.log(viewIndex, modelIndex, selectedItem);
    }
    function onInit() {
        //$timeout(function() { handlers.InventoryInspectionButtonClicked(); }, 500);
        wiComponentService.getComponent(wiComponentService.GLOBAL_HANDLERS).InventoryInspectionButtonClicked();
        /*
        layoutManager.getRoot().addChild({
            type: 'component',
            id: 'import-block',
            componentName: 'wi-block',
            componentState: {
                templateId: 'import-block'
            },
            title: 'Title'
        });
        */
    }
});
app.controller('zipArchiveManager', function($scope, $timeout, wiBatchApiService, $rootScope, ModalService) {
    window.ZIPARCHIVEMAN = $scope;
    $scope.deleteZipArchive = function(zipArchiveName) {
        wiBatchApiService.deleteDataDir(zipArchiveName, function(err, res) {
            if (err) {
                toastr.error('Error' + (err.message || err));
                return;
            }
            updateWorkflowList();
        });
    }
    $scope.deleteWellHeaderCSV = function(idUserFileUploaded) {
        wiBatchApiService.deleteWellHeaderCSV(idUserFileUploaded, function(err, res) {
            if (err) return toastr.error('Error' + (err.message || err));
            updateWellHeaderCSVList();
        });
    }
    $scope.deleteWellTopCSV = function(idUserFileUploaded) {
        wiBatchApiService.deleteWellTopCSV(idUserFileUploaded, function(err, res) {
            if (err) return toastr.error('Error' + (err.message || err));
            updateWellTopCSVList();
        });
    }
    updateWorkflowList();
    $scope.wiBatchUrl = wiBatchApiService.getWiBatchUrl();
    $scope.username = window.localStorage.getItem('username');
    $scope.nextStage = function(zArchive) {
        $rootScope.zipArchive = zArchive;
        angular.element($('wi-stages ul')[0]).scope().ctrl.skip();
    }
    $scope.updateWorkflowList = updateWorkflowList;
    $scope.updateWellHeaderCSVList = updateWellHeaderCSVList;
    $scope.updateWellTopCSVList = updateWellTopCSVList;
    $scope.runImport = runImport;
    $scope.importWellHeaderCSV = importWellHeaderCSV;
    $scope.importWellTopCSV = importWellTopCSV;
    $scope.showRecentWHSuccessWells = showRecentWHSuccessWells;
    function updateWorkflowList() {
        wiBatchApiService.listWorkflows(function(err, workflows) {
            if (err) {
                toastr.error('Error' + (err.message || err));
                return;
            }
            $scope.zipArchives = workflows;
            $rootScope.zipArchives = angular.copy($scope.zipArchives);
        });
    }
    function updateWellHeaderCSVList() {
        wiBatchApiService.listWellHeaderCSVs(function(err, wellHeaderCSVs) {
            if (err) {
                toastr.error('Error' + (err.message || err));
                return;
            }
            $scope.wellHeaderCSVs = wellHeaderCSVs;
        });
    }
    function updateWellTopCSVList() {
        wiBatchApiService.listWellTopCSVs(function(err, wellTopCSVs) {
            if (err) {
                toastr.error('Error' + (err.message || err));
                return;
            }
            $scope.wellTopCSVs = wellTopCSVs;
        });
    }
    function runImport(zipArchive) {
        DialogUtils.runImportDialog(ModalService, $scope.zipArchives, zipArchive);
    }
    function importWellHeaderCSV(whCSV) {
        DialogUtils.runImportWellHeaderDialog(ModalService, function(callback) {
            wiBatchApiService.runImportWellHeaderCSV(whCSV.idUserFileUploaded, function(err) {
                if (!err) {
                    wiBatchApiService.listWHSuccessWells(callback);
                }
                else callback(new Error('Unknown error'));
            });
        });
    }
    function importWellTopCSV(wtCSV) {
        DialogUtils.runImportWellTopDialog(ModalService, wtCSV);
    }
    function showRecentWHSuccessWells() {
        DialogUtils.runImportWellHeaderDialog(ModalService, function(callback) {
            wiBatchApiService.listWHSuccessWells(callback);
        });
    }
});
const monthNames = [ 
    "Jan", "Feb", "Mar", "Apr", 
    "May", "Jun", "Jul", "Aug", 
    "Sep", "Oct", "Nov", "Dec"
];
app.controller('runImport', function($scope, $rootScope, $timeout) {
    var socket = initSocket();
    $scope.selected = {};
    $scope.selected.zipArchive = $rootScope.zipArchive;
    $scope.isDisabled = !!$rootScope.zipArchive;
    delete $rootScope.zipArchive;

    $scope.message = "Select a zip archive to import into Inventory";
    $scope.animateClass = "";
    $scope.msgQueue = [];

    if (!$scope.selected.zipArchive) 
        $scope.selected.zipArchive = $rootScope.zipArchives && $rootScope.zipArchives.length ? $rootScope.zipArchives[0] : null;

    $scope.zipArchives = $rootScope.zipArchives;

    $scope.onSelectZipArchive = function() {
        console.log('abc :', $scope.selected.zipArchive);
    }

    $scope.startImport = function() {
        $scope.message = "Importing zip archive ...";
        $scope.animateClass = "animate";
        let token = window.localStorage.getItem('token');
        if (!$scope.selected.zipArchive || !$scope.selected.zipArchive.workflowName || !$scope.selected.zipArchive.workflowName.length) {
            toastr.error("Please choose a zip archive");
            return;
        }
        if (!token) {
            toastr.error("Please login");
            return;
        }
        socket.emit('run-workflow', {
            token: token,
            workflowName: $scope.selected.zipArchive.workflowName
        });
    }
    function initSocket() {
        var socket = io(wiBatchApiService.wiBatchUrl);
        socket.on('run-workflow-done', function(msg) {
            console.log(msg);
            $timeout(function() {
                $scope.msgQueue.push(msg);
                var conObj = $('.console');
                conObj.scrollTop(conObj[0].scrollHeight);
            });
        }).on('run-workflow-file-result', function(msg) {
            $timeout(function() {
                $scope.msgQueue.push(msg);
                var conObj = $('.console');
                conObj.scrollTop(conObj[0].scrollHeight);
            });
        });
        return socket;
    }
});

app.controller('InventoryInspect', function($scope, wiOnlineInvService) {
    console.log('InventoryInspect');
    $scope.labelToggle;
    $scope.onWellListScrollTop = function(wiItemListCtrl) {
        return new Promise(function() {
            if (!wiItemListCtrl.items.length) {
                resolve(0);
            }
            else {
                let wells = wiItemListCtrl.items;
                wiOnlineInvService.listWells({
                    start: wells[0].properties.idWell, 
                    limit: 10, 
                    forward: false
                }, function(listOfWells) {
                    $timeout(function() {
                        console.log(listOfWells);
                        for (let well of listOfWells) {
                            let wellModel = utils.wellToTreeConfig(well);
                            wellModel.data.toggle = $scope.labelToggle;
                            wells.unshift(wellModel);
                            wells.pop();
                        }
                        resolve(listOfWells.length);
                    });
                });
            }
        });
    }
    $scope.onWellListScrollBottom = function(wiItemListCtrl) {
        return new Promise(function() {
            if (!wiItemListCtrl.items.length) {
                resolve(0);
            }
            else {
                let wells = wiItemListCtrl.items;
                wiOnlineInvService.listWells({
                    start: wells[wells.length - 1].properties.idWell, 
                    limit: 10, 
                    forward: true
                }, function(listOfWells) {
                    $timeout(function() {
                        console.log(listOfWells);
                        for (let well of listOfWells) {
                            let wellModel = utils.wellToTreeConfig(well);
                            wellModel.data.toggle = $scope.labelToggle;
                            wells.push(wellModel);
                            wells.shift();
                        }
                        resolve(listOfWells.length);
                    });
                });
            }
        });
    }
});

app.filter('datetimeFormat', function() {
    return function(timestamp) {
        var date = new Date(parseInt(timestamp));
        return date.getFullYear() + "-" + monthNames[date.getMonth()] + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    }
});
app.filter('timeFormat', function() {
    return function(timestamp) {
        var date = new Date(parseInt(timestamp));
        var h = date.getHours();
        var m = date.getMinutes();
        var s = date.getSeconds();

        h = (h > 9)?h:("0" + h);
        m = (m > 9)?m:("0" + m);
        s = (s > 9)?s:("0" + s);
        return h + ":" + m + ":" + s;
    }
});
