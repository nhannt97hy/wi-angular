let helper = require('./DialogHelper');
module.exports = function (ModalService, wiComponentService, callback) {
    function ModalController($scope, close, wiApiService, $timeout) {
        let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let self = this;
        this.disabled = false;
        this.error = null;
        this.captchaPNG = wiApiService.getCaptcha();
        this.username = window.localStorage.getItem('username');
        this.company = null;
        this.companyList = [
            {name: "hello"}, {name: "hi"}
        ];
        $timeout(function () {
            wiApiService.getCompanyList({}, function (response) {
                self.companyList = response;
            });
        });
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
                captcha: self.captcha,
                idCompany: self.company.idCompany
            };
            wiApiService.register(dataRequest, function (res) {
                if (!res) return;
                dialogUtils.confirmDialog(ModalService, "Registration", "Register successfully. Please wait for account activation.", function () {
                });
            });
        }
        this.remember = true;
        this.onLoginButtonClicked = function () {
            self.error = null;
            if (!self.username || !self.password) return;
            let dataRequest = {
                username: self.username,
                password: self.password,
                whoami: 'main-service'
            }
            wiApiService.login(dataRequest, function (res) {
                if (!res) return;
                let userInfo = {
                    username: self.username,
                    token: res.token,
                    refreshToken: res.refresh_token,
                    remember: self.remember,
                    company: res.company
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
        templateUrl: 'authentication-modal.html',
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        helper.initModal(modal);
        $('.modal-backdrop').css({'opacity': 1, 'background-color': '#ffffff'});
        modal.close.then(function (data) {
            helper.removeBackdrop();
            if (callback && data) callback(data);
        });
    });
};