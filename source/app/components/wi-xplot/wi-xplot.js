const componentName = 'wiXplot';
const moduleName = 'wi-xplot';

function Controller($scope, wiComponentService, wiApiService, ModalService, $timeout) {
    let self = this;
    let graph = wiComponentService.getComponent(wiComponentService.GRAPH);
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);

    this.$onInit = function () {
        console.log('wi xplot initialization: ', this);
        this.plotAreaId = 'wi-xplot-area';
        this.viWiXplot = null;
        wiComponentService.putComponent('wi-xplot', this);
    }
    this.onReady = function () {
        this.createViWiXplot();
    }

    this.update = function (changes) {
        if (this.viWiXplot) {
            changes.idCurves.forEach(datum => delete datum.$$hashKey);
            let existedIdCurves = this.viWiXplot.getProperties().pointsets.map(pointSet => {
                return {
                    x: pointSet.curveX.idCurve,
                    y: pointSet.curveY.idCurve
                };
            });
            let isChanged = existedIdCurves.length >= changes.idCurves.length ?
                _.differenceWith(existedIdCurves, changes.idCurves, _.isEqual).length :
                _.differenceWith(changes.idCurves, existedIdCurves, _.isEqual).length;
            if (isChanged && !changes.idCurves.length) {
                this.config = {
                    logX: false,
                    logY: false,
                    majorX: 5,
                    majorY: 5,
                    minorX : 1,
                    minorY : 1,
                    decimalsX: 2,
                    decimalsY: 2,
                    scale: {
                        left: null,
                        right: null,
                        bottom: null,
                        top: null
                    }
                };
                this.viWiXplot.pointsets = [];
                this.viWiXplot.updatePlot(changes);
                this.viWiXplot.plotContainer.remove();
                delete this.viWiXplot;
            } else if (isChanged) {
                this.createViWiXplot(changes);
            } else {
                this.viWiXplot.updatePlot(changes);
            }
        } else {
            this.createViWiXplot();
        }
    }

    this.createViWiXplot = function (changes) {
        let self = this;
        let pointSet = {};
        this.pointsets = [];
        if (!this.idCurves.length) return;
        async.eachSeries(this.idCurves, function (config, next) {
            pointSet = {
                scale: {
                    left: null,
                    right: null,
                    bottom: null,
                    top: null
                },
                curveX: {
                    idCurve: config.x,
                    name: '',
                    data: {}
                },
                curveY: {
                    idCurve: config.y,
                    name: '',
                    data: {}
                }
            }
            async.parallel([
                function (cb) {
                    wiApiService.infoCurve(config.x, function (curveInfo) {
                        pointSet.scale.left = curveInfo.LineProperty.minScale;
                        pointSet.scale.right = curveInfo.LineProperty.maxScale;
                        pointSet.curveX.name = curveInfo.name;
                        wiApiService.dataCurve(config.x, function (curveData) {
                            pointSet.curveX.data = curveData;
                            cb();
                        });
                    });
                },
                function (cb) {
                    wiApiService.infoCurve(config.y, function (curveInfo) {
                        pointSet.scale.bottom = curveInfo.LineProperty.minScale;
                        pointSet.scale.top = curveInfo.LineProperty.maxScale;
                        pointSet.curveY.name = curveInfo.name;
                        wiApiService.dataCurve(config.y, function (curveData) {
                            pointSet.curveY.data = curveData;
                            cb();
                        });
                    });
                }
            ], function (cb) {
                self.pointsets.push(pointSet);
                next();
            });
        }, function (err, result) {
            if (err) {
                console.log(err);
                return;
            }
            console.log('pointsets', self.pointsets);

            if (!self.viWiXplot) {
                // test
                if (!self.config.scale.left && !self.config.scale.right
                    && !self.config.scale.bottom && !self.config.scale.top) {
                        self.config.scale = (self.pointsets[0] || {}).scale;
                }
                if (self.config.logX) {
                    if (self.config.scale.left == 0
                        || self.config.scale.right == 0) {
                            self.config.logX = false;
                            toastr.error("Scale can't be 0 in Logarithmic");
                            return;
                        }
                }
                if (self.config.logY) {
                    if (self.config.scale.bottom == 0
                        || self.config.scale.top == 0) {
                            self.config.logY = false;
                            toastr.error("Scale can't be 0 in Logarithmic");
                            return;
                        }
                }
                // end test
                self.viWiXplot = graph.createVisualizeWiXplot({
                    pointsets: self.pointsets,
                    config: self.config
                }, document.getElementById(self.plotAreaId));
                self.setContextMenu();
            } else {
                self.viWiXplot.pointsets = self.pointsets;
                self.viWiXplot.updatePlot(changes);
            }
            self.viWiXplot.onMouseDown(self.mouseDownCallback);
        });
    }

    this.drawAreaPolygon = function (callback) {
        let self = this;
        this.viWiXplot.startAddAreaPolygon();
        this.setContextMenu([
            {
                name: "End",
                label: "End",
                icon: "",
                handler: function () {
                    let area = self.viWiXplot.endAddAreaPolygon();
                    if (callback) callback(area);
                    self.setContextMenu();
                }
            }
        ]);
    }

    this.drawAreaRectangle = function (callback) {
        let self = this;
        this.viWiXplot.startAddAreaRectangle();
        this.setContextMenu([
            {
                name: "End",
                label: "End",
                icon: "",
                handler: function () {
                    let area = self.viWiXplot.endAddAreaRectangle();
                    if (callback) callback(area);
                    self.setContextMenu();
                }
            }
        ]);
    }

    this.deleteArea = function () {
        this.viWiXplot.area = null;
        this.viWiXplot.plotArea();
    }

    this.drawUserLine = function (callback) {
        let self = this;
        this.viWiXplot.startAddUserLine();
        this.setContextMenu([
            {
                name: "End",
                label: "End",
                icon: "",
                handler: function () {
                    let userLine = self.viWiXplot.endAddUserLine();
                    if (callback) callback(userLine);
                    self.setContextMenu();
                }
            }
        ]);
    }

    this.deleteUserLine = function () {
        this.viWiXplot.userLine = null;
        this.viWiXplot.plotUserLine();
    }

    this.mouseDownCallback = function () {
        if (d3.event.button == 2) return;
        if (self.viWiXplot.mode == 'PlotAreaRectangle') {
            if (self.viWiXplot.area && self.viWiXplot.area.points.length > 1) {
                self.viWiXplot.endAddAreaRectangle();
                self.setContextMenu();
            }
        }
        else if (self.viWiXplot.mode == 'PlotUserLine') {
            if (self.viWiXplot.userLine && self.viWiXplot.userLine.points.length > 1) {
                self.viWiXplot.endAddUserLine();
                self.setContextMenu();
            }
        }
    }

    this.getPolygons = function () {
        if (!self.viWiXplot) return [];
        return self.viWiXplot.polygons;
    }

    this.initPolygons = function (polygons) {
        self.viWiXplot.polygons = [];
        polygons.forEach(function (polygon) {
            self.viWiXplot.polygons.push(polygon);
        })
        self.viWiXplot.doPlot();
    }

    this.drawPolygon = function (idPolygon, callback) {
        if (idPolygon) {
            self.viWiXplot.startEditPolygon(idPolygon);
            self.setContextMenu([
                {
                    name: "End",
                    label: "End",
                    icon: "",
                    handler: function () {
                        callback(self.viWiXplot.endEditPolygon());
                        self.setContextMenu();
                    }
                }
            ])
        } else {
            self.viWiXplot.startAddPolygon();
            self.setContextMenu([
                {
                    name: "End",
                    label: "End",
                    icon: "",
                    handler: function () {
                        callback(self.viWiXplot.endAddPolygon());
                        self.setContextMenu();
                    }
                }
            ])
        }
    }

    this.setContextMenu = function (contextMenu) {
        let self = this;
        if (!contextMenu) {
            this.contextMenu = [
                {
                    name: "ShowTooltip",
                    label: "Show Tooltip",
                    isCheckType: "true",
                    checked: self.viWiXplot.showTooltip ? self.viWiXplot.showTooltip : true,
                    handler: function () {
                        self.viWiXplot.showTooltip = !self.viWiXplot.showTooltip;
                        self.contextMenu[0].checked = self.viWiXplot.showTooltip;
                    }
                }, {
                    name: "Functions",
                    label: "Functions",
                    class: "has-more",
                    childContextMenu: [
                        {
                            name: "CreatePolygon",
                            label: "Create Polygon",
                            handler: function () {
                                self.drawAreaPolygon();
                            }
                        },
                        {
                            name: "CreateRectangle",
                            label: "Create Rectangle",
                            handler: function () {
                                self.drawAreaRectangle();
                            }
                        },
                        {
                            name: "DeleteArea",
                            label: "Delete Area",
                            handler: function () {
                                self.deleteArea();
                            }
                        },
                        {
                            name: "CreateUserLine",
                            label: "Create User Line",
                            handler: function () {
                                self.drawUserLine();
                            }
                        },
                        {
                            name: "DeleteUserLine",
                            label: "Delete User Line",
                            handler: function () {
                                self.deleteUserLine();
                            }
                        },
                        {
                            name: "UserDefineLine",
                            label: "User Define Line",
                            handler: function () {
                                DialogUtils.userDefineLineDialog(ModalService, self, function () {});
                            }
                        },
                        {
                            name: "PolygonManager",
                            label: "Polygon Manager",
                            handler: function () {
                                DialogUtils.polygonManagerDialog(ModalService, self, function () {});
                            }
                        },
                        {
                            name: "RegessionLine",
                            label: "Regession Line",
                            handler: function () {
                                DialogUtils.regressionLineDialog(ModalService, self, function () {});
                            }
                        }
                    ],
                    handler: function () {

                    }
                }
            ];
        } else {
            this.contextMenu = contextMenu;
        }
    }
    this.showContextMenu = function (event) {
        if (event.button != 2) return;
        event.stopPropagation();
        wiComponentService.getComponent('ContextMenu')
            .open(event.clientX, event.clientY, self.contextMenu);
    }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-xplot.html',
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        idCurves: '<',
        config: '='
    }
});

exports.name = moduleName;
