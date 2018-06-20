exports.NewProjectButtonClicked = function () {
    let self = this;
    let wiComponentService = this.wiComponentService;
    let ModalService = this.ModalService;
    let DialogUtils = wiComponentService.getComponent('DIALOG_UTILS');
    let projectLoaded = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);
    if (projectLoaded && projectLoaded.shared) return toastr.error("Can't add new project in shared project. Please close this project first");
    DialogUtils.newProjectDialog(ModalService, function (data) {
        self.wiApiService.createProject(data, function (response) {
            if (!response.name) {
                DialogUtils.errorMessageDialog(ModalService, "Project: " + data.name + " existed!");
            } else {
                wiComponentService.getComponent(wiComponentService.HISTORYSTATE).removeHistory();
                let utils = self.wiComponentService.getComponent('UTILS');
                self.wiApiService.getProject({ idProject: response.idProject }, function (response) {
                    utils.projectOpen(response);
                });
            }
        });
    });
};

exports.OpenProjectButtonClicked = function () {
    let self = this;
    let wiComponentService = this.wiComponentService;
    let DialogUtils = wiComponentService.getComponent('DIALOG_UTILS');
    DialogUtils.openProjectDialog(this.ModalService, function (projectData) {
        wiComponentService.getComponent(wiComponentService.HISTORYSTATE).removeHistory();
        let utils = self.wiComponentService.getComponent('UTILS');
        utils.projectOpen(projectData);
    });
};

exports.CloseProjectButtonClicked = function () {
    let self = this;
    let utils = this.wiComponentService.getComponent('UTILS');
    let DialogUtils = this.wiComponentService.getComponent('DIALOG_UTILS');
    DialogUtils.confirmDialog(this.ModalService, "Close project", "Are you sure to close project?", function (yesOrNo) {
        if (yesOrNo) {
            utils.projectClose();
        }
    })
};

exports.UnitSettingsButtonClicked = function () {
    let wiComponentService = this.wiComponentService;
    let DialogUtils = wiComponentService.getComponent('DIALOG_UTILS');
    DialogUtils.unitSettingDialog(this.ModalService, function (ret) {
        console.log("User Choose: " + ret);
    })
};

exports.ShareProjectButtonClicked = function () {
    console.log("ShareProjectButton is clicked");
    let self = this;
    let ModalService = this.ModalService;
    let wiApiService = this.wiApiService;
    let wiComponentService = this.wiComponentService;
    let DialogUtils = wiComponentService.getComponent('DIALOG_UTILS');
    let project = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);
    let company = JSON.parse(window.localStorage.getItem('company'));
    if(project.owner){
        toastr.error("You can't share this project!");
    } else {
        wiApiService.listGroup({idCompany: company.idCompany}, function (groups) {
            wiApiService.listUser({idCompany: company.idCompany}, function (users) {
                DialogUtils.shareProjectDialog(ModalService, function () {
                }, groups, users, company);
            });
        });
    }
};

exports.SaveProjectButtonClicked = function () {
    console.log('SaveProjectButton is clicked');
};

exports.SaveProjectAsButtonClicked = function () {
    console.log('SaveProjectAsButton is clicked');
};

exports.InventoryButtonClicked = function () {
    let self = this;
    let wiComponentService = this.wiComponentService;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    const layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
    layoutManager.putTabRight({
        id: 'inventory-inspection',
        title: 'Inventory Inspection',
        tabIcon: 'project-normal-16x16',
        componentState: {
            html: `
                <div style="height:100%;display:flex;flex-direction:row;">
                    <wii-explorer name='wiiExplorer' style="margin-left:1em;flex: 4"></wii-explorer>
                    <wii-items name="wiiItems" style="flex: 3;overflow:hidden;"></wii-items>
                    <wii-properties name="wiiProperties" style="flex: 3;overflow:auto;"></wii-properties>
                </div>
            `,
            name: 'wiInventory'
        }
    })
}

exports.ImportButtonClicked = function () {
    exports.ImportFromInventoryButtonClicked.call(this);
    /*
    let layoutManager = this.wiComponentService.getComponent(this.wiComponentService.LAYOUT_MANAGER);
    layoutManager.putTabRight({
        type:'component',
        componentName: 'html-block',
        id: "TestPane",
        componentState: {
            html: `
                <wi-logplot name="logplot5" id="5">
                </wi-logplot>
            `
        },
        title: `<span class="logplot-blank-16x16"></span> <span>logplot5</span>`
    });*/
}
exports.ZoneSetManagerButtonClicked = function() {
    console.log('zonesetManager button is clicked');
    let self = this;
    let wiComponentService = this.wiComponentService;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    const layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
    layoutManager.putTabRight({
        id: 'Zoneset-manager',
        title: 'Zoneset Manager',
        componentState: {
            html: `<wi-zone-manager></wi-zone-manager>`,
            name: 'wiZoneManager'
        }
    })
}
exports.ProjectButtonClicked = function () {
    console.log('ProjectButton is clicked');
    let wiComponentService = this.wiComponentService;
    let layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);

    if (!layoutManager.isComponentExist('explorer-block')) {
        layoutManager.putLeft('explorer-block', 'Project');

        wiComponentService.emit(wiComponentService.PROJECT_LOADED_EVENT);
    }
};

exports.NewFlowButtonClicked = function () {
    const wiComponentService = this.wiComponentService;
    const layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
    const now = Date.now();
    layoutManager.putTabRight({
        id: 'flow' + now,
        title: 'New Flow',
        tabIcon: 'workflow-16x16',
        componentState: {
            html: `<wi-flow-designer new="true" id="${now}"></wi-flow-designer>`,
            model: {
                type: 'flow',
                id: now
            }
        }
    });
}

exports.OpenFlowButtonClicked = function () {
    const self = this;
    const wiComponentService = this.wiComponentService;
    const Utils = self.wiComponentService.getComponent('UTILS');
    const ModalService = this.ModalService;
    const DialogUtils = wiComponentService.getComponent('DIALOG_UTILS');
    DialogUtils.openFlowDialog(ModalService, function (flow) {
        const layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
        layoutManager.putTabRight({
            id: 'flow' + flow.idFlow,
            title: flow.name,
            tabIcon: 'workflow-16x16',
            componentState: {
                html: `<wi-flow-designer id="${flow.idFlow}" flow="flow"></wi-flow-designer>`,
                model: {
                    type: 'flow',
                    id: flow.idFlow,
                },
                flow
            }
        });
    })
}

exports.NewWorkflowButtonClicked = function () {
    console.log('NewWorkflowButton is clicked');
    let self = this;
    let wiComponentService = this.wiComponentService;
    let ModalService = this.ModalService;
    let DialogUtils = wiComponentService.getComponent('DIALOG_UTILS');
    let utils = self.wiComponentService.getComponent('UTILS');
    let project = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);
    DialogUtils.newWorkflowDialog(ModalService, function (data) {
        data.idProject = project.idProject;
        self.wiApiService.createWorkflow(data, function (response, err) {
            if (err) {
                toastr.error(err);
            } else {
                let layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
                layoutManager.putTabRight({
                    id: 'workflow' + response.idWorkflow,
                    title: response.name,
                    tabIcon: 'workflow-16x16',
                    componentState: {
                        html: '<wi-workflow id="' + response.idWorkflow + '"></wi-workflow>',
                        name: 'Workflow'
                    }
                });
            }
        });
    });
}

