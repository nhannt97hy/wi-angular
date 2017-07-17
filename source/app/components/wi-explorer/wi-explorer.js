const componentName = 'wiExplorer';
const moduleName = 'wi-explorer';

function Controller($scope, wiComponentService, WiWell, WiTreeConfig, $timeout) {
    let self = this;

    this.$onInit = function () {
        self.treeviewName = self.name + 'treeview';
        $scope.handlers = wiComponentService.getComponent(wiComponentService.GLOBAL_HANDLERS);
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);

        wiComponentService.on(wiComponentService.PROJECT_LOADED_EVENT, function () {
            let projectLoaded = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);
            utils.pushProjectToExplorer(self, projectLoaded, wiComponentService, WiTreeConfig, WiWell, $timeout);
        });

        wiComponentService.on(wiComponentService.PROJECT_UNLOADED_EVENT, function () {
            self.treeConfig = {};
        });

        if (self.name) wiComponentService.putComponent(self.name, self);
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
    }

    this.getItemTreeviewCtxMenu = function (configType, treeviewCtrl) {
        switch (configType) {
            case 'well':
                return [
                    {
                        name: "CreateNewWell",
                        label: "Create New Well",
                        icon: "well-new-16x16",
                        handler: function () {
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
                        }
                    }, {
                        name: "ImportMultiLAS",
                        label: "Import Multi LAS",
                        icon: "las-import-16x16",
                        handler: function () {
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
                    }, {
                        name: "NewDataset",
                        label: "New Dataset",
                        icon: "dataset-new-16x16",
                        handler: function () {
                        }
                    }, {
                        name: "ZoneManager",
                        label: "Zone Manager",
                        icon: "zone-management-16x16",
                        handler: function () {
                        }
                    }, {
                        name: "Rename",
                        label: "Rename",
                        icon: "annotation-16x16",
                        handler: function () {
                        }
                    }, {
                        name: "Delete",
                        label: "Delete",
                        icon: "delete-16x16",
                        handler: function () {
                        }
                    }, {
                        name: "Group",
                        label: "Group",
                        icon: "",
                        handler: function () {
                        }
                    }, {
                        separator: '1'
                    }
                ];
            case 'data':
                return [
                    {
                        name: "Rename",
                        label: "Rename",
                        icon: "annotation-16x16",
                        handler: function () {
                        }
                    }, {
                        name: "Delete",
                        label: "Delete",
                        icon: "delete-16x16"
                    }, {
                        separator: '1'
                    }
                ];
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
            case 'userdefined':
                return [
                    {
                        name: "NewZoneSet",
                        label: "New Zone Set",
                        icon: "",
                        handler: function () {
                        }
                    }, {
                        name: "ZoneManager",
                        label: "Zone Manager",
                        icon: "zone-management-16x16"
                    }, {
                        separator: '1'
                    }
                ];
            case 'logplot':
                return [
                    {
                        name: "NewLogPlot",
                        label: "New LogPlot ...",
                        icon: "logplot-new-16x16",
                        handler: function () {
                        },
                        childContextMenu: [
                            {
                                name: "BlankLogPlot",
                                label: "Blank Log Plot",
                                icon: "",
                                handler: function () {
                                }
                            }, {
                                name: "3TracksBlank",
                                label: "3 Tracks Blank",
                                icon: "",
                                handler: function () {
                                }
                            }, {
                                name: "OpenTemplate",
                                label: "Open Template",
                                icon: "",
                                handler: function () {
                                }
                            }, {
                                separator: '1'
                            }, {
                                name: "DensityNeutron",
                                label: "Density Neutron",
                                icon: "",
                                handler: function () {
                                }
                            }, {
                                name: "ResistivitySonic",
                                label: "Resistivity Sonic",
                                icon: "",
                                handler: function () {
                                }
                            }, {
                                name: "TripleCombo",
                                label: "Triple Combo",
                                icon: "",
                                handler: function () {
                                }
                            }, {
                                name: "InputCurves",
                                label: "Input Curves",
                                icon: "",
                                handler: function () {
                                }
                            }, {
                                name: "SynCurves",
                                label: "Syn. Curves",
                                icon: "",
                                handler: function () {
                                }
                            }, {
                                name: "LithoSynCurves",
                                label: "Litho + Syn. Curves",
                                icon: "",
                                handler: function () {
                                }
                            }, {
                                separator: '1'
                            }, {
                                name: "Result",
                                label: "Result",
                                icon: "",
                                handler: function () {
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
                        name: "NewCrossPlot",
                        label: "New CrossPlot",
                        icon: "crossplot-new-16x16",
                        handler: function () {
                        },
                        childContextMenu: [
                            {
                                name: "BlankCrossPlot",
                                label: "Blank Cross Plot",
                                icon: "crossplot-new-16x16",
                                handler: function () {
                                }
                            }, {
                                separator: '1'
                            }, {
                                name: "NeutronGamma",
                                label: "Neutron Gamma",
                                icon: "",
                                handler: function () {
                                }
                            }, {
                                name: "NeutronSonic",
                                label: "Neutron Sonic",
                                icon: "",
                                handler: function () {
                                }
                            }, {
                                name: "NeutronRt",
                                label: "Neutron Rt",
                                icon: "",
                                handler: function () {
                                }
                            }, {
                                name: "DensityGamma",
                                label: "Density Gamma",
                                icon: "",
                                handler: function () {
                                }
                            }, {
                                name: "DensityRt",
                                label: "Density Rt",
                                icon: "",
                                handler: function () {
                                }
                            }, {
                                name: "SonicDensity",
                                label: "Sonic Density",
                                icon: "",
                                handler: function () {
                                }
                            }, {
                                name: "SonicRt",
                                label: "Sonic Rt",
                                icon: "crossplot-new-16x16",
                                handler: function () {
                                }
                            }, {
                                name: "SonicPhiTotal",
                                label: "Sonic PHI_TOTAL",
                                icon: "",
                                handler: function () {
                                }
                            }, {
                                name: "SonicGamma",
                                label: "Sonic Gamma",
                                icon: "",
                                handler: function () {
                                }
                            }, {
                                name: "RtRxo",
                                label: "Rt_Rxo",
                                icon: "",
                                handler: function () {
                                }
                            }, {
                                name: "PickettPlot",
                                label: "Pickett Plot",
                                icon: "",
                                handler: function () {
                                }
                            }
                        ]
                    }, {
                        separator: '1'
                    }
                ];
            default:
                return [];
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

