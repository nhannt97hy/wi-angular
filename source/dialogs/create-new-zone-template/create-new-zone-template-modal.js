let helper = require('./DialogHelper');
module.exports = function (ModalService, callback) {
    function ModalController($scope, close, wiApiService, wiComponentService, ModalService, $timeout) {
        let self = this;
        self.template = {template: ''};
        this.zoneSet = {
            name: "",
            background: "black",
            foreground: "white",
            pattern: "none",
            desciption: ""
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
        this.choosePattern = function() {
            DialogUtils.fillPatternDialog(ModalService, 
                                        self.zoneSet.pattern, 
                                        self.zoneSet.foreground, 
                                        self.zoneSet.background, 
                                        function(_name) {
                if(_name) {
                    self.zoneSet.pattern = _name;
                }
            });
        }

        this.onOkButtonClicked = function () {
           close(self.zoneSet);
        };

        this.onCancelButtonClicked = function () {
            close(null);
        };
    }

    ModalService.showModal({
        templateUrl: 'create-new-zone-template-modal.html',
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