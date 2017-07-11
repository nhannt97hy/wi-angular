const wiServiceName = 'WiTreeConfig';
const moduleName = 'wi-tree-config-model';

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
                    unit: '',
                    childExpanded: false,
                    properties: {}
                },
                children: [
                    {
                        name: 'rawdata',
                        type: 'rawdata',
                        data: {
                            icon: 'project-new-16x16',
                            label: 'Raw data',
                            unit: '',
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
                            unit: '',
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
                            unit: '',
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
                            unit: '',
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
                            unit: '',
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