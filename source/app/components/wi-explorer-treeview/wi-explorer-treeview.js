const componentName = 'wiExplorerTreeview';
const moduleName = 'wi-explorer-treeview';
const wiBaseTreeview = require('./wi-base-treeview');

function WiExpTreeController($controller, wiComponentService) {

    let self = this;

    this.$onInit = function () {
        // self = angular.extend(self, $controller(wiBaseTreeview.controller,{}));
        // wiComponentService.putComponent(self.name, self);
        // console.log('wiExplorerTreeview onInit self', self);
        // window.__WIEXPTREE = self;

        if (self.isRoot) {
            wiComponentService.putComponent(self.name, self);
            wiComponentService.on(wiComponentService.UPDATE_WELL_EVENT, function (well) {
                self.updateWellItem(well);
            });
            wiComponentService.on(wiComponentService.UPDATE_MULTI_WELLS_EVENT, function (wells) {
                self.updateWellsItem(wells);
            });
            wiComponentService.on(wiComponentService.UPDATE_LOGPLOT_EVENT, function (logplot) {
                self.updateLogplotItem(logplot);
            });
        }
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
                                this.container.selectHandler(this.config[i]);
                            }
                        } else {
                            let fromIndex = selectedNodes[0].$index;
                            let toIndex = node.$index;
                            this.container.unselectAllNodes();
                            for (let i = fromIndex; i <= toIndex; i++) {
                                this.container.selectHandler(this.config[i]);
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

    this.onClick = function ($index, $event) {
        console.log('wi-explorer-treeview onclick $index', $index);
        if (!this.container && this.container.selectHandler) return;
        let node = this.config[$index];
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
                            this.container.selectHandler(this.config[i]);
                        }
                    } else {
                        let fromIndex = selectedNodes[0].$index;
                        let toIndex = node.$index;
                        this.container.unselectAllNodes();
                        for (let i = fromIndex; i <= toIndex; i++) {
                            this.container.selectHandler(this.config[i]);
                        }
                    }
                }
            }
        }
    }

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

    this.showContextMenu = function ($event, $index) {
        let nodeType = this.config[$index].type;
        let contextMenuHolderCtrl = wiComponentService.getComponent(this.contextmenuholder);
        let defaultContextMenu = contextMenuHolderCtrl.getDefaultTreeviewCtxMenu($index, this);
        let itemContextMenu = contextMenuHolderCtrl.getItemTreeviewCtxMenu(nodeType,this);
        let contextMenu = itemContextMenu.concat(defaultContextMenu);
        wiComponentService.getComponent('ContextMenu').open($event.clientX, $event.clientY, contextMenu);
    }
}

WiExpTreeController.prototype = new wiBaseTreeview.controller();

let app = angular.module(moduleName, [wiBaseTreeview.name]);
app.component(componentName, {
    templateUrl: 'wi-explorer-treeview.html',
    controller: WiExpTreeController,
    controllerAs: componentName,
    bindings: {
        name: '@',
        config: '<',
        contextmenuholder: '@',
        baseTreeviewName: '<',
        container: '<'
    }
});
exports.name = moduleName;
