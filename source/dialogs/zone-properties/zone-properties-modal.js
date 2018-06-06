let helper = require('./DialogHelper');
module.exports = function (ModalService, zoneTrackProperties, callback) {
    function ModalController($scope, wiComponentService, wiApiService, close) {
        let self = this;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let props = zoneTrackProperties || {};
        console.log(props);
        this.startDepth = Math.round(props.startDepth * 10000) / 10000;
        this.endDepth = Math.round(props.endDepth * 10000) / 10000;
        this.fill = props.fill;
        this.showName = props.showName;
        this.name = props.name;

        this.selectPatterns = wiComponentService.getComponent(wiComponentService.PATTERN);
        
        this.foreground = function () {
            dialogUtils.colorPickerDialog(ModalService, self.fill.pattern.foreground, function (colorStr) {
                self.fill.pattern.foreground = colorStr;
            });
        }
        this.background = function () {
            dialogUtils.colorPickerDialog(ModalService, self.fill.pattern.background, function (colorStr) {
                self.fill.pattern.background = colorStr;
            });
        }
        this.choosePattern = function(name) {
            dialogUtils.fillPatternDialog(ModalService, name, self.fill.pattern.foreground, self.fill.pattern.background, function(_name) {
                if(_name) {
                    self.fill.pattern.name = _name;
                }
            });
        }
        this.onApplyButtonClicked = function () {
            bindProps();
            callback(props);
        };
        this.onOkButtonClicked = function () {
            bindProps();
            close(props, 100);
        };
        this.onCancelButtonClicked = function () {
            close(null, 100);
        };

        function bindProps() {
            props.name = self.name,
            props.showName = self.showName,
            props.startDepth = self.startDepth,
            props.endDepth = self.endDepth,
            props.fill = self.fill
        }
    }
    ModalService.showModal({
        templateUrl: "zone-properties-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (data) {
            helper.removeBackdrop();
            if (data) callback(data);
        });
    });
}
