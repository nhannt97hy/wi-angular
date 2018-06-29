let helper = require('./DialogHelper');
module.exports = function (ModalService, template, callback) {
    function ModalController($scope, close, wiApiService, wiComponentService, ModalService, $timeout) {
        let self = this;
        self.template = { template: '' };
        let projectLoaded = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);

        let topIdx = 0;
        let selectionLength = 8;
        let delta = 5;

        this.refreshTree = function () {
            self.config = [];
            if(template) {
                let templateNode = {
                    name: template,
                    type: 'template',
                    data: {
                        icon: 'mineral-zone-16x16',
                        label: template,
                        childExpanded: true
                    },
                    children: []
                }
                self.config.push(templateNode);
                // wiApiService.listAllZoneByTemplate({ template: template }, function (zones) {
                //     for (zone of zones) {
                //         templateNode.children.push(createZoneModel(zone));
                //         if(zones.indexOf(zone) == zones.length-1) {
                //             self.config.push(templateNode);
                //         }
                //     }
                // })
            } else {
                wiApiService.listZoneTemplate({}, function (templates) {
                    templates.sort(function (a, b) {
                        return parseInt(a.idZoneTemplate) - parseInt(b.idZoneTemplate);
                    });
                    if (templates) {
                        let cutTemplates = templates.slice(0, selectionLength);
                        for (template of cutTemplates) {
                            self.config.push(createTemplateModel(template))
                        }
                    }
                })
            }
        }

        self.returnZone = {
            startDepth: "",
            endDepth: "",
            name: "",
            foreground: "",
            background: "",
            pattern: "",
            idZoneTemplate: ""
        }

        this.refreshTree();

        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        this.upTrigger = function (cb) {
            wiApiService.listZoneTemplate({}, function (templates) {
                if (templates) {
                    if (topIdx > 0) {
                        if (topIdx > delta) {
                            let newSource = templates.slice(topIdx - delta, topIdx).reverse();
                            let newList = newSource.map(t => createTemplateModel(t));
                            topIdx = topIdx - delta;
                            cb(newList, self.config);
                        } else {
                            let newSource = templates.slice(0, topIdx).reverse();
                            let newList = newSource.map(t => createTemplateModel(t));
                            topIdx = 0;
                            cb(newList, self.config);
                        }
                    } else cb([]);
                }
            })
        }
        this.downTrigger = function (cb) {
            console.log('down trigger');            
            wiApiService.listZoneTemplate({}, function (templates) {
                if (templates) {
                    templates.sort(function (a, b) {
                        return parseInt(a.idZoneTemplate) - parseInt(b.idZoneTemplate);
                    });
                    let bottomIdx = topIdx + selectionLength;
                    if (bottomIdx < templates.length) {
                        if (templates.length - bottomIdx > delta) {
                            let newSource = templates.slice(bottomIdx, delta + bottomIdx);
                            let newList = newSource.map(t => createTemplateModel(t));
                            topIdx = topIdx + delta;
                            cb(newList, self.config);
                        } else {
                            let newSource = templates.slice(bottomIdx, templates.length);
                            let newList = newSource.map(t => createTemplateModel(t));
                            topIdx = topIdx + templates.length - bottomIdx;
                            cb(newList, self.config);
                        }
                    } else cb([]);
                }
            })
        }

        this.clickFunction = function ($index, $event, node) {
            clickFunction($index, $event, node, self.config, true);
            let selectedNodes = self.config.__SELECTED_NODES;
            let selectedNode = selectedNodes[selectedNodes.length-1];
            console.log('selectedNode', selectedNode);
            if(node.type == 'template' && node.children.length == 0) {
                wiApiService.listAllZoneByTemplate({ template: node.name }, function (zones) {
                    if(zones) {
                        for (zone of zones) {
                            node.children.push(createZoneModel(zone));
                        }
                        node.data.childExpanded = true;
                    }
                })
            }
            if(selectedNode && selectedNode.type=='zoneTemplate') {
                self.returnZone.name = selectedNode.name;
                self.returnZone.background = selectedNode.background;
                self.returnZone.foreground = selectedNode.foreground;
                self.returnZone.pattern = selectedNode.pattern;
                self.returnZone.idZoneTemplate = selectedNode.idZoneTemplate;
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
            }
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
        function unselectAllNodes(rootNode) {
            rootNode.forEach(function (item) {
                utils.visit(item, function (node) {
                    if (node.data) node.data.selected = false;
                });
            });
            rootNode.__SELECTED_NODES = [];
        }

        function createZoneModel(zone) {
            return {
                idZoneTemplate: zone.idZoneTemplate,
                template: zone.template,
                type: 'zoneTemplate',
                background: zone.background,
                foreground: zone.foreground,
                pattern: zone.pattern,
                name: zone.name,
                data: {
                    icon: 'mineral-zone-16x16',
                    label: zone.name,
                    childExpanded: false
                }
            }
        }
        function createTemplateModel(template) {
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

        this.onOkButtonClicked = function () {
            let selectedNodes = self.config.__SELECTED_NODES;
            if(self.returnZone.startDepth >= self.returnZone.endDepth) {
                toastr.error('start depth and stop depth are not valid');
            } else if (!self.returnZone.idZoneTemplate){
                toastr.error('no zone template was choosed');
            }
             else {
                close(self.returnZone);                
            }
        };

        this.onCancelButtonClicked = function () {
            close(null);
        };
    }

    ModalService.showModal({
        templateUrl: 'create-new-zone-modal.html',
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (data) {
            helper.removeBackdrop();
            if (data) {
                callback(data);
            }
        });
    });
};