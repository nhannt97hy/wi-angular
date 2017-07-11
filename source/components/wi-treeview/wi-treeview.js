const componentName = 'wiTreeview';
const moduleName = 'wi-treeview';

function Controller(wiComponentService, WiProperty) {
    let self = this;

    this.$onInit = function () {
        // self.items = self.config;

        if (self.name) wiComponentService.putComponent(self.name, self);
    };

    this.onCollapse = function ($index) {
        self.config[$index].data.childExpanded = !self.config[$index].data.childExpanded;
    };

    this.onClick = function ($index) {
        wiComponentService.setState(wiComponentService.ITEM_ACTIVE_STATE, self.config[$index].name);

        if (self.config[$index].data.properties) {
            wiComponentService.emit('update-properties', self.config[$index].data.properties.listConfig);

            console.log('properties', self.config[$index].data.properties.listConfig);
        }
    };

    this.onDoubleClick = function ($index) {
        if (self.config[$index].data.handler) {
            self.config[$index].data.handler();
        } else if (self.config[$index].children && self.config[$index].length !== 0){
            self.onCollapse($index);
        } else {
            let treeFunctions = wiComponentService.getComponent('TREE_FUNCTIONS');
            if (treeFunctions) {
                // get func from component service
                if (self.config && self.config[$index] && self.config[$index].type
                    && treeFunctions[self.config[$index].type]) {
                    treeFunctions[self.config[$index].type]();
                }
                else {
                    console.error(treeFunctions, self.config, self.config[$index]);
                }
            }
        }
    };

    this.getItemActiveName = function () {
        return wiComponentService.getState(wiComponentService.ITEM_ACTIVE_STATE);
    };

    this.addItem = function (parentName, item) {
        let parentItem = getItemByName(parentName);

        if (parentItem) parentItem.children.push(item);
    };

    this.addItemToFirst = function (parentName, item) {
        let parentItem = getItemByName(parentName);
        console.log('parentItem:', parentName, parentItem);
        if (parentItem) {
            console.log('++++++++', item);
            parentItem.children.unshift(item);
        }
    };

    function getItemByName(name) {
        let itemSelect = null;
        console.log(self.config);
        for (let item of self.config) {
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