exports.OpenWorkflowButtonClicked = function () {
    console.log('OpenWorkflowButton is clicked');
    let self = this;
    let wiComponentService = this.wiComponentService;
    let DialogUtils = wiComponentService.getComponent('DIALOG_UTILS');
    DialogUtils.openWorkflowDialog(this.ModalService, function (response) {
        let layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
        layoutManager.putTabRight({
            id: 'workflow' + response.idWorkflow,
            title: response.name,
            tabIcon: 'workflow-16x16',
            componentState: {
                html: '<wi-workflow id="' + response.idWorkflow + '"></wi-workflow>',
                name: 'Workflow'
            }
        })
    });
}
exports.NewModelButtonClicked = function() {
    console.log('NewModelButton is clicked');
    let self = this;
    let wiComponentService = this.wiComponentService;
    let ModalService = this.ModalService;
    let DialogUtils = wiComponentService.getComponent('DIALOG_UTILS');
    let utils = self.wiComponentService.getComponent('UTILS');
    let project = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);
    function createWF() {
        DialogUtils.newModelDialog(ModalService, function (data) {
            data.idProject = project.idProject;
            self.wiApiService.createWorkflow(data, function (response, err) {
                if (err) {
                    createWF();
                    // toastr.error(err);
                } else {
                    let layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
                    layoutManager.putTabRight({
                        id: 'machine-learning' + response.idWorkflow,
                        title: response.name,
                        tabIcon: 'caculation-multilinerregression-16x16',
                        componentState: {
                            html: '<wi-workflow-machine-learning  id-workflow="' + response.idWorkflow + '"></wi-workflow-machine-learning>',
                            name: 'Machine Learning'
                        }
                    });
                }
            });
        });
    }
    createWF();
}

exports.OpenModelButtonClicked = function() {
    console.log('OpenModelButton is clicked');
    let self = this;
    let wiComponentService = this.wiComponentService;
    let DialogUtils = wiComponentService.getComponent('DIALOG_UTILS');
    DialogUtils.openModelDialog(this.ModalService, function (response) {
        console.log(response.idWorkflow);
        let layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
        layoutManager.putTabRight({
            id: 'machine-learning' + response.idWorkflow,
            title: response.name,
            tabIcon: 'caculation-multilinerregression-16x16',
            componentState: {
                html: '<wi-workflow-machine-learning  id-workflow="' + response.idWorkflow + '"></wi-workflow-machine-learning>',
                name: 'Machine Learning'
            }
        })
    });
}

// exports.WorkflowsButtonClicked = function () {
//     console.log('WorkflowsButton is clicked');
//     let wiComponentService = this.wiComponentService;
//     let layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
//     layoutManager.putTabRight({
//         id: 'Workflow',
//         title: 'Workflow',
//         tabIcon: 'workflow-16x16',
//         componentState: {
//             html: `<wi-workflow id="1"></wi-workflow>`,
//             name: 'Workflow'
//         }
//     })
// };

exports.ExportFromInventoryButtonClicked = function() {
    console.log('ExportFromInventorylButton is clicked');
    let self = this;
    let wiComponentService = this.wiComponentService;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let loadedProject = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);
    const layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
    layoutManager.putTabRight({
        id: 'export-tool',
        title: 'Export Tool',
        tabIcon: 'export-well-top-16x16',
        componentState: {
            html: `
                <div style='height:100%;display:flex;flex-direction:column;'>
                  
                   <wi-export style='flex:1;' from="inventory"></wi-export>
                </div>
            `,
            name: 'wiExport'
        }
    })

}
exports.ExportFromProjectButtonClicked = function (){
    console.log('ExportFromProjectButton is clicked');
    let self = this;
    let wiComponentService = this.wiComponentService;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let loadedProject = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);
    const layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
    layoutManager.putTabRight({
        id: 'export-tool',
        title: 'Export Tool',
        tabIcon: 'export-well-top-16x16',
        componentState: {
            html: `
                <div style='height:100%;display:flex;flex-direction:column;'>
                  
                   <wi-export style='flex:1;' from="project"></wi-export>
                </div>
            `,
            name: 'wiExport'
        }
    })
}
exports.PropertyGridButtonClicked = function () {
    console.log('PropertyGridButton is clicked');
    let wiComponentService = this.wiComponentService;
    let layoutManager = wiComponentService.getComponent('LAYOUT_MANAGER');

    if (!layoutManager.isComponentExist('property-block')) {
        layoutManager.putLeft('property-block', 'Properties');
    }
};

exports.ExitButtonClicked = function () {
    console.log('ExitButton is clicked');
    let wiComponentService = this.wiComponentService;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let DialogUtils = wiComponentService.getComponent('DIALOG_UTILS');
    DialogUtils.confirmDialog(this.ModalService, "Exit Program", "Are you sure to exit program?", function (isExit) {
        if (isExit) {
            window.localStorage.removeItem('token');
            // window.localStorage.removeItem('username');
            window.localStorage.removeItem('password');
            window.localStorage.removeItem('rememberAuth');
            window.history.replaceState({}, 'home', '/');
            document.title = 'Well Insight';
            location.reload();
        }
    })
};



exports.AddNewButtonClicked = function () {
    let self = this;
    let wiComponentService = this.wiComponentService;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let DialogUtils = wiComponentService.getComponent('DIALOG_UTILS');

    DialogUtils.addNewDialog(this.ModalService, function (newWell) {
        if (newWell) {
            // let wellModel = utils.wellToTreeConfig(newWell);
            // let selectedProjectNode = utils.getSelectedProjectNode();
            // selectedProjectNode.children.push(wellModel);
            utils.refreshProjectState();
        }
    });
};

exports.WellHeaderButtonClicked = function () {
    console.log('WellHeaderButton is clicked');
    var wiComponentService = this.wiComponentService;
    var DialogUtils = wiComponentService.getComponent('DIALOG_UTILS');
    DialogUtils.wellHeaderDialog(this.ModalService, function (ret) {
        console.log("User choose: " + ret);
    })
};

exports.DepthConversionButtonClicked = function () {
    console.log('DepthConversionButton is clicked');
    var wiComponentService = this.wiComponentService;
    var DialogsUtils = wiComponentService.getComponent('DIALOG_UTILS');
    DialogsUtils.depthConversionDialog(this.ModalService, this.DialogUtils, function (ret) {
        console.log("User choose: " + ret);
    })
};

exports.CurveAliasButtonClicked = function () {
    console.log('CurveAliasButton is clicked');
};

