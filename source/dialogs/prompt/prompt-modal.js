let helper = require('./DialogHelper');

module.exports = function (ModalService, promptConfig, callback) {
    function ModalController($scope, close) {
        const self = this;
        this.title = promptConfig.title;
        this.inputs = promptConfig.inputs;
        this.inputName = promptConfig.inputName;
        this.input = promptConfig.input;
        // type: [select, text]
        this.type = promptConfig.type;
        this.options = promptConfig.options;
        this.onOkButtonClicked = function () {
            close(self.input || self.inputs);
        }
        this.onCancelButtonClicked = function () {
            close(null);
        }
    }

    ModalService.showModal({
        templateUrl: "prompt-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        helper.initModal(modal);
        setTimeout(function() {
            $(modal.element[0]).find('input').focus();
        }, 500);
        modal.close.then(function (ret) {
            helper.removeBackdrop();
            if (callback) callback(ret);
        });
    });
}