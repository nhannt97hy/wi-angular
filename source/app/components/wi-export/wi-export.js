const componentName = 'wiExport';
const moduleName = 'wi-export';

function Controller($timeout, wiApiService, wiComponentService, wiOnlineInvService) {
	let currentWell = '';
	let self = this;
    this.exportQueueItems = [];
    this.lasFiles = [];

	this.$onInit = function () {
        wiComponentService.putComponent('wiExport', self);
    };

	this.getProjectList = function (wiItemDropdownCtrl) {
		wiApiService.getProjectList(null, function (projectList) {
			console.log(projectList);
			wiItemDropdownCtrl.items = projectList.map(function (prj) {
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
		console.log('project changed');
		__idProject = projectProps.idProject;
		wiApiService.listWells({ idProject: __idProject }, function (wells) {
			self.projectConfig = new Array();
			modelFrom(self.projectConfig, wells);
			console.log('config', self.projectConfig);
		});
	}
	this.projectChanged = projectChanged;

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

    this.prjClickFunction = function($index, $event, node) {
        clickFunction($index, $event, node, self.projectConfig, true);
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
            selectHandler(node, rootNode);
        } 
        else {
            // shift key
            if (selectedNodes.length) {
                if (selectedNodes.includes(node)) return;
                if (node.type != selectedNodes[selectedNodes.length-1].type || node.parent != selectedNodes[0].parent) {
                    unselectAllNodes(rootNode);
                    selectHandler(node, rootNode);
                } else {
                    if (node.$index < selectedNodes[0].$index) {
                        let fromIndex = node.$index;
                        let toIndex = selectedNodes[0].$index;
                        unselectAllNodes(rootNode);
                        for (let i = fromIndex; i <= toIndex; i++) {
                            selectHandler(rootNode[i], rootNode);
                        }
                    } else {
                        let fromIndex = selectedNodes[0].$index;
                        let toIndex = node.$index;
                        unselectAllNodes(rootNode);
                        for (let i = fromIndex; i <= toIndex; i++) {
                            selectHandler(rootNode[i], rootNode);
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
        //wiComponentService.putComponent(wiComponentService.SELECTED_NODES, []);
        rootNode.__SELECTED_NODES = [];
    }
    function selectHandler(currentNode, rootNode) {
        function bareSelectHandler() {
            //wiComponentService.emit(wiComponentService.UPDATE_ITEMS_EVENT, currentNode);
            //wiComponentService.emit(wiComponentService.UPDATE_PROPERTIES_EVENT, currentNode);
            if (currentNode.data) {
                $timeout(function() { 
                    currentNode.data.selected = !currentNode.data.selected; 
                });
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
            }
        }

        bareSelectHandler();
    }
    this.onSelectButtonClicked = function(){
        if(Array.isArray(self.projectConfig.__SELECTED_NODES)){
            for(child of self.projectConfig.__SELECTED_NODES) {
                let findItem = self.exportQueueItems.find(function(item){
                    return item.id===child.id;
                })
                if(!findItem){
                    self.exportQueueItems.push(angular.copy(child));
                } else {
                    toastr.warning("well already existed");
                }
            }
        }
    }
    this.onUnSelectButtonClicked = function() {
        if(Array.isArray(self.exportQueueItems.__SELECTED_NODES)){
            for(child of self.exportQueueItems.__SELECTED_NODES){
                let index = self.exportQueueItems.indexOf(child);
                self.exportQueueItems.splice(index,1);
            }
        }
    }
    this.pendingQueueClickFunction =  function($index, $event, node) {
        clickFunction($index, $event, node, self.exportQueueItems, true);
    }
    this.exportAllItems = function() {
       wiOnlineInvService.exportAllItems(self.exportQueueItems[0].id, function (rs) {
           console.log('rs', rs);
           let fileName = rs.split("").reverse().join("");
           fileName = fileName.slice(0, fileName.indexOf("\\")).split("").reverse().join("");
           let url = wiOnlineInvService.getFileUrl(rs);
           self.lasFiles.push({
               name: fileName,
               url: url
           })
           console.log('self.lasFiles', self.lasFiles);
       });
    }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
	templateUrl: 'wi-export.html',
	controller: Controller,
	controllerAs: componentName,
});

exports.name = moduleName;
