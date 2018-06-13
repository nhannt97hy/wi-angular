let helper = require('./DialogHelper');
module.exports = function (ModalService, callback, groups, _users, company) {
    function ModalController($scope, close, wiApiService, wiComponentService, $timeout) {
        let self = this;
        window.SP = this;
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);

        this.project = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);
        // this.groups = groups;
        this.users = [];
        this.idGroups = [];
        this.objects = null;

        this.groupsConfig = [];
        this.usersConfig = [];

        this.selectGroupNode = {};
        
        let topIdx = 0;
        let selectionLength = 15;
        let delta = 5;

        preGroup(groups);
        this.groups = groups.filter(g => (g.isShared == true));

        function preUser(group) {
            _users.forEach(user => {
                let tmp = group.users.find(u => u.idUser === user.idUser);
                user.isShared = !!tmp;
            });
        }

        function addGroupNode (gr) {
            let node = {
                name: gr.name,
                type: gr.isShared ? "group" : "group-checked",
                data: {
                    childExpanded: true,
                    label: gr.name,
                    tooltip: gr.name,
                    selected : false
                }, 
                actions: [{
                    icon: gr.isShared ? "ti-check isShared" : "ti-check isNotShared",
                    handler: function() {
                        handlerFunc(gr);
                        }
                    }],
                properties: gr
            }
            return node;
        }
        function addUserNode (user) {
            let node = {
                name: user.username,
                type: "user",
                data: {
                    childExpanded: true,
                    label: user.username,
                    tooltip: user.username
                },
                properties: user
            }
            return node;
        }
        function initUserConfig (users) {
            let cutUsers = users.slice(0, selectionLength);
            self.usersConfig = cutUsers.map(u => addUserNode(u));
        }
        function initGroupConfig (groups) {
            let cutGroups = groups.slice(0, selectionLength);
            self.groupsConfig = cutGroups.map(g => addGroupNode(g));
        }
        initGroupConfig(this.groups);

        function preGroup(groups) {
            groups.forEach(function (group) {
                let tmp = group.shared_projects.find(s => s.project_name === self.project.name);
                if (tmp) {
                    group.isShared = true;
                    group.idSharedProject = tmp.idSharedProject;
                } else {
                    group.isShared = false;
                }
            });
        }

        function unloadGroupPerm(perm, callback) {
            let _perm = {};
            perm.forEach(function (o) {
                _perm[o.name + '.get'] = o.get;
                _perm[o.name + '.create'] = o.create;
                _perm[o.name + '.update'] = o.update;
                _perm[o.name + '.delete'] = o.delete;
            });
            wiApiService.updateGroupPermissionOfProject({
                project_name: self.project.name,
                idGroup: self.selectedGroup.idGroup,
                permission: _perm
            }, function (res) {
                toastr.success("Successfull updated new permission for group : " + self.selectedGroup.name);
                callback();
            });
        }

        function loadGroupPerm(group) {
            wiApiService.getGroupPermissionOfProject({
                project_name: self.project.name,
                idGroup: group.idGroup
            }, function (perm) {
                if (!perm['well.get']) {
                    self.objects = null;
                } else {
                    self.objects = [
                        {
                            displayAs: 'Well',
                            name: 'well',
                            get: perm['well.get'],
                            create: perm['well.create'],
                            update: perm['well.update'],
                            delete: perm['well.delete']
                        },
                        {
                            displayAs: 'Dataset',
                            name: 'dataset',
                            get: perm['dataset.get'],
                            create: perm['dataset.create'],
                            update: perm['dataset.update'],
                            delete: perm['dataset.delete']
                        },
                        {
                            displayAs: 'Curve',
                            name: 'curve',
                            get: perm['curve.get'],
                            create: perm['curve.create'],
                            update: perm['curve.update'],
                            delete: perm['curve.delete']
                        },
                        {
                            displayAs: 'Zone Set',
                            name: 'zone-set',
                            get: perm['zone-set.get'],
                            create: perm['zone-set.create'],
                            update: perm['zone-set.update'],
                            delete: perm['zone-set.delete']
                        },
                        {
                            displayAs: 'Zone',
                            name: 'zone',
                            get: perm['zone.get'],
                            create: perm['zone.create'],
                            update: perm['zone.update'],
                            delete: perm['zone.delete']
                        },
                        {
                            displayAs: 'Log Plot',
                            name: 'plot',
                            get: perm['plot.get'],
                            create: perm['plot.create'],
                            update: perm['plot.update'],
                            delete: perm['plot.delete']
                        },
                        {
                            displayAs: 'Log Track',
                            name: 'track',
                            get: perm['track.get'],
                            create: perm['track.create'],
                            update: perm['track.update'],
                            delete: perm['track.delete']
                        },
                        {
                            displayAs: 'Shading',
                            name: 'shading',
                            get: perm['shading.get'],
                            create: perm['shading.create'],
                            update: perm['shading.update'],
                            delete: perm['shading.delete']
                        },
                        {
                            displayAs: 'Line',
                            name: 'line',
                            get: perm['line.get'],
                            create: perm['line.create'],
                            update: perm['line.update'],
                            delete: perm['line.delete']
                        },
                        {
                            displayAs: 'Marker',
                            name: 'marker',
                            get: perm['marker.get'],
                            create: perm['marker.create'],
                            update: perm['marker.update'],
                            delete: perm['marker.delete']
                        },
                        {
                            displayAs: 'Annotation',
                            name: 'annotation',
                            get: perm['annotation.get'],
                            create: perm['annotation.create'],
                            update: perm['annotation.update'],
                            delete: perm['annotation.delete']
                        },
                        {
                            displayAs: 'Reference Curve',
                            name: 'reference-curve',
                            get: perm['reference-curve.get'],
                            create: perm['reference-curve.create'],
                            update: perm['reference-curve.update'],
                            delete: perm['reference-curve.delete']
                        },
                        {
                            displayAs: 'Depth Track',
                            name: 'depth-axis',
                            get: perm['depth-axis.get'],
                            create: perm['depth-axis.create'],
                            update: perm['depth-axis.update'],
                            delete: perm['depth-axis.delete']
                        },
                        {
                            displayAs: 'Image Track',
                            name: 'image-track',
                            get: perm['image-track.get'],
                            create: perm['image-track.create'],
                            update: perm['image-track.update'],
                            delete: perm['image-track.delete']
                        },
                        {
                            displayAs: 'Image Of Image Track',
                            name: 'image-of-track',
                            get: perm['image-of-track.get'],
                            create: perm['image-of-track.create'],
                            update: perm['image-of-track.update'],
                            delete: perm['image-of-track.delete']
                        },
                        {
                            displayAs: 'Object Track',
                            name: 'object-track',
                            get: perm['object-track.get'],
                            create: perm['object-track.create'],
                            update: perm['object-track.update'],
                            delete: perm['object-track.delete']
                        },
                        {
                            displayAs: 'Object of Object Track',
                            name: 'object-of-track',
                            get: perm['object-of-track.get'],
                            create: perm['object-of-track.create'],
                            update: perm['object-of-track.update'],
                            delete: perm['object-of-track.delete']
                        },
                        {
                            displayAs: 'Zone Track',
                            name: 'zone-track',
                            get: perm['zone-track.get'],
                            create: perm['zone-track.create'],
                            update: perm['zone-track.update'],
                            delete: perm['zone-track.delete']
                        },
                        {
                            displayAs: 'Histogram',
                            name: 'histogram',
                            get: perm['histogram.get'],
                            create: perm['histogram.create'],
                            update: perm['histogram.update'],
                            delete: perm['histogram.delete']
                        },
                        {
                            displayAs: 'Cross Plot',
                            name: 'cross-plot',
                            get: perm['cross-plot.get'],
                            create: perm['cross-plot.create'],
                            update: perm['cross-plot.update'],
                            delete: perm['cross-plot.delete']
                        },
                        {
                            displayAs: 'Point Set',
                            name: 'point-set',
                            get: perm['point-set.get'],
                            create: perm['point-set.create'],
                            update: perm['point-set.update'],
                            delete: perm['point-set.delete']
                        },
                        {
                            displayAs: 'Polygon',
                            name: 'polygon',
                            get: perm['polygon.get'],
                            create: perm['polygon.create'],
                            update: perm['polygon.update'],
                            delete: perm['polygon.delete']
                        },
                        {
                            displayAs: 'Regression Line',
                            name: 'regression-line',
                            get: perm['regression-line.get'],
                            create: perm['regression-line.create'],
                            update: perm['regression-line.update'],
                            delete: perm['regression-line.delete']
                        },
                        {
                            displayAs: 'Ternary',
                            name: 'ternary',
                            get: perm['ternary.get'],
                            create: perm['ternary.create'],
                            update: perm['ternary.update'],
                            delete: perm['ternary.delete']
                        },
                        {
                            displayAs: 'User Define Line',
                            name: 'user-define-line',
                            get: perm['user-define-line.get'],
                            create: perm['user-define-line.create'],
                            update: perm['user-define-line.update'],
                            delete: perm['user-define-line.delete']
                        },
                        {
                            displayAs: 'Combined Box',
                            name: 'combined-box',
                            get: perm['combined-box.get'],
                            create: perm['combined-box.create'],
                            update: perm['combined-box.update'],
                            delete: perm['combined-box.delete']
                        },
                    ];
                }
            });
        }

        this.onFilterBy = function () {
            self.groupsConfig = [];
            reload();
        };

        /*this.onFilterBy = function() {
            if(self.fb) {
                self.filterBy = 'group-checked';
            } else self.filterBy = '';
        };*/

        function handlerFunc(group) {
            if(group.isShared) {
                self.unShareProjectFromGroup(group);
                group.isShared = false;
            } else {
                self.shareProjectToGroup(group);
                group.isShared = true;
            }
        }
        function setSelectedGroupNode(node) {
            self.groupsConfig.forEach(function (item) {
                utils.visit(item, function (n) {
                    if (n.data) n.data.selected = false;
                    if (n.name == node.name) n.data.selected = true;
                });
            });
        }
        this.groupClicked = function ($event, $index, node) {
            self.usersConfig = [];
            self.selectGroupNode = node.properties;
            self.users = node.properties.users;
            setSelectedGroupNode(node);
            loadGroupPerm(node.properties);
            preUser(node.properties);
            initUserConfig(self.users);
        };

        this.upTriggerGroup = function(cb) {
            let sourceData = self.fb ? self.groups : groups;
            if(topIdx > 0) {
                if(topIdx > delta) {
                    let newSource = sourceData.slice(topIdx - delta, topIdx).reverse();
                    let newList = newSource.map(g => addGroupNode(g));
                    topIdx = topIdx - delta;
                    cb(newList, self.groupsConfig);
                } else {
                    let newSource = sourceData.slice(0, topIdx).reverse();
                    let newList = newSource.map(g => addGroupNode(g));
                    topIdx = 0;
                    cb(newList, self.groupsConfig);
                }
            } else cb([]);
        };

        this.downTriggerGroup = function (cb) {
            let sourceData = self.fb ? self.groups : groups;
            let bottomIdx = topIdx + selectionLength;
            if(bottomIdx < sourceData.length) {
                if(sourceData.length - bottomIdx > delta) {
                    let newSource = sourceData.slice(bottomIdx, delta + bottomIdx);
                    let newList = newSource.map(g => addGroupNode(g));
                    topIdx = topIdx + delta;
                    cb(newList, self.groupsConfig);
                } else {
                    let newSource = sourceData.slice(bottomIdx, sourceData.length);
                    let newList = newSource.map(g => addGroupNode(g));
                    topIdx = topIdx + sourceData.length - bottomIdx;
                    cb(newList, self.groupsConfig);
                }
            } else cb([]);
        };

        this.upTriggerUser = function(cb) {
            if(topIdx > 0) {
                if(topIdx > delta) {
                    let newSource = self.users.slice(topIdx - delta, topIdx).reverse();
                    let newList = newSource.map(u => addUserNode(u));
                    topIdx = topIdx - delta;
                    cb(newList, self.usersConfig);
                } else {
                    let newSource = self.users.slice(0, topIdx).reverse();
                    let newList = newSource.map(u => addUserNode(u));
                    topIdx = 0;
                    cb(newList, self.usersConfig);
                }
            } else cb([]);
        };

        this.downTriggerUser = function (cb) {
            let bottomIdx = topIdx + selectionLength;
            if(bottomIdx < self.users.length) {
                if(self.users.length - bottomIdx > delta) {
                    let newSource = self.users.slice(bottomIdx, delta + bottomIdx);
                    let newList = newSource.map(g => addUserNode(g));
                    topIdx = topIdx + delta;
                    cb(newList, self.usersConfig);
                } else {
                    let newSource = self.users.slice(bottomIdx, self.users.length);
                    let newList = newSource.map(g => addUserNode(g));
                    topIdx = topIdx + self.users.length - bottomIdx;
                    cb(newList, self.usersConfig);
                }
            } else cb([]);
        }
        /*this.addNewGroup = function () {
            let promptConfig = {
                title: 'Add new user group',
                inputName: 'Group name',
                input: ''
            };
            DialogUtils.promptDialog(ModalService, promptConfig, function (group) {
                wiApiService.addUserGroup({name: group, idCompany: company.idCompany}, function (response) {
                    reload();
                });
            });
        };*/
        /*this.deleteGroup = function (group) {
            wiApiService.removeUserGroup({idGroup: group.idGroup}, function (response) {
                if (self.selectedGroup && self.selectedGroup.idGroup === group.idGroup) self.selectedGroup = null;
                toastr.success("Successfull delete group " + group.name);
                reload();
            });
        };*/
        /*this.addUser = function (user) {
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
        };*/
        function reload() {
            wiApiService.listGroup({idCompany: company.idCompany}, function (groups) {
                // $timeout(function () {
                    preGroup(groups);
                    self.groups = groups.filter(g => (g.isShared == true));
                    let sourceData = self.fb ? self.groups : groups;
                    initGroupConfig(sourceData);
                // });
            });
        }
        this.shareProjectToGroup = function (group) {
            wiApiService.addSharedProject({name: self.project.name}, function (sharedProject) {
                wiApiService.addProjectToGroup({
                    type: "add",
                    idGroup: group.idGroup,
                    idSharedProject: sharedProject.idSharedProject
                }, function () {
                    loadGroupPerm(group);
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
                loadGroupPerm(group);
                toastr.success("Successfull stop sharing " + self.project.name + " from group " + group.name);
                reload();
            });
        };
        function doApply(callback) {
            if (self.selectedGroup && self.objects) {
                unloadGroupPerm(self.objects, function () {
                    let _u = "";
                    let users = self.selectedGroup.users.filter(u => u.username !== localStorage.getItem("username"));
                    console.log(users);
                    async.eachSeries(users, function (user, nextUser) {
                        wiApiService.updateUserPermissionOfProject({
                            project_name: self.project.name,
                            username: user.username
                        }, function () {
                            setTimeout(function () {
                                _u += user.username + ", ";
                                nextUser();
                            }, 100)
                        })
                    }, function () {
                        toastr.info("Reload permission for users successfull: " + _u);
                    });
                });
                callback & callback();
            } else {
                toastr.warning("No permission changed!");
                callback & callback();
            }
        }
        this.onCancelButtonClicked = function () {
            close(null);
        }

        this.onOkButtonClicked = function () {
            doApply(function() {
                close();
            });
        };
        this.onApplyButtonClicked = function () {
            doApply(function() {});
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