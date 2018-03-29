const componentName = 'wiTreeview';
const moduleName = 'wi-treeview';

function Controller(wiComponentService, wiApiService, WiProperty) {
    let self = this;
    if (!window.exTree) window.exTree = [];
    window.exTree.push(this);

    this.$onInit = function () {
        if (!self.onClick) self.onClick = function ($index, $event, node) {
            if (!this.container && !this.container.selectHandler) return;
            node.$index = $index;
            if (!node) {
                this.container.unselectAllNodes();
                return;
            }
            wiComponentService.emit('update-properties', node);
            let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
            if (!Array.isArray(selectedNodes)) selectedNodes = [];
            if (!$event.shiftKey) {
                if (selectedNodes.length) {
                    if (!$event.ctrlKey || node.type != selectedNodes[0].type || node.parent != selectedNodes[0].parent) {
                        this.container.unselectAllNodes();
                    }
                }
                self.selectedNode = node;
                this.container.selectHandler(node);
            } else {
                // shift key
                if (selectedNodes.length) {
                    if (selectedNodes.includes(node)) return;
                    if (node.type != selectedNodes[selectedNodes.length-1].type || node.parent != selectedNodes[0].parent) {
                        this.container.unselectAllNodes();
                        this.container.selectHandler(node);
                    } else {
                        if (node.$index < selectedNodes[0].$index) {
                            let fromIndex = node.$index;
                            let toIndex = selectedNodes[0].$index;
                            this.container.unselectAllNodes();
                            for (let i = fromIndex; i <= toIndex; i++) {
                                this.container.selectHandler(this.config[i], true);
                            }
                        } else {
                            let fromIndex = selectedNodes[0].$index;
                            let toIndex = node.$index;
                            this.container.unselectAllNodes();
                            for (let i = fromIndex; i <= toIndex; i++) {
                                this.container.selectHandler(this.config[i], true);
                            }
                        }
                    }
                }
            }
        }
    };

    this.onReady = function () {
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let typeItemDragable = 'curve';
        let element = $('.wi-parent-node' + `[type='${typeItemDragable}']`);
        utils.setupCurveDraggable(element, wiComponentService, wiApiService);
    };

    this.onCollapse = function ($index) {
        self.config[$index].data.childExpanded = !self.config[$index].data.childExpanded;
    };

    this.onDoubleClick = function ($index) {
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let selectedNode = self.config[$index];
        if (selectedNode.children && selectedNode.children.length) {
            selectedNode.data.childExpanded = !selectedNode.data.childExpanded;
            return;
        }
        if (selectedNode.handler) {
            selectedNode.handler();
        }
    }

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

    // this.updateWellItem = function (well) {
    //     let wellSelected = self.findWellById(well.idWell);

    //     let newWell = new WiWell(well);

    //     if (wellSelected) {
    //         angular.copy(newWell, wellSelected);
    //     } else {
    //         let wells = getItemByName('wells');

    //         if (wells) wells.children.unshift(newWell);
    //     }
    // };

    // this.updateWellsItem = function(wells) {
    //     for(let well of wells) {
    //         self.updateWellItem(well);
    //     }
    // };

    // this.updateLogplotItem = function (logplot) {
    //     let plotSelected = self.findWellById(logplot.idPlot);

    //     let newPlotItem = new WiLogplotModel();

    //     let newWell = new WiWell(well);

    //     if (wellSelected) {
    //         angular.copy(newWell, wellSelected);
    //     } else {
    //         let wells = getItemByName('wells');

    //         if (wells) wells.children.unshift(newWell);
    //     }
    // };

    // item has id to identify
    this.updateChildItem = function (parentItemName, item) {

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
        console.log('node', self.config[$index]);
        let container = self.container;
        let defaultContextMenu = [], itemContextMenu = [];
        if (container.getDefaultTreeviewCtxMenu) {
            defaultContextMenu = container.getDefaultTreeviewCtxMenu($index, self);
        }
        if (container.getItemTreeviewCtxMenu) {
            let nodeType = self.config[$index].type;
            itemContextMenu = container.getItemTreeviewCtxMenu(nodeType, self);
        }
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
        isRoot: '<',
        name: '<',
        contextmenuholder: '<',
        config: '<',
        container: '<',
        isShowParentName: '<',
        onClick:'<',
        selectedNode: '='
    }
});

exports.name = moduleName;
