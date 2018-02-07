let helper = require('./DialogHelper');
module.exports = function (ModalService, image, callback) {
    function ModalController ($scope, wiComponentService, close) {
        let self = this;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let currentImage = image;

        this.currentImageUrl = currentImage.imageUrl;
        this.currentImageName = currentImage.name;

        this.onCancelButtonClicked = function () {
            close(null);
        };
    }
    ModalService.showModal({
        templateUrl: "image-view-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function () {
            helper.removeBackdrop();
            callback();
        });
    });
}