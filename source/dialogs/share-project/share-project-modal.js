let helper = require('./DialogHelper');
module.exports = function (ModalService, callback, groups, users) {
    function ModalController($scope, close, wiApiService, wiComponentService) {
        let self = this;
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        this.project = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);
        this.groups = groups;
        this.users = users;
        this.selectedGroup = {};
        this.selectedUser = {};
        this.showUserList = true;
        this.isSelectedGroup = false;
        this.isSelectedUser = false;
        this.idGroups = [];

        function reload() {
            wiApiService.listGroup({}, function (groups) {
                self.groups = groups;
            });
        }

        this.addNewGroup = function () {
            let promptConfig = {
                title: 'Add new user group',
                inputName: 'Group name',
                input: ''
            };
            DialogUtils.promptDialog(ModalService, promptConfig, function (group) {
                wiApiService.addUserGroup({name: group}, function (response) {
                    reload();
                });
            });
        };
        this.deleteGroup = function () {
            wiApiService.removeGroup({idGroup: self.selectedGroup.idGroup}, function (response) {
                reload();
            });
        };
        this.addUserToGroup = function () {
            self.showUserList = !self.showUserList;
        };
        this.addUser = function (user) {
            wiApiService.addUserToGroup({
                idGroup: self.selectedGroup.idGroup,
                idUsers: [user.idUser]
            }, function () {
                reload();
            })
        };
        this.removeUser = function () {
            wiApiService.removeUserFromGroup({
                idGroup: self.selectedGroup.idGroup,
                idUser: self.selectedUser.idUser
            }, function () {
                reload();
            })
        };
        this.onOkButtonClicked = function () {
            wiApiService.addSharedProject({name: self.project.name}, function (sharedProject) {
                wiApiService.addProjectToGroup({
                    idGroups: [self.selectedGroup.idGroup],
                    idSharedProject: sharedProject.idSharedProject
                }, function () {
                    close(500);
                });
            });
        };
        this.onCancelButtonClicked = function () {
            close(null);
        }
    }

    ModalService.showModal({
        templateUrl: 'share-project-modal.html',
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