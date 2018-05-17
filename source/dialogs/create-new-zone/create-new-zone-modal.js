let helper = require('./DialogHelper');
module.exports = function (ModalService, callback) {
    function ModalController($scope, close, wiApiService, wiComponentService, ModalService, $timeout) {
        let self = this;
        self.template = {template: ''};
        this.zone = {
            name: "",
            startDepth: "",
            endDepth: "",
            fill: {
                pattern: {
                    name: "",
                    background: "",
                    foreground: ""
                }
            }
        }
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);        
        this.selectPatterns = ['none', 'basement', 'chert', 'dolomite', 'limestone', 'sandstone', 'shale', 'siltstone'];
        
        this.backgroundZone = function (index) {
            DialogUtils.colorPickerDialog(ModalService, self.zone.fill.pattern.background, function (colorStr) {
                self.zone.fill.pattern.background = colorStr;
                console.log('bg', self.zone.background);
            });
        };

        this.foregroundZone = function (index) {
            DialogUtils.colorPickerDialog(ModalService, self.zone.fill.pattern.foreground, function (colorStr) {
                self.zone.fill.pattern.foreground = colorStr;
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