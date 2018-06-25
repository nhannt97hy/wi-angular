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
    this.wiHistogram.toggleShowWiZone();
}

exports.GaussianButtonClicked = function() {
    console.log('GaussianButton is clicked');
    let wiHistogramCtrl = this.wiHistogram;
    let properties = wiHistogramCtrl.getwiD3Ctrl().histogramModel.properties;
    wiHistogramCtrl.getwiD3Ctrl().config.showGaussian = properties.showGaussian = !properties.showGaussian;
    let showGaussian = properties.showGaussian;
    properties.curves.forEach(c => {
        c.options.showGaussian = c.histogram_curve_set.showGaussian = showGaussian;
    });
    wiHistogramCtrl.getwiD3Ctrl().curvesProperties.forEach(cp => {
        cp.options.showGaussian = showGaussian;
    });
    wiHistogramCtrl.getwiD3Ctrl().visHistogram.updateHistogram(properties);
    wiHistogramCtrl.getwiD3Ctrl().saveHistogram();
}

exports.CumulativeButtonClicked = function() {
    console.log('CumulativeButton is clicked');
    let wiHistogramCtrl = this.wiHistogram;
    let properties = wiHistogramCtrl.getwiD3Ctrl().histogramModel.properties;
    wiHistogramCtrl.getwiD3Ctrl().config.showCumulative = properties.showCumulative = !properties.showCumulative;
    let showCumulative = properties.showCumulative;
    properties.curves.forEach(c => {
        c.options.showCumulative = c.histogram_curve_set.showCumulative = showCumulative;
    });
    wiHistogramCtrl.getwiD3Ctrl().curvesProperties.forEach(cp => {
        cp.options.showCumulative = showCumulative;
    });
    wiHistogramCtrl.getwiD3Ctrl().visHistogram.updateHistogram(properties);
    wiHistogramCtrl.getwiD3Ctrl().saveHistogram();
}

exports.PlotBarsButtonClicked = PlotBarsButtonClicked;
function PlotBarsButtonClicked() {
    console.log('PlotBarsButton is clicked');
    let wiHistogramCtrl = this.wiHistogram;
    let properties = wiHistogramCtrl.getwiD3Ctrl().histogramModel.properties;
    let currentPlot = properties.plot;
    switch(currentPlot) {
        case 'Bar':
            properties.plot = "Curve";
            break;
        default:
            properties.plot = "Bar";
    }
    // wiHistogramCtrl.histogramModel.properties.plot = "Bar";
    let plot = wiHistogramCtrl.getwiD3Ctrl().config.plot = properties.plot;
    properties.curves.forEach(c => {
        c.options.plot = c.histogram_curve_set.plot = plot;
    });
    wiHistogramCtrl.getwiD3Ctrl().curvesProperties.forEach(cp => {
        cp.options.plot = plot;
    });
    wiHistogramCtrl.getwiD3Ctrl().visHistogram.updateHistogram(properties);
    wiHistogramCtrl.getwiD3Ctrl().saveHistogram();
}

exports.PlotCurvesButtonClicked = function() {
    console.log('PlotCurvesButton is clicked');
    // PlotBarsButtonClicked.call(this);
    let wiHistogramCtrl = this.wiHistogram;
    let properties = wiHistogramCtrl.getwiD3Ctrl().histogramModel.properties;
    let currentPlot = properties.plot;
    switch(currentPlot) {
        case 'Bar':
            properties.plot = "Curve";
            break;
        default:
            properties.plot = "Bar";
    }
    //wiHistogramCtrl.histogramModel.properties.plot = "Curve";
    let plot = wiHistogramCtrl.getwiD3Ctrl().config.plot = properties.plot;
    properties.curves.forEach(c => {
        c.options.plot = c.histogram_curve_set.plot = plot;
    });
    wiHistogramCtrl.getwiD3Ctrl().curvesProperties.forEach(cp => {
        cp.options.plot = plot;
    });
    wiHistogramCtrl.getwiD3Ctrl().visHistogram.updateHistogram(properties);
    wiHistogramCtrl.getwiD3Ctrl().saveHistogram();
}

exports.FrequencyButtonClicked = FrequencyButtonClicked;
function FrequencyButtonClicked() {
    console.log('FrequencyButton is clicked');
    let wiHistogramCtrl = this.wiHistogram;
    var temp = wiHistogramCtrl.getwiD3Ctrl().histogramModel.properties.plotType;
    switch(temp) {
    case 'Percent':
        wiHistogramCtrl.getwiD3Ctrl().histogramModel.properties.plotType = "Frequency";
        break;
    default:
        wiHistogramCtrl.getwiD3Ctrl().histogramModel.properties.plotType = "Percent";
    }
    wiHistogramCtrl.getwiD3Ctrl().config.plotType = wiHistogramCtrl.getwiD3Ctrl().histogramModel.properties.plotType;
    wiHistogramCtrl.getwiD3Ctrl().visHistogram.doPlot();
    wiHistogramCtrl.getwiD3Ctrl().saveHistogram();
}

exports.PercentButtonClicked = function() {
    console.log('PercentButton is clicked');
    FrequencyButtonClicked.call(this);
}
function colorByButtonClick(){
    let wiHistogramCtrl = this.wiHistogram;
    var temp = wiHistogramCtrl.getwiD3Ctrl().histogramModel.properties.colorBy;
    switch(temp) {
    case 'zone':
        wiHistogramCtrl.getwiD3Ctrl().histogramModel.properties.colorBy = "curve";
        break;
    default:
        wiHistogramCtrl.getwiD3Ctrl().histogramModel.properties.colorBy = "zone";
    }
    wiHistogramCtrl.getwiD3Ctrl().visHistogram.signal('histogram-update', "update curve/zone");
    wiHistogramCtrl.getwiD3Ctrl().saveHistogram();
}
exports.ColorByZoneButtonClicked = function() {
    console.log('ColorByZoneButton is clicked');
    colorByButtonClick.call(this);
}

exports.ColorByInputCurveButtonClicked = function() {
    console.log('ColorByInputCurveButton is clicked');
    colorByButtonClick.call(this);
}

