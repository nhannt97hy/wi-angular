'use strict';

//Utils for object checking and object cloning
function objcpy(destObj, sourceObj) {
    if (destObj) {
        for (let attr in sourceObj) {
            destObj[attr] = sourceObj[attr];
        }
    }
}

function isEqual(a, b) {
    if (!a || !b) return false;
    let aProps = Object.getOwnPropertyNames(a);
    let bProps = Object.getOwnPropertyNames(b);

    if (aProps.length !== bProps.length) {
        return false;
    }

    for (let i = 0; i < aProps.length; i++) {
        let propName = aProps[i];

        if (a[propName] !== b[propName]) {
            return false;
        }
    }

    return true;
}

function bindFunctions(destHandlers, sourceHandlers, thisObj) {
    for (let handler in sourceHandlers) {
        destHandlers[handler] = sourceHandlers[handler].bind(thisObj);
    }
}
// APP Utils
function projectOpen(wiComponentService, projectData, $timeout) {
    console.log(projectData);

    // perform REST API call to load project using data
    $timeout(function () {
        let mockTreeData = TREE_CONFIG_TEST_3;
        wiComponentService.emit('project-loaded-event', mockTreeData);
    }, 2000);

}

function projectClose(wiComponentService) {
    wiComponentService.emit('project-unloaded-event');
}
exports.objcpy = objcpy;
exports.isEqual = isEqual;
exports.bindFunctions = bindFunctions;
exports.projectOpen = projectOpen;
exports.projectClose = projectClose;

/**
 MOCK TEST
 */
var PROPERTIES_LIST_CONFIG_TEST_1 = [
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
var PROPERTIES_LIST_CONFIG_TEST_2 = [
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
var PROPERTIES_LIST_CONFIG_TEST_3 = [
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
var TREE_CONFIG_TEST_3 = [
    {
        name: 'wells',
        type: 'item11000',
        data: {
            icon: 'wells-16x16',
            label: 'Wells',
            description: '',
            childExpanded: false,
            properties: PROPERTIES_LIST_CONFIG_TEST_2
        },
        children: [
            {
                name: 'bachho',
                type: 'item11',
                data: {
                    icon: 'well-16x16',
                    label: 'Bach Ho',
                    description: '',
                    childExpanded: false,
                    properties: PROPERTIES_LIST_CONFIG_TEST_3
                },
                children: [
                    {
                        name: 'Data',
                        type: 'item121',
                        data: {
                            icon: 'curve-data-16x16',
                            label: 'item 1.2.1.1',
                            description: 'hic',
                            childExpanded: false,
                            properties: PROPERTIES_LIST_CONFIG_TEST_1
                        },
                        children: [
                            {
                                name: 'depth',
                                type: 'depth',
                                data: {
                                    icon: 'depth-blank-16x16',
                                    label: 'depth',
                                    description: 'M'
                                }
                            }
                        ]
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
    }
];
/*var TREE_CONFIG_TEST_3 = [
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
*/

