const wiServiceName = 'WiTreeConfig';
const moduleName = 'wi-tree-config';

let app = angular.module(moduleName, []);
app.factory(wiServiceName, function () {
    let DEFAULT_TREE_CONFIG = {
        config: [
            {
                name: 'wells',
                type: 'item11000',
                data: {
                    icon: 'wells-16x16',
                    label: 'Wells',
                    description: '',
                    childExpanded: false,
                    properties: {}
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
                            properties: {}
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
                                    properties: {}
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
                                    properties: {}
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
                            properties: {}
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
                            properties: {}
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
                            properties: {}
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
                            properties: {}
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
                            properties: {}
                        },
                        children: []
                    }
                ]
            }
        ]
    };

    function WiTreeConfig() {
        let self = this;
        self.config = {};

        angular.extend(self, angular.copy(DEFAULT_TREE_CONFIG));
    }

    return WiTreeConfig;
});

exports.name = moduleName;