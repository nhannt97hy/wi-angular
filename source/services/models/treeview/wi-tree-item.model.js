const wiServiceName = 'WiTreeItem';
const moduleName = 'wi-tree-item-model';

let app = angular.module(moduleName, []);
app.factory(wiServiceName, function () {
    const DEFAULT_TREE_ITEM = {
        name: '',
        type: '',
        data: {
            icon: 'project-new-16x16',
            label: '',
            description: '',
            childExpanded: false,
            properties: {}
        },
        children: []
    };

    function WiTreeItem() {
        let self = this;

        angular.extend(self, DEFAULT_TREE_ITEM);
    }

    return WiTreeItem;
});

exports.name = moduleName;