const componentName = 'wiExport';
const moduleName = 'wi-export';

function Controller($scope, $timeout, wiApiService, wiComponentService, wiOnlineInvService) {
    let currentWell = '';
    let self = this;
    this.exportQueueItems = [];
    this.idExportQueueItems = [];
    this.lasFiles = [];
    this.inventoryConfig = new Array();

    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let oUtils = require('./oinv-utils');
    oUtils.setGlobalObj({
        wiComponentService, wiOnlineInvService, $timeout
    })

    this.$onInit = function () {
        wiComponentService.putComponent('wiExport', self);
    };

    // this.getProjectList = function (wiItemDropdownCtrl) {
    //     wiApiService.getProjectList(null, function (projectList) {
    //         console.log(projectList);
    //         wiItemDropdownCtrl.items = projectList.map(function (prj) {
    //             return {
    //                 data: {
    //                     label: prj.name
    //                 },
    //                 properties: prj
    //             };
    //         });
    //     });
    // }

    // function projectChanged(projectProps) {
    //     console.log('project changed');
    //     __idProject = projectProps.idProject;
    //     wiApiService.listWells({ idProject: __idProject }, function (wells) {
    //         console.log('projectChanged wells', wells);
    //         self.projectConfig = new Array();
    //         modelFrom(self.projectConfig, wells);
    //         console.log('config', self.projectConfig);
    //     });
    // }
    // this.projectChanged = projectChanged;

    this.refreshInventory= function () {
        console.log('refresh inventory');
        self.inventoryConfig = oUtils.getWellsFromInventory($scope, $timeout);
    }
    self.refreshInventory();

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

    this.upTriggerPrj = function (cb) {
        console.log('up-trigger prj');
        // let wells = self.projectConfig;
        let wells = self.inventoryConfig;
        if (wells.length && !isNaN(__idProject) && __idProject > 0) {
            wiApiService.listWells({
                idProject: __idProject,
                start: wells[0].properties.idWell,
                limit: 10,
                match: (self.prjFilter && self.prjFilter.length) ? self.prjFilter : undefined,
                forward: false
            }, function (listOfWells) {
                $timeout(function () {
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

    this.downTriggerPrj = function (cb) {
        console.log('down-trigger prj');
        // let wells = self.projectConfig;
        let wells = self.inventoryConfig;
        if (wells.length && !isNaN(__idProject) && __idProject > 0) {
            wiApiService.listWells({
                idProject: __idProject,
                start: wells[wells.length - 1].properties.idWell,
                limit: 10,
                match: (self.prjFilter && self.prjFilter.length) ? self.prjFilter : undefined,
                forward: true
            }, function (listOfWells) {
                $timeout(function () {
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

    this.prjClickFunction = function ($index, $event, node) {
        clickFunction($index, $event, node, self.projectConfig, true);  
    }
    this.invClickFunction = function($index, $event, node) {
        //clickFunction($index, $event, node, self.inventoryConfig, true);
        clickFunction($index, $event, node, self.inventoryConfig);
    }

    this.exportQueueClickFunction = function ($index, $event, node) {
        clickFunction($index, $event, node, self.exportQueueItems, true);
    }

    function clickFunction($index, $event, node, rootNode, multiNodeFetch = false) {
        node.$index = $index;
        if (!node) {
            unselectAllNodes(rootNode);
            return;
        }
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
                if (node.type != selectedNodes[selectedNodes.length - 1].type || node.parent != selectedNodes[0].parent) {
                    unselectAllNodes(rootNode);
                    selectHandler(node, false, rootNode);
                } else {
                    if (node.$index < selectedNodes[0].$index) {
                        let fromIndex = node.$index;
                        let toIndex = selectedNodes[0].$index;
                        unselectAllNodes(rootNode);
                        for (let i = fromIndex; i <= toIndex; i++) {
                            if (Array.isArray(rootNode)){
                                selectHandler(rootNode[i], !multiNodeFetch, rootNode);
                            } 
                            else{
                                selectHandler(rootNode.children[i], !multiNodeFetch, rootNode);
                            }  
                        }
                    } else {
                        let fromIndex = selectedNodes[0].$index;
                        let toIndex = node.$index;
                        unselectAllNodes(rootNode);
                        for (let i = fromIndex; i <= toIndex; i++) {
                            if (Array.isArray(rootNode)){
                                selectHandler(rootNode[i], !multiNodeFetch, rootNode);
                            }
                            else{
                                selectHandler(rootNode.children[i], !multiNodeFetch, rootNode);
                            }
                        }
                    }
                }
            }
        }
    }

    this.unselectAllNodes = unselectAllNodes;
    function unselectAllNodes(rootNode) {
        rootNode.forEach(function (item) {
            utils.visit(item, function (node) {
                if (node.data) node.data.selected = false;
            });
        });
        rootNode.__SELECTED_NODES = [];
    }

    function selectHandler(currentNode, noLoadData, rootNode, callback) {
        function bareSelectHandler() {
            if (currentNode.data) {
                $timeout(function () { currentNode.data.selected = true; });
                let selectedNodes = rootNode.__SELECTED_NODES;
                if (!Array.isArray(selectedNodes))
                    selectedNodes = [];
                if (!selectedNodes.includes(currentNode)) {
                    selectedNodes.push(currentNode);
                }
                rootNode.__SELECTED_NODES = selectedNodes;
            }
        }
        if (currentNode.type == 'well' && !noLoadData) { 
            if (rootNode === self.inventoryConfig) {
                console.log('inventory config');
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
            } else if (rootNode === self.projectConfig) {
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
                } else {
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

    this.onSelectButtonClicked = function () {
        // if (Array.isArray(self.projectConfig && self.projectConfig.__SELECTED_NODES)) {    
        if (Array.isArray(self.inventoryConfig && self.inventoryConfig.__SELECTED_NODES)) {                    
            // for (child of self.projectConfig.__SELECTED_NODES) {
                // pushNodeToQueue(child, self.projectConfig);
            for (child of self.inventoryConfig.__SELECTED_NODES) {  
                console.log('selectedNode', self.inventoryConfig.__SELECTED_NODES);      
                // let childCopy = angular.copy(child);
                // childCopy.data.toggle = true;          
                pushNodeToQueue(child, self.inventoryConfig);                    
                console.log('self.idExportQueueItems', self.idExportQueueItems);
            }
        }
    }

    function pushNodeToQueue(node, rootNode) {
        console.log('node', node, 'rootNode', rootNode, node == rootNode[0].children[0]);
        if(node.type ==="well"){
            let nodeCopy = angular.copy(node);
            nodeCopy.data.toggle = true;
            let wellExisted = self.exportQueueItems.find(function(wellNode){
                return wellNode.id === node.id
            })
            if(wellExisted){
                mergeWell(rootNode, nodeCopy, rootNode);
            } else {
                self.exportQueueItems.push(nodeCopy);
                self.idExportQueueItems.push(getIdObjectFromWell(nodeCopy));
            }
        } else if(node.type === "dataset"){
            let parentWell = rootNode.find(function(wellNode){
                return wellNode.children.indexOf(node)!==-1;
            })
            console.log('parent well', parentWell);
            let wellExisted = self.exportQueueItems.find(function(wellNode){
                return wellNode.id === parentWell.id;
            })
            let nodeCopy = angular.copy(node);
            if(wellExisted){
                mergeWell(wellExisted, nodeCopy, rootNode);
            } else {
                let parentWellCopy = angular.copy(parentWell);
                parentWellCopy.children = new Array(nodeCopy);
                $timeout(function() {
                    self.exportQueueItems.push(parentWellCopy);
                    let wellIndex = self.exportQueueItems.indexOf(parentWellCopy);
                    self.idExportQueueItems[wellIndex] = getIdObjectFromWell(parentWellCopy);
                    // self.idExportQueueItems.push(getIdObjectFromNode(parentWellCopy, rootNode));
                })
            }
        } else if(node.type === "curve"){
            for(wellNode of rootNode){
                let nodeCopy = angular.copy(node);
                let wellNodeCopy = angular.copy(wellNode);
                console.log('111', wellNodeCopy);
                let parentDataset = wellNodeCopy.children.find(function(datasetNode){
                    return datasetNode.children.find(function(curveNode){
                        return curveNode.id === node.id
                    });
                })
                if(parentDataset){
                    console.log('parentDataset found');
                    let wellExisted = self.exportQueueItems.find(function(well){
                        return wellNode.id === well.id;
                    })
                    if(wellExisted){
                        console.log('wellExisted');
                        mergeWell(parentDataset, nodeCopy, rootNode);
                        break;
                    } else {
                        let parentDatasetCopy = angular.copy(parentDataset);
                        parentDatasetCopy.children = new Array(nodeCopy);
                        wellNodeCopy.children = new Array(parentDatasetCopy);
                        
                        $timeout(function(){
                            console.log('xxx', wellNodeCopy);
                            self.exportQueueItems.push(wellNodeCopy);
                            let wellIndex = self.exportQueueItems.indexOf(wellNodeCopy);
                            self.idExportQueueItems[wellIndex] = getIdObjectFromWell(wellNodeCopy);
                            // self.idExportQueueItems.push(getIdObjectFromNode(wellNodeCopy, self.inventoryConfig));
                        })
                        break;
                    }
                    
                }
            }
        }
    }
    function mergeWell (parentNode, node, rootNode){
        if(node.type === "well") {
            let wellExisted = self.exportQueueItems.find(function(wellNode){
                return wellNode.id === node.id
            })
            let wellIndex = self.exportQueueItems.indexOf(wellExisted);
            self.exportQueueItems[wellIndex] = angular.copy(node)
            self.idExportQueueItems[wellIndex] = getIdObjectFromWell(node);
        } else if(node.type === "dataset"){
            let wellExisted = self.exportQueueItems.find(function(wellNode){
                return wellNode.id === parentNode.id
            })
            let wellIndex = self.exportQueueItems.indexOf(wellExisted);
            let datasetExisted = wellExisted.children.find(function(datasetNode){
                return datasetNode.id === node.id;
            })
            if(datasetExisted) {
                let datasetIndex = wellExisted.children.indexOf(datasetExisted);
                datasetExisted = angular.copy(node);
                self.exportQueueItems[wellIndex].children[datasetIndex] = datasetExisted;
                $timeout(function(){
                    self.idExportQueueItems[wellIndex] = getIdObjectFromWell(self.exportQueueItems[wellIndex]);
                })
            } else {
                self.exportQueueItems[wellIndex].children.push(node);
                $timeout(function(){
                    self.idExportQueueItems[wellIndex] = getIdObjectFromWell(self.exportQueueItems[wellIndex]);
                })
            }
        } else if(node.type==="curve") {
            let parentWell = rootNode.find(function(wellNode){
                return wellNode.children.find(function(datasetNode){
                    return datasetNode.id === parentNode.id;
                })
            })
            let wellExisted = self.exportQueueItems.find(function(wellNode){
                return wellNode.id === parentWell.id;
            })
            let wellIndex = self.exportQueueItems.indexOf(wellExisted);
            let datasetExisted = wellExisted.children.find(function(datasetNode){
                return datasetNode.id === parentNode.id;
            })
            if(datasetExisted){
                let curveExisted = datasetExisted.children.find(function(curveNode){
                    return curveNode.id === node.id;
                })
                console.log('curve existed', curveExisted);
                if(!curveExisted){
                    let datasetIndex = self.exportQueueItems[wellIndex].children.indexOf(datasetExisted);
                    self.exportQueueItems[wellIndex].children[datasetIndex].children.push(node);
                    $timeout(function(){
                        self.idExportQueueItems[wellIndex] = getIdObjectFromWell(self.exportQueueItems[wellIndex]);
                    })
                }
            } else {
                let datasetNodeCopy = angular.copy(parentNode);
                datasetNodeCopy.children = new Array(angular.copy(node));
                wellExisted.children.push(datasetNodeCopy);
                let wellIndex = self.exportQueueItems.indexOf(wellExisted);
                self.idExportQueueItems[wellIndex] = getIdObjectFromWell(wellExisted);
            }
        }
    }
    function getIdObjectFromWell(well) {
        let idObject = {
            idWell: "",
            datasets: []
        }
        if(well.type==="well"){
            idObject.idWell = well.id;
            for (dataset of well.children) {
                let idDatasetObj = {
                    idDataset: dataset.id,
                    idCurves: []
                }
                for (curve of dataset.children) {
                    idDatasetObj.idCurves.push(curve.id)
                }
                $timeout(function () {
                    idObject.datasets.push(idDatasetObj);
                })
            }
        } 
        return idObject;
    };

    this.onUnSelectButtonClicked = function () {
        function deleteWell(wellNode) {
            let index = self.exportQueueItems.indexOf(wellNode);
            self.exportQueueItems.splice(index, 1);
            self.idExportQueueItems.splice(index, 1);
        }
        function deleteDataset (datasetNode){
            let parentWell = self.exportQueueItems.find(function (well) {
                return well.children.find(function(dataset){
                    return datasetNode === dataset
                })
            })
            if(parentWell.children.length === 1){
                deleteWell(parentWell);
            } else {
                let datasetIndex = parentWell.children.indexOf(datasetNode);
                parentWell.children.splice(datasetIndex, 1);
                let wellIndex = self.exportQueueItems.indexOf(parentWell);
                self.idExportQueueItems[wellIndex].datasets.splice(datasetIndex, 1);
            }
        }
        function deleteCurve (curveNode) {
            for (wellNode of self.exportQueueItems){
                let parentDataset = wellNode.children.find(function(datasetNode){
                    return datasetNode.children.find(function(curve){
                        return curve.id === node.id;
                    })})
                if(parentDataset){
                    if(parentDataset.children.length === 1){
                        deleteDataset(parentDataset);
                        break;
                    } else {
                        let curveIndex = parentDataset.children.indexOf(curveNode);
                        parentDataset.children.splice(curveIndex, 1);
                        let wellIndex = self.exportQueueItems.indexOf(wellNode);
                        let datasetIndex = wellNode.children.indexOf(parentDataset);
                        self.idExportQueueItems[wellIndex].datasets[datasetIndex].idCurves.splice(curveIndex,1);
                        break;
                    }
                }
            }
        }
        if (Array.isArray(self.exportQueueItems.__SELECTED_NODES)) {
            for (node of self.exportQueueItems.__SELECTED_NODES) {
                if (node.type === "well") {
                    deleteWell(node);
                    console.log('idobject', self.idExportQueueItems);
                } else if (node.type === "dataset") {
                    deleteDataset(node);
                    console.log('idobject', self.idExportQueueItems);
                } else if (node.type === "curve") {
                    deleteCurve(node); 
                    console.log('idobject', self.idExportQueueItems);   
                }

            }
        }
    }
    this.pendingQueueClickFunction = function ($index, $event, node) {
        clickFunction($index, $event, node, self.exportQueueItems, true);
    }

    this.clearExportQueueItems = function () {
        self.exportQueueItems.length = 0;
        self.idExportQueueItems.length = 0;
        console.log('clear export queue id', self.idExportQueueItems);
    }
    this.switchLabelTooltip = function(wellNodes) {
        self.labelToggle = !self.labelToggle;
        console.log('labelToggle', self.labelToggle);
        wellNodes.forEach(function(node) {
            node.data.toggle = self.labelToggle;
        });
    }
    this.exportAllItems = function () {
        if (self.exportQueueItems.length > 0) { 
            wiOnlineInvService.exportAllItems(self.idExportQueueItems, function (response) {
                if (response) {  
                    for (r of response){ 
                        if(r!==null){
                            let url = wiOnlineInvService.getFileUrl(r.path);
                            self.lasFiles.push({
                                name: r.datasetName + "_" + r.wellName,
                                url: url
                            })
                        }
                    }    
                }
            });
            
        }
    }
}


let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-export.html',
    controller: Controller,
    controllerAs: componentName,
});

exports.name = moduleName;
