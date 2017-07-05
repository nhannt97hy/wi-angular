const componentName = 'wiExplorer';
const moduleName = 'wi-explorer';

function Controller($scope, $timeout, wiComponentService) {
    let self = this;

    this.$onInit = function () {
        // hide for test
        $scope.handlers = wiComponentService.getComponent('GLOBAL_HANDLERS');

        /**
         id: Date.now(),
         "type": "project",
         "name": "Test-Project",
         "company": "UET",
         "department": "FIT",
         "description": "blablabla"
         */
        wiComponentService.on('project-loaded-event', function (data) {
            self.treeConfig = data;
            console.log('project data: ', data);
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

