const name = "wiWorkflow";
const moduleName = "wi-workflow";

function Controller(wiComponentService, wiApiService) {
    let self = this;

    this.$onInit = function () {
        self.name = 'workflow' + self.id + "Area";
        self.WorkflowPlayerName = "workflowplayer" + self.id + "Area";
        wiComponentService.putComponent(self.name, self);
    };
    this.getCurrentProjectId = function () {
        if (self.idProject) return self.idProject;
        let openProject = wiComponentService.getComponent(
            wiComponentService.PROJECT_LOADED
        );
        return (openProject || {}).idProject;
    };
}

let app = angular.module(moduleName, []);

app.component(name, {
    templateUrl: "wi-workflow.html",
    controller: Controller,
    controllerAs: name,
    transclude: true,
    bindings: {
        idProject: "<",
        id: "<"
    }
});

exports.name = moduleName;
