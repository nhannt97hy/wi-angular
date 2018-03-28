let helper = require('./DialogHelper');

module.exports = function (ModalService, callback) {
    function ModalController($scope, close, wiApiService, $timeout) {
        let self = this;
        this.error = null;
        this.projects = [];
        this.idProject = null;
        this.name = null;
        this.shared = null;
        this.owner = null;
        this.disabled = false;
        this.selectedProject = {};
        this.displayName = null;
        wiApiService.getProjectList(null, function (projects) {
            self.projects = projects;
            /*$timeout(function(){
                $scope.$apply();
            });*/
        });
        console.log('response', this.projects);

        this.fillInfo = function () {
            self.projects.forEach(function (item) {
                console.log(item);
                console.log('====', self);
                if (self.displayName === item.displayName) {
                    self.selectedProject = item
                }
            });
        };


        this.onOkButtonClicked = function () {
            self.error = '';
            self.disabled = true;
            let data = {
                idProject: self.selectedProject.idProject,
                shared: self.selectedProject.shared,
                owner: self.selectedProject.owner,
                name: self.selectedProject.name
            };

            wiApiService.getProject(data, function (response) {
                response.owner = self.selectedProject.owner;
                response.shared = self.selectedProject.shared;
                close(response, 500);
                $timeout(function () {
                    $scope.$apply();
                });
            });
        };

        this.onCancelButtonClicked = function () {
            close(null);
        }
    }

    ModalService.showModal({
        templateUrl: 'open-project-modal.html',
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