const wiTreeview = require('./wi-treeview');

const wiComponentService = require('./wi-component-service');

let app = angular.module('helloapp', [wiTreeview.name, wiComponentService.name]);

app.controller('WiDummy', function ($scope, wiComponentService) {
    $scope.myConfig = TREE_CONFIG_TEST;

    $scope.addItem = function (parentName) {
        let item = {
            name: 'item' + Date.now(),
            data: {
                icon: 'project-new-16x16',
                label: 'item ' + Date.now(),
                description: 'hic',
                childExpanded: false,
                handler: function () {
                    console.log('handler');
                }
            },
            children: []
        };

        wiComponentService.getComponent('MyTreeview').addItem(parentName, item);
    }
});

TREE_CONFIG_TEST = [
    {
        name: 'item11000',
        data: {
            icon: 'project-new-16x16',
            label: 'item 11000',
            description: 'mm',
            childExpanded: false,
            handler: function () {
                console.log('handler');
            }
        },
        children: [
            {
                name: 'item11',
                data: {
                    icon: 'project-new-16x16',
                    label: 'item 1.1',
                    description: 'hu hu hu',
                    childExpanded: false,
                    handler: function () {
                        console.log('handler');
                    }
                },
                children: [
                    {
                        name: 'item121',
                        data: {
                            icon: 'project-new-16x16',
                            label: 'item 1.2.1',
                            description: 'hic',
                            childExpanded: false,
                            handler: function () {
                                console.log('handler');
                            }
                        },
                        children: []
                    },
                    {
                        name: 'item122',
                        data: {
                            name: 'item122',
                            icon: 'project-new-16x16',
                            label: 'item 1.2.2',
                            description: '',
                            childExpanded: false,
                            handler: function () {
                                console.log('handler');
                            }
                        },
                        children: []
                    }
                ]
            },
            {
                name: 'item12',
                data: {
                    icon: 'project-new-16x16',
                    label: 'item 1.2',
                    description: '',
                    childExpanded: false,
                    handler: function () {
                        console.log('handler');
                    }
                },
                children: []
            }
        ]
    },
    {
        name: 'item2',
        data: {
            icon: 'project-new-16x16',
            label: 'item 2',
            description: 'description 2',
            childExpanded: false,
            handler: function () {
                console.log('handler');
            }
        }
    }
];
