var WORKING_TABS = [];

const TREE_CONFIG_TEST = [
    {
        data: {
            icon: 'project-new-16x16',
            label: 'Item 1',
            description: 'description 1',
            childExpanded: false,
            handler: function () {
                console.log('do nothing');
            }
        },
        children: [
            {
                data: {
                    icon: 'project-new-16x16',
                    label: 'Item 1.1',
                    description: '',
                    childExpanded: false,
                    handler: function () {
                        console.log('do nothing');
                    }
                },
                children: [
                    {
                        data: {
                            icon: 'project-new-16x16',
                            label: 'Item 1.2.1 (dogs)',
                            description: '',
                            childExpanded: false,
                            handler: function () {
                                WORKING_TABS.push({
                                    type: 'dogs',
                                    heading: 'Item 1.2.1 (dogs)',
                                    closable: 'true'
                                });
                            }
                        },
                        children: []
                    },
                    {
                        data: {
                            icon: 'project-new-16x16',
                            label: 'Item 1.2.2 (cars)',
                            description: '',
                            childExpanded: false,
                            handler: function () {
                                WORKING_TABS.push({
                                    type: 'cars',
                                    heading: 'Item 1.2.2 (cars)',
                                    closable: 'true'
                                });
                            }
                        },
                        children: []
                    }
                ]
            },
            {
                data: {
                    icon: 'project-new-16x16',
                    label: 'Item 1.2 (cars)',
                    description: '',
                    childExpanded: false,
                    handler: function () {
                        WORKING_TABS.push({
                            type: 'cars',
                            heading: 'Item 1.2 (cars)',
                            closable: 'true'
                        });
                    }
                },
                children: []
            }
        ]
    },
    {
        data: {
            icon: 'project-new-16x16',
            label: 'Item 2 (cars)',
            description: 'description 2',
            childExpanded: false,
            handler: function () {
                WORKING_TABS.push({
                    type: 'cars',
                    heading: 'Item 2 (cars)',
                    closable: 'true'
                });
            }
        }
    }
];

exports.TREE_CONFIG_TEST = TREE_CONFIG_TEST;
exports.WORKING_TABS = WORKING_TABS;