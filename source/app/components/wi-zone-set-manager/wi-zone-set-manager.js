const componentName = 'wiZoneSetManager';
const moduleName = 'wi-zone-set-manager';

function Controller($scope, wiComponentService, wiApiService, ModalService, $timeout) {
    let self = this;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let projectLoaded = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);
    this.idSelectedWell;

    this.$onInit = function () {
        wiComponentService.putComponent('wiZoneSetManager', self);
        console.log('self.idwell', self.idwell);
        self.idSelectedWell = self.idwell;
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
        let selectedWell;
        $timeout(function () {
            console.log('xxx', self.idSelectedWell);
            wiApiService.listWells({ idProject: projectLoaded.idProject }, function (wells) {
                if (wells) {
                    wells.sort(function (a, b) {
                        return parseInt(a.idWell) - parseInt(b.idWell);
                    });
                    let cutWells = wells.slice(0, selectionLength);
                    for (well of cutWells) {
                        self.zoneSetConfig.push(createWellModel(well));
                    }
                    if (self.idSelectedWell) {
                        if (!wells.find(function (well) { return well.idWell == self.idSelectedWell })) {
                            wells.push(selectedWell);
                        }
                        selectedWell = self.zoneSetConfig.find(function (well) { return well.idWell == self.idSelectedWell });

                        console.log('selectedWell', selectedWell);
                        if (self.idSelectedWell && selectedWell) {
                            console.log('ccc', self.idSelectedWell, selectedWell);
                            selectHandler(selectedWell, self.zoneSetConfig);
                            self.lastSelectedWell = selectedWell;
                        }
                    }
                }
            })
        })
    }
    this.refreshZoneSetList();

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
                    if (info.zones) {
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
                    } else {
                        console.log('rs', result);
                        toastr.error(result.reason);
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
                else {
                    wiApiService.createZoneSet({
                        name: data.name,
                        template: data.template.template || "",
                        idWell: parentWell.idWell
                    }, function (res) {
                        console.log('res', res);
                        if (res) {
                            let newNode = createZoneSetModel(res)
                            newNode.template = data.template.template;
                            parentWell.children.push(newNode);
                            unselectAllNodes(self.zoneSetConfig);
                            selectHandler(newNode, self.zoneSetConfig);
                        } else {
                            console.log('Cannot create zoneset');
                        }
                    })
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
            if (node.type == 'zoneSet') {
                let parentWell = getParentNode(node);
                let idZoneSet = node.idZoneSet;
                let index = parentWell.children.indexOf(node);
                wiApiService.removeZoneSet(idZoneSet, function () {
                    console.log('done');
                    parentWell.children.splice(index, 1);
                    self.zones = [];
                    self.lastSelectedZoneSet = false;
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
        } else if (node.type == 'zoneSet') {
            self.lastSelectedWell = getParentNode(node);
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
        self.lastSelectedZoneSet.template = false;
        var scroll = $('#zoneScroll');
        scroll.animate({ scrollTop: 0 });
        wiApiService.getZoneSet(self.lastSelectedZoneSet.idZoneSet, function (info) {
            if (info) {
                console.log('zones', info.zones);
                self.zones = info.zones;
                for (let z of self.zones) {
                    z.orderDepth = z.startDepth;
                }
                if (!self.lastSelectedZoneSet.template && self.zones[0] && self.zones[0].zone_template) {
                    self.lastSelectedZoneSet.template = self.zones[0].zone_template.template;
                }
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
                if (checkValidZoneDepth(zone.startDepth, zone.endDepth, zone)) {
                    wiApiService.editZone(zone, function (rs) {
                        console.log('edit success', rs);
                        zone.editted = false;
                        self.zoneEditted = false;
                        zone.orderDepth = zone.startDepth;
                    });
                } else {
                    toastr.error('Cannot edit Zone' + zone.name + ', idZone: ' + zone.idZone + '. start and stop depth are not valid.');
                }
            }
        }
    }

    this.deleteZone = function (isAll) {
        console.log('1111', self.zones)
        for (z of self.zones) {  
            let index = self.zones.indexOf(z);
            if (z.flag || isAll) {
                console.log('z', z);
                wiApiService.removeZone(z.idZone, function (rs) {
                    console.log('delete successfully', rs);
                    self.selectedZones = [];
                    self.zones.splice(index, 1);
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

    this.showCreateButtonContextMenuFunction = function ($event, $index) {
        if (self.selectedZones.length == 0 && self.zones[0]) {
            self.zones[self.zones.length - 1].flag = true;
            self.selectedZones.push(self.zones[self.zones.length - 1]);
            var scroll = $('#zoneScroll');
            scroll.animate({ scrollTop: scroll.prop("scrollHeight") });
        }

        if (self.selectedZones.length > 1) {
            let lastSelectedZone = self.selectedZones[self.selectedZones.length - 1];
            console.log('last selectedZone', lastSelectedZone);
            for (zone of self.selectedZones) {
                zone.flag = false;
            }
            if (lastSelectedZone) {
                self.selectedZones = [];
                lastSelectedZone.flag = true;
                self.selectedZones.push(lastSelectedZone);
            }
        }
        let contextMenu = self.getCreateButtonCtxMenu(
            $index,
            this
        );
        wiComponentService
            .getComponent("ContextMenu")
            .open($event.clientX, $event.clientY, contextMenu);
    };

    this.getCreateButtonCtxMenu = function ($index, treeviewCtrl) {
        return [
            {
                name: "CreateZoneAbove",
                label: "Create Zone Above",
                icon: "",
                handler: function () {
                    self.createZone(false, true);
                }
            }, {
                name: "CreateZoneBelow",
                label: "Create Zone Below",
                icon: "",
                handler: function () {
                    self.createZone(true, false);
                }
            }
        ]
    };

    this.createZone = function (isBelow, isAbove) {
        let depthObj;

        let lastSelectedZone = self.selectedZones[self.selectedZones.length - 1];
        depthObj = getNewZoneDepth(lastSelectedZone, isBelow);
        console.log('sss', depthObj);
        if (depthObj == -1) {
            if (isAbove) {
                toastr.error('Can not add zone above.');
            } else {
                toastr.error('Can not add zone below.')
            }
        } else {
            DialogUtils.createNewZoneDialog(ModalService, self.lastSelectedZoneSet.template, depthObj, function (data) {
                if (data) {
                    if (checkValidZoneDepth(data.startDepth, data.endDepth, null)) {
                        console.log('data', data);
                        data.idZoneSet = self.lastSelectedZoneSet.idZoneSet;
                        let dataCopy = angular.copy(data);
                        wiApiService.createZone(dataCopy, function (zone) {
                            console.log('zone', zone)
                            if (zone) {
                                self.refreshZoneList();
                                // var scroll = $('#zoneScroll');
                                // scroll.animate({ scrollTop: scroll.prop("scrollHeight") });
                            } else {
                                toastr.error('Cannot create zone');
                            }
                        })
                    } else {
                        toastr.error('Start depth and stop depth are not valid');
                    }
                }
            });
        }
    }

    this.showDeleteButtonContextMenuFunction = function ($event, $index) {
        let contextMenu = self.getDeleteButtonCtxMenu(
            $index,
            this
        );
        if (self.selectedZones.length == 0 && self.zones[0]) {
            self.zones[self.zones.length - 1].flag = true;
            self.selectedZones.push(self.zones[self.zones.length - 1]);
            var scroll = $('#zoneScroll');
            scroll.animate({ scrollTop: scroll.prop("scrollHeight") });
        }
        wiComponentService
            .getComponent("ContextMenu")
            .open($event.clientX, $event.clientY, contextMenu);
    };

    this.getDeleteButtonCtxMenu = function ($index, treeviewCtrl) {
        return [
            {
                name: "DeleteAllZones",
                label: "Delete All Zones",
                icon: "",
                handler: function () {
                    self.deleteZone(true);
                }
            }, {
                name: "DeleteSelectedZones",
                label: "Delete Selected Zones",
                icon: "",
                handler: function () {
                    self.deleteZone(false);
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
            if (currentNode.type == 'well' && currentNode.children.length == 0) {
                wiApiService.listZoneSet(currentNode.idWell, function (zoneSets) {
                    currentNode.data.childExpanded = true;
                    for (zoneSet of zoneSets) {
                        currentNode.children.push(createZoneSetModel(zoneSet));
                    }
                })
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
            properties: {
                topDepth: well.topDepth,
                bottomDepth: well.bottomDepth,
                step: well.step
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
            zone_template: {
                pattern: zone.zone_template.pattern,
                background: zone.zone_template.background,
                foreground: zone.zone_template.foreground,
                idZoneTemplate: zone.zone_template.idZoneTemplate,
                template: zone.zone_template.template
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
    function checkValidZoneDepth(startDepth, endDepth, zone) {
        let parentWell = getParentNode(self.lastSelectedZoneSet);
        if (startDepth >= endDepth) {
            return false;
        } else if (startDepth < parentWell.properties.topDepth || startDepth > parentWell.properties.bottomDepth || endDepth < parentWell.properties.topDepth || endDepth > parentWell.properties.bottomDepth) {
            return false;
        } else if (self.zones[0]) {
            for (z of self.zones) {
                if (z != zone) {
                    if ((startDepth >= z.startDepth && startDepth < z.endDepth) || (endDepth > z.startDepth && endDepth <= z.endDepth) || (startDepth < z.startDepth && endDepth > z.endDepth)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    function sortZoneArrByDepth(zone1, zone2) {
        if (zone1.startDepth < zone2.startDepth) {
            return -1;
        } else if (zone1.startDepth > zone2.startDepth) {
            return 1;
        }
        return 0;
    }
    function getNewZoneDepth(selectedZone, isBelow) {
        let wellTopDepth = self.lastSelectedWell.properties.topDepth;
        let wellBottomDepth = self.lastSelectedWell.properties.bottomDepth;
        let zoneArr = angular.copy(self.zones);
        zoneArr.sort(sortZoneArrByDepth);
        console.log('zzz', self.zones, 'xxx', zoneArr);
        let index = zoneArr.indexOf(zoneArr.find(function (z) { return z.idZone == selectedZone.idZone }));
        let free;
        if (isBelow) {
            console.log('index', index);
            if (zoneArr[index + 1]) {
                free = zoneArr[index + 1].startDepth - selectedZone.endDepth >= 50 ? 50 : zoneArr[index + 1].startDepth - selectedZone.endDepth;
            } else {
                free = wellBottomDepth - selectedZone.endDepth >= 50 ? 50 : wellBottomDepth - selectedZone.endDepth;
            }
            if (!free || free == 0) {
                return -1;
            } else {
                return {
                    startDepth: selectedZone.endDepth,
                    endDepth: selectedZone.endDepth + free
                }
            }

        } else {
            console.log('wellTopDepth', wellTopDepth);
            if (zoneArr[index - 1]) {
                free = selectedZone.startDepth - zoneArr[index - 1].endDepth >= 50 ? 50 : selectedZone.startDepth - zoneArr[index - 1].endDepth;
            } else {
                free = selectedZone.startDepth - wellTopDepth >= 50 ? 50 : selectedZone.startDepth - wellTopDepth;
            }
            if (!free || free == 0) {
                return -1;
            } else {
                return {
                    startDepth: selectedZone.startDepth - free,
                    endDepth: selectedZone.startDepth
                }
            }
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