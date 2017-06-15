const componentName = 'wiLogplot';
const moduleName = 'wi-logplot';

function Controller() {
    var self = this;

}

var app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-logplot.html',
    controller: Controller,
    controllerAs: componentName,
    transclude: true
});

exports.name = moduleName;
