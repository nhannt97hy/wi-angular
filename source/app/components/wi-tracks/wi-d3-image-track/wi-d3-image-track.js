const componentName = 'wiD3ImageTrack';
const moduleName = 'wi-d3-image-track';
const componentAlias = 'wiD3Track';

function Controller ($scope, wiComponentService, wiApiService, ModalService, $timeout) {
    let self = this;
    let Utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let graph = wiComponentService.getComponent(wiComponentService.GRAPH);
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let props = null;

    this.showContextMenu = function (event) {
        if(self.isImageZoneRightClicked) {
            _imageZoneOnRightClick();
            self.isImageZoneRightClicked = false;
        } else {
            let items = self.wiD3Ctrl.getCommonContextMenuItems();
            let track = self.viTrack;
            items.trackItemsCreation.push({
                name: "AddImage",
                label: "Add Image",
                icon: "image-16x16",
                handler: function () {
                    track.setMode('AddImageZone');
                }
            });
            self.wiD3Ctrl.setContextMenu(self.wiD3Ctrl.buildContextMenu(items));
        }
    }
    this.openPropertiesDialog = function () {
        let _currentTrack = self.wiD3Ctrl.getCurrentTrack();
        let track = _currentTrack.getProperties();
        track.isCreated = true;
        DialogUtils.imageTrackPropertiesDialog(ModalService, self.wiD3Ctrl.wiLogplotCtrl, track, function (props) {
            if (props) {
                _currentTrack.removeAllDrawings();
                props.idImageTrack = _currentTrack.id;
                console.log(props);
                wiApiService.editImageTrack(props, function (data) {
                    $timeout(function () {
                        data.width = Utils.inchToPixel(data.width);
                        _currentTrack.setProperties(data);
                        for (let img of data.image_of_tracks) {
                            self.addImageZoneToTrack(_currentTrack, img);
                        }
                        _currentTrack.doPlot(true);
                    });
                });
            }
        });
    }
    this.addImageZoneToTrack = function (track, config) {
        if (!track || !track.addImageZone) return;
        let imgzone = track.addImageZone(config, track);

        if (imgzone.idImageOfTrack) imgzone.header.attr('id', 'id' + imgzone.idImageOfTrack);

        track.plotImageZone(imgzone);
        track.rearrangeHeaders();
        track.onImageZoneMouseDown(imgzone, function() {
            self.wiD3Ctrl.setCurrentTrack(track);
            if (d3.event.button == 2) {
                self.isImageZoneRightClicked = true;
                // _imageZoneOnRightClick();
            }
        });
        track.onImageZoneHeaderMouseDown(imgzone, function() {
            self.wiD3Ctrl.setCurrentTrack(track);
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

    this.$onInit = function () {
        self.plotAreaId = self.name + 'PlotArea';
    }
    this.onReady = function () {
        self.viTrack = createVisualizeImageTrack(getProperties());
        self.wiD3Ctrl.subscribeTrackCtrlWithD3Ctrl(self);

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
                                        self.wiD3Ctrl.setCurrentTrack(track);
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
    }

    function createVisualizeImageTrack(imageTrack) {
        let config = angular.copy(imageTrack);
        config.id = imageTrack.idImageTrack;
        config.name = imageTrack.title;
        config.yStep = parseFloat(self.wiD3Ctrl.getWellProps().step);
        config.offsetY = parseFloat(self.wiD3Ctrl.getWellProps().topDepth);
        config.width = Utils.inchToPixel(imageTrack.width);
        config.wiComponentService = wiComponentService;
        config.bgColor = imageTrack.background;
        console.log('image track config', config);
        let track = graph.createImageTrack(config, document.getElementById(self.plotAreaId));

        wiComponentService.putComponent('vi-image-track-' + config.id, track);
        return track;
    }
    function getProperties() {
        if(!props) {
            props = self.wiD3Ctrl.trackComponents.find(function(track) { return track.name == self.name}).props;
        }
        return props;
    }
    function showImage() {
        let _currentTrack = self.wiD3Ctrl.getCurrentTrack();
        let track = _currentTrack;
        let imgzone = track.getCurrentImageZone();
        DialogUtils.showImageDialog(ModalService, imgzone.getProperties(), self.wiD3Ctrl.trackComponents, function () {
        });
    }
    function imageProperties() {
        let _currentTrack = self.wiD3Ctrl.getCurrentTrack();
        let track = _currentTrack;
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
                            self.wiD3Ctrl.setCurrentTrack(track);
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
    function _imageZoneOnRightClick() {
        let _currentTrack = self.wiD3Ctrl.getCurrentTrack();
        let imgzone = _currentTrack.getCurrentImageZone();
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
                        _currentTrack.removeImage(imgzone);
                    });
                }
            }
        ]);
    }
    function _imageZoneOnDoubleClick() {
        imageProperties();
        // Prevent track properties dialog from opening
        d3.event.stopPropagation();
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
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: '../wi-d3-track-template.html',
    controller: Controller,
    controllerAs: componentAlias,
    transclude: true,
    bindings: {
        name: '@',
        wiD3Ctrl: '<'
    }
});
exports.name = moduleName;
