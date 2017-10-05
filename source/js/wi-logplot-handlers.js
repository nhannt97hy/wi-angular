function genSamples(nSamples) {
    let samples = [];
    for (let i = 0; i < nSamples; i++) {
        samples.push({
            y: i,
            x: Math.random()
        });
    }
    return samples;
}

exports.EditFormatButtonClicked = function () {
    this.wiLogplot.getwiD3Ctrl().openProptertiesDialog();
};

exports.SaveAsLogplotButtonClicked = function () {
    // console.log('SaveAsLogplotButton is clicked');
    const wiApiService = this.wiApiService;
    const wiLogplot = this.wiLogplot;
    wiApiService.exportLogPlot(wiLogplot.id, function (data, type) {
        console.log("DATA NA`" + data);
        let blob = new Blob([data], {
            type: type
        });
        let a = document.createElement('a');
        let fileName = wiLogplot.getLogplotModel().properties.name + '.plot';
        a.download = fileName;
        a.href = URL.createObjectURL(blob);
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        a.parentNode.removeChild(a);
    });
};

exports.DuplicateButtonClicked = function () {
    const wiComponentService = this.wiComponentService;
    const wiApiService = this.wiApiService;
    const wiLogplot = this.wiLogplot;
    const Utils = wiComponentService.getComponent(wiComponentService.UTILS);
    const DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    const wellOptions = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED).wells.map(well => ({ value: well.idWell, label: well.name }));
    const promptConfig = {
        title: 'Duplicate Logplot',
        inputName: 'Duplicate to Well',
        type: "select",
        options: wellOptions,
        input: wellOptions.find(option => option.value == self.id)
    }
    DialogUtils.promptDialog(this.ModalService, promptConfig, function (idWell) {
        wiApiService.duplicateLogplot(wiLogplot.id, idWell.value, function () {
            Utils.refreshProjectState();
        });
    });
};

exports.PrintButtonClicked = function () {
    let $timeout = this.$timeout;
    let wiLogplotCtrl = this.wiLogplot;
    let wiD3Ctrl = wiLogplotCtrl.getwiD3Ctrl();
    let wiLogplotElement = $(`wi-logplot[id=${wiLogplotCtrl.id}]`);
    // let maxDepth = wiD3Ctrl.getMaxDepth();
    // let minDepth = wiD3Ctrl.getMinDepth();
    // let trackRealLengthCm = (maxDepth - minDepth) * 100;
    let trackHeight = 32767 // max canvas height;
    let trackHeaderHeight = wiLogplotElement.find('.vi-track-header-container').height();
    let trackHorizontalResizer = wiLogplotElement.find('.vi-track-horizontal-resizer').height();
    let trackBodyHeight = trackHeight - trackHeaderHeight - trackHorizontalResizer - 10;
    wiLogplotElement.find('wi-d3').height(trackHeight + 'px');
    wiLogplotElement.find('div.vi-track-body-container').height(trackBodyHeight + 'px');
    let tracks = wiD3Ctrl.getTracks();
    for (let track of tracks) {
        if (track.isDepthTrack()) {
            track.yTicks = 1000;
        }
    }
    wiD3Ctrl.plotAll();
    wiLogplotCtrl.handlers.ScaleFullButtonClicked();
    $timeout(function () {
        let d3area = wiLogplotElement.find('.track-area').clone();
        let lines = wiD3Ctrl.getLines();
        if (lines && lines.length) {
            let lastLineId = lines[lines.length - 1].id;
            for (let line of lines) {
                let img = document.createElement('img');
                img.style.position = "absolute";
                img.src = wiLogplotElement.find(`canvas.vi-track-drawing[id=${line.id}]`).get(0).toDataURL();
                d3area.find(`canvas.vi-track-drawing[id=${line.id}]`).replaceWith(img);
            }
        }
        wiLogplotElement.find('wi-d3').height('unset');
        wiLogplotElement.find('div.vi-track-body-container').height('70%');
        for (let track of tracks) {
            if (track.isDepthTrack()) {
                track.yTicks = 10;
            }
        }
        wiD3Ctrl.plotAll();
        let bodyHtml = '<div class="track-area" style="background-color: #fff; margin: 4px; padding: 4px; flex: 1; display: flex; flex-direction: row;">';
        bodyHtml += d3area.html();
        bodyHtml += '</div>';
        let iframe = document.createElement('iframe');
        // iframe.height = '100%';
        // iframe.width = '100%';
        iframe.onload = function () {
            let doc = iframe.contentDocument ? iframe.contentDocument : iframe.contentWindow.document;
            let headHtml = `
                    <link href="vendor/css/bootstrap.min.css" rel="stylesheet" type="text/css">
                    <link href="css/graph.css" rel="stylesheet" type="text/css">
                    <link href="css/wi-logplot.css" rel="stylesheet" type="text/css">
                    <link href="css/wi-d3.css" rel="stylesheet" type="text/css">
                `;
            doc.head.innerHTML = headHtml;
            doc.body.innerHTML = bodyHtml;
            $timeout(function () {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
                document.body.removeChild(iframe);
            });
        }
        document.body.appendChild(iframe);
    })
};

