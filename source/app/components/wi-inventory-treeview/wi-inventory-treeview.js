const componentName = 'wiInventoryTreeview';
const moduleName = 'wi-inventory-treeview';
const wiBaseTreeview = require('./wi-base-treeview');

function Controller($controller, wiComponentService) {
    let self = this;

    self.$onInit = function () {
        wiComponentService.putComponent(self.name, self);
    };

    function unselectAllNodes () {
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        self.config.forEach(function(item) {
            utils.visit(item, function(node) {
                if(node.data) node.data.selected = false;
            });
        });
    }

    this.onClick = function ($index, $event) {
        let node = this.config[$index];
        unselectAllNodes();
        if (node.data) node.data.selected = true;
        self.selectedNode = node;
        setTimeout(() => {
            this.container.onConfigClick && this.container.onConfigClick();
        });
    }
}

Controller.prototype = new wiBaseTreeview.controller();

let app = angular.module(moduleName, [wiBaseTreeview.name]);
app.component(componentName, {
    templateUrl: 'wi-inventory-treeview.html',
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        name: '@',
        config: '<',
        baseTreeviewName: '<',
        container: '<',
        selectedNode: '='
    }
});
exports.name = moduleName;
