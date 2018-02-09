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
    this.wiLogplot.getwiD3Ctrl().openPropertiesDialog();
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
    let idWell = Utils.getSelectedNode().properties.idWell;
    DialogUtils.confirmDialog(this.ModalService, "DUPLICATE!", "Do you want to duplicate this plot?", function (yes) {
        if (yes) {
            wiApiService.duplicateLogplot(wiLogplot.id, idWell, function (response) {

                Utils.refreshProjectState();
            });
        }
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
    console.log('scaleTo', wiLogplot);
    let track = $(`wi-logplot[id=${wiLogplot.id}] .vi-track-plot-container`);
    if (!track.length) return false;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let dpCm = utils.getDpcm();
    let wiD3Ctrl = wiLogplot.getwiD3Ctrl();
    let depthRange = wiD3Ctrl.getDepthRange();

    let trackHeight = track.height();
    let heightCm = trackHeight / dpCm;
    let depthHeightCm = heightCm * rangeUnit;
    let depthHeightM = depthHeightCm / 100;
    depthRange[1] = depthRange[0] + depthHeightM;
    if (depthRange[1] > wiD3Ctrl.getMaxDepth()) depthRange[1] = wiD3Ctrl.getMaxDepth();
    wiD3Ctrl.setDepthRange(depthRange, true);
    wiD3Ctrl.processZoomFactor();
    wiD3Ctrl.plotAll();
    wiD3Ctrl.updateScale();
    wiD3Ctrl.adjustSlidingBarFromDepthRange(depthRange);
}

exports.ScalePreviousState = function (top, bottom) {
    let wiLogplot = this.wiLogplot;
    let track = $(`wi-logplot[id=${wiLogplot.id}] .vi-track-plot-container`);
    if (!track.length) return false;
    let wiD3Ctrl = wiLogplot.getwiD3Ctrl();
    let depthRange = new Array(top, bottom);
    if (depthRange[1] > wiD3Ctrl.getMaxDepth()) depthRange[1] = wiD3Ctrl.getMaxDepth();
    wiD3Ctrl.setDepthRange(depthRange, true);
    wiD3Ctrl.processZoomFactor();
    wiD3Ctrl.plotAll();
    wiD3Ctrl.updateScale();
    wiD3Ctrl.adjustSlidingBarFromDepthRange(depthRange);
};

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
    console.log('scale 1:1000');
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

exports.ScaleCustomButtonClicked = function () {
    let self = this;
    let currentScale = parseInt(this.wiLogplot.getwiD3Ctrl().scale);
    let DialogUtils = this.wiComponentService.getComponent(this.wiComponentService.DIALOG_UTILS);
    let promptConfig = {
        title: 'Custom Scale',
        inputName: 'Scale',
        input: currentScale,
        type: 'number'
    }
    DialogUtils.promptDialog(self.ModalService, promptConfig, function (scale) {
        scaleTo(scale, self.wiLogplot, self.wiComponentService);
    })
}
exports.ZoomInButtonClicked = function () {
    this.wiLogplot.getwiD3Ctrl().zoom(false);
};

exports.ZoomOutButtonClicked = function () {
    this.wiLogplot.getwiD3Ctrl().zoom(true);
};

exports.CropDisplayButtonClicked = function () {
    this.wiLogplot.getSlidingbarCtrl().scaleView();
};
exports.RangeSpecificButtonClicked = function () {
    let self = this;
    let DialogUtils = this.wiComponentService.getComponent(this.wiComponentService.DIALOG_UTILS);
    let wiLogplot = this.wiLogplot;
    DialogUtils.rangeSpecificDialog(this.ModalService, this.wiLogplot, function () {
        wiLogplot.getSlidingbarCtrl().scaleView();
    });
}

exports.ViewWholeWellButtonClicked = function () {
    this.wiLogplot.getSlidingbarCtrl().resetView();
    //this.wiApiService.editLogplot({idPlot: this.wiLogplot.id, cropDisplay: false});
};

exports.AddDepthAxisButtonClicked = function () {
    this.wiLogplot.getwiD3Ctrl().addDepthTrack();
};

exports.NewTrackButtonClicked = function () {
    this.wiLogplot.getwiD3Ctrl().addLogTrack();
};

exports.DuplicateTrackButtonClicked = function () {
    const wiComponentService = this.wiComponentService;
    const wiApiService = this.wiApiService;
    const ModalService = this.ModalService;
    const wiLogplot = this.wiLogplot;
    const wiD3Ctrl = wiLogplot.getwiD3Ctrl();
    const currentTrack = wiD3Ctrl.getCurrentTrack();
    const DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    if(!currentTrack.isLogTrack()) {
        // DialogUtils.errorMessageDialog(ModalService, "this track is not a log track. Please select a log track and try again.");
        toastr.error("This track is not a log track. Please select a log track and try again.", 'Error');
        return;
    }
    let timeoutFunc = this.$timeout;
    let trackInfo = currentTrack.getProperties();
    DialogUtils.confirmDialog(this.ModalService, "DUPLICATE!", "Do you want to duplicate this log track?", function (yes) {
        if (yes) {
            wiApiService.duplicateLogTrack({orderNum: wiD3Ctrl.getOrderKey(currentTrack), idTrack: trackInfo.idTrack}, function (aTrack) {
                let trackObj = wiD3Ctrl.pushLogTrack(aTrack);
                // wiD3Ctrl.updateTrack(trackObj);
                timeoutFunc(function () {
                    wiD3Ctrl.getComponentCtrlByProperties(aTrack).update();
                })
            });
        }
    });
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
        } else if (currentTrack.type == 'image-track') {
            wiApiService.removeImageTrack(currentTrack.id, wiD3Ctrl.removeCurrentTrack);
        } else if (currentTrack.type == 'object-track') {
            console.log("deleting track with id: ", currentTrack.id);
            wiApiService.removeObjectTrack(currentTrack.id, wiD3Ctrl.removeCurrentTrack);
        }
    });
};

