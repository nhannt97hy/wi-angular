let helper = require('./DialogHelper');
module.exports = function (ModalService, callback) {
    function ModalController($scope, close, wiApiService, wiComponentService, ModalService, $timeout) {
        let self = this;
        self.template = {template: ''};
        this.zoneSet = {
            name: "",
            background: "",
            foreground: "",
            pattern: ""
        }
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);        
        this.selectPatterns = ['none', 'basement', 'chert', 'dolomite', 'limestone', 'sandstone', 'shale', 'siltstone'];
        
        this.backgroundZone = function (index) {
            DialogUtils.colorPickerDialog(ModalService, self.zoneSet.background, function (colorStr) {
                self.zoneSet.background = colorStr;
                console.log('bg', self.zoneSet.background);
            });
        };

        this.foregroundZone = function (index) {
            DialogUtils.colorPickerDialog(ModalService, self.zoneSet.foreground, function (colorStr) {
                self.zoneSet.foreground = colorStr;
            });
        };

        this.onOkButtonClicked = function () {
           close(self.zoneSet);
        };

        this.onCancelButtonClicked = function () {
            close(null);
        };
    }

    ModalService.showModal({
        templateUrl: 'create-new-zone-set-modal.html',
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