exports.FamilyEditButtonClicked = function () {
    console.log('FamilyEditButton is clicked');
};

exports.ImportASCIIButtonClicked = function () {
    console.log('ImportASCIIButton is clicked');
};

exports.ImportMultiASCIIButtonClicked = function () {
    console.log('ImportMultiASCIIButton is clicked');
};

exports.ImportLASButtonClicked = function () {
    let self = this;
    let utils = this.wiComponentService.getComponent(this.wiComponentService.UTILS);
    let DialogUtils = this.wiComponentService.getComponent('DIALOG_UTILS');
    DialogUtils.importLASDialog(this.ModalService)
};

exports.ImportMultiLASButtonClicked = function () {
    let utils = this.wiComponentService.getComponent(this.wiComponentService.UTILS);
    let DialogUtils = this.wiComponentService.getComponent('DIALOG_UTILS');
    DialogUtils.importMultiLASDialog(this.ModalService, function (wellResponses) {
        if (wellResponses) {
            for (let wellRes of wellResponses) {
                if (!wellRes.errors) {
                    let wellModel = utils.wellToTreeConfig(wellRes);
                    let selectedProjectNode = utils.getSelectedProjectNode();
                    let found = false;
                    for (let i in selectedProjectNode.children) {
                        if (selectedProjectNode.children[i].id == wellModel.id) {
                            selectedProjectNode.children[i] = wellModel;
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        selectedProjectNode.children.push(wellModel);
                    }
                }
            }
        }
    })
};

exports.ImportFromInventoryButtonClicked = function () {
    let self = this;
    let wiComponentService = this.wiComponentService;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let loadedProject = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);
    // let DialogUtils = this.wiComponentService.getComponent('DIALOG_UTILS');
    // DialogUtils.importFromInventoryDialog(this.ModalService)
    const layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
    layoutManager.putTabRight({
        id: 'inventory-connect',
        title: 'Inventory Connect',
        tabIcon: 'project-normal-16x16',
        componentState: {
            html: `
                <div style='height:100%;display:flex;flex-direction:column;'>
                    <wi-inventory style='flex:1;' id-project=${loadedProject.idProject}></wi-inventory>
                </div>
            `,
            name: 'wiInventory'
        }
    })
};

exports.OpenTemplateButtonClicked = function () {
    let self = this;
    let utils = this.wiComponentService.getComponent(this.wiComponentService.UTILS);
    let DialogUtils = this.wiComponentService.getComponent('DIALOG_UTILS');
    // let currentWell = utils.getCurrentWell();
    let projectLoaded = this.wiComponentService.getComponent(this.wiComponentService.PROJECT_LOADED);
    DialogUtils.openTemplateDialog(this.ModalService, projectLoaded, function (plot) {
        utils.openLogplotTab(self.wiComponentService, utils.getModel('logplot', plot.idPlot));
    });
};


exports.Interval_CoreLoaderButtonClicked = function () {
    console.log('Interval/CoreLoaderButton is clicked');
};

exports.Multi_wellCoreLoaderButtonClicked = function () {
    console.log('Multi-wellCoreLoaderButton is clicked');
};

exports.ImportWellHeaderButtonClicked = function () {
    console.log('ImportWellHeaderButton is clicked');
};

exports.ImportWellTopButtonClicked = function () {
    console.log('ImportWellTopButton is clicked');
};

exports.ExportASCIIButtonClicked = function () {
    console.log('ExportASCIIButton is clicked');
};

exports.ExportMultiASCIIButtonClicked = function () {
    console.log('ExportMultiASCIIButton is clicked');
};

exports.ExportLASButtonClicked = function () {
    console.log('ExportLASButton is clicked');
};

exports.ExportMultiLASButtonClicked = function () {
    console.log('ExportMultiLASButton is clicked');
};

exports.ExportCoreDataButtonClicked = function () {
    console.log('ExportCoreDataButton is clicked');
};

exports.Multi_wellCoreLoaderButtonClicked = function () {
    console.log('Multi-wellCoreLoaderButton is clicked');
};

exports.ExportWellHeaderButtonClicked = function () {
    console.log('ExportWellHeaderButton is clicked');
};

exports.ExportWellTopButtonClicked = function () {
    console.log('ExportWellTopButton is clicked');
};

exports.BlankLogplotButtonClicked = function () {
    const self = this;
    const wiComponentService = this.wiComponentService;
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);

    // let currentWell = utils.getCurrentWell();
    // if (!currentWell) return;

    const ModalService = this.ModalService;
    const DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    const wiApiService = this.wiApiService;
    const $timeout = this.$timeout;
    let promptConfig = {
        title: 'Create New Log Plot',
        inputName: 'Log Plot Name',
        input: 'BlankLogPlot'
    }
    DialogUtils.promptDialog(ModalService, promptConfig, function (logplotName) {
        if(!logplotName) return;
        utils.createNewBlankLogPlot(wiComponentService, wiApiService, logplotName, "")
            .then(function (logplot) {
                console.log("Created new log plot", logplot);
                let logplotModel = utils.logplotToTreeConfig(logplot);
                let selectedLogplot = utils.getSelectedNode();
                selectedLogplot.children.push(logplotModel);
                utils.openLogplotTab(wiComponentService, logplotModel, function () {
                    let logplotName = 'logplot' + logplotModel.properties.idPlot;
                    let wiD3Ctrl = wiComponentService.getComponent(logplotName).getwiD3Ctrl();
                    wiD3Ctrl.addDepthTrack(function () {
                        wiD3Ctrl.addLogTrack('Track 1');
                    });
                });
            })
            .catch(function (err) {
                exports.BlankLogplotButtonClicked.call(self);
            });
    });
};

exports.TrippleComboButtonClicked = function () {
    const self = this;
    const wiComponentService = this.wiComponentService;
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    // let currentWell = utils.getCurrentWell();
    // if (!currentWell) return;
    const ModalService = this.ModalService;
    const DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    const wiApiService = this.wiApiService;
    const $timeout = this.$timeout;
    let promptConfig = {
        title: '<span class="logplot-new-16x16"></span> Create New Log Plot',
        inputName: 'Name',
        input: 'TripleCombo'
    };
    DialogUtils.promptDialog(ModalService, promptConfig, function (logplotName) {
        if(!logplotName) return;
        utils.createNewBlankLogPlot(wiComponentService, wiApiService, logplotName, "TripleCombo")
            .then(function (logplot) {
                console.log("Created new log plot", logplot);
                let logplotModel = utils.logplotToTreeConfig(logplot);
                let selectedLogplot = utils.getSelectedNode();
                selectedLogplot.children.push(logplotModel);
                utils.openLogplotTab(wiComponentService, logplotModel, function () {
                    if (logplot.familiesWithoutCurve.length > 0) {
                        let message = "Not Found Curves in families : ";
                        logplot.familiesWithoutCurve.forEach(function (r) {
                            message += r + "<br>";
                        });
                        // setTimeout(function(){
                        //     DialogUtils.warningMessageDialog(ModalService, message);
                        // }, 1000);
                    }
                });
            })
            .catch(function (err) {
                exports.TrippleComboButtonClicked.call(self);
            });
    });
};