exports.AddMarkerButtonClicked = function () {
    this.wiLogplot.getwiD3Ctrl().addMarker();
};

exports.AddZoneButtonClicked = function () {
    const currentTrack = this.wiLogplot.getwiD3Ctrl().getCurrentTrack();
    if (currentTrack && currentTrack.isZoneTrack()) {
        currentTrack.setMode('AddZone');
    } else {
        toastr.error('Please select a zonation track and try again.', 'Error');
    }
};

exports.AnnotationsButtonClicked = function () {
    this.wiLogplot.getwiD3Ctrl().addAnnotation();
};

exports.AddImageButtonClicked = function () {
    let wiD3Ctrl = this.wiLogplot.getwiD3Ctrl();
    let currentImgTrack = wiD3Ctrl.getCurrentTrack();
    let DialogUtils = this.wiComponentService.getComponent(this.wiComponentService.DIALOG_UTILS);
    if (currentImgTrack.type != 'image-track') {
        // DialogUtils.errorMessageDialog(this.ModalService, 'Please select a image track for adding an image!');
        toastr.error('Please select an image track for adding an image!', 'Error');
        return;
    }
    const wiApiService = this.wiApiService;
    let imageConfig = wiD3Ctrl.addImageZoneToTrack(currentImgTrack, {});
    let _currentImage = imageConfig.getProperties();
    _currentImage.isNewDraw = true;
    DialogUtils.imageZonePropertiesDialog(this.ModalService, _currentImage, function (props) {
        if (!props) {
            currentImgTrack.removeImage(imageConfig);
            return;
        } else if (props === true) {
            return;
        }
        let isNewDraw = props.isNewDraw;
        props.idImageTrack = currentImgTrack.id;
        delete props.isNewDraw;
        if (isNewDraw) {
            wiApiService.createImage(props, function (imgProps) {
                if (imgProps) {
                    imageConfig.setProperties(imgProps);
                    imageConfig.header.attr('id', 'id' + imageConfig.idImageOfTrack);
                    if (!imageConfig.showName) imageConfig.header.select('div').remove();
                    wiD3Ctrl.getComponentCtrlByViTrack(currentImgTrack).drawImageZone(imageConfig, imgProps, isNewDraw);
                    currentImgTrack.plotImageZone(imageConfig);
                    currentImgTrack.rearrangeHeaders();
                    _currentImage = imageConfig.getProperties();
                }
            });
        } else {
            props.idImageOfTrack = _currentImage.idImageOfTrack;
            wiApiService.editImage(props, function (imgProps) {
                if (imgProps) {
                    imageConfig.setProperties(imgProps);
                    if (!imageConfig.showName) imageConfig.header.select('div').remove();
                    else {
                        imageConfig.header.select('div').remove();
                        delete imageConfig.header;
                        imageConfig.header = currentImgTrack.addImageZoneHeader(imageConfig, false);
                    }
                    wiD3Ctrl.getComponentCtrlByViTrack(currentImgTrack).drawImageZone(imageConfig, imgProps, isNewDraw);
                    imageConfig.doPlot();
                    currentImgTrack.plotImageZone(imageConfig);
                    currentImgTrack.rearrangeHeaders();
                    _currentImage = imageConfig.getProperties();
                }
            });
        }
    })
};


