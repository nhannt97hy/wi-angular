const componentName = 'wiHis';
const moduleName = 'wi-his';

function Controller($scope, wiComponentService, wiApiService, ModalService, $timeout) {
    let self = this;
    let graph = wiComponentService.getComponent(wiComponentService.GRAPH);
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);

    this.$onInit = function () {
        console.log('wi his: ', this);
        this.mainHisAreaId = 'wi-his-main-area';
        this.viWiHis = null;
        wiComponentService.putComponent('wi-his', this);
    }
    this.onReady = function () {
        this.createViWiHis();
    }

    this.update = function (changes) {
        if (this.viWiHis) {
            changes.curvesProperties.forEach(datum => delete datum.$$hashKey);
            let existedCurves = this.viWiHis.curves.map(curve => {
                return {
                    idCurve: curve.idCurve,
                    options: curve.options
                };
            });
            let isChanged = existedCurves.length >= changes.curvesProperties.length ?
                _.differenceWith(existedCurves, changes.curvesProperties, _.isEqual).length :
                _.differenceWith(changes.curvesProperties, existedCurves, _.isEqual).length;
            if (isChanged && !changes.curvesProperties.length) {
                this.config = {
                    showGaussian: false,
                    showCumulative: true,
                    loga: false,
                    showGrid: false,
                    flipHorizontal: false,
                    plotType: null,
                    plot: null,
                    numOfDivisions: null,
                    scale: {
                        left: null,
                        right: null,
                    },
                    isShowWiZone: false,
                    referenceDisplay: false
                };
                this.viWiHis.curves = [];
                this.viWiHis.updatePlot(changes);
                this.viWiHis.plotContainer.selectAll('*').remove();
                delete this.viWiHis;
            } else if (isChanged) {
                this.createViWiHis(changes);
            } else {
                this.viWiHis.updatePlot(changes);
            }
        } else {
            this.createViWiHis();
        }
    }

    this.createViWiHis = function (changes) {
        let self = this;
        let curve = {};
        let scale = {
            left: null,
            right: null
        };
        this.curves = [];
        if (!this.curvesProperties.length) return;
        async.eachSeries(this.curvesProperties, function (curveProps, next) {
            curve = {
                idCurve: curveProps.idCurve,
                name: '',
                options: {},
                data: []
            };
            wiApiService.infoCurve(curveProps.idCurve, function (curveInfo) {
                scale.left = curveInfo.LineProperty.minScale;
                scale.right = curveInfo.LineProperty.maxScale;
                curve.name = curveInfo.name;
                if (!curveProps.options.lineColor) curveProps.options.lineColor = curveInfo.LineProperty.lineColor;
                curve.options = curveProps.options;
                wiApiService.dataCurve(curveProps.idCurve, function (curveData) {
                    curve.data = curveData;
                    self.curves.push(curve);
                    next();
                });
            });
        }, function (err, result) {
            if (err) {
                console.log('err', err);
                return;
            }
            console.log('curves', self.curves);

            if (!self.viWiHis) {
                if (!self.config.scale.left && !self.config.scale.right) {
                    self.config.scale = scale;
                }
                if (self.config.loga) {
                    if (self.config.scale.left == 0
                        || self.config.scale.right == 0) {
                        self.config.loga = false;
                        toastr.error("Scale can't be 0 in Logarithmic");
                        return;
                    }
                }

                // test
                self.config.plotType = 'Frequency';
                self.config.numOfDivisions = 50;
                // end test

                self.viWiHis = graph.createVisualizeWiHis({
                    curves: self.curves,
                    config: self.config
                }, document.getElementById(self.mainHisAreaId));
                self.setContextMenu();
                // debug
                window.__ViWiHis = self.viWiHis;
            } else {
                self.viWiHis.curves = self.curves;
                self.viWiHis.updatePlot(changes);
            }
        });
    }

    this.showContextMenu = function (event) {
        if (event.button != 2) return;
        event.stopPropagation();
        wiComponentService.getComponent('ContextMenu')
            .open(event.clientX, event.clientY, self.contextMenu);
    }

    this.setContextMenu = function (contextMenu) {
        let self = this;
        if (!contextMenu) {
            this.contextMenu = [
                {
                    name: "ShowTooltip",
                    label: "Show Tooltip",
                    isCheckType: "true",
                    checked: self.viWiHis.showTooltip,
                    handler: function () {
                        self.viWiHis.showTooltip = !self.viWiHis.showTooltip;
                    }
                }, {
                    name: "ShowGaussian",
                    label: "Show Gaussian",
                    "isCheckType": "true",
                    checked: self.config.showGaussian,
                    handler: function (index) {
                        self.config.showGaussian = !self.config.showGaussian;
                        self.contextMenu[index].checked = self.config.showGaussian;
                        self.viWiHis.doPlot();
                    }
                }, {
                    name: "ShowCumulative",
                    label: "Show Cumulative",
                    "isCheckType": "true",
                    checked: self.config.showCumulative,
                    handler: function (index) {
                        self.config.showCumulative = !self.config.showCumulative;
                        self.contextMenu[index].checked = self.config.showCumulative;
                        self.viWiHis.doPlot();
                    }
                }, {
                    name: "FlipHorizontalAxis",
                    label: "Flip Horizontal Axis",
                    "isCheckType": "true",
                    checked: self.config.flipHorizontal,
                    handler: function (index) {
                        self.config.flipHorizontal = !self.config.flipHorizontal;
                        self.contextMenu[index].checked = self.config.flipHorizontal;
                        self.viWiHis.doPlot();
                    }
                }, {
                    name: "ShowGrid",
                    label: "Show Grid",
                    "isCheckType": "true",
                    checked: self.config.showGrid,
                    handler: function (index) {
                        self.config.showGrid = !self.config.showGrid;
                        self.contextMenu[index].checked = self.config.showGrid;
                        self.viWiHis.doPlot();
                    }
                }, {
                    name: "ShowAxisYAsPercent",
                    label: "Show Axis Y as Percent",
                    "isCheckType": "true",
                    checked: self.config.plotType == "Percent",
                    handler: function (index) {
                        if (self.config.plotType == "Frequency")
                            self.config.plotType = "Percent";
                        else self.config.plotType = "Frequency";
                        self.contextMenu[index].checked = self.config.plotType == "Percent";
                        self.viWiHis.doPlot();
                    }
                }, {
                    name: "ShowReferenceWindow",
                    label: "Show Reference Window",
                    "isCheckType": "true",
                    checked: self.config.referenceDisplay,
                    handler: function (index) {
                        self.switchReferenceWindow();
                        self.contextMenu[index].checked = self.config.referenceDisplay;
                    }
                }
            ];
        } else {
            this.contextMenu = contextMenu;
        }
    }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-his.html',
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        curvesProperties: '<',
        config: '='
    }
});

exports.name = moduleName;