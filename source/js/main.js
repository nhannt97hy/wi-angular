var appConfig = require('./app.config');
var wiButton = require('./wi-button.js');
var wiDropdown = require('./wi-dropdown.js');
var wiToolbar = require('./wi-toolbar.js');
var wiTabs = require('./wi-tabs.js');
var wiWorkingtabs = require('./wi-workingtabs.js');
var wiTreeview = require('./wi-treeview');
var wiStatusBar = require('./wi-status-bar');
var wiSlidingbar = require('./wi-slidingbar');
var wiLogplot = require('./wi-logplot.js');

var wiList = require('./wi-list');

var layoutManager = require('./layout.js');

wiComponentService = require('./wi-component-service.js');

var app = angular.module('wiapp',
    [
        wiButton.name,
        wiDropdown.name,
        wiToolbar.name,
        wiTabs.name,
        wiWorkingtabs.name,
        wiTreeview.name,
        wiStatusBar.name,
        wiSlidingbar.name,
        wiLogplot.name,
        wiList.name,
        wiComponentService.name
    ]);

app.controller('AppController', function ($scope, $timeout, $compile) {
    $scope.myConfig = appConfig.TREE_CONFIG_TEST;

    $scope.config = {
        ProjectTab: {
            heading: 'Project'
        },
        WellTab: {
            heading: 'Well'
        }
    };

    $scope.listItems = [
        {
            imgUrl: '',
            key: 'key',
            value: 'value'
        },
        {
            imgUrl: '',
            key: 'key',
            value: 'value'
        },
        {
            imgUrl: '',
            key: 'key',
            value: 'value'
        },
        {
            imgUrl: '',
            key: 'key',
            value: 'value'
        }
    ];

    $scope.workingTabs = appConfig.WORKING_TABS;
    layoutManager.createLayout('myLayout', $scope, $compile);
    layoutManager.putLeft('explorer-block');
    layoutManager.putLeft('property-block');
/*
    var myLayout = new GoldenLayout(layoutConfig, document.getElementById('myLayout'));

    myLayout.registerComponent('wi-block', function(container, componentState){
        console.log('templateId', componentState.templateId);
        var templateHtml = $('template#' + componentState.templateId).html();
        container.getElement().html( $compile(templateHtml)($scope) );
    });
    myLayout.init();
*/
});

