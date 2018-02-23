const componentName = 'wiBaseTreeview';
const moduleName = 'wi-base-treeview';

function WiBaseTreeController(wiComponentService, $scope) {
    let self = this;

    this.$onInit = function () {
        if (self.name && self.name.length) wiComponentService.putComponent(self.name, self);
        /*
        $scope.$watch(() => this.filter,(value) => {
            if(value != undefined){
                if(this.config && this.config.length){
                    this.config.forEach((c, i) => {
                        let parent = new Array();
                        filterF(c, value, parent);
                    })
                }
            }
        });
        */
        $scope.$watch(function() { return this.filter},function(value) {
            if(value != undefined){
                if(this.config && this.config.length){
                    this.config.forEach((c) => {
                        let parent = new Array();
                        filterF(c, value, parent);
                    })
                }
            }
        });
    };

    function filterF(input, strCp, parent, lastChild){
        parent.unshift(input);
        input.data.hide = true;
        if(input && (input.data.label).toLowerCase().includes(strCp.toLowerCase())){
            if(parent && parent.length){
                parent.forEach(p => {
                    // p.data.childExpanded = true; // TUNG
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
                filterF(child, strCp, parent, i == input.children.length - 1)
                }
            )
        }
    }


    this.onCollapse = function ($index) {
        if (this.config[$index].children) {
            this.config[$index].data.childExpanded = !this.config[$index].data.childExpanded;
        }
    };

    this.addItem = function (parentName, item) {
        let parentItem = this.getItemByName(parentName);

        if (parentItem) parentItem.children.push(item);
    };

    this.addItemToFirst = function (parentName, item) {
        console.log('addItemToFirst self', self);
        let parentItem = this.getItemByName(parentName);
        if (parentItem) {
            parentItem.children.unshift(item);
        }
    };

    this.expand = function ($index) {
        this.config[$index].data.childExpanded = true;
        for (let child of this.config[$index].children) {
            child.data.childExpanded = true;
        }
    };

    this.collapse = function ($index) {
        this.config[$index].data.childExpanded = false;
        for (let child of this.config[$index].children) {
            child.data.childExpanded = false;
        }
    };

    this.expandAll = expandAll;

    function expandAll(children) {
        if (!children) {
            return;
        }
        for (let child of children) {
            child.data.childExpanded = true;
            expandAll(child.children);
        }
    }

    this.collapseAll = collapseAll;

    function collapseAll(children) {
        if (!children) {
            return;
        }
        for (let child of children) {
            child.data.childExpanded = false;
            collapseAll(child.children);
        }
    }

    this.onClick = function ($index, $event, node) {
        self.onSelectFunction && self.onSelectFunction(node);
        self.onClickFunction && self.onClickFunction($index, $event, node);
    }

    this.onDoubleClick = function ($index) {
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let selectedNode = this.config[$index];
        if (selectedNode.children && selectedNode.children.length) {
            selectedNode.data.childExpanded = !selectedNode.data.childExpanded;
            return;
        }
        if (selectedNode.handler) {
            selectedNode.handler();
        }
        this.onDoubleClickFunction && this.onDoubleClickFunction();
    }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-base-treeview.html',
    controller: WiBaseTreeController,
    controllerAs: componentName,
    bindings: {
        name: '@',
        container: '<',
        config: '<',
        onReadyFunction: '<',
        onClickFunction: '<',
        onDoubleClickFunction: '<',
        showContextMenuFunction: '<',
        isShowParentName: '<',
        filter: '@',
        onSelectFunction: '<',
        showId: '<'
    }
});
exports.controller = WiBaseTreeController;
exports.name = moduleName;
