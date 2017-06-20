appConfig = require('./app.config');
wiButton = require('./wi-button.js');
wiDropdown = require('./wi-dropdown.js');
wiToolbar = require('./wi-toolbar.js');
wiTabs = require('./wi-tabs.js');
wiWorkingtabs = require('./wi-workingtabs.js');
wiTreeview = require('./wi-treeview');
wiStatusBar = require('./wi-status-bar');
wiSlidingbar = require('./wi-slidingbar');
wiLogplot = require('./wi-logplot.js');

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
        wiLogplot.name
    ]);

app.controller('AppController', function ($scope, $timeout) {
    $scope.myConfig = appConfig.TREE_CONFIG_TEST;

    $scope.config = {
        ProjectTab: {
            heading: 'Project'
        },
        WellTab: {
            heading: 'Well'
        }
    };

    $scope.workingTabs = appConfig.WORKING_TABS;

    /**
     * debug working tabs
     */
    // $timeout(function () {
    //     console.log($scope.workingTabs);
    //     printLog();
    // }, 5000);
    //
    // function printLog() {
    //     $timeout(function () {
    //         console.log($scope.workingTabs);
    //         printLog();
    //     }, 5000);
    // }
});