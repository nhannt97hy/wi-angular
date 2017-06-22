const componentName = 'wiLogplot';
const moduleName = 'wi-logplot';

function Controller(wiComponentService) {
    var self = this;

    this.$onInit = function () {
        self.slidingbarName = self.name + 'Slidingbar';
    };

    this.getSlidingbar = function () {
        self.slidingBar = wiComponentService.getComponent(self.slidingbarName);
    }
}

var app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-logplot.html',
    controller: Controller,
    controllerAs: componentName,
    transclude: true,
    bindings: {
        name: '@'
    }
});

exports.name = moduleName;