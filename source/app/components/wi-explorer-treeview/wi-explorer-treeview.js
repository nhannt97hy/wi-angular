const componentName = "wiExplorerTreeview";
const moduleName = "wi-explorer-treeview";
const wiBaseTreeview = require("./wi-base-treeview");

function WiExpTreeController(
    $controller,
    wiComponentService,
    wiApiService,
    $timeout,
    $scope
) {
    let self = this;

    this.$onInit = function() {
        window.__WIEXPTREE = self;
    };

    this.onReady = function() {
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let typeItemDragable = "curve";
        let curveElement = $("wi-base-treeview#"+ self.name +" .wi-parent-node" + `[type='${typeItemDragable}']`);
        utils.setupCurveDraggable(curveElement, wiComponentService, wiApiService);

        // add draggable for zoneset
        typeItemDragable = "zoneset";
        let zonesetElement = $("wi-base-treeview#"+ self.name +" .wi-parent-node" + `[type='${typeItemDragable}']`);
        utils.setupZonesetDraggable(zonesetElement, wiComponentService, wiApiService);
        // dataset droppable
        const dragMan = wiComponentService.getComponent(wiComponentService.DRAG_MAN);
        $(`wi-base-treeview#${self.name} .wi-parent-node[type=dataset]`).droppable({
            accept: '.wi-parent-node[type=curve]',
            addClasses: false,
            tolerance: 'pointer',
            over: function (event, ui) {
                if (event.ctrlKey) {
                    ui.helper.css('cursor', 'copy');
                }
            },
            out: function (event, ui) {
                ui.helper.css('cursor', '');
            },
            drop: function (event, ui) {
                if (event.ctrlKey) {
                    // console.log('copying to', event, ui);
                    dragMan.idDataset = +$(event.target).attr('data');
                }
            },
            cursor: 'copy'
        })
    };

    this.onClick = function($index, $event) {
        if (!this.container && this.container.selectHandler) return;
        let node = this.config[$index];
        node.$index = $index;
        if (!node) {
            this.container.unselectAllNodes();
            return;
        }
        wiComponentService.emit("update-properties", node);
        let selectedNodes = wiComponentService.getComponent(
            wiComponentService.SELECTED_NODES
        );
        if (!Array.isArray(selectedNodes)) selectedNodes = [];
        if (!$event.shiftKey) {
            if (
                !$event.ctrlKey ||
                node.type != selectedNodes[0].type ||
                node.parent != selectedNodes[0].parent
            ) {
                if (
                    $event.type == "contextmenu" &&
                    selectedNodes.includes(node)
                )
                    return this.container.selectHandler(node);
                this.container.unselectAllNodes();
            }
            this.container.selectHandler(node);
        } else {
            // shift key
            if (selectedNodes.length) {
                if (selectedNodes.includes(node)) return;
                if (
                    node.type != selectedNodes[selectedNodes.length - 1].type ||
                    node.parent != selectedNodes[0].parent
                ) {
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
    };

    this.showContextMenu = function($event, $index) {
        console.log(this.config[$index]);
        let nodeType = this.config[$index].type;
        let container = this.container;
        let defaultContextMenu = container.getDefaultTreeviewCtxMenu(
            $index,
            this
        );
        let itemContextMenu = container.getItemTreeviewCtxMenu(nodeType, this);
        let contextMenu = itemContextMenu.concat(defaultContextMenu);
        wiComponentService
            .getComponent("ContextMenu")
            .open($event.clientX, $event.clientY, contextMenu);
    };
}

let app = angular.module(moduleName, [wiBaseTreeview.name]);
app.component(componentName, {
    templateUrl: "wi-explorer-treeview.html",
    controller: WiExpTreeController,
    controllerAs: componentName,
    bindings: {
        name: "@",
        config: "<",
        container: "<",
        filter: "@"
    }
});
exports.name = moduleName;
