const componentName = 'wiBaseTreeview';
const moduleName = 'wi-base-treeview';

function WiBaseTreeController(wiComponentService, $scope) {
    let self = this;
    function filterLabel (input) {
        return input.data.label + "    " + (input.data.tooltip || '');
    }
    function filterType (input){
        if(!self.filterBy || !input.type) return true;
        return self.filterBy.includes(input.type)
    }
    this.$onInit = function () {
        if (self.name && self.name.length) {
            wiComponentService.putComponent(self.name, self);
            let watch = [() => this.filter, () => this.filterBy];
            $scope.$watchGroup(watch, (val) => {
                self.filterFn();
            })
        }
    };

    function filterF(input){
        let strCp = self.filter || '';
        let options = new Array();
        utils.visit(input, function(_node, _options){
            if(_node && filterLabel(_node).toLowerCase().includes(strCp.toLowerCase()) && filterType(_node)){
                _node.data.hide = false;
                _options.push(_node);
            }else _node.data.hide = true;
            return false;
        }, options)
        options.forEach(item => {
            let Xpath = [];
            utils.visit(input, function(_node, _opt){
                if(_node.id == item.id && _node.type == item.type) {
                    Xpath = _opt.path.slice();
                    return true
                }
                return false;
            }, {
                path: []
            })
            Xpath.forEach(c => c.data.hide = false)
        })
    }
    this.filterFn = function () {
        if(this.config && this.config.length){
            this.config.forEach((c, i) => {
                filterF(c);
            })
        }
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
        filterBy: '@',
        onSelectFunction: '<',
        showId: '<'
    }
});
exports.controller = WiBaseTreeController;
exports.name = moduleName;
