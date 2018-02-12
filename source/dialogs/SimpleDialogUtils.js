exports.initModal = initModal;
exports.authenticationDialog = authenticationDialog;
exports.promptDialog = promptDialog;
exports.confirmDialog = confirmDialog;

let runImportDialog = require('./run-import-modal.js');
runImportDialog.setInitFunc(initModal);
exports.runImportDialog = runImportDialog.dialogFunc;

let runImportWHDialog = require('./run-import-well-header-modal.js');
runImportWHDialog.setInitFunc(initModal);
exports.runImportWellHeaderDialog = runImportWHDialog.dialogFunc;

let runImportWTDialog = require('./run-import-well-top-modal.js');
runImportWTDialog.setInitFunc(initModal);
exports.runImportWellTopDialog = runImportWTDialog.dialogFunc;

function initModal(modal) {
    modal.element.modal();
    $(modal.element).prop('tabindex', 1);
    const elem = $(modal.element).find('.modal-content');
    setTimeout(() => {
        elem.find('.modal-header').css('cursor', 'move');
        const offsetWidth = elem.width()/3;
        const offsetHeight = elem.height()/3;
        elem.draggable({
            containment:[-2*offsetWidth, -10, $(window).width()-offsetWidth, $(window).height()-offsetHeight],
            handle: '.modal-header'
        });
    }, 700);
    $(modal.element).keyup(function (e) {
        if (e.keyCode == $.ui.keyCode.ENTER || e.keyCode == $.ui.keyCode.ESCAPE) {
            let okButton, cancelButton;
            let buttonElems = $(modal.element).find('.modal-footer > button');
            for (let i = 0; i < buttonElems.length; i++) {
                if (buttonElems[i].innerText.toLowerCase().trim() == 'ok') {
                    okButton = buttonElems[i];
                }
                if (buttonElems[i].innerText.toLowerCase().trim() == 'cancel' || buttonElems[i].innerText.toLowerCase().trim() == 'close') {
                    cancelButton = buttonElems[i];
                }
            }
            if (e.keyCode == $.ui.keyCode.ENTER && okButton) okButton.click();
            if (e.keyCode == $.ui.keyCode.ENTER && !okButton && cancelButton) cancelButton.click();
            if (e.keyCode == $.ui.keyCode.ESCAPE && cancelButton) cancelButton.click();
            e.stopPropagation();
        }
    });
}
function authenticationDialog(ModalService, wiComponentService,callback) {
    function ModalController($scope, close, wiApiService) {
        let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let self = this;
        this.disabled = false;
        this.error = null;
        this.captchaPNG = wiApiService.getCaptcha();
        this.checkPasswords = function () {
            if (!self.passwordReg || !self.passwordConfirm) {
                self.error = 'Passwords must not be empty.'
            }
            if (self.passwordReg != self.passwordConfirm) {
                self.error = 'Passwords do not match.'
            }
        }
        this.onRegisterButtonClicked = function () {
            self.error = null;
            self.checkPasswords();
            if (self.error) return;
            let dataRequest = {
                username: self.usernameReg,
                password: self.passwordReg,
                email: self.useremailReg,
                fullname: self.userfullnameReg,
                captcha: self.captcha
            }
            wiApiService.register(dataRequest, function (res) {
                if (!res) return;
                dialogUtils.confirmDialog(ModalService, "Registration", "Register successfully. Please wait for account activation.", function () {});
            });
        }
        this.onLoginButtonClicked = function () {
            self.error = null;
            if (!self.username || !self.password) return;
            let dataRequest = {
                username: self.username,
                password: self.password,
                whoami: 'main-service'
            }
            wiApiService.login(dataRequest, function(res) {
                if (!res) return;
                let userInfo = {
                    username: self.username,
                    token: res.token,
                    refreshToken: res.refresh_token,
                    remember: self.remember
                };
                wiApiService.setAuthenticationInfo(userInfo, function () {
                    wiApiService.createDatabase({}, function (response) {
                        close(userInfo);
                    });
                });
            });

        }
    }

    ModalService.showModal({
        templateUrl: 'authentication/authentication-modal.html',
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        initModal(modal);
        $('.modal-backdrop').css({'opacity': 1, 'background-color': '#ffffff'});
        modal.close.then(function (data) {
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');
            if (callback && data) callback(data);
        });
    });
};
function confirmDialog(ModalService, titleMessage, confirmMessage, callback) {
    function ModalController($scope, close) {
        this.title = titleMessage;
        this.confirmMsg = confirmMessage;
        this.close = function (ret) {
            close(ret);
        }
    }
    ModalService.showModal({
        templateUrl: "confirm/confirm-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        initModal(modal);
        modal.close.then(function (ret) {
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');
            callback(ret);
        });
    });
}

function promptDialog(ModalService, promptConfig, callback) {
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
        templateUrl: "prompt/prompt-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        initModal(modal);
        setTimeout(function() {
            $(modal.element[0]).find('input').focus();
        }, 500);
        modal.close.then(function (ret) {
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');
            if (!ret) return;
            callback(ret);
        });
    });
}
