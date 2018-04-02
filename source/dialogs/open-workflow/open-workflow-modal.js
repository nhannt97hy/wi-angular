let helper = require('./DialogHelper');

module.exports = function (ModalService, callback) {
    function ModalController($scope, close, wiApiService, wiComponentService, $timeout) {
        let project = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);
        let self = this;
        //this.workflows = [];
        this.selectedWorkflow = null;
        this.getWorkflowList = function (wiItemDropdownCtrl) {
            wiApiService.getWorkflowList({idProject: project.idProject}, function (workflows) {
                wiItemDropdownCtrl.items = workflows.map(function (wf) {
                    if(!wf.content.model)
                    return {
                        data: {
                            label: wf.name
                        },
                        properties: wf
                    }
                });
                //self.workflows = workflows;
                //self.selectedWorkflow = self.workflows.length ? self.workflows[0] : null;
            });
        }
        this.workflowChanged = function (wfProps) {
            self.selectedWorkflow = wfProps;
        }

        this.onOkButtonClicked = function () {
            close(self.selectedWorkflow);
        };

        this.onCancelButtonClicked = function () {
            close(null);
        }

        this.deleteWorkflow = function (workflowModel, $event, wiItemDropdownCtrl) {
            $event.stopPropagation();
            $event.preventDefault();
            console.log(workflowModel);
            wiApiService.removeWorkflow(workflowModel.properties.idWorkflow, function () {
                self.getWorkflowList(wiItemDropdownCtrl);
            });
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
