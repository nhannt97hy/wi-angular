const componentName = 'wiExplorer';
const moduleName = 'wi-explorer';

function Controller($scope, wiComponentService, wiApiService, ModalService, WiWell, WiTreeConfig, $timeout) {
    let self = this;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    const globalHandlers = wiComponentService.getComponent(wiComponentService.GLOBAL_HANDLERS);
    this.$onInit = function () {
        self.treeviewName = self.name + 'treeview';
        $scope.handlers = wiComponentService.getComponent(wiComponentService.WI_EXPLORER_HANDLERS);
        self.handlers = $scope.handlers;

        wiComponentService.on(wiComponentService.PROJECT_LOADED_EVENT, function () {
            let projectLoaded = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);
            let projectModel = utils.projectToTreeConfig(projectLoaded);
            let dustbinModel = utils.dustbinToTreeConfig();
            self.treeConfig = [projectModel, dustbinModel];
            utils.putListFamily();
        });

        wiComponentService.on(wiComponentService.PROJECT_UNLOADED_EVENT, function () {
            self.treeConfig = {};
            wiComponentService.setState(wiComponentService.ITEM_ACTIVE_STATE, '');
        });

        wiComponentService.on(wiComponentService.PROJECT_REFRESH_EVENT, function () {
            let backupConfig = [self.treeConfig[0]];
            let projectRefresh = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);
            let ScrollTmp = window.localStorage.getItem('scrollTmp');
            self.treeConfig[0] = utils.projectToTreeConfig(projectRefresh);
            $timeout(function() {
                self.backupConfig(backupConfig, [self.treeConfig[0]]);
            });
            $timeout(function(){
                document.getElementById('treeContent').scrollTo(0,ScrollTmp);
            },100);
        });
        wiComponentService.on(wiComponentService.DUSTBIN_REFRESH_EVENT, function () {
            wiApiService.getDustbin(self.treeConfig[0].id, function (dustbin) {
                self.treeConfig[1] = utils.updateDustbinConfig(dustbin);
                let backupConfig = [self.treeConfig[1]];
                let ScrollTmp = window.localStorage.getItem('scrollTmp');
                let dustbinModel = wiComponentService.getComponent(wiComponentService.DUSTBIN);
                self.treeConfig[1] = dustbinModel;
                $timeout(function() {
                    self.backupConfig(backupConfig, [self.treeConfig[1]]);
                });
                $timeout(function(){
                    document.getElementById('treeContent').scrollTo(0,ScrollTmp);
                },100);
            });
        });

        WICS = wiComponentService;
        WIEXPLORER = self;
        if (self.name) wiComponentService.putComponent(self.name, self);
    };

    this.backupConfig = function (previousConfig, currConfig) {
        for (let preItem of previousConfig) {
            for (let item of currConfig) {
                if (preItem.type === item.type && preItem.id === item.id) {
                    self.backupItemState(preItem, item);

                    if (Array.isArray(preItem.children) && Array.isArray(item.children)) {
                        self.backupConfig(preItem.children, item.children);
                    }
                }
            }
        }
    };

    this.backupItemState = function(preItem, currItem) {
        if (!preItem || !currItem) return;
        if (preItem.data.deleted) currItem.data.deleted = preItem.data.deleted;
        if (preItem.data.selected) currItem.data.selected = preItem.data.selected;
        if (preItem.data.opened) currItem.data.opened = preItem.data.opened;
        if (preItem.data.childExpanded) currItem.data.childExpanded = preItem.data.childExpanded;
    };

    this.getDefaultTreeviewCtxMenu = function ($index, treeviewCtrl) {
        return [
            {
                name: "Expand",
                label: "Expand",
                icon: "expand-16x16",
                handler: function () {
                    treeviewCtrl.expand($index);
                }
            }, {
                name: "Collapse",
                label: "Collapse",
                icon: "collapse-16x16",
                handler: function () {
                    treeviewCtrl.collapse($index);
                }
            }, {
                name: "ExpandAll",
                label: "Expand All",
                icon: "expand-all-16x16",
                handler: function () {
                    let rootConfig = wiComponentService.getComponent(self.treeviewName).config;
                    treeviewCtrl.expandAll(rootConfig);
                }
            }, {
                name: "CollapseAll",
                label: "Collapse All",
                icon: "collapse-all-16x16",
                handler: function () {
                    let rootConfig = wiComponentService.getComponent(self.treeviewName).config;
                    treeviewCtrl.collapseAll(rootConfig);
                }
            }
        ]
    };


    this.getItemTreeviewCtxMenu = function (nodeType, treeviewCtrl) {
        const defaultWellCtxMenu = [
            {
                name: "CreateNewWell",
                label: "Create New Well",
                icon: "well-new-16x16",
                handler: function () {
                    let handlers = wiComponentService.getComponent(wiComponentService.GLOBAL_HANDLERS);
                    handlers.AddNewButtonClicked();
                    /*
                    let utils = wiComponentService.getComponent(wiComponentService.UTILS);

                    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);

                    DialogUtils.addNewDialog(ModalService, function (newWell) {
                        console.log(newWell);
                        if (newWell) utils.updateWellProject(wiComponentService, newWell);
                    });*/
                }
            }, {
                name: "ImportASCII",
                label: "Import ASCII",
                icon: "ascii-import-16x16",
                handler: function () {
                }
            }, {
                name: "ImportMultiASCII",
                label: "Import Multi ASCII",
                icon: "ascii-import-16x16",
                handler: function () {
                }
            }, {
                name: "ImportLAS",
                label: "Import LAS",
                icon: "las-import-16x16",
                handler: function () {
                    self.handlers.ImportLASButtonClicked();
                }
            }, {
                name: "ImportMultiLAS",
                label: "Import Multi LAS",
                icon: "las-import-16x16",
                handler: function () {
                    self.handlers.ImportMultiLASButtonClicked();
                }
            }, {
                name: "ImportDLIS",
                label: "Import DLIS",
                icon: "",
                handler: function () {
                }
            }, {
                name: "IntervalCoreLoader",
                label: "Interval/Core Loader",
                icon: "load-16x16",
                handler: function () {
                }
            }, {
                name: "MultiwellCoreLoader",
                label: "Multi-well Core Loader",
                icon: "load-16x16",
                handler: function () {
                }
            }, {
                name: "ImportWellHeader",
                label: "Import Well Header",
                icon: "las-import-16x16",
                handler: function () {
                }
            }, {
                name: "ImportWellTop",
                label: "Import Well Top",
                icon: "las-import-16x16",
                handler: function () {
                }
            }
        ];
        let copyingCurve = wiComponentService.getComponent(wiComponentService.COPYING_CURVE);
        let cuttingCurve = wiComponentService.getComponent(wiComponentService.CUTTING_CURVE);
        switch (nodeType) {
            case 'project':
            case 'wells':
                return defaultWellCtxMenu.concat([
                    {
                        name: "GroupManager",
                        label: "Group Manager",
                        icon: "",
                        handler: function () {
                        }
                    }, {
                        separator: '1'
                    }, {
                        name: "Sort",
                        label: "Sort ...",
                        icon: "",
                        handler: function () {
                        },
                        childContextMenu: [
                            {
                                name: "SortNone",
                                label: "None",
                                icon: "",
                                handler: function() {

                                }
                            }, {
                                name: "SortAZ",
                                label: "A-Z",
                                icon: "arrow-down-16x16",
                                handler: function() {

                                }
                            }, {
                                name: "SortZA",
                                label: "Z-A",
                                icon: "arrow-up-16x16",
                                handler: function() {

                                }
                            }
                        ]
                    }, {
                        separator: '1'
                    }
                ]);
            case 'group':
                return [
                    {
                        label: "Group Manager",
                        icon: "dataset-new-16x16",
                        handler: function () {
                            DialogUtils.groupManagerDialog(function () {
                                utils.refreshProjectState();
                            })
                        }
                    }
                ];
            case 'well':
                return defaultWellCtxMenu.concat([
                    {
                        name: "NewDataset",
                        label: "New Dataset",
                        icon: "dataset-new-16x16",
                        handler: function () {
                            utils.createDataset();
                        }
                    }, {
                        name: "ZoneManager",
                        label: "Zone Manager",
                        icon: "zone-management-16x16",
                        handler: function () {
                            let wellModel = utils.getSelectedNode();
                            utils.openZonemanager(wellModel);
                        }
                    }, {
                        name: "Rename",
                        label: "Rename",
                        icon: "annotation-16x16",
                        handler: function () {
                            utils.renameWell();
                        }
                    }, {
                        name: "Delete",
                        label: "Delete",
                        icon: "delete-16x16",
                        handler: function () {
                            self.handlers.DeleteItemButtonClicked();
                        }
                    }, {
                        name: "Group",
                        label: "Group",
                        icon: "",
                        handler: function () {
                            DialogUtils.groupManagerDialog(function () {
                                utils.refreshProjectState();
                            })
                        }
                    }, {
                        separator: '1'
                    }
                ]);
            case 'data':
            case 'dataset':
                let datasetCtx = [];
                console.log(copyingCurve, cuttingCurve);
                if (copyingCurve || cuttingCurve) {
                    datasetCtx = [
                        {
                            name: "Paste",
                            label: "Paste",
                            icon: "apply-16x16",
                            handler: function() {
                                utils.pasteCurve();
                            }
                        }
                    ];
                }
                return datasetCtx.concat([
                    {
                        name: "Rename",
                        label: "Rename",
                        icon: "annotation-16x16",
                        handler: function () {
                            utils.renameDataset();
                        }
                    }, {
                        name: "Delete",
                        label: "Delete",
                        icon: "delete-16x16",
                        handler: function () {
                            self.handlers.DeleteItemButtonClicked();
                        }
                    }, {
                        separator: '1'
                    }
                ]);
            case 'curve':
                let curveCtx = [];
                if (copyingCurve || cuttingCurve) {
                    curveCtx = [
                        {
                            name: "Paste",
                            label: "Paste",
                            icon: "apply-16x16",
                            handler: function() {
                                utils.pasteCurve();
                            }
                        }
                    ];
                }
                return curveCtx.concat([
                    {
                        name: "Export",
                        label: "Export",
                        icon: "save-16x16",
                        handler: function() {
                            utils.exportCurve();
                        }
                    }, {
                        name: "Copy",
                        label: "Copy",
                        icon: "copy-16x16",
                        handler: function() {
                            utils.copyCurve();
                        }
                    }, {
                        name: "Cut",
                        label: "Cut",
                        icon: "zone-split-16x16",
                        handler: function() {
                            utils.cutCurve();
                        }
                    }, {
                        name: "Rename",
                        label: "Rename",
                        icon: "annotation-16x16-edit",
                        handler: function() {
                            utils.renameCurve();
                        }
                    }, {
                        name: "Delete",
                        label: "Delete",
                        icon: "delete-16x16",
                        handler: function() {
                            self.handlers.DeleteItemButtonClicked();
                        }
                    }, {
                        separator: "1"
                    }
                ]);
            case 'intepretationmodel':
                return [
                    {
                        name: "NewInterpretationModel",
                        label: "New Interpretation Model",
                        icon: "workflow-16x16",
                        handler: function () {
                        }
                    }, {
                        separator: '1'
                    }
                ];
            case 'zonesets':
                return [
                    {
                        name: "NewZoneSet",
                        label: "New Zone Set",
                        icon: "mineral-zone-add-16x16",
                        handler: function () {
                            utils.createZoneSet();
                        }
                    }, {
                        name: "ZoneManager",
                        label: "Zone Manager",
                        icon: "zone-management-16x16",
                        handler: function () {
                            let zonesetsModel = utils.getSelectedNode();
                            utils.openZonemanager(zonesetsModel);
                        }
                    }, {
                        separator: '1'
                    }
                ];
            case 'zoneset':
                return [
                    {
                        name: "Rename",
                        label: "Rename",
                        icon: "annotation-16x16-edit",
                        handler: function() {
                            let zonesetsModel = utils.getSelectedNode();
                            console.log(zonesetsModel);
                            utils.renameZoneSet(zonesetsModel);
                        }
                    }, {
                        name: "Delete",
                        label: "Delete",
                        icon: "delete-16x16",
                        handler: function() {
                            self.handlers.DeleteItemButtonClicked();
                        }
                    }, {
                        name: "ZoneManager",
                        label: "Zone Manager",
                        icon: "zone-management-16x16",
                        handler: function () {
                            let zonesetModel = utils.getSelectedNode();
                            utils.openZonemanager(zonesetModel);
                        }
                    }, {
                        separator: '1'
                    }
                ]
            case 'zone':
                return [
                    {
                        name: "Delete",
                        label: "Delete",
                        icon: "delete-16x16",
                        handler: function() {
                            self.handlers.DeleteItemButtonClicked();
                        }
                    }, {
                        name: "ZoneManager",
                        label: "Zone Manager",
                        icon: "zone-management-16x16",
                        handler: function () {
                            let zoneModel = utils.getSelectedNode();
                            utils.openZonemanager(zoneModel);
                        }
                    }, {
                        separator: '1'
                    }
                ]
            case 'logplots':
                return [
                    {
                        name: "NewLogPlot",
                        label: "New LogPlot",
                        icon: "logplot-new-16x16",
                        class: 'has-more',
                        handler: function () {
                        },
                        childContextMenu: [
                            {
                                name: "BlankLogPlot",
                                label: "Blank Log Plot",
                                icon: "",
                                handler: function () {
                                    globalHandlers.BlankLogplotButtonClicked();
                                }
                            }, {
                                name: "3TracksBlank",
                                label: "3 Tracks Blank",
                                icon: "",
                                handler: function () {
                                    globalHandlers.TriTracksBlankButtonClicked();
                                }
                            }, {
                                name: "OpenTemplate",
                                label: "Open Template",
                                icon: "",
                                handler: function () {
                                    self.handlers.OpenTemplateButtonClicked();
                                }
                            }, {
                                separator: '1'
                            }, {
                                name: "DensityNeutron",
                                label: "Density Neutron",
                                icon: "",
                                handler: function () {
                                    globalHandlers.DensityNeutronButtonClicked();
                                }
                            }, {
                                name: "ResistivitySonic",
                                label: "Resistivity Sonic",
                                icon: "",
                                handler: function () {
                                    globalHandlers.ResistivitySonicButtonClicked();
                                }
                            }, {
                                name: "TripleCombo",
                                label: "Triple Combo",
                                icon: "",
                                handler: function () {
                                    globalHandlers.TrippleComboButtonClicked();
                                }
                            }
                            // , {
                            //     name: "InputCurves",
                            //     label: "Input Curves",
                            //     icon: "",
                            //     handler: function () {
                            //         globalHandlers.InputCurveButtonClicked();
                            //     }
                            // }, {
                            //     name: "SynCurves",
                            //     label: "Syn. Curves",
                            //     icon: "",
                            //     handler: function () {
                            //         globalHandlers.Syn_CurveButtonClicked();
                            //     }
                            // }, {
                            //     name: "LithoSynCurves",
                            //     label: "Litho + Syn. Curves",
                            //     icon: "",
                            //     handler: function () {
                            //         globalHandlers.LithoPlusSyn_CurveButtonClicked();
                            //     }
                            // }, {
                            //     separator: '1'
                            // }, {
                            //     name: "Result",
                            //     label: "Result",
                            //     icon: "",
                            //     handler: function () {
                            //         globalHandlers.ResultButtonClicked();
                            //     }
                            // }
                        ]
                    }, {
                        separator: '1'
                    }
                ];
            case 'logplot':
                return [
                    {
                        name: "Open",
                        label: "Open",
                        icon: "play-16x16",
                        handler: function() {
                            let logplotModel = utils.getSelectedNode();
                            utils.openLogplotTab(wiComponentService, logplotModel);
                        }
                    }, {
                        name: "Rename",
                        label: "Rename",
                        icon: "annotation-16x16-edit",
                        handler: function() {

                        }
                    }, {
                        name: "Delete",
                        label: "Delete",
                        icon: "delete-16x16",
                        handler: function() {
                            self.handlers.DeleteItemButtonClicked();
                        }
                    }, {
                        separator: '1'
                    }
                ]
            case 'crossplots':
                return [
                    {
                        name: "NewCrossPlot ...",
                        label: "New CrossPlot",
                        icon: "crossplot-new-16x16",
                        class: 'has-more',
                        handler: function () {
                        },
                        childContextMenu: [
                            {
                                name: "BlankCrossPlot",
                                label: "Blank Cross Plot",
                                icon: "crossplot-new-16x16",
                                handler: function () {
                                    globalHandlers.BlankCrossPlotButtonClicked();
                                }
                            }, {
                                separator: '1'
                            }, {
                                name: "NeutronGamma",
                                label: "Neutron Gamma",
                                icon: "",
                                handler: function () {
                                    globalHandlers.NeutronGammaButtonClicked();
                                }
                            },{
                                name: "NeutronDensity",
                                label: "Neutron Density",
                                icon: "",
                                handler: function () {
                                    globalHandlers.NeutronDensityButtonClicked();
                                }
                            }, {
                                name: "NeutronSonic",
                                label: "Neutron Sonic",
                                icon: "",
                                handler: function () {
                                    globalHandlers.NeuTronSonicButtonClicked();
                                }
                            }, {
                                name: "NeutronRt",
                                label: "Neutron Rt",
                                icon: "",
                                handler: function () {
                                    globalHandlers.NeuTronRtButtonClicked();
                                }
                            }, {
                                name: "DensityGamma",
                                label: "Density Gamma",
                                icon: "",
                                handler: function () {
                                    globalHandlers.DensityGammaButtonClicked();
                                }
                            }, {
                                name: "DensityRt",
                                label: "Density Rt",
                                icon: "",
                                handler: function () {
                                    globalHandlers.DensityRtButtonClicked();
                                }
                            }, {
                                name: "SonicDensity",
                                label: "Sonic Density",
                                icon: "",
                                handler: function () {
                                    globalHandlers.SonicDensityButtonClicked();
                                }
                            }, {
                                name: "SonicRt",
                                label: "Sonic Rt",
                                icon: "crossplot-new-16x16",
                                handler: function () {
                                    globalHandlers.SonicRtButtonClicked();
                                }
                            }, {
                                name: "SonicPhiTotal",
                                label: "Sonic PHI_TOTAL",
                                icon: "",
                                handler: function () {
                                    globalHandlers.SonicPHI_TOTALButtonClicked();
                                }
                            }, {
                                name: "SonicGamma",
                                label: "Sonic Gamma",
                                icon: "",
                                handler: function () {
                                    globalHandlers.SonicGammaButtonClicked();
                                }
                            }, {
                                name: "RtRxo",
                                label: "Rt_Rxo",
                                icon: "",
                                handler: function () {
                                    globalHandlers.RtRx0ButtonClicked();
                                }
                            }, {
                                name: "PickettPlot",
                                label: "Pickett Plot",
                                icon: "",
                                handler: function () {
                                    globalHandlers.PickettButtonClicked();
                                }
                            }
                        ]
                    }, {
                        separator: '1'
                    }
                ];
            case 'crossplot':
                return [
                    {
                        name: "Open",
                        label: "Open",
                        icon: "play-16x16",
                        handler: function() {
                            let crossplotModel = utils.getSelectedNode();
                            utils.openCrossplotTab(crossplotModel);
                        }
                    }, {
                        name: "Rename",
                        label: "Rename",
                        icon: "annotation-16x16-edit",
                        handler: function() {

                        }
                    }, {
                        name: "Delete",
                        label: "Delete",
                        icon: "delete-16x16",
                        handler: function() {
                            self.handlers.DeleteItemButtonClicked();
                        }
                    }, {
                        separator: '1'
                    }
                ];
            case 'histograms':
                return [
                    {
                        name: "NewHistogram ...",
                        label: "New Histogram",
                        icon: "histogram-new-16x16",
                        class: "has-more",
                        handler: function () {

                        },
                        childContextMenu: [
                            {
                                name: "BlankHistogram",
                                label: "Blank Histogram",
                                icon: "histogram-blank-16x16",
                                handler: function () {
                                    globalHandlers.BlankHistogramButtonClicked();
                                }
                            },
                            {
                                separator: "1"
                            },
                            {
                                name: "GRHistogram",
                                label: "GR Histogram",
                                icon: "",
                                handler: function () {
                                    globalHandlers.GammaRayButtonClicked();
                                }
                            },
                            {
                                name: "DTHistogram",
                                label: "DT Histogram",
                                icon: "",
                                handler: function () {
                                    globalHandlers.DensityButtonClicked();
                                }
                            },
                            {
                                name: "NPHIHistogram",
                                label: "NPHI Histogram",
                                icon: "",
                                handler: function () {
                                    globalHandlers.NeutronButtonClicked();
                                }
                            },
                            {
                                name: "RHOBHistogram",
                                label: "RHOB Histogram",
                                icon: "",
                                handler: function () {
                                    globalHandlers.SonicButtonClicked();
                                }
                            },
                            {
                                name: "LLDHistogram",
                                label: "LLD Histogram",
                                icon: "",
                                handler: function () {
                                    globalHandlers.DeepResistivityButtonClicked();
                                }
                            },
                            {
                                name: "PHI_TOTALHistogram",
                                label: "PHI_TOTAL Histogram",
                                icon: "",
                                handler: function () {
                                    globalHandlers.PHI_TOTALButtonClicked();
                                }
                            },
                            {
                                name: "MSLFHistogram",
                                label: "MSLF Histogram",
                                icon: "",
                                handler: function () {
                                    globalHandlers.MSFLHistogramButtonClicked();
                                }
                            }
                        ]
                    },
                    {
                        separator: "1"
                    }
                ]
            case 'histogram':
                return [
                    {
                        name: "Open",
                        label: "Open",
                        icon: "play-16x16",
                        handler: function() {
                            let histogramModel = utils.getSelectedNode();
                            utils.openHistogramTab(histogramModel);
                        }
                    }, {
                        name: "Rename",
                        label: "Rename",
                        icon: "annotation-16x16-edit",
                        handler: function() {

                        }
                    }, {
                        name: "Delete",
                        label: "Delete",
                        icon: "delete-16x16",
                        handler: function() {
                            self.handlers.DeleteItemButtonClicked();
                        }
                    }, {
                        separator: '1'
                    }
                ];
            case String(nodeType.match(/^.*-deleted/)):
                return [
                    {
                        name: "Empty All",
                        label: "Empty All",
                        icon: "play-16x16",
                        handler: function() {

                        }
                    },{
                        name: "Restore All",
                        label: "Restore All",
                        icon: "play-16x16",
                        handler: function() {

                        }
                    },{
                        separator: '1'
                    }
                ];
            default:
                return [];
        }
    }

    this.unselectAllNodes = function () {
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        self.treeConfig.forEach(function(item) {
            utils.visit(item, function(node) {
                if(node.data) node.data.selected = false;
            });
        });
        wiComponentService.putComponent(wiComponentService.SELECTED_NODES, []);
    }

    // Select tree node and update wi-properties
    this.selectHandler = function(currentNode) {
        if( currentNode.data ) {
            currentNode.data.selected = true;
            let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
            if (!Array.isArray(selectedNodes)) selectedNodes = [];
            if (!selectedNodes.includes(currentNode)) {
                selectedNodes.push(currentNode);
            }
            wiComponentService.putComponent(wiComponentService.SELECTED_NODES, selectedNodes);
        }
        if (currentNode.type == 'dustbin' && !self.treeConfig[1].children.length) {
            wiComponentService.emit(wiComponentService.DUSTBIN_REFRESH_EVENT);
        }
    }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-explorer.html',
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        name: '@',
        treeConfig: '<'
    }
});

exports.name = moduleName;
