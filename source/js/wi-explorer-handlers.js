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
    var rootConfig;
    var expaned;
    var child;
    const wiComponentService = this.wiComponentService;
    let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
    let rootTreeviewCtrl = wiComponentService.getComponent('WiExplorertreeview');
    if (!selectedNodes) {
        rootConfig = rootTreeviewCtrl.config;
        selectedNodes = rootConfig
    }
    expaned = false;
    for (child of selectedNodes) {
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
    var selectedNodesName;
    var message;
    const wiApiService = this.wiApiService;
    const $timeout = this.$timeout;
    const wiComponentService = this.wiComponentService;
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    const dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
    const removables = ['group', 'zoneset', 'zone', 'comboview'];
    const recyclables = ['well', 'dataset', 'curve', 'zoneset', 'zone', 'logplot', 'crossplot', 'histogram'];
    let isValid = false;
    if (removables.includes(selectedNodes[0].type) || recyclables.includes(selectedNodes[0].type)) isValid = true;
    if (!Array.isArray(selectedNodes) || !isValid) return;
    if (!recyclables.includes(selectedNodes[0].type)) isPermanently = false;
    selectedNodesName = '';
    selectedNodes.forEach(function (selectedNode, index) {
        selectedNodesName += index == selectedNodes.length - 1 ? selectedNode.data.label : selectedNode.data.label + ', ';
    })
    message = '';
    if (selectedNodes.length > 1) {
        message = isPermanently ? `Are you sure to delete following ${selectedNodes[0].type}s <b>permanently</b>?<br> ${selectedNodesName}`
            : `Are you sure to delete following ${selectedNodes[0].type}s?:<br> ${selectedNodesName}?`;
    } else {
        message = isPermanently ? `Are you sure to delete ${selectedNodes[0].type} <b>${selectedNodesName} permanently</b>?`
            : `Are you sure to delete ${selectedNodes[0].type} <b>${selectedNodesName}</b>?`;
    }
    dialogUtils.confirmDialog(this.ModalService, "Delete confirmation", message, function (yes) {
        if (yes) {
            async.eachOf(selectedNodes, function (selectedNode, index, next) {
                let deleteFunction, cleanUpFunction;
                switch (selectedNode.type) {
                    case 'group':
                        deleteFunction = wiApiService.removeGroup;
                        break;
                    case 'well':
                        deleteFunction = wiApiService.removeWell;
                        cleanUpFunction = function () {
                            let modelsWithTab = [];
                            // modelsWithTab = modelsWithTab.concat(selectedNode.children.find(child => child.type == 'logplots').children);
                            // modelsWithTab = modelsWithTab.concat(selectedNode.children.find(child => child.type == 'crossplots').children);
                            // modelsWithTab = modelsWithTab.concat(selectedNode.children.find(child => child.type == 'histograms').children);
                            // modelsWithTab = modelsWithTab.concat(selectedNode.children.find(child => child.type == 'comboviews').children);
                            // modelsWithTab.forEach(function (model) {
                            //     if (model) wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER).removeTabWithModel(model);
                            // });
                            wiComponentService.emit(wiComponentService.DELETE_MODEL, selectedNode);
                        }
                        break;
                    case 'dataset':
                        deleteFunction = wiApiService.removeDataset;
                        cleanUpFunction = function () {
                            wiComponentService.emit(wiComponentService.DELETE_MODEL, selectedNode);
                        }
                        break;
                    case 'curve':
                        deleteFunction = wiApiService.removeCurve;
                        cleanUpFunction = function () {
                            wiComponentService.emit(wiComponentService.DELETE_MODEL, selectedNode);
                        }
                        break;
                    case 'zoneset':
                        deleteFunction = wiApiService.removeZoneSet;
                        cleanUpFunction = function () {
                            wiComponentService.emit(wiComponentService.DELETE_MODEL, selectedNode);
                        }
                        break;
                    case 'zone':
                        deleteFunction = wiApiService.removeZone;
                        cleanUpFunction = function () {
                            wiComponentService.emit('zone-updated', selectedNode);
                            wiComponentService.emit(wiComponentService.DELETE_MODEL, selectedNode);
                        }
                        break;
                    case 'logplot':
                        deleteFunction = wiApiService.removeLogplot;
                        cleanUpFunction = function () {
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
                if (isPermanently && recyclables.includes(selectedNode.type)) {
                    wiApiService.deleteObject({idObject: selectedNode.id, type: selectedNode.type}, function () {
                        $timeout(function () {
                            cleanUpFunction && cleanUpFunction();
                            next();
                        });
                    })
                } else {
                    deleteFunction.call(wiApiService, selectedNode.id, function () {
                        $timeout(function () {
                            cleanUpFunction && cleanUpFunction();
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
        utils.projectOpen(projectData);
    });
}

exports.EmptyAllButtonClicked = function () {
    const wiApiService = this.wiApiService;
    const $timeout = this.$timeout;
    const wiComponentService = this.wiComponentService;
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    const dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    const selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
    if (!Array.isArray(selectedNodes) || !selectedNodes.length) return;
    const selectedNode = selectedNodes[0];
    const ModalService = this.ModalService;
    dialogUtils.confirmDialog(ModalService, "Delete confirm", `Are you sure to delete all children in ${selectedNode.data.label} permanently?`, function (yes) {
        if (!yes) return;
        async.eachOf(selectedNode.children, function (child, index, next) {
            const type = child.type.replace('-deleted-child', '');
            wiApiService.deleteObject({type: type, idObject: child.id}, function (response, err) {
                if (response == "WRONG_TYPE") {
                    next(response);
                } else if (response == "CANT_DELETE") {
                    next(response);
                } else {
                    setTimeout(function () {
                        child.data.deleted = true;
                        next(err, response);
                    });
                }
            });
        }, function (err) {
            if (err) {
                dialogUtils.errorMessageDialog(ModalService, "Can not delete some children");
            }
            utils.refreshProjectState();
        });
    });
}

exports.RestoreAllButtonClicked = function () {
    const wiApiService = this.wiApiService;
    const wiComponentService = this.wiComponentService;
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    const dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    const selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
    if (!Array.isArray(selectedNodes) || !selectedNodes.length) return;
    const selectedNode = selectedNodes[0];
    const ModalService = this.ModalService;
    dialogUtils.confirmDialog(ModalService, "Restore confirm", `Are you sure to restore all children in ${selectedNode.data.label}?`, function (yes) {
        if (!yes) return;
        async.eachOf(selectedNode.children, function (child, index, next) {
            const type = child.type.replace('-deleted-child', '');
            wiApiService.restoreObject({type: type, idObject: child.id}, function (response, err) {
                if (response == "WRONG_TYPE") {
                    next(response);
                } else if (response == "CANT_RESTORE") {
                    next(response);
                } else {
                    setTimeout(function () {
                        child.data.deleted = true;
                        next(err, response);
                    });
                }
            });
        }, function (err) {
            if (err) {
                dialogUtils.errorMessageDialog(ModalService, "Can not delete some children");
            }
            utils.refreshProjectState();
        });
    });
}

exports.EmptyButtonClicked = function () {
    var selectedNodesName;
    var ModalService;
    const wiApiService = this.wiApiService;
    const $timeout = this.$timeout;
    const wiComponentService = this.wiComponentService;
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    const dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
    if (!Array.isArray(selectedNodes)) return;
    selectedNodesName = selectedNodes[0].type + '(s):';
    selectedNodes.forEach(function (selectedNode) {
        selectedNodesName += ' ' + selectedNode.data.label;
    })
    ModalService = this.ModalService;
    dialogUtils.confirmDialog(ModalService, "Delete confirm", `Are you sure to delete ${selectedNodesName} permanently ?`, function (yes) {
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
    var selectedNodesName;
    var ModalService;
    const wiApiService = this.wiApiService;
    const $timeout = this.$timeout;
    const wiComponentService = this.wiComponentService;
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    const dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
    console.log(selectedNodes);
    if (!Array.isArray(selectedNodes)) return;
    selectedNodesName = selectedNodes[0].type + '(s):<br>';
    selectedNodes.forEach(function (selectedNode, index) {
        selectedNodesName += index == selectedNodes.length - 1 ? selectedNode.data.label : selectedNode.data.label + ', ';
    })
    ModalService = this.ModalService;
    dialogUtils.confirmDialog(ModalService, "Restore confirm", `Are you sure to restore ${selectedNodesName}?`, function (yes) {
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
            });
        }
    });
}

exports.DuplicateButtonClicked = function (type) {
    var selectedNodesName;
    var ModalService;
    const wiApiService = this.wiApiService;
    const $timeout = this.$timeout;
    const wiComponentService = this.wiComponentService;
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    const dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
    if (!Array.isArray(selectedNodes)) return;
    selectedNodesName = selectedNodes[0].type + '(s):<br>';
    selectedNodes.forEach(function (selectedNode, index) {
        selectedNodesName += index == selectedNodes.length - 1 ? selectedNode.data.label : selectedNode.data.label + ', ';
    })
    ModalService = this.ModalService;
    dialogUtils.confirmDialog(ModalService, "Duplicate Confirm", `Are you sure to duplicate ${selectedNodesName}?`, function (yes) {
        if (yes) {
            async.eachOf(selectedNodes, function (selectedNode, index, next) {
                if (type === 'plot') {
                    wiApiService.duplicateLogplot(selectedNode.properties.idPlot, selectedNode.properties.idWell, function (response) {
                        $timeout(function () {
                            utils.refreshProjectState();
                            next();
                        });
                    });
                } else if (type === 'crossplot') {
                    wiApiService.duplicateCrossPlot(selectedNode.properties.idCrossPlot, selectedNode.properties.idWell, function (response) {
                        $timeout(function () {
                            utils.refreshProjectState();
                            next();
                        });
                    });
                } else if (type === 'histogram') {
                    wiApiService.duplicateHistogram(selectedNode.properties.idHistogram, selectedNode.properties.idWell, function (response) {
                        $timeout(function () {
                            utils.refreshProjectState();
                            next();
                        });
                    });
                } else if (type === 'dataset') {
                    wiApiService.duplicateDataset(selectedNode.properties.idDataset, function (response) {
                        $timeout(function () {
                            utils.refreshProjectState();
                            next();
                        });
                    });
                } else if (type === 'curve') {
                    wiApiService.duplicateCurve(selectedNode.properties.idCurve, function (response) {
                        $timeout(function () {
                            utils.refreshProjectState();
                            next();
                        });
                    });
                } else if (type === 'zoneset') {
                    wiApiService.duplicateZoneset(selectedNode.properties.idZoneSet, function (response) {
                        $timeout(function () {
                            utils.refreshProjectState();
                            next();
                        });
                    });
                } else if (type === 'well') {
                    wiApiService.duplicateWell(selectedNode.properties.idWell, function (response) {
                        $timeout(function () {
                            utils.refreshProjectState();
                            next();
                        });
                    });
                }
            }, function (err) {
                if (err) {
                    dialogUtils.errorMessageDialog(ModalService, "Can't duplicate");
                }
                utils.refreshProjectState();
            });
        }
    });

};
exports.createZoneSet = function () {
    const wiApiService = this.wiApiService;
    const wiComponentService = this.wiComponentService;
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    const dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let selectedNode = utils.getSelectedNode();
    let idWell;
    if (selectedNode && selectedNode.type === 'user_defined') {
        idWell = selectedNode.properties.idWell;
    }
    dialogUtils.newZoneSetDialog(this.ModalService, function (data) {
        console.log(data);
        if (data.template.idZoneTemplate) {
            wiApiService.createZoneSet({
                name: data.name,
                template: data.template.template,
                idWell: idWell
            }, function (res) {
                utils.refreshProjectState();
            });
        } else {
            wiApiService.createZoneSet({name: data.name, idWell: idWell}, function (res) {
                utils.refreshProjectState();
            });
        }
    });
};
exports.createMarkerSet = function() {
    const wiApiService = this.wiApiService;
    const wiComponentService = this.wiComponentService;
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    const dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let selectedNode = utils.getSelectedNode();
    let idWell;
    if (selectedNode && selectedNode.type === 'user_defined') {
        idWell = selectedNode.properties.idWell;
    }
    dialogUtils.newMarkerSetDialog(this.ModalService, function (data) {
        console.log("new marker set", data);
        if (data.template.idMarkerTemplate) {
            wiApiService.createMarkerSet({
                name: data.name,
                template: data.template.template,
                idWell: idWell
            }, function (res) {
                utils.refreshProjectState();
            });
        } else {
            wiApiService.createMarkerSet({name: data.name, idWell: idWell}, function (res) {
                utils.refreshProjectState();
            });
        }

    });
};
exports.ConvertButtonClicked = function () {
    let self = this;
    const wiApiService = this.wiApiService;
    const wiComponentService = this.wiComponentService;
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
    const dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let curves = angular.copy(selectedNodes);
    async.each(curves, function (curve, next) {
        if (!curve.lineProperties) {
            curve.units = [];
            next();
        } else {
            wiApiService.getListUnit({idFamily: curve.properties.idFamily}, function (res) {
                curve.convertUnit = res.find(u => u.name === curve.properties.unit);
                curve.units = res;
                next();
            });
        }
    }, function () {
        dialogUtils.convertCurveUnit(self.ModalService, curves, function (_curves) {
            utils.refreshProjectState().then(() => {
                wiComponentService.emit('update-properties', utils.getSelectedNode());
                _curves.forEach((curve) => {
                    wiComponentService.emit(wiComponentService.MODIFIED_CURVE_DATA, {idCurve: curve.id});
                })

            });
        });
    });
};
