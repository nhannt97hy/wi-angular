exports.NewProjectButtonClicked = function () {
    let self = this;
    let wiComponentService = this.wiComponentService;
    let ModalService = this.ModalService;
    let DialogUtils = wiComponentService.getComponent('DIALOG_UTILS');
    DialogUtils.newProjectDialog(ModalService, function (data) {
        self.wiApiService.createProject(data, function (response) {
            if(!response.name){
                DialogUtils.errorMessageDialog(ModalService, "Project: " + data.name + " existed!");
            }else{
                let utils = self.wiComponentService.getComponent('UTILS');
                utils.projectOpen(self.wiComponentService, response);
            }
        });
    });
};

exports.OpenProjectButtonClicked = function () {
    let self = this;
    let wiComponentService = this.wiComponentService;
    let DialogUtils = wiComponentService.getComponent('DIALOG_UTILS');
    DialogUtils.openProjectDialog(this.ModalService, function (projectData) {
        let utils = self.wiComponentService.getComponent('UTILS');
        utils.projectOpen(self.wiComponentService, projectData);
    });
};

exports.CloseProjectButtonClicked = function () {
    let self = this;
    let utils = this.wiComponentService.getComponent('UTILS');
    let DialogUtils = this.wiComponentService.getComponent('DIALOG_UTILS');
    DialogUtils.confirmDialog(this.ModalService, "Close project", "Are you sure to close project?", function (yesOrNo) {
        if (yesOrNo) {
            utils.projectClose(self.wiComponentService);
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

exports.SaveProjectButtonClicked = function () {
    console.log('SaveProjectButton is clicked');
};

exports.SaveProjectAsButtonClicked = function () {
    console.log('SaveProjectAsButton is clicked');
};

exports.ProjectButtonClicked = function () {
    console.log('ProjectButton is clicked');
    let wiComponentService = this.wiComponentService;
    let layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);

    if (!layoutManager.isComponentExist('explorer-block')) {
        layoutManager.putLeft('explorer-block', 'Project');

        wiComponentService.emit(wiComponentService.PROJECT_LOADED_EVENT);
    }
};

exports.WorkflowsButtonClicked = function () {
    console.log('WorkflowsButton is clicked');
};

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
            window.localStorage.removeItem('username');
            window.localStorage.removeItem('password');
            window.localStorage.removeItem('rememberAuth');
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

exports.OpenTemplateButtonClicked = function () {
    let self = this;
    let utils = this.wiComponentService.getComponent(this.wiComponentService.UTILS);
    let DialogUtils = this.wiComponentService.getComponent('DIALOG_UTILS');
    let selectedNode = utils.getSelectedNode();
    DialogUtils.OpenTemplateDialog(this.ModalService, selectedNode);
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
    const ModalService = this.ModalService;
    const DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    const wiApiService = this.wiApiService;
    const $timeout = this.$timeout;
    DialogUtils.newBlankLogplotDialog(ModalService, function (logplotName) {
        utils.createNewBlankLogPlot(wiComponentService, wiApiService, logplotName, "")
            .then(function(logplot) {
                console.log("Created new log plot", logplot);
                let logplotModel = utils.logplotToTreeConfig(logplot);
                let selectedLogplot = utils.getSelectedNode();
                selectedLogplot.children.push(logplotModel);
                utils.openLogplotTab(wiComponentService, logplotModel, function() {
                    let logplotName = 'logplot' + logplotModel.properties.idPlot;
                    let wiD3Ctrl = wiComponentService.getComponent(logplotName).getwiD3Ctrl();
                    wiD3Ctrl.addDepthTrack(function() {
                        wiD3Ctrl.addLogTrack('Track 1');
                    });
                });
            })
            .catch(function(err) {
                utils.error(logplotName + " existed!", function () {
                    exports.BlankLogplotButtonClicked.call(self);
                });
            });
    });
};

exports.TrippleComboButtonClicked = function () {
    const self = this;
    const wiComponentService = this.wiComponentService;
    const ModalService = this.ModalService;
    const DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    const wiApiService = this.wiApiService;
    const $timeout = this.$timeout;
    let promptConfig = {
        title: '<span class="logplot-new-16x16"></span> Create New Log Plot',
        inputName: 'Name',
        input: 'TripleCombo'
    };
    DialogUtils.promptDialog(ModalService, promptConfig, function (logplotName) {
        console.log(logplotName);
        utils.createNewBlankLogPlot(wiComponentService, wiApiService, logplotName, "TripleCombo")
            .then(function (logplot) {
                console.log("Created new log plot", logplot);
                let logplotModel = utils.logplotToTreeConfig(logplot);
                let selectedLogplot = utils.getSelectedNode();
                selectedLogplot.children.push(logplotModel);
                utils.openLogplotTab(wiComponentService, logplotModel, function() {
                    if(logplot.familiesWithoutCurve.length > 0){
                        let message = "Not Found Curves in families : ";
                        logplot.familiesWithoutCurve.forEach(function(r){
                            message += r + "<br>";
                        });
                        setTimeout(function(){
                            DialogUtils.warningMessageDialog(ModalService, message);
                        }, 1000);
                    }
                });
            })
            .catch(function (err) {
                utils.error(logplotName + " existed!", function () {
                    exports.TrippleComboButtonClicked.call(self);
                });
            });
    });
};

exports.DensityNeutronButtonClicked = function () {
    const self = this;
    const wiComponentService = this.wiComponentService;
    const ModalService = this.ModalService;
    const DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    const wiApiService = this.wiApiService;
    const $timeout = this.$timeout;
    let promptConfig = {
        title: '<span class="logplot-new-16x16"></span> Create New Log Plot',
        inputName: 'Name',
        input: 'DensityNeutron'
    };
    DialogUtils.promptDialog(ModalService, promptConfig, function (logplotName) {
        console.log(logplotName);
        utils.createNewBlankLogPlot(wiComponentService, wiApiService, logplotName, "DensityNeutron")
            .then(function (logplot) {
                console.log("Created new log plot", logplot);
                let logplotModel = utils.logplotToTreeConfig(logplot);
                let selectedLogplot = utils.getSelectedNode();
                selectedLogplot.children.push(logplotModel);
                utils.openLogplotTab(wiComponentService, logplotModel, function() {
                    if(logplot.familiesWithoutCurve.length > 0){
                        let message = "Not Found Curves in families : ";
                        logplot.familiesWithoutCurve.forEach(function(r){
                            message += r + "<br>";
                        });
                        setTimeout(function(){
                            DialogUtils.warningMessageDialog(ModalService, message);
                        }, 1000);
                    }
                });
            })
            .catch(function (err) {
                utils.error(logplotName + " existed!", function () {
                    exports.DensityNeutronButtonClicked.call(self);
                });
            });
    });
};

exports.ResistivitySonicButtonClicked = function () {
    const self = this;
    const wiComponentService = this.wiComponentService;
    const ModalService = this.ModalService;
    const DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    const wiApiService = this.wiApiService;
    const $timeout = this.$timeout;
    let promptConfig = {
        title: '<span class="logplot-new-16x16"></span> Create New Log Plot',
        inputName: 'Name',
        input: 'ResistivitySonic'
    };
    DialogUtils.promptDialog(ModalService, promptConfig, function (logplotName) {
        console.log(logplotName);
        utils.createNewBlankLogPlot(wiComponentService, wiApiService, logplotName, "ResistivitySonic")
            .then(function (logplot) {
                console.log("Created new log plot", logplot);
                let logplotModel = utils.logplotToTreeConfig(logplot);
                let selectedLogplot = utils.getSelectedNode();
                selectedLogplot.children.push(logplotModel);
                utils.openLogplotTab(wiComponentService, logplotModel, function() {
                    if(logplot.familiesWithoutCurve.length > 0){
                        let message = "Not Found Curves in families : ";
                        logplot.familiesWithoutCurve.forEach(function(r){
                            message += r + "<br>";
                        });
                        setTimeout(function(){
                            DialogUtils.warningMessageDialog(ModalService, message);
                        }, 1000);
                    }
                });
            })
            .catch(function (err) {
                utils.error(logplotName + " existed!", function () {
                    exports.ResistivitySonicButtonClicked.call(self);
                });
            });
    });
};

exports.TriTracksBlankButtonClicked = function () {
    const self = this;
    const wiComponentService = this.wiComponentService;
    const ModalService = this.ModalService;
    const DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    const wiApiService = this.wiApiService;
    const $timeout = this.$timeout;
    let promptConfig = {
        title: '<span class="logplot-new-16x16"></span> Create New Log Plot',
        inputName: 'Name',
        input: '3TrackBlank'
    };
    DialogUtils.promptDialog(ModalService, promptConfig, function (logplotName) {
        console.log(logplotName);
        utils.createNewBlankLogPlot(wiComponentService, wiApiService, logplotName, "")
            .then(function (logplot) {
                console.log("Created new log plot", logplot);
                let logplotModel = utils.logplotToTreeConfig(logplot);
                let selectedLogplot = utils.getSelectedNode();
                selectedLogplot.children.push(logplotModel);
                utils.openLogplotTab(wiComponentService, logplotModel, function() {
                    let logplotName = 'logplot' + logplotModel.properties.idPlot;
                    let wiD3Ctrl = wiComponentService.getComponent(logplotName).getwiD3Ctrl();
                    wiD3Ctrl.addDepthTrack(function () {
                        wiD3Ctrl.addLogTrack('Track 1', function() {
                            wiD3Ctrl.addLogTrack('Track 2', function() {
                                wiD3Ctrl.addLogTrack('Track 3');
                            });
                        });
                    });
                });
            })
            .catch(function (err) {
                utils.error(logplotName + " existed!", function () {
                    exports.TriTracksBlankButtonClicked.call(self);
                });
            });
    });
};

exports.InputCurveButtonClicked = function () {
    const self = this;
    const wiComponentService = this.wiComponentService;
    const ModalService = this.ModalService;
    const DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    const wiApiService = this.wiApiService;
    const $timeout = this.$timeout;
    let promptConfig = {
        title: '<span class="logplot-new-16x16"></span> Create New Log Plot',
        inputName: 'Name',
        input: 'InputCurves'
    };
    DialogUtils.promptDialog(ModalService, promptConfig, function (logplotName) {
        console.log(logplotName);
        utils.createNewBlankLogPlot(wiComponentService, wiApiService, logplotName, "")
            .then(function (logplot) {
                console.log("Created new log plot", logplot);
                let logplotModel = utils.logplotToTreeConfig(logplot);
                let selectedLogplot = utils.getSelectedNode();
                selectedLogplot.children.push(logplotModel);
                utils.openLogplotTab(wiComponentService, logplotModel, function() {
                    let logplotName = 'logplot' + logplotModel.properties.idPlot;
                    let wiD3Ctrl = wiComponentService.getComponent(logplotName).getwiD3Ctrl();
                    wiD3Ctrl.addDepthTrack(function () {
                        wiD3Ctrl.addLogTrack('Grammaray', function() {
                            wiD3Ctrl.addLogTrack('Density', function() {
                                wiD3Ctrl.addLogTrack('Neutron', function() {
                                    wiD3Ctrl.addLogTrack('Sonic');
                                });
                            });
                        });
                    });
                });
            })
            .catch(function (err) {
                utils.error(logplotName + " existed!", function () {
                    exports.InputCurveButtonClicked.call(self);
                });
            });
    });
};

exports.LithoPlusSyn_CurveButtonClicked = function () {
    const self = this;
    const wiComponentService = this.wiComponentService;
    const ModalService = this.ModalService;
    const DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    const wiApiService = this.wiApiService;
    const $timeout = this.$timeout;
    let promptConfig = {
        title: '<span class="logplot-new-16x16"></span> Create New Log Plot',
        inputName: 'Name',
        input: 'Lithosyn'
    };
    DialogUtils.promptDialog(ModalService, promptConfig, function (logplotName) {
        console.log(logplotName);
        utils.createNewBlankLogPlot(wiComponentService, wiApiService, logplotName, "")
            .then(function (logplot) {
                console.log("Created new log plot", logplot);
                let logplotModel = utils.logplotToTreeConfig(logplot);
                let selectedLogplot = utils.getSelectedNode();
                selectedLogplot.children.push(logplotModel);
                utils.openLogplotTab(wiComponentService, logplotModel, function() {
                    let logplotName = 'logplot' + logplotModel.properties.idPlot;
                    let wiD3Ctrl = wiComponentService.getComponent(logplotName).getwiD3Ctrl();
                    wiD3Ctrl.addDepthTrack(function () {
                        wiD3Ctrl.addLogTrack('Lithology', function() {
                            wiD3Ctrl.addLogTrack('Gramma Ray', function() {
                                wiD3Ctrl.addLogTrack('Density', function() {
                                    wiD3Ctrl.addLogTrack('Neutron', function() {
                                        wiD3Ctrl.addLogTrack('Sonic', function() {
                                            wiD3Ctrl.addLogTrack('Resistivity', function() {
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
                utils.error(logplotName + " existed!", function () {
                    exports.LithoPlusSyn_CurveButtonClicked.call(self);
                });
            });
    });
};

exports.Syn_CurveButtonClicked = function () {
    const self = this;
    const wiComponentService = this.wiComponentService;
    const ModalService = this.ModalService;
    const DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    const wiApiService = this.wiApiService;
    const $timeout = this.$timeout;
    let promptConfig = {
        title: '<span class="logplot-new-16x16"></span> Create New Log Plot',
        inputName: 'Name',
        input: 'SynCurves'
    };
    DialogUtils.promptDialog(ModalService, promptConfig, function (logplotName) {
        console.log(logplotName);
        utils.createNewBlankLogPlot(wiComponentService, wiApiService, logplotName, "")
            .then(function (logplot) {
                console.log("Created new log plot", logplot);
                let logplotModel = utils.logplotToTreeConfig(logplot);
                let selectedLogplot = utils.getSelectedNode();
                selectedLogplot.children.push(logplotModel);
                utils.openLogplotTab(wiComponentService, logplotModel, function() {
                    let logplotName = 'logplot' + logplotModel.properties.idPlot;
                    let wiD3Ctrl = wiComponentService.getComponent(logplotName).getwiD3Ctrl();
                    wiD3Ctrl.addDepthTrack(function () {
                        wiD3Ctrl.addLogTrack('Lithology', function() {
                            wiD3Ctrl.addLogTrack('Gramma Ray', function() {
                                wiD3Ctrl.addLogTrack('Density', function() {
                                    wiD3Ctrl.addLogTrack('Neutron', function() {
                                        wiD3Ctrl.addLogTrack('Sonic');
                                    });
                                });
                            });
                        });
                    });
                });
            })
            .catch(function (err) {
                utils.error(logplotName + " existed!", function () {
                    exports.Syn_CurveButtonClicked.call(self);
                });
            });
    });
};

exports.ResultButtonClicked = function () {
    const self = this;
    const wiComponentService = this.wiComponentService;
    const ModalService = this.ModalService;
    const DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    const wiApiService = this.wiApiService;
    const $timeout = this.$timeout;
    let promptConfig = {
        title: '<span class="logplot-new-16x16"></span> Create New Log Plot',
        inputName: 'Name',
        input: 'Result'
    };
    DialogUtils.promptDialog(ModalService, promptConfig, function (logplotName) {
        console.log(logplotName);
        utils.createNewBlankLogPlot(wiComponentService, wiApiService, logplotName, "")
            .then(function (logplot) {
                console.log("Created new log plot", logplot);
                let logplotModel = utils.logplotToTreeConfig(logplot);
                let selectedLogplot = utils.getSelectedNode();
                selectedLogplot.children.push(logplotModel);
                utils.openLogplotTab(wiComponentService, logplotModel, function() {
                    let logplotName = 'logplot' + logplotModel.properties.idPlot;
                    let wiD3Ctrl = wiComponentService.getComponent(logplotName).getwiD3Ctrl();
                    wiD3Ctrl.addDepthTrack(function () {
                        wiD3Ctrl.addLogTrack('Lithology', function() {
                            wiD3Ctrl.addLogTrack('GR-DT-RHOB-NPHI', function() {
                                wiD3Ctrl.addLogTrack('Resistivity', function() {
                                    wiD3Ctrl.addDepthTrack(function () {
                                        wiD3Ctrl.addLogTrack('Total Porosity', function() {
                                            wiD3Ctrl.addLogTrack('Fracture Porosity', function() {
                                                wiD3Ctrl.addLogTrack('Water Saturation', function() {
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
                utils.error(logplotName + " existed!", function () {
                    exports.ResultButtonClicked.call(self);
                });
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
    let selectedNode = utils.getSelectedNode();
    if (selectedNode.type != 'crossplots') return;
    let promptConfig = {
        title: 'Create New Crossplot',
        inputName: 'Crossplot Name',
        input: 'BlankCrossplot'
    }
    DialogUtils.promptDialog(ModalService, promptConfig, function (crossplotName) {
        utils.createCrossplot(selectedNode.properties.idWell, crossplotName, function (wiCrossplotCtrl) {
            const crossPlotModel = wiCrossplotCtrl.crossplotModel;
            const pointSetProps = {
                idCrossPlot: wiCrossplotCtrl.id,
                idWell: selectedNode.properties.idWell,
                majorX: 5,
                minorX: 5,
                majorY: 5,
                minorY: 5,
            }
            utils.createPointSet(pointSetProps, function (pointSet) {
                let wiD3CrossplotCtrl = wiCrossplotCtrl.getWiD3CrossplotCtrl();
                wiD3CrossplotCtrl.createVisualizeCrossplot(null, null, {
                    name: crossplotName,
                    idPointSet: pointSet.idPointSet,
                    idCrossPlot: wiCrossplotCtrl.id,
                    idWell: selectedNode.properties.idWell,
                    pointSet: pointSet
                });
            })
        })
            .then(function (crossplot) {
            })
            .catch(function (err) {
                utils.error(crossplotName + " existed!", function () {
                    exports.BlankCrossPlotButtonClicked.call(self);
                });
            });
    });
};

function newCrossPlotTemplate(templateCross, wiComponentService, ModalService, wiApiService, $timeout, callback) {
    console.log("Template Cross Plot clicked ", templateCross);
    const DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let selectedNode = utils.getSelectedNode();
    if (selectedNode.type != 'crossplots') return;
    let promptConfig = {
        title: 'Create New Crossplots Template',
        inputName: 'Crossplot Name',
        input: templateCross
    }
    DialogUtils.promptDialog(ModalService, promptConfig, function (crossplotName) {
        console.log("CROSS NAME : ", crossplotName);
        utils.createCrossplot(selectedNode.properties.idWell, crossplotName, function(){
        }, templateCross)
            .then(function (crossplot) {
                callback(crossplot);
            })
            .catch(function (err) {
                utils.error(crossplotName + " existed!", function () {
                    newCrossPlotTemplate(templateCross, wiComponentService, ModalService, wiApiService, $timeout, callback);
                });
            });
    });
}

exports.SonicPHI_TOTALButtonClicked = function () {
    console.log('SonicPHI_TOTALButton is clicked');
    newCrossPlotTemplate("SonicPhi_total", this.wiComponentService, this.ModalService, this.wiApiService, this.$timeout, function () {

    });
};

exports.NeutronDensityButtonClicked = function () {
    console.log('NeutronDensityButton is clicked');
    newCrossPlotTemplate("NeutronDensity", this.wiComponentService, this.ModalService, this.wiApiService, this.$timeout, function () {

    });
};

exports.NeutronGammaButtonClicked = function () {
    console.log('NeutronGammaButton is clicked');
    newCrossPlotTemplate("NeutronGamma", this.wiComponentService, this.ModalService, this.wiApiService, this.$timeout, function () {

    });
};

exports.SonicGammaButtonClicked = function () {
    console.log('SonicGammaButton is clicked');
    newCrossPlotTemplate("SonicGamma", this.wiComponentService, this.ModalService, this.wiApiService, this.$timeout, function () {

    });
};

exports.NeuTronSonicButtonClicked = function () {
    console.log('NeuTronSonicButton is clicked');
    newCrossPlotTemplate("NeutronSonic", this.wiComponentService, this.ModalService, this.wiApiService, this.$timeout, function () {

    });
};

exports.DensityGammaButtonClicked = function () {
    console.log('DenityGammaButton is clicked');
    newCrossPlotTemplate("DensityGamma", this.wiComponentService, this.ModalService, this.wiApiService, this.$timeout, function () {

    });
};

exports.NeuTronRtButtonClicked = function () {
    console.log('NeuTronRtButton is clicked');
    newCrossPlotTemplate("NeutronResistivity", this.wiComponentService, this.ModalService, this.wiApiService, this.$timeout, function () {

    });
};

exports.DensitySonicButtonClicked = function () {
    console.log('DensitySonicButton is clicked');
    newCrossPlotTemplate("DensitySonic", this.wiComponentService, this.ModalService, this.wiApiService, this.$timeout, function () {

    });
};

exports.DensityRtButtonClicked = function () {
    console.log('DensityRtButton is clicked');
    newCrossPlotTemplate("DensityResistivity", this.wiComponentService, this.ModalService, this.wiApiService, this.$timeout, function () {

    });
};

exports.SonicDensityButtonClicked = function () {
    console.log('SonicDensityButton is clicked');
    newCrossPlotTemplate("SonicDensity", this.wiComponentService, this.ModalService, this.wiApiService, this.$timeout, function () {

    });
};

exports.SonicRtButtonClicked = function () {
    console.log('SonicRtButton is clicked');
    newCrossPlotTemplate("SonicResistivity", this.wiComponentService, this.ModalService, this.wiApiService, this.$timeout, function () {

    });
};

exports.RtRx0ButtonClicked = function () {
    console.log('RtRx0Button is clicked');
    newCrossPlotTemplate("DeepResistivityShallowResistivity", this.wiComponentService, this.ModalService, this.wiApiService, this.$timeout, function () {

    });
};

exports.PickettButtonClicked = function () {
    console.log('PickettButton is clicked');
    newCrossPlotTemplate("PickettPlot", this.wiComponentService, this.ModalService, this.wiApiService, this.$timeout, function () {

    });
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
    let currentWell = utils.getSelectedPath().find(node => node.type == 'well');
    if (!currentWell) {
        utils.error('Please choose a well');
        return;
    }
    let histogramsNode = utils.getStaticNode('histograms');
    let promptConfig = {
        title: 'Create New Histogram',
        inputName: 'Histogram Name',
        input: 'BlankHistogram'
    }
    DialogUtils.promptDialog(ModalService, promptConfig, function (histogramName) {
        utils.createHistogram(histogramsNode.properties.idWell, null, histogramName)
            .then(function (histogram) {
            })
            .catch(function (err) {
                utils.error(histogramName + " existed!", function () {
                    exports.BlankHistogramButtonClicked.call(self);
                });
            });
    });
}

function newTemplateHistogram(name, templateHistogram, wiComponentService, ModalService, wiApiService, $timeout, callback){
    console.log("Template Hisogram clicked ", templateHistogram);
    const DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let currentWell = utils.getSelectedPath().find(node => node.type == 'well');
    if (!currentWell) {
        utils.error('Please choose a well');
        return;
    }
    let histogramsNode = utils.getStaticNode('histograms');
    let promptConfig = {
        title: 'Create New Histogram Template',
        inputName: 'Histogram Name',
        input: name
    }
    DialogUtils.promptDialog(ModalService, promptConfig, function (histogramName) {
        utils.createHistogram(histogramsNode.properties.idWell, null, histogramName, templateHistogram)
            .then(function (histogram) {
            })
            .catch(function (err) {
                utils.error(histogramName + " existed!", function () {
                    newTemplateHistogram(templateHistogram, wiComponentService, ModalService, wiApiService, $timeout, callback);
                });
            });
    });
}

exports.PHI_TOTALButtonClicked = function () {
    console.log('PHI_TOTALButton is clicked');
    newTemplateHistogram("PHI_TOTAL Histogram", "Phi_total", this.wiComponentService, this.ModalService, this.wiApiService, this.$timeout, function () {

    });
};

exports.GammaRayButtonClicked = function () {
    console.log('GammaRayButton is clicked');
    newTemplateHistogram("GR Histogram", "GammaRay", this.wiComponentService, this.ModalService, this.wiApiService, this.$timeout, function () {

    });

};

exports.NeutronButtonClicked = function () {
    console.log('NeutronButton is clicked');
    newTemplateHistogram("NPHI Histogram", "Neutron", this.wiComponentService, this.ModalService, this.wiApiService, this.$timeout, function () {

    });
};

exports.DensityButtonClicked = function () {
    console.log('DensityButton is clicked');
    newTemplateHistogram("DT Histogram" ,"Sonic", this.wiComponentService, this.ModalService, this.wiApiService, this.$timeout, function () {

    });
};

exports.SonicButtonClicked = function () {
    console.log('SonicButton is clicked');
    newTemplateHistogram("RHBO Histogram","Density", this.wiComponentService, this.ModalService, this.wiApiService, this.$timeout, function () {

    });
};

exports.SallowResistivityButtonClicked = function () {
    console.log('SallowResistivityButton is clicked');
    newTemplateHistogram("MSFL Histogram","ShallowResistivity", this.wiComponentService, this.ModalService, this.wiApiService, this.$timeout, function () {

    });
};

exports.DeepResistivityButtonClicked = function () {
    console.log('DeepResistivityButton is clicked');
    newTemplateHistogram("LLD Histogram", "DeepResistivity", this.wiComponentService, this.ModalService, this.wiApiService, this.$timeout, function () {

    });
};

exports.MSFLHistogramButtonClicked = function () {
    console.log('MSFLHistogramButton is clicked');
    newTemplateHistogram("MSFL Histogram", "ShallowResistivity", this.wiComponentService, this.ModalService, this.wiApiService, this.$timeout, function () {

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
    console.log('CurveListing/EditButton is clicked');
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
     DialogUtils.fillDataGapsDialog(this.ModalService);
};

exports.CurveFilterButtonClicked = function () {
    console.log('CurveFilterButton is clicked');
    let self = this;
    let wiComponentService = this.wiComponentService;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    DialogUtils.curveFilterDialog(this.ModalService);
};

exports.CurveConvolutionButtonClicked = function () {
    console.log('CurveConvolutionButton is clicked');
    let self = this;
    let wiComponentService = this.wiComponentService;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    DialogUtils.curveConvolutionDialog(this.ModalService);
};

exports.CurveDeconvolutionButtonClicked = function () {
    console.log('CurveDeconvolutionButton is clicked');
    let self = this;
    let wiComponentService = this.wiComponentService;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    DialogUtils.curveConvolutionDialog(this.ModalService, true);
};

exports.CurveDerivativeButtonClicked = function () {
    console.log('CurveDerivativeButton is clicked');

    let self = this;
    let wiComponentService = this.wiComponentService;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    DialogUtils.curveDerivativeDialog(this.ModalService);
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
        console.log("curveAverage");
    });
};

exports.Badhole_Coal_SaltButtonClicked = function () {
    console.log('Badhole/Coal/SaltButton is clicked');
};

exports.UserFormulaButtonClicked = function () {
    console.log('UserFormulaButton is clicked');
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
    DialogUtils.TVDConversionDialog(this.ModalService, function (data) {
        console.log("TVD");
    });
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

exports.ClayVolumeButtonClicked = function () {
    console.log('ClayVolumeButton is clicked');
};

exports.PorosityAndWaterSaturationButtonClicked = function () {
    console.log('Porosity&WaterSaturationButton is clicked');
};

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
