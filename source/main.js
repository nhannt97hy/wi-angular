wiButton = require('./wi-button.js');
wiToolbar = require('./wi-toolbar.js');
wiTabs = require('./wi-tabs.js');
wiTreeview = require('./wi-treeview');
wiStatusBar = require('./wi-status-bar');

var app = angular.module('wiapp', [wiButton.name, wiToolbar.name, wiTabs.name, wiTreeview.name, wiStatusBar.name]);

app.controller('AppController', function ($scope) {
    $scope.myConfig = TREE_CONFIG_TEST;
});

const TREE_CONFIG_TEST = [
    {
        data: {
            imgUrl: 'img/32x32/project_new_32x32.png',
            label: 'item 1',
            description: 'description 1',
            childExpanded: false,
            handler: ''
        },
        children: [
            {
                data: {
                    imgUrl: 'img/32x32/project_new_32x32.png',
                    label: 'item 1.1',
                    description: '',
                    childExpanded: true,
                    handler: ''
                },
                children: [
                    {
                        data: {
                            imgUrl: 'img/32x32/project_new_32x32.png',
                            label: 'item 1.2.1',
                            description: '',
                            childExpanded: true,
                            handler: ''
                        },
                        children: [
                            {
                                data: {
                                    imgUrl: 'img/32x32/project_new_32x32.png',
                                    label: 'item 1.2.1.1',
                                    description: '',
                                    childExpanded: true,
                                    handler: ''
                                },
                                children: [
                                    {
                                        data: {
                                            imgUrl: 'img/32x32/project_new_32x32.png',
                                            label: 'item 1.2.1.1.1',
                                            description: '',
                                            childExpanded: true,
                                            handler: ''
                                        },
                                        children: [

                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        data: {
                            imgUrl: 'img/32x32/project_new_32x32.png',
                            label: 'item 1.2.2',
                            description: '',
                            childExpanded: true,
                            handler: ''
                        },
                        children: [

                        ]
                    }
                ]
            },
            {
                data: {
                    imgUrl: 'img/32x32/project_new_32x32.png',
                    label: 'item 1.2',
                    description: '',
                    childExpanded: true,
                    handler: ''
                },
                children: []
            }
        ]
    },
    {
        data: {
            imgUrl: 'img/32x32/project_new_32x32.png',
            label: 'item 2',
            description: 'description 2',
            childExpanded: true,
            handler: ''
        }
    }
];