let helper = require('./DialogHelper');
module.exports = function warningMessageDialog (ModalService, warningMessage, callback) {
    function ModalController($scope, close) {
        let self = this;
        this.warning = warningMessage;
        this.onCloseButtonClicked = function () {
            close(null);
        };
    }
    ModalService.showModal({
        templateUrl: 'warning-message-modal.html',
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (data) {
            helper.removeBackdrop();
            if (callback) callback();
        })
    });
};