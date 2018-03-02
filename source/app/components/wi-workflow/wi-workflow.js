const name = "wiWorkflow";
const moduleName = "wi-workflow";

function Controller(wiComponentService) {
    let self = this;
    this.workflowConfig = {
        name: "Clastic",
        steps: [
            {
                name: "Shale Volume",
                inputs: [{ name: "Gamma Ray" }],
                parameters: [
                    { name: "GR clean", type: "number", value: 10 },
                    { name: "GR clay", type: "number", value: 120 },
                    {
                        name: "Method",
                        type: "select",
                        value: { name: "Linear", value: "Linear" },
                        choices: [
                            { name: "Linear", value: "Linear" },
                            { name: "Clavier", value: "Clavier" },
                            {
                                name: "Larionov Tertiary rocks",
                                value: "Tertiary"
                            }
                        ]
                    }
                ]
            },
            {
                name: "Porosity",
                inputs: [{ name: "Bulk Density" }, { name: "Shale Volume" }],
                parameters: [
                    { name: "GR clean", type: "number", value: 10 },
                    { name: "GR clay", type: "number", value: 120 },
                    {
                        name: "Method",
                        type: "select",
                        value: { name: "Linear", value: "Linear" },
                        choices: [
                            { name: "Linear", value: "Linear" },
                            { name: "Clavier", value: "Clavier" },
                            {
                                name: "Larionov Tertiary rocks",
                                value: "Tertiary"
                            }
                        ]
                    }
                ]
            },
            {
                name: "Saturation",
                inputs: [
                    { name: "Formation Resistivity" },
                    { name: "Porosity" }
                ],
                parameters: [
                    { name: "GR clean", type: "number", value: 10 },
                    { name: "GR clay", type: "number", value: 120 },
                    {
                        name: "Method",
                        type: "select",
                        value: { name: "Linear", value: "Linear" },
                        choices: [
                            { name: "Linear", value: "Linear" },
                            { name: "Clavier", value: "Clavier" },
                            {
                                name: "Larionov Tertiary rocks",
                                value: "Tertiary"
                            }
                        ]
                    }
                ]
            }
        ]
        
    };
    this.workflowConfig = {    
        name: "Missing curve reconstruction",
        steps: [
            {
                name: "Train",
                inputs: [{ name: "Curve 1 " },{ name: "Curve 2 " },{ name: "Curve 3 " }],
                parameters: []
            },
            {
                name: "Verify",
                inputs: [{ name: "Curve 1" },{ name: "Curve 2 " },{ name: "Curve 3 " }],
                parameters: []
            },
            {
                name: "Predict",
                inputs: [
                    { name: "Curve 1 " },{ name: "Curve 2 " } 
                ],
                parameters: []
            }
        ]
    };

    this.$onInit = function() {
        wiComponentService.putComponent(wiComponentService.WI_WORKFLOW, self);
    };
    this.getCurrentProjectId = function() {
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
        idProject: "<"
    }
});

exports.name = moduleName;
