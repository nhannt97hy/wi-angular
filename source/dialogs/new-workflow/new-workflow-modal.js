let helper = require('./DialogHelper');
module.exports = function (ModalService, callback) {
    function ModalController($scope, close, wiApiService, $timeout) {
        let self = this;
        // this.disabled = false;

        this.onOkButtonClicked = function () {
            // self.disabled = true;

            let data = {
                name: $scope.name,
                idWorkflowSpec: self.idWorkflowSpec,
                content: self.wfSpec
            };
            close(data);
        };

        this.onCancelButtonClicked = function () {
            close(null);
        }
        this.getWorkflowSpecs = function(wiItemDropdownCtrl) {
            wiApiService.getWorkflowSpecList(function(wfSpecs) {
                wiItemDropdownCtrl.items = wfSpecs.map(function(wfSpec) {
                    if(!wfSpec.type)
                    return {
                        data: {
                            label: wfSpec.name
                        },
                        properties: wfSpec
                    }
                });
            });
        }
        this.workflowSpecChanged = function(wfSpecProps) {
            self.idWorkflowSpec = wfSpecProps.idWorkflowSpec;
            self.wfSpec = wfSpecProps.content;
        }
    }

    ModalService.showModal({
        templateUrl: 'new-workflow-modal.html',
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
