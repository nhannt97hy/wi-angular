let helper = require('./DialogHelper');
module.exports = function (ModalService, viTrack, callback) {
    function ModalController($scope, wiComponentService, wiApiService, close) {
        let self = this;
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        console.log("Depth track", viTrack);
        this.props = viTrack.getProperties();
        console.log('props1', this.props.width, this.props);

        this.props.width = utils.pixelToInch(this.props.width);
        console.log('props2', this.props.width, this.props);
        // Dialog buttons
        this.trackBackground = function () {
            DialogUtils.colorPickerDialog(ModalService, self.props.color, function (colorStr) {
                self.props.color = colorStr;
            });
        }

        function updateDepthTrack() {
            // utils.editDepthTrack(self.props, wiApiService);
            wiApiService.editDepthTrack(self.props, function(res) {
                self.props = res;
                let newProps = angular.copy(self.props);
                newProps.width = utils.inchToPixel(self.props.width);
                viTrack.setProperties(newProps);
                viTrack.doPlot(true);
            })
        };
        this.onApplyButtonClicked = function () {
            updateDepthTrack();

        };
        this.onOkButtonClicked = function () {
            updateDepthTrack();
            close(self.props, 100);
        };
        this.onCancelButtonClicked = function () {
            close(null, 100);
        };
    }
    ModalService.showModal({
        templateUrl: "depth-track-properties-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (data) {
            helper.removeBackdrop();
            if (data) callback(data);
        });
    });
};
