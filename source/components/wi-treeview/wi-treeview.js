const componentName = 'wiTreeview';
const moduleName = 'wi-treeview';

function Controller(wiComponentService, WiProperty, WiWell) {
    let self = this;

    this.$onInit = function () {
        // self.items = self.config;
        if (self.name) {
            wiComponentService.putComponent(self.name, self);

            wiComponentService.on(wiComponentService.UPDATE_WELL_EVENT, function (well) {
                self.updateWellItem(well);
            });
        }
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
        } else if (self.config[$index].children && self.config[$index].children.length !== 0) {
            self.onCollapse($index);
        } else {
            let treeFunctions = wiComponentService.getComponent(wiComponentService.TREE_FUNCTIONS);
            if (treeFunctions) {
                // get func from component service
                if (self.config && self.config[$index] && self.config[$index].type
                    && treeFunctions[self.config[$index].type]) {
                    treeFunctions[self.config[$index].type]();
                }
                else {
                    console.log(treeFunctions, self.config, self.config[$index]);
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
        if (parentItem) {
            parentItem.children.unshift(item);
        }
    };

    this.updateWellItem = function (well) {
        let wellSelected = self.findWellById(well.idWell);

        let newWell = new WiWell(well);

        if (wellSelected) {
            angular.copy(newWell, wellSelected);

            console.log('wellSelected', wellSelected);
        } else {
            let wells = getItemByName('wells');

            if (wells) wells.children.unshift(newWell);
        }
    };

    this.findWellById = function (idWell) {
        let wells = getItemByName('wells');
        let wellName = idWell + 'well';

        if (!wells) return null;

        for (let itemTree of wells.children) {
            if (itemTree.type === 'well' && itemTree.name === wellName) {
                return itemTree;
            }
        }

        return null;
    };

    function getItemByName(name) {
        let itemSelect = null;
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

    this.expand = function ($index) {
        self.config[$index].data.childExpanded = true;
        for (let child of self.config[$index].children) {
            child.data.childExpanded = true;
        }
    };
    this.collapse = function ($index) {
        self.config[$index].data.childExpanded = false;
        for (let child of self.config[$index].children) {
            child.data.childExpanded = false;
        }
    };

    this.expandAll = function (rootConfig) {
        for (let config of rootConfig) {
            config.data.childExpanded = true;
            expandAll(config.children);
        }
    };

    function expandAll(children) {
        if (!children) {
            return;
        }
        for (let child of children) {
            child.data.childExpanded = true;
            expandAll(child.children);
        }
    }

    this.collapseAll = function (rootConfig) {
        for (let config of rootConfig) {
            config.data.childExpanded = false;
            collapseAll(config.children);
        }
    };

    function collapseAll(children) {
        if (!children) {
            return;
        }
        for (let child of children) {
            child.data.childExpanded = false;
            collapseAll(child.children);
        }
    }

    this.showContextMenu = function ($event, $index) {
        console.log('self.name', self.name);
        console.log('$index', $index);
        console.log('self.config', self.config);
        let configType = self.config[$index].type;
        let contextMenuHolderCtrl = wiComponentService.getComponent(self.contextmenuholder);
        let defaultContextMenu = contextMenuHolderCtrl.getDefaultTreeviewCtxMenu($index, self);
        let itemContextMenu = contextMenuHolderCtrl.getItemTreeviewCtxMenu(configType, self);
        let contextMenu = itemContextMenu.concat(defaultContextMenu);
        wiComponentService.getComponent('ContextMenu').open($event.clientX, $event.clientY, contextMenu);
    }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-treeview.html',
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        name: '@',
        config: '<',
        contextmenuholder: '@'
    }
});

exports.name = moduleName;
