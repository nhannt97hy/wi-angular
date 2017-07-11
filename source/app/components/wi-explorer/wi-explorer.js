const componentName = 'wiExplorer';
const moduleName = 'wi-explorer';

function Controller($scope, wiComponentService, WiWell, WiTreeConfig, $timeout) {
    let self = this;
    self.treeviewName = self.name + 'treeview';

    this.$onInit = function () {
        $scope.handlers = wiComponentService.getComponent('GLOBAL_HANDLERS');
        let utils = wiComponentService.getComponent('UTILS');
        wiComponentService.on('project-loaded-event', function (project) {
            utils.pushProjectToExplorer(self, project, wiComponentService, WiTreeConfig, WiWell, $timeout);
        });
        wiComponentService.on('project-unloaded-event', function () {
            self.treeConfig = {};
        });
        if (self.name) wiComponentService.putComponent(self.name, self);
    };
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-explorer.html',
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        name: '@',
        treeConfig: '<'
    }
});

exports.name = moduleName;

