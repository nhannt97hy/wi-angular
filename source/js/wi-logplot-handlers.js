function genSamples(nSamples) {
    var samples = new Array();
    for( let i = 0; i < nSamples; i++ ) {
        samples.push({y:i, x: Math.random()});
    }
    return samples;
}

exports.Button1ButtonClicked = function() {
    console.log('Button1Button is clicked');

    var myPlot = this.wiComponentService.getComponent('myLogPlotD3Area');
    if (!myPlot) return;
    var slidingBar = this.wiComponentService.getComponent('myLogPlotSlidingbar');
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

exports.Button2ButtonClicked = function() {
    console.log('Button2Button is clicked');
}

exports.Button3ButtonClicked = function() {
    console.log('Button3Button is clicked');
}