exports.PrintToImageButtonClicked = function () {
    console.log('PrintToImageButton is clicked');
};

function scaleTo(rangeUnit, wiLogplot, wiComponentService) {
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let wiD3Ctrl = wiLogplot.getwiD3Ctrl();
    let wiSlidingbarCtrl = wiLogplot.getSlidingbarCtrl();
    let maxDepth = wiD3Ctrl.getMaxDepth();
    let minDepth = wiD3Ctrl.getMinDepth();
    let realLengthCm = (maxDepth - minDepth) * 100;
    let dpCm = utils.getDpcm();
    let trackHeight = $(`wi-logplot[id=${wiLogplot.id}] .vi-track-plot-container`).height();
    let trackHeightCm = trackHeight / dpCm;
    let trackRealLengthCm = trackHeightCm * rangeUnit;
    let rangeHandlerByPercent = (trackRealLengthCm / realLengthCm) * 100;
    // console.log('scale handler', rangeHandlerByPercent, trackRealLengthCm, realLengthCm);
    if (rangeHandlerByPercent > 100) {
        rangeHandlerByPercent = 100;
    }

    wiSlidingbarCtrl.updateRangeSlidingHandler(rangeHandlerByPercent);
}

exports.Scale20ButtonClicked = function () {
    let rangeUnit = 20;
    console.log(this);
    scaleTo(rangeUnit, this.wiLogplot, this.wiComponentService);
};

exports.Scale50ButtonClicked = function () {
    let rangeUnit = 50;
    scaleTo(rangeUnit, this.wiLogplot, this.wiComponentService);
};

exports.Scale100ButtonClicked = function () {
    let rangeUnit = 100;
    scaleTo(rangeUnit, this.wiLogplot, this.wiComponentService);
};

exports.Scale200ButtonClicked = function () {
    let rangeUnit = 200;
    scaleTo(rangeUnit, this.wiLogplot, this.wiComponentService);
};

exports.Scale300ButtonClicked = function () {
    let rangeUnit = 300;
    scaleTo(rangeUnit, this.wiLogplot, this.wiComponentService);
};

exports.Scale500ButtonClicked = function () {
    let rangeUnit = 500;
    scaleTo(rangeUnit, this.wiLogplot, this.wiComponentService);
};

exports.Scale1000ButtonClicked = function () {
    let rangeUnit = 1000;
    scaleTo(rangeUnit, this.wiLogplot, this.wiComponentService);
};

exports.Scale2000ButtonClicked = function () {
    let rangeUnit = 2000;
    scaleTo(rangeUnit, this.wiLogplot, this.wiComponentService);
};

