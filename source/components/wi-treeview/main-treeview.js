wiTreeview = require('./wi-treeview');

var app = angular.module('helloapp', [wiTreeview.name]);
app.controller('WiDummy', function($scope) {
    $scope.myConfig = TREE_CONFIG_TEST;
});

TREE_CONFIG_TEST = [
    {
        data: {
            icon: 'project-new-16x16',
            label: 'item 1',
            description: 'description 1',
            childExpanded: false,
            handler: function () {
                console.log('handler');
            }
        },
        children: [
            {
                data: {
                    icon: 'project-new-16x16',
                    label: 'item 1.1',
                    description: '',
                    childExpanded: false,
                    handler: function () {
                        console.log('handler');
                    }
                },
                children: [
                    {
                        data: {
                            icon: 'project-new-16x16',
                            label: 'item 1.2.1',
                            description: '',
                            childExpanded: false,
                            handler: function () {
                                console.log('handler');
                            }
                        },
                        children: []
                    },
                    {
                        data: {
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