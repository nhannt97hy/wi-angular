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
        } else if (self.config[$index].children && self.config[$index].length !== 0) {
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
        if (parentItem) {
            parentItem.children.unshift(item);
        }
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
    };
    this.collapse = function ($index) {
        self.config[$index].data.childExpanded = false;
    };

    this.expandAll = function () {
        for (let config of self.config) {
            config.data.childExpanded = true;
        }
    }

    this.collapseAll = function () {
        for (let config of self.config) {
            config.data.childExpanded = false;
        }
    }

    const menuArray = [
        {
            name: "Expand",
            label: "Expand",
            icon: "expand-16x16",
            handler: function () {
                self.expand($index);
            }
        }, {
            name: "Collapse",
            label: "Collapse",
            icon: "collapse-16x16",
            handler: function () {
                self.collapse($index);
            }
        }, {
            name: "ExpandAll",
            label: "Expand All",
            icon: "expand-all-16x16",
            handler: function () {
                self.expandAll();
            }
        }, {
            name: "CollapseAll",
            label: "Collapse All",
            icon: "collapse-all-16x16",
            handler: function () {
                self.collapseAll();
            }
        }
    ]

    self.menuArray = [];

    this.contextMenu = function (event, $index) {
        console.log('$index', $index);
        console.log('self.config', self.config);
        let configType = self.config[$index].type;
        console.log('configType',configType);
        switch (configType) {
            case 'well':
                var appendMenuArray = [
                    {
                        name: "CreateNewWell",
                        label: "Create New Well",
                        icon: "well-new-16x16",
                        handler: function () {
                        }
                    }, {
                        name: "ImportASCII",
                        label: "Import ASCII",
                        icon: "ascii-import-16x16",
                        handler: function () {
                        }
                    }, {
                        name: "ImportMultiASCII",
                        label: "Import Multi ASCII",
                        icon: "ascii-import-16x16",
                        handler: function () {
                        }
                    }, {
                        name: "ImportLAS",
                        label: "Import LAS",
                        icon: "las-import-16x16",
                        handler: function () {
                        }
                    }, {
                        name: "ImportMultiLAS",
                        label: "Import Multi LAS",
                        icon: "las-import-16x16",
                        handler: function () {
                        }
                    }, {
                        name: "ImportDLIS",
                        label: "Import DLIS",
                        icon: "",
                        handler: function () {
                        }
                    }, {
                        name: "IntervalCoreLoader",
                        label: "Interval/Core Loader",
                        icon: "load-16x16",
                        handler: function () {
                        }
                    }, {
                        name: "MultiwellCoreLoader",
                        label: "Multi-well Core Loader",
                        icon: "load-16x16",
                        handler: function () {
                        }
                    }, {
                        name: "ImportWellHeader",
                        label: "Import Well Header",
                        icon: "las-import-16x16",
                        handler: function () {
                        }
                    }, {
                        name: "ImportWellTop",
                        label: "Import Well Top",
                        icon: "las-import-16x16",
                        handler: function () {
                        }
                    }, {
                        name: "NewDataset",
                        label: "New Dataset",
                        icon: "dataset-new-16x16",
                        handler: function () {
                        }
                    }, {
                        name: "ZoneManager",
                        label: "Zone Manager",
                        icon: "zone-management-16x16",
                        handler: function () {
                        }
                    }, {
                        name: "Rename",
                        label: "Rename",
                        icon: "annotation-16x16",
                        handler: function () {
                        }
                    }, {
                        name: "Delete",
                        label: "Delete",
                        icon: "delete-16x16",
                        handler: function () {
                        }
                    }, {
                        name: "Group",
                        label: "Group",
                        icon: "",
                        handler: function () {
                        }
                    }, {
                        separator: '1'
                    }
                ];
                self.menuArray = appendMenuArray.concat(menuArray);
                break;
            case 'data':
                var appendMenuArray = [
                    {
                        name: "Rename",
                        label: "Rename",
                        icon: "annotation-16x16",
                        handler: function () {
                        }
                    }, {
                        name: "Delete",
                        label: "Delete",
                        icon: "delete-16x16"
                    }, {
                        separator: '1'
                    }
                ];
                self.menuArray = appendMenuArray.concat(menuArray);
                break;
            case 'intepretationmodel':
                var appendMenuArray = [
                    {
                        name: "NewInterpretationModel",
                        label: "New Interpretation Model",
                        icon: "workflow-16x16",
                        handler: function () {
                        }
                    }, {
                        separator: '1'
                    }
                ];
                self.menuArray = appendMenuArray.concat(menuArray);
                break;
            case 'userdefined': 
                var appendMenuArray = [
                    {
                        name: "NewZoneSet",
                        label: "New Zone Set",
                        icon: "",
                        handler: function () {
                        }
                    }, {
                        name: "ZoneManager",
                        label: "Zone Manager",
                        icon: "zone-management-16x16"
                    }, {
                        separator: '1'
                    }
                ];
                self.menuArray = appendMenuArray.concat(menuArray);
                break;
            case 'logplot':
                var appendMenuArray = [
                    {
                        name: "NewLogPlot",
                        label: "New LogPlot",
                        icon: "logplot-new-16x16",
                        handler: function () {
                        }
                    }, {
                        separator: '1'
                    }
                ];
                self.menuArray = appendMenuArray.concat(menuArray);
                break;
            case 'crossplot':
                var appendMenuArray = [
                    {
                        name: "NewCrossPlot",
                        label: "New CrossPlot",
                        icon: "crossplot-new-16x16",
                        handler: function () {
                        }
                    }, {
                        separator: '1'
                    }
                ];
                self.menuArray = appendMenuArray.concat(menuArray);
                break;
            case 'crossplot':
                var appendMenuArray = [
                    {
                        name: "NewHistogram",
                        label: "New Histogram",
                        icon: "histogram-new-16x16",
                        handler: function () {
                        }
                    }, {
                        separator: '1'
                    }
                ];
                self.menuArray = appendMenuArray.concat(menuArray);
                break;
            default:
                self.menuArray = menuArray;
                break;
        }
        console.log('self.menuArray',self.menuArray);
        wiComponentService.getComponent('ContextMenu').open(event.clientX, event.clientY, self.menuArray);
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
