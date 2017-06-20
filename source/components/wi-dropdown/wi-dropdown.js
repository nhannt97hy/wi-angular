const componentName = 'wiDropdown';
const moduleName = 'wi-dropdown';

function Controller() {
    var self = this;

    this.default = {
        label: 'Dropdown',
        layout: 'icon-top',
        icon: 'project-new-32x32'
    };

    this.onClick = function () {
        if (self.handler) self.handler();
    };
}
var app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-dropdown.html',
    controller: Controller,
    controllerAs: componentName,
    transclude: true,
    bindings: {
        config: '<',
        label: '@',
        layout: '@',
        icon: '@',
        handler: '<'
    }
});

exports.name = moduleName;
