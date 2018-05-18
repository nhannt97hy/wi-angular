const componentName = 'wiXplot';
const moduleName = 'wi-xplot';

function Controller($scope, wiComponentService, wiApiService, ModalService, $timeout) {
    let self = this;
    let graph = wiComponentService.getComponent(wiComponentService.GRAPH);
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);

    this.$onInit = function () {
        console.log('wi xplot initialization: ', this);
        this.mainXplotAreaId = 'wi-xplot-main-area';
        this.viWiXplot = null;
        wiComponentService.putComponent('wi-xplot', this);
    }
    this.onReady = function () {
        this.createViWiXplot();
    }

    this.update = function (changes) {
        if (this.viWiXplot) {
            changes.curvesProperties.forEach(datum => delete datum.$$hashKey);
            let existedCurves = this.viWiXplot.getProperties().pointsets.map(pointSet => {
                return {
                    x: pointSet.curveX.idCurve,
                    y: pointSet.curveY.idCurve,
                    options: pointSet.options
                };
            });
            let isChanged = existedCurves.length >= changes.curvesProperties.length ?
                _.differenceWith(existedCurves, changes.curvesProperties, _.isEqual).length :
                _.differenceWith(changes.curvesProperties, existedCurves, _.isEqual).length;
            if (isChanged && !changes.curvesProperties.length) {
                this.config = {
                    logX: false,
                    logY: false,
                    majorX: 5,
                    majorY: 5,
                    minorX: 1,
                    minorY: 1,
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
                this.viWiXplot.footerContainer.selectAll('*').remove();
                this.viWiXplot.plotContainer.selectAll('*').remove();
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
        if (!this.curvesProperties.length) return;
        async.eachSeries(this.curvesProperties, function (curveProps, next) {
            pointSet = {
                scale: {
                    left: null,
                    right: null,
                    bottom: null,
                    top: null
                },
                curveX: {
                    idCurve: curveProps.x,
                    name: '',
                    data: {}
                },
                curveY: {
                    idCurve: curveProps.y,
                    name: '',
                    data: {}
                },
                options: {}
            }
            async.parallel([
                function (cb) {
                    wiApiService.infoCurve(curveProps.x, function (curveInfo) {
                        pointSet.scale.left = curveInfo.LineProperty.minScale;
                        pointSet.scale.right = curveInfo.LineProperty.maxScale;
                        pointSet.curveX.name = curveInfo.name;
                        wiApiService.dataCurve(curveProps.x, function (curveData) {
                            pointSet.curveX.data = curveData;
                            cb();
                        });
                    });
                },
                function (cb) {
                    wiApiService.infoCurve(curveProps.y, function (curveInfo) {
                        pointSet.scale.bottom = curveInfo.LineProperty.minScale;
                        pointSet.scale.top = curveInfo.LineProperty.maxScale;
                        pointSet.curveY.name = curveInfo.name;
                        wiApiService.dataCurve(curveProps.y, function (curveData) {
                            pointSet.curveY.data = curveData;
                            cb();
                        });
                    });
                }
            ], function (cb) {
                if (!curveProps.options.pointColor) curveProps.options.pointColor = genRandomColor();
                pointSet.options = curveProps.options;
                pointSet.pointSize = 3;
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
                }, document.getElementById(self.mainXplotAreaId));
                self.setContextMenu();
            } else {
                self.viWiXplot.pointsets = self.pointsets;
                self.viWiXplot.updatePlot(changes);
            }
            self.viWiXplot.onMouseDown(self.mouseDownCallback);
            self.viWiXplot.plotContainer.on('mousewheel', function () {
                self.mouseWheelCallback();
            });
            // debug
            window.__ViWiXplot = self.viWiXplot;
        });
        function genRandomColor() {
            let r = Math.round(Math.random() * 256);
            let g = Math.round(Math.random() * 256);
            let b = Math.round(Math.random() * 256);
            return 'rgb(' + [r, g, b].join(",") + ')';
        }
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

    this.pickPoint = function(callback) {
        self.viWiXplot.startAddTernaryPoint();
        self.setContextMenu([
            {
                name: "End",
                label: "End",
                icon: "",
                handler: function () {
                    self.viWiXplot.endAddTernaryPoint();
                    self.setContextMenu();
                    if (callback) callback(null);
                }
            }
        ]);
        self.viWiXplot.onMouseDown(function(point) {
            self.mouseDownCallback();
            if (d3.event.button == 2) return;
            if (callback) callback(point);
        })
    }
    this.pickVertex = function(idx, callback) {
        self.viWiXplot.startAddTernaryVertex(idx);

        self.setContextMenu([
            {
                name: "Cancel",
                label: "Cancel",
                icon: "",
                handler: function () {
                    self.viWiXplot.endAddTernaryVertex();
                    self.setContextMenu();
                    if (callback) callback('Canceled');
                }
            }
        ]);
        self.viWiXplot.onMouseDown(function(vertex) {
            self.mouseDownCallback();
            if (d3.event.button == 2) return;
            if (callback) callback(vertex);
        })
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
        else if (self.viWiXplot.mode == 'PlotTernaryVertex') {
            self.viWiXplot.endAddTernaryVertex();
            self.setContextMenu();
        }
        else if (self.viWiXplot.mode == 'PlotTernaryPoint') {
            self.viWiXplot.endAddTernaryPoint();
            self.setContextMenu();
        }
    }

    this.mouseWheelCallback = function () {
        let mouse = d3.mouse(this.viWiXplot.plotContainer.node());
        let transformX = this.viWiXplot.getTransformX();
        let transformY = this.viWiXplot.getTransformY();
        let posX = transformX.invert(mouse[0]);
        let posY = transformY.invert(mouse[1]);
        let newScale = {};

        if (d3.event.ctrlKey) {
            const zoomFactor = 0.1;
            if (d3.event.deltaY < 0) {
                newScale = {
                    left: this.config.scale.left - Math.abs(this.config.scale.left - posX) * zoomFactor,
                    right: this.config.scale.right + Math.abs(this.config.scale.right - posX) * zoomFactor,
                    bottom: this.config.scale.bottom + Math.abs(this.config.scale.bottom - posY) * zoomFactor,
                    top: this.config.scale.top - Math.abs(this.config.scale.top - posY) * zoomFactor
                };
                this.viWiXplot.pointsets.forEach(pointSet => {
                    pointSet.pointSize *= (1 + zoomFactor);
                });
            } else {
                newScale = {
                    left: this.config.scale.left + Math.abs(this.config.scale.left - posX) * zoomFactor,
                    right: this.config.scale.right - Math.abs(this.config.scale.right - posX) * zoomFactor,
                    bottom: this.config.scale.bottom - Math.abs(this.config.scale.bottom - posY) * zoomFactor,
                    top: this.config.scale.top + Math.abs(this.config.scale.top - posY) * zoomFactor
                };
                this.viWiXplot.pointsets.forEach(pointSet => {
                    pointSet.pointSize /= (1 + zoomFactor);
                });
            }
            this.config.scale = newScale;
            this.viWiXplot.doPlot();
            d3.event.preventDefault();
            d3.event.stopPropagation();
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

    this.switchReferenceZone = function (state) {
        if (state != undefined || state != null) this.config.isShowWiZone = state;
        else this.config.isShowWiZone = !this.config.isShowWiZone;
        const menuItem = this.contextMenu.find(c => c.name == 'ShowReferenceZone');
        if (menuItem) {
            menuItem.checked = this.config.isShowWiZone;
        }
        wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER).triggerResize();
    }

    this.switchReferenceWindow = function (state) {
        if (state != undefined || state != null) this.config.referenceDisplay = state;
        else this.config.referenceDisplay = !this.config.referenceDisplay;
        const menuItem = this.contextMenu.find(c => c.name == 'ShowReferenceWindow');
        if (menuItem) {
            menuItem.checked = this.config.referenceDisplay;
        }
        wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER).triggerResize();
    }

    this.getWell = function () {
        return {
            children: [{
                id: 1,
                type: 'dataset',
            }],
            properties: {
                topDepth: 1119.8352,
                step: 0.1524
            }
        };
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
                    name: "ShowOverlay",
                    label: "Show Overlay",
                    isCheckType: "true",
                    disabled: (self.config || {}).idOverlayLine ? false : true,
                    checked: self.viWiXplot.showOverlay ? self.viWiXplot.showOverlay : true,
                    handler: function (index) {
                        self.viWiXplot.showOverlay = !self.viWiXplot.showOverlay;
                        self.viWiXplot.plotOverlayLines();
                        self.contextMenu[index].checked = self.viWiXplot.showOverlay;
                    }
                }, {
                    name: "ShowReferenceZone",
                    label: "Show Reference Zone",
                    isCheckType: "true",
                    checked: self.config.isShowWiZone,
                    handler: function (index) {
                        self.switchReferenceZone();
                    }
                }, {
                    name: "ShowReferenceWindow",
                    label: "Show Reference Window",
                    isCheckType: "true",
                    checked: self.config.referenceDisplay,
                    handler: function (index) {
                        self.switchReferenceWindow();
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
                            separator: '1'
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
                            separator: '1'
                        },
                        {
                            name: "UserDefineLine",
                            label: "User Define Line",
                            handler: function () {
                                DialogUtils.userDefineLineDialog(ModalService, self, function () { });
                            }
                        },
                        {
                            name: "PolygonManager",
                            label: "Polygon Manager",
                            handler: function () {
                                DialogUtils.polygonManagerDialog(ModalService, self, function () { });
                            }
                        },
                        {
                            name: "RegessionLine",
                            label: "Regession Line",
                            handler: function () {
                                DialogUtils.regressionLineDialog(ModalService, self, function () { });
                            }
                        }
                    ],
                    handler: function () {

                    }
                }, {
                    name: "Ternary",
                    label: "Ternary",
                    class: "has-more",
                    childContextMenu: [
                        {
                            name: "ConfigTernaryDiagram",
                            label: "Config Ternary Diagram",
                            handler: function () {
                                DialogUtils.ternaryDialog(ModalService, wiComponentService, self, function () { });
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
        curvesProperties: '<',
        config: '='
    }
});

exports.name = moduleName;
