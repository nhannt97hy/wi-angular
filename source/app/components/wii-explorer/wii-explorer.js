const wiiExplorer = 'wiiExplorer';
const moduleName = 'wii-explorer';

function Controller($scope, $timeout, wiComponentService, wiApiService, wiOnlineInvService) {
    let self = this;
    window.WIIEXPLORER = self;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let oUtils = require('./oinv-utils');
    oUtils.setGlobalObj({
        wiComponentService, wiOnlineInvService, $timeout
    });
    this.treeConfig = [];
    window.wiiExplorer = this;
    self.treeViewName = self.name + 'TreeView';
    this.$onInit = function () {
        utils = wiComponentService.getComponent(wiComponentService.UTILS);
        wiComponentService.putComponent(self.name, self);
        //self.treeConfig = [oUtils.initInventory()];
        self.treeConfig = oUtils.getWellsFromInventory($scope, $timeout);
    }

    this.unselectAllNodes = unselectAllNodes;

    function unselectAllNodes() {
        self.treeConfig.forEach(function (item) {
            utils.visit(item, function (node) {
                if (node.data) node.data.selected = false;
            });
        });
        wiComponentService.putComponent(wiComponentService.SELECTED_NODES, []);
    }

    this.clickFunction = function($index, $event, node) {
        node.$index = $index;
        if (!node) {
            unselectAllNodes();
            return;
        }
        wiComponentService.emit('update-properties', node);
        let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
        if (!Array.isArray(selectedNodes)) selectedNodes = [];
        if (!$event.shiftKey) {
            if (selectedNodes.length) {
                if (!$event.ctrlKey || node.type != selectedNodes[0].type || node.parent != selectedNodes[0].parent) {
                    unselectAllNodes();
                }
            }
            selectHandler(node);
        } else {
            // shift key
            if (selectedNodes.length) {
                if (selectedNodes.includes(node)) return;
                if (node.type != selectedNodes[selectedNodes.length-1].type || node.parent != selectedNodes[0].parent) {
                    unselectAllNodes();
                    selectHandler(node);
                } else {
                    if (node.$index < selectedNodes[0].$index) {
                        let fromIndex = node.$index;
                        let toIndex = selectedNodes[0].$index;
                        unselectAllNodes();
                        for (let i = fromIndex; i <= toIndex; i++) {
                            selectHandler(this.config[i], true);
                        }
                    } else {
                        let fromIndex = selectedNodes[0].$index;
                        let toIndex = node.$index;
                        unselectAllNodes();
                        for (let i = fromIndex; i <= toIndex; i++) {
                            selectHandler(this.config[i], true);
                        }
                    }
                }
            }
        }
    }
    // Select tree node handler
    this.selectHandler = selectHandler;
    function selectHandler(currentNode, noLoadData) {
        function bareSelectHandler() {
            wiComponentService.emit(wiComponentService.UPDATE_ITEMS_EVENT, currentNode);
            wiComponentService.emit(wiComponentService.UPDATE_PROPERTIES_EVENT, currentNode);
            if (currentNode.data) {
                currentNode.data.selected = true;
                let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
                if (!Array.isArray(selectedNodes)) selectedNodes = [];
                if (!selectedNodes.includes(currentNode)) {
                    selectedNodes.push(currentNode);
                }
                wiComponentService.putComponent(wiComponentService.SELECTED_NODES, selectedNodes);
                self.getWiiItems().getWiiProperties().emptyList();
            }
        }

        if (currentNode.type == 'well' && !noLoadData) {
            oUtils.updateDatasets(currentNode.id).then(function(datasetsModel) {
                async.each(datasetsModel, function(dModel, done) {
                    oUtils.updateCurves(dModel.id).then(function() {
                        done();
                    });
                }, function(error) {
                    bareSelectHandler();
                });
            });
        }
        else {
            bareSelectHandler();
        }
    }
    this.getWiiItems = function () {
        return wiComponentService.getComponent('wiiItems');
    }

    this.refreshInventory = function () {
        oUtils.updateInventory();
        self.getWiiItems().emptyItems();
        self.getWiiItems().getWiiProperties().emptyList();
    }

    this.getDisplayField = function() {
        return self.labelToggle?"filename":"name";
    }

    this.switchLabelTooltip = function() {
        self.labelToggle = !self.labelToggle;
        /*self.treeConfig[0].children.forEach(function(node) {
            node.data.toggle = self.labelToggle;
        });*/
        self.treeConfig.forEach(function(node) {
            node.data.toggle = self.labelToggle;
        });
    }

    this.deleteFile = function (fileModel) {
        if (!fileModel) return;
        if (fileModel.type != 'file') return;
        wiApiService.deleteFile(fileModel.properties.idFile, function () {
            oUtils.updateFiles();
            self.getWiiItems().emptyItems();
        })
    }

    this.deleteWell = function (wellModel) {
        if (!wellModel) return;
        if (wellModel.type != 'well') return;
        wiOnlineInvService.deleteWell(wellModel.properties.idWell, function () {
            //oUtils.updateWellsDebounce();
            let idx = self.treeConfig.indexOf(wellModel);
            self.treeConfig.splice(idx, 1);
            self.getWiiItems().emptyItems();
        })
    }

    function expandAll(treeNode) {
        if(!treeNode.data) return;
        treeNode.data.childExpanded = true;
        
        treeNode.children && treeNode.children.length && treeNode.children.forEach(function(childNode) {
            expandAll(childNode);
        });
    }
    function collapseAll(treeNode) {
        if(!treeNode.data) return;
        treeNode.data.childExpanded = false;
        treeNode.children && treeNode.children.length && treeNode.children.forEach(function(childNode) {
            collapseAll(childNode);
        });
    }
    function getDefaultTreeviewCtxMenu(treeNode) {
        return [
            {
                name: "Expand",
                label: "Expand",
                icon: "expand-16x16",
                handler: function () {
                    treeNode.data.childExpanded = true;
                }
            }, {
                name: "Collapse",
                label: "Collapse",
                icon: "collapse-16x16",
                handler: function () {
                    treeNode.data.childExpanded = false;
                }
            }, {
                name: "ExpandAll",
                label: "Expand All",
                icon: "expand-all-16x16",
                handler: function () {
                    expandAll(treeNode);
                }
            }, {
                name: "CollapseAll",
                label: "Collapse All",
                icon: "collapse-all-16x16",
                handler: function () {
                    collapseAll(treeNode);
                }
            }
        ]
    }

    function getItemTreeviewCtxMenu(nodeType, treeViewCtrl) {
        //let selectedNode = utils.getSelectedNode(self.treeConfig[0]);
        let selectedNode = utils.getSelectedNode({
            data: {},
            children: self.treeConfig
        });
        switch (nodeType) {
            case 'file':
                return [
                    {
                        label: 'Delete',
                        icon: 'delete-16x16',
                        handler: function () {
                            self.deleteFile(selectedNode);
                        }
                    }, {
                        separator: '1'
                    }
                ]
            case 'well':
                return [
                    {
                        label: 'Delete',
                        icon: 'delete-16x16',
                        handler: function () {
                            let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
                            if (selectedNodes && selectedNodes.length) {
                                for (let sn of selectedNodes) {
                                    if (sn.type == "well") {
                                        self.deleteWell(sn);
                                    }
                                }
                            }
                            //self.deleteWell(selectedNode);
                        }
                    }, {
                        separator: '1'
                    }
                ]
            default:
                return [];
        }
    }

    this.upTrigger = function(cb) {
        //let wells = self.treeConfig[0].children;
        let wells = self.treeConfig;
        if (wells.length) {
            wiOnlineInvService.listWells({
                start: wells[0].properties.idWell, 
                limit: 10, 
                forward: false
            }, function(listOfWells) {
                let lowm = listOfWells.map(function(well) {
                    let wellModel = oUtils.wellToTreeConfig(well);
                    wellModel.data.toggle = self.labelToggle;
                    return wellModel;
                });
                if (cb) cb(lowm, wells);
            });
        }
        else if (cb) cb([]);
    }

    this.downTrigger = function(cb) {
        console.log("downTrigger");
        //let wells = self.treeConfig[0].children;
        let wells = self.treeConfig;
        if (wells.length) {
            wiOnlineInvService.listWells({
                start: wells[wells.length - 1].properties.idWell, 
                limit: 10, 
                forward: true
            }, function(listOfWells) {
                let lowm = listOfWells.map(function(well) {
                    let wellModel = oUtils.wellToTreeConfig(well);
                    wellModel.data.toggle = self.labelToggle;
                    return wellModel;
                });
                if (cb) cb(lowm, wells);
            });
        }
        else if (cb) cb([]);
    }

    function selectFile(callback, isMulti = true) {
        let fileInput = document.createElement('input');
        fileInput.style.display = 'none';
        fileInput.type = 'file';
        if (isMulti) fileInput.setAttribute('multiple', 'true');
        document.body.appendChild(fileInput);
        fileInput.click();
        fileInput.addEventListener('change', function (event) {
            document.body.removeChild(fileInput);
            console.log(fileInput.files);
            if (callback) callback(fileInput.files);
        });
    }

    this.ImportASCIIButtonClicked = function () {
        console.log('ImportASCIIButtonClicked');
    }
    this.ImportLASButtonClicked = function () {
        selectFile(function (files) {
            console.log(files);
            if (files) {
                wiOnlineInvService.uploadFiles(files, function (response) {
                    console.log('upload files done', response);
                    if (response === 'UPLOAD FILES FAILED') {
                        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
                        DialogUtils.errorMessageDialog(ModalService, "Some errors while upload file!");
                    } else {
                        oUtils.updateInventory();
                        self.getWiiItems().emptyItems();
                        self.getWiiItems().getWiiProperties().emptyList();
                    }
                })
            }
        });
    }

    this.ImportDLISButtonClicked = function () {
        console.log('ImportDLISButtonClicked');
    }
    this.Interval_CoreLoaderButtonClicked = function () {
        console.log('Interval_CoreLoaderButtonClicked'); 
    }
    this.ImportWellHeaderButtonClicked = function () {
        console.log('ImportWellHeaderButtonClicked');
    }
    this.ImportWellTopButtonClicked = function () {
        console.log('ImportWellTopButtonClicked');
    }
    this.showContextMenu = function($event, $index, node) {
        console.log('node', node);
        let defaultContextMenu = [], itemContextMenu = [];
        defaultContextMenu = getDefaultTreeviewCtxMenu(node);
        let nodeType = node.type;
        itemContextMenu = getItemTreeviewCtxMenu(nodeType, self);
        let contextMenu = itemContextMenu.concat(defaultContextMenu);
        wiComponentService.getComponent('ContextMenu').open($event.clientX, $event.clientY, contextMenu);
    }
}

let app = angular.module(moduleName, []);

app.component(wiiExplorer, {
    templateUrl: 'wii-explorer.html',
    controller: Controller,
    controllerAs: wiiExplorer,
    bindings: {
        name: '@'
    }
});

exports.name = moduleName;
