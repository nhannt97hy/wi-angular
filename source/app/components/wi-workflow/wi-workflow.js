const name = "wiWorkflow";
const moduleName = "wi-workflow";

function Controller(wiComponentService) {
    let self = this;
    this.inputConfig = [{ name: "Gamma Ray" }];
    this.parameterConfig = [
        { name: "GR clean", type: "number", value: 10 },
        { name: "GR clay", type: "number", value: 120 },
        {
            name: "Method",
            type: "select",
            value: { name: "Linear", value: "Linear" },
            choices: [
                { name: "Linear", value: "Linear" },
                { name: "Clavier", value: "Clavier" },
                { name: "Larionov Tertiary rocks", value: "Tertiary" }
            ]
        }
    ];

    this.$onInit = function() {
        wiComponentService.putComponent(wiComponentService.WI_WORKFLOW, self);
    };
    this.getCurrentProjectId = function() {
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
    transclude: true
});

exports.name = moduleName;