exports.RemoveImageButtonClicked = function () {
    let wiD3Ctrl = this.wiLogplot.getwiD3Ctrl();
    let currentImgTrack = wiD3Ctrl.getCurrentTrack();
    let DialogUtils = this.wiComponentService.getComponent(this.wiComponentService.DIALOG_UTILS);
    const wiApiService = this.wiApiService;
    if(!currentImgTrack || !currentImgTrack.isImageTrack()) {
        toastr.error('this track is not an image track. Please select an image track and try again', 'Error');
        return;
    }
    let imageConfig = currentImgTrack.getCurrentImageZone();
    if (!imageConfig) {
        DialogUtils.errorMessageDialog(this.ModalService, 'Please select an image to remove!');
        return;
    }
    DialogUtils.confirmDialog(this.ModalService, "Remove Image", `Are you sure to remove image from ${currentImgTrack.name}?`, function (yes) {
        if (!yes) return;
        wiApiService.removeImage(imageConfig.idImageOfTrack, function () {
            currentImgTrack.removeImage(imageConfig);
        })
    })
}

exports.AddShadingButtonClicked = function () {
    this.wiLogplot.getwiD3Ctrl().createShadingForSelectedCurve();
};

exports.CrossPlotButtonClicked = function () {
    this.wiLogplot.getwiD3Ctrl().createCrossplot();
};

exports.HistogramButtonClicked = function () {
    this.wiLogplot.getwiD3Ctrl().createHistogram();
};

exports.ExportTrackButtonClicked = function () {
    console.log("EXPORT TRACK");
    const wiApiService = this.wiApiService;
    const wiLogplot = this.wiLogplot;
    const currentTrack = wiLogplot.getwiD3Ctrl().getCurrentTrack();
    let trackData = {
        idTrack: currentTrack.id,
        idPlot: currentTrack.idPlot
    }
    wiApiService.exportLogTrack(trackData, function (data, type) {
        // console.log("DATA NA`" + data);
        let blob = new Blob([data], {
            type: type
        });
        let a = document.createElement('a');
        let fileName = currentTrack.name.trim().replace(/ /g, '') + '.track';
        a.download = fileName;
        a.href = URL.createObjectURL(blob);
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        a.parentNode.removeChild(a);
    });
}

exports.ImportTrackButtonClicked = function () {
    console.log("IMPORT TRACK");
    const wiApiService = this.wiApiService;
    const wiLogplot = this.wiLogplot;
    let utils = this.wiComponentService.getComponent(this.wiComponentService.UTILS);
    const DialogUtils = this.wiComponentService.getComponent(this.wiComponentService.DIALOG_UTILS);
    let wiD3Ctrl = wiLogplot.getwiD3Ctrl();
    let timeoutFunc = this.$timeout;
    const currentTrack = wiLogplot.getwiD3Ctrl().getCurrentTrack();
    let trackData = {
        idTrack: currentTrack.id,
        idPlot: currentTrack.idPlot,
        idWell: wiLogplot.getLogplotModel().properties.idWell
    }
    let fileInput = document.createElement('input');
    fileInput.style.display = 'none';
    fileInput.type = 'file';
    fileInput.accept = '.track';
    // fileInput.setAttribute('ngf-select', '');
    document.body.appendChild(fileInput);
    fileInput.click();
    fileInput.addEventListener('change', function (event) {
        document.body.removeChild(fileInput);
        trackData.file = fileInput.files[0];
        wiApiService.postWithTrackTemplateFile(trackData).then(function (response) {
            let aTrack = response.content;
            aTrack.orderNum = wiD3Ctrl.getOrderKey(currentTrack);
            wiApiService.editTrack(aTrack, function (t) {
                let trackObj = wiD3Ctrl.pushLogTrack(t);
                // wiD3Ctrl.updateTrack(trackObj);
                timeoutFunc(function () {
                    wiD3Ctrl.getComponentCtrlByProperties(t).update();
                })
            });
        }).catch(err => {
            console.log(err);
        });
    }, true);
}
exports.AutoSizeTrackButtonClicked = function () {
    let self = this;
    let DialogUtils = this.wiComponentService.getComponent(this.wiComponentService.DIALOG_UTILS);
    let wiLogplot = this.wiLogplot;
    let timeoutFunc = this.$timeout;
    DialogUtils.autoSizeTrackDialog(this.ModalService, wiLogplot, function () {

    });
};

