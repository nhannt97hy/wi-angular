exports.SaveFormatButtonClicked = function() {
    console.log('SaveFormatButton is clicked', this.wiHistogram);
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
    dialogUtils.histogramFormatDialog(ModalService, wiHistogramCtrl, function() {
        console.log('return');
    })
}

exports.ActiveZoneButtonClicked = function() {
    console.log('ActiveZoneButton is clicked');
}

exports.FrequencyInfoButtonClicked = function() {
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

