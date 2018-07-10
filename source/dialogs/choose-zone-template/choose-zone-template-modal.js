let helper = require('./DialogHelper');
module.exports = function (ModalService, selectedZoneTemplate, callback) {
    function ModalController($scope, close, wiApiService, wiComponentService, ModalService, $timeout) {
        let self = this;
        let projectLoaded = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);
        this.config = [];
        this.selectedZoneTemplate = selectedZoneTemplate;

        let topIdx = 0;
        let selectionLength = 8;
        let delta = 5;

        self.returnZoneTemplate = {
            name: selectedZoneTemplate ? selectedZoneTemplate.name : null,
            foreground: selectedZoneTemplate ? selectedZoneTemplate.foreground : null,
            background: selectedZoneTemplate ? selectedZoneTemplate.background : null,
            pattern: selectedZoneTemplate ? selectedZoneTemplate.pattern : null,
            idZoneTemplate: selectedZoneTemplate ? selectedZoneTemplate.idZoneTemplate : null,
            template: selectedZoneTemplate ? selectedZoneTemplate.template : null,
            idZoneSet: selectedZoneTemplate ? selectedZoneTemplate.idZoneSet : null
        }
        this.refreshTree = function () {
            self.config = [];
            wiApiService.listZoneTemplate({}, function (templates) {
                console.log('template', templates);
                if (templates) {
                    templates.sort(function (a, b) {
                        return parseInt(a.idZoneTemplate) - parseInt(b.idZoneTemplate);
                    });
                    let cutTemplates = templates.slice(0, selectionLength);
                    for (template of cutTemplates) {
                        self.config.push(createTemplateModel(template));
                    }
                    $timeout(function () {
                        console.log('---', self.config);
                        for (template of self.config) {
                            if (selectedZoneTemplate && template.name == selectedZoneTemplate.template) {
                                console.log(1);
                                selectHandler(template, self.config, function () {
                                    let templateNode = self.config.find(function (n) { return n.name = template.name });
                                    let zoneNode = templateNode.children.find(function (z) { return z.idZoneTemplate == selectedZoneTemplate.idZoneTemplate });
                                    console.log('1111', templateNode.children, selectedZoneTemplate.idZoneTemplate, zoneNode);
                                    selectHandler(zoneNode, self.config);
                                });
                            } else if (self.config.length > 0) {
                                let randomIndex = Math.floor(Math.random() * (self.config.length - 1));
                                selectHandler(self.config[randomIndex], self.config, function () {
                                    selectHandler(self.config[randomIndex].children[Math.floor(Math.random() * (self.config[randomIndex].children.length - 1))], self.config);
                                })
                            }
                        }
                    })
                }
            })
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
            let selectedNode = selectedNodes[selectedNodes.length - 1];
            console.log('selectedNode', selectedNode);
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
            console.log('selectHandler', currentNode);
            if (currentNode && currentNode.data) {
                if (currentNode.type == 'zoneTemplate') {
                    self.returnZoneTemplate.template = currentNode.template;
                    self.returnZoneTemplate.background = currentNode.background;
                    self.returnZoneTemplate.foreground = currentNode.foreground;
                    self.returnZoneTemplate.pattern = currentNode.pattern;
                    self.returnZoneTemplate.name = currentNode.name;
                    self.returnZoneTemplate.idZoneTemplate = currentNode.idZoneTemplate;
                }
                if (currentNode.type == 'template' && currentNode.children.length == 0) {
                    wiApiService.listAllZoneByTemplate({ template: currentNode.name }, function (zones) {
                        if (zones) {
                            for (zone of zones) {
                                currentNode.children.push(createZoneModel(zone));
                            }
                            currentNode.data.childExpanded = true;
                            if (callback) {
                                callback();
                            }
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
            close(self.returnZoneTemplate);
        };

        this.onCancelButtonClicked = function () {
            close(null);
        };
    }

    ModalService.showModal({
        templateUrl: 'choose-zone-template-modal.html',
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