const componentName = 'wiD3ImageTrack';
const moduleName = 'wi-d3-image-track';
const componentAlias = 'wiD3Track';

let wiD3AbstractTrack = require('./wi-d3-abstract-track.js');
Controller.prototype = Object.create(wiD3AbstractTrack.prototype);
Controller.prototype.constructor = Controller;

function Controller ($scope, wiComponentService, wiApiService, ModalService, $timeout) {
    wiD3AbstractTrack.call(this, wiApiService, wiComponentService);
    let self = this;
    let Utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let graph = wiComponentService.getComponent(wiComponentService.GRAPH);
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let props = null;
    let contextMenu = [{
        name: "TrackProperties",
        label: "Track Properties",
        icon: 'track-properties-16x16',
        handler: function() {
            self.openPropertiesDialog()
        }
    }, {
        separator: '1'
    }, {
        name: "AddImage",
        label: "Add Image",
        icon: "image-16x16",
        handler: function () {
            self.viTrack.setMode('AddImageZone');
        }
    }, {
        separator: '1'
    }];

    this.getContextMenu = function () {
        if (self.isImageZoneRightClicked) {
            self.isImageZoneRightClicked = false;
            return _getImageZoneContextMenu();
        } else {
            return _(contextMenu).concat(self.wiD3Ctrl.getContextMenu()).value();
        }
    }

    this.openPropertiesDialog = function () {
        let viTrack = self.viTrack;
        let trackProps = viTrack.getProperties();
        trackProps.isCreated = true;
        DialogUtils.imageTrackPropertiesDialog(ModalService, trackProps, function (props) {
            if (props) {
                viTrack.removeAllDrawings();
                props.idImageTrack = viTrack.id;
                console.log(props);
                wiApiService.editImageTrack(props, function (data) {
                    $timeout(function () {
                        data.width = Utils.inchToPixel(data.width);
                        viTrack.setProperties(data);
                        for (let img of data.image_of_tracks) {
                            self.addImageZoneToTrack(viTrack, img);
                        }
                        viTrack.doPlot(true);
                    });
                });
            }
        });
    }

    this.openPropertiesWindow = function () {
        let viTrack = self.viTrack;
        let props = viTrack.getProperties();
        props.width = utils.pixelToInch(props.width);

        wiComponentService.emit("update-properties", {
            type: 'd3-imagetrack', 
            props: props
        });
    }

    this.addImageZoneToTrack = function (track, config) {
        if (!track || !track.addImageZone) return;
        let imgzone = track.addImageZone(config, track);

        if (imgzone.idImageOfTrack) imgzone.header.attr('id', 'id' + imgzone.idImageOfTrack);

        track.plotImageZone(imgzone);
        track.rearrangeHeaders();
        track.onImageZoneMouseDown(imgzone, function() {
            if (d3.event.button == 2) {
                self.isImageZoneRightClicked = true;
                // _imageZoneOnRightClick();
            }
        });
        track.onImageZoneHeaderMouseDown(imgzone, function() {
            let depthRange = imgzone.getDepthRange();
            let rangeValue = depthRange[1] - depthRange[0];
            depthRange[0] -= rangeValue * 0.5;
            depthRange[1] += rangeValue * 0.5;

            self.wiD3Ctrl.setDepthRange(depthRange);
            self.wiD3Ctrl.adjustSlidingBarFromDepthRange(depthRange);
            if (d3.event.button == 2) {
                // _imageZoneOnRightClick();
                self.isImageZoneRightClicked = true;
            }
        });

        imgzone.on('dblclick', _imageZoneOnDoubleClick);
        imgzone.header.on('dblclick', _imageZoneOnDoubleClick);
        imgzone.onLineDragEnd(function () {
            let image = track.adjustImage(imgzone);
            image.idImageOfTrack = imgzone.idImageOfTrack;
            // send api to edit image
            wiApiService.editImage(image, function (imgProps) {
                if (imgProps) {
                    $timeout(function () {
                        imgzone.setProperties(imgProps);
                    });
                }
            });
            track.plotImageZone(imgzone);
            track.setMode(null);
            track.rearrangeHeaders();
        });
        return imgzone;
    }

    this.onTrackKeyPressCallback = function () {
        if(!d3.event) return;
        let track = self.viTrack;
        switch(d3.event.key) {
            case 'Backspace':
            case 'Delete':
                let drawing = track.getCurrentDrawing();
                if (!drawing) return;
                if (drawing.isImageZone()) {
                    // Send api before deleting
                    wiApiService.removeImage(drawing.idImageOfTrack, function () {
                        track.removeDrawing(drawing);
                    })
                }
            case 'Escape':
                // Bug
                if (track && track.setMode) track.setMode(null);
                return;
        }
    }

    this.$onInit = function () {
        wiD3AbstractTrack.prototype.$onInit.call(self);
        self.plotAreaId = self.name + 'PlotArea';

    }

    this.onReady = function () {
        self.viTrack = createVisualizeImageTrack(self.getProperties());
        self.registerTrackCallback();
        self.registerTrackHorizontalResizerDragCallback();
        self.viTrack.on('keydown', self.onTrackKeyPressCallback);
        self.registerTrackMouseEventHandlers();
        self.getProperties().controller = self;
        if(self.wiD3Ctrl) self.wiD3Ctrl.registerTrackDragCallback(self);
        
        wiApiService.getImagesOfTrack(self.viTrack.id, function (images) {
            for (let img of images) {
                self.addImageZoneToTrack(self.viTrack, img);
            }
        });

        /* register when track mode = add image zone */
        let track = self.viTrack;
        let imgzone;
        track.plotContainer.call(d3.drag()
            .on('start', function () {
                track.setCurrentDrawing(null);
                if (track.mode != 'AddImageZone') return;
                track.startY = d3.mouse(track.plotContainer.node())[1];
            })
            .on('drag', function () {
                if (track.mode != 'AddImageZone') return;
                let y1 = d3.mouse(track.plotContainer.node())[1];
                let y2 = track.startY;
                let minY = d3.min([y1, y2]);
                let maxY = d3.max([y1, y2]);
                imgzone = track.getCurrentImageZone();

                if (!imgzone) {
                    imgzone = self.addImageZoneToTrack(track, {
                        minY: track.minY,
                        maxY: track.maxY
                    });
                    track.setCurrentDrawing(imgzone);
                }
                if (!imgzone) {
                    track.setMode(null);
                    return;
                }
                let transformY = imgzone.getTransformY();
                let topDepth = transformY.invert(minY);
                let bottomDepth = transformY.invert(maxY);
                imgzone.setProperties({
                    topDepth: topDepth,
                    bottomDepth: bottomDepth,
                    fill: 'white'
                });
                track.plotImageZone(imgzone);
            })
            .on('end', function () {
                if (track.mode != 'AddImageZone') return;

                let _currentImage = imgzone.getProperties();
                _currentImage.isNewDraw = true;

                DialogUtils.imageZonePropertiesDialog(ModalService, _currentImage, function (props) {
                    if (!props) {
                        track.removeImage(imgzone);
                        return;
                    } else if (props === true) {
                        return;
                    }
                    let isNewDraw = props.isNewDraw;
                    props.idImageTrack = track.id;
                    delete props.isNewDraw;
                    if (isNewDraw) {
                        wiApiService.createImage(props, function (imgProps) {
                            if (imgProps) {
                                $timeout(function () {
                                    imgzone.setProperties(imgProps);
                                    imgzone.header.attr('id', 'id' + imgzone.idImageOfTrack);
                                    if (!imgzone.showName) imgzone.header.select('div').remove();
                                    self.drawImageZone(imgzone, imgProps, isNewDraw);
                                    track.plotImageZone(imgzone);
                                    track.rearrangeHeaders();
                                    _currentImage = imgzone.getProperties();
                                });
                            }
                        });
                    } else {
                        props.idImageOfTrack = _currentImage.idImageOfTrack;
                        wiApiService.editImage(props, function (imgProps) {
                            if (imgProps) {
                                $timeout(function () {
                                    imgzone.setProperties(imgProps);
                                    if (!imgzone.showName) imgzone.header.select('div').remove();
                                    else {
                                        imgzone.header.select('div').remove();
                                        delete imgzone.header;
                                        imgzone.header = track.addImageZoneHeader(imgzone, false);
                                    }
                                    self.drawImageZone(imgzone, imgProps, isNewDraw);
                                    track.onImageZoneHeaderMouseDown(imgzone, function() {
                                        let depthRange = imgzone.getDepthRange();
                                        let rangeValue = depthRange[1] - depthRange[0];
                                        depthRange[0] -= rangeValue * 0.5;
                                        depthRange[1] += rangeValue * 0.5;

                                        self.wiD3Ctrl.setDepthRange(depthRange);
                                        self.wiD3Ctrl.adjustSlidingBarFromDepthRange(depthRange);
                                        if (d3.event.button == 2) {
                                            self.isImageZoneRightClicked = true;
                                            // _imageZoneOnRightClick();
                                        }
                                    });
                                    imgzone.doPlot();
                                    track.plotImageZone(imgzone);
                                    track.rearrangeHeaders();
                                    _currentImage = imgzone.getProperties();
                                });
                            }
                        });
                    }
                });
                track.setMode(null);
            })
        );
        wiComponentService.on('update-imagetrack-' + self.viTrack.id, function(res) {
           $timeout(function () {
                res.width = Utils.inchToPixel(res.width);
                self.viTrack.setProperties(res);
                self.viTrack.doPlot(true);
            });   
        });
    }

    this.drawImageZone = function (imgzone, props, isNewDraw) {
        if (!imgzone) return;
        let imageConfig = {
            fill: props.fill,
            imageUrl: props.imageUrl,
            smartDisplay: props.smartDisplay
        };
        imgzone.drawImage(imageConfig, isNewDraw);
    }

    function createVisualizeImageTrack(imageTrack) {
        let config = angular.copy(imageTrack);
        config.id = imageTrack.idImageTrack;
        config.name = imageTrack.title;

        // TO BE REMOVED
        // config.yStep = parseFloat(self.wiD3Ctrl.getWellProps().step);
        // config.offsetY = parseFloat(self.wiD3Ctrl.getWellProps().topDepth);

        config.width = Utils.inchToPixel(imageTrack.width);
        config.wiComponentService = wiComponentService;
        config.bgColor = imageTrack.background;
        console.log('image track config', config);
        let track = graph.createImageTrack(config, document.getElementById(self.plotAreaId));

        wiComponentService.putComponent('vi-image-track-' + config.id, track);
        return track;
    }

    function showImage() {
        let imgzone = self.viTrack.getCurrentImageZone();
        DialogUtils.showImageDialog(ModalService, imgzone.getProperties(), self.wiD3Ctrl.trackComponents, function () {
        });
    }

    function imageProperties() {
        let viTrack = self.viTrack;
        let track = viTrack;
        let imgzone = track.getCurrentImageZone();
        imgzone.setProperties({
            done: true
        });
        let _currentImage = imgzone.getProperties();
        DialogUtils.imageZonePropertiesDialog(ModalService, _currentImage, function (props) {
            if (!props || props === true) return;
            wiApiService.editImage(props, function (imgProps) {
                if (imgProps) {
                    $timeout(function () {
                        imgzone.setProperties(imgProps);
                        imgzone.header.select('div').remove();
                        delete imgzone.header;
                        imgzone.header = track.addImageZoneHeader(imgzone, false);
                		self.drawImageZone(imgzone, imgProps, false);
                        imgzone.doPlot();
                        track.onImageZoneHeaderMouseDown(imgzone, function() {
                            let depthRange = imgzone.getDepthRange();
                            let rangeValue = depthRange[1] - depthRange[0];
                            depthRange[0] -= rangeValue * 0.5;
                            depthRange[1] += rangeValue * 0.5;

                            self.wiD3Ctrl.setDepthRange(depthRange);
                            self.wiD3Ctrl.adjustSlidingBarFromDepthRange(depthRange);
                            if (d3.event.button == 2) {
                                _imageZoneOnRightClick();
                            }
                        });
                        track.plotImageZone(imgzone);
                        track.rearrangeHeaders();
                    });
                    track.setMode(null);
                }
            });
        });
    }

    function _getImageZoneContextMenu() {
        let viTrack = self.viTrack;
        let imgzone = viTrack.getCurrentImageZone();
        return [
            {
                name: "ImageProperties",
                label: "Image Properties",
                icon: "imgzone-edit-16x16",
                handler: imageProperties
            }, {
                name: "ShowImage",
                label: "Show Image",
                icon: "imgzone-show-16x16",
                handler: showImage
            }, {
                name: "RemoveImage",
                label: "Remove Image",
                icon: "imgzone-delete-16x16",
                handler: function () {
                    wiApiService.removeImage(imgzone.idImageOfTrack, function () {
                        viTrack.removeImage(imgzone);
                    });
                }
            }
        ];
        /*
        self.wiD3Ctrl.setContextMenu([
            {
                name: "ImageProperties",
                label: "Image Properties",
                icon: "imgzone-edit-16x16",
                handler: imageProperties
            }, {
                name: "ShowImage",
                label: "Show Image",
                icon: "imgzone-show-16x16",
                handler: showImage
            }, {
                name: "RemoveImage",
                label: "Remove Image",
                icon: "imgzone-delete-16x16",
                handler: function () {
                    wiApiService.removeImage(imgzone.idImageOfTrack, function () {
                        viTrack.removeImage(imgzone);
                    });
                }
            }
        ]);
        */
    }

    function _imageZoneOnDoubleClick() {
        imageProperties();
        // Prevent track properties dialog from opening
        d3.event.stopPropagation();
    }

}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: '../wi-d3-track-template.html',
    controller: Controller,
    controllerAs: componentAlias,
    transclude: true,
    bindings: {
        name: '@',
        wiD3Ctrl: '<',
        properties: '<',
        minY: '<',
        maxY: '<'
    }
});
exports.name = moduleName;
