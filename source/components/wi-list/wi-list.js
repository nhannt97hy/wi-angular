const componentName = 'wiList';
const moduleName = 'wi-list';

function Controller() {
    var self = this;
}

var app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-list.html',
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        heading: '@',
        items: '<'
    }
});

exports.name = moduleName;
