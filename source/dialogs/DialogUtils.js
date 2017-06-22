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
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            console.log("Modal finally close: ", ret);
        });
    });
};
exports.openProjectDialog = function($scope, ModalService, callback) {
    function ModalController($scope, close) {
        console.log("modal controller created");
        this.close = function(retValue) {
            console.log("returnValue:", retValue);
            close(retValue);
        }
    }
    ModalService.showModal({
        templateUrl: 'open-project/open-project-modal.html',
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function(modal) {
        modal.element.modal();
        modal.close.then(function(ret) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            callback(ret);
        })
    });
}
exports.confirmDialog = function(ModalService, titleMessage, confirmMessage, callback) {
    function ModalController($scope, close) {
        this.title = titleMessage;
        this.confirmMsg = confirmMessage;
        this.close = function(ret) {
            close(ret);
        }
    }
    ModalService.showModal({
        templateUrl: "confirm/confirm-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function(modal) {
        modal.element.modal();
        modal.close.then(function(ret) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            callback(ret);
        });
    });
}

exports.unitSettingDialog = function(ModalService, callback, data) {
    function ModalController($scope, close) {
        this.close = function(ret) {
            close(ret);
        }

        this.data = data;
    }
    ModalService.showModal({
        templateUrl: "unit-setting/unit-setting-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function(modal) {
        modal.element.modal();
        modal.close.then(function(ret) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            callback(ret);
        });
    });

}

exports.addNewDialog = function(ModalService, callbak) {
    function ModalController($scope, close) {
        this.close = function(ret) {
            close(ret);
        }
    }
    ModalService.showModal({
        templateUrl: "add-new/add-new-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function(modal) {
        modal.element.modal();
        modal.close.then(function(ret) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            callback(ret);
        });
    });
}