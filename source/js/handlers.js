exports.NewProjectButtonClicked = function() {
    console.log('NewProjectButton is clicked ', this);
    var wiComponentService = this.wiComponentService;
    wiComponentService.getComponent('OpenProjectButton').label = "hic hic";
}

function genSamples(nSamples) {
    var samples = new Array();
    for( let i = 0; i < nSamples; i++ ) {
        samples.push({y:i, x: Math.random()});
    }
    return samples;
}

exports.OpenProjectButtonClicked = function() {
    console.log('OpenProjectButtoon is clicked');
    console.log('Do click');
    var myPlot = this.wiComponentService.getComponent('myLogPlotD3Area');
    var slidingBar = this.wiComponentService.getComponent('myLogPlotSlidingbar');
    var idx = myPlot.addTrack();

    myPlot.setData(idx, genSamples(1000));

    var maxDepth = myPlot.getMaxDepth();

    var low = slidingBar.slidingBarState.top * maxDepth / 100;
    var high = (slidingBar.slidingBarState.top + slidingBar.slidingBarState.range) * maxDepth / 100;
    console.log(slidingBar.slidingBarState, low, high, maxDepth);
    myPlot.setDepthRange([low, high]);
    myPlot.plotAll();
}

exports.CloseProjectButtonClicked = function() {
    console.log('CloseProjectButton is clicked');
}

exports.UnitSettingsButtonClicked = function() {
    console.log('UnitSettingsButton is clicked');
}

exports.SaveProjectButtonClicked = function() {
    console.log('SaveProjectButton is clicked');
}

exports.SaveProjectAsButtonClicked = function() {
    console.log('SaveProjectAsButton is clicked');
}

exports.ProjectButtonClicked = function() {
    console.log('ProjectButton is clicked');
}

exports.WorkflowsButtonClicked = function() {
    console.log('WorkflowsButton is clicked');
}

exports.PropertyGridButtonClicked = function() {
    console.log('PropertyGridButton is clicked');
}

exports.ExitButtonClicked = function() {
    console.log('ExitButton is clicked');
}

exports.AddNewButtonClicked = function() {
    console.log('AddNewButton is clicked');
}

exports.WellHeaderButtonClicked = function() {
    console.log('WellHeaderButton is clicked');
}

exports.DepthConversionButtonClicked = function() {
    console.log('DepthConversionButton is clicked');
}

exports.CurveAliasButtonClicked = function() {
    console.log('CurveAliasButton is clicked');
}

exports.FamilyEditButtonClicked = function() {
    console.log('FamilyEditButton is clicked');
}

exports.ImportASCIIButtonClicked = function() {
    console.log('ImportASCIIButton is clicked');
}

exports.ImportMultiASCIIButtonClicked = function() {
    console.log('ImportMultiASCIIButton is clicked');
}

exports.ImportLASButtonClicked = function() {
    console.log('ImportLASButton is clicked');
}

exports.ImportMultiLASButtonClicked = function() {
    console.log('ImportMultiLASButton is clicked');
}

exports.Interval_CoreLoaderButtonClicked = function() {
    console.log('Interval/CoreLoaderButton is clicked');
}

exports.Multi_wellCoreLoaderButtonClicked = function() {
    console.log('Multi-wellCoreLoaderButton is clicked');
}

exports.ImportWellHeaderButtonClicked = function() {
    console.log('ImportWellHeaderButton is clicked');
}

exports.ImportWellTopButtonClicked = function() {
    console.log('ImportWellTopButton is clicked');
}

exports.ExportASCIIButtonClicked = function() {
    console.log('ExportASCIIButton is clicked');
}

exports.ExportMultiASCIIButtonClicked = function() {
    console.log('ExportMultiASCIIButton is clicked');
}

exports.ExportLASButtonClicked = function() {
    console.log('ExportLASButton is clicked');
}

exports.ExportMultiLASButtonClicked = function() {
    console.log('ExportMultiLASButton is clicked');
}

exports.ExportCoreDataButtonClicked = function() {
    console.log('ExportCoreDataButton is clicked');
}

exports.Multi_wellCoreLoaderButtonClicked = function() {
    console.log('Multi-wellCoreLoaderButton is clicked');
}

exports.ExportWellHeaderButtonClicked = function() {
    console.log('ExportWellHeaderButton is clicked');
}

exports.ExportWellTopButtonClicked = function() {
    console.log('ExportWellTopButton is clicked');
}

