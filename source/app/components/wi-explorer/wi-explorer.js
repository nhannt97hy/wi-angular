const componentName = 'wiExplorer';
const moduleName = 'wi-explorer';

function Controller($scope, wiComponentService, WiWell, WiTreeConfig, $timeout) {
    let self = this;

    this.$onInit = function () {
        self.treeviewName = self.name + 'treeview';
        $scope.handlers = wiComponentService.getComponent('GLOBAL_HANDLERS');
        let utils = wiComponentService.getComponent('UTILS');
        wiComponentService.on('project-loaded-event', function (project) {
            utils.pushProjectToExplorer(self, project, wiComponentService, WiTreeConfig, WiWell, $timeout);
        });
        wiComponentService.on('project-unloaded-event', function () {
            self.treeConfig = {};
        });
        if (self.name) wiComponentService.putComponent(self.name, self);
    };

    this.getDefaultContextMenu = function ($index) {
        return [
            {
                name: "Expand",
                label: "Expand",
                icon: "expand-16x16",
                handler: function () {
                    self.expand($index);
                }
            }, {
                name: "Collapse",
                label: "Collapse",
                icon: "collapse-16x16",
                handler: function () {
                    self.collapse($index);
                }
            }, {
                name: "ExpandAll",
                label: "Expand All",
                icon: "expand-all-16x16",
                handler: function () {
                    self.expandAll();
                }
            }, {
                name: "CollapseAll",
                label: "Collapse All",
                icon: "collapse-all-16x16",
                handler: function () {
                    self.collapseAll();
                }
            }
        ]
    }

    this.getItemContextMenu = function (configType) {
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
                        label: "New LogPlot",
                        icon: "logplot-new-16x16",
                        handler: function () {
                        }
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
                        }
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

