const componentName = 'wiExplorer';
const moduleName = 'wi-explorer';

function Controller($scope, wiComponentService, WiWell, $timeout) {
    let self = this;

    this.$onInit = function () {
        self.treeviewName = self.name + 'treeview';
        // hide for test
        $scope.handlers = wiComponentService.getComponent('GLOBAL_HANDLERS');
        let utils = wiComponentService.getComponent('UTILS');

        wiComponentService.on('project-loaded-event', function (project) {
            console.log('project data: ', project);
            self.treeConfig = utils.getTreeviewConfig();

            // parse config from data
            // inject child item to origin config
            let wells = parseWells(project);
            $timeout(function () {
                pushWellsToTreeConfig(wells);
            });
        });

        wiComponentService.on('project-unloaded-event', function () {
            self.treeConfig = {};
        });

        if (self.name) wiComponentService.putComponent(self.name, self);
    };

    function parseWells(project) {
        let wells = [];

        for (let well of project.wells){
            let wiWellTemp = new WiWell(well);
            wells.push(wiWellTemp);
        }

        return wells;
    }

    function pushWellsToTreeConfig(wells) {
        let wiRootTreeviewComponent = wiComponentService.getComponent(self.treeviewName);

        if (wiRootTreeviewComponent){
            for (let well of wells) {
                wiRootTreeviewComponent.addItemToFirst('wells', well);
            }
        }
    }
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