exports.Scale2500ButtonClicked = function () {
    let rangeUnit = 2500;
    scaleTo(rangeUnit, this.wiLogplot, this.wiComponentService);
};

exports.Scale3000ButtonClicked = function () {
    let rangeUnit = 3000;
    scaleTo(rangeUnit, this.wiLogplot, this.wiComponentService);
};

exports.Scale5000ButtonClicked = function () {
    let rangeUnit = 5000;
    scaleTo(rangeUnit, this.wiLogplot, this.wiComponentService);
};

exports.ScaleFullButtonClicked = function () {
    let rangeUnit = this.wiLogplot.getwiD3Ctrl().getMaxDepth() * 100;
    scaleTo(rangeUnit, this.wiLogplot, this.wiComponentService);
};

exports.ZoomInButtonClicked = function () {
    this.wiLogplot.getwiD3Ctrl().zoom(false);
};

exports.ZoomOutButtonClicked = function () {
    this.wiLogplot.getwiD3Ctrl().zoom(true);
};

exports.CropDisplayButtonClicked = function () {
    this.wiLogplot.getSlidingbarCtrl().scaleView();
    console.log('CropDisplayButton is clicked');
};
exports.RangeSpecificButtonClicked = function () {
    let self = this;
    let DialogUtils = this.wiComponentService.getComponent(this.wiComponentService.DIALOG_UTILS);
    let wiLogplot = this.wiLogplot;
    let timeoutFunc = this.$timeout;
    DialogUtils.rangeSpecificDialog(this.ModalService, this.wiLogplot, function () {
        timeoutFunc(function() {wiLogplot.getSlidingbarCtrl().scaleView();}, 1000);
    });
}

exports.ViewWholeWellButtonClicked = function () {
    this.wiLogplot.getSlidingbarCtrl().resetView();
    console.log('ViewWholeWellButton is clicked');
};

exports.AddDepthAxisButtonClicked = function () {
    this.wiLogplot.getwiD3Ctrl().addDepthTrack();
};

exports.NewTrackButtonClicked = function() {
    this.wiLogplot.getwiD3Ctrl().addLogTrack();
};

exports.DuplicateTrackButtonClicked = function () {
    let utils = this.wiComponentService.getComponent(this.wiComponentService.UTILS)
    let wiD3Ctrl = this.wiLogplot.getwiD3Ctrl();
    let currentTrack = wiD3Ctrl.getCurrentTrack();
    if (!currentTrack.isLogTrack()) {
        utils.warning('Can not duplicate this track. Please choose a Log Track!');
        return;
    }
    let wiApiService = this.wiApiService;
    let props = currentTrack.getProperties();
    wiD3Ctrl.addLogTrack(props.title, function (newTrack) {
        props.orderNum = newTrack.orderNum;
        props.idTrack = newTrack.id;
        props.width = utils.pixelToInch(props.width);
        wiApiService.editTrack(props, function (ret) {
            props.width = utils.inchToPixel(props.width);
            newTrack.setProperties(props);
            let curves = currentTrack.getCurves();
            if (!curves.length) return;
            curves.forEach(function (curve) {
                wiApiService.createLine({
                    idTrack: newTrack.id,
                    idCurve: curve.idCurve
                }, function (line) {
                    let newCurveProps = curve.getProperties();
                    newCurveProps.idLine = line.idLine;
                    newCurveProps.idTrack = newTrack.id;
                    newCurveProps.lineStyle = JSON.stringify(newCurveProps.lineStyle);
                    wiApiService.editLine(newCurveProps, function () {
                        let newCurve = wiD3Ctrl.addCurveToTrack(newTrack, curve.rawData, {});
                        newCurve.setProperties(newCurveProps);
                        newTrack.plotCurve(newCurve);
                    });
                })
            });
        });
    })
};

exports.AddZonationTrackButtonClicked = function () {
    this.wiLogplot.getwiD3Ctrl().addZoneTrack();
}

