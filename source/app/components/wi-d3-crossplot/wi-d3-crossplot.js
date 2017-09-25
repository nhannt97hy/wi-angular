const componentName = 'wiD3Crossplot';
const moduleName = 'wi-d3-crossplot';

function Controller($scope, wiComponentService, $timeout, ModalService, wiApiService) {
    let self = this;
    let graph = wiComponentService.getComponent('GRAPH');
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    this.viCrossplot = {};
    this.isShowWiZone = true;
    this.isShowReferenceWindow = false;

    this.$onInit = function () {
        self.crossplotAreaId = self.name.replace('D3Area', '');
        self.crossplotModel = utils.getModel('crossplot', self.wiCrossplotCtrl.id);
        self.pointSet = self.crossplotModel.properties.pointSet;
        // self.wellProperties = utils.getModel('well', self.crossplotModel.properties.idWell).properties;
        console.log("crossplot", self.crossplotModel, self.wellProperties);
        if (self.name) {
            wiComponentService.putComponent(self.name, self);
            wiComponentService.emit(self.name);
        }
    };
    this.onReady = function () {
        self.linkModels();
        
        // self.createVisualizeCrossplot(self.curveXModel, self.curveYModel);
    }
    this.CloseZone = function () {
        self.isShowWiZone = false;
        utils.triggerWindowResize();
    }
    this.getZoneName = function () {
        return self.name + "Zone";
    }
    this.linkModels = function () {
        self.zoneArr = null;
        if (self.crossplotModel.properties.idZoneSet) {
            self.zoneSetModel = utils.getModel('zoneset', self.crossplotModel.properties.idZoneSet);
            self.zoneArr = self.zoneSetModel.children;
            self.zoneArr.forEach(function (zone) {
                zone.handler = function () {}
            })

            self.crossplotModel.properties.crossplotTitle = getHistogramTitle();
            self.crossplotModel.properties.xLabel = getXLabel();
        }
    }
    this.CloseReferenceWindow = function () {
        self.isShowReferenceWindow = false;
        utils.triggerWindowResize();
    }
    this.propertiesDialog = function () {
        if (!self.viCrossplot) {
            self.createVisualizeCrossplot(null, null, {
                name: self.crossplotModel.properties.name,
                idPointSet: self.pointSet.idPointSet,
                idCrossPlot: self.crossplotModel.properties.idCrossPlot,
                idWell: self.crossplotModel.properties.idWell,
                pointSet: self.pointSet
            })
        }
        wiApiService.getCrossplot(self.crossplotModel.properties.idCrossplot, function (crossplot) {
            self.pointSet = crossplot.pointsets[0];
            if(Object.keys(self.viCrossplot).length !== 0){
                DialogUtils.crossplotFormatDialog(ModalService, self.wiCrossplotCtrl, function (ret) {
                    console.log(ret);
                })
            }
        });
    }
    let commonCtxMenu = [
        {
            name: "Refresh",
            label: "Refresh",
            icon: "reload-16x16",
            handler: function () {
            }
        }, {
            name: "Properties",
            label: "Properties",
            icon: "properties2-16x16",
            handler: function () {
                self.propertiesDialog();
            }
        }, {
            name: "ShowOverlay",
            label: "Show Overlay",
            icon: "",
            handler: function () {

            }
        }, {
            name: "ShowReferenceZone",
            label: "Show Reference Zone",
            isCheckType: "true",
            checked: self.isShowWiZone,
            handler: function (index) {
                self.isShowWiZone = !self.isShowWiZone;
                utils.triggerWindowResize();
                self.contextMenu[index].checked = self.isShowWiZone;
            }
        }, {
            name: "ShowReferenceWindow",
            label: "Show Reference Window",
            isCheckType: "true",
            checked: self.isShowReferenceWindow,
            handler: function (index) {
                self.isShowReferenceWindow = !self.isShowReferenceWindow
                self.contextMenu[index].checked = self.isShowReferenceWindow;
                utils.triggerWindowResize();
            }
        }, {
            name: "ShowTooltip",
            label: "Show Tooltip",
            handler: function () {

            }
        }, {
            name: "ShowHistogram",
            label: "Show Histogram",
            handler: function () {

            }
        }, {
            name: "Function",
            label: "Function",
            childContextMenu: [

            ],
            handler: function () {

            }
        }
    ];
    this.contextMenu = commonCtxMenu;
    this.setContextMenu = function (contextMenu) {
        self.contextMenu = contextMenu;
    }
    this.showContextMenu = function (event) {
        if (event.button != 2) return;
        event.stopPropagation();
        wiComponentService.getComponent('ContextMenu')
            .open(event.clientX, event.clientY, self.contextMenu);
    }

    this.createVisualizeCrossplot = function (curveX, curveY, config) {
        if (!config) config = {};
        // if (!self.viCrossplot) {
            let domElem = document.getElementById(self.crossplotAreaId);
            self.viCrossplot = graph.createCrossplot(curveX, curveY, config, domElem);
        // }
        return self.viCrossplot;
    }
    this.initPolygons = function (polygons) {
        self.viCrossplot.polygons = [];
        polygons.forEach(function (polygon) {
            self.viCrossplot.polygons.push(polygon);
        })
        self.viCrossplot.doPlot();
    }
    this.getPolygons = function () {
        if (!self.viCrossplot) return [];
        return self.viCrossplot.polygons;
    }
    this.getRegressionLines = function () {
        if (!self.viCrossplot) return [];
        return self.viCrossplot.regressionLines;
    }
    this.getViCrossplot = function () {
        if (!self.viCrossplot) return {};
        return self.viCrossplot;
    }
    this.drawPolygon = function (idPolygon, callback) {
        if (idPolygon) {
            self.viCrossplot.startEditPolygon(idPolygon);
            self.setContextMenu([
                {
                    name: "End",
                    label: "End",
                    icon: "",
                    handler: function () {
                        callback(self.viCrossplot.endEditPolygon());
                        self.contextMenu = commonCtxMenu;
                    }
                }
            ])
        } else {
            self.viCrossplot.startAddPolygon();
            self.setContextMenu([
                {
                    name: "End",
                    label: "End",
                    icon: "",
                    handler: function () {
                        callback(self.viCrossplot.endAddPolygon());
                        self.contextMenu = commonCtxMenu;
                    }
                }
            ])
        }
    }

}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-d3-crossplot.html',
    controller: Controller,
    controllerAs: componentName,
    transclude: true,
    bindings: {
        name: '@',
        wiCrossplotCtrl: '<'
    }
});

exports.name = moduleName;
