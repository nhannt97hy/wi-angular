function genSamples(nSamples) {
    var samples = new Array();
    for( let i = 0; i < nSamples; i++ ) {
        samples.push({y:i, x: Math.random()});
    }
    return samples;
}

exports.EditFormatButtonClicked = function() {
    console.log('EditFormatButton is clicked');
    var myPlot = this.wiComponentService.getD3Area(this.wiLogplot.name);
    if (!myPlot) return;
    var slidingBar = this.wiComponentService.getSlidingBar(this.wiLogplot.name);
    if (!slidingBar) return;

    var idx = myPlot.addDepthTrack();

    idx = myPlot.addTrack();

    myPlot.setData(idx, genSamples(10000));

    var maxDepth = myPlot.getMaxDepth();

    var low = slidingBar.slidingBarState.top * maxDepth / 100;
    var high = (slidingBar.slidingBarState.top + slidingBar.slidingBarState.range) * maxDepth / 100;
    console.log(slidingBar.slidingBarState, low, high, maxDepth);
    myPlot.setDepthRange([low, high]);
    myPlot.plotAll();
}

exports.SaveAsLogplotButtonClicked = function() {
    console.log('SaveAsLogplotButton is clicked');
}

exports.SaveAsButtonClicked = function() {
    console.log('SaveAsButton is clicked');
}

exports.PrintButtonClicked = function() {
    console.log('PrintButton is clicked');
}

exports.PrintToImageButtonClicked = function() {
    console.log('PrintToImageButton is clicked');
}

exports.ScaleButtonClicked = function() {
    console.log('ScaleButton is clicked');
}

exports.ZoomInButtonClicked = function() {
    console.log('ZoomInButton is clicked');
}

exports.ZoomOutButtonClicked = function() {
    console.log('ZoomOutButton is clicked');
}

exports.CropDisplayButtonClicked = function() {
    console.log('CropDisplayButton is clicked');
}

exports.ViewWholeWellButtonClicked = function() {
    console.log('ViewWholeWellButton is clicked');
}

exports.AddDepthAxisButtonClicked = function() {
    console.log('AddDepthAxisButton is clicked');
}

exports.NewTrackButtonClicked = function() {
    console.log('NewTrackButton is clicked');
}

exports.DuplicateTrackButtonClicked = function() {
    console.log('DuplicateTrackButton is clicked');
}

exports.DeleteTrackButtonClicked = function() {
    console.log('DeleteTrackButton is clicked');
}

exports.AddMarkerButtonClicked = function() {
    console.log('AddMarkerButton is clicked');
}

exports.AddZoneButtonClicked = function() {
    console.log('AddZoneButton is clicked');
}

exports.AnnotationsButtonClicked = function() {
    console.log('AnnotationsButton is clicked');
}

exports.AddImageButtonClicked = function() {
    console.log('AddImageButton is clicked');
}

exports.AddShadingButtonClicked = function() {
    console.log('AddShadingButton is clicked');
}

exports.RemoveVisualButtonClicked = function() {
    console.log('RemoveVisualButton is clicked');
}

exports.CrossPlotButtonClicked = function() {
    console.log('CrossPlotButton is clicked');
}

exports.HistogramButtonClicked = function() {
    console.log('HistogramButton is clicked');
}

