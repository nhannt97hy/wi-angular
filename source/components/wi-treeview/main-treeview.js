const wiTreeview = require('./wi-treeview');

const wiComponentService = require('./wi-component-service');

let app = angular.module('helloapp', [wiTreeview.name, wiComponentService.name]);

app.controller('WiDummy', function ($scope, wiComponentService) {
    $scope.myConfig = TREE_CONFIG_TEST;

    $scope.addItem = function (parentName) {
        let item = {
            name: 'item' + Date.now(),
            type: 'newitem',
            data: {
                icon: 'project-new-16x16',
                label: 'item ' + Date.now(),
                description: 'hic',
                childExpanded: false
            },
            children: []
        };

        wiComponentService.getComponent('MyTreeview').addItem(parentName, item);
    };

    wiComponentService.treeFunctions = TREE_FUNCTIONS;
});

TREE_FUNCTIONS = {
    'item11000' : function () {
        console.log('item11000');
    },
    'item11' : function () {
        console.log('item11');
    },
    'item121' : function () {
        console.log('item121');
    },
    'item12' : function () {
        console.log('item12');
    },
    'item2' : function () {
        console.log('item2');
    },
    'newitem' : function () {
        console.log('newitem');
    }
};

TREE_CONFIG_TEST = [
    {
        name: 'item11000',
        type: 'item11000',
        data: {
            icon: 'project-new-16x16',
            label: 'item 11000',
            description: 'mm',
            childExpanded: false
        },
        children: [
            {
                name: 'item11',
                type: 'item11',
                data: {
                    icon: 'project-new-16x16',
                    label: 'item 1.1',
                    description: 'hu hu hu',
                    childExpanded: false
                },
                children: [
                    {
                        name: 'item1211',
                        type: 'item121',
                        data: {
                            icon: 'project-new-16x16',
                            label: 'item 1.2.1.1',
                            description: 'hic',
                            childExpanded: false
                        },
                        children: []
                    },
                    {
                        name: 'item1212',
                        type: 'item121',
                        data: {
                            name: 'item122',
                            icon: 'project-new-16x16',
                            label: 'item 1.2.1.2',
                            description: '',
                            childExpanded: false
                        },
                        children: []
                    }
                ]
            },
            {
                name: 'item12',
                type: 'item12',
                data: {
                    icon: 'project-new-16x16',
                    label: 'item 1.2',
                    description: '',
                    childExpanded: false
                },
                children: []
            }
        ]
    },
    {
        name: 'item2',
        type: 'item2',
        data: {
            icon: 'project-new-16x16',
            label: 'item 2',
            description: 'description 2',
            childExpanded: false
        }
    }
];
