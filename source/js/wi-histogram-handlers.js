exports.SaveFormatButtonClicked = function() {
    console.log('SaveFormatButton is clicked', this.wiHistogram);
    var wiComponentService = this.wiComponentService;
    
    let idHistogram = this.wiHistogram.id;
    let wiApiService = this.wiApiService;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let histogramModel = utils.getModel("histogram", idHistogram);
    wiApiService.editHistogram(histogramModel.properties, function(){
        console.log('Saving Histogram......');
    })

}

exports.PrintButtonClicked = function() {
    console.log('PrintButton is clicked');
}

exports.EditFormatButtonClicked = function() {
    var wiComponentService = this.wiComponentService;
    var ModalService = this.ModalService;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let wiHistogramCtrl = this.wiHistogram;
    var dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    console.log('EditFormatButton is clicked');
    utils.histogramFormat(ModalService, wiComponentService, wiHistogramCtrl);
}

exports.ActiveZoneButtonClicked = function() {
    console.log('ActiveZoneButton is clicked', this.Histogram);
    let wiD3Ctrl = this.wiHistogram.getwiD3Ctrl();
    wiD3Ctrl.toggleShowWiZone();
}

exports.FrequencyInfoButtonClicked = function() {
    var ModalService = this.ModalService;
    
    var dialogUtils = this.wiComponentService.getComponent(this.wiComponentService.DIALOG_UTILS);
    dialogUtils.histogramFrequencyInfoDialog(ModalService, function(ret){
        console.log(ret);
    })
    console.log('FrequencyInfoButton is clicked');
}

exports.GaussianButtonClicked = function() {
    console.log('GaussianButton is clicked');
    let wiHistogramCtrl = this.wiHistogram;
    wiHistogramCtrl.histogramModel.properties.showGaussian = !wiHistogramCtrl.histogramModel.properties.showGaussian;
}

exports.CumulativeButtonClicked = function() {
    console.log('CumulativeButton is clicked');
    let wiHistogramCtrl = this.wiHistogram;
    wiHistogramCtrl.histogramModel.properties.showCumulative = !wiHistogramCtrl.histogramModel.properties.showCumulative;
}

exports.PlotBarsButtonClicked = PlotBarsButtonClicked;
function PlotBarsButtonClicked() {
    console.log('PlotBarsButton is clicked');
    let wiHistogramCtrl = this.wiHistogram;
    var plot = wiHistogramCtrl.histogramModel.properties.plot;
    switch(plot) {
    case 'Curve':
        wiHistogramCtrl.histogramModel.properties.plot = "Bar";
        break;
    default:
        wiHistogramCtrl.histogramModel.properties.plot = "Curve";
    }
}

exports.PlotCurvesButtonClicked = function() {
    console.log('PlotCurvesButton is clicked');
    PlotBarsButtonClicked.call(this);
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

