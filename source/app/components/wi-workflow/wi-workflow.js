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
                    { name: "GR clay", type: "number", value: 100 },
                    {
                        name: "Method",
                        type: "select",
                        value: 1,
                        choices: [
                            { name: "Linear", value: 1 },
                            { name: "Clavier", value: 2 },
                            {
                                name: "Larionov Tertiary rocks",
                                value: 3
                            },
                            {
                                name: "Larionov older rocks",
                                value: 4
                            },
                            {
                                name: "Stieber variation I",
                                value: 5
                            },
                            {
                                name: "Stieber - Miocene and Pliocene",
                                value: 6
                            },
                            {
                                name: "Stieber variation II",
                                value: 7
                            }
                        ]
                    }
                ],
                function: "calVSHfromGR"
            },
            {
                name: "Porosity",
                inputs: [{ name: "Bulk Density" }, { name: "Shale Volume" }],
                parameters: [
                    { name: "matrix", type: "number", value: 2.65 },
                    { name: "shale", type: "number", value: 2.4 },
                    {
                        name: "fluid",
                        type: "number",
                        value: 1
                    }
                ],
                function: "calEffectivePorosityFromDensity"
            },
            {
                name: "Saturation",
                inputs: [
                    { name: "Formation Resistivity" },
                    { name: "Porosity" }
                ],
                parameters: [
                    { name: "a", type: "number", value: 1 },
                    { name: "m", type: "number", value: 2 },
                    { name: "n", type: "number", value: 2 },
                    { name: "Rw", type: "number", value: 0.03 },
                ],
                function: "calSaturationArchie"
            }
        ]
        
    };
    /*
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
    */

    this.$onInit = function () {
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
