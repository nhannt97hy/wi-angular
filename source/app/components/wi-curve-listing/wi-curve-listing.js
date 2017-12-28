const componentName = 'wiCurveListing';
const moduleName = 'wi-curve-listing';

function Controller($scope, wiComponentService, wiApiService, ModalService, $timeout) {
    let self = this;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);

    this.$onInit = function () {
        wiComponentService.putComponent('wiCurveListing');
    };
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-curve-listing.html',
    controller: Controller,
    controllerAs: componentName,
    transclude: true
    // bindings: {
    //     name: '@'
    // }
});

exports.name = moduleName;
