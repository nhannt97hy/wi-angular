const name = "wiWorkflow";
const moduleName = "wi-workflow";

function Controller(wiComponentService, wiApiService) {
    let self = this;
    let layout = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);

    /*
    this.workflowConfig = {
        name: "Clastic",
        steps: [
            {
                name: "Clay Volume",
                inputs: [{ name: "Gamma Ray" }],
                parameters: [
                    { name: "GR clean", type: "number", value: 10 },
                    { name: "GR clay", type: "number", value: 120 },
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
                outputs: [
                    {
                        name: "VCL_GR",
                        family: "Clay Volume"
                    }
                ],
                function: "calVCLfromGR"
            },
            {
                name: "Porosity",
                inputs: [{ name: "Bulk Density" }, { name: "Clay Volume" }],
                parameters: [
                    { name: "clean", type: "number", value: 2.65 },
                    { name: "fluid", type: "number", value: 1 },
                    { name: "clay", type: "number", value: 2.3 }
                ],
                outputs:[
                    {
                        name: "PHIT_D",
                        family: "Total Porosity"
                    },
                    {
                        name: "PHIE_D",
                        family: "Effective Porosity"
                    }
                ],
                function: "calPorosityFromDensity"
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
                outputs:[
                    {
                        name: "SW_AR",
                        family: "Water Saturation"
                    },
                    {
                        name: "SH_AR",
                        family: "Hydrocarbon Saturation"
                    },
                    {
                        name: "SW_AR_UNCL",
                        family: "Water Saturation Unclipped"
                    },
                    {
                        name: "BVW_AR",
                        family: "Bulk Volume Water"
                    }
                ],
                function: "calSaturationArchie"
            },
            {
                name: "Summation",
                inputs: [
                    {
                        name: "Clay Volume"
                    },
                    {
                        name: "Porosity"
                    },
                    {
                        name: "Water Saturation"
                    }
                ],
                parameters: [
                    {
                        name: "Min Res Height",
                        type: "number",
                        value: 0
                    },
                    {
                        name: "Min Pay Height",
                        type: "number",
                        value: 0
                    },
                    {
                        name: "Vclay Cut",
                        type: "number",
                        value: 0.35
                    },
                    {
                        name: "Phi Cut",
                        type: "number",
                        value: 0.15
                    },
                    {
                        name: "Sw Cut",
                        type: "number",
                        value: 0.6
                    }
                ],
                outputs: [
                    {
                        name: "NetRes",
                        family: "Net Reservoir Flag"
                    },
                    {
                        name: "NetPay",
                        family: "Net Pay Flag"
                    }
                ],
                function: "calCutoffSummation"
            }
        ]

    };
    wiApiService.createWorkflowSpec('Clastic', this.workflowConfig, function(res){
        console.log(res);
    });
    */
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
        self.name = 'workflow' + self.id + "Area";
        self.WorkflowPlayerName = "workflowplayer" + self.id + "Area";
        wiComponentService.putComponent(self.name, self);
        self.showOutput = true;
    };
    this.getCurrentProjectId = function () {
        if (self.idProject) return self.idProject;
        let openProject = wiComponentService.getComponent(
            wiComponentService.PROJECT_LOADED
        );
        return (openProject || {}).idProject;
    };

    this.EditWorkflowButtonClicked = function () {
        console.log("Edit workflow");
    }
    this.toggleOutput = function () {
        self.showOutput = !self.showOutput;
    }

    this.openPlot = function(plot){
        let plotModel = {
            id: plot.idPlot,
            type: 'logplot',
            properties: {
                idPlot: plot.idPlot,
                name: plot.plotName,
                idWell: plot.idWell
            }
        }
        layout.putTabRightWithModel(plotModel);
    }
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
