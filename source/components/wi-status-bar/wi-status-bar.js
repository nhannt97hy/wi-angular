const componentName = 'wiStatusBar';
const moduleName = 'wi-status-bar';

function Controller() {
    let self = this;
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-status-bar.html',
    controller: Controller,
    controllerAs: componentName
});

exports.name = moduleName;