exports.DensityNeutronButtonClicked = function () {
    const self = this;
    const wiComponentService = this.wiComponentService;
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    // let currentWell = utils.getCurrentWell();
    // if (!currentWell) return;
    const ModalService = this.ModalService;
    const DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    const wiApiService = this.wiApiService;
    const $timeout = this.$timeout;
    let promptConfig = {
        title: '<span class="logplot-new-16x16"></span> Create New Log Plot',
        inputName: 'Name',
        input: 'DensityNeutron'
    };
    DialogUtils.promptDialog(ModalService, promptConfig, function (logplotName) {
        if(!logplotName) return;
        utils.createNewBlankLogPlot(wiComponentService, wiApiService, logplotName, "DensityNeutron")
            .then(function (logplot) {
                console.log("Created new log plot", logplot);
                let logplotModel = utils.logplotToTreeConfig(logplot);
                let selectedLogplot = utils.getSelectedNode();
                selectedLogplot.children.push(logplotModel);
                utils.openLogplotTab(wiComponentService, logplotModel, function () {
                    if (logplot.familiesWithoutCurve.length > 0) {
                        let message = "Not Found Curves in families : ";
                        logplot.familiesWithoutCurve.forEach(function (r) {
                            message += r + "<br>";
                        });
                        // setTimeout(function(){
                        //     DialogUtils.warningMessageDialog(ModalService, message);
                        // }, 1000);
                    }
                });
            })
            .catch(function (err) {
                exports.DensityNeutronButtonClicked.call(self);
            });
    });
};

exports.ResistivitySonicButtonClicked = function () {
    const self = this;
    const wiComponentService = this.wiComponentService;
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    // let currentWell = utils.getCurrentWell();
    // if (!currentWell) return;
    const ModalService = this.ModalService;
    const DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    const wiApiService = this.wiApiService;
    const $timeout = this.$timeout;
    let promptConfig = {
        title: '<span class="logplot-new-16x16"></span> Create New Log Plot',
        inputName: 'Name',
        input: 'ResistivitySonic'
    };
    DialogUtils.promptDialog(ModalService, promptConfig, function (logplotName) {
        if(!logplotName) return;
        utils.createNewBlankLogPlot(wiComponentService, wiApiService, logplotName, "ResistivitySonic")
            .then(function (logplot) {
                console.log("Created new log plot", logplot);
                let logplotModel = utils.logplotToTreeConfig(logplot);
                let selectedLogplot = utils.getSelectedNode();
                selectedLogplot.children.push(logplotModel);
                utils.openLogplotTab(wiComponentService, logplotModel, function () {
                    if (logplot.familiesWithoutCurve.length > 0) {
                        let message = "Not Found Curves in families : ";
                        logplot.familiesWithoutCurve.forEach(function (r) {
                            message += r + "<br>";
                        });
                        // setTimeout(function(){
                        //     DialogUtils.warningMessageDialog(ModalService, message);
                        // }, 1000);
                    }
                });
            })
            .catch(function (err) {
                exports.ResistivitySonicButtonClicked.call(self);
            });
    });
};

exports.TriTracksBlankButtonClicked = function () {
    const self = this;
    const wiComponentService = this.wiComponentService;
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    // let currentWell = utils.getCurrentWell();
    // if (!currentWell) return;
    const ModalService = this.ModalService;
    const DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    const wiApiService = this.wiApiService;
    const $timeout = this.$timeout;
    let promptConfig = {
        title: '<span class="logplot-new-16x16"></span> Create New Log Plot',
        inputName: 'Name',
        input: '3TrackBlank'
    };
    DialogUtils.promptDialog(ModalService, promptConfig, function (logplotName) {
        if(!logplotName) return;
        utils.createNewBlankLogPlot(wiComponentService, wiApiService, logplotName, "")
            .then(function (logplot) {
                console.log("Created new log plot", logplot);
                let logplotModel = utils.logplotToTreeConfig(logplot);
                let selectedLogplot = utils.getSelectedNode();
                selectedLogplot.children.push(logplotModel);
                utils.openLogplotTab(wiComponentService, logplotModel, function () {
                    let logplotName = 'logplot' + logplotModel.properties.idPlot;
                    let wiD3Ctrl = wiComponentService.getComponent(logplotName).getwiD3Ctrl();
                    wiD3Ctrl.addDepthTrack(function () {
                        wiD3Ctrl.addLogTrack('Track 1')
                            .then(() => { wiD3Ctrl.addLogTrack('Track 2')})
                            .then(() => { wiD3Ctrl.addLogTrack('Track 3')});
                        /*
                        wiD3Ctrl.addLogTrack('Track 1', function () {
                            wiD3Ctrl.addLogTrack('Track 2', function () {
                                wiD3Ctrl.addLogTrack('Track 3');
                            });
                        });
                        */
                    });
                });
            })
            .catch(function (err) {
                exports.TriTracksBlankButtonClicked.call(self);
            });
    });
};

exports.InputCurveButtonClicked = function () {
    const self = this;
    const wiComponentService = this.wiComponentService;
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let currentWell = utils.getCurrentWell();
    if (!currentWell) return;
    const ModalService = this.ModalService;
    const DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    const wiApiService = this.wiApiService;
    const $timeout = this.$timeout;
    let promptConfig = {
        title: '<span class="logplot-new-16x16"></span> Create New Log Plot',
        inputName: 'Name',
        input: 'InputCurves'
    };
    DialogUtils.promptDialog(ModalService, promptConfig, function (logplotName) {
        if(!logplotName) return;
        utils.createNewBlankLogPlot(wiComponentService, wiApiService, logplotName, "")
            .then(function (logplot) {
                console.log("Created new log plot", logplot);
                let logplotModel = utils.logplotToTreeConfig(logplot);
                let selectedLogplot = utils.getSelectedNode();
                selectedLogplot.children.push(logplotModel);
                utils.openLogplotTab(wiComponentService, logplotModel, function () {
                    let logplotName = 'logplot' + logplotModel.properties.idPlot;
                    let wiD3Ctrl = wiComponentService.getComponent(logplotName).getwiD3Ctrl();
                    wiD3Ctrl.addDepthTrack(function () {
                        wiD3Ctrl.addLogTrack('Grammaray', function () {
                            wiD3Ctrl.addLogTrack('Density', function () {
                                wiD3Ctrl.addLogTrack('Neutron', function () {
                                    wiD3Ctrl.addLogTrack('Sonic');
                                });
                            });
                        });
                    });
                });
            })
            .catch(function (err) {
                exports.InputCurveButtonClicked.call(self);
            });
    });
};