exports.DeleteTrackButtonClicked = function () {
    let wiD3Ctrl = this.wiLogplot.getwiD3Ctrl();
    let currentTrack = wiD3Ctrl.getCurrentTrack();
    let wiApiService = this.wiApiService;
    const DialogUtils = this.wiComponentService.getComponent(this.wiComponentService.DIALOG_UTILS);
    DialogUtils.confirmDialog(this.ModalService, "Delete Track", "Are you sure to delete " + currentTrack.name + "?", function (yes) {
        if (!yes) return;
        if (currentTrack.type == 'log-track') {
            wiApiService.removeLogTrack(currentTrack.id, wiD3Ctrl.removeCurrentTrack);
        } else if (currentTrack.type == 'depth-track') {
            wiApiService.removeDepthTrack(currentTrack.id, wiD3Ctrl.removeCurrentTrack);
        } else if (currentTrack.type == 'zone-track') {
            wiApiService.removeZoneTrack(currentTrack.id, wiD3Ctrl.removeCurrentTrack);
        }
    });
};

exports.AddMarkerButtonClicked = function () {
    this.wiLogplot.getwiD3Ctrl().addMarker();
};

exports.AddZoneButtonClicked = function () {
    const currentTrack = this.wiLogplot.getwiD3Ctrl().getCurrentTrack();
    if (currentTrack.isZoneTrack()) {
        currentTrack.setMode('AddZone');
    }
};

exports.AnnotationsButtonClicked = function () {
    console.log('AnnotationsButton is clicked');
};

exports.AddImageButtonClicked = function () {
    let wiD3Ctrl = this.wiLogplot.getwiD3Ctrl();
    let currentTrack = wiD3Ctrl.getCurrentTrack();
    let DialogUtils = this.wiComponentService.getComponent(this.wiComponentService.DIALOG_UTILS);
    let [top, bottom] = wiD3Ctrl.getDepthRangeFromSlidingBar();
    const wiApiService = this.wiApiService;
    if (currentTrack.getImages()[0]) {
        let imageConfig = currentTrack.getImages()[0];
        DialogUtils.imagePropertiesDialog(this.ModalService, wiD3Ctrl, imageConfig, function (config) {
            config.idTrack = currentTrack.id;
            config.location = config.src;
            wiApiService.editImage(config, function () {
                wiD3Ctrl.editImage(currentTrack, config);
            })
        })
        return;
    }
    let defaultConfig = {
        top: top,
        bottom: bottom,
        left: 0,
        width: 100
    }
    DialogUtils.imagePropertiesDialog(this.ModalService, wiD3Ctrl, defaultConfig, function (config) {
        config.idTrack = currentTrack.id;
        config.location = config.src;
        wiApiService.createImage(config, function (image) {
            image.src = image.location;
            wiD3Ctrl.addImageToTrack(currentTrack, image);
        })
    })
};


exports.RemoveImageButtonClicked = function () {
    let wiD3Ctrl = this.wiLogplot.getwiD3Ctrl();
    let currentTrack = wiD3Ctrl.getCurrentTrack();
    if (!currentTrack.getImages()[0]) return;
    let DialogUtils = this.wiComponentService.getComponent(this.wiComponentService.DIALOG_UTILS);
    const wiApiService = this.wiApiService;
    let imageConfig = currentTrack.getImages()[0];
    DialogUtils.confirmDialog(this.ModalService, "Remove Image", `Are you sure to remove image from ${currentTrack.name}?`, function (yes) {
        if (!yes) return;
        wiApiService.removeImage(imageConfig.id, function () {
            wiD3Ctrl.removeImage(currentTrack);
        })
    })
}

exports.AddShadingButtonClicked = function () {
    console.log('AddShadingButton is clicked');
};

exports.CrossPlotButtonClicked = function () {
    this.wiLogplot.getwiD3Ctrl().createCrossplot();
};

exports.HistogramButtonClicked = function () {
    console.log('HistogramButton is clicked');
};
