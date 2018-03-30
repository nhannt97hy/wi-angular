let helper = require('./DialogHelper');
module.exports = function (ModalService, callback, groups, users) {
    function ModalController($scope, close, wiApiService, wiComponentService, $timeout) {
        let self = this;
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        this.project = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);
        this.groups = groups;
        this.users = users;
        this.selectedGroup = null;
        this.selectedUser = null;
        this.isSelectedGroup = false;
        this.isSelectedUser = false;
        this.idGroups = [];

        preGroup();

        function preUser(group) {
            self.users.forEach(user => {
                let tmp = group.users.find(u => u.idUser === user.idUser);
                user.isShared = !!tmp;
            });
        }

        function preGroup() {
            self.groups.forEach(function (group) {
                let tmp = group.shared_projects.find(s => s.project_name === self.project.name);
                if (tmp) {
                    group.isShared = true;
                    group.idSharedProject = tmp.idSharedProject;
                } else {
                    group.isShared = false;
                }
            });
        }

        function reload() {
            wiApiService.listGroup({}, function (groups) {
                $timeout(function () {
                    self.groups = groups;
                    preGroup();
                    if (!self.selectedGroup) return;

                    self.selectedGroup = self.groups.find(g => g.idGroup === self.selectedGroup.idGroup);
                    if (self.selectedGroup) preUser(self.selectedGroup);
                });
            });
        }

        this.groupClicked = function (group) {
            self.selectedGroup = group;
            preUser(group);
        };
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
        this.deleteGroup = function (group) {
            wiApiService.removeGroup({idGroup: group.idGroup}, function (response) {
                if (self.selectedGroup && self.selectedGroup.idGroup === group.idGroup) self.selectedGroup = null;
                toastr.success("Successfull delete group " + group.name);
                reload();
            });
        };
        this.addUser = function (user) {
            wiApiService.addUserToGroup({
                idGroup: self.selectedGroup.idGroup,
                idUser: user.idUser
            }, function () {
                toastr.success("Successfull add " + user.username + " to group " + self.selectedGroup.name);
                reload();
            })
        };
        this.removeUser = function (user) {
            wiApiService.removeUserFromGroup({
                idGroup: self.selectedGroup.idGroup,
                idUser: user.idUser
            }, function (response) {
                if (response === "CANT_REMOVE_OWNER") {
                    toastr.error("You can't remove group's owner from group");
                } else {
                    toastr.success("Successfull remove " + user.username + " from group " + self.selectedGroup.name);
                }
                reload();
            })
        };
        this.shareProjectToGroup = function (group) {
            wiApiService.addSharedProject({name: self.project.name}, function (sharedProject) {
                wiApiService.addProjectToGroup({
                    type: "add",
                    idGroup: group.idGroup,
                    idSharedProject: sharedProject.idSharedProject
                }, function () {
                    toastr.success("Successfull share " + self.project.name + " to group " + group.name);
                    reload();
                });
            });
        };
        this.unShareProjectFromGroup = function (group) {
            wiApiService.addProjectToGroup({
                type: "remove",
                idGroup: group.idGroup,
                idSharedProject: group.idSharedProject
            }, function (response) {
                toastr.success("Successfull stop sharing " + self.project.name + " from group " + group.name);
                reload();
            });
        };
        this.onOkButtonClicked = function () {
            // wiApiService.addSharedProject({name: self.project.name}, function (sharedProject) {
            //     wiApiService.addProjectToGroup({
            //         idGroups: [self.selectedGroup.idGroup],
            //         idSharedProject: sharedProject.idSharedProject
            //     }, function () {
            //         close(500);
            //     });
            // });
            close(500);
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