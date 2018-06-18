let helper = require('./DialogHelper');
module.exports = function (ModalService, callback) {
    function ModalController($scope, close, wiApiService, wiComponentService, ModalService, $timeout) {
        let self = this;
        let projectLoaded = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);

        let topIdx = 0;
        let selectionLength = 8;
        let delta = 5;

        this.refreshTree = function () {
            self.config = [];

            wiApiService.listZoneTemplate({}, function (templates) {
                if (templates) {
                    let cutTemplates = templates.slice(0, selectionLength);
                    for (template of cutTemplates) {
                        self.config.push(createTemplateModel(template));
                    }
                }
            })
        }

        this.refreshTree();

        this.upTrigger = function (cb) {
            wiApiService.listZoneTemplate({}, function (templates) {
                if (templates) {
                    if (topIdx > 0) {
                        if (topIdx > delta) {
                            let newSource = templates.slice(topIdx - delta, topIdx).reverse();
                            let newList = newSource.map(t => addNode(t));
                            topIdx = topIdx - delta;
                            cb(newList, self.config);
                        } else {
                            let newSource = templates.slice(0, topIdx).reverse();
                            let newList = newSource.map(t => addNode(t));
                            topIdx = 0;
                            cb(newList, self.config);
                        }
                    } else cb([]);
                }
            })
        }
        this.downTrigger = function (cb) {
            wiApiService.listZoneTemplate({}, function (templates) {
                if (templates) {
                    templates.sort(function (a, b) {
                        return parseInt(a.idZoneTemplate) - parseInt(b.idZoneTemplate);
                    });
                    let bottomIdx = topIdx + selectionLength;
                    if(bottomIdx < templates.length) {
                        if(templates.length - bottomIdx > delta) {
                            let newSource = templates.slice(bottomIdx, delta + bottomIdx);
                            let newList = newSource.map(t => addNode(t));
                            topIdx = topIdx + delta;
                            cb(newList, self.config);
                        } else {
                            let newSource = templates.slice(bottomIdx, templates.length);
                            let newList = newSource.map(t => addNode(t));
                            topIdx = topIdx + templates.length - bottomIdx;
                            cb(newList, self.config);
                        }
                    } else cb([]);
                }
            })
        }

        this.clickFunction = function ($index, $event, node) {
            if (node.type == 'zoneset') {
                self.returnZoneset = {
                    idZoneset: node.idZoneset,
                    name: node.name,
                    fill: {
                        pattern: {
                            name: node.pattern,
                            background: node.background,
                            foreground: node.foreground,
                        }
                    }
                }
            } else if (node.type == 'template' && node.children.length == 0) {
                wiApiService.listAllZoneByTemplate({ template: node.name }, function (zonesets) {
                    for (zoneset of zonesets) {
                        node.children.push(createZonesetModel(zoneset));
                    }
                })
            }
            clickFunction($index, $event, node, self.config, true);
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
        this.onOkButtonClicked = function () {
            close(self.returnZoneset);
        };

        this.onCancelButtonClicked = function () {
            close(null);
        };
        function createTemplateModel(template) {
            let node = {
                name: template.template,
                type: 'template',
                data: {
                    icon: 'mineral-zone-16x16',
                    label: template.template,
                    childExpanded: false
                },
                children: []
            }
            return node;
        };
        function createZonesetModel(zoneset) {
            let node = {
                idZoneset: zoneset.idZoneTemplate,
                name: zoneset.name,
                type: 'zoneset',
                data: {
                    icon: 'mineral-zone-16x16',
                    label: zoneset.name,
                    childExpanded: false,
                },
                background: zoneset.background,
                foreground: zoneset.foreground,
                pattern: zoneset.pattern
            }
            return node;
        }
    }

    ModalService.showModal({
        templateUrl: 'choose-template-modal.html',
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