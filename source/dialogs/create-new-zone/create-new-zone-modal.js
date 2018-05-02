let helper = require('./DialogHelper');
module.exports = function (ModalService, callback) {
    function ModalController($scope, close, wiApiService, wiComponentService, ModalService, $timeout) {
        let self = this;
        self.template = {template: ''};
        this.zone = {
            name: "",
            background: "",
            foreground: "",
            pattern: ""
        }
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);        
        this.selectPatterns = ['none', 'basement', 'chert', 'dolomite', 'limestone', 'sandstone', 'shale', 'siltstone'];
        
        this.backgroundZone = function (index) {
            DialogUtils.colorPickerDialog(ModalService, self.zone.background, function (colorStr) {
                self.zone.background = colorStr;
                console.log('bg', self.zone.background);
            });
        };

        this.foregroundZone = function (index) {
            DialogUtils.colorPickerDialog(ModalService, self.zone.foreground, function (colorStr) {
                self.zone.foreground = colorStr;
            });
        };

        this.onOkButtonClicked = function () {
           close(self.zone);
        };

        this.onCancelButtonClicked = function () {
            close(null);
        };
    }

    ModalService.showModal({
        templateUrl: 'create-new-zone-modal.html',
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (data) {
            helper.removeBackdrop();
            if (data) {
                callback(data);
            }
        });
    });
};