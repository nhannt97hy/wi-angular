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

let graph = require('./graph');
let dragMan = {
    dragging: false,
    draggedObj: null,
    cancelingId: null
};

let wiElementReady = require('./wi-element-ready');
let wiRightClick = require('./wi-right-click');

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

        wiComponentService.name,
        'angularModalService'
    ]);
app.controller('AppController', function ($scope, $rootScope, $timeout, $compile, wiComponentService, ModalService) {
    // UTIL FUNCTIONS
    wiComponentService.putComponent('UTILS', utils);
    // Logplot Handlers
    wiComponentService.putComponent('LOGPLOT_HANDLERS', logplotHandlers);


    // SETUP HANDLER FUNCTIONS
    let globalHandlers = {};
    let treeHandlers = {};
    utils.bindFunctions(globalHandlers, handlers, {
        $scope: $scope,
        wiComponentService: wiComponentService,
        ModalService: ModalService
    });
   utils.bindFunctions(globalHandlers, logplotHandlers, {
       $scope: $scope,
       wiComponentService: wiComponentService,
       ModalService: ModalService
   });
    utils.bindFunctions(globalHandlers, explorerHandlers, {
        $scope: $scope,
        wiComponentService: wiComponentService,
        ModalService: ModalService
    });
    utils.bindFunctions(treeHandlers, treeviewHandlers, {
        $scope: $scope,
        wiComponentService: wiComponentService,
        ModalService: ModalService
    });
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
    wiComponentService.putComponent('DRAG_MAN', dragMan);
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

    $(document).ready(function () {
        $('.wi-parent-node').draggable({
            start: function (event, ui) {
                console.log('start', ui.helper.attr('data-curve'));
                dragMan.dragging = true;
                dragMan.draggedObj = ui.helper.attr('data-curve');
            },
            stop: function (event, ui) {
                dragMan.cancelingId = setTimeout(function () {
                    console.log('stop');
                    dragMan.dragging = false;
                    dragMan.draggedObj = null;
                    dragMan.cancelingId = null;
                }, 1000);
            },
            appendTo: 'body',
            revert: false,
            scroll: false,
            helper: 'clone',
            containment: 'document'
        });
    });
});
