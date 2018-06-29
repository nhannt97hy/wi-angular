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
        self.zoneSetConfig = [];
        self.zones = [];
        self.selectedZones = [];        
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
        if (Array.isArray(selectedNodes)) {
            for (node of selectedNodes) {
                let index = selectedNodes.indexOf(node);
                console.log('selectedNOde', node);
                let zoneSetObj = {
                    idZoneSet: node.idZoneSet,
                    name: node.name,
                    idWell: node.idWell,
                    zones: []
                }
                wiApiService.getZoneSet(node.idZoneSet, function (info) {
                    for (zone of info.zones) {
                        zoneSetObj.zones.push(createZoneModel(zone));
                        if (zone == info.zones[info.zones.length - 1]) {
                            returnData.push(zoneSetObj);
                            if (index == selectedNodes.length - 1) {

                                let filename = 'zoneset';
                                let blob = new Blob([angular.toJson(returnData, true)], { type: 'text/plain' });
                                if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                                    window.navigator.msSaveOrOpenBlob(blob, filename);
                                } else {
                                    var e = document.createEvent('MouseEvents'),
                                        a = document.createElement('a');
                                    a.download = filename;
                                    a.href = window.URL.createObjectURL(blob);
                                    a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
                                    e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                                    a.dispatchEvent(e);
                                    // window.URL.revokeObjectURL(url); // clean the url.createObjectURL resource
                                }
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
                        unselectAllNodes(self.zoneSetConfig);
                        selectHandler(newNode, self.zoneSetConfig);
                    })
                }
                // else {
                //     if (!parentWell.children.find(function (node) { return node.name == data.name })) {
                //         if (self.newZoneSet) {
                //             parentWell.children.splice(parentWell.children.indexOf(self.newZoneSet), 1);
                //         }
                //         let newNode = {
                //             idZoneSet: "",
                //             name: data.name,
                //             idWell: parentWell.idWell,
                //             type: 'zoneSet',
                //             data: {
                //                 icon: 'mineral-zone-16x16',
                //                 label: data.name,
                //                 template: data.template,
                //                 childExpanded: true
                //             },
                //             children: []
                //         }
                //         self.newZoneSet = newNode;
                //         self.lastSelectedZoneSet = newNode;
                //         parentWell.children.push(newNode);
                //         parentWell.data.childExpanded = true;
                //         unselectAllNodes(self.zoneSetConfig);
                //         selectHandler(newNode, self.zoneSetConfig);
                //         self.refreshZoneList();
                //     } else {
                //         if (self.newZoneSet) {
                //             parentWell.children.splice(parentWell.children.indexOf(self.newZoneSet), 1);
                //         }
                //         // alert('template name existed');
                //         unselectAllNodes(self.zoneSetConfig);
                //         selectHandler(parentWell.children.find(function (node) { return node.name == data.name }), self.zoneSetConfig);
                //         self.refreshZoneList();
                //     }
                // }
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
            if (node.type == 'zoneSet') {
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
        if (node.type == 'well') {
            self.zones = [];
            self.lastSelectedWell = node;
            self.lastSelectedZoneSet = false;
            node.data.childExpanded = true;
        }
        if (node.type == 'well' && node.children.length == 0) {
            wiApiService.listZoneSet(node.idWell, function (zoneSets) {
                for (zoneSet of zoneSets) {
                    node.children.push(createZoneSetModel(zoneSet));
                }
            })
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
        wiApiService.getZoneSet(self.lastSelectedZoneSet.idZoneSet, function (info) {
            if (info) {
                console.log('zones', info.zones);
                self.zones = info.zones;
            }
            else {
                console.log('no info');
            }
        })
    }
    this.editZone = function () {
        console.log('editZone');
        for (zone of self.zones) {
            if (zone.editted) {
                wiApiService.editZone(zone, function () {
                    console.log('edit success');
                    zone.editted = false;
                    self.zoneEditted = false;
                });
            }
        }
    }
    this.createZone = function () {
        DialogUtils.createNewZoneDialog(ModalService, self.zones[0].zone_template.template, function (data) {
            if (data) {
                data.idZoneSet = self.lastSelectedZoneSet.idZoneSet;
                let dataCopy = angular.copy(data);
                wiApiService.createZone(dataCopy, function (zone) {
                    self.refreshZoneList();
                })
            }
        });
    }
    this.deleteZone = function () {
        console.log('1111', self.zones)
        let length = self.zones.length
        for (z of self.zones) {
            if (z.flag) {
                console.log('z', z);
                wiApiService.removeZone(z.idZone, function () {
                    console.log('delete successfully');
                    self.selectedZones = [];
                    if (self.zones.indexOf(z) == self.zones.length - 1) {
                        self.refreshZoneList();
                    }
                })
            }
        }
    }

    this.onZoneChanged = function (zone) {
        self.zoneEditted = true;
        zone.editted = true;
    }

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
            if (currentNode.type == 'zoneSet') {
                self.lastSelectedZoneSet = currentNode;
                self.refreshZoneList();
            }
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
    function createZoneModel(zone) {
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