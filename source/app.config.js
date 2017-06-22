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
                    description: 'des 1',
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
                            description: 'des 1.2',
                            childExpanded: false,
                            handler: function () {
                                WORKING_TABS.push({
                                    type: 'dogs',
                                    heading: 'Item 1.2.1 (dogs)',
                                    closable: 'true',
                                    active: false
                                });
                            }
                        },
                        children: []
                    },
                    {
                        data: {
                            icon: 'project-new-16x16',
                            label: 'Item 1.2.2 (cars)',
                            description: 'cars',
                            childExpanded: false,
                            handler: function () {
                                WORKING_TABS.push({
                                    type: 'cars',
                                    heading: 'Item 1.2.2 (cars)',
                                    closable: 'true',
                                    active: false
                                });
                            }
                        },
                        children: []
                    },
                    {
                        data: {
                            icon: 'project-new-16x16',
                            label: 'Logplot',
                            description: 'logplot',
                            childExpanded: false,
                            handler: function () {
                                WORKING_TABS.push({
                                    type: 'logplot',
                                    name: 'MyLogplot' + Date.now(),
                                    heading: 'blank logplot',
                                    closable: 'true',
                                    active: false
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
                    description: 'cars',
                    childExpanded: false,
                    handler: function () {
                        WORKING_TABS.push({
                            type: 'cars',
                            heading: 'Item 1.2 (cars)',
                            closable: 'true',
                            active: false
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
            description: 'car',
            childExpanded: false,
            handler: function () {
                WORKING_TABS.push({
                    type: 'cars',
                    heading: 'Item 2 (cars)',
                    closable: 'true',
                    active: false
                });
            }
        }
    }
];

exports.TREE_CONFIG_TEST = TREE_CONFIG_TEST;
exports.WORKING_TABS = WORKING_TABS;