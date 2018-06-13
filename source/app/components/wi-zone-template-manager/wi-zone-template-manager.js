const componentName = 'wiZoneTemplateManager';
const moduleName = 'wi-zone-templateManager';

function Controller($scope, wiComponentService, wiApiService, ModalService, $timeout) {
    let self = this;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);

    this.$onInit = function () {
        wiComponentService.putComponent('wiZoneTemplateManager', self);
    }
    this.refreshTemplateList = function () {
        self.templateConfig = [];
        self.zoneTemplates = [];
        self.selectedZoneTemplates = [];
        self.selectedTemplate = false;
        self.newTemplate = false;

        wiApiService.listZoneTemplate({}, function (templates) {
            if (templates) {
                for (template of templates) {
                    self.templateConfig.push({
                        name: template.template,
                        type: 'template',
                        data: {
                            icon: 'mineral-zone-16x16',
                            label: template.template,
                            childExpanded: true
                        },
                        children: []
                    })
                }
            }
        })
    }
    this.refreshTemplateList();

    this.selectPatterns = ['none', 'basement', 'chert', 'dolomite', 'limestone', 'sandstone', 'shale', 'siltstone'];

    this.onZoneTemplateChanged = function (index) {
        self.zoneTemplateEditted = true;
        self.zoneTemplates[index].zoneTemplateEditted = true;
    }

    this.backgroundZoneTemplate = function (index) {
        DialogUtils.colorPickerDialog(ModalService, self.zoneTemplates[index].background, function (colorStr) {
            self.zoneTemplates[index].background = colorStr;
            self.onZoneTemplateChanged(index);
        });
    };
    this.foregroundZoneTemplate = function (index) {
        DialogUtils.colorPickerDialog(ModalService, self.zoneTemplates[index].foreground, function (colorStr) {
            self.zoneTemplates[index].foreground = colorStr;
            self.onZoneTemplateChanged(index);
        });
    };
    this.choosePattern = function (index) {
        DialogUtils.fillPatternDialog(ModalService,
            self.zoneTemplates[index].pattern,
            self.zoneTemplates[index].foreground,
            self.zoneTemplates[index].background, function (_name) {
                if (_name) {
                    self.zoneTemplates[index].pattern = _name;
                    self.onZoneTemplateChanged(index);
                }
            });
    }
    function refreshZoneTemplateList() {
        self.selectedZoneTemplate = [];
        wiApiService.listAllZoneByTemplate({ template: self.selectedTemplate.name }, function (zones) {
            self.zoneTemplates = zones;
        })
    };
    this.templateClickFunction = function ($index, $event, node) {
        self.zoneTemplates = [];
        self.zoneTemplateEditted = false;
        self.selectedTemplate = node;
        if (self.newTemplate && node != self.newTemplate) {
            self.templateConfig.splice(self.templateConfig.indexOf(self.newTemplate), 1);
            self.newTemplate = false;
        }
        refreshZoneTemplateList();
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

    }
    this.createTemplate = function () {
        let promptConfig = {
            title: '<span class="zone-edit-16x16"></span> Create New Zone Template',
            inputName: 'Name',
            input: ''
        }
        DialogUtils.promptDialog(ModalService, promptConfig, function (ret) {
            if (!ret) return;
            else {
                if (!self.templateConfig.find(function (node) { return node.name == ret })) {
                    if (self.newTemplate) {
                        self.templateConfig.splice(self.templateConfig.indexOf(self.newTemplate), 1);
                    }
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
                    self.newTemplate = newNode;
                    self.templateConfig.push(newNode);
                    unselectAllNodes(self.templateConfig);
                    selectHandler(newNode, self.templateConfig);
                    refreshZoneTemplateList()
                } else {
                    // alert('template name existed');
                    unselectAllNodes(self.templateConfig);
                    selectHandler(self.templateConfig.find(function (node) {
                        return node.name == ret
                    }), self.templateConfig);
                    refreshZoneTemplateList();
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
        DialogUtils.createNewZoneSetDialog(ModalService, function (data) {
            if (data) {
                data.template = self.selectedTemplate.name;
                if (self.zoneTemplates.length !== 0) {
                    wiApiService.createZoneTemplate(data, function (zone) {
                        self.zoneTemplates.push(data);
                    })
                } else {
                    self.newTemplate = true;
                    self.zoneTemplates.push(data);
                }
            }
        });
    }
    this.deleteZoneTemplate = function () {
        if (self.newTemplate) {
            self.zoneTemplates = [];
            let newTemplateIndex = self.templateConfig.indexOf(self.templateConfig.__SELECTED_NODES);
            self.templateConfig.splice(newTemplateIndex, 1);
            self.newTemplate = false;
        } else {
            for (var z=0; z < self.zoneTemplates.length; z++) {
                console.log(self.zoneTemplates.length, z, self.zoneTemplates[z].flag);
                if (self.zoneTemplates[z].flag) {
                    console.log('delete', self.zoneTemplates[z])
                    let idZoneTemplate = self.zoneTemplates[z].idZoneTemplate;
                    self.zoneTemplates.splice(z, 1);
                    z = z-1;
                    wiApiService.deleteZoneTemplate({ idZoneTemplate: idZoneTemplate }, function () {
                        console.log('deleted');
                        if (z == self.zoneTemplates.length - 1) {
                            self.selectedZoneTemplates = [];
                        }
                    })
                }
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
        if (self.newTemplate) {
            for (zone of self.zoneTemplates) {
                zone.template = self.selectedTemplate.name;
                wiApiService.createZoneTemplate(zone, function () {
                    self.newTemplate = false;
                })
            }
        } else {
            for (zone of self.zoneTemplates) {
                if (zone.zoneTemplateEditted) {
                    wiApiService.editZoneTemplate({
                        idZoneTemplate: zone.idZoneTemplate,
                        name: zone.name,
                        background: zone.background,
                        foreground: zone.foreground,
                        pattern: zone.pattern
                    }, function () {
                        wiApiService.listAllZoneByTemplate({ template: self.selectedTemplate.name }, function (zones) {
                            self.zoneTemplates = zones;
                        })
                    })
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

    this.showTreeContextMenuFunction = function($event, $index) {
        console.log('showContextMenu', this.config[$index]);
        let contextMenu = self.getDefaultTreeviewCtxMenu(
            $index,
            this
        );
        wiComponentService
            .getComponent("ContextMenu")
            .open($event.clientX, $event.clientY, contextMenu);
    };
    this.showMoreButtonContextMenuFunction = function($event, $index) {
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