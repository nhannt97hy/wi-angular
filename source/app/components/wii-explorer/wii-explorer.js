const wiiExplorer = 'wiiExplorer';
const moduleName = 'wii-explorer';

function Controller($scope, $timeout, wiComponentService, wiApiService, wiOnlineInvService) {
    let self = this;
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
        self.treeConfig = [oUtils.initInventory()];
    }

    this.unselectAllNodes = function () {
        self.treeConfig.forEach(function (item) {
            utils.visit(item, function (node) {
                if (node.data) node.data.selected = false;
            });
        });
        wiComponentService.putComponent(wiComponentService.SELECTED_NODES, []);
    }

    // Select tree node handler
    this.selectHandler = function (currentNode, noLoadData) {
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
    }

    this.switchLabelTooltip = function() {
        self.labelToggle = !self.labelToggle;
        self.treeConfig[0].children.forEach(function(node) {
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
        wiApiService.deleteWell(wellModel.properties.idWell, function () {
            //utils.updateWells(wellModel.properties.idFile);
            oUtils.updateWellsDebounce();
            self.getWiiItems().emptyItems();
        })
    }

    this.getDefaultTreeviewCtxMenu = function ($index, treeViewCtrl) {
        return [
            {
                name: "Expand",
                label: "Expand",
                icon: "expand-16x16",
                handler: function () {
                    treeViewCtrl.expand($index);
                }
            }, {
                name: "Collapse",
                label: "Collapse",
                icon: "collapse-16x16",
                handler: function () {
                    treeViewCtrl.collapse($index);
                }
            }, {
                name: "ExpandAll",
                label: "Expand All",
                icon: "expand-all-16x16",
                handler: function () {
                    treeViewCtrl.expandAll(self.treeConfig);
                }
            }, {
                name: "CollapseAll",
                label: "Collapse All",
                icon: "collapse-all-16x16",
                handler: function () {
                    treeViewCtrl.collapseAll(self.treeConfig);
                }
            }
        ]
    }

    this.getItemTreeviewCtxMenu = function (nodeType, treeViewCtrl) {
        let selectedNode = oUtils.getSelectedNode();
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
                            console.log(selectedNodes);
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
        console.log("upTrigger");
        let wells = self.treeConfig[0].children;
        if (wells.length) {
            wiApiService.listWells({
                start: wells[0].properties.idWell, 
                limit: 10, 
                forward: false
            }, function(listOfWells) {
                $timeout(function() {
                    console.log(listOfWells);
                    for (let well of listOfWells) {
                        let wellModel = wellToTreeConfig(well);
                        wellModel.data.toggle = self.labelToggle;
                        wells.unshift(wellModel);
                        wells.pop();
                    }
                    if (cb) cb(listOfWells.length);
                });
            });
        }
        else if (cb) cb(0);
    }

    this.downTrigger = function(cb) {
        console.log("downTrigger");
        let wells = self.treeConfig[0].children;
        if (wells.length) {
            wiApiService.listWells({
                start: wells[wells.length - 1].properties.idWell, 
                limit: 10, 
                forward: true
            }, function(listOfWells) {
                $timeout(function() {
                    console.log(listOfWells);
                    for (let well of listOfWells) {
                        let wellModel = wellToTreeConfig(well);
                        wellModel.data.toggle = self.labelToggle;
                        wells.push(wellModel);
                        wells.shift();
                    }
                    if (cb) cb(listOfWells.length);
                });
            });
        }
        else if (cb) cb(0);
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
