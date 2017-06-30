PROPERTIES_LIST_CONFIG_TEST_1 = [
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

PROPERTIES_LIST_CONFIG_TEST_2 = [
    {
        name: 'list3',
        heading: 'List 3',
        data: [
            {
                key: 'key3',
                value: 'value'
            },
            {
                key: 'key3',
                value: 'value'
            },
            {
                key: 'key3',
                value: 'value'
            }
        ]
    },
    {
        name: 'list4',
        heading: 'List 4',
        data: [
            {
                key: 'key4',
                value: 'value'
            },
            {
                key: 'key4',
                value: 'value'
            }
        ]
    }
];

PROPERTIES_LIST_CONFIG_TEST_3 = [
    {
        name: 'list5',
        heading: 'List 5',
        data: [
            {
                key: 'key5',
                value: 'value'
            },
            {
                key: 'key5',
                value: 'value'
            },
            {
                key: 'key5',
                value: 'value'
            }
        ]
    },
    {
        name: 'list6',
        heading: 'List 6',
        data: [
            {
                key: 'key6',
                value: 'value'
            },
            {
                key: 'key6',
                value: 'value'
            }
        ]
    }
];

EXPLORER_TREE_CONFIG = [
    {
        name: 'item11000',
        type: 'item11000',
        data: {
            icon: 'project-new-16x16',
            label: 'item 11000',
            description: 'mm',
            childExpanded: false,
            properties: PROPERTIES_LIST_CONFIG_TEST_2
        },
        children: [
            {
                name: 'item11',
                type: 'item11',
                data: {
                    icon: 'project-new-16x16',
                    label: 'item 1.1',
                    description: 'hu hu hu',
                    childExpanded: false,
                    properties: PROPERTIES_LIST_CONFIG_TEST_3
                },
                children: [
                    {
                        name: 'item1211',
                        type: 'item121',
                        data: {
                            icon: 'project-new-16x16',
                            label: 'item 1.2.1.1',
                            description: 'hic',
                            childExpanded: false,
                            properties: PROPERTIES_LIST_CONFIG_TEST_1
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
                            childExpanded: false,
                            properties: PROPERTIES_LIST_CONFIG_TEST_2
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
                    childExpanded: false,
                    properties: PROPERTIES_LIST_CONFIG_TEST_3
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
            childExpanded: false,
            properties: PROPERTIES_LIST_CONFIG_TEST_2
        }
    },
    {
        name: 'logplot1',
        type: 'logplot',
        data: {
            icon: 'project-new-16x16',
            label: 'Logplot',
            description: 'Logplot',
            childExpanded: false,
            properties: PROPERTIES_LIST_CONFIG_TEST_3
        }
    }
];


exports.TREE_CONFIG_TEST = EXPLORER_TREE_CONFIG;
exports.LIST_CONFIG_TEST = PROPERTIES_LIST_CONFIG_TEST_1;
