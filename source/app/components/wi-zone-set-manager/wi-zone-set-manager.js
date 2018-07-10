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
        let selectedWell;
        $timeout(function () {
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

                        if (self.idSelectedWell && selectedWell) {
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
        let doneNum = 0;
        let number = self.zoneSetConfig.__SELECTED_NODES.length;
        for (node of self.zoneSetConfig.__SELECTED_NODES) {
            if (node.type == 'zoneSet') {
                let idZoneSet = node.idZoneSet;
                wiApiService.removeZoneSet(idZoneSet, function () {
                    console.log('done');
                    doneNum++;
                    self.zones = [];
                    self.lastSelectedZoneSet = false;
                    if (doneNum == number) {
                        let parent = getParentNode(node);
                        parent.children = [];
                        selectHandler(parent, self.zoneSetConfig);
                    }
                })
            }
        }
    }

    this.exportToMarkerset = function () {
        let node;
        if (self.zoneSetConfig.__SELECTED_NODES != 0) {
            node = self.zoneSetConfig.__SELECTED_NODES[self.zoneSetConfig.__SELECTED_NODES.length - 1];
            unselectAllNodes(self.zoneSetConfig);
            selectHandler(node, self.zoneSetConfig);
        }
        if (node.type == 'zoneSet') {
            let parentWell = getParentNode(node);
            let idZoneSet = node.idZoneSet;
            let index = parentWell.children.indexOf(node);
            DialogUtils.chooseMarkerTemplateDialog(ModalService, function (data) {
                if (data) {
                    wiApiService.createMarkerSet({
                        name: node.name,
                        idWell: node.idWell
                    }, function (markerset) {
                        let numDone = 0;
                        if (markerset) {
                            let depths = getMarkerDepths(self.zones);
                            for (d of depths) {
                                wiApiService.createMarker({
                                    depth: d,
                                    idMarkerSet: markerset.idMarkerSet,
                                    idMarkerTemplate: data.idMarkerTemplate
                                }, function (m) {
                                    numDone++;
                                    if (numDone == depths.length) {
                                        toastr.success('Export zoneset to markerset successfully');
                                    }
                                })
                            }
                        } else {
                            toastr.error('Marker set existed.');
                        }
                    })
                }
            })
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
        self.zoneEditted = false;
        self.lastSelectedZoneSet.template = false;
        var scroll = $('#zoneScroll');
        scroll.animate({ scrollTop: 0 });
        wiApiService.getZoneSet(self.lastSelectedZoneSet.idZoneSet, function (info) {
            if (info) {
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
                    toastr.error('Start and stop depth are not valid.');
                }
            }
        }
    }

    this.deleteZone = function (isAll) {
        let doneNum = 0;
        let selectedZones = getSelectedZones();
        for (let z of self.zones) {
            let index = self.zones.indexOf(z);
            if (z.flag || isAll) {
                wiApiService.removeZone(z.idZone, function (rs) {
                    doneNum++;
                    if (doneNum == selectedZones.length) {
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

    this.moveZoneUp = function () {
        let zoneToMove;
        let selectedZones = getSelectedZones();
        async.eachOfSeries(selectedZones, function (zone, i, done) {
            let zoneArr = angular.copy(self.zones);
            zoneArr.sort(sortZoneArrByDepth);
            let index = zoneArr.indexOf(zoneArr.find(function (z) { return z.idZone == zone.idZone }));
            if (index == 0) {
                toastr.error('Can not move zone ' + zoneArr[0].zone_template.name + ' up.');
                done();
            } else {
                let indexToSwap = getNearestUnselectedZoneIndex(zoneArr[index], true);
                if (indexToSwap >= 0) {
                    swapTwoZones(zoneArr[index], zoneArr[indexToSwap], function () {
                        let realZone = self.zones.find(function (z) { return z.idZone == zone.idZone });
                        realZone.flag = true;
                        done();
                    });
                }
            }
        }, function (err) {
            console.log('err', err);
        })
    }

    this.moveZoneDown = function () {
        let zoneToMove;
        let selectedZones = getSelectedZones();
        async.eachOfSeries(selectedZones.reverse(), function (zone, i, done) {
            let zoneArr = angular.copy(self.zones);
            zoneArr.sort(sortZoneArrByDepth);
            let index = zoneArr.indexOf(zoneArr.find(function (z) { return z.idZone == zone.idZone }));
            if (index == zoneArr.length - 1) {
                toastr.error('Can not move zone ' + zoneArr[zoneArr.length - 1].zone_template.name + ' down.');
                done();
            } else {
                let indexToSwap = getNearestUnselectedZoneIndex(zoneArr[index], false);
                if (indexToSwap >= 0) {
                    swapTwoZones(zoneArr[index], zoneArr[indexToSwap], function () {
                        let realZone = self.zones.find(function (z) { return z.idZone == zone.idZone });
                        realZone.flag = true;
                        done();
                    });
                }
            }
        }, function (err) {
            console.log('done', err);
        })
    }

    this.swapTwoZones = function () {
        let selectedZones = getSelectedZones();
        let zone1 = selectedZones[0];
        let zone2 = selectedZones[1];
        let zoneArr = angular.copy(self.zones);
        zoneArr.sort(sortZoneArrByDepth);
        if ((roundDepth(zone1.endDepth - zone1.startDepth) != roundDepth(zone2.endDepth - zone2.startDepth)) && (zone1.startDepth != zone2.endDepth) && (zone1.endDepth != zone2.startDepth)) {
            console.log(roundDepth(zone1.endDepth - zone1.startDepth), roundDepth(zone2.endDepth - zone2.startDepth))
            toastr.error('Can not swap this zones.');
        } else {
            let z1 = zoneArr.find(function (z) { return zone1.idZone == z.idZone; });
            let z2 = zoneArr.find(function (z) { return z.idZone == zone2.idZone; });
            swapTwoZones(z1, z2);
            zone1.flag = true;
            zone2.flag = true;
        }
    }
    function swapTwoZones(zone1, zone2, callback) {
        let callbackCalled = false;
        if (zone1.startDepth == zone2.endDepth || zone1.endDepth == zone2.startDepth) {
            const deep1 = zone1.endDepth - zone1.startDepth;
            const deep2 = zone2.endDepth - zone2.startDepth;
            const start1 = zone1.startDepth;
            const start2 = zone2.startDepth;

            zone1.startDepth = start1 < start2 ? start1 + deep2 : start2;
            zone1.endDepth = start1 < start2 ? start1 + deep2 + deep1 : start2 + deep1;
            zone2.startDepth = start1 < start2 ? start1 : start2 + deep1;
            zone2.endDepth = start1 < start2 ? start1 + deep2 : start2 + deep1 + deep2;
        } else {
            const start1 = zone1.startDepth;
            const end1 = zone1.endDepth;
            zone1.startDepth = zone2.startDepth;
            zone1.endDepth = zone2.endDepth;
            zone2.startDepth = start1;
            zone2.endDepth = end1;
        }

        $timeout(function () {
            let realZone1 = self.zones.find(function (z) { return z.idZone == zone1.idZone });
            realZone1.orderDepth = zone1.startDepth;
            realZone1.startDepth = zone1.startDepth;
            realZone1.endDepth = zone1.endDepth;
            let realZone2 = self.zones.find(function (z) { return z.idZone == zone2.idZone });
            realZone2.orderDepth = zone2.startDepth;
            realZone2.startDepth = zone2.startDepth;
            realZone2.endDepth = zone2.endDepth;

            wiApiService.editZone(zone1, function (rs) {
                zone1.done = true;
                if (zone1.done && zone2.done && !callbackCalled && callback) {
                    callbackCalled = true;
                    callback();
                }
            });
            wiApiService.editZone(zone2, function (rs) {
                zone2.done = true;
                if (zone1.done && zone2.done && !callbackCalled && callback) {
                    callbackCalled = true;
                    callback();
                }
            });
        })
    }

    this.selectZoneToggle = function (zone, $event) {
        if ($event.shiftKey && self.lastSelectedZone) {
            let zoneArr = angular.copy(self.zones);
            zoneArr.sort(sortZoneArrByDepth);
            const zoneIndex = zoneArr.indexOf(zoneArr.find(function (z) { return z.idZone == self.lastSelectedZone.idZone }));
            const currIndex = zoneArr.indexOf(zoneArr.find(function (z) { return z.idZone == zone.idZone }));
            let minIndex = Math.min(zoneIndex, currIndex);
            let maxIndex = Math.max(zoneIndex, currIndex);
            for (let i = minIndex; i <= maxIndex; i++) {
                let index = self.zones.indexOf(self.zones.find(function (z) { return z.idZone == zoneArr[i].idZone }));
                self.zones[index].flag = zoneArr[zoneIndex].flag;
            }
        } else {
            zone.flag = !zone.flag;
            self.lastSelectedZone = zone;
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
                name: "Export to Json",
                label: "Export Zone set",
                icon: "file-export-16x16",
                handler: function () {
                    self.exportZoneSets();
                }
            }, {
                name: "Delete",
                label: "Delete Zone set",
                icon: "delete-16x16",
                handler: function () {
                    self.deleteZoneSet();
                }
            }, {
                name: "Export to Marker set",
                label: "Export to Marker set",
                icon: "marker-add-16x16",
                handler: function () {
                    self.exportToMarkerset();
                }
            }
        ]
    };

    this.showCreateButtonContextMenuFunction = function ($event, $index) {
        let selectedZones = getSelectedZones();
        if (selectedZones.length == 0 && self.zones[0]) {
            let zoneArr = angular.copy(self.zones).sort(sortZoneArrByDepth);
            let index = self.zones.indexOf(self.zones.find(function (z) { return z.idZone == zoneArr[zoneArr.length - 1].idZone }));
            self.zones[index].flag = true;
            var scroll = $('#zoneScroll');
            scroll.animate({ scrollTop: scroll.prop("scrollHeight") });
        }

        if (selectedZones.length > 1) {
            for (zone of selectedZones) {
                let realZone = self.zones.find(function (z) { return z.idZone == zone.idZone });
                realZone.flag = false;
            }
            if (self.lastSelectedZone) {
                self.lastSelectedZone.flag = true;
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
        let selectedZones = getSelectedZones();
        let lastSelectedZone = selectedZones.length != 0 ? selectedZones[selectedZones.length - 1] : null;
        depthObj = getNewZoneDepth(lastSelectedZone, isBelow);
        if (depthObj == -1) {
            if (isAbove) {
                toastr.error('Can not add zone above.');
            } else {
                toastr.error('Can not add zone below.')
            }
        } else {
            DialogUtils.createNewZoneDialog(ModalService, depthObj, function (data) {
                if (data) {
                    if (checkValidZoneDepth(data.startDepth, data.endDepth, null)) {
                        data.idZoneSet = self.lastSelectedZoneSet.idZoneSet;
                        let dataCopy = angular.copy(data);
                        wiApiService.createZone(dataCopy, function (zone) {
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

    this.chooseZoneTemplate = function (zone) {
        DialogUtils.chooseZoneTemplateDialog(ModalService, zone.zone_template, function (data) {
            zone.zone_template.background = data.background;
            zone.zone_template.foreground = data.foreground;
            zone.zone_template.pattern = data.pattern;
            zone.zone_template.template = data.template;
            zone.zone_template.idZoneTemplate = data.idZoneTemplate;
            zone.zone_template.name = data.name;
            wiApiService.editZone({ idZone: zone.idZone, idZoneTemplate: data.idZoneTemplate }, function (rs) {
                if(rs) {
                    console.log('edit success', rs);
                } else {
                    toastr.error('Can not change zone template');
                }
            });
        })
    }

    this.showDeleteButtonContextMenuFunction = function ($event, $index) {
        let selectedZones = getSelectedZones();
        let contextMenu = self.getDeleteButtonCtxMenu(
            $index,
            this
        );
        if (selectedZones.length == 0 && self.zones[0]) {
            let zoneArr = angular.copy(self.zones).sort(sortZoneArrByDepth);
            let index = self.zones.indexOf(self.zones.find(function (z) { return z.idZone == zoneArr[zoneArr.length - 1].idZone }));
            self.zones[index].flag = true;
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
                if (self.lastSelectedZoneSet != currentNode) {
                    self.lastSelectedZoneSet = currentNode;
                    self.refreshZoneList();
                }
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
        if (!selectedZone) {
            return {
                startDepth: isBelow ? Number(wellBottomDepth) - 50 : Number(wellTopDepth),
                endDepth: isBelow ? Number(wellBottomDepth) : Number(wellTopDepth) + 50
            }
        }
        let zoneArr = angular.copy(self.zones);
        zoneArr.sort(sortZoneArrByDepth);
        let index = zoneArr.indexOf(zoneArr.find(function (z) { return z.idZone == selectedZone.idZone }));
        let free;
        if (isBelow) {
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

    function getSelectedZones() {
        let selectedZone = [];
        let zoneArr = angular.copy(self.zones);
        zoneArr.sort(sortZoneArrByDepth);
        for (zone of zoneArr) {
            if (zone.flag) {
                selectedZone.push(zone);
            }
        }
        return selectedZone;
    }
    this.getSelectedZones = getSelectedZones;

    function getNearestUnselectedZoneIndex(zone, isAbove) {
        let zoneArr = angular.copy(self.zones);
        zoneArr.sort(sortZoneArrByDepth);
        let index = zoneArr.indexOf(zoneArr.find(function (z) { return z.idZone == zone.idZone }));
        if (isAbove) {
            for (let i = index - 1; i >= 0; i--) {
                if (!zoneArr[i].flag) return i;
            }
        } else {
            for (let i = index + 1; i <= zoneArr.length - 1; i++) {
                if (!zoneArr[i].flag) return i;
            }
        }
        return;
    }

    function getMarkerDepths(zones) {
        let depths = new Set();
        for (zone of zones) {
            depths.add(roundDepth(zone.startDepth));
            depths.add(roundDepth(zone.endDepth));
        }
        return Array.from(depths);
    }

    function roundDepth(depth) {
        return Math.round(depth * 10000) / 10000;
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