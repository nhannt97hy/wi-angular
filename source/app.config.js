TREE_FUNCTIONS = {
    'item11000': function () {
        console.log('item11000');
    },
    'item11': function () {
        console.log('item11');
    },
    'item121': function () {
        console.log('item121');
    },
    'item12': function () {
        console.log('item12');
    },
    'item2': function () {
        console.log('item2');
    },
    'newitem': function () {
        console.log('newitem');
    },
    'logplot': function () {
        this.wiComponentService.emit('new-logplot-tab', 'new logplot');
        console.log('$scope ', this.$scope);
    }
};

EXPLORER_TREE_CONFIG = [
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
    },
    {
        name: 'logplot1',
        type: 'logplot',
        data: {
            icon: 'project-new-16x16',
            label: 'Logplot',
            description: 'Logplot',
            childExpanded: false
        }
    }
];

PROPERTIES_LIST_CONFIG = [
    {
        name: 'list1',
        heading: 'List 1',
        data: [
            {
                key: 'key1',
                value: 'value'
            },
            {
                key: 'key1',
                value: 'value'
            },
            {
                key: 'key1',
                value: 'value'
            }
        ]
    },
    {
        name: 'list2',
        heading: 'List 2',
        data: [
            {
                key: 'key2',
                value: 'value'
            },
            {
                key: 'key2',
                value: 'value'
            }
        ]
    }
];


exports.TREE_CONFIG_TEST = EXPLORER_TREE_CONFIG;
exports.LIST_CONFIG_TEST = PROPERTIES_LIST_CONFIG;
exports.TREE_FUNCTIONS = TREE_FUNCTIONS;