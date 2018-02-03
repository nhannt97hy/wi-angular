const componentName = 'wiInventory';
const moduleName = 'wi-inventory';

function Controller($scope, wiComponentService, wiApiService, ModalService) {
    modalService = ModalService;
    let self = this;
    window.inv =this;

    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
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
        wiApiService.getInventory(inventory => {
            inventoryModel = modelFrom(inventory);
            self.inventoryConfig = [inventoryModel];
            inventoryModel.type = 'inventory';
            inventoryModel.data.label = 'Inventory';
        })
    }
    refreshProject();
    refreshInventory();

    this.onConfigClick = function () {
        console.log(this.projectSelectedNode, this.inventorySelectedNode);
        if (!this.projectSelectedNode || !this.inventorySelectedNode) return;
        this.importValid = false;
        switch (this.inventorySelectedNode.type) {
            case 'well':
                if (this.projectSelectedNode.type == 'project' || this.projectSelectedNode.type == 'well') self.importValid = true;
                break;
            case 'dataset':
                if (this.projectSelectedNode.type == 'well' || this.projectSelectedNode.type == 'dataset') self.importValid = true;
                break;
            case 'curve':
                if (this.projectSelectedNode.type == 'dataset' || this.projectSelectedNode.type == 'curve') self.importValid = true;
                break;
            default:
                this.importValid = false;
                break;
        }
        $scope.$apply();
    }
    function importModel(model, desParentModel) {
        let itemProps = angular.copy(model.properties);
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
                    topDepth: item.properties.start,
                    bottomDepth: item.properties.stop,
                    step: item.properties.step,
                }
                wiApiService.createWell(wellPayload, function (newWell, err) {
                    if (err) {
                        reject(err);
                    }
                    item.properties = newWell;
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
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-inventory.html',
    controller: Controller,
    controllerAs: componentName
});

exports.name = moduleName;
