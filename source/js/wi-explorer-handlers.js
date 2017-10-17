exports.ImportASCIIButtonClicked = function () {
    console.log('ImportASCIIButton is clicked');
}

exports.ImportMultiASCIIButtonClicked = function () {
    console.log('ImportMultiASCIIButton is clicked');
}

exports.ImportLASButtonClicked = function () {
    let handlers = this.wiComponentService.getComponent(this.wiComponentService.GLOBAL_HANDLERS);
    handlers.ImportLASButtonClicked();
}

exports.ImportMultiLASButtonClicked = function () {
    let handlers = this.wiComponentService.getComponent(this.wiComponentService.GLOBAL_HANDLERS);
    handlers.ImportMultiLASButtonClicked();
}

exports.ImportDLISButtonClicked = function () {
    console.log('ImportDLISButton is clicked');
}

exports.Interval_CoreLoaderButtonClicked = function () {
    console.log('Interval/CoreLoaderButton is clicked');
}

exports.MultiWellCoreLoaderButtonClicked = function () {
    console.log('MultiWellCoreLoaderButton is clicked');
}

exports.ImportWellHeaderButtonClicked = function () {
    console.log('ImportWellHeaderButton is clicked');
}

exports.ImportWellTopButtonClicked = function () {
    console.log('ImportWellTopButton is clicked');
}

exports.ReloadProjectButtonClicked = function () {
    let utils = this.wiComponentService.getComponent(this.wiComponentService.UTILS);
    utils.refreshProjectState();
}

exports.OpenTemplateButtonClicked = function () {
    let handlers = this.wiComponentService.getComponent(this.wiComponentService.GLOBAL_HANDLERS);
    handlers.OpenTemplateButtonClicked();
}

exports.CollapseProjectButtonClicked = function () {
    let rootTreeviewCtrl = this.wiComponentService.getComponent('WiExplorertreeview');
    let rootConfig = rootTreeviewCtrl.config;
    var expaned = false;
    for (let child of rootConfig) {
        expaned = child.data.childExpanded;
        if (!expaned) break;
    }
    if (expaned) {
        rootTreeviewCtrl.collapseAll(rootConfig);
    } else {
        rootTreeviewCtrl.expandAll(rootConfig);
    }
}

exports.DeleteItemButtonClicked = function () {
    const wiApiService = this.wiApiService;
    const $timeout = this.$timeout;
    const wiComponentService = this.wiComponentService;
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    const dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    // let selectedNode = utils.getSelectedNode();
    let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
    // if (!selectedNode || !selectedNode.data) return;
    if (!Array.isArray(selectedNodes)) return;
    let selectedNodesName = selectedNodes[0].type + '(s):';
    selectedNodes.forEach(function (selectedNode) {
        selectedNodesName += ' ' + selectedNode.data.label;
    })
    dialogUtils.confirmDialog(this.ModalService, "Delete confirm", `Are you sure to delete ${selectedNodesName} ?`, function (yes) {
        if (yes) {
            async.eachOf(selectedNodes, function (selectedNode, index, next) {
                switch (selectedNode.type) {
                    case 'well':
                        wiApiService.removeWell(selectedNode.properties.idWell, function () {
                            $timeout(function () {
                                selectedNode.data.deleted = true;
                                let modelsWithTab = [];
                                modelsWithTab = modelsWithTab.concat(selectedNode.children.find(child => child.type == 'logplots').children);
                                modelsWithTab = modelsWithTab.concat(selectedNode.children.find(child => child.type == 'crossplots').children);
                                modelsWithTab = modelsWithTab.concat(selectedNode.children.find(child => child.type == 'histograms').children);
                                modelsWithTab.forEach(function (model) {
                                    if (model) wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER).removeTabWithModel(model);
                                });
                                next();
                            });
                        });
                        break;
                    case 'dataset':
                        wiApiService.removeDataset(selectedNode.properties.idDataset, function () {
                            $timeout(function () {
                                selectedNode.children.forEach(function (curve) {
                                    utils.updateWiLogplotOnModelDeleted(curve);
                                    utils.updateWiHistogramOnModelDeleted(curve);
                                })
                                selectedNode.data.deleted = true;
                                next();
                            });
                        });
                        break;
                    case 'curve':
                        wiApiService.removeCurve(selectedNode.properties.idCurve, function () {
                            $timeout(function () {
                                utils.updateWiLogplotOnModelDeleted(selectedNode);
                                utils.updateWiHistogramOnModelDeleted(selectedNode);
                                selectedNode.data.deleted = true;
                                next();
                            });
                        });
                        break;
                    case 'zoneset':
                        wiApiService.removeZoneSet(selectedNode.properties.idZoneSet, function () {
                            $timeout(function () {
                                selectedNode.data.deleted = true;
                                next();
                            });
                        });
                        break;
                    case 'zone':
                        wiApiService.removeZone(selectedNode.properties.idZone, function () {
                            $timeout(function () {
                                selectedNode.data.deleted = true;
                                next();
                            });
                        });
                        break;
                    case 'logplot':
                        wiApiService.removeLogplot(selectedNode.properties.idPlot, function () {
                            $timeout(function () {
                                selectedNode.data.deleted = true;
                                wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER).removeTabWithModel(selectedNode);
                                next();
                            });
                        });
                        break;
                    case 'crossplot':
                        wiApiService.removeCrossplot(selectedNode.properties.idCrossplot, function () {
                            $timeout(function () {
                                selectedNode.data.deleted = true;
                                wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER).removeTabWithModel(selectedNode);
                                next();
                            });
                        });
                        break;
                    case 'histogram':
                        wiApiService.removeHistogram(selectedNode.properties.idHistogram, function () {
                            $timeout(function () {
                                selectedNode.data.deleted = true;
                                wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER).removeTabWithModel(selectedNode);
                                next();
                            });
                        });
                        break;
                    default: return;
                }
            }, function (err) {
                utils.refreshProjectState();
                wiComponentService.putComponent(wiComponentService.SELECTED_NODES, []);
            });
        }
    });
}

exports.BrowseProjectButtonClicked = function () {
    let self = this;
    let wiComponentService = this.wiComponentService;
    let DialogUtils = wiComponentService.getComponent('DIALOG_UTILS');
    DialogUtils.openProjectDialog(this.ModalService, function (projectData) {
        let utils = self.wiComponentService.getComponent('UTILS');
        utils.projectOpen(self.wiComponentService, projectData);
    });
}
