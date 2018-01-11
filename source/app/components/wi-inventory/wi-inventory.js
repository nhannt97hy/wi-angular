const componentName = 'wiInventory';
const moduleName = 'wi-inventory';

function Controller($scope, wiComponentService, wiApiService, ModalService) {
    modalService = ModalService;
    let self = this;

    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);

    this.$onInit = function () {
        wiComponentService.putComponent('wiInventory', self);
    };

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
        projectLoaded = utils.refreshProjectState().then(projectLoaded => {
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
                importedModel.children.push(importModel(childModel, importedModel))
            })
        }
        return importedModel;
    }

    let importItems = [];
    window.importItems = importItems;
    this.importButtonClicked = function () {
        if (!this.importValid) return;
        let desParentModel = this.projectSelectedNode;
        let model = this.inventorySelectedNode;
        if (this.projectSelectedNode.type == model.type) {
            desParentModel = utils.getParentByModel(this.projectSelectedNode.type, this.projectSelectedNode.id, null, projectModel);
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
                importItems.push(importModel(model, desParentModel));
            }
        }
    }

    function getImportPayload(model) {
        const parentModel = utils.getParentByModel(model.type, model.id, null, projectModel);
        let payload;
        if (model.type == 'dataset') {
            let curves = [];
            model.children.forEach(curveModel => {
                curves.push({
                    idInvCurve: curveModel.properties.idCurve,
                    name: curveModel.properties.name,
                    unit: curveModel.properties.unit
                })
            })
            payload = {
                name: model.properties.name,
                idDesWell: parentModel.properties.idWell,
                curves: curves
            }
        } else if (model.type == 'curve') {
            payload = {
                idInvCurve: model.properties.idCurve,
                idDesDataset: parentModel.properties.idDataset,
                name: model.properties.name,
                unit: model.properties.unit
            }
        }
        return [payload];
    }

    function importProcess(item) {
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
                    // reject(err);
                    return;
                }
                item.properties = newWell;
                item.children.forEach(datasetModel => {
                    importProcess(datasetModel);
                });
                // resolve(newWell);
            })
        } else if (item.type == 'dataset') {
            wiApiService.post('/inventory/import/dataset', getImportPayload(item), function (datasetImported, err) {
                if (err) {
                    // reject(err);
                    return;
                }
                item.properties = datasetImported;
                // resolve(datasetImported);
            })
        } else if (item.type == 'curve') {
            wiApiService.post('/inventory/import/curve', getImportPayload(item), function (curveImported, err) {
                if (err) {
                    // reject(err);
                    return;
                }
                item.properties = curveImported;
                // resolve(curveImported);
            })
        }
    }
    this.onLoadButtonClicked = function () {
        async.eachSeries(importItems, (item, index, next) => {
            importProcess(item);
        }, (err) => {
            if (err) return console.error(err);
            refreshProject();
            refreshInventory();
        })
    }
    this.onRevertAllButtonClicked = function () {
        refreshProject();
        refreshInventory();
    };
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-inventory.html',
    controller: Controller,
    controllerAs: componentName
});

exports.name = moduleName;
