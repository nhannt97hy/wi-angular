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

wiList = require('./wi-list');

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
});

var config = {
    settings: {
        hasHeaders: true
    },
    content: [
        {
            type: "row",
            content: [
                {
                    type: 'component',
                    componentName: "wi-block",
                    componentState: {
                        templateId: 'explorer-block'
                    }
                },
                {
                    type: 'component',
                    componentName: 'wi-block',
                    componentState: {
                        templateId: 'working-block'
                    }
                }
            ]
        }
    ]
};
document.addEventListener("DOMContentLoaded", function(event) { 
    var myLayout = new GoldenLayout(config, document.getElementById('myLayout'));

    myLayout.registerComponent('wi-block', function(container, componentState){
        var templateHtml = $('template#' + componentState.templateId).html();
        container.getElement().html(templateHtml);
    });
    myLayout.on('initialised', function() {
        $('body').attr('ng-controller', 'AppController as app');
        angular.bootstrap(document.body, ['wiapp']);
    });
    myLayout.init();
});
