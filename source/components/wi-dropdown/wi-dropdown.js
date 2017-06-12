const componentName = 'wiDropdown';
const moduleName = 'wi-dropdown';

function Controller() {
    var self = this;

}
var app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-dropdown.html',
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        config: '<',
        label: '@',
        layout: '@',
        imgurl: '@',
        handlers: '<'
    }
});

exports.name = moduleName;
