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
            wiApiService.listAllZoneByTemplate({ template: template }, function (zones) {
                for (zone of zones) {
                    self.config.push(createZoneModel(zone));
                }
            })
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
                    if (bottomIdx < templates.length) {
                        if (templates.length - bottomIdx > delta) {
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
            clickFunction($index, $event, node, self.config, true);
            let selectedNode = self.config.__SELECTED_NODES[0];
            console.log('selectedNode', selectedNode);
            if(selectedNode) {
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

        this.onOkButtonClicked = function () {
            close(self.returnZone);
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