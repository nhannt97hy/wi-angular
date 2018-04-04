let helper = require('./DialogHelper');
module.exports = function (ModalService, callback) {
    function createRootNode() {
        let rootNode = {};
        rootNode.type = 'rootGroup';
        rootNode.data = {
            childExpanded: true,
            icon: 'well-insight-16x16',
            label: 'Project',
            selected: true
        };
        rootNode.properties = {
            idGroup: null
        }
        rootNode.children = [];
        return rootNode;
    }
    const states = {
        unchanged: '0',
        created: '1',
        changed: '2',
        deleted: '3',
        uncreated: '4'
    }
    function ModalController(wiComponentService, wiApiService, close, $timeout) {
        window.groupdialog = this;
        let self = this;
        let projectLoaded = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let groupToTreeConfig = utils.groupToTreeConfig;
        let rootNode = createRootNode();
        this.treeConfig = [rootNode];
        let groups = projectLoaded.groups;
        groups.forEach(function (group) {
            let groupModel = utils.getGroupModel(group.idGroup, groups, rootNode);
            groupModel.data.childExpanded = true;
            groupModel.actions = [
                {
                    icon: 'close-16x16-edit',
                    handler: function () {
                        self.onRemoveButtonClicked(groupModel);
                    }
                }
            ];
        })
        let selectedGroup = rootNode;
        this.onSelectGroup = function ($index, $event) {
            selectedGroup.data.selected = false;
            let groupModel = this.config[$index]; // this: base treeview controller
            groupModel.data.selected = true;
            selectedGroup = groupModel;
        }
        this.selectGroup = function (groupModel) {
            selectedGroup.data.selected = false;
            groupModel.data.selected = true;
            selectedGroup = groupModel;
        }
        this.showContextMenu = function ($event, $index) {
            console.log('group model', selectedGroup);
            let contextMenu;
            switch (selectedGroup.type) {
                case 'rootGroup':
                    contextMenu = [
                        {
                            name: "Add",
                            label: "Add",
                            icon: "plus-16x16",
                            handler: function () {
                                self.onAddButtonClicked();
                            }
                        }
                    ]
                    break;
                case 'group':
                    contextMenu = [
                        {
                            name: "Add",
                            label: "Add",
                            icon: "plus-16x16",
                            handler: function () {
                                self.onAddButtonClicked();
                            }
                        }, {
                            name: "Delete",
                            label: "Delete",
                            icon: "close-16x16-edit",
                            handler: function () {
                                self.onRemoveButtonClicked();
                            }
                        }, {
                            name: "Rename",
                            label: "Rename",
                            icon: "annotation-16x16-edit",
                            handler: function () {
                                groupNameDialog(selectedGroup.properties.name, function (newGroupName) {
                                    if (selectedGroup.properties.name == newGroupName) return;
                                    selectedGroup.properties.name = newGroupName;
                                    selectedGroup.state = states.changed;
                                    selectedGroup.data.label = newGroupName;
                                });
                            }
                        }
                    ]
                    break;
                default:
                    break;
            }
            wiComponentService.getComponent('ContextMenu').open($event.clientX, $event.clientY, contextMenu);
        }
        function isGroupNameValid(groupName, groupModel) {
            if (!groupModel) groupModel = rootNode;
            let isValid = true;
            if (groupModel.properties.name == groupName) isValid = false;
            if (Array.isArray(groupModel.children) && groupModel.children.length) {
                groupModel.children.forEach(child => {
                    if (child.data.deleted) return;
                    if (!isGroupNameValid(groupName, child)) isValid = false;
                });
            }
            return isValid;
        }
        function groupNameDialog(groupName, callback) {
            let promptConfig = { title: 'New Group', inputName: 'Group Name', input: groupName || 'new_group' }
            dialogUtils.promptDialog(ModalService, promptConfig, function (newGroupName) {
                if(!newGroupName) return;
                if (isGroupNameValid(newGroupName)) callback(newGroupName);
                else {
                    utils.error('Group name is existed!', function () {
                        groupNameDialog(groupName, callback);
                    })
                }
            })
        }
        this.onAddButtonClicked = function () {
            groupNameDialog('new_group', function (groupName) {
                let newGroup = {
                    idProject: projectLoaded.idProject,
                    idParent: selectedGroup.properties.idGroup,
                    name: groupName
                }
                let newGroupModel = groupToTreeConfig(newGroup);
                newGroupModel.data.childExpanded = true;
                newGroupModel.actions = [
                    {
                        icon: 'close-16x16-edit',
                        handler: function () {
                            self.onRemoveButtonClicked(newGroupModel);
                        }
                    }
                ];
                newGroupModel.state = states.created;
                selectedGroup.children.push(newGroupModel);
                self.selectGroup(newGroupModel);
            });
        }
        this.onRemoveButtonClicked = function (groupModel) {
            if (!groupModel) groupModel = selectedGroup;
            if (groupModel.type == 'rootGroup') return;
            if (groupModel.state == states.created) {
                groupModel.state = states.uncreated;
            } else {
                groupModel.state = states.deleted;
            }
            groupModel.data.deleted = true;
            self.selectGroup(rootNode);
        }
        function handleGroupApi(groupModel) {
            let promises = [];
            switch (groupModel.state) {
                case states.created:
                    promises.push(new Promise(function (resolve, reject) {
                        wiApiService.createGroup(groupModel.properties, function (groupRes) {
                            groupModel.properties = groupRes;
                            if (Array.isArray(groupModel.children)) {
                                groupModel.children.forEach(function (child) {
                                    child.properties.idParent = groupModel.properties.idGroup;
                                    let childPromises = handleGroupApi(child);
                                    promises.push.apply(promises, childPromises);
                                })
                            }
                            resolve();
                        })
                    }));
                    break;
                case states.changed:
                    promises.push(new Promise(function (resolve, reject) {
                        wiApiService.editGroup(groupModel.properties, function (groupRes) {
                            groupModel.properties = groupRes;
                            if (Array.isArray(groupModel.children)) {
                                groupModel.children.forEach(function (child) {
                                    child.properties.idParent = groupModel.properties.idGroup;
                                    let childPromises = handleGroupApi(child);
                                    promises.push.apply(promises, childPromises);
                                })
                            }
                            resolve();
                        })
                    }));
                    break;
                case states.deleted:
                    promises.push(new Promise(function (resolve, reject) {
                        wiApiService.removeGroup(groupModel.properties.idGroup, function () {
                            resolve();
                        })
                    }));
                    break;
                case states.uncreated:
                    break;
                case states.unchanged:
                default:
                    if (Array.isArray(groupModel.children)) {
                        groupModel.children.forEach(function (child) {
                            let childPromises = handleGroupApi(child);
                            promises.push.apply(promises, childPromises);
                        })
                    }
                    break;
            }
            return promises;
        }
        function handleWellApi () {
            let selectedWells = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
            let promises = [];
            if (Array.isArray(selectedWells) && selectedWells[0].type == 'well') {
                selectedWells.forEach(wellModel => {
                    if (wellModel.properties.idGroup != selectedGroup.properties.idGroup) {
                        wellModel.properties.idGroup = selectedGroup.properties.idGroup;
                        promises.push(new Promise((resolve, reject) => {
                            wiApiService.editWell(wellModel.properties, () => {
                                resolve();
                            })
                        }));
                    }
                });
            }
            return promises;
        }
        this.onOkButtonClicked = function () {
            let groupPromises = handleGroupApi(rootNode);
            if (groupPromises.length){
                Promise.all(groupPromises)
                    .then(function () {
                        let wellPromises = handleWellApi();
                        Promise.all(wellPromises).then(() => {
                            close(true);
                        })
                    })
                    .catch(function (err) {
                        console.error(err);
                    })
            } else {
                let wellPromises = handleWellApi();
                if (wellPromises.length) {
                    Promise.all(wellPromises).then(() => {
                        close(true);
                    });
                } else {
                    close(false);
                }
            }
        }
        this.onCancelButtonClicked = function () {
            close(null);
        }
    }

    ModalService.showModal({
        templateUrl: "group-manager-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (updated) {
            updated && callback && callback();
            helper.removeBackdrop();
        });
    });
}