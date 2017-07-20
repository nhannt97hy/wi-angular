exports.NewProjectButtonClicked = function () {
    console.log('NewProjectButton is clicked ');
    let self = this;
    let wiComponentService = this.wiComponentService;
    let DialogUtils = wiComponentService.getComponent('DIALOG_UTILS');
    DialogUtils.newProjectDialog(this.ModalService, function (data) {
        let utils = self.wiComponentService.getComponent('UTILS');
        utils.projectOpen(self.wiComponentService, data);
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
    console.log('CloseProjectButton is clicked');
    let utils = this.wiComponentService.getComponent('UTILS');
    let DialogUtils = this.wiComponentService.getComponent('DIALOG_UTILS');
    DialogUtils.confirmDialog(this.ModalService, "Close project", "Are you sure to close project?", function (yesOrNo) {
        if (yesOrNo) {
            utils.projectClose(self.wiComponentService);
        }
    })
};

exports.UnitSettingsButtonClicked = function () {
    console.log('UnitSettingsButton is clicked');
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
    let layoutManager = wiComponentService.getComponent('LAYOUT_MANAGER');

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
    let DialogUtils = wiComponentService.getComponent('DIALOG_UTILS');
    DialogUtils.confirmDialog(this.ModalService, "Exit Program", "Are you exit program?", function (ret) {
        console.log("User choose: " + ret);
        window.close();
    })
};

exports.AddNewButtonClicked = function () {
    let self = this;
    let wiComponentService = this.wiComponentService;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let DialogUtils = wiComponentService.getComponent('DIALOG_UTILS');

    DialogUtils.addNewDialog(this.ModalService, function (newWell) {
        if (newWell) utils.updateWellProject(wiComponentService, newWell);
    })
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
    let utils = this.wiComponentService.getComponent(self.wiComponentService.UTILS);
    let DialogUtils = this.wiComponentService.getComponent('DIALOG_UTILS');
    DialogUtils.importLASDialog(this.ModalService, function (well) {
        if (well) {
            utils.updateWellProject(self.wiComponentService, well);
        }
    })
};

exports.ImportMultiLASButtonClicked = function () {
    console.log('ImportMultiLASButton is clicked');
    let self = this;
    let DialogUtils = this.wiComponentService.getComponent('DIALOG_UTILS');
    DialogUtils.importMultiLASDialog(this.ModalService, function (well) {
        if (well) {
            self.wiComponentService.emit(self.wiComponentService.UPDATE_WELL_EVENT, well);
        }
    })
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
    console.log('BlankLogplotButton is clicked');
    var wiComponentService = this.wiComponentService;
    var DialogUtils = wiComponentService.getComponent('DIALOG_UTILS');
    DialogUtils.blankLogplotDialog(this.ModalService, function (ret) {
        console.log("User Choose: " + ret);
    })
};

exports.TrippleComboButtonClicked = function () {
    console.log('TrippleComboButton is clicked');
};

exports.DensityNeutronButtonClicked = function () {
    console.log('DensityNeutronButton is clicked');
};

exports.ResistivitySonicButtonClicked = function () {
    console.log('ResistivitySonicButton is clicked');
};

exports.TriTracksBlankButtonClicked = function () {
    console.log('3TracksBlankButton is clicked');
};

exports.InputCurveButtonClicked = function () {
    console.log('InputCurveButton is clicked');
};

exports.LithoPlusSyn_CurveButtonClicked = function () {
    console.log('Litho+Syn.CurveButton is clicked');
};

exports.Syn_CurveButtonClicked = function () {
    console.log('Syn.CurveButton is clicked');
};

exports.ResultButtonClicked = function () {
    console.log('ResultButton is clicked');
};

exports.BlankCrossPlotButtonClicked = function () {
    console.log('BlankCrossPlotButton is clicked');
};

exports.SonicPHI_TOTALButtonClicked = function () {
    console.log('SonicPHI_TOTALButton is clicked');
};

exports.NeutronDensityButtonClicked = function () {
    console.log('NeutronDensityButton is clicked');
};

exports.NeutronGammaButtonClicked = function () {
    console.log('NeutronGammaButton is clicked');
};

exports.SonicGammaButtonClicked = function () {
    console.log('SonicGammaButton is clicked');
};

exports.NeuTronSonicButtonClicked = function () {
    console.log('NeuTronSonicButton is clicked');
};

exports.DenityGammaButtonClicked = function () {
    console.log('DenityGammaButton is clicked');
};

exports.NeuTronRtButtonClicked = function () {
    console.log('NeuTronRtButton is clicked');
};

exports.DensitySonicButtonClicked = function () {
    console.log('DensitySonicButton is clicked');
};

exports.DensityRtButtonClicked = function () {
    console.log('DensityRtButton is clicked');
};

exports.SonicDensityButtonClicked = function () {
    console.log('SonicDensityButton is clicked');
};

exports.SonicRtButtonClicked = function () {
    console.log('SonicRtButton is clicked');
};

exports.RtRx0ButtonClicked = function () {
    console.log('RtRx0Button is clicked');
};

exports.PickettButtonClicked = function () {
    console.log('PickettButton is clicked');
};

exports.BlankHistogramButtonClicked = function () {
    console.log('BlankHistogramButton is clicked');
};

exports.PHI_TOTALButtonClicked = function () {
    console.log('PHI_TOTALButton is clicked');
};

exports.GammaRayButtonClicked = function () {
    console.log('GammaRayButton is clicked');
};

exports.NeutronButtonClicked = function () {
    console.log('NeutronButton is clicked');
};

exports.DensityButtonClicked = function () {
    console.log('DensityButton is clicked');
};

exports.SonicButtonClicked = function () {
    console.log('SonicButton is clicked');
};

exports.SallowResistivityButtonClicked = function () {
    console.log('SallowResistivityButton is clicked');
};

exports.DeepResistivityButtonClicked = function () {
    console.log('DeepResistivityButton is clicked');
};

exports.MSFLHistogramButtonClicked = function () {
    console.log('MSFLHistogramButton is clicked');
};

exports.AddCurveButtonClicked = function () {
    console.log('AddCurveButton is clicked');
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
};

exports.InteractiveCurveSplitButtonClicked = function () {
    console.log('InteractiveCurveSplitButton is clicked');
};

exports.MergeCurvesButtonClicked = function () {
    console.log('MergeCurvesButton is clicked');
};

exports.CurvesHeaderButtonClicked = function () {
    console.log('CurvesHeaderButton is clicked');
};

exports.FillDataGapsButtonClicked = function () {
    console.log('FillDataGapsButton is clicked');
};

exports.CurveFilterButtonClicked = function () {
    console.log('CurveFilterButton is clicked');
};

exports.CurveConvolutionButtonClicked = function () {
    console.log('CurveConvolutionButton is clicked');
};

exports.CurveDeconvolutionButtonClicked = function () {
    console.log('CurveDeconvolutionButton is clicked');
};

exports.CurveDerivativeButtonClicked = function () {
    console.log('CurveDerivativeButton is clicked');
};

exports.CurveRescaleButtonClicked = function () {
    console.log('CurveRescaleButton is clicked');
};

exports.CurveComrarisonButtonClicked = function () {
    console.log('CurveComrarisonButton is clicked');
};

exports.CurveAverageButtonClicked = function () {
    console.log('CurveAverageButton is clicked');
};

exports.FormationResistivityButtonClicked = function () {
    console.log('FormationResistivityButton is clicked');
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
};

exports.UnlockButtonClicked = function () {
    console.log('UnlockButton is clicked');
};

exports.CollapseProjectButtonClicked = function () {
    let rootTreeviewCtrl = this.wiComponentService.getComponent('WiExplorertreeview');
    let rootConfig = rootTreeviewCtrl.config;
    var expaned = false;
    for (let child of rootConfig) {
        expaned = child.data.childExpanded;
        if (!expaned) break;
    }
    if (expaned) {
        rootTreeviewCtrl.collapseAll(rootConfig);
    } else {
        rootTreeviewCtrl.expandAll(rootConfig);
    }
};