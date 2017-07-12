function genSamples(nSamples) {
    var samples = new Array();
    for( let i = 0; i < nSamples; i++ ) {
        samples.push({y:i, x: Math.random()});
    }
    return samples;
}
exports.Test1ButtonClicked = function() {
    var myPlot = this.wiComponentService.getD3Area(this.wiLogplot.name);
    if (!myPlot) return;
    var slidingBar = this.wiComponentService.getSlidingBar(this.wiLogplot.name);
    if (!slidingBar) return;

    var idx = myPlot.addDepthTrack();

    idx = myPlot.addTrack();

    myPlot.addCurve(idx, genSamples(10000));

    var maxDepth = myPlot.getMaxDepth();

    var low = slidingBar.slidingBarState.top * maxDepth / 100;
    var high = (slidingBar.slidingBarState.top + slidingBar.slidingBarState.range) * maxDepth / 100;
    console.log(slidingBar.slidingBarState, low, high, maxDepth);
    myPlot.setDepthRange([low, high]);
    myPlot.plotAll();
}

exports.Test2ButtonClicked = function() {
    console.log('Test2Button is clicked');
}

exports.Test3ButtonClicked = function() {
    console.log('Test3Button is clicked');
}

