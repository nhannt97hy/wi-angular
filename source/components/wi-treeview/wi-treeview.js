const componentName = 'wiTreeview';
const moduleName = 'wi-treeview';

function Controller() {
    var self = this;
}
var app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-treeview.html',
    controller: Controller,
    controllerAs: componentName
});

exports.name=moduleName;
