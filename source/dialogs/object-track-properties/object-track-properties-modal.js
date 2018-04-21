let helper = require('./DialogHelper');
module.exports = function (ModalService, wiLogplotCtrl, objectTrackProperties, callback) {
    function ModalController($scope, wiComponentService, wiApiService, close, $timeout) {
        let self = this;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let props = objectTrackProperties || {
            showTitle: true,
            title: "New Object",
            topJustification: "center",
            width: utils.inchToPixel(2),
        }
        props.width = utils.pixelToInch(props.width);
        console.log(props);
        this.isShowTitle = props.showTitle;
        this.title = props.title;
        this.topJustification = props.topJustification.toLowerCase();
        this.width = props.width;
        this.zoomFactor = props.zoomFactor;

        this.onOkButtonClicked = function () {
            self.error = null;
            props = {
                showTitle: self.isShowTitle,
                title: self.title,
                topJustification: self.topJustification,
                width: self.width,
                zoomFactor: self.zoomFactor
            }
            if (self.error) return;
            close(props, 100);
        }
        this.onCancelButtonClicked = function () {
            close(null, 100);
        }
    }
    ModalService.showModal({
        templateUrl: "object-track-properties-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (data) {
            helper.removeBackdrop();
            if(data) callback(data);
        });
    });
}
