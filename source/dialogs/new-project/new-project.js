let initModal;
function newProjectDialog(ModalService, callback) {
    function ModalController($scope, close, wiApiService, $timeout) {
        let self = this;
        this.disabled = false;
        // this.error = null;

        this.onOkButtonClicked = function () {
            // self.error = '';
            self.disabled = true;

            let data = {
                name: $scope.name,
                company: $scope.company,
                department: $scope.department,
                description: $scope.description
            };
            close(data);
        };

        this.onCancelButtonClicked = function () {
            close(null);
        }
    }

    ModalService.showModal({
        templateUrl: 'new-project-modal.html',
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        initModal(modal);
        modal.close.then(function (data) {
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');

            if (data) {
                callback(data);
            }
        });
    });
};
exports.setInitFunc = function(initFunction) {
    initModal = initFunction;
}
exports.newProjectDialog = newProjectDialog;