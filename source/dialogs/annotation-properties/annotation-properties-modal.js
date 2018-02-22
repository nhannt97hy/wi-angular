let helper = require('./DialogHelper');
module.exports = function (ModalService, annotationProperties, callback) {
    function ModalController($scope, wiComponentService, wiApiService, close) {
        let self = this;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        self.props = annotationProperties;
        this.props.left = +this.props.left.toFixed(2);
        this.props.top = +this.props.top.toFixed(2);
        this.props.bottom = +this.props.bottom.toFixed(2);
        this.props.width = +this.props.width.toFixed(2);

        this.onApplyButtonClicked = function () {
            callback(self.returnProps());
        };
        this.onOkButtonClicked = function () {
            close(self.returnProps(), 100);
        };
        this.onCancelButtonClicked = function () {
            close(null, 100);
        };
        this.returnProps = function () {
            let props = angular.copy(self.props);
            props.textStyle = JSON.stringify(props.textStyle);
            return props;
        }
    }
    ModalService.showModal({
        templateUrl: "annotation-properties-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (data) {
            helper.removeBackdrop();
            if (data && callback) callback(data);
        });
    });
}