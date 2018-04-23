const componentName = 'wiZoneTemplateManager';
const moduleName = 'wi-zone-template-manager';

function Controller($scope, wiComponentService, wiApiService, ModalService, $timeout) {
    let self = this;
    this.$onInit = function () {
        console.log('wi zone template manager: ', this);
    }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-zone-template-manager.html',
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        options: '<',
        configs: '<'
    }
});

exports.name = moduleName;
