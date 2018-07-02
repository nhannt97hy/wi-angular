const componentName = 'wiZoneTemplateManager';
const moduleName = 'wi-zone-templateManager';

function Controller($scope, wiComponentService, wiApiService, ModalService, $timeout) {
    let self = this;
    window.ZST = this;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);

    this.$onInit = function () {
        wiComponentService.putComponent('wiZoneTemplateManager', self);
    }

    let topIdx = 0;
    let selectionLength = 20;
    let delta = 5;

    function addNode(template) {
        let node = {
            name: template.template,
            type: 'template',
            data: {
                icon: 'mineral-zone-16x16',
                label: template.template,
                childExpanded: true
            },
            children: []
        }
        return node;
    }
    this.refreshTemplateList = function () {
        self.templateConfig = [];
        self.zoneTemplates = [];
        self.selectedZoneTemplates = [];
        self.selectedTemplate = false;


        wiApiService.listZoneTemplate({}, function (templates) {
            templates.sort(function (a, b) {
                return parseInt(a.idZoneTemplate) - parseInt(b.idZoneTemplate);
            });
            if (templates) {
                let cutTemplates = templates.slice(0, selectionLength);
                for (template of cutTemplates) {
                    self.templateConfig.push(addNode(template))
                }
            }
        })
    }
    this.refreshTemplateList();

    this.onZoneTemplateChanged = function (item) {
        self.zoneTemplateEditted = true;
        item.editted = true;
    }

    this.backgroundZoneTemplate = function (item) {
        DialogUtils.colorPickerDialog(ModalService, item.background, function (colorStr) {
            item.background = colorStr;
            self.onZoneTemplateChanged(item);
        });
    };
    this.foregroundZoneTemplate = function (item) {
        DialogUtils.colorPickerDialog(ModalService, item.foreground, function (colorStr) {
            item.foreground = colorStr;
            self.onZoneTemplateChanged(item);
        });
    };
    this.choosePattern = function (item) {
        DialogUtils.fillPatternDialog(ModalService,
            item.pattern,
            item.foreground,
            item.background, function (_name) {
                if (_name) {
                    item.pattern = _name;
                    self.onZoneTemplateChanged(item);
                }
            });
    }

    this.upTrigger = function (cb) {
        if (topIdx > 0) {
            wiApiService.listZoneTemplate({}, function (templates) {
                templates.sort(function (a, b) {
                    return parseInt(a.idZoneTemplate) - parseInt(b.idZoneTemplate);
                });
                if (templates) {
                    if (topIdx > delta) {
                        let newSource = templates.slice(topIdx - delta, topIdx).reverse();
                        let newList = newSource.map(t => addNode(t));
                        topIdx = topIdx - delta;
                        cb(newList, self.templateConfig);
                    } else {
                        let newSource = templates.slice(0, topIdx).reverse();
                        let newList = newSource.map(t => addNode(t));
                        topIdx = 0;
                        cb(newList, self.templateConfig);
                    }
                }
            })
        } else cb([]);
    };
    this.downTrigger = function (cb) {
        wiApiService.listZoneTemplate({}, function (templates) {
            if (templates) {
                templates.sort(function (a, b) {
                    return parseInt(a.idZoneTemplate) - parseInt(b.idZoneTemplate);
                });
                let bottomIdx = topIdx + selectionLength;
                if (bottomIdx < templates.length) {
                    if (templates.length - bottomIdx > delta) {
                        let newSource = templates.slice(bottomIdx, delta + bottomIdx);
                        let newList = newSource.map(t => addNode(t));
                        topIdx = topIdx + delta;
                        cb(newList, self.templateConfig);
                    } else {
                        let newSource = templates.slice(bottomIdx, templates.length);
                        let newList = newSource.map(t => addNode(t));
                        topIdx = topIdx + templates.length - bottomIdx;
                        cb(newList, self.templateConfig);
                    }
                } else cb([]);
            }
        })
    }

    this.refreshZoneTemplateList = function () {
        console.log('refreshZoneTemplateList()');
        self.selectedZoneTemplate = [];
        wiApiService.listAllZoneByTemplate({ template: self.selectedTemplate.name }, function (zones) {
            self.zoneTemplates = zones;
        })
    };
    this.templateClickFunction = function ($index, $event, node) {
        self.zoneTemplates = [];
        self.zoneTemplateEditted = false;
        self.selectedTemplate = node;
        self.refreshZoneTemplateList();
        clickFunction($index, $event, node, self.templateConfig, true);
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
                if (node.type != selectedNodes[selectedNodes.length - 1].type || node.parent != selectedNodes[0].parent) {
                    unselectAllNodes(rootNode);
                    selectHandler(node, rootNode);
                } else {
                    if (node.$index < selectedNodes[0].$index) {
                        let fromIndex = node.$index;
                        let toIndex = selectedNodes[0].$index;
                        unselectAllNodes(rootNode);
                        for (let i = fromIndex; i <= toIndex; i++) {
                            if (Array.isArray(rootNode)) {
                                selectHandler(rootNode[i], rootNode);
                            }
                            else {
                                selectHandler(rootNode.children[i], rootNode);
                            }
                        }
                    } else {
                        let fromIndex = selectedNodes[0].$index;
                        let toIndex = node.$index;
                        unselectAllNodes(rootNode);
                        for (let i = fromIndex; i <= toIndex; i++) {
                            if (Array.isArray(rootNode)) {
                                selectHandler(rootNode[i], rootNode);
                            }
                            else {
                                selectHandler(rootNode.children[i], rootNode);
                            }
                        }
                    }
                }
            }
        }
    }
    this.exportTemplate = function () {
        console.log("exportTemplate", self.templateConfig.__SELECTED_NODES);
        let selectedNodes = self.templateConfig.__SELECTED_NODES;
        let returnData = [];
        if (Array.isArray(selectedNodes)) {
            for (node of selectedNodes) {
                let index = selectedNodes.indexOf(node);
                console.log('selectedNOde', node);
                let templateObj = {
                    template: node.name,
                    zonesets: []
                }
                wiApiService.listAllZoneByTemplate({ template: node.name }, function (zonesets) {
                    console.log('zonesets', zonesets);
                    for (zoneset of zonesets) {
                        templateObj.zonesets.push({
                            idZoneset: zoneset.idZoneTemplate,
                            name: zoneset.name,
                            background: zoneset.background,
                            foreground: zoneset.foreground,
                            pattern: zoneset.pattern
                        });
                        if (zoneset == zonesets[zonesets.length - 1]) {
                            returnData.push(templateObj);
                            if (index == selectedNodes.length - 1) {
                                console.log('return data', JSON.stringify(returnData));

                                let filename = 'template';
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
    this.createTemplate = function () {
        let promptConfig = {
            title: '<span class="zone-edit-16x16"></span> New Zone Template',
            inputName: 'Zoneset template name',
            input: ''
        }
        DialogUtils.promptDialog(ModalService, promptConfig, function (ret) {
            if (!ret) return;
            else {
                if (!self.templateConfig.find(function (node) { return node.name == ret })) {
                    let newNode = {
                        name: ret,
                        type: 'template',
                        data: {
                            icon: 'mineral-zone-16x16',
                            label: ret,
                            childExpanded: true
                        },
                        children: []
                    }
                    self.templateConfig.push(newNode);
                    unselectAllNodes(self.templateConfig);
                    selectHandler(newNode, self.templateConfig);
                    self.refreshZoneTemplateList()
                } else {
                    // alert('template name existed');
                    unselectAllNodes(self.templateConfig);
                    selectHandler(self.templateConfig.find(function (node) {
                        return node.name == ret
                    }), self.templateConfig);
                    self.refreshZoneTemplateList();
                }
            }
        });
    }
    this.deleteTemplate = function () {
        deleteTemplate(function () { })
    }
    function deleteTemplate(callback) {
        for (node of self.templateConfig.__SELECTED_NODES) {
            self.zoneTemplates = [];
            let nodeName = node.name;
            let index = self.templateConfig.indexOf(node);
            self.templateConfig.splice(index, 1);
            wiApiService.listAllZoneByTemplate({ template: nodeName }, function (zones) {
                for (z of zones) {
                    wiApiService.deleteZoneTemplate({
                        idZoneTemplate: z.idZoneTemplate
                    }, function () {
                        callback();
                    })
                }
            })
        }
    }
    this.createZoneTemplate = function () {
        DialogUtils.createNewZoneTemplateDialog(ModalService, function (data) {
            if (data) {
                data.template = self.selectedTemplate.name;
                wiApiService.createZoneTemplate(data, function (zone) {
                    data.idZoneTemplate = zone.idZoneTemplate;
                    self.zoneTemplates.push(data);
                })
            }
        });
    }
    this.deleteZoneTemplate = function () {
        
        for (z of self.zoneTemplates) {
            if (zonesets.flag) {
                wiApiService.deleteZoneTemplate({ idZoneTemplate: z.idZoneTemplate }, function () {
                    console.log('deleted');
                    if (self.zoneTemplates.indexOf(z) == self.zoneTemplates.length - 1) {
                        self.refreshZoneTemplateList()
                    }
                })
            }
        }
    }

    this.selectZoneTemplateToggle = function (zone) {
        console.log('flag', zone.flag);
        if (!zone.flag) {
            zone.flag = true;
            self.selectedZoneTemplates.push(zone);
            console.log('flag1', zone.flag);
        } else {
            zone.flag = false;
            let index = self.selectedZoneTemplates.indexOf(zone);
            self.selectedZoneTemplates.splice(index, 1);
            console.log('flag2', zone.flag);
        }
    }
    this.editZoneTemplate = function () {
        console.log('editZoneTemplate');
        for (zone of self.zoneTemplates) {
            if (zone.editted) {
                console.log('idZoneTemplate', zone.idZoneTemplate)
                wiApiService.editZoneTemplate({
                    idZoneTemplate: zone.idZoneTemplate,
                    name: zone.name,
                    background: zone.background,
                    foreground: zone.foreground,
                    pattern: zone.pattern
                }, function () {
                    wiApiService.listAllZoneByTemplate({ template: self.selectedTemplate.name }, function (zones) {
                        self.zoneTemplates = zones;
                        zone.editted = false;
                        self.zoneTemplateEditted = false;
                    })
                })
            }
        }
    }
    this.unselectAllNodes = unselectAllNodes;
    function unselectAllNodes(rootNode) {
        rootNode.forEach(function (item) {
            utils.visit(item, function
                (node) {
                if (node.data) node.data.selected = false;
            });
        });
        rootNode.__SELECTED_NODES = [];
    }

    this.showTreeContextMenuFunction = function ($event, $index) {
        console.log('showContextMenu', this.config[$index]);
        let contextMenu = self.getDefaultTreeviewCtxMenu(
            $index,
            this
        );
        wiComponentService
            .getComponent("ContextMenu")
            .open($event.clientX, $event.clientY, contextMenu);
    };
    this.showMoreButtonContextMenuFunction = function ($event, $index) {
        console.log('showHeaderContextMenu');
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
                label: "Export Template",
                icon: "file-export-16x16",
                handler: function () {
                    self.exportTemplate();
                }
            }, {
                name: "Delete",
                label: "Delete Template",
                icon: "delete-16x16",
                handler: function () {
                    self.deleteTemplate();
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
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-zone-template-manager.html',
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        options: '<',
        configs: '<',
        idwell: '<',
    }
});

exports.name = moduleName;
