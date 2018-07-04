let helper = require('./DialogHelper');
module.exports = function (ModalService, template, depthObj, callback) {
    function ModalController($scope, close, wiApiService, wiComponentService, ModalService, $timeout) {
        let self = this;
        self.template = { template: '' };
        let projectLoaded = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);
        this.config = [];

        let topIdx = 0;
        let selectionLength = 8;
        let delta = 5;

        self.returnZone = {
            startDepth: depthObj.startDepth,
            endDepth: depthObj.endDepth,
            name: "",
            foreground: "",
            background: "",
            pattern: "",
            idZoneTemplate: ""
        }
        this.refreshTree = function () {
            self.config = [];
            if (template) {
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
                wiApiService.listAllZoneByTemplate({ template: template }, function (zones) {
                    for (zone of zones) {
                        templateNode.children.push(createZoneModel(zone));
                    }
                    $timeout(function () {
                        selectHandler(self.config[0].children[Math.floor(Math.random() * zones.length)], self.config);
                    })
                })
            } else {
                wiApiService.listZoneTemplate({}, function (templates) {
                    templates.sort(function (a, b) {
                        return parseInt(a.idZoneTemplate) - parseInt(b.idZoneTemplate);
                    });
                    if (templates) {
                        let cutTemplates = templates.slice(0, selectionLength);
                        
                        for (template of cutTemplates) {
                            self.config.push(createTemplateModel(template))
                            if (template == cutTemplates[0] ) {
                                selectHandler(self.config[0], self.config, function() {
                                    selectHandler(self.config[0].children[Math.floor(Math.random() * self.config[0].children.length)], self.config);
                                });
                            //     wiApiService.listAllZoneByTemplate({ template: template.template }, function (zones) {
                            //         if (zones) {
                            //             for (zone of zones) {
                            //                 template.children.push(createZoneModel(zone));
                            //             }
                            //             template.data.childExpanded = true;
                            //         }
                                   
                            //     })
                            }
                        }
                    }
                })
            }
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
            if (currentNode.data) {
                if (currentNode.type == 'zoneTemplate') {
                    self.returnZone.name = currentNode.name;
                    self.returnZone.background = currentNode.background;
                    self.returnZone.foreground = currentNode.foreground;
                    self.returnZone.pattern = currentNode.pattern;
                    self.returnZone.idZoneTemplate = currentNode.idZoneTemplate;
                }
                if (currentNode.type == 'template' && currentNode.children.length == 0) {
                    wiApiService.listAllZoneByTemplate({ template: currentNode.name }, function (zones) {
                        if (zones) {
                            for (zone of zones) {
                                currentNode.children.push(createZoneModel(zone));
                            }
                            currentNode.data.childExpanded = true;
                            callback();
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

        // function getRandomTemplateIndex() {
        //     let x = self.config[0].children.length;
        //     if(x == 0 ) {
        //         wiApiService.listAllZoneByTemplate({ template: self.config[0].template }, function (zones) {
        //             for (zone of zones) {
        //                 self.config[0].children.push(createZoneModel(zone));
        //             }
        //         })
        //     }
        //     $timeout(function () {
        //         console.log('getRandomTemplate in', x, self.config[0].children[Math.floor(Math.random() * x)]);
        //     })
        //     console.log('getRandomTemplate', x, self.config[0].children[Math.floor(Math.random() * x)]);            
        //     return self.config[0].children[Math.floor(Math.random() * x)];
        // }
        this.onOkButtonClicked = function () {
            let selectedNodes = self.config.__SELECTED_NODES;
            if (self.returnZone.startDepth >= self.returnZone.endDepth) {
                toastr.error('start depth and stop depth are not valid');
            } else if (!self.returnZone.idZoneTemplate) {
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