exports.LithoPlusSyn_CurveButtonClicked = function () {
    const self = this;
    const wiComponentService = this.wiComponentService;
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let currentWell = utils.getCurrentWell();
    if (!currentWell) return;
    const ModalService = this.ModalService;
    const DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    const wiApiService = this.wiApiService;
    const $timeout = this.$timeout;
    let promptConfig = {
        title: '<span class="logplot-new-16x16"></span> Create New Log Plot',
        inputName: 'Name',
        input: 'Lithosyn'
    };
    DialogUtils.promptDialog(ModalService, promptConfig, function (logplotName) {
        if(!logplotName) return;
        utils.createNewBlankLogPlot(wiComponentService, wiApiService, logplotName, "")
            .then(function (logplot) {
                console.log("Created new log plot", logplot);
                let logplotModel = utils.logplotToTreeConfig(logplot);
                let selectedLogplot = utils.getSelectedNode();
                selectedLogplot.children.push(logplotModel);
                utils.openLogplotTab(wiComponentService, logplotModel, function () {
                    let logplotName = 'logplot' + logplotModel.properties.idPlot;
                    let wiD3Ctrl = wiComponentService.getComponent(logplotName).getwiD3Ctrl();
                    wiD3Ctrl.addDepthTrack(function () {
                        wiD3Ctrl.addLogTrack('Lithology', function () {
                            wiD3Ctrl.addLogTrack('Gramma Ray', function () {
                                wiD3Ctrl.addLogTrack('Density', function () {
                                    wiD3Ctrl.addLogTrack('Neutron', function () {
                                        wiD3Ctrl.addLogTrack('Sonic', function () {
                                            wiD3Ctrl.addLogTrack('Resistivity', function () {
                                                wiD3Ctrl.addLogTrack('PHI_TOTAL');
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            })
            .catch(function (err) {
                exports.LithoPlusSyn_CurveButtonClicked.call(self);
            });
    });
};

exports.Syn_CurveButtonClicked = function () {
    const self = this;
    const wiComponentService = this.wiComponentService;
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let currentWell = utils.getCurrentWell();
    if (!currentWell) return;
    const ModalService = this.ModalService;
    const DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    const wiApiService = this.wiApiService;
    const $timeout = this.$timeout;
    let promptConfig = {
        title: '<span class="logplot-new-16x16"></span> Create New Log Plot',
        inputName: 'Name',
        input: 'SynCurves'
    };
    DialogUtils.promptDialog(ModalService, promptConfig, function (logplotName) {
        if(!logplotName) return;
        utils.createNewBlankLogPlot(wiComponentService, wiApiService, logplotName, "")
            .then(function (logplot) {
                console.log("Created new log plot", logplot);
                let logplotModel = utils.logplotToTreeConfig(logplot);
                let selectedLogplot = utils.getSelectedNode();
                selectedLogplot.children.push(logplotModel);
                utils.openLogplotTab(wiComponentService, logplotModel, function () {
                    let logplotName = 'logplot' + logplotModel.properties.idPlot;
                    let wiD3Ctrl = wiComponentService.getComponent(logplotName).getwiD3Ctrl();
                    wiD3Ctrl.addDepthTrack(function () {
                        wiD3Ctrl.addLogTrack('Lithology', function () {
                            wiD3Ctrl.addLogTrack('Gramma Ray', function () {
                                wiD3Ctrl.addLogTrack('Density', function () {
                                    wiD3Ctrl.addLogTrack('Neutron', function () {
                                        wiD3Ctrl.addLogTrack('Sonic');
                                    });
                                });
                            });
                        });
                    });
                });
            })
            .catch(function (err) {
                exports.Syn_CurveButtonClicked.call(self);
            });
    });
};

exports.ResultButtonClicked = function () {
    const self = this;
    const wiComponentService = this.wiComponentService;
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let currentWell = utils.getCurrentWell();
    if (!currentWell) return;
    const ModalService = this.ModalService;
    const DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    const wiApiService = this.wiApiService;
    const $timeout = this.$timeout;
    let promptConfig = {
        title: '<span class="logplot-new-16x16"></span> Create New Log Plot',
        inputName: 'Name',
        input: 'Result'
    };
    DialogUtils.promptDialog(ModalService, promptConfig, function (logplotName) {
        if(!logplotName) return;
        utils.createNewBlankLogPlot(wiComponentService, wiApiService, logplotName, "")
            .then(function (logplot) {
                console.log("Created new log plot", logplot);
                let logplotModel = utils.logplotToTreeConfig(logplot);
                let selectedLogplot = utils.getSelectedNode();
                selectedLogplot.children.push(logplotModel);
                utils.openLogplotTab(wiComponentService, logplotModel, function () {
                    let logplotName = 'logplot' + logplotModel.properties.idPlot;
                    let wiD3Ctrl = wiComponentService.getComponent(logplotName).getwiD3Ctrl();
                    wiD3Ctrl.addDepthTrack(function () {
                        wiD3Ctrl.addLogTrack('Lithology', function () {
                            wiD3Ctrl.addLogTrack('GR-DT-RHOB-NPHI', function () {
                                wiD3Ctrl.addLogTrack('Resistivity', function () {
                                    wiD3Ctrl.addDepthTrack(function () {
                                        wiD3Ctrl.addLogTrack('Total Porosity', function () {
                                            wiD3Ctrl.addLogTrack('Fracture Porosity', function () {
                                                wiD3Ctrl.addLogTrack('Water Saturation', function () {
                                                    wiD3Ctrl.addLogTrack('Permeability');
                                                })
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            })
            .catch(function (err) {
                exports.ResultButtonClicked.call(self);
            });
    });
};

exports.BlankCrossPlotButtonClicked = function () {
    const self = this;
    const wiComponentService = this.wiComponentService;
    const ModalService = this.ModalService;
    const DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    const wiApiService = this.wiApiService;
    const $timeout = this.$timeout;
    let currentWell = utils.getCurrentWell();
    if (!currentWell) return;
    let promptConfig = {
        title: 'Create New Crossplot',
        inputName: 'Crossplot Name',
        input: 'BlankCrossplot'
    }
    DialogUtils.promptDialog(ModalService, promptConfig, function (crossplotName) {
        if(!crossplotName) return;
        utils.createCrossplot(currentWell.properties.idWell, crossplotName, function (err, crossplotModel) {
            if (err) {
                exports.BlankCrossPlotButtonClicked.call(self);
            }
            else {
                utils.openCrossplotTab(crossplotModel);
            }
        });
    });
};

function newCrossPlotTemplate(templateCross, wiComponentService, ModalService) {
    console.log("Template Cross Plot clicked ", templateCross);
    const DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let currentWell = utils.getCurrentWell();
    if (!currentWell) return;
    let promptConfig = {
        title: 'Create New Crossplots Template',
        inputName: 'Crossplot Name',
        input: templateCross
    }
    DialogUtils.promptDialog(ModalService, promptConfig, function (crossplotName) {
        // console.log("CROSS NAME : ", crossplotName);
        if(!crossplotName) return;
        utils.createCrossplot(currentWell.properties.idWell, crossplotName, function (err, crossplotModel) {
            if (err) {
                newCrossPlotTemplate(templateCross, wiComponentService, ModalService);
            }
            else {
                utils.openCrossplotTab(crossplotModel);
            }
        }, templateCross);
    });
}

exports.SonicPHI_TOTALButtonClicked = function () {
    console.log('SonicPHI_TOTALButton is clicked');
    newCrossPlotTemplate("SonicPhi_total", this.wiComponentService, this.ModalService);
};

exports.NeutronDensityButtonClicked = function () {
    console.log('NeutronDensityButton is clicked');
    newCrossPlotTemplate("NeutronDensity", this.wiComponentService, this.ModalService);
};

exports.NeutronGammaButtonClicked = function () {
    console.log('NeutronGammaButton is clicked');
    newCrossPlotTemplate("NeutronGamma", this.wiComponentService, this.ModalService);
};

exports.SonicGammaButtonClicked = function () {
    console.log('SonicGammaButton is clicked');
    newCrossPlotTemplate("SonicGamma", this.wiComponentService, this.ModalService);
};

exports.NeuTronSonicButtonClicked = function () {
    console.log('NeuTronSonicButton is clicked');
    newCrossPlotTemplate("NeutronSonic", this.wiComponentService, this.ModalService);
};

exports.DensityGammaButtonClicked = function () {
    console.log('DenityGammaButton is clicked');
    newCrossPlotTemplate("DensityGamma", this.wiComponentService, this.ModalService);
};

exports.NeuTronRtButtonClicked = function () {
    console.log('NeuTronRtButton is clicked');
    newCrossPlotTemplate("NeutronResistivity", this.wiComponentService, this.ModalService);
};

exports.DensitySonicButtonClicked = function () {
    console.log('DensitySonicButton is clicked');
    newCrossPlotTemplate("DensitySonic", this.wiComponentService, this.ModalService);
};

exports.DensityRtButtonClicked = function () {
    console.log('DensityRtButton is clicked');
    newCrossPlotTemplate("DensityResistivity", this.wiComponentService, this.ModalService);
};

exports.SonicDensityButtonClicked = function () {
    console.log('SonicDensityButton is clicked');
    newCrossPlotTemplate("SonicDensity", this.wiComponentService, this.ModalService);
};

exports.SonicRtButtonClicked = function () {
    console.log('SonicRtButton is clicked');
    newCrossPlotTemplate("SonicResistivity", this.wiComponentService, this.ModalService);
};

exports.RtRx0ButtonClicked = function () {
    console.log('RtRx0Button is clicked');
    newCrossPlotTemplate("DeepResistivityInvadedZoneResistivity", this.wiComponentService, this.ModalService);
};

exports.PickettButtonClicked = function () {
    console.log('PickettButton is clicked');
    newCrossPlotTemplate("PickettPlot", this.wiComponentService, this.ModalService);
};

exports.BlankHistogramButtonClicked = function () {
    const self = this;
    console.log("Blank Hisogram clicked");
    const wiComponentService = this.wiComponentService;
    const ModalService = this.ModalService;
    const DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    const wiApiService = this.wiApiService;
    const $timeout = this.$timeout;
    let currentWell = utils.getCurrentWell();
    if (!currentWell) return;
    let promptConfig = {
        title: 'Create New Histogram',
        inputName: 'Histogram Name',
        input: 'BlankHistogram'
    }

    DialogUtils.promptDialog(ModalService, promptConfig, function (histogramName) {
        if(!histogramName) return;
        utils.createHistogram(currentWell.properties.idWell, null, histogramName)
            .then(function (histogram) {
            })
            .catch(function (err) {
                exports.BlankHistogramButtonClicked.call(self);
            });
    });
}

function newTemplateHistogram(name, templateHistogram, wiComponentService, ModalService, wiApiService, $timeout, callback) {
    console.log("Template Hisogram clicked ", templateHistogram);
    const DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let currentWell = utils.getCurrentWell();
    if (!currentWell) return;
    let promptConfig = {
        title: 'Create New Histogram From Template',
        inputName: 'Histogram Name',
        input: name
    }

    DialogUtils.promptDialog(ModalService, promptConfig, function (histogramName) {
        if(!histogramName) return;
        utils.createHistogram(currentWell.properties.idWell, null, histogramName, templateHistogram)
            .then(function (histogram) {
            })
            .catch(function (err) {
                newTemplateHistogram(histogramName, templateHistogram, wiComponentService, ModalService, wiApiService, $timeout, callback);
            });
    });
}

exports.GammaRayButtonClicked = function () {
    console.log('GammaRayButton is clicked');
    newTemplateHistogram("GR Histogram", "GammaRay", this.wiComponentService, this.ModalService, this.wiApiService, this.$timeout, function () {

    });

};

exports.SonicButtonClicked = function () {
    console.log('SonicButton is clicked');
    newTemplateHistogram("DT Histogram", "Sonic", this.wiComponentService, this.ModalService, this.wiApiService, this.$timeout, function () {

    });
};

exports.NeutronButtonClicked = function () {
    console.log('NeutronButton is clicked');
    newTemplateHistogram("NPHI Histogram", "Neutron", this.wiComponentService, this.ModalService, this.wiApiService, this.$timeout, function () {

    });
};

exports.DensityButtonClicked = function () {
    console.log('DensityButton is clicked');
    newTemplateHistogram("RHOB Histogram", "Density", this.wiComponentService, this.ModalService, this.wiApiService, this.$timeout, function () {

    });
};

exports.DeepResistivityButtonClicked = function () {
    console.log('DeepResistivityButton is clicked');
    newTemplateHistogram("LLD Histogram", "DeepResistivity", this.wiComponentService, this.ModalService, this.wiApiService, this.$timeout, function () {

    });
};


exports.SallowResistivityButtonClicked = function () {
    console.log('SallowResistivityButton is clicked');
    // newTemplateHistogram("LLS Histogram","ShallowResistivity", this.wiComponentService, this.ModalService, this.wiApiService, this.$timeout, function () {
    //
    // });
};

exports.PHI_TOTALButtonClicked = function () {
    console.log('PHI_TOTALButton is clicked');
    newTemplateHistogram("PHI_TOTAL Histogram", "Phi_total", this.wiComponentService, this.ModalService, this.wiApiService, this.$timeout, function () {

    });
};


exports.MSFLHistogramButtonClicked = function () {
    console.log('MSFLHistogramButton is clicked');
    newTemplateHistogram("MSFL Histogram", "ShadowResistivity", this.wiComponentService, this.ModalService, this.wiApiService, this.$timeout, function () {

    });
};

exports.AddCurveButtonClicked = function () {
    console.log('AddCurveButton is clicked');
    let self = this;
    let wiComponentService = this.wiComponentService;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    DialogUtils.addCurveDialog(this.ModalService);
};

exports.EditTextCurveButtonClicked = function () {
    console.log('EditTextCurveButton is clicked');
};

exports.CurveListing_EditButtonClicked = function () {
    let wiComponentService = this.wiComponentService;
    let layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
    layoutManager.putTabRight({
        id: 'curveListing',
        title: 'Table Curve Edit',
        tabIcon: 'curve-listing-16x16',
        componentState: {
            html: `<wi-curve-listing></wi-curve-listing>`,
            name: 'WCL',
            model: {
                type: "WCL",
                id: null
            }
        }
    })
};

exports.InteractiveCurveEditButtonClicked = function () {
    console.log('InteractiveCurveEditButton is clicked');
};

exports.InteractiveBaselineShiftButtonClicked = function () {
    console.log('InteractiveBaselineShiftButton is clicked');
};

exports.SplitCurvesButtonClicked = function () {
    console.log('SplitCurvesButton is clicked');
    let self = this;
    let wiComponentService = this.wiComponentService;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    DialogUtils.splitCurveDialog(this.ModalService, function (data) {
        console.log("splitCurve");
    });
};

exports.InteractiveCurveSplitButtonClicked = function () {
    console.log('InteractiveCurveSplitButton is clicked');

};

exports.MergeCurvesButtonClicked = function () {
    let self = this;
    let wiComponentService = this.wiComponentService;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    DialogUtils.mergeCurveDialog(this.ModalService, function (data) {
        console.log("mergeCurve");
    });
};

exports.CurvesHeaderButtonClicked = function () {
    console.log('CurvesHeaderButton is clicked');
};

exports.FillDataGapsButtonClicked = function () {
    console.log('FillDataGapsButton is clicked');
    let self = this;
    let wiComponentService = this.wiComponentService;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    DialogUtils.fillDataGapsDialog(this.ModalService, wiComponentService);
};

exports.CurveFilterButtonClicked = function () {
    console.log('CurveFilterButton is clicked');
    let wiComponentService = this.wiComponentService;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    DialogUtils.curveFilterDialog(this.ModalService, wiComponentService);
};

exports.CurveConvolutionButtonClicked = function () {
    console.log('CurveConvolutionButton is clicked');
    let self = this;
    let wiComponentService = this.wiComponentService;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    DialogUtils.curveConvolutionDialog(this.ModalService, wiComponentService);
};

exports.CurveDeconvolutionButtonClicked = function () {
    console.log('CurveDeconvolutionButton is clicked');
    let self = this;
    let wiComponentService = this.wiComponentService;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    DialogUtils.curveConvolutionDialog(this.ModalService, wiComponentService, true);
};

exports.CurveDerivativeButtonClicked = function () {
    console.log('CurveDerivativeButton is clicked');

    let self = this;
    let wiComponentService = this.wiComponentService;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    DialogUtils.curveDerivativeDialog(this.ModalService, wiComponentService);
};

exports.CurveRescaleButtonClicked = function () {
    console.log('CurveRescaleButton is clicked');
    let self = this;
    let wiComponentService = this.wiComponentService;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    DialogUtils.curveRescaleDialog(this.ModalService, function (data) {
        console.log("curveRescale");
    });
};

exports.CurveComrarisonButtonClicked = function () {
    console.log('CurveComrarisonButton is clicked');
    let self = this;
    let wiComponentService = this.wiComponentService;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    DialogUtils.curveComrarisonDialog(this.ModalService, function (data) {
        console.log("curveComrarision");
    });
};

exports.CurveAverageButtonClicked = function () {
    console.log('AboutButton is clicked');
    let self = this;
    let wiComponentService = this.wiComponentService;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    DialogUtils.curveAverageDialog(this.ModalService, function (data) {
        console.log("curveAverage");
    });
};

exports.FormationResistivityButtonClicked = function () {
    console.log('FormationResistivityButton is clicked');
    let self = this;
    let wiComponentService = this.wiComponentService;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    DialogUtils.formationResistivityDialog(this.ModalService, function (data) {
        console.log("formationResistivityDialog");
    });
};

exports.Badhole_Coal_SaltButtonClicked = function () {
    console.log('Badhole/Coal/SaltButton is clicked');
    let self = this;
    let wiComponentService = this.wiComponentService;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    DialogUtils.badholeCoalSaltDialog(this.ModalService, function (data) {
        console.log("Badhole_Coal_Salt");
    });
};


exports.UserFormulaButtonClicked = function () {
    console.log('UserFormulaButton is clicked');
    let self = this;
    let wiComponentService = this.wiComponentService;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    DialogUtils.userFormulaDialog(this.ModalService, function (data) {
        console.log("userFormula");
    });
};

exports.UserProgramButtonClicked = function () {
    console.log('UserProgramButton is clicked');
};

exports.PythonProgramButtonClicked = function () {
    console.log('PythonProgramButton is clicked');
};

exports.TVDConversionButtonClicked = function () {
    console.log('TVDConversionButton is clicked');
    let self = this;
    let wiComponentService = this.wiComponentService;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    DialogUtils.TVDConversionDialog(this.ModalService, wiComponentService);
};

exports.PCAAnalysisButtonClicked = function () {
    console.log('PCAAnalysisButton is clicked');
};

exports.Multi_LinearRegressionButtonClicked = function () {
    console.log('Multi-LinearRegressionButton is clicked');
};

exports.NeuralNetworkButtonClicked = function () {
    console.log('NeuralNetworkButton is clicked');
};

exports.EditZonesButtonClicked = function () {
    console.log('EditZonesButton is clicked');
};

exports.InputCurvesButtonClicked = function () {
    console.log('InputCurvesButton is clicked');
};

exports.InputFuidButtonClicked = function () {
    console.log('InputFuidButton is clicked');
};

exports.BuildMineralParametersButtonClicked = function () {
    console.log('BuildMineralParametersButton is clicked');
};

exports.InputMineralZonesButtonClicked = function () {
    console.log('InputMineralZonesButton is clicked');
};

exports.Multi_MineralSolverButtonClicked = function () {
    console.log('Multi-MineralSolverButton is clicked');
};

exports.ClayMineralsVolumeButtonClicked = function () {
    console.log('ClayMineralsVolumeButton is clicked');
};

exports.Fracture_VugPorosityButtonClicked = function () {
    console.log('Fracture-VugPorosityButton is clicked');
};

exports.OpenPorosityButtonClicked = function () {
    console.log('OpenPorosityButton is clicked');
};

exports.SecondaryPorosityButtonClicked = function () {
    console.log('SecondaryPorosityButton is clicked');
};

exports.FracturePorosityButtonClicked = function () {
    console.log('FracturePorosityButton is clicked');
};

exports.FilteringFractureButtonClicked = function () {
    console.log('FilteringFractureButton is clicked');
};

exports.MicroAndMacroPorosityButtonClicked = function () {
    console.log('Micro&MacroPorosityButton is clicked');
};

exports.WaterSaturationButtonClicked = function () {
    console.log('WaterSaturationButton is clicked');
};

exports.PermeabilityButtonClicked = function () {
    console.log('PermeabilityButton is clicked');
};

exports.CutoffandSummationButtonClicked = function () {
    console.log('CutoffandSummationButton is clicked');
};

exports.FilteringButtonClicked = function () {
    console.log('FilteringButton is clicked');
};

exports.BasicAnalysisButtonClicked = function () {
    console.log('BasicAnalysisButton is clicked');
};

exports.ClayVolumeGammaRayButtonClicked = function() {
    console.log('ClayVolumeGammaRayButton is clicked');
    let layoutManager = this.wiComponentService.getComponent(this.wiComponentService.LAYOUT_MANAGER);
    let listSpec = this.wiComponentService.getComponent(this.wiComponentService.TASKSPEC);
    // let spec = listSpec.find(sp => sp.name == 'Gamma Ray' && sp.group == 'Clay Volume');
    let spec = listSpec[0];
    const now = Date.now();
    layoutManager.putTabRight({
        id: 'wiTask' + now,
        title: 'Clay Volume Gamma Ray',
        tabIcon: 'workflow-16x16',
        componentState: {
            html: `<wi-task name="Clay Volume Gamma Ray" id="${now}" task-config="spec.content"></wi-task>`,
            name: 'wiTask' + now,
            spec: spec
        }
    })
}

exports.ClayVolumeNeutron_DensityButtonClicked = function() {
    console.log('ClayVolumeNeutron-DensityButton is clicked');
}

exports.ClayVolumeNeutron_SonicButtonClicked = function() {
    console.log('ClayVolumeNeutron-SonicButton is clicked');
}

exports.ClayVolumeDensity_SonicButtonClicked = function() {
    console.log('ClayVolumeDensity-SonicButton is clicked');
}

exports.ClayVolumeResistivityButtonClicked = function() {
    console.log('ClayVolumeResistivityButton is clicked');
}

exports.ClayVolumeSpontaneouspotentialButtonClicked = function() {
    console.log('ClayVolumeSpontaneouspotentialButton is clicked');
}

exports.ClayVolumeThermalNeutronButtonClicked = function() {
    console.log('ClayVolumeThermalNeutronButton is clicked');
}

exports.ClayVolumePotassiumButtonClicked = function() {
    console.log('ClayVolumePotassiumButton is clicked');
}

exports.ClayVolumeThoriumButtonClicked = function() {
    console.log('ClayVolumeThoriumButton is clicked');
}

exports.ClayVolumeFinalButtonClicked = function() {
    console.log('ClayVolumeFinalButton is clicked');
}

exports.PorosityDensityButtonClicked = function() {
    console.log('PorosityDensityButton is clicked');
    let layoutManager = this.wiComponentService.getComponent(this.wiComponentService.LAYOUT_MANAGER);
    let listSpec = this.wiComponentService.getComponent(this.wiComponentService.TASKSPEC);
    // let spec = listSpec.find(sp => sp.name == 'Density' && sp.group == 'Porosity');
    let spec = listSpec[1];
    const now = Date.now();
    layoutManager.putTabRight({
        id: 'wiTask' + now,
        title: 'Porosity Density',
        tabIcon: 'workflow-16x16',
        componentState: {
            html: `<wi-task name="Porosity Density" id="${now}" task-config="spec"></wi-task>`,
            name: 'wiTask' + now,
            spec: spec
        }
    })
}

exports.PorosityNeutronButtonClicked = function() {
    console.log('PorosityNeutronButton is clicked');
}

exports.PorositySonicButtonClicked = function() {
    console.log('PorositySonicButton is clicked');
}

exports.PorosityNeutron_DensityButtonClicked = function() {
    console.log('PorosityNeutron-DensityButton is clicked');
}

exports.PorosityNeutron_SonicButtonClicked = function() {
    console.log('PorosityNeutron-SonicButton is clicked');
}

exports.PorosityFinalButtonClicked = function() {
    console.log('PorosityFinalButton is clicked');
}

exports.CutoffandSummationButtonClicked = function () {
    console.log('CutoffandSummationButton is clicked');
};

exports.HelpButtonClicked = function () {
    console.log('HelpButton is clicked');
};

exports.AboutButtonClicked = function () {
    console.log('AboutButton is clicked');
    let self = this;
    let wiComponentService = this.wiComponentService;
    let DialogUtils = wiComponentService.getComponent('DIALOG_UTILS');
    DialogUtils.aboutDialog(this.ModalService, function (data) {
        console.log("Well Insight");
    });
};

exports.UnlockButtonClicked = function () {
    console.log('UnlockButton is clicked');
};

exports.BlankComboviewButtonClicked = function () {
    const self = this;
    console.log('BlankComboviewButtonClicked');
    const wiComponentService = this.wiComponentService;
    const ModalService = this.ModalService;
    const DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    const wiApiService = this.wiApiService;
    const $timeout = this.$timeout;

    let selectedNode = utils.getSelectedNode();
    if (selectedNode.type != 'comboviews') return;
    let promptConfig = {
        title: 'Create New Combined Plot',
        inputName: 'Combined Plot Name',
        input: 'NewCombinedPlot'
    }

    DialogUtils.promptDialog(ModalService, promptConfig, function (combinedPlotName) {
        if(!combinedPlotName) return;
        utils.createComboview(selectedNode.properties.idWell, combinedPlotName, null)
            .then(function (combinedPlot) {
                let defaultToolBox = [
                    {
                        name: 'Default Tool 1',
                        color: 'red',
                        idCombinedBox: combinedPlot.idCombinedBox
                    },
                    {
                        name: 'Default Tool 2',
                        color: 'green',
                        idCombinedBox: combinedPlot.idCombinedBox
                    },
                    {
                        name: 'Default Tool 3',
                        color: 'blue',
                        idCombinedBox: combinedPlot.idCombinedBox
                    }
                ];
                async.eachSeries(defaultToolBox, function (tool, nextTool) {
                    wiApiService.createCombinedBoxTool(tool, function (data) {
                        if (data) {
                            let reqSelection = {
                                idCombinedBox: data.idCombinedBox,
                                idCombinedBoxTool: data.idCombinedBoxTool,
                                data: []
                            }
                            wiApiService.createSelectionTool(reqSelection, function (returnedSelection) {
                                nextTool();
                            });
                        } else {
                            nextTool();
                        }
                    });
                }, function () {
                    let comboviewModel = utils.comboviewToTreeConfig(combinedPlot);
                    utils.refreshProjectState().then(function () {
                        utils.openComboviewTab(comboviewModel);
                    });
                });
            })
            .catch(function (err) {
                utils.error(combinedPlotName + " existed!", function () {
                    exports.BlankComboviewButtonClicked.call(self);
                });
            });
    });
}
exports.MigrationButtonClicked = function () {
    let wiComponentService = this.wiComponentService;
    let layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
    layoutManager.putTabRight({
        id: 'curveMigration',
        title: 'Table Curve Migration',
        tabIcon: 'migration_32x32',
        componentState: {
            html: `<wi-migration></wi-migration>`,
            name: 'wiMigration'
        }
    })
}
