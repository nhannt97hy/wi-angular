let helper = require('./DialogHelper');
module.exports = function (ModalService, config, callback) {
    function ModalController($scope, wiComponentService, wiApiService, close) {
        const _DEL = 'deleted';

        let self = this;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let props = config || {};

        this.idImageOfTrack = props.idImageOfTrack;

        this.topDepth = Math.round(props.topDepth * 10000) / 10000;
        this.bottomDepth = Math.round(props.bottomDepth * 10000) / 10000;

        this.imageFile = null;
        this.done = props.done || false;
        this.imageUrl = props.imageUrl || "";
        this.name = props.name;
        this.showName = props.showName;
        this.fill = props.fill || 'white';
        this.smartDisplay = props.smartDisplay || false;

        this.uploadedImages = [];

        this.wasApplyButtonClicked = false;
        this.isNewDraw = props.isNewDraw || false;

        this.arePropsChanged = false;

        wiApiService.getImageGallery(function (images) {
            self.uploadedImages = images.map(function(item) {
                return {
                    name: getImageName(item),
                    imageUrl: wiApiService.BASE_URL + item
                }
            });
        });

        this.isGalleryOpening = false;

        this.selectedImage = null;
        this.selected = false;

        this.onUploadButtonClicked = function () {
            wiApiService.uploadImage({
                file: self.imageFile
            }, function (imageUrl) {
                $scope.$apply(function () {
                    self.imageUrl = imageUrl;
                    self.onImageUrlChange();
                    self.done = true;
                    let latestImage = {
                        name: getImageName(self.imageUrl),
                        imageUrl: self.imageUrl
                    }
                    self.uploadedImages.push(latestImage);
                });
            });
            self.arePropsChanged = true;
        }

        this.background = function () {
            dialogUtils.colorPickerDialog(ModalService, self.fill, function (colorStr) {
                self.fill = colorStr;
            });
            self.arePropsChanged = true;
        }

        this.openGallery = function () {
            this.isGalleryOpening = !this.isGalleryOpening;
            console.log("open gallery");
        }

        this.deleteUploadedImage = function (image) {
            console.log('image was deleted');
            image.flag = _DEL;
        }

        this.selectImage = function (image) {
            self.selectedImage = image;
            self.selected = true;
            self.imageUrl = image.imageUrl;
            self.done = true;
            self.arePropsChanged = true;
        }

        this.onImageUrlChange = _.debounce(function () {
            self.done = validateUrl(self.imageUrl);
        }, 500);

        this.onPropsChange = function() {
            self.arePropsChanged = true;
        }

        function validateUrl (str) {
            let regex = /^(http|https|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(me|cloud|com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
            return regex.test(str);
        }

        function getImageName (img) {
            let _DIVIDER;
            if (img.match('/') != null) {
                _DIVIDER = '/';
            } else {
                _DIVIDER = '\\';
            }
            return img.split(_DIVIDER).pop();
        }

        function doApply(callback) {
            if (self.uploadedImages && self.uploadedImages.length) {
                async.eachOfSeries(self.uploadedImages, function(img, i, callback){
                    switch (self.uploadedImages[i].flag) {
                        case _DEL:
                            wiApiService.removeImage(self.uploadedImages[i].id, function(){
                                console.log('removeZone');
                                callback();
                            });
                            break;

                        default:
                            callback();
                            break;
                    }

                }, function(err) {
                    for (let i = self.uploadedImages.length - 1; i >= 0; i--){
                        switch (self.uploadedImages[i].flag) {
                            case _FDEL:
                                self.uploadedImages.splice(i, 1);
                                break;
                        }
                    }
                });
            } else {
                if (callback) callback();
            }

        }

        function bindProps() {
            props.idImageOfTrack = self.idImageOfTrack;
            props.topDepth = self.topDepth;
            props.bottomDepth = self.bottomDepth;
            props.imageUrl = self.imageUrl;
            props.name = self.name;
            props.showName = self.showName;
            props.smartDisplay = self.smartDisplay;
            props.fill = self.fill;
            props.done = self.done;
            props.isNewDraw = self.isNewDraw;
        }

        this.onOkButtonClicked = function () {
            bindProps();
            if (self.isNewDraw) {
                if (self.wasApplyButtonClicked && !self.arePropsChanged) {
                    close(true);
                } else {
                    close(props, 100);
                }
            } else {
                if (self.wasApplyButtonClicked && !self.arePropsChanged) {
                    close(null);
                } else {
                    close(props, 100);
                }
            }
        }

        this.onApplyButtonClicked = function () {
            self.wasApplyButtonClicked = true;
            bindProps();
            callback(props);
            self.isNewDraw = false;
            self.done = true;
        }

        this.onCancelButtonClicked = function () {
            if (self.wasApplyButtonClicked) close(true);
            else close(null);
        }
    }
    ModalService.showModal({
        templateUrl: "image-properties-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (ret) {
            helper.removeBackdrop();
            callback(ret);
        });
    });
}