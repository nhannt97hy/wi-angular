let helper = require('./DialogHelper');
module.exports = function (ModalService, imageTrackProperties, callback) {
    function ModalController($scope, wiComponentService, wiApiService, close, $timeout) {
        const _NEW = 'created';
        const _EDIT = 'edited';
        const _DEL = 'deleted';

        let self = this;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let props = imageTrackProperties || {
            showTitle: true,
            title: "New Image Track",
            topJustification: "center",
            background: '#ffffff',
            width: utils.inchToPixel(2)
            // parameterSet: null
        }
        props.width = utils.pixelToInch(props.width);

        this.showTitle = props.showTitle;
        this.title = props.title;
        this.topJustification = props.topJustification.toLowerCase();
        this.background = props.background;
        this.width = props.width;
        this.zoomFactor = props.zoomFactor || 1;

        this._DEL = _DEL;
        this.imagesOfCurrentTrack = [];
        this.status = false;

        this.arePropsChanged = false;
        this.isCreated = props.isCreated;
        this.wasApplyButtonClicked = false;

        this.message = '';

        this.trackBackground = function () {
            DialogUtils.colorPickerDialog(ModalService, self.background, function (colorStr) {
                self.background = colorStr;
                self.arePropsChanged = true;
            });
        }

        if (props.idImageTrack) {
            self.status = true;
            wiApiService.getImageTrack(props.idImageTrack, function (data) {
                self.imagesOfCurrentTrack = data.image_of_tracks;
            });

            this.selectedRow = this.imagesOfCurrentTrack && this.imagesOfCurrentTrack.length ? 0 : -1;

            this.setClickedRow = function (indexRow) {
                self.selectedRow = indexRow;
            }
            this.selectColor = function (index) {
                DialogUtils.colorPickerDialog(ModalService, self.imagesOfCurrentTrack[index].fill, function (colorStr) {
                    self.imagesOfCurrentTrack[index].fill = colorStr;
                    self.onImageChanged(index);
                });
            }
            this.configImage = function (index) {
                self.imagesOfCurrentTrack[index].done = true;
                DialogUtils.imageZonePropertiesDialog(ModalService, self.imagesOfCurrentTrack[index], function (data) {
                    if (!data || data === true) return;
                    self.imagesOfCurrentTrack[index] = data;
                    self.onImageChanged(index);
                });
            }

            this.addImage = function (index) {
                let newImage = {
                    // name: 'New Image',
                    fill: 'white',
                    showName: true,
                    flag: _NEW
                };

                self.imagesOfCurrentTrack.splice(index, 0, newImage);
                self.selectedRow = self.imagesOfCurrentTrack.length - 1;
            }
            this.onAddButtonClicked = function () {
                self.addImage(self.imagesOfCurrentTrack.length);
                self.arePropsChanged = true;
            }
            this.onImageChanged = function(index) {
                if (typeof self.imagesOfCurrentTrack[index].flag === 'undefined') {
                    self.imagesOfCurrentTrack[index].flag = _EDIT;
                }
                self.arePropsChanged = true;
            }
            this.onDeleteButtonClicked = function () {
                if (self.imagesOfCurrentTrack[self.selectedRow].flag != _NEW) {
                    self.imagesOfCurrentTrack[self.selectedRow].flag = _DEL;
                } else {
                    self.imagesOfCurrentTrack.splice(self.selectedRow, 1);
                }
                self.selectedRow = self.selectedRow > 0 ? self.selectedRow - 1 : 0;
                self.arePropsChanged = true;
            }
            this.onClearAllButtonClicked = function () {
                self.imagesOfCurrentTrack.map(function(i){
                    i.flag = _DEL;
                })
                self.selectedRow = -1;
                self.arePropsChanged = true;
            }
        }

        function doApply (callback) {
            if (self.imagesOfCurrentTrack && self.imagesOfCurrentTrack.length) {
                async.eachOfSeries(self.imagesOfCurrentTrack, function(image, i, callback) {
                    switch (self.imagesOfCurrentTrack[i].flag) {
                        case _NEW:
                            self.message = isValidImageInfo(self.imagesOfCurrentTrack[i]);
                            if (self.message !== '') {
                                toastr.error(self.message + 'cannot be blank');
                                self.isValid = false;
                                break;
                            }
                            self.isValid = true;
                            delete self.imagesOfCurrentTrack[i].flag;
                            self.imagesOfCurrentTrack[i].idImageTrack = imageTrackProperties.idImageTrack;
                            wiApiService.createImage(self.imagesOfCurrentTrack[i], function(data) {
                                self.imagesOfCurrentTrack[i] = data;
                                callback();
                            });
                            break;

                        case _EDIT:
                            self.message = isValidImageInfo(self.imagesOfCurrentTrack[i]);
                            if (self.message !== '') {
                                toastr.error(self.message + 'cannot be blank');
                                self.isValid = false;
                                break;
                            }
                            self.isValid = true;
                            delete self.imagesOfCurrentTrack[i].flag;
                            self.imagesOfCurrentTrack[i].idImageTrack = imageTrackProperties.idImageTrack;
                            wiApiService.editImage(self.imagesOfCurrentTrack[i], function(data) {
                                self.imagesOfCurrentTrack[i] = data;
                                callback();
                            });
                            break;

                        case _DEL:
                            wiApiService.removeImage(self.imagesOfCurrentTrack[i].idImageOfTrack, function() {
                                callback();
                            });
                            break;

                        default:
                            self.isValid = true;
                            callback();
                            break;
                    }
                }, function (err) {
                    for (let i = self.imagesOfCurrentTrack.length - 1; i >= 0; i--) {
                        switch (self.imagesOfCurrentTrack[i].flag) {
                            case _DEL:
                                self.imagesOfCurrentTrack.splice(i, 1);
                                break;

                            case _NEW:
                            case _EDIT:
                                delete self.imagesOfCurrentTrack[i].flag;
                                break;
                        }
                    }
                    utils.refreshProjectState().then(function() {
                        if (callback) callback();
                    });
                });
            } else {
                if (callback) callback();
            }
        }

        function isValidImageInfo (image) {
            let message = '';
            if (!image.imageUrl) message += 'Image URL ';
            if (!image.topDepth) message += 'Start depth ';
            if (!image.bottomDepth) message += 'End depth ';
            return message;
        }

        function bindProps () {
            props.showTitle = self.showTitle;
            props.title = self.title;
            props.topJustification = self.topJustification;
            props.background = self.background;
            props.width = self.width;
            props.image_of_tracks = self.imagesOfCurrentTrack;
            props.zoomFactor = self.zoomFactor;
            // parameterSet: self.parameterSet
        }

        this.onOkButtonClicked = function () {
            bindProps();
            if (self.wasApplyButtonClicked && !self.arePropsChanged) {
                close(null);
            } else {
                if (self.status) {
                    doApply(function() {
                        if (!self.isValid) {
                            toastr.error(self.message + 'cannot be blank');
                            callback();
                        } else {
                            close(props);
                        }
                    });
                } else {
                    close(props);
                }
            }
        }
        this.onApplyButtonClicked = function () {
            self.wasApplyButtonClicked = true;
            bindProps();
            if (self.status) {
                doApply(function() {
                    if (!self.isValid) {
                        toastr.error(self.message + 'cannot be blank');
                        callback();
                    } else {
                        callback(props);
                    }
                });
            } else {
                callback(props);
            }
        }
        this.onCancelButtonClicked = function () {
            close(null, 100);
        }
    }
    ModalService.showModal({
        templateUrl: "image-track-properties-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (data) {
            helper.removeBackdrop();
            if (data) callback(data);
        });
    });
}
