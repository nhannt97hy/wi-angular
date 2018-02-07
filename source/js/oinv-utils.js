var __GLOBAL = null;
exports.setGlobalObj = function (gObj) {
    if (__GLOBAL) return;
    __GLOBAL = gObj;
}

let updateInventory = _.debounce(function () {
    let wiOnlineInvService = __GLOBAL.wiOnlineInvService;
    let wiComponentService = __GLOBAL.wiComponentService;
    let inventory = wiComponentService.getComponent('INVENTORY');
    wiOnlineInvService.listWells({start:0,limit: 50, forward:true}, function (listWells) {
        let preWellsModel = angular.copy(inventory.children) || [];
        inventory.children = [];
        if (!listWells.length) {
            return;
        }
        listWells.forEach(function (well) {
            let preWellModel = preWellsModel.find(w => w.properties.idWell == well.idWell);
            let wellModel = wellToTreeConfig(well, preWellModel);
            inventory.children.push(wellModel);
        });
    });
}, 1000, { leading: true });
let updateWellsDebounce = _.debounce(function(start) {
    updateWells(start);
}, 1000, {leading:true, trailing:true});


exports.updateCurves = updateCurves;
exports.initInventory = initInventory;
exports.updateInventory = updateInventory;
exports.updateDatasets = updateDatasets;
exports.updateWells = updateWells;
exports.updateWellsDebounce = updateWellsDebounce;
exports.getAllChildrenCurves = getAllChildrenCurves;
exports.updateParentNode = updateParentNode;


function updateWells(start, rootNode) {
    let inventory = wiComponentService.getComponent('INVENTORY');
    if (rootNode) inventory = rootNode;
    let s = start;
    if (isNaN(s)) s = 0;
    let wiComponentService = __GLOBAL.wiComponentService;
    let wiOnlineInvService = __GLOBAL.wiOnlineInvService;
    return new Promise(function (resolve, reject) {
        wiOnlineInvService.listWells({start:s,limit: 50, forward:true}, function (listWells) {
            let preWellsModel = angular.copy(inventory.children) || [];
            inventory.children = [];
            if (!listWells.length) {
                resolve(inventory.children);
                return;
            }
            listWells.forEach(function (well) {
                let preWellModel = preWellsModel.find(w => w.properties.idWell == well.idWell);
                let wellModel = wellToTreeConfig(well, preWellModel);
                inventory.children.push(wellModel);
            });
            resolve(inventory.children);
        });
    })
}

function initInventory() {
    let wiComponentService = __GLOBAL.wiComponentService;
    // let idUser = wiComponentService.getComponent(wiComponentService.USER).idUser;
    let inventoryModel = {};
    inventoryModel.type = 'inventory';
    // inventoryModel.id = idUser;
    inventoryModel.data = {
        childExpanded: true,
        icon: 'well-insight-16x16',
        label: 'Wells',
        selected: false
    };
    inventoryModel.children = [];
    wiComponentService.putComponent('INVENTORY', inventoryModel);
    setTimeout(function () {
        updateInventory();
    });
    return inventoryModel;
}

function updateDatasets(idWell, rootNode) {
    let wiComponentService = __GLOBAL.wiComponentService;
    let inventory = wiComponentService.getComponent('INVENTORY');
    if (rootNode) inventory = rootNode;
    let wiOnlineInvService = __GLOBAL.wiOnlineInvService;
    return new Promise(function (resolve, reject) {
        let wellModel = utils.getModel('well', idWell, inventory);
        if (!wellModel) return;
        if (!wellModel.timestamp) wellModel.timestamp = 0;
        if ((Date.now() - wellModel.timestamp) < (180 * 1000) ) {
            resolve(wellModel.children);
            return;
        }
        wiOnlineInvService.listDatasets(idWell, function (listDatasets) {
            let preDatasetsModel = angular.copy(wellModel.children) || [];
            wellModel.children = [];
            if (!listDatasets.length) {
                resolve(wellModel.children);
                return;
            }
            listDatasets.forEach(function (dataset) {
                let preDatasetModel = preDatasetsModel.find(d => {
                    d.properties.idDataset == dataset.idDataset
                });
                let datasetModel = datasetToTreeConfig(dataset, preDatasetModel, inventory);
                wellModel.children.push(datasetModel);
                wellModel.timestamp = Date.now();
            });
            resolve(wellModel.children);
        });
    })
}
function updateCurves(idDataset, rootNode) {
    let wiComponentService = __GLOBAL.wiComponentService;
    let inventory = wiComponentService.getComponent('INVENTORY');
    if (rootNode) inventory = rootNode;
    let wiOnlineInvService = __GLOBAL.wiOnlineInvService;
    return new Promise(function (resolve, reject) {
        let datasetModel = utils.getModel('dataset', idDataset, inventory);
        if (!datasetModel) return;
        if (!datasetModel.timestamp) datasetModel.timestamp = 0;
        if (Date.now() - datasetModel.timestamp < (180 * 1000)) {
            resolve(datasetModel.children);
            return;
        }
        wiOnlineInvService.listCurves(idDataset, function (listCurves) {
            let preCurvesModel = angular.copy(datasetModel.children) || [];
            datasetModel.children = [];
            if (!listCurves.length) {
                resolve(datasetModel.children);
                return;
            }
            listCurves.forEach(function (curve) {
                let preCurveModel = preCurvesModel.find(w => w.properties.idCurve == curve.idCurve);
                let curveModel = curveToTreeConfig(curve, preCurveModel, inventory);
                datasetModel.children.push(curveModel);
                datasetModel.timestamp = Date.now();
            });
            resolve(datasetModel.children);
        });
    });
}

function wellToTreeConfig(well, currentModel) {
    let wellModel = {};
    wellModel.type = currentModel ? currentModel.type : 'well';
    wellModel.id = well.idWell;
    wellModel.data = currentModel ? currentModel.data : {
        childExpanded: false,
        icon: 'well-16x16',
        label: well.filename,
        tooltip: well.name,
        selected: false
    };
    wellModel.properties = well;
    wellModel.children = currentModel ? currentModel.children : [];
    return wellModel;
}
function datasetToTreeConfig(dataset, currentModel) {
    let datasetModel = {};
    datasetModel.type = currentModel ? currentModel.type : 'dataset';
    datasetModel.id = dataset.idDataset;
    datasetModel.data = currentModel ? currentModel.data : {
        childExpanded: false,
        icon: 'curve-data-16x16',
        label: dataset.name,
        selected: false,
        isLeaf: true
    };
    datasetModel.properties = dataset;
    datasetModel.children = currentModel ? currentModel.children : [];
    return datasetModel;
}
function curveToTreeConfig(curve, currentModel) {
    let curveModel = {};
    curveModel.type = currentModel ? currentModel.type : 'curve';
    curveModel.id = curve.idCurve;
    curveModel.data = currentModel ? currentModel.data : {
        childExpanded: false,
        icon: 'curve-16x16',
        label: curve.name,
        selected: false
    };
    curveModel.properties = curve;
    return curveModel;
}
function getAllChildrenCurves(node) {
    if (node.type == 'inventory') return;
    if (node.type == 'curve') return [node];
    let curves = [];
    node.children.forEach(function (child) {
        curves = curves.concat(getAllChildrenCurves(child));
    })
    return curves;
}

function updateParentNode(parentNode, newProperties) {
    parentNode.properties = newProperties;
    parentNode.children.forEach(function(child) {
        child.parent = parentNode.properties;
    })
}

