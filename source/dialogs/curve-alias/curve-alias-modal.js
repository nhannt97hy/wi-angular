let helper = require('./DialogHelper');

module.exports = function (ModalService, callback) {
    function ModalController($scope, close) {
        this.addCurveName = function (curveAlias) {

        }
        this.isSelected = function (item) {
            console.log(item);
            return "";
        }


        this.close = function (ret) {
            close(ret);
        }
    }

    ModalService.showModal({
        templateUrl: "curve-alias-modal.html",
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