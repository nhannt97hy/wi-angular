exports.SaveFormatButtonClicked = function() {
    console.log('SaveFormatButton is clicked', this.wiHistogram);
    var wiComponentService = this.wiComponentService;
    let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let ModalService = this.ModalService;
    let idHistogram = this.wiHistogram.id;
    let wiApiService = this.wiApiService;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let histogramModel = utils.getModel("histogram", idHistogram);
    wiApiService.editHistogram(histogramModel.properties, function(){
        dialogUtils.warningMessageDialog(ModalService, 'Histogram plot is saved');
    })

}

exports.PrintButtonClicked = function() {
    console.log('PrintButton is clicked');
}

exports.EditFormatButtonClicked = function() {
    // var wiComponentService = this.wiComponentService;
    // var ModalService = this.ModalService;
    // let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let wiHistogramCtrl = this.wiHistogram;
    let wiD3Ctrl = wiHistogramCtrl.getwiD3Ctrl();
    console.log('EditFormatButton is clicked');
    // utils.histogramFormat(ModalService, wiComponentService, wiHistogramCtrl);
    wiD3Ctrl.histogramFormat();
}

exports.ActiveZoneButtonClicked = function() {
/*
    console.log('ActiveZoneButton is clicked', this.Histogram);
    let wiD3Ctrl = this.wiHistogram.getwiD3Ctrl();
    wiD3Ctrl.toggleShowWiZone();
*/
    this.wiHistogram.toggleShowWiZone();
}

exports.FrequencyInfoButtonClicked = function() {
    var ModalService = this.ModalService;
    var wiD3Ctrl = this.wiHistogram.getwiD3Ctrl();
    var visHistogram = wiD3Ctrl.visHistogram;
    var dialogUtils = this.wiComponentService.getComponent(this.wiComponentService.DIALOG_UTILS);
    if(visHistogram.data){
        dialogUtils.histogramFrequencyInfoDialog(ModalService, wiD3Ctrl);
    }
    console.log('FrequencyInfoButton is clicked');
}

exports.ZoneButtonClicked = function() {
    console.log('ZoneButton is clicked');
    this.wiHistogram.isShowWiZone = !this.wiHistogram.isShowWiZone;
}

exports.GaussianButtonClicked = function() {
    console.log('GaussianButton is clicked');
    let wiHistogramCtrl = this.wiHistogram;
    wiHistogramCtrl.histogramModel.properties.showGaussian = !wiHistogramCtrl.histogramModel.properties.showGaussian;
    wiHistogramCtrl.getwiD3Ctrl().visHistogram.signal('histogram-update', 'show/hide Gaussian');
    wiHistogramCtrl.getwiD3Ctrl().saveHistogram();
}

exports.CumulativeButtonClicked = function() {
    console.log('CumulativeButton is clicked');
    let wiHistogramCtrl = this.wiHistogram;
    wiHistogramCtrl.histogramModel.properties.showCumulative = !wiHistogramCtrl.histogramModel.properties.showCumulative;
    wiHistogramCtrl.getwiD3Ctrl().visHistogram.signal('histogram-update', 'show/hide Cumulative');
    wiHistogramCtrl.getwiD3Ctrl().saveHistogram();
}

exports.PlotBarsButtonClicked = PlotBarsButtonClicked;
function PlotBarsButtonClicked() {
    console.log('PlotBarsButton is clicked');
    let wiHistogramCtrl = this.wiHistogram;
    let currentPlot = wiHistogramCtrl.histogramModel.properties.plot;
    switch(currentPlot) {
        case 'Bar': 
            wiHistogramCtrl.histogramModel.properties.plot = "Curve";
            break;
        default:
            wiHistogramCtrl.histogramModel.properties.plot = "Bar";
    } 
    // wiHistogramCtrl.histogramModel.properties.plot = "Bar";
    wiHistogramCtrl.getwiD3Ctrl().visHistogram.signal('histogram-update', 'plot curve/bar');
    wiHistogramCtrl.getwiD3Ctrl().saveHistogram();
}

exports.PlotCurvesButtonClicked = function() {
    console.log('PlotCurvesButton is clicked');
    // PlotBarsButtonClicked.call(this);
    let wiHistogramCtrl = this.wiHistogram;
    let currentPlot = wiHistogramCtrl.histogramModel.properties.plot;
    switch(currentPlot) {
        case 'Bar': 
            wiHistogramCtrl.histogramModel.properties.plot = "Curve";
            break;
        default:
            wiHistogramCtrl.histogramModel.properties.plot = "Bar";
    } 
    //wiHistogramCtrl.histogramModel.properties.plot = "Curve";
    wiHistogramCtrl.getwiD3Ctrl().visHistogram.signal('histogram-update', 'plot curve/bar');
    wiHistogramCtrl.getwiD3Ctrl().saveHistogram();   
}

exports.FrequencyButtonClicked = FrequencyButtonClicked;
function FrequencyButtonClicked() {
    console.log('FrequencyButton is clicked');
    let wiHistogramCtrl = this.wiHistogram;
    var temp = wiHistogramCtrl.histogramModel.properties.plotType;
    switch(temp) {
    case 'Percent':
        wiHistogramCtrl.histogramModel.properties.plotType = "Frequency";
        break;
    default:
        wiHistogramCtrl.histogramModel.properties.plotType = "Percent";
    }
    wiHistogramCtrl.getwiD3Ctrl().visHistogram.signal('histogram-update', "update frequency/percentile");
    wiHistogramCtrl.getwiD3Ctrl().saveHistogram();
}

exports.PercentButtonClicked = function() {
    console.log('PercentButton is clicked');
    FrequencyButtonClicked.call(this);
}

exports.ColorByZoneButtonClicked = function() {
    console.log('ColorByZoneButton is clicked');
}

exports.ColorByInputCurveButtonClicked = function() {
    console.log('ColorByInputCurveButton is clicked');
}

