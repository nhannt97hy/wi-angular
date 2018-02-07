const componentName = 'wiInventory';
const moduleName = 'wi-inventory';

function Controller($scope, wiComponentService, wiApiService, wiOnlineInvService, ModalService, $timeout) {
    modalService = ModalService;
    let self = this;

    window.__INV = self;

    let utils = wiComponentService.getComponent(wiComponentService.UTILS);

    let oUtils = require('./oinv-utils');
    oUtils.setGlobalObj({
        wiComponentService, wiOnlineInvService, $timeout
    });

    let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);

    this.$onInit = function () {
        wiComponentService.putComponent('wiInventory', self);
    };
    this.getProjectList = function(wiItemDropdownCtrl) {
        wiApiService.getProjectList(null, function(projectList) {
            console.log(projectList);
            wiItemDropdownCtrl.items = projectList.map(function(prj) {
                return {
                    data: {
                        label: prj.name
                    },
                    properties: prj
                };
            });
        });
    }
    this.projectChanged = function(projectProps) {
        let refreshPromise = utils.refreshProjectState(projectProps.idProject);
        refreshPromise && refreshPromise.then(projectLoaded => {
            projectModel = modelFrom(projectLoaded);
            self.projectConfig = [projectModel];
        });
    }

    function importModelExistedDialog(ModalService, callback) {
        function ModalController($scope, close, wiComponentService) {
            let self = this;

            this.onOkButtonClicked = function () {
                close(null, 100);
            }
            this.onCancelButtonClicked = function () {
                close(null, 100);
            }
        }
        ModalService.showModal({
            templateUrl: "import-model-existed-modal.html",
            controller: ModalController,
            controllerAs: "wiModal"
        }).then(function (modal) {
            dialogUtils.initModal(modal);
            modal.close.then(function (data) {
                $('.modal-backdrop').last().remove();
                $('body').removeClass('modal-open');
                callback && callback();
            });
        });
    }

    function modelFrom(root) {
        let rootModel = utils.createProjectModel(root);
        root.wells.forEach(well => {
            let wellModel = utils.createWellModel(well)
            rootModel.children.push(wellModel);
            well.datasets.forEach(dataset => {
                let datasetModel = utils.createDatasetModel(dataset);
                wellModel.children.push(datasetModel);
                dataset.curves.forEach(curve => {
                    datasetModel.children.push(utils.createCurveModel(curve));
                })
            })
        })
        return rootModel;
    }

    let projectModel;
    function refreshProject() {
        let refreshPromise = utils.refreshProjectState();
        refreshPromise && refreshPromise.then(projectLoaded => {
            projectModel = modelFrom(projectLoaded);
            self.projectConfig = [projectModel];
        });
    }
    let inventoryModel;
    function refreshInventory() {
        self.inventoryConfig = [oUtils.initInventory()];
        /*
        wiOnlineInvService.getInventory(inventory => {
            inventoryModel = modelFrom(inventory);
            self.inventoryConfig = [inventoryModel];
            inventoryModel.type = 'inventory';
            inventoryModel.data.label = 'Inventory';
        });
        */
    }
    refreshProject();
    refreshInventory();

    this.onConfigClick = function () {
        console.log(self.projectSelectedNode, self.inventorySelectedNode);
        if (!self.projectSelectedNode || !self.inventorySelectedNode) return;
        self.importValid = false;
        switch (self.inventorySelectedNode.type) {
            case 'well':
                if (self.projectSelectedNode.type == 'project' || self.projectSelectedNode.type == 'well') self.importValid = true;
                break;
            case 'dataset':
                if (self.projectSelectedNode.type == 'well' || self.projectSelectedNode.type == 'dataset') self.importValid = true;
                break;
            case 'curve':
                if (self.projectSelectedNode.type == 'dataset' || self.projectSelectedNode.type == 'curve') self.importValid = true;
                break;
            default:
                self.importValid = false;
                break;
        }
        $timeout(function(){
            $scope.$apply();
        })
    }

    function transformModelProperties(modelProps) {
        if(modelProps.well_headers && modelProps.well_headers.length) {
            modelProps.well_headers.forEach(function(wellheader) {
                switch (wellheader.header) {
                    case 'STRT': 
                        modelProps.topDepth = wellheader.value;
                        break;
                    case 'STOP': 
                        modelProps.bottomDepth = wellheader.value;
                        break;
                    case 'STEP':
                        modelProps.step = wellheader.value;
                        break;
                    default:

                }
            })
        }
        return modelProps;
    }

    function importModel(model, desParentModel) {
        let itemProps = angular.copy(transformModelProperties(model.properties));
        let importedModel;
        if (model.type == 'well') {
            importedModel = utils.createWellModel(itemProps);
        } else if (model.type == 'dataset') {
            importedModel = utils.createDatasetModel(itemProps);
        } else if (model.type == 'curve') {
            importedModel = utils.createCurveModel(itemProps)
        }
        importedModel.parent = angular.copy(desParentModel.properties);
        importedModel.isImported = true;
        desParentModel.children.push(importedModel);
        if (Array.isArray(model.children) && model.children.length) {
            model.children.forEach(childModel => {
                importModel(childModel, importedModel);
            })
        }
        return importedModel;
    }

    this.importItems = [];
    this.importButtonClicked = function () {
        if (!self.importValid) return;
        let desParentModel = self.projectSelectedNode;
        let model = self.inventorySelectedNode;
        console.log("THANG Debug: ", desParentModel, model);
        if (self.projectSelectedNode.type == model.type) {
            desParentModel = utils.getParentByModel(self.projectSelectedNode.type, self.projectSelectedNode.id, null, projectModel);
        } else {
            desParentModel.data.childExpanded = true;
        }
        let sameNameExisted = desParentModel.children.find(c => c.name == model.name);
        if (sameNameExisted) {
            importModelExistedDialog(ModalService, function () {
                console.log('conflict', model);
            });
        } else {
            if (desParentModel.isImported) {
                importModel(model, desParentModel);
            } else {
                self.importItems.push(importModel(model, desParentModel));
            }
        }
    }
    
    this.revertButtonClicked = function () {
        let revertModel = self.projectSelectedNode;
    }

    function getImportPayload(model) {
        let payload = [];
        if (model.type == 'well') {
            let datasets = [];
            model.children.forEach(datasetModel => {
                payload.push.apply(payload,getImportPayload(datasetModel));
            })
        } else if (model.type == 'dataset') {
            let curves = [];
            model.children.forEach(curveModel => {
                curves.push({
                    idInvCurve: curveModel.properties.idCurve,
                    name: curveModel.properties.name,
                    unit: curveModel.properties.unit
                })
            })
            payload.push({
                name: model.properties.name,
                idDesWell: model.parent.idWell,
                curves: curves
            });
        } else if (model.type == 'curve') {
            payload.push({
                idInvCurve: model.properties.idCurve,
                idDesDataset: model.parent.idDataset,
                name: model.properties.name,
                unit: model.properties.unit
            })
        }
        return payload;
    }

    function importProcess(item) {
        return new Promise((resolve, reject) => {
            if (item.type == 'well') {
                let wellPayload = {
                    idProject: item.parent.idProject,
                    name: item.properties.name,
                    topDepth: item.properties.topDepth,
                    bottomDepth: item.properties.bottomDepth,
                    step: item.properties.step,
                }
                wiApiService.createWell(wellPayload, function (newWell, err) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    oUtils.updateParentNode(item, newWell);
                    /*
                    item.properties = newWell;
                    item.children.forEach(function(dataset) {
                        dataset.parent = item.properties;
                    })
                    */
                    wiApiService.post('/inventory/import/dataset', getImportPayload(item), function (res, err) {
                        if (err) {
                            reject(err);
                        }
                        item.isImported = false;
                        resolve();
                    })
                })
            } else if (item.type == 'dataset') {
                wiApiService.post('/inventory/import/dataset', getImportPayload(item), function (res, err) {
                    if (err) {
                        reject(err);
                    }
                    item.isImported = false;
                    resolve();
                })
            } else if (item.type == 'curve') {
                wiApiService.post('/inventory/import/curve', getImportPayload(item), function (res, err) {
                    if (err) {
                        reject(err);
                    }
                    item.isImported = false;
                    resolve();
                })
            }
        })
    }
    this.onLoadButtonClicked = function () {
        console.log("THANG Debug: ", self.importItems);
        async.eachSeries(self.importItems, function (item, next) {
            importProcess(item).then(res => {
                next();
            }).catch(err => {
                next(err);
            })
        }, (err) => {
            if (err) return console.error(err);
            // self.importItems.length = 0;
            self.onRevertAllButtonClicked();
        })
    }
    this.onRevertAllButtonClicked = function () {
        refreshProject();
        refreshInventory();
        self.importItems.length = 0;
        self.inventorySelectedNode = null;
        self.projectSelectedNode = null;
        self.importValid = false;
    };

    this.upTrigger = function(cb) {
        console.log("upTrigger");
        let wells = self.inventoryConfig[0].children;
        if (wells.length) {
            wiOnlineInvService.listWells({
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
        let wells = self.inventoryConfig[0].children;
        if (wells.length) {
            wiOnlineInvService.listWells({
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

    this.selectHandler = selectHandler;
    function selectHandler(currentNode, noLoadData) {
        function bareSelectHandler() {
            //wiComponentService.emit(wiComponentService.UPDATE_ITEMS_EVENT, currentNode);
            //wiComponentService.emit(wiComponentService.UPDATE_PROPERTIES_EVENT, currentNode);
            if (currentNode.data) {
                $timeout(function() { currentNode.data.selected = true; });
                let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
                if (!Array.isArray(selectedNodes)) selectedNodes = [];
                if (!selectedNodes.includes(currentNode)) {
                    selectedNodes.push(currentNode);
                }
                wiComponentService.putComponent(wiComponentService.SELECTED_NODES, selectedNodes);
                // self.getWiiItems().getWiiProperties().emptyList();
                self.onConfigClick();
            }
        }

        if (currentNode.type == 'well' && !noLoadData) {
            oUtils.updateDatasets(currentNode.id, self.inventoryConfig[0]).then(function(datasetsModel) {
                async.each(datasetsModel, function(dModel, done) {
                    oUtils.updateCurves(dModel.id, self.inventoryConfig[0]).then(function() {
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
    
    this.unselectAllNodes = unselectAllNodes;
    function unselectAllNodes() {
        self.inventoryConfig.forEach(function (item) {
            utils.visit(item, function (node) {
                if (node.data) node.data.selected = false;
            });
        });
        wiComponentService.putComponent(wiComponentService.SELECTED_NODES, []);
    }
    this.selectInventoryNode = function(node) {
        self.inventorySelectedNode = node;
    }
    this.selectProjectNode = function(node) {
        self.projectSelectedNode = node;
    }
    this.clickFunction = function ($index, $event, node) {
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
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-inventory.html',
    controller: Controller,
    controllerAs: componentName
});

exports.name = moduleName;
