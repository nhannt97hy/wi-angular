let helper = require('./DialogHelper');

module.exports = function (ModalService, promptConfig, callback) {
    function ModalController($scope, close) {
        const self = this;
        this.title = promptConfig.title;
        this.inputName = promptConfig.inputName;
        this.input = promptConfig.input;
        // type: [select, text]
        this.type = promptConfig.type ? promptConfig.type : 'text';
        this.options = promptConfig.options;
        this.onBlur = function(args) {
            console.log('onBlur', args);
        }
        this.onOkButtonClicked = function () {
            close(self.input);
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
            if (!ret) return;
            callback(ret);
        });
    });
}