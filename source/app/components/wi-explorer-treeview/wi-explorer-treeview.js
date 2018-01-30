const componentName = 'wiExplorerTreeview';
const moduleName = 'wi-explorer-treeview';
const wiBaseTreeview = require('./wi-base-treeview');

function WiExpTreeController($controller, wiComponentService, wiApiService, $timeout, $scope) {

    let self = this;

    this.$onInit = function () {
        window.__WIEXPTREE = self;
    };

    function filterF(input, strCp, parent, lastChild){
        parent.unshift(input);
        input.data.hide = true;
        if((input.data.label).toLowerCase().includes(strCp.toLowerCase())){
            if(parent && parent.length){
                parent.forEach(p => {
                    p.data.childExpanded = true;
                    p.data.hide = false;
                })
            }
        }else{
            if(!input.children || !input.children.length){
                parent.shift();
                if(lastChild){
                    parent.shift();
                }
            }
        }
        if(input.children && input.children.length){
            input.children.forEach((child, i) => {
                filterF(child,strCp,parent, i == input.children.length - 1)
                }
            )
        }
    }

    $scope.$watch(() => this.filterBy,(value) => {
        if(this.config && this.config.length){
            this.config.forEach((c, i) => {
                let parent = new Array()
                    filterF(c, value, parent);
                    }
                )
            }
        }
    )

    this.onReady = function () {
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let typeItemDragable = 'curve';
        let element = $('.wi-parent-node' + `[type='${typeItemDragable}']`);
        utils.setupCurveDraggable(element, wiComponentService, wiApiService);
    };

    this.onClick = function ($index, $event) {
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
                    if ($event.type == 'contextmenu' && selectedNodes.includes(node)) return this.container.selectHandler(node);
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

    this.showContextMenu = function ($event, $index) {
        console.log(this.config[$index]);
        let nodeType = this.config[$index].type;
        let container = this.container;
        let defaultContextMenu = container.getDefaultTreeviewCtxMenu($index, this);
        let itemContextMenu = container.getItemTreeviewCtxMenu(nodeType,this);
        let contextMenu = itemContextMenu.concat(defaultContextMenu);
        wiComponentService.getComponent('ContextMenu').open($event.clientX, $event.clientY, contextMenu);
    }

}

let app = angular.module(moduleName, [wiBaseTreeview.name]);
app.component(componentName, {
    templateUrl: 'wi-explorer-treeview.html',
    controller: WiExpTreeController,
    controllerAs: componentName,
    bindings: {
        name: '@',
        config: '<',
        container: '<',
        filterBy: '@'
    }
});
exports.name = moduleName;
