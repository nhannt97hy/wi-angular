const componentName = 'wiList';
const moduleName = 'wi-list';

function Controller(wiComponentService) {
    var self = this;

    this.$onInit = function() {
        if (self.name) wiComponentService.putComponent(self.name, self);
    }
}

var app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-list.html',
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        name : '@',
        heading: '@',
        items: '<',
        handler: '<'
    }
});

exports.name = moduleName;
