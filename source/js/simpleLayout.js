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
// let graph = require('./SimpleVisualize');

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

let wiNeuralNetwork = require('./wi-neural-network');
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
let wiWorkflowPlayer = require('./wi-workflow-player');
// let wiStep = require('./wi-step');

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

let wiExport = require('./wi-export');

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
        wiNeuralNetwork.name,

        wiComboview.name,
        wiD3Comboview.name,
        wiStages.name,
        wiItemList.name,
        wiItemDropdown.name,
        wiScroll.name,
        wiWorkflow.name,
        wiWorkflowPlayer.name,
        // wiStep.name,

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
        wiExport.name,
        'angularModalService',
        'angularResizable',

        // 3rd lib
        'ngFileUpload',
        'ui.bootstrap',
        'ngSanitize',
        'ui.select',
        'angularjs-dropdown-multiselect',
        'mgo-angular-wizard'
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
    wiComponentService.putComponent(wiComponentService.GRAPH, graph);
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
app.controller('wipm', function($scope, ModalService, wiApiService, wiComponentService, $http){
    let listCurves = [];
    const HOST = '54.169.13.92';
    const PORT = 3002;
    function getDataCurves(i, callback){
        listCurves = [];
        let wiWorkflowPlayer = wiComponentService.getComponent('wiWorkflowPlayer');
        console.log('wiWorkflowPlayer: ', wiWorkflowPlayer);
        let inputData = wiWorkflowPlayer.workflowConfig.steps[i].inputData;
        if(inputData){
            let listInputData = [];
            inputData.forEach(function(data, i){
                let checkFullCurve = true;
                for(let j =0 ; j<data.inputs.length; j++){
                    if(!data.inputs[j].value){
                        checkFullCurve = false;
                        break;
                    }
                }
                if(checkFullCurve)
                    listInputData.push(data.inputs);
            });
            for(let i =0; i< inputData[0].inputs.length; i++){
                listCurves[i] = [];
            }
            listInputData.forEach(function(input_data, i){
                let j=-1;
                async.each(input_data, function(curve,__end){
                    wiApiService.dataCurve(curve.value.id, function(data){
                        j++;
                        data.forEach(function(point){
                            listCurves[j].push(point.x);
                        });
                        __end();
                    });
                }, function(err){
                    if(i==listInputData.length-1){
                        console.log(listCurves);
                        callback(listCurves);
                    }
                });
            });
        }else {
            toastr.error('Choose a dataset', '');
        }
    }
    $scope.myWorkflowConfig = {
        name: "Missing curve reconstruction",
        steps: [
            {
                name: "Train",
                inputs: [
                    { name: "Curve Data " },
                    { name: "Curve Data " },
                    { name: "Curve Data " },
                    { name: "Curve Data " },
                    { name: "Curve Data " },
                    { name: "Curve Target " }],
                parameters: [],
                processFunction: train
            },
            // {
            //     name: "Verify",
            //     inputs: [
            //         { name: "Curve Data" },
            //         { name: "Curve Data" },
            //         { name: "Curve Data" },
            //         { name: "Curve Data" },
            //         { name: "Curve Data" },
            //         { name: "Curve Verify" }
            //     ],
            //     parameters: [],
            //     processFunction: verify
            // },
            {
                name: "Predict",
                inputs: [
                    { name: "Curve Data " },
                    { name: "Curve Data " },
                    { name: "Curve Data " },
                    { name: "Curve Data " },
                    { name: "Curve Data " } 
                ],
                parameters: [],
                processFunction: predict
            }
        ]
    }
    function filterNull(curves){
        let l = curves.length;
        let filterCurves = [];
        for(let j = 0; j<l; j++){
            filterCurves[j] = [];
        }
        for(let i = 0; i<curves[0].length; i++){
            let checkNull = true;
            for(let j=0; j<l; j++)
                if(curves[j][i] === "null")
                    checkNull = false;
            if(checkNull)
                for(let j = 0; j<l; j++){
                    filterCurves[j].push(curves[j][i]);
                }
        }
        console.log('result of filterNull: ', filterCurves);
        return filterCurves;
    }
    function train(){
        getDataCurves(0, function(list_curves){
            let curves = filterNull(list_curves);
            DialogUtils.trainModelDialog(ModalService, function(payload){
                payload.data.push(curves[0], curves[1], curves[2], curves[3], curves[4]);
                curves[5].forEach(function(x){
                    payload.target.push(x);
                })
                console.log(payload.data);
                console.log(payload.target);
                wiComponentService.getComponent('SPINNER').show();       
                $http({
                    method: 'POST',
                    url: 'http://'+HOST+':'+PORT + '/store/api/model/new',
                    data: payload
                }).then(function(response){
                        console.log('create model:', response.data);
                        wiComponentService.getComponent('SPINNER').hide();
                        var res = response.data;
                        if(res.statusCode == 200){
                            toastr.success('Create model success!', '');
                        }else{
                            toastr.error(res.body.message, '');
                        }
                        return;
                }, function(error){
                    wiComponentService.getComponent('SPINNER').hide();
                    toastr.error('Call store api create model error!', '');
                    return;
                })
            });
        })
    }
    function verify(){

    }
    function predict(){
        getDataCurves(1, function(list_curves){
            let curves = filterNull(list_curves);
            DialogUtils.predictModelDialog(ModalService, function(payload){
                payload.data = curves;
                wiComponentService.getComponent('SPINNER').show();  
                $http({
                    method: 'POST',
                    url: 'http://'+HOST+':'+PORT + '/store/api/predict',
                    data: payload
                }).then(function(response){
                    wiComponentService.getComponent('SPINNER').hide();
                    var res = response.data;
                    console.log(list_curves);
                    for(let i = 0; i<list_curves[0].length; i++)
                    {
                        if(list_curves[0][i]==="null" || list_curves[1][i]==="null" || list_curves[2][i]==="null"
                        || list_curves[3][i]==="null" || list_curves[4][i]==="null")
                        {
                            res.body.target.splice(i,0,"null");
                            // console.log(list_curves[0][i]);                            
                        }
                    }
                    // console.log('predict:', res);
                    console.log('result of predict: ', res.body.target);
                    if(res.statusCode == 200){
                        toastr.success('Predict observation success!', '');
                    }else{
                        console.log('fail');
                        toastr.error(res.body.message, '');
                    }
                    return;
                }, function(error){
                    wiComponentService.getComponent('SPINNER').hide();
                    toastr.error("Call store api predict error", '');
                    return;
                });
            });
        });
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

app.controller('NeuralController', function($scope, ModalService) {
    console.log('controller: ', this, $scope);
    let self = this;
    // fake datas
    self.nNodes = 16;
    self.nLayers = 6;
    self.inputCurves = [{name: 'DTCO3'}, {name: 'ECGR'}, {name: 'DTCO3'}, {name: 'DTCO3'}, {name: 'DTCO3'},
                        {name: 'ECGR'}, {name: 'DTCO3'}, {name: 'DTCO3'}];;
    self.outputCurves = [{name: 'C2'}, {name: 'ECGR'}, {name: 'DTCO3'}];
    console.log('controller: ', this, $scope);
    this.addLayerButtonClicked = function () {
        this.nLayers ++;
    }
    this.removeLayerButtonClicked = function () {
        this.nLayers = (--this.nLayers) < 0 ? 0:this.nLayers;
    }
    this.addNodeButtonClicked = function () {
        this.nNodes ++;
    }
    this.removeNodeButtonClicked = function () {
        this.nNodes = (--this.nNodes) < 0 ? 0:this.nNodes;
    }
    this.neuralNetWorkProperties = function () {
        let config = self.getConfigs();
        DialogUtils.neuralNetWorkPropertiesDialog(ModalService, config, function (nnConfig) {
            self.setConfigs(nnConfig);
        });
    }
    this.getConfigs = function () {
        return {
            inputCurves: self.inputCurves,
            nLayers: self.nLayers,
            nNodes: self.nNodes,
            outputCurves: self.outputCurves
        }
    }

    this.setConfigs = function (newConfig) {
        // change reference of 2 array to invoke $onChanges methods
        self.inputCurves = angular.copy(newConfig.inputCurves);
        self.outputCurves = angular.copy(newConfig.outputCurves);
        self.nLayers = newConfig.nLayers;
        self.nNodes = newConfig.nNodes;
    }
})

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
