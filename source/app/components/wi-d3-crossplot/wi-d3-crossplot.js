const componentName = 'wiD3Crossplot';
const moduleName = 'wi-d3-crossplot';

function Controller($scope, wiComponentService, $timeout, ModalService, wiApiService) {
    let self = this;
    window.VISCROSSPLOT = self;
    let graph = wiComponentService.getComponent('GRAPH');
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    this.crossplotModel = null;
    let zoneCtrl = null, refWindCtrl;
    this.viCrossplot = {};
    this.isShowWiZone = true;
    // this.isShowReferenceWindow = true;
    let _well = null;
    window.abc = this;

    var saveCrossplot= utils.debounce(function() {
        wiApiService.editCrossplot(self.crossplotModel.properties, function(returnData) {
            console.log('updated');
        });
    }, 3000);

    this.saveCrossplot = saveCrossplot;

    function saveCrossplotNow(callback) {
        wiApiService.editCrossplot(self.crossplotModel.properties, function(returnData) {
            console.log('updated');
            if (callback) callback();
        });
    }
    this.$onInit = function () {
        self.crossplotAreaId = self.name.replace('D3Area', '');
        self.crossplotModel = utils.getModel('crossplot', self.wiCrossplotCtrl.id);
        if (self.crossplotModel) {
            wiApiService.getCrossplot(self.crossplotModel.properties.idCrossPlot, function (crossplot) {
                self.pointSet = crossplot.pointsets[0];
            });
        }
        if (self.name) {
            wiComponentService.putComponent(self.name, self);
            wiComponentService.emit(self.name);
        }
    };
    this.onReady = function () {
        self.linkModels();

        // self.createVisualizeCrossplot(self.curveXModel, self.curveYModel);
    }
    // let well = utils.findWellById(self.crossplotModel.properties.idWell);

    this.getWell = getWell;
    function getWell() {
        if (!_well) {
            _well = utils.findWellByCrossplot(self.wiCrossplotCtrl.id);
        }
        return _well;
    }

    this.getModel = function(){
        return self.crossplotModel;
    }
    this.CloseZone = function () {
        self.isShowWiZone = false;
        utils.triggerWindowResize();
    }

    this.getZoneCtrl = function () {
        if (!zoneCtrl) zoneCtrl = wiComponentService.getComponent(self.getZoneName());
        return zoneCtrl;
    }

    this.getZoneName = function () {
        return self.name + "Zone";
    }
    this.onRefWindCtrlReady = function(refWindCtrl) {
        console.log('Reference window is ready to update');
        refWindCtrl.update(getWell(), self.crossplotModel.properties.reference_curves);
    }

    this.getWiRefWindCtrlName = function () {
        return self.name + "RefWind";
    }

    this.getWiRefWindCtrl = function () {
        if (!refWindCtrl) refWindCtrl =  wiComponentService.getComponent(self.getWiRefWindCtrlName());
        return refWindCtrl;
    }

    this.linkModels = function () {
        self.zoneArr = null;
        console.log("crossLinkModel:", self.crossplotModel);

        if (self.crossplotModel && self.crossplotModel.properties.pointsets[0] && self.crossplotModel.properties.pointsets[0].idZoneSet) {
            console.log("idZoneSet:", self.crossplotModel.properties.pointsets[0].idZoneSet);
            self.zoneSetModel = utils.getModel('zoneset', self.crossplotModel.properties.pointsets[0].idZoneSet);
            self.zoneArr = self.zoneSetModel.children;
            self.zoneArr.forEach(function (zone) {
                zone.handler = function () {}
            });
            self.getZoneCtrl().zones = self.zoneArr;
            self.getZoneCtrl().zoneUpdate();
            self.pointSet.zones = self.zoneArr.map(function(zone) {
                return zone.properties;
            });
        }
    }

    this.onZoneCtrlReady = function(zoneCtrl) {
        zoneCtrl.trap('zone-data', function(data) {
            console.log("zone data", data);
            self.updateViCrossplotZones(data);
        });
    }

    this.updateViCrossplotZones = function(data) {
        let activeZones = self.getZoneCtrl().getActiveZones();

        if (activeZones)
            activeZones = activeZones.map(function(d) { return d.properties.idZone; });

        if (self.viCrossplot && self.viCrossplot.setProperties) {
            self.viCrossplot.setProperties({
                pointSet: {
                    activeZone: data == 'All' ? data : activeZones
                }
            });
            self.viCrossplot.doPlot();
        }
    }

    this.CloseReferenceWindow = function () {
        self.crossplotModel.properties.referenceDisplay = false;
        utils.triggerWindowResize();
    }
    this.propertiesDialog = function () {
        function openDialog() {
            if (!self.viCrossplot || !Object.keys(self.viCrossplot).length) {
                self.viCrossplot = self.createVisualizeCrossplot(null, null, {
                    name: self.crossplotModel.properties.name,
                    idPointSet: self.pointSet.idPointSet,
                    idCrossPlot: self.crossplotModel.properties.idCrossPlot,
                    idWell: self.crossplotModel.properties.idWell,
                    pointSet: self.pointSet
                })
            }
            console.log("Model", self.crossplotModel);
            DialogUtils.crossplotFormatDialog(ModalService, self.wiCrossplotCtrl, function (ret) {
                console.log("ret", ret);
                self.linkModels();
            })
        }
        if (!self.crossplotModel || !self.pointSet) {
            wiApiService.getCrossplot(self.crossplotModel.properties.idCrossPlot, function (crossplot) {
                console.log('res', crossplot);
                self.pointSet = crossplot.pointsets[0];
                openDialog();
            });
        } else {
            openDialog();
        }
    }

    this.discriminator = function(){
        DialogUtils.discriminatorDialog(ModalService, self, function(data){
            console.log('Discriminator', data);
        })
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
            name: "Discriminator",
            label: "Discriminator",
            icon: "ti-filter",
            handler: function () {
                self.discriminator();
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
            checked: self.crossplotModel ? self.crossplotModel.properties.referenceDisplay : false,
            handler: function (index) {
                self.crossplotModel.properties.referenceDisplay = !self.crossplotModel.properties.referenceDisplay;
                self.contextMenu[index].checked = self.crossplotModel.properties.referenceDisplay;
                utils.triggerWindowResize();
            }
        },{
            name: "ReferenceWindow",
            label: "Reference Window",
            handler: function () {
                let well = getWell();
                DialogUtils.referenceWindowsDialog(ModalService, _well, self.crossplotModel, function() {
                    saveCrossplotNow(function() {
                        console.log("READYYYYY");
                        self.getWiRefWindCtrl().update(_well, self.crossplotModel.properties.reference_curves);
                    });
                });
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

            self.viCrossplot.onMouseDown(viCrossplotMouseDownCallback)
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
    this.initRegressionLines = function(regressionLines) {
        self.viCrossplot.regressionLines = [];
        regressionLines.forEach(function (regressionLines) {
            self.viCrossplot.regressionLines.push(regressionLines);
        })
        self.viCrossplot.doPlot();
    }
    this.getPolygons = function () {
        // let polygons = new Array();
        if (!self.viCrossplot) return [];
        // console.log("getP", self.viCrossplot);
        // wiApiService.getCrossplot(self.viCrossplot.idCrossPlot, function(crossplot) {

        // })
        return self.viCrossplot.polygons;
    }
    this.getRegressionLines = function () {
        if (!self.viCrossplot) return [];
        return self.viCrossplot.regressionLines;
    }
    this.getUserDefineLines = function () {
        if (!self.viCrossplot) return [];
        return self.viCrossplot.user_define_lines;
    }
    this.getTernary = function () {
        if (!self.viCrossplot) return {};
        return self.viCrossplot.ternary;
    }
    this.getViCrossplot = function () {
        if (!self.viCrossplot) return {};
        return self.viCrossplot;
    }

    this.updateActiveZone = function (activeZone) {
        if (!self.viCrossplot) return {};
        viCrossplot.setProperties({
            pointSet: {
                activeZone: activeZone
            }
        });
        viCrossplot.doPlot();
    }

    this.drawUserLine = function(callback) {
        self.viCrossplot.startAddUserLine();
        self.setContextMenu([
            {
                name: "End",
                label: "End",
                icon: "",
                handler: function () {
                    let userLine = self.viCrossplot.endAddUserLine();
                    if (callback) callback(userLine);
                    self.contextMenu = commonCtxMenu;
                }
            }
        ]);
    }

    this.deleteUserLine = function() {
        self.viCrossplot.userLine = null;
        self.viCrossplot.plotUserLine();
    }

    this.drawAreaRectangle = function (callback) {
        self.viCrossplot.startAddAreaRectangle();
        self.setContextMenu([
            {
                name: "End",
                label: "End",
                icon: "",
                handler: function () {
                    let area = self.viCrossplot.endAddAreaRectangle();
                    if (callback) callback(area);
                    self.contextMenu = commonCtxMenu;
                }
            }
        ]);
    }

    this.drawAreaPolygon = function (callback) {
        self.viCrossplot.startAddAreaPolygon();
        self.setContextMenu([
            {
                name: "End",
                label: "End",
                icon: "",
                handler: function () {
                    let area = self.viCrossplot.endAddAreaPolygon();
                    if (callback) callback(area);
                    self.contextMenu = commonCtxMenu;
                }
            }
        ]);
    }

    this.deleteArea = function() {
        self.viCrossplot.area = null;
        self.viCrossplot.plotArea();
    }

    this.pickPoint = function(callback) {
        self.viCrossplot.startAddTernaryPoint();
        self.setContextMenu([
            {
                name: "End",
                label: "End",
                icon: "",
                handler: function () {
                    self.viCrossplot.endAddTernaryPoint();
                    self.contextMenu = commonCtxMenu;
                    if (callback) callback(null);
                }
            }
        ]);
        self.viCrossplot.onMouseDown(function(point) {
            viCrossplotMouseDownCallback();
            if (d3.event.button == 2) return;
            if (callback) callback(point);
        })
    }

    this.pickVertex = function(callback) {
        self.viCrossplot.startAddTernaryVertex();
        self.setContextMenu([
            {
                name: "End",
                label: "End",
                icon: "",
                handler: function () {
                    self.viCrossplot.endAddTernaryVertex();
                    self.contextMenu = commonCtxMenu;
                    if (callback) callback(null);
                }
            }
        ]);
        self.viCrossplot.onMouseDown(function(vertex) {
            viCrossplotMouseDownCallback();
            if (d3.event.button == 2) return;
            if (callback) callback(vertex);
        })
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

    function viCrossplotMouseDownCallback() {
        if (d3.event.button == 2) return;
        if (self.viCrossplot.mode == 'PlotAreaRectangle') {
            if (self.viCrossplot.area && self.viCrossplot.area.points.length > 1) {
                self.viCrossplot.endAddAreaRectangle();
                self.contextMenu = commonCtxMenu;
            }
        }
        else if (self.viCrossplot.mode == 'PlotUserLine') {
            if (self.viCrossplot.userLine && self.viCrossplot.userLine.points.length > 1) {
                self.viCrossplot.endAddUserLine();
                self.contextMenu = commonCtxMenu;
            }
        }
        else if (self.viCrossplot.mode == 'PlotTernaryVertex') {
            self.viCrossplot.endAddTernaryVertex();
            self.contextMenu = commonCtxMenu;
        }
        else if (self.viCrossplot.mode == 'PlotTernaryPoint') {
            self.viCrossplot.endAddTernaryPoint();
            self.contextMenu = commonCtxMenu;
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
