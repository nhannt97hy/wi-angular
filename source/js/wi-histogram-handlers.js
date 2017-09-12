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
    
    let wiHistogramCtrl = this.wiHistogram;
    var dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    console.log('EditFormatButton is clicked');
    dialogUtils.histogramFormatDialog(ModalService, wiHistogramCtrl, function(ret) {
        console.log(ret);
    })
}

exports.ActiveZoneButtonClicked = function() {
    console.log('ActiveZoneButton is clicked');
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
}

exports.CumulativeButtonClicked = function() {
    console.log('CumulativeButton is clicked');
}

exports.PlotBarsButtonClicked = function() {
    console.log('PlotBarsButton is clicked');
}

exports.PlotCurvesButtonClicked = function() {
    console.log('PlotCurvesButton is clicked');
}

exports.FrequencyButtonClicked = function() {
    console.log('FrequencyButton is clicked');
}

exports.PercentButtonClicked = function() {
    console.log('PercentButton is clicked');
}

exports.ColorByZoneButtonClicked = function() {
    console.log('ColorByZoneButton is clicked');
}

exports.ColorByInputCurveButtonClicked = function() {
    console.log('ColorByInputCurveButton is clicked');
}

