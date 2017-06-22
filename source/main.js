wiButton = require('./wi-button.js');
wiDropdown = require('./wi-dropdown.js');
wiToolbar = require('./wi-toolbar.js');
wiTabs = require('./wi-tabs.js');
wiWorkingtabs = require('./wi-workingtabs.js');
wiTreeview = require('./wi-treeview');
wiStatusBar = require('./wi-status-bar');
wiSlidingbar = require('./wi-slidingbar');
appConfig = require('./app.config');
dialogUtils = require('./DialogUtils');
var app = angular.module('wiapp',
    [
        'angularModalService',
        wiButton.name,
        wiDropdown.name,
        wiToolbar.name,
        wiTabs.name,
        wiWorkingtabs.name,
        wiTreeview.name,
        wiStatusBar.name,
        wiSlidingbar.name
    ]);

app.controller('AppController', function ($scope, $timeout, ModalService) {
    $scope.myConfig = appConfig.TREE_CONFIG_TEST;
    $scope.NewProjectButtonHandler = function() {
        console.log("New Project Button clicked");
        dialogUtils.newProjectDialog($scope, ModalService);
    };
    $scope.OpenProjectButtonHandler = function() {
        console.log("Open Project Button clicked");
        dialogUtils.openProjectDialog($scope, ModalService);
    }
/*
    $scope.config = {
        ProjectTab: {
            heading: 'Project'
        },
        WellTab: {
            heading: 'Well'
        }
    };

    $scope.workingTabs = appConfig.WORKING_TABS;
*/
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