exports.TrackBulkUpdateButtonClicked = function () {
    let self = this;
    let DialogUtils = this.wiComponentService.getComponent(this.wiComponentService.DIALOG_UTILS);
    let wiLogplot = this.wiLogplot;
    let allTracks = wiLogplot.getwiD3Ctrl().getTracks();
    console.log("allTracks", wiLogplot);
    DialogUtils.trackBulkUpdateDialog(this.ModalService, allTracks, wiLogplot.id, function () {

    });
};

exports.CurveBulkUpdateButtonClicked = function () {
    let self = this;
    let DialogUtils = this.wiComponentService.getComponent(this.wiComponentService.DIALOG_UTILS);
    let wiLogplot = this.wiLogplot;
    let timeoutFunc = this.$timeout;

    let logTracks = wiLogplot.getwiD3Ctrl().getTracks().filter(track => track.type == 'log-track');
    DialogUtils.curveBulkUpdateDialog(this.ModalService, logTracks, function () {

    });
};


exports.SaveAsLogplotNameButtonClicked = function () {
    const wiApiService = this.wiApiService;
    const wiLogplot = this.wiLogplot;
    let wics = this.wiComponentService;
    let mds = this.ModalService;
    console.log(wiLogplot);
    let DialogUtils = wics.getComponent(this.wiComponentService.DIALOG_UTILS);
    let Utils = wics.getComponent(wics.UTILS);
    let promptConfig = {
        title: '<span class="logplot-new-16x16"></span> Save As Logplot',
        inputName: 'Name',
        input: wiLogplot.logplotModel.properties.name
    };
    DialogUtils.promptDialog(mds, promptConfig, function (logplotName) {
        let idWell = wiLogplot.logplotModel.properties.idWell;
        let idPlot = wiLogplot.logplotModel.properties.idPlot;
        let plots = wics.getComponent(wics.PROJECT_LOADED).wells.find(w => w.idWell == idWell).plots;
        let isExisted = false;
        plots.forEach(function (plot, index) {
            if(plot.name == logplotName){
                isExisted = true;
                return;
            }
        });
        if(isExisted){
            DialogUtils.confirmDialog(mds, 'Existed!', 'Logplot '+ logplotName +' is existed! OVERWRITE IT?', function (yes) {
                if(yes){
                    wiApiService.savePlotAs({name: logplotName, idWell : idWell, idPlot: idPlot}, function (response) {
                        console.log("==============", response);
                        Utils.refreshProjectState();
                        // Utils.openLogplotTab(wics, Utils.getModel('logplot', response.idPlot));
                    });
                }
            });
        } else {
            wiApiService.savePlotAs({name: logplotName, idWell : idWell, idPlot: idPlot}, function (response) {
                console.log("=============", response);
                Utils.refreshProjectState();
                // Utils.openLogplotTab(wics, Utils.getModel('logplot', response.idPlot));
            });
        }
    });
}

exports.FitWindowButtonClicked = function() {
    console.log('FitWindowButton is clicked');
    this.wiLogplot.getwiD3Ctrl().toggleFitWindow()

}

exports.ReferenceLineButtonClicked = function() {
    console.log('ReferenceLineButton is clicked');
    this.wiLogplot.getwiD3Ctrl().toggleReferenceLine()
}

exports.TooltipButtonClicked = function() {
    console.log('TooltipButton is clicked');
    this.wiLogplot.getwiD3Ctrl().toggleTooltip()
}

exports.EditCurveButtonClicked = function() {
    console.log('EditCurveButton is clicked');
}

exports.BaselineShiftButtonClicked = function() {
    console.log('BaselineShiftButton is clicked');
}

exports.DepthShiftButtonClicked = function() {
    console.log('DepthShiftButton is clicked');
    this.wiLogplot.getwiD3Ctrl().depthShiftDialog();
}
