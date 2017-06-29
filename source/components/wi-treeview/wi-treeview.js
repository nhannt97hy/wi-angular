const componentName = 'wiTreeview';
const moduleName = 'wi-treeview';

function Controller($scope, wiComponentService) {
    let self = this;

    this.$onInit = function () {
        self.items = self.config;

        $scope.handlers = wiComponentService.getComponent('GLOBAL_HANDLERS');

        if (self.name) wiComponentService.putComponent(self.name, self);
    };

    this.onClick = function ($index) {
        self.config[$index].data.childExpanded = !self.config[$index].data.childExpanded;

        if (!self.config[$index].children || self.config[$index].children.length === 0) {
            let wiExplorerCtrl = wiComponentService.getComponent('WiExplorer');
            wiExplorerCtrl.itemActiveName = self.config[$index].name;

            wiComponentService.emit('update-properties', self.config[$index].data.properties);
        }
    };

    this.onDoubleClick = function ($index) {
        if (self.config[$index].data.handler) {
            self.config[$index].data.handler();
        } 
        else {
            let treeFunctions = wiComponentService.getComponent('TREE_FUNCTIONS');
            if (treeFunctions) {
                // get func from component service
                treeFunctions[self.config[$index].type]();
                //wiComponentService.treeFunctions[self.config[$index].type]();
            }
        }
    };

    this.getItemActiveName = function () {
        return wiComponentService.getComponent('WiExplorer').itemActiveName;
    };

    this.addItem = function (parentName, item) {
        let parentItem = getItemByName(parentName);

        if (parentItem) parentItem.children.push(item);
    };

    function getItemByName(name) {
        let itemSelect = null;

        for (let item of self.items) {
            if (item.name === name) {
                return item;
            }

            itemSelect = findChildItemByName(item, name);
            if (itemSelect) {
                return itemSelect;
            }
        }

        return itemSelect;
    }

    function findChildItemByName(item, name) {
        if (!item || !item.children) return;

        let childSelect = null;
        for (let child of item.children) {
            if (child.name === name) {
                return child;
            } else if (child.children.length !== 0) {
                childSelect = findChildItemByName(child, name);
                if (childSelect) {
                    return childSelect;
                }
            }
        }
        return childSelect;
    }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-treeview.html',
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        name: '@',
        config: '<'
    }
});

exports.name = moduleName;
