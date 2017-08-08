function genSamples(nSamples) {
    let samples = [];
    for( let i = 0; i < nSamples; i++ ) {
        samples.push({y:i, x: Math.random()});
    }
    return samples;
}

exports.EditFormatButtonClicked = function() {
    let utils = this.wiComponentService.getComponent(this.wiComponentService.UTILS);
    utils.error('This function is not implemented');
};

exports.SaveAsLogplotButtonClicked = function() {
    console.log('SaveAsLogplotButton is clicked');
};

exports.SaveAsButtonClicked = function() {
    console.log('SaveAsButton is clicked');
};

exports.PrintButtonClicked = function() {
    console.log('PrintButton is clicked');
};

exports.PrintToImageButtonClicked = function() {
    console.log('PrintToImageButton is clicked');
};

function getDpi() {
    let inch = document.createElement('inch');
    inch.style = 'height: 1in; width: 1in; left: -100%; position: absolute; top: -100%;';
    document.body.appendChild(inch);
    let devicePixelRatio = window.devicePixelRatio || 1;
    let dpi = inch.clientWidth * devicePixelRatio;
    return dpi;
}

function scaleTo(rangeUnit, wiLogplot) {
    let wiD3Ctrl = wiLogplot.getwiD3Ctrl();
    let wiSlidingbarCtrl = wiLogplot.getSlidingbarCtrl();
    let maxDepth = wiD3Ctrl.getMaxDepth();
    let minDepth = wiD3Ctrl.getMinDepth();
    let realLengthCm = (maxDepth - minDepth) * 100;
    let dpCm = getDpi()/2.54;
    let trackHeight = d3.select('.track-area .vi-track-plot-container').node().clientHeight;
    let trackHeightCm = trackHeight/dpCm;
    let trackRealLengthCm = trackHeightCm*rangeUnit;
    let rangeHandlerByPercent = (trackRealLengthCm/realLengthCm) * 100;
    console.log('scale handler', rangeHandlerByPercent, trackRealLengthCm, realLengthCm);
    if (rangeHandlerByPercent > 100) {
        rangeHandlerByPercent = 100;
    }

    wiSlidingbarCtrl.updateRangeSlidingHandler(rangeHandlerByPercent);
}

exports.Scale20ButtonClicked = function() {
    let rangeUnit = 20;
    scaleTo(rangeUnit, this.wiLogplot);
};

exports.Scale50ButtonClicked = function() {
    let rangeUnit = 50;
    scaleTo(rangeUnit, this.wiLogplot);
};

exports.Scale100ButtonClicked = function() {
    let rangeUnit = 100;
    scaleTo(rangeUnit, this.wiLogplot);
};

exports.Scale200ButtonClicked = function() {
    let rangeUnit = 200;
    scaleTo(rangeUnit, this.wiLogplot);
};

exports.Scale300ButtonClicked = function() {
    let rangeUnit = 300;
    scaleTo(rangeUnit, this.wiLogplot);
};

exports.Scale500ButtonClicked = function() {
    let rangeUnit = 500;
    scaleTo(rangeUnit, this.wiLogplot);
};

exports.Scale1000ButtonClicked = function() {
    let rangeUnit = 1000;
    scaleTo(rangeUnit, this.wiLogplot);
};

exports.Scale2000ButtonClicked = function() {
    let rangeUnit = 2000;
    scaleTo(rangeUnit, this.wiLogplot);
};

exports.Scale2500ButtonClicked = function() {
    let rangeUnit = 2500;
    scaleTo(rangeUnit, this.wiLogplot);
};

exports.Scale3000ButtonClicked = function() {
    let rangeUnit = 3000;
    scaleTo(rangeUnit, this.wiLogplot);
};

exports.Scale5000ButtonClicked = function() {
    let rangeUnit = 5000;
    scaleTo(rangeUnit, this.wiLogplot);
};

exports.ScaleFullButtonClicked = function() {
    let rangeUnit = this.wiLogplot.getwiD3Ctrl().getMaxDepth()*100;
    scaleTo(rangeUnit, this.wiLogplot);
};

exports.ZoomInButtonClicked = function() {
    this.wiLogplot.getwiD3Ctrl().zoom(false);
};

exports.ZoomOutButtonClicked = function() {
    this.wiLogplot.getwiD3Ctrl().zoom(true);
};

exports.CropDisplayButtonClicked = function() {
    console.log('CropDisplayButton is clicked');
};
exports.RangeSpecificButtonClicked = function() {
    let self = this;
    let DialogUtils = this.wiComponentService.getComponent(this.wiComponentService.DIALOG_UTILS);
    DialogUtils.rangeSpecificDialog(this.ModalService, this.wiLogplot, function () {
       console.log("RangeFrom");
    });
}
// exports.RangeFromButtonClicked = function() {
//     console.log('RangeFromButton is clicked');
// };

// exports.RangeToButtonClicked = function() {
//     console.log('RangeToButton is clicked');
// };

// exports.RangeOkButtonClicked = function() {
//     console.log('RangeOkButton is clicked');
// };

exports.ViewWholeWellButtonClicked = function() {
    console.log('ViewWholeWellButton is clicked');
};

exports.AddDepthAxisButtonClicked = function() {
    this.wiLogplot.getwiD3Ctrl().addDepthTrack();
};

exports.NewTrackButtonClicked = function() {
    this.wiLogplot.getwiD3Ctrl().addLogTrack();
};

exports.DuplicateTrackButtonClicked = function() {
    console.log('DuplicateTrackButton is clicked');
};

exports.DeleteTrackButtonClicked = function() {
    this.wiLogplot.getwiD3Ctrl().removeCurrentTrack();
};

exports.AddMarkerButtonClicked = function() {
    console.log('AddMarkerButton is clicked');
};

exports.AddZoneButtonClicked = function() {
    console.log('AddZoneButton is clicked');
};

exports.AnnotationsButtonClicked = function() {
    console.log('AnnotationsButton is clicked');
};

exports.AddImageButtonClicked = function() {
    console.log('AddImageButton is clicked');
};

exports.AddShadingButtonClicked = function() {
    console.log('AddShadingButton is clicked');
};

exports.RemoveVisualButtonClicked = function() {
    console.log('RemoveVisualButton is clicked');
};

exports.CrossPlotButtonClicked = function() {
    console.log('CrossPlotButton is clicked');
};

exports.HistogramButtonClicked = function() {
    console.log('HistogramButton is clicked');
};

