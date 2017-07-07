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
    wiComponentService.emit('project-loaded-event', TREE_CONFIG_TEST_3);

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
                        type: 'data',
                        data: {
                            icon: 'curve-data-16x16',
                            label: 'Data',
                            description: '',
                            childExpanded: false,
                            properties: PROPERTIES_LIST_CONFIG_TEST_1
                        },
                        children: [
                            {
                                name: 'depth',
                                type: 'depth',
                                data: {
                                    icon: 'depth-blank-16x16',
                                    label: 'Depth',
                                    description: 'M'
                                }
                            }
                        ]
                    },
                    {
                        name: 'data1',
                        type: 'data',
                        data: {
                            icon: 'curve-data-16x16',
                            label: 'Data2',
                            description: '',
                            childExpanded: false,
                            properties: PROPERTIES_LIST_CONFIG_TEST_1
                        },
                        children: [
                            {
                                name: 'depth1',
                                type: 'depth',
                                data: {
                                    icon: 'depth-blank-16x16',
                                    label: 'Depth',
                                    description: 'M'
                                }
                            }
                        ]
                    }
                ]
            },
            {
                name: 'rawdata',
                type: 'rawdata',
                data: {
                    icon: 'project-new-16x16',
                    label: 'Raw data',
                    description: '',
                    childExpanded: false,
                    properties: PROPERTIES_LIST_CONFIG_TEST_3
                },
                children: []
            },
            {
                name: 'intepretationmodel',
                type: 'intepretationmodel',
                data: {
                    icon: 'project-new-16x16',
                    label: 'Intepretation Model',
                    description: '',
                    childExpanded: false,
                    properties: PROPERTIES_LIST_CONFIG_TEST_3
                },
                children: []
            },
            {
                name: 'userdefined',
                type: 'userdefined',
                data: {
                    icon: 'user-define-16x16',
                    label: 'User Defined',
                    description: '',
                    childExpanded: false,
                    properties: PROPERTIES_LIST_CONFIG_TEST_3
                },
                children: []
            },
            {
                name: 'logplot',
                type: 'logplot',
                data: {
                    icon: 'logplot-blank-16x16',
                    label: 'Logplot',
                    description: '',
                    childExpanded: false,
                    properties: PROPERTIES_LIST_CONFIG_TEST_3
                },
                children: []
            },
            {
                name: 'crossplot',
                type: 'crossplot',
                data: {
                    icon: 'crossplot-blank-16x16',
                    label: 'CrossPlot',
                    description: '',
                    childExpanded: false,
                    properties: PROPERTIES_LIST_CONFIG_TEST_3
                },
                children: []
            }
        ]
    }
];

