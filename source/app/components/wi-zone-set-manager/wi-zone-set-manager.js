const componentName = 'wiZoneSetManager';
const moduleName = 'wi-zone-set-manager';

function Controller($scope, wiComponentService, wiApiService, ModalService, $timeout) {
    let self = this;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let projectLoaded = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);

    this.$onInit = function () {
        wiComponentService.putComponent('wiZoneSetManager', self);
    }
    this.refreshZoneSetList = function () {
        self.lastSelectedWell = false;
        self.lastSelectedZoneSet = false;
        self.newZoneSet = false;
        self.zoneSetConfig = [];
        self.zones = [];
        wiApiService.listWells({ idProject: projectLoaded.idProject }, function (wells) {
            if (wells) {
                for (well of wells) {
                    self.zoneSetConfig.push(createWellModel(well));
                    console.log('self.zoneSetConfig', self.zoneSetConfig);
                }
            }
        })
    }
    this.refreshZoneSetList();

    this.selectPatterns = ['none', 'basement', 'chert', 'dolomite', 'limestone', 'sandstone', 'shale', 'siltstone'];

    this.exportZoneSet = function () {
        console.log('export');
    }
    this.createZoneSet = function () {
        let selectedNodes = self.zoneSetConfig.__SELECTED_NODES;
        let parentWell = false;
        if (self.lastSelectedWell) {
            parentWell = self.lastSelectedWell;
        } else if (self.lastSelectedZoneSet) {
            let parentWell = getParentNode(self.lastSelectedZoneSet);
        }
        if (parentWell) {
            DialogUtils.newZoneSetDialog(ModalService, function (data) {
                if (!data) return;
                else {
                    console.log(data);
                    if (!parentWell.children.find(function (node) { return node.name == data.name })) {
                        if (self.newZoneSet) {
                            parentWell.children.splice(parentWell.children.indexOf(self.newZoneSet), 1);
                        }
                        let newNode = {
                            id: "",
                            name: data.name,
                            idWell: parentWell.id,
                            type: 'zoneSet',
                            data: {
                                icon: 'mineral-zone-16x16',
                                label: data.name,
                                template: data.template,
                                childExpanded: true
                            },
                            children: []
                        }
                        self.newZoneSet = newNode;
                        self.lastSelectedZoneSet = newNode;
                        parentWell.children.push(newNode);
                        parentWell.data.childExpanded = true;
                        unselectAllNodes(self.zoneSetConfig);
                        selectHandler(newNode, self.zoneSetConfig);
                        self.refreshZoneList();
                    } else {
                        if (self.newZoneSet) {
                            parentWell.children.splice(parentWell.children.indexOf(self.newZoneSet), 1);
                        }
                        // alert('template name existed');
                        unselectAllNodes(self.zoneSetConfig);
                        selectHandler(parentWell.children.find(function (node) { return node.name == data.name }), self.zoneSetConfig);
                        self.refreshZoneList();
                    }
                }
            });
        }
    }
    this.deleteZoneSet = function () {
        for (node of self.zoneSetConfig.__SELECTED_NODES) {
            if (node == self.newZoneSet) {
                let parentWell = getParentNode(node)
                parentWell.children.splice(parentWell.children.indexOf(node), 1);
                self.newZoneSet = false;
            } else if (node.type == 'zoneSet') {
                let parentWell = getParentNode(node);
                let idZoneSet = node.id;
                wiApiService.removeZoneSet(idZoneSet, function () {
                    console.log('done');
                    parentWell.children.splice(parentWell.children.indexOf(node), 1);
                })
            }
        }
    }

    this.clickFunction = function ($index, $event, node) {
        clickFunction($index, $event, node, self.zoneSetConfig);
        if (self.newZoneSet && node != self.newZoneSet) {
            let parentWell = self.zoneSetConfig.find(function (well) { return well.children.indexOf(self.newZoneSet) != -1 });
            parentWell.children.splice(parentWell.children.indexOf(self.newZoneSet), 1);
            self.newZoneSet = false;
        }
        if (node.type == 'well') {
            self.zones = [];
            self.lastSelectedWell = node;
            self.lastSelectedZoneSet = false;
        }
        if (node.type == 'well' && node.children.length == 0) {
            wiApiService.listZoneSet(node.id, function (zoneSets) {
                for (zoneSet of zoneSets) {
                    node.children.push(createZoneSetModel(zoneSet));
                }
            })
        } else if (node.type == 'zoneSet') {
            self.lastSelectedZoneSet = node;
            self.refreshZoneList();
        }
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
        } else {
            // shift key
            if (selectedNodes.length) {
                if (selectedNodes.includes(node)) return;
                if (node.type != selectedNodes[selectedNodes.length - 1].type || getParentNode(node) != getParentNode(selectedNodes[0])) {
                    unselectAllNodes(rootNode);
                    selectHandler(node, rootNode);
                } else if (node.type == 'zoneSet') {
                    if (node.$index < selectedNodes[0].$index) {
                        let fromIndex = node.$index;
                        let toIndex = selectedNodes[0].$index;
                        unselectAllNodes(rootNode);
                        for (let i = fromIndex; i <= toIndex; i++) {
                            selectHandler(getParentNode(node).children[i], rootNode);
                        }
                    } else {
                        let fromIndex = selectedNodes[0].$index;
                        let toIndex = node.$index;
                        unselectAllNodes(rootNode);
                        for (let i = fromIndex; i <= toIndex; i++) {
                            selectHandler(getParentNode(node).children[i], rootNode);
                        }
                    }
                }
            }
        }
    }
    this.refreshZoneList = function () {
        self.newZone = false;
        self.selectedZones = [];
        self.zoneEditted = false;
        if (self.newZoneSet) {
            self.zones = []
        } else {
            wiApiService.getZoneSet(self.lastSelectedZoneSet.id, function (info) {
                self.zones = info.zones;
            })
        }
    }
    this.editZone = function () {
        if (self.newZone) {
            let newZoneSet = {
                name: self.newZoneSet.name,
                idWell: self.newZoneSet.idWell
            }
            wiApiService.createZoneSet(newZoneSet, function (zoneSet) {
                self.lastSelectedZoneSet.id = zoneSet.idZoneSet;
                for (zone of self.zones) {
                    zone.idZoneSet = zoneSet.idZoneSet;
                    self.newZoneSet = false;
                    wiApiService.createZone(zone, function (zone) {
                        console.log('success', zone);
                    })
                }
            })
        }
        else if (self.zoneEditted) {
            for (zone of self.zones) {
                if (zone.zoneEditted) {
                    wiApiService.editZone(zone, function () {
                        console.log('edit success');
                    });
                }
            }
        }
    }
    this.createZone = function () {
        DialogUtils.createNewZoneDialog(ModalService, function (data) {
            if(data){
                if(self.zones.length!==0){
                    data.idZoneSet = self.lastSelectedZoneSet.id;
                    wiApiService.createZone(data, function(zone){
                        self.zones.push(data);
                    }) 
                } else {
                    self.newZone = true;
                    self.zones.push(data);
                }
            }
        });
    }
    this.deleteZone = function () {
        if (self.newZoneSet) {
            self.zones = [];
            let parentWell = getParentNode(self.newZoneSet);
            parentWell.children.splice(parentWell.children.length - 1, 1);
        } else {
            for (var z=0; z < self.zones.length; z++) {
                if (self.zones[z].flag) {
                    wiApiService.removeZone(self.zones[z].idZone, function () {
                        console.log('delete successfully');
                        self.zones.splice(z, 1);
                        if(z = self.zones.length-1){
                            self.selectedZones = [];                            
                        }
                        z = z-1;
                    })
                }
            }
        }
    }
    this.choosePattern = function (index) {
        DialogUtils.fillPatternDialog(ModalService, 
                                    self.zones[index].fill.pattern.name, 
                                    self.zones[index].fill.pattern.foreground, 
                                    self.zones[index].fill.pattern.background, function(_name) {
            if(_name) {
                self.zones[index].fill.pattern.name = _name;
                self.onZoneChanged(index);
            }
        });
    };

    this.onZoneChanged = function (index) {
        self.zoneEditted = true;
        self.zones[index].zoneEditted = true;
    }

    this.backgroundZone = function (index) {
        DialogUtils.colorPickerDialog(ModalService, self.zones[index].fill.pattern.background, function (colorStr) {
            self.zones[index].fill.pattern.background = colorStr;
            self.onZoneChanged(index);
        });
    };
    this.foregroundZone = function (index) {
        DialogUtils.colorPickerDialog(ModalService, self.zones[index].fill.pattern.foreground, function (colorStr) {
            self.zones[index].fill.pattern.foreground = colorStr;
            self.onZoneChanged(index);
        });
    };

    this.selectZoneToggle = function (zone) {
        if (!zone.flag) {
            zone.flag = true;
            self.selectedZones.push(zone);
        } else {
            zone.flag = false;
            let index = self.selectedZones.indexOf(zone);
            self.selectedZones.splice(index, 1);
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

    function selectHandler(currentNode, rootNode, callback) {
        if (currentNode.data) {
            $timeout(function () { currentNode.data.selected = true; });
            let selectedNodes = rootNode.__SELECTED_NODES;
            if (!Array.isArray(selectedNodes))
                selectedNodes = [];
            if (!selectedNodes.includes(currentNode)) {
                selectedNodes.push(currentNode);
            }
            rootNode.__SELECTED_NODES = selectedNodes;
            self.selectedTemplate = currentNode;
        }
    }
    function createWellModel(well) {
        return {
            id: well.idWell,
            name: well.name,
            type: 'well',
            data: {
                icon: 'well-16x16',
                label: well.name,
                childExpanded: false
            },
            children: []
        }
    }
    function createZoneSetModel(zoneSet) {
        return {
            id: zoneSet.idZoneSet,
            name: zoneSet.name,
            idWell: zoneSet.idWell,
            type: 'zoneSet',
            data: {
                icon: 'mineral-zone-16x16',
                label: zoneSet.name,
                childExpanded: false
            }
        }
    }
    function getParentNode(node) {
        if (node.type == 'well') {
            return self.zoneSetConfig;
        } else {
            return self.zoneSetConfig.find(function (well) {
                return well.children.indexOf(node) != -1;
            })
        }
    }

}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-zone-set-manager.html',
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        options: '<',
        configs: '<',
        idwell: '<',
    }
});

exports.name = moduleName;