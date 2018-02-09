let helper = require('./DialogHelper');

module.exports = function (ModalService, callback) {
    function ModalController($scope, close, wiApiService, wiComponentService, $timeout) {
        let self = this;
        this.isDisabled = false;

        let projectData = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);

        this.onOkButtonClicked = function () {
            self.error = '';
            self.isDisabled = true;

            let data = {
                name: self.wellName,
                idProject: projectData.idProject,
                topDepth: self.topDepth,
                bottomDepth: self.bottomDepth,
                step: self.step
            };
            wiApiService.createWell(data, function (response, err) {
                if (err) {
                    self.isDisabled = false;
                    return;
                }
                close(response, 500);
                $timeout(function(){
                    $scope.$apply();
                });
            });
        };

        this.onCancelButtonClicked = function () {
            close(null);
        }
    }

    ModalService.showModal({
        templateUrl: "add-new-modal.html",
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