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
        // console.log("DATA NA`" + data);
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

function scaleTo1(rangeUnit, wiLogplot, wiComponentService) {
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
    console.log('CropDisplayButton is clicked');
};
exports.RangeSpecificButtonClicked = function () {
    let self = this;
    let DialogUtils = this.wiComponentService.getComponent(this.wiComponentService.DIALOG_UTILS);
    let wiLogplot = this.wiLogplot;
    let timeoutFunc = this.$timeout;
    DialogUtils.rangeSpecificDialog(this.ModalService, this.wiLogplot, function () {
        timeoutFunc(function () {
            wiLogplot.getSlidingbarCtrl().scaleView();
        }, 1000);
    });
}

exports.ViewWholeWellButtonClicked = function () {
    this.wiLogplot.getSlidingbarCtrl().resetView();
    console.log('ViewWholeWellButton is clicked');
};

exports.AddDepthAxisButtonClicked = function () {
    this.wiLogplot.getwiD3Ctrl().addDepthTrack();
};

exports.NewTrackButtonClicked = function () {
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
    const currentTrack = wiLogplot.getwiD3Ctrl().getCurrentTrack();
    let trackData = {
        idTrack: currentTrack.id,
        idPlot: currentTrack.idPlot,
        idWell: wiLogplot.getLogplotModel().properties.idWell
    }
    let fileInput = document.createElement('input');
    fileInput.style.display = 'none';
    fileInput.type = 'file';
    // fileInput.setAttribute('ngf-select', '');
    document.body.appendChild(fileInput);
    fileInput.click();
    fileInput.addEventListener('change', function (event) {
        document.body.removeChild(fileInput);
        trackData.file = fileInput.files[0];
        wiApiService.postWithTrackTemplateFile(trackData).then(function (response) {
            console.log("aTrack", response);
            let aTrack = response.content;
            let trackObj = wiD3Ctrl.pushLogTrack(aTrack);
            utils.getPalettes(function (paletteList) {
                function drawAllShadings(someTrack, trackObj) {
                    someTrack.shadings.forEach(function (shading) {
                        let shadingModel = utils.shadingToTreeConfig(shading, paletteList);
                        let linesOfTrack = trackObj.getCurves();
                        console.log("LinhTinh:", linesOfTrack, shading, shadingModel);
                        let lineObj1 = null;
                        let lineObj2 = null;

                        if (!shadingModel.idRightLine) return;
                        if (!shadingModel.idLeftLine) {
                            for (let line of linesOfTrack) {
                                if (line.id == shading.idRightLine) {
                                    lineObj1 = line;
                                }
                            }
                            wiD3Ctrl.addCustomShadingToTrack(trackObj, lineObj1, shadingModel.data.leftX, shadingModel.data);
                        }
                        else {
                            for (let line of linesOfTrack) {
                                if (line.id == shading.idRightLine) {
                                    lineObj1 = line;
                                }
                                if (line.id == shading.idLeftLine) {
                                    lineObj2 = line;
                                }
                            }
                            wiD3Ctrl.addPairShadingToTrack(trackObj, lineObj2, lineObj1, shadingModel.data);
                        }
                    });
                };
                if (aTrack.markers) {
                    aTrack.markers.forEach(function (marker) {
                        wiD3Ctrl.addMarkerToTrack(trackObj, marker);
                    });
                }
                if (aTrack.images) {
                    aTrack.images.forEach(function (image) {
                        image.src = image.location;
                        wiD3Ctrl.addImageToTrack(trackObj, image);
                    });
                }
                let eventEmitter = new EventEmitter();
                let lineCount = 0;
                let lineNum = aTrack.lines ? aTrack.lines.length : 0;
                eventEmitter.on('line-drawed', function (someTrack) {
                    console.log(someTrack);
                    lineCount++;
                    if (lineCount == lineNum) {
                        drawAllShadings(someTrack, trackObj);
                    }
                });
                if (aTrack.images) {
                    aTrack.lines.forEach(function (line) {
                        utils.getCurveData(wiApiService, line.idCurve, function (err, data) {
                            let lineModel = utils.lineToTreeConfig(line);
                            if (!err) {
                                wiD3Ctrl.addCurveToTrack(trackObj, data, lineModel.data);
                            }
                            else {
                                console.error(err);
                                wiComponentService.getComponent(wiComponentService.UTILS).error(err);
                            }
                            eventEmitter.emitEvent('line-drawed', [aTrack]);
                        });
                    });
                }
                setTimeout(function () {
                    if (response.reason == "CURVE_NOT_FOUND") {
                        let message = "";
                        aTrack.errorCurve.forEach(function (r) {
                            message += "Curve: " + r.dataset + "." + r.curve + " Not exist! <br>";
                        });
                        utils.warning(message);
                    }
                }, 1000);
            });

        }).catch(err => {
            console.log(err);
        });
    }, true);
}
exports.AutoSizeTrackButtonClicked = function () {
    console.log("AutoSizeTrackCheckboxClicked");
    let self = this;
    let DialogUtils = this.wiComponentService.getComponent(this.wiComponentService.DIALOG_UTILS);
    let wiLogplot = this.wiLogplot;
    let timeoutFunc = this.$timeout;
    DialogUtils.autoSizeTrackDialog(this.ModalService, wiLogplot, function () {

    });
};

exports.TrackBolkUpdateButtonClicked = function () {
    console.log("TrackBulkUpdateButtonClicked");
    let self = this;
    let DialogUtils = this.wiComponentService.getComponent(this.wiComponentService.DIALOG_UTILS);
    let wiLogplot = this.wiLogplot;
    let allTracks = wiLogplot.getwiD3Ctrl().getTracks();
    console.log("allTracks", allTracks);
    DialogUtils.trackBulkUpdateDialog(this.ModalService, allTracks, function () {

    });
};

exports.CurveBolkUpdateButtonClicked = function () {
    console.log("CurveBulkUpdateButtonClicked");
    let self = this;
    let DialogUtils = this.wiComponentService.getComponent(this.wiComponentService.DIALOG_UTILS);
    let wiLogplot = this.wiLogplot;
    let timeoutFunc = this.$timeout;
    DialogUtils.curveBulkUpdateDialog(this.ModalService, wiLogplot, function () {

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