exports.BlankLogplotButtonClicked = function() {
    console.log('BlankLogplotButton is clicked');
}

exports.TrippleComboButtonClicked = function() {
    console.log('TrippleComboButton is clicked');
}

exports.DensityNeutronButtonClicked = function() {
    console.log('DensityNeutronButton is clicked');
}

exports.ResistivitySonicButtonClicked = function() {
    console.log('ResistivitySonicButton is clicked');
}

exports.TriTracksBlankButtonClicked = function() {
    console.log('3TracksBlankButton is clicked');
}

exports.InputCurveButtonClicked = function() {
    console.log('InputCurveButton is clicked');
}

exports.LithoPlusSyn_CurveButtonClicked = function() {
    console.log('Litho+Syn.CurveButton is clicked');
}

exports.Syn_CurveButtonClicked = function() {
    console.log('Syn.CurveButton is clicked');
}

exports.ResultButtonClicked = function() {
    console.log('ResultButton is clicked');
}

exports.BlankCrossPlotButtonClicked = function() {
    console.log('BlankCrossPlotButton is clicked');
}

exports.SonicPHI_TOTALButtonClicked = function() {
    console.log('SonicPHI_TOTALButton is clicked');
}

exports.NeutronDensityButtonClicked = function() {
    console.log('NeutronDensityButton is clicked');
}

exports.NeutronGammaButtonClicked = function() {
    console.log('NeutronGammaButton is clicked');
}

exports.SonicGammaButtonClicked = function() {
    console.log('SonicGammaButton is clicked');
}

exports.NeuTronSonicButtonClicked = function() {
    console.log('NeuTronSonicButton is clicked');
}

exports.DenityGammaButtonClicked = function() {
    console.log('DenityGammaButton is clicked');
}

exports.NeuTronRtButtonClicked = function() {
    console.log('NeuTronRtButton is clicked');
}

exports.DensitySonicButtonClicked = function() {
    console.log('DensitySonicButton is clicked');
}

exports.DensityRtButtonClicked = function() {
    console.log('DensityRtButton is clicked');
}

exports.SonicDensityButtonClicked = function() {
    console.log('SonicDensityButton is clicked');
}

exports.SonicRtButtonClicked = function() {
    console.log('SonicRtButton is clicked');
}

exports.RtRx0ButtonClicked = function() {
    console.log('RtRx0Button is clicked');
}

exports.PickettButtonClicked = function() {
    console.log('PickettButton is clicked');
}

exports.BlankHistogramButtonClicked = function() {
    console.log('BlankHistogramButton is clicked');
}

exports.PHI_TOTALButtonClicked = function() {
    console.log('PHI_TOTALButton is clicked');
}

exports.GammaRayButtonClicked = function() {
    console.log('GammaRayButton is clicked');
}

exports.NeutronButtonClicked = function() {
    console.log('NeutronButton is clicked');
}

exports.DensityButtonClicked = function() {
    console.log('DensityButton is clicked');
}

exports.SonicButtonClicked = function() {
    console.log('SonicButton is clicked');
}

exports.SallowResistivityButtonClicked = function() {
    console.log('SallowResistivityButton is clicked');
}

exports.DeepResistivityButtonClicked = function() {
    console.log('DeepResistivityButton is clicked');
}

exports.MSFLHistogramButtonClicked = function() {
    console.log('MSFLHistogramButton is clicked');
}

exports.AddCurveButtonClicked = function() {
    console.log('AddCurveButton is clicked');
}

exports.EditTextCurveButtonClicked = function() {
    console.log('EditTextCurveButton is clicked');
}

exports.CurveListing_EditButtonClicked = function() {
    console.log('CurveListing/EditButton is clicked');
}

exports.InteractiveCurveEditButtonClicked = function() {
    console.log('InteractiveCurveEditButton is clicked');
}

exports.InteractiveBaselineShiftButtonClicked = function() {
    console.log('InteractiveBaselineShiftButton is clicked');
}

exports.SplitCurvesButtonClicked = function() {
    console.log('SplitCurvesButton is clicked');
}

exports.InteractiveCurveSplitButtonClicked = function() {
    console.log('InteractiveCurveSplitButton is clicked');
}

exports.MergeCurvesButtonClicked = function() {
    console.log('MergeCurvesButton is clicked');
}

exports.CurvesHeaderButtonClicked = function() {
    console.log('CurvesHeaderButton is clicked');
}

exports.FillDataGapsButtonClicked = function() {
    console.log('FillDataGapsButton is clicked');
}

