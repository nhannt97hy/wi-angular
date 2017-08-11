const componentName = 'wiHistogram';
const moduleName = 'wi-histogram';

function Controller($scope, wiComponentService, wiApiService, ModalService, $timeout) {
    let self = this;
    this.$onInit = function () {
        if (self.name) wiComponentService.putComponent(self.name, self);
    };
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-histogram.html',
    controller: Controller,
    controllerAs: componentName,
    transclude: true,
    bindings: {
        name: '@',
        id: '@'
    }
});

exports.name = moduleName;
