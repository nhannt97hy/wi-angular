const componentName = 'wiStatusBar';
const moduleName = 'wi-status-bar';

function Controller() {
    var self = this;
}
var app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-status-bar.html',
    controller: Controller,
    controllerAs: componentName
});

exports.name = moduleName;