exports.CurveFilterButtonClicked = function() {
    console.log('CurveFilterButton is clicked');
}

exports.CurveConvolutionButtonClicked = function() {
    console.log('CurveConvolutionButton is clicked');
}

exports.CurveDeconvolutionButtonClicked = function() {
    console.log('CurveDeconvolutionButton is clicked');
}

exports.CurveDerivativeButtonClicked = function() {
    console.log('CurveDerivativeButton is clicked');
}

exports.CurveRescaleButtonClicked = function() {
    console.log('CurveRescaleButton is clicked');
}

exports.CurveComrarisonButtonClicked = function() {
    console.log('CurveComrarisonButton is clicked');
}

exports.CurveAverageButtonClicked = function() {
    console.log('CurveAverageButton is clicked');
}

exports.FormationResistivityButtonClicked = function() {
    console.log('FormationResistivityButton is clicked');
}

exports.Badhole_Coal_SaltButtonClicked = function() {
    console.log('Badhole/Coal/SaltButton is clicked');
}

exports.UserFormulaButtonClicked = function() {
    console.log('UserFormulaButton is clicked');
}

exports.UserProgramButtonClicked = function() {
    console.log('UserProgramButton is clicked');
}

exports.PythonProgramButtonClicked = function() {
    console.log('PythonProgramButton is clicked');
}

exports.TVDConversionButtonClicked = function() {
    console.log('TVDConversionButton is clicked');
}

exports.PCAAnalysisButtonClicked = function() {
    console.log('PCAAnalysisButton is clicked');
}

exports.Multi_LinearRegressionButtonClicked = function() {
    console.log('Multi-LinearRegressionButton is clicked');
}

exports.NeuralNetworkButtonClicked = function() {
    console.log('NeuralNetworkButton is clicked');
}

exports.EditZonesButtonClicked = function() {
    console.log('EditZonesButton is clicked');
}

exports.InputCurvesButtonClicked = function() {
    console.log('InputCurvesButton is clicked');
}

exports.InputFuidButtonClicked = function() {
    console.log('InputFuidButton is clicked');
}

exports.BuildMineralParametersButtonClicked = function() {
    console.log('BuildMineralParametersButton is clicked');
}

exports.InputMineralZonesButtonClicked = function() {
    console.log('InputMineralZonesButton is clicked');
}

exports.Multi_MineralSolverButtonClicked = function() {
    console.log('Multi-MineralSolverButton is clicked');
}

exports.ClayMineralsVolumeButtonClicked = function() {
    console.log('ClayMineralsVolumeButton is clicked');
}

exports.Fracture_VugPorosityButtonClicked = function() {
    console.log('Fracture-VugPorosityButton is clicked');
}

exports.OpenPorosityButtonClicked = function() {
    console.log('OpenPorosityButton is clicked');
}

exports.SecondaryPorosityButtonClicked = function() {
    console.log('SecondaryPorosityButton is clicked');
}

exports.FracturePorosityButtonClicked = function() {
    console.log('FracturePorosityButton is clicked');
}

exports.FilteringFractureButtonClicked = function() {
    console.log('FilteringFractureButton is clicked');
}

exports.MicroAndMacroPorosityButtonClicked = function() {
    console.log('Micro&MacroPorosityButton is clicked');
}

exports.WaterSaturationButtonClicked = function() {
    console.log('WaterSaturationButton is clicked');
}

exports.PermeabilityButtonClicked = function() {
    console.log('PermeabilityButton is clicked');
}

exports.CutoffandSummationButtonClicked = function() {
    console.log('CutoffandSummationButton is clicked');
}

exports.FilteringButtonClicked = function() {
    console.log('FilteringButton is clicked');
}

exports.BasicAnalysisButtonClicked = function() {
    console.log('BasicAnalysisButton is clicked');
}

exports.ClayVolumeButtonClicked = function() {
    console.log('ClayVolumeButton is clicked');
}

exports.PorosityAndWaterSaturationButtonClicked = function() {
    console.log('Porosity&WaterSaturationButton is clicked');
}

exports.CutoffandSummationButtonClicked = function() {
    console.log('CutoffandSummationButton is clicked');
}

exports.HelpButtonClicked = function() {
    console.log('HelpButton is clicked');
}

exports.AboutButtonClicked = function() {
    console.log('AboutButton is clicked');
}

exports.UnlockButtonClicked = function() {
    console.log('UnlockButton is clicked');
}

