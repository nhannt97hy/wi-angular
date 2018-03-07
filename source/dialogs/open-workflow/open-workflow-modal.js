let helper = require('./DialogHelper');

module.exports = function (ModalService, callback) {
    function ModalController($scope, close, wiApiService, $timeout) {
        let self = this;
        this.workflows = [];
        this.selectedWorkflow = null;

        wiApiService.getWorkflowList(function (workflows) {
            self.workflows = workflows;
            self.selectedWorkflow = self.workflows.length ? self.workflows[0] : null;
        });

        this.onOkButtonClicked = function () {
            close(self.selectedWorkflow);
        };

        this.onCancelButtonClicked = function () {
            close(null);
        }
    }

    ModalService.showModal({
        templateUrl: 'open-workflow-modal.html',
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