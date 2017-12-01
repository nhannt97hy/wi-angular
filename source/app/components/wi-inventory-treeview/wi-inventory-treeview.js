const componentName = 'wiInventoryTreeview';
const moduleName = 'wi-inventory-treeview';
const wiBaseTreeview = require('./wi-base-treeview');

function Controller($controller, wiComponentService) {
    let self = this;

    self.$onInit = function () {
        wiComponentService.putComponent(self.name, self);
        console.log('wiInventoryTreeview onInit self.config', self.config);
    };

    this.onClick = function ($index, $event) {
        console.log('wi-inventory-treeview onclick $index', $index);
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
        contextmenuholder: '@',
        baseTreeviewName: '<',
        container: '<'
    }
});
exports.name = moduleName;
