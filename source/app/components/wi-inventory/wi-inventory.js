const componentName = 'wiInventory';
const moduleName = 'wi-inventory';

function Controller($scope, wiComponentService, wiApiService, wiOnlineInvService, ModalService, $timeout) {
    modalService = ModalService;
    let self = this;
    let __idProject;
    window.__INV = self;

    self.projectConfig = new Array();
    self.inventoryConfig = new Array();
    self.importItems = new Array();

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
    function projectChanged(projectProps) {
        __idProject = projectProps.idProject;
        if (__idProject > 0) {
            wiApiService.listWells({ 
                idProject: __idProject,
                match: (self.prjFilter && self.prjFilter.length) ? self.prjFilter : undefined,
            }, function(wells) {
                self.projectConfig.length = 0;
                modelFrom(self.projectConfig, wells);
            });
        }
        /*
        let refreshPromise = utils.refreshProjectState(projectProps.idProject);
        refreshPromise && refreshPromise.then(projectLoaded => {
            projectModel = modelFrom(projectLoaded);
            self.projectConfig = [projectModel];
        });
        */
    }
    this.projectChanged = projectChanged;

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

    /*
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
    */
    function modelFrom(rootConfig, wells) {
        wells.forEach(well => {
            let wellModel = utils.createWellModel(well)
            rootConfig.push(wellModel);
            if (well.datasets && well.datasets.length) {
                well.datasets.forEach(dataset => {
                    let datasetModel = utils.createDatasetModel(dataset);
                    wellModel.children.push(datasetModel);
                    dataset.curves.forEach(curve => {
                        datasetModel.children.push(utils.createCurveModel(curve));
                    })
                });
            }
        })
    }

    let projectModel;
    this.refreshProject = refreshProject;
    function refreshProject() {
        if (!isNaN(__idProject) && __idProject > 0) {
            projectChanged({idProject:__idProject});
        }
    }
    let inventoryModel;
    this.refreshInventory = refreshInventory;
    function refreshInventory() {
        //self.inventoryConfig = [oUtils.initInventory()];
        self.inventoryConfig = oUtils.getWellsFromInventory();

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
        $timeout(function() {
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

    function cloneModel(srcModel) {
        let itemProps = transformModelProperties(srcModel.properties);
        let destModel;
        if (srcModel.type == 'well') {
            destModel = utils.createWellModel(itemProps);
        } else if (srcModel.type == 'dataset') {
            destModel = utils.createDatasetModel(itemProps);
        } else if (srcModel.type == 'curve') {
            destModel = utils.createCurveModel(itemProps)
        }
        if (Array.isArray(srcModel.children) && srcModel.children.length) {
            srcModel.children.forEach(function(childModel) {
                destModel.children.push(cloneModel(childModel));
            });
        }
        return destModel;
    }
    function queueWell(model) {
        if (!model) {
            toastr.warning(model.data.label + ' is not a well (SKIPPED)');
            return;
        }
        let importedModel = cloneModel(model);
        let existingWell = self.importItems.find(function(item) {
            return item.name == importedModel.name;
        });
        if (existingWell) {
            toastr.warning(model.data.label + ' is already queued (SKIPPED)');
            return;
        }
        self.importItems.push(importedModel);
    }
    this.importButtonClicked = function () {
        let models = self.inventoryConfig.__SELECTED_NODES;
        if (models && models.length) {
            models.forEach(function(wellModel) {
                queueWell(wellModel);
            });
        }
    }
    
    this.revertButtonClicked = function () {
        while (self.importItems.__SELECTED_NODES.length) {
            let item = self.importItems.__SELECTED_NODES.pop();
            let idx = self.importItems.indexOf(item);
            self.importItems.splice(idx, 1);
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
            if (!self.projectConfig || !self.projectConfig.length) {
                return reject(new Error('No project for import'));
            }
            if (item.type == 'well') {
                let wellPayload = {
                    idProject: __idProject,
                    name: item.properties.name,
                    topDepth: item.properties.topDepth,
                    bottomDepth: item.properties.bottomDepth,
                    step: item.properties.step,
                }
                wiApiService.createWell(wellPayload, function (newWell, err) {
                    if (err) {
                        newWell = err.content;
                    }
                    oUtils.updateParentNode(item, newWell);
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
        async.eachLimit(self.importItems, 4,function (item, next) {
            importProcess(item).then(res => {
                next();
            }).catch(err => {
                next(err);
            })
        }, (err) => {
            if (err) {
                toastr.error('Error:' + err.message);
                return console.error(err);
            }
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
        let wells = self.inventoryConfig;
        if (wells.length) {
            wiOnlineInvService.listWells({
                start: wells[0].properties.idWell, 
                limit: 10, 
                forward: false
            }, function(listOfWells) {
                $timeout(function() {
                    console.log(listOfWells);
                    for (let well of listOfWells) {
                        let wellModel = oUtils.wellToTreeConfig(well);
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
        let wells = self.inventoryConfig;
        if (wells.length) {
            wiOnlineInvService.listWells({
                start: wells[wells.length - 1].properties.idWell, 
                limit: 10, 
                forward: true
            }, function(listOfWells) {
                $timeout(function() {
                    console.log(listOfWells);
                    for (let well of listOfWells) {
                        let wellModel = oUtils.wellToTreeConfig(well);
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
    this.upTriggerPrj = function(cb) {
        console.log('up-trigger prj');
        let wells = self.projectConfig;
        if (wells.length && !isNaN(__idProject) && __idProject > 0) {
            wiApiService.listWells({
                idProject: __idProject,
                start: wells[0].properties.idWell, 
                limit: 10,
                match: (self.prjFilter && self.prjFilter.length) ? self.prjFilter : undefined,
                forward: false
            }, function(listOfWells) {
                $timeout(function() {
                    console.log(listOfWells);
                    for (let well of listOfWells) {
                        let wellModel = utils.createWellModel(well)
                        wells.unshift(wellModel);
                        wellModel.data.toggle = self.labelToggle;
                        // not necessary because well contain properties only (no eagger loading at serve side)
                        if (well.datasets && well.datasets.length) {
                            well.datasets.forEach(dataset => {
                                let datasetModel = utils.createDatasetModel(dataset);
                                wellModel.children.push(datasetModel);
                                dataset.curves.forEach(curve => {
                                    datasetModel.children.push(utils.createCurveModel(curve));
                                })
                            });
                        }
                        /*                        
                        wellModel.data.toggle = self.labelToggle;
                        wells.unshift(wellModel);
                        wells.pop();
                        */
                    }
                    if (cb) cb(listOfWells.length);
                });
            });
        }
        else if (cb) cb(0);
    }
    this.downTriggerPrj = function(cb) {
        console.log('down-trigger prj');
        let wells = self.projectConfig;
        if (wells.length && !isNaN(__idProject) && __idProject > 0) {
            wiApiService.listWells({
                idProject: __idProject,
                start: wells[wells.length - 1].properties.idWell, 
                limit: 10, 
                match: (self.prjFilter && self.prjFilter.length) ? self.prjFilter : undefined,
                forward: true
            }, function(listOfWells) {
                $timeout(function() {
                    console.log(listOfWells);
                    for (let well of listOfWells) {
                        let wellModel = utils.createWellModel(well);
                        wells.push(wellModel);
                        wells.shift();
                        // not necessary because well contain properties only (no eagger loading at serve side)
                        if (well.datasets && well.datasets.length) {
                            well.datasets.forEach(dataset => {
                                let datasetModel = utils.createDatasetModel(dataset);
                                wellModel.children.push(datasetModel);
                                dataset.curves.forEach(curve => {
                                    datasetModel.children.push(utils.createCurveModel(curve));
                                })
                            });
                        }
                    }
                    if (cb) cb(listOfWells.length);
                });
            });
        }
        else if (cb) cb(0);
    }

    this.selectHandler = selectHandler;
    function selectHandler(currentNode, noLoadData, rootNode, callback) {
        function bareSelectHandler() {
            //wiComponentService.emit(wiComponentService.UPDATE_ITEMS_EVENT, currentNode);
            //wiComponentService.emit(wiComponentService.UPDATE_PROPERTIES_EVENT, currentNode);
            if (currentNode.data) {
                $timeout(function() { currentNode.data.selected = true; });
                //let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
                let selectedNodes = rootNode.__SELECTED_NODES;
                if (!Array.isArray(selectedNodes)) 
                    selectedNodes = [];
                if (!selectedNodes.includes(currentNode)) {
                    selectedNodes.push(currentNode);
                }
                //wiComponentService.putComponent(wiComponentService.SELECTED_NODES, selectedNodes);
                rootNode.__SELECTED_NODES = selectedNodes;
                // self.getWiiItems().getWiiProperties().emptyList();
                self.onConfigClick();
            }
        }

        if (currentNode.type == 'well' && !noLoadData) {
            if (rootNode === self.inventoryConfig) {
                oUtils.updateDatasets(currentNode.id, self.inventoryConfig).then(function(datasetsModel) {
                    async.each(datasetsModel, function(dModel, done) {
                        oUtils.updateCurves(dModel.id, self.inventoryConfig).then(function() {
                            done();
                        });
                    }, function(error) {
                        bareSelectHandler();
                        callback && callback();
                    });
                });
            }
            else if (rootNode === self.projectConfig) {
                if (Date.now() - (currentNode.ts||0) > 20*1000) {
                    wiApiService.getWell(currentNode.id, function(wellProps) {
                        currentNode.ts = Date.now();
                        if (wellProps.datasets && wellProps.datasets.length) {
                            currentNode.children.length = 0;
                            wellProps.datasets.forEach(dataset => {
                                let datasetModel = utils.createDatasetModel(dataset);
                                currentNode.children.push(datasetModel);
                                dataset.curves && dataset.curves.length && dataset.curves.forEach(curve => {
                                    datasetModel.children.push(utils.createCurveModel(curve));
                                });
                            });
                        }
                        bareSelectHandler();
                        callback && callback();
                    });
                }
                else {
                    bareSelectHandler();
                    callback && callback();
                }
            }
            else {
                bareSelectHandler();
                callback && callback();
            }
        }
        else {
            bareSelectHandler();
            callback && callback();
        }
    }
    
    this.unselectAllNodes = unselectAllNodes;
    function unselectAllNodes(rootNode) {
        rootNode.forEach(function (item) {
            utils.visit(item, function (node) {
                if (node.data) node.data.selected = false;
            });
        });
        //wiComponentService.putComponent(wiComponentService.SELECTED_NODES, []);
        rootNode.__SELECTED_NODES = [];
    }
    this.selectInventoryNode = function(node) {
        //self.inventorySelectedNode = node;
        let parentWell = utils.getParentByModel(node.type, node.id, 'well', {
            type:'inventory', 
            id: -10, 
            children:self.inventoryConfig
        });
        self.inventorySelectedNode = parentWell;
    }
    this.selectProjectNode = function(node) {
        self.projectSelectedNode = node;
    }
    this.selectPendingQueueNode = function(node) {
        let parentWell = utils.getParentByModel(node.type, node.id, 'well', self.importItems);
        self.pendingQueueSelectedNode = parentWell;
    }
    this.invClickFunction = function($index, $event, node) {
        clickFunction($index, $event, node, self.inventoryConfig, true);
    }
    this.prjClickFunction = function($index, $event, node) {
        clickFunction($index, $event, node, self.projectConfig, true);
    }
    this.pendingQueueClickFunction = function($index, $event, node) {
        clickFunction($index, $event, node, self.importItems);
    }
    function clickFunction($index, $event, node, rootNode, multiNodeFetch = false) {
        node.$index = $index;
        if (!node) {
            unselectAllNodes(rootNode);
            return;
        }
        //let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
        let selectedNodes = rootNode.__SELECTED_NODES;
        if (!Array.isArray(selectedNodes)) selectedNodes = [];
        if (!$event.shiftKey) {
            if (selectedNodes.length) {
                if (!$event.ctrlKey || node.type != selectedNodes[0].type || node.parent != selectedNodes[0].parent) {
                    unselectAllNodes(rootNode);
                }
            }
            selectHandler(node, false, rootNode);
        } else {
            // shift key
            if (selectedNodes.length) {
                if (selectedNodes.includes(node)) return;
                if (node.type != selectedNodes[selectedNodes.length-1].type || node.parent != selectedNodes[0].parent) {
                    unselectAllNodes(rootNode);
                    selectHandler(node, false, rootNode);
                } else {
                    if (node.$index < selectedNodes[0].$index) {
                        let fromIndex = node.$index;
                        let toIndex = selectedNodes[0].$index;
                        unselectAllNodes(rootNode);
                        for (let i = fromIndex; i <= toIndex; i++) {
                            if (Array.isArray(rootNode))
                                selectHandler(rootNode[i], !multiNodeFetch, rootNode);
                            else 
                                selectHandler(rootNode.children[i], !multiNodeFetch, rootNode);
                        }
                    } else {
                        let fromIndex = selectedNodes[0].$index;
                        let toIndex = node.$index;
                        unselectAllNodes(rootNode);
                        for (let i = fromIndex; i <= toIndex; i++) {
                            if (Array.isArray(rootNode))
                                selectHandler(rootNode[i], !multiNodeFetch, rootNode);
                            else 
                                selectHandler(rootNode.children[i], !multiNodeFetch, rootNode);
                        }
                    }
                }
            }
        }
    }
    this.switchLabelTooltip = function(wellNodes) {
        self.labelToggle = !self.labelToggle;
        wellNodes.forEach(function(node) {
            node.data.toggle = self.labelToggle;
        });
    }
    this.prjSearch = function() {
        console.log('search project');
        let min = 0;
        if (self.projectConfig.length)
            min = self.projectConfig.reduce(function(min, well){
                if (well.id < min) {
                    return well.id;
                }
                return min;
            }, Number.MAX_SAFE_INTEGER);

        if (__idProject > 0) {
            wiApiService.listWells({ 
                idProject: __idProject,
                start: min,
                match: (self.prjFilter && self.prjFilter.length) ? self.prjFilter : undefined,
            }, function(wells) {
                self.projectConfig.length = 0;
                modelFrom(self.projectConfig, wells);
            });
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
