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
                children: []
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