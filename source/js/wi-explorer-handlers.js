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


exports.ImportFromInventoryButtonClicked = function () {
    let handlers = this.wiComponentService.getComponent(this.wiComponentService.GLOBAL_HANDLERS);
    handlers.ImportFromInventoryButtonClicked();
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
    const wiComponentService = this.wiComponentService;
    let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
    let rootTreeviewCtrl = wiComponentService.getComponent('WiExplorertreeview');
    if (!selectedNodes) {
        let rootConfig = rootTreeviewCtrl.config;
        selectedNodes = rootConfig
    }
    var expaned = false;
    for (let child of selectedNodes) {
        expaned = child.data.childExpanded;
        if (!expaned) break;
    }
    if (expaned) {
        rootTreeviewCtrl.collapseAll(selectedNodes);
    } else {
        rootTreeviewCtrl.expandAll(selectedNodes);
    }
}

exports.DeleteItemButtonClicked = function (isPermanently = false) {
    const wiApiService = this.wiApiService;
    const $timeout = this.$timeout;
    const wiComponentService = this.wiComponentService;
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    const dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
    const removables = ['group', 'well', 'dataset', 'curve', 'zoneset', 'zone', 'logplot', 'crossplot', 'histogram', 'comboview'];
    let isValid = false;
    removables.forEach(t => {
        if (selectedNodes[0].type == t) {
            isValid = true;
        }
    });
    if (selectedNodes[0].type)
        if (!Array.isArray(selectedNodes) || !isValid) return;
    let selectedNodesName = '';
    selectedNodes.forEach(function (selectedNode, index) {
        selectedNodesName += index == selectedNodes.length-1 ? selectedNode.data.label : selectedNode.data.label + ', ';
    })
    let message = '';
    if (selectedNodes.length > 1) {
        message = isPermanently ? `Are you sure to delete following ${selectedNodes[0].type}s <b>permanently</b>?:<br> ${selectedNodesName}`
            : `Are you sure to delete following ${selectedNodes[0].type}s?:<br> ${selectedNodesName}?`;
    } else {
        message = isPermanently ? `Are you sure to delete ${selectedNodes[0].type} <b>${selectedNodesName} permanently</b>?:`
            : `Are you sure to delete ${selectedNodes[0].type} <b>${selectedNodesName}</b>?`;
    }
    dialogUtils.confirmDialog(this.ModalService, "Delete confirmation", message, function (yes) {
        if (yes) {
            async.eachOf(selectedNodes, function (selectedNode, index, next) {
                let deleteFunction = function () { },
                    cleanUpFunction = function () { };
                switch (selectedNode.type) {
                    case 'group':
                        deleteFunction = wiApiService.removeGroup;
                        break;
                    case 'well':
                        deleteFunction = wiApiService.removeWell;
                        cleanUpFunction = function () {
                            let modelsWithTab = [];
                            modelsWithTab = modelsWithTab.concat(selectedNode.children.find(child => child.type == 'logplots').children);
                            modelsWithTab = modelsWithTab.concat(selectedNode.children.find(child => child.type == 'crossplots').children);
                            modelsWithTab = modelsWithTab.concat(selectedNode.children.find(child => child.type == 'histograms').children);
                            modelsWithTab = modelsWithTab.concat(selectedNode.children.find(child => child.type == 'comboviews').children);
                            modelsWithTab.forEach(function (model) {
                                if (model) wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER).removeTabWithModel(model);
                            });
                        }
                        break;
                    case 'dataset':
                        deleteFunction = wiApiService.removeDataset;
                        cleanUpFunction = function () {
                            selectedNode.children.forEach(function (curve) {
                                utils.updateWiLogplotOnModelDeleted(curve);
                                utils.updateWiHistogramOnModelDeleted(curve);
                            });
                        }
                        break;
                    case 'curve':
                        deleteFunction = wiApiService.removeCurve;
                        cleanFunction = function () {
                            utils.updateWiLogplotOnModelDeleted(selectedNode);
                            utils.updateWiHistogramOnModelDeleted(selectedNode);
                        }
                        break;
                    case 'zoneset':
                        deleteFunction = wiApiService.removeZoneSet;
                        break;
                    case 'zone':
                        deleteFunction = wiApiService.removeZone;
                        break;
                    case 'logplot':
                        deleteFunction = wiApiService.removeLogplot;
                        cleanFunction = function () {
                            wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER).removeTabWithModel(selectedNode);
                        }
                        break;
                    case 'crossplot':
                        deleteFunction = wiApiService.removeCrossplot;
                        cleanUpFunction = function () {
                            wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER).removeTabWithModel(selectedNode);
                        }
                        break;
                    case 'histogram':
                        deleteFunction = wiApiService.removeHistogram;
                        cleanUpFunction = function () {
                            wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER).removeTabWithModel(selectedNode);
                        }
                        break;
                    case 'comboview':
                        deleteFunction = wiApiService.removeCombinedBox;
                        cleanUpFunction = function () {
                            wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER).removeTabWithModel(selectedNode);
                        }
                        break;
                    default:
                        return;
                }
                if (isPermanently) {
                    wiApiService.deleteObject({ idObject: selectedNode.id, type: selectedNode.type }, function () {
                        $timeout(function () {
                            cleanUpFunction();
                            next();
                        });
                    })
                } else {
                    deleteFunction.call(wiApiService, selectedNode.id, function () {
                        $timeout(function () {
                            cleanUpFunction();
                            next();
                        });
                    });
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

exports.EmptyAllButtonClicked = function () {
    const wiApiService = this.wiApiService;
    const $timeout = this.$timeout;
    const wiComponentService = this.wiComponentService;
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    const dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
    console.log("===============", selectedNodes);
}

exports.RestoreAllButtonClicked = function () {
    const wiApiService = this.wiApiService;
    const $timeout = this.$timeout;
    const wiComponentService = this.wiComponentService;
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    const dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);

}

exports.EmptyButtonClicked = function () {
    const wiApiService = this.wiApiService;
    const $timeout = this.$timeout;
    const wiComponentService = this.wiComponentService;
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    const dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
    if (!Array.isArray(selectedNodes)) return;
    let selectedNodesName = selectedNodes[0].type + '(s):';
    selectedNodes.forEach(function (selectedNode) {
        selectedNodesName += ' ' + selectedNode.data.label;
    })
    let ModalService = this.ModalService;
    dialogUtils.confirmDialog(ModalService, "Delete confirm", `Are you sure to delete forever ${selectedNodesName} ?`, function (yes) {
        if (yes) {
            async.eachOf(selectedNodes, function (selectedNode, index, next) {
                let type = selectedNode.type.substring(0, selectedNode.type.indexOf('-'));
                wiApiService.deleteObject({type: type, idObject: selectedNode.id}, function (response) {
                    if (response == "WRONG_TYPE") {
                        next(response);
                    } else if (response == "CANT_DELETE") {
                        next(response);
                    } else {
                        $timeout(function () {
                            selectedNode.data.deleted = true;
                            next();
                        });
                    }
                });
            }, function (err) {
                if (err) {
                    dialogUtils.errorMessageDialog(ModalService, "Can't delete");
                }
                utils.refreshProjectState();
                wiComponentService.putComponent(wiComponentService.SELECTED_NODES, []);
            });
        }
    });
}

exports.RestoreButtonClicked = function () {
    const wiApiService = this.wiApiService;
    const $timeout = this.$timeout;
    const wiComponentService = this.wiComponentService;
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    const dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
    console.log(selectedNodes);
    if (!Array.isArray(selectedNodes)) return;
    let selectedNodesName = selectedNodes[0].type + '(s):';
    selectedNodes.forEach(function (selectedNode) {
        selectedNodesName += ' ' + selectedNode.data.label;
    })
    let ModalService = this.ModalService;
    dialogUtils.confirmDialog(ModalService, "Restore confirm", `Are you sure to restore ${selectedNodesName} ?`, function (yes) {
        if (yes) {
            async.eachOf(selectedNodes, function (selectedNode, index, next) {
                let type = selectedNode.type.substring(0, selectedNode.type.indexOf('-'));
                wiApiService.restoreObject({type: type, idObject: selectedNode.id}, function (response) {
                    if (response == "WRONG_TYPE") {
                        next(response);
                    } else if (response == "CANT_RESTORE") {
                        next(response);
                    } else {
                        $timeout(function () {
                            selectedNode.data.deleted = true;
                            next();
                        });
                    }
                });
            }, function (err) {
                if (err) {
                    dialogUtils.errorMessageDialog(ModalService, "Can't restore");
                }
                utils.refreshProjectState();
                wiComponentService.putComponent(wiComponentService.SELECTED_NODES, []);
            });
        }
    });
}
