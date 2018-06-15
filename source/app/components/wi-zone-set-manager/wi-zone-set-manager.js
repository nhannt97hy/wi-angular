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

    let topIdx = 0;
    let selectionLength = 20;
    let delta = 5;

    this.refreshZoneSetList = function () {
        self.lastSelectedWell = false;
        self.lastSelectedZoneSet = false;
        self.newZoneSet = false;
        self.zoneSetConfig = [];
        self.zones = [];
        wiApiService.listWells({ idProject: projectLoaded.idProject }, function (wells) {
            wells.sort(function (a, b) {
                return parseInt(a.idWell) - parseInt(b.idWell);
            });
            if (wells) {
                let cutWells = wells.slice(0, selectionLength);
                for (well of cutWells) {
                    self.zoneSetConfig.push(createWellModel(well));
                }
            }
        })
    }
    this.refreshZoneSetList();

    this.selectPatterns = ['none', 'basement', 'chert', 'dolomite', 'limestone', 'sandstone', 'shale', 'siltstone'];

    this.exportZoneSets = function () {
        let selectedNodes = self.zoneSetConfig.__SELECTED_NODES; 
        let returnData = [];
        if(Array.isArray(selectedNodes)){
            for(node of selectedNodes){
                console.log('selectedNOde', node);
                let zoneSetObj = {
                    idZoneSet: node.idZoneSet,
                    name: node.name,
                    idWell: node.idWell,
                    zones: []
                }
                wiApiService.getZoneSet(node.idZoneSet, function (info) {
                    for(zone of info.zones) {
                        zoneSetObj.zones.push(createZoneModel(zone));
                        if(zone == info.zones[info.zones.length-1]){
                            returnData.push(zoneSetObj);
                            if(node == selectedNodes[selectedNodes.length-1]){
                                console.log('return data', returnData);
                            }
                        }
                    }
                })
            }
        }
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
                else if (data.template.template) {
                    wiApiService.createZoneSet({
                        name: data.name,
                        template: data.template.template,
                        idWell: parentWell.idWell
                    }, function (res) {
                        let newNode = createZoneSetModel(res)
                        parentWell.children.push(newNode);
                        selectHandler(newNode, self.zoneSetConfig);
                    })
                }
                else {
                    if (!parentWell.children.find(function (node) { return node.name == data.name })) {
                        if (self.newZoneSet) {
                            parentWell.children.splice(parentWell.children.indexOf(self.newZoneSet), 1);
                        }
                        let newNode = {
                            idZoneSet: "",
                            name: data.name,
                            idWell: parentWell.idWell,
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
    this.upTrigger = function (cb) {
        if (topIdx > 0) {
            wiApiService.listWells({ idProject: projectLoaded.idProject }, function (wells) {
                if (wells) {
                    wells.sort(function (a, b) {
                        return parseInt(a.idWell) - parseInt(b.idWell);
                    });
                    if (topIdx > delta) {
                        let newSource = wells.slice(topIdx - delta, topIdx).reverse();
                        let newList = newSource.map(w => createWellModel(w));
                        topIdx = topIdx - delta;
                        cb(newList, self.zoneSetConfig);
                    } else {
                        let newSource = wells.slice(0, topIdx).reverse();
                        let newList = newSource.map(w => createWellModel(w));
                        topIdx = 0;
                        cb(newList, self.zoneSetConfig);
                    }
                }
            })
        } else cb([]);
    };

    this.downTrigger = function (cb) {
        wiApiService.listWells({ idProject: projectLoaded.idProject }, function (wells) {
            if (wells) {
                wells.sort(function (a, b) {
                    return parseInt(a.idWell) - parseInt(b.idWell);
                });
                let bottomIdx = topIdx + selectionLength;
                if (bottomIdx < wells.length) {
                    if (wells.length - bottomIdx > delta) {
                        let newSource = wells.slice(bottomIdx, delta + bottomIdx);
                        let newList = newSource.map(w => createWellModel(w));
                        topIdx = topIdx + delta;
                        cb(newList, self.zoneSetConfig);
                    } else {
                        let newSource = wells.slice(bottomIdx, wells.length);
                        let newList = newSource.map(w => createWellModel(w));
                        topIdx = topIdx + wells.length - bottomIdx;
                        cb(newList, self.zoneSetConfig);
                    }
                } else cb([]);
            }
        })
    };

    this.deleteZoneSet = function () {
        for (node of self.zoneSetConfig.__SELECTED_NODES) {
            if (node == self.newZoneSet) {
                let parentWell = getParentNode(node)
                parentWell.children.splice(parentWell.children.indexOf(node), 1);
                self.newZoneSet = false;
            } else if (node.type == 'zoneSet') {
                let parentWell = getParentNode(node);
                let idZoneSet = node.idZoneSet;
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
            wiApiService.listZoneSet(node.idWell, function (zoneSets) {
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
            wiApiService.getZoneSet(self.lastSelectedZoneSet.idZoneSet, function (info) {
                if(info){
                    console.log('zones', info.zones);
                    self.zones = info.zones;
                }
               else{
                   console.log('no info');
               }
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
                self.lastSelectedZoneSet.idZoneSet = zoneSet.idZoneSet;
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
            if (data) {
                if (!self.newZoneSet) {
                    data.idZoneSet = self.lastSelectedZoneSet.idZoneSet;
                    wiApiService.createZone(data, function (zone) {
                        data.idZone = zone.idZone;
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
            let length = self.zones.length
            for (z of self.zones) {
                if (z.flag) {
                    self.zones.splice(self.zones.indexOf(z), 1);
                    wiApiService.removeZone(z.idZone, function () {
                        console.log('delete successfully');
                        if (self.zones.indexOf(z) == self.zones.length - 1) {
                            self.selectedZones = [];
                        }
                    })
                }
            }
        }
    }
    this.choosePattern = function (zone) {
        DialogUtils.fillPatternDialog(ModalService,
            zone.fill.pattern.name,
            zone.fill.pattern.foreground,
            zone.fill.pattern.background, function (_name) {
                if (_name) {
                    zone.fill.pattern.name = _name;
                    self.onZoneChanged(zone);
                }
            });
    };

    this.onZoneChanged = function (zone) {
        self.zoneEditted = true;
        zone.zoneEditted = true;
    }

    this.backgroundZone = function (zone) {
        DialogUtils.colorPickerDialog(ModalService, zone.fill.pattern.background, function (colorStr) {
            zone.fill.pattern.background = colorStr;
            self.onZoneChanged(zone);
        });
    };
    this.foregroundZone = function (zone) {
        let index = self.zones.indexOf(zone);
        DialogUtils.colorPickerDialog(ModalService, zone.fill.pattern.foreground, function (colorStr) {
            zone.fill.pattern.foreground = colorStr;
            self.onZoneChanged(zone);
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

    this.showTreeContextMenuFunction = function ($event, $index) {
        let selectedNodes = self.zoneSetConfig.__SELECTED_NODES;
        if (selectedNodes[0].type == 'zoneSet') {
            let contextMenu = self.getDefaultTreeviewCtxMenu(
                $index,
                this
            );
            wiComponentService
                .getComponent("ContextMenu")
                .open($event.clientX, $event.clientY, contextMenu);
        }
    };
    this.showMoreButtonContextMenuFunction = function ($event, $index) {
        let contextMenu = self.getDefaultTreeviewCtxMenu(
            $index,
            this
        );
        wiComponentService
            .getComponent("ContextMenu")
            .open($event.clientX, $event.clientY, contextMenu);
    };

    this.getDefaultTreeviewCtxMenu = function ($index, treeviewCtrl) {
        return [
            {
                name: "Export",
                label: "Export ZoneSet",
                icon: "file-export-16x16",
                handler: function () {
                    self.exportZoneSets();
                }
            }, {
                name: "Delete",
                label: "Delete ZoneSet",
                icon: "delete-16x16",
                handler: function () {
                    self.deleteZoneSet();
                }
            }
        ]
    };

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
            idWell: well.idWell,
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
            idZoneSet: zoneSet.idZoneSet,
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
    function createZoneModel (zone) {
        return {
            idZone: zone.idZone,
            name: zone.name,
            startDepth: zone.startDepth,
            endDepth: zone.endDepth,
            fill: {
                pattern: {
                    name: zone.fill.pattern.name,
                    background: zone.fill.pattern.background,
                    foreground: zone.fill.pattern.foreground
                }
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