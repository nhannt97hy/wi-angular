let helper = require('./DialogHelper');
module.exports = function successMessageDialog (ModalService, successfulMessage, callback) {
    function ModalController($scope, close) {
        let self = this;
        this.message = successfulMessage;
        this.onCloseButtonClicked = function () {
            close(null);
        };
    }
    ModalService.showModal({
        templateUrl: 'success-message-modal.html',
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (data) {
            if (callback) callback();
            helper.removeBackdrop();
        })
    });
};