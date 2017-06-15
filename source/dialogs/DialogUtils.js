/**
 * Created by cuong on 6/15/2017.
 */

exports.newProjectDialog = function ($scope, ModalService) {
    var self = this;
    console.log("new project dialog");
    function ModalController($scope, close) {
        this.close = function (ret) {
            close(ret, 500); // close, but give 500ms for bootstrap to animate
        };

        this.onOK = function () {
            if (typeof $scope.name == 'undefined') {
                var err = 'NewProject: Project Name is required!';
                return {error: err};
            } else if (typeof $scope.location == 'undefined') {
                var err = 'NewProject: Location is required';
                return {error: err};
            } else {
                return {
                    name: $scope.name,
                    location: $scope.location,
                    company: $scope.company,
                    department: $scope.department,
                    description: $scope.description
                }
            }
        }
    }

    ModalService.showModal({
        templateUrl: 'new-project/new-project-modal.html',
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        modal.close.then(function (ret) {
            console.log("Modal finally close: ", ret);
        });
    });
};