let helper = require('./DialogHelper');
module.exports = function (ModalService, wiLogplot, callback) {
    function ModalController($scope, close) {
        let self = this;
        let wiD3Ctr = wiLogplot.getwiD3Ctrl();
        this.depthRange = wiD3Ctr.getDepthRange();

        this.verifyRange = function () {
            if (self.depthRange[0] < wiD3Ctr.getMinDepth()) self.depthRange[0] = wiD3Ctr.getMinDepth();
            if (self.depthRange[1] > wiD3Ctr.getMaxDepth()) self.depthRange[1] = wiD3Ctr.getMaxDepth();
        }
        this.verifyRange();

        this.onOkButtonClicked = function () {
            self.verifyRange();
            wiLogplot.getSlidingbarCtrl().resetView();
            setTimeout(() => {
                wiD3Ctr.setDepthRange(self.depthRange);
                wiD3Ctr.adjustSlidingBarFromDepthRange(self.depthRange);
                close(self);
            });
        }
        this.onCancelButtonClicked = function () {
            //wiD3Ctr.setDepthRange(self.depthRange);
            close(null);
        }
    }

    ModalService.showModal({
        templateUrl: 'range-specific-modal.html',
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (data) {
            helper.removeBackdrop();
            if (data) {
                callback(data);
            }
        })
    });
};