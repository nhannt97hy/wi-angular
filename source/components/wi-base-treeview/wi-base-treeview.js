const componentName = 'wiBaseTreeview';
const moduleName = 'wi-base-treeview';

function WiBaseTreeController(wiComponentService) {
    let self = this;

    this.$onInit = function () {
        wiComponentService.putComponent(self.name, self);
    };

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

    this.onClick = function ($index, $event) {
        this.onClickFunction && this.onClickFunction($index, $event);
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
        isShowParentName: '<'
    }
});
exports.controller = WiBaseTreeController;
exports.name = moduleName;
