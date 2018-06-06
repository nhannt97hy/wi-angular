const componentName = 'wiD3Histogram';
const moduleName = 'wi-d3-histogram';


function isFunction(functionToCheck) {
    let getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

function Controller($scope, wiComponentService, $timeout, ModalService, wiApiService) {
    let self = this;
    let _well = null;

    let curveLoading = false;
    this.visHistogram = {};
    let graph = wiComponentService.getComponent(wiComponentService.GRAPH);
    this.histogramModel = null;
    this.curveModel = null;
    let refWindCtrl = null;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);

    let saveHistogram= _.debounce(function(callback) {
            wiApiService.editHistogram(self.histogramModel.properties, function(returnData) {
                console.log('updated');
                if (callback) callback();
            });
        }, 1000);

    this.saveHistogram = saveHistogram;

    function saveHistogramNow(callback) {
        wiApiService.editHistogram(self.histogramModel.properties, function(returnData) {
            if (callback) callback();
        });
    }
    this.saveHistogramNow = saveHistogramNow;

    function getIdHistogram() {
        return self.name.replace('histogram', "").replace("D3Area", "");
    }

    this.getWell = getWell;
    function getWell() {
        _well = utils.findWellByHistogram(self.idHistogram || self.wiHistogramCtrl.id);
        return _well;
    }

    this.getModel = function(){
        return utils.findHistogramModelById(self.idHistogram || self.wiHistogramCtrl.id);
    }
    function getHistogramTitle(log) {
        if(!!self.histogramModel.properties.histogramTitle){
            return;
        }else{
            let well = getWell();
            if (!self.histogramModel.properties.idCurve) {
                self.histogramModel.properties.histogramTitle = "Empty";
            }else{
                let curve = utils.getCurveFromId(self.histogramModel.properties.idCurve);
                if (!curve) self.histogramModel.properties.histogramTitle = "Empty";
                else self.histogramModel.properties.histogramTitle = well.properties.name + '.' + curve.properties.dataset;
            }
            saveHistogramNow(function(){
                console.log('change title');
            });
        }
    }

    function getXLabel() {
        if (self.curveModel) {
            return self.curveModel.properties.dataset + "." + self.curveModel.properties.name;
        }
        return "";
    }
    this.hasThisCurve = hasThisCurve;
    function hasThisCurve(idCurve) {
        if (!self.curveModel) return false;
        return (idCurve == self.curveModel.properties.idCurve);
    }
    function setWiHistogramZoneArr(zoneArray) {
        if (self.wiHistogramCtrl) self.wiHistogramCtrl.zoneArr = zoneArray;
    }

    this.linkModels = function () {
        setWiHistogramZoneArr(null);
        self.histogramModel = self.getModel();
        wiApiService.getHistogram(self.histogramModel.id, function(hisProps){
            self.histogramModel.properties = hisProps;
            self.histogramModel.properties.discriminator = JSON.parse(hisProps.discriminator);
            if (self.histogramModel.properties.idZoneSet) {
                self.zoneSetModel= utils.getModel('zoneset', self.histogramModel.properties.idZoneSet);
                if (self.visHistogram && isFunction(self.visHistogram.setHistogramModel) )
                    self.visHistogram.setHistogramModel(self.histogramModel);
                if (self.getZoneCtrl()) self.getZoneCtrl().zones = self.zoneSetModel.children;
                setWiHistogramZoneArr(self.zoneSetModel.children);
            }
            else {
                self.zoneSetModel = null;
            }
            if (self.histogramModel.properties.idCurve) {
                self.curveModel = utils.getCurveFromId(self.histogramModel.properties.idCurve);
                if (Object.keys(self.visHistogram).length !==0) {
                    if(self.visHistogram.discriminator != self.histogramModel.properties.discriminator){
                        self.visHistogram.discriminator = self.histogramModel.properties.discriminator;
                        utils.evaluateExpr(getWell(), self.visHistogram.discriminator, function(result){
                            self.visHistogram.discriminatorArr = result;
                            console.log('link models');

                            if (self.visHistogram.idCurve != self.histogramModel.properties.idCurve) {
                                self.visHistogram.idCurve = self.histogramModel.properties.idCurve;
                                loadCurve(self.visHistogram.idCurve);
                            } else {
                                self.visHistogram.signal('histogram-update', "no load curve");
                            }
                        });
                    } else if (self.visHistogram.idCurve != self.histogramModel.properties.idCurve) {
                        self.visHistogram.idCurve = self.histogramModel.properties.idCurve;
                        loadCurve(self.visHistogram.idCurve);
                    } else {
                        self.visHistogram.signal('histogram-update', "no load curve");
                    }
                }
            }
            getHistogramTitle();
            self.histogramModel.properties.xLabel = getXLabel();

            let refWindCtrl = self.getWiRefWindCtrl();
            if (refWindCtrl) refWindCtrl.update(getWell(),
                    hisProps.reference_curves,
                    hisProps.referenceScale,
                    hisProps.referenceVertLineNumber,
                    hisProps.referenceTopDepth,
                    hisProps.referenceBottomDepth,
                    hisProps.referenceShowDepthGrid);

            if (self.getZoneCtrl()) self.getZoneCtrl().zoneUpdate();
        })
    }
    this.refreshHistogram = function() {
        if (self.visHistogram) {
            let activeZones = null;
            if (self.getZoneCtrl()) activeZones = self.getZoneCtrl().getActiveZones();
            console.warn("---", activeZones);
            if ( isFunction(self.visHistogram.setHistogramModel) )
                self.visHistogram.setHistogramModel(self.histogramModel);
            if ( isFunction(self.visHistogram.setZoneSet) )
                self.visHistogram.setZoneSet(activeZones);
        }
        if ( isFunction(self.visHistogram.signal) )
            self.visHistogram.signal('histogram-update', "refresh");
    }

    this.getWiZoneCtrlName = function () {
        return self.name + "Zone";
    }
    this.getZoneCtrl = function () {
        let zoneCtrl =  wiComponentService.getComponent(self.getWiZoneCtrlName());
        return zoneCtrl;
    }
    this.getWiRefWindCtrlName = function () {
        return self.name + "RefWind";
    }
    this.getWiRefWindCtrl = function () {
        if (!refWindCtrl) refWindCtrl =  wiComponentService.getComponent(self.getWiRefWindCtrlName());
        return refWindCtrl;
    }
    this.onReady = function () {
        self.linkModels();
        self.createVisualizeHistogram(self.histogramModel.properties);
        function handler () {
            self.visHistogram && self.visHistogram.doPlot && self.visHistogram.doPlot();
        }
        self.resizeHandler = function (event) {
            let model = event.model;
            if (self.containerName) {
                if (model.type == 'histogram') return;
                let comboviewId = +self.containerName.replace('comboview', '');
                if (model.type == 'comboview' && comboviewId == model.properties.idCombinedBox) handler();
            } else {
                if (model.type != 'histogram' || model.id != self.histogramModel.id) return;
                handler();
            }
        }
        document.addEventListener('resize', self.resizeHandler);
    }
    this.onDelete = function (model) {
        console.log('wi-d3-histogram onDelete', model);
        switch (model.type) {
            case 'curve':
                let idCurve = model.id;
                let wellModel = utils.findWellByCurve(idCurve);
                if(wellModel.id == self.histogramModel.properties.idWell){
                    if (self.hasThisCurve(idCurve)) {
                        self.unloadCurve();
                    }
                }
                break;
            case 'dataset':
                let idDataset = model.id;
                if(model.properties.idWell == self.histogramModel.properties.idWell){
                    if (self.curveModel && self.curveModel.properties.idDataset == idDataset) {
                        self.unloadCurve();
                    }
                }
            break;

            case 'zoneset':
            if(self.histogramModel && self.histogramModel.properties.idZoneSet){
                if(model.id = self.histogramModel.properties.idZoneSet){
                    self.histogramModel.properties.idZoneSet = null;
                    saveHistogramNow(function(){
                        self.wiHistogramCtrl.CloseZone();
                        self.linkModels();
                    })
                }
            }
            break;
            case 'zone':
            console.log('not now =))');
            break;
            default:
                console.log('not implemented')
                return;
        }
    }
    this.onModifiedCurve = function(curve){
        if(self.hasThisCurve(curve.idCurve)) {
            console.log('wi-d3-histogram reload curve on changed', curve.idCurve);
            if (curve.data) {
                let data = curve.data.map((r,i) => {
                    return {
                        y: i,
                        x: r
                        }
                    }
                );
                loadCurve(curve.idCurve, data);
            } else {
                wiApiService.dataCurve(curve.idCurve, function (data) {
                    loadCurve(curve.idCurve, data);
                })
            }

        }
    }
    this.$onInit = function() {
        self.histogramAreaId = self.name + 'HistogramArea';
        self.histogramModel = self.getModel();
        if (self.containerName == undefined || self.containerName == null) self.containerName = '';
        if (self.name) {
            wiComponentService.putComponent(self.name, self);
            wiComponentService.emit(self.name);
        }
        wiComponentService.on(wiComponentService.DELETE_MODEL, self.onDelete);
        wiComponentService.on(wiComponentService.MODIFIED_CURVE_DATA, self.onModifiedCurve);
    };

    this.switchReferenceWindow = function(state){
        if (state != undefined || state != null) self.histogramModel.properties.referenceDisplay = state;
        else self.histogramModel.properties.referenceDisplay = !self.histogramModel.properties.referenceDisplay;
        saveHistogram();
        wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER).triggerResize();
    }

    this.histogramFormat = function(){
        DialogUtils.histogramFormatDialog(ModalService, self.idHistogram || self.wiHistogramCtrl.id,
            function(histogramProperties) {
                if (self.wiHistogramCtrl) {
                    if(!histogramProperties.idZoneSet){
                        self.wiHistogramCtrl.CloseZone();
                    }else{
                        self.wiHistogramCtrl.isShowWiZone = true;
                    }
                }
                self.linkModels();
                // if (self.getZoneCtrl()) self.getZoneCtrl().zoneUpdate();
            }
        );
    }

    this.discriminator = function(){
        DialogUtils.discriminatorDialog(ModalService, self, function(data){
            console.log('Discriminator', data);
            self.linkModels();
        });
    }
    this.showContextMenu = function (event) {
        if (event.button != 2) return;
        if (self.containerName && self.visHistogram.mode == 'UseSelector') {
            let combinedPlotD3Ctrl = wiComponentService.getComponent(self.containerName + 'D3Area');
            self.contextMenu = [
                {
                    name: "End",
                    label: "End",
                    icon: "",
                    handler: function () {
                        combinedPlotD3Ctrl.endAllSelections();
                    }
                }
            ];
        } else {
            self.contextMenu = [{
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
                    self.histogramFormat();
                }
            }, {
                name: "Discriminator",
                label: "Discriminator",
                icon: "ti-filter",
                handler: function () {
                    self.discriminator();
                }
            }, {
                name: "ReferenceWindow",
                label: "Reference Window",
                icon: "ti-layout-tab-window",
                handler: function () {
                    DialogUtils.referenceWindowsDialog(ModalService, getWell(), self.histogramModel, function() {
                        saveHistogramNow(function () {
                            let refWindCtrl = self.getWiRefWindCtrl();
                            if (refWindCtrl)
                                refWindCtrl.update(getWell(),
                                    self.histogramModel.properties.reference_curves,
                                    self.histogramModel.properties.referenceScale,
                                    self.histogramModel.properties.referenceVertLineNumber,
                                    self.histogramModel.properties.referenceTopDepth,
                                    self.histogramModel.properties.referenceBottomDepth,
                                    self.histogramModel.properties.referenceShowDepthGrid);
                        });
                    });
                }
            }, {
                name: "FlipHorizontalAxis",
                label: "Flip Horizontal Axis",
                isCheckType: true,
                checked: self.config.flipHorizontal,
                handler: function (index) {
                    self.histogramModel.properties.flipHorizontal = !self.histogramModel.properties.flipHorizontal;
                    self.contextMenu[index].checked = self.histogramModel.properties.flipHorizontal;
                    self.config.flipHorizontal = self.histogramModel.properties.flipHorizontal;
                    self.visHistogram.doPlot();
                    saveHistogram();
                }
            }, {
                name: "ShowGrid",
                label: "Show Grid",
                isCheckType: true,
                checked: self.config.showGrid,
                handler: function (index) {
                    self.histogramModel.properties.showGrid = !self.histogramModel.properties.showGrid;
                    self.contextMenu[index].checked = self.histogramModel.properties.showGrid;
                    self.config.showGrid = self.histogramModel.properties.showGrid;
                    self.visHistogram.doPlot();
                    saveHistogram();
                }
            }, {
                name: "ShowGaussian",
                label: "Show Gaussian",
                isCheckType: true,
                checked: self.config.showGaussian,
                handler: function (index) {
                    self.histogramModel.properties.showGaussian = !self.histogramModel.properties.showGaussian;
                    self.contextMenu[index].checked = self.histogramModel.properties.showGaussian;
                    self.config.showGaussian = self.histogramModel.properties.showGaussian;
                    self.visHistogram.doPlot();
                    saveHistogram();
                }
            }, {
                name: "ShowAxisYAsPercent",
                label: "Show Axis Y as Percent",
                isCheckType: true,
                checked: self.config.plotType == "Percent",
                handler: function (index) {
                    if (self.histogramModel.properties.plotType == "Frequency")
                        self.histogramModel.properties.plotType = "Percent";
                    else self.histogramModel.properties.plotType = "Frequency";
                    self.contextMenu[index].checked = self.histogramModel ? (self.histogramModel.properties.plotType == "Percent") : false;
                    self.config.plotType = self.histogramModel.properties.plotType;
                    self.visHistogram.doPlot();
                    saveHistogram();
                }
            }, {
                name: "ShowReferenceWindow",
                label: "Show Reference Window",
                isCheckType: true,
                checked: self.config.referenceDisplay,
                handler: function (index) {
                    self.switchReferenceWindow();
                    self.contextMenu[index].checked = self.config.referenceDisplay;
                }
            }, {
                name: "ShowCumulative",
                label: "Show Cumulative",
                isCheckType: true,
                checked: self.config.showCumulative,
                handler: function (index) {
                    self.histogramModel.properties.showCumulative = !self.histogramModel.properties.showCumulative;
                    self.contextMenu[index].checked = self.histogramModel.properties.showCumulative;
                    self.config.showCumulative = self.histogramModel.properties.showCumulative;
                    self.visHistogram.doPlot();
                    saveHistogram();
                }
            }, {
                name: "ShowTooltip",
                label: "Show Tooltip",
                isCheckType: true,
                checked: self.visHistogram.showTooltip || false,
                handler: function (index) {
                    self.visHistogram.showTooltip = !self.visHistogram.showTooltip;
                    self.contextMenu[index].checked = self.visHistogram.showTooltip;
                }
            }, {
                name: "FrequencyInfo",
                label: "Frequency Info",
                icon: "ti-info-alt",
                handler: function () {
                    if (self.visHistogram.data) {
                        DialogUtils.histogramFrequencyInfoDialog(ModalService, self);
                    }
                }
            }];
        }
        event.stopPropagation();
        wiComponentService.getComponent('ContextMenu')
            .open(event.clientX, event.clientY, self.contextMenu);
    }

    function buildConfigFromHistogramModel(histogramModel) {
        let config = {
            idHistogram: histogramModel.properties.idHistogram,
            name: histogramModel.properties.name,
            histogramTitle: histogramModel.properties.histogramTitle || "Noname",
            hardCopyWidth: histogramModel.properties.hardCopyWidth,
            hardCopyHeight: histogramModel.properties.hardCopyHeight,
            intervalDepthTop: histogramModel.properties.intervalDepthTop,
            intervalDepthBottom: histogramModel.properties.intervalDepthBottom,
            activeZone: histogramModel.properties.activeZone,
            divisions: histogramModel.properties.divisions,
            leftScale: histogramModel.properties.leftScale,
            rightScale: histogramModel.properties.rightScale,
            showGaussian: histogramModel.properties.showGaussian || false,
            loga: histogramModel.properties.loga || false,
            showGrid: histogramModel.properties.showGrid || false,
            showCumulative: histogramModel.properties.showCumulative || false,
            flipHorizontal: histogramModel.properties.flipHorizontal || false,
            line: {
                color: histogramModel.properties.lineColor,
                width: histogramModel.properties.lineWidth,
                dash: histogramModel.properties.lineStyle
            },
            plot: histogramModel.properties.plot, // Bars or lines
            plotType: histogramModel.properties.plotType, // Frequency or percent
            fill: {
                pattern: null,
                background: histogramModel.properties.color,
                foreground: histogramModel.properties.color
            },
            color: histogramModel.properties.color,
            discriminator: histogramModel.properties.discriminator,
            idWell: histogramModel.properties.idWell,
            idCurve: histogramModel.properties.idCurve,
            idZoneSet: histogramModel.properties.idZoneSet,
            data: null,
            zones: histogramModel.properties.zones,
            referenceTopDepth: histogramModel.properties.referenceTopDepth,
            referenceBottomDepth: histogramModel.properties.referenceBottomDepth,
            referenceScale: histogramModel.properties.referenceScale,
            referenceVertLineNumber: histogramModel.properties.referenceVertLineNumber,
            referenceDisplay: histogramModel.properties.referenceDisplay,
            referenceShowDepthGrid: histogramModel.properties.referenceShowDepthGrid,
            reference_curves: histogramModel.properties.reference_curves
        }
        return config;
    }

    this.createVisualizeHistogram = function (hisProps) {
        let self = this;
        let curve = {};
        let scale = {
            left: hisProps.leftScale,
            right: hisProps.rightScale
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
                if (!scale.left) scale.left = curveInfo.LineProperty.minScale;
                if (!scale.right) scale.right = curveInfo.LineProperty.maxScale;
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

            // if (!self.viWiHis) {
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
                self.config.numOfDivisions = 50;
                // end test

                self.config.showGaussian = hisProps.showGaussian;
                self.config.showCumulative = hisProps.showCumulative;
                self.config.showGrid = hisProps.showGrid;
                self.config.loga = hisProps.loga;
                self.config.flipHorizontal = hisProps.flipHorizontal;
                self.config.plot = hisProps.plot;
                self.config.plotType = hisProps.plotType;
                self.config.isShowWiZone = hisProps.isShowWiZone;
                self.config.referenceDisplay = hisProps.referenceDisplay;

                let well = getWell();
                hisProps.well = well;
                hisProps.curves = self.curves;
                hisProps.config = self.config;
                hisProps.histogramModel = self.histogramModel;

                self.visHistogram = graph.createHistogram(hisProps, document.getElementById(self.histogramAreaId));
                loadStatistics();
                // self.setContextMenu();
                // debug
                window.__visHistogram = self.visHistogram;
            // } else {
            //     self.viWiHis.curves = self.curves;
            //     self.viWiHis.updatePlot(changes);
            // }
        });
    }
    this.unloadCurve = unloadCurve;
    function unloadCurve() {
        curveLoading = true;
        self.curveModel = null;
        self.visHistogram.setCurve(null);
        self.histogramModel.properties.xLabel = getXLabel();
        curveLoading = false;
        self.refreshHistogram();
        loadStatistics();
    }
    function loadCurve(idCurve, dataCurve) {
        if (curveLoading) return;
        curveLoading = true;
        if(!dataCurve) {
            wiApiService.dataCurve(idCurve, function (data) {
                if (self.visHistogram) {
                    console.warn('curve loaded');
                    self.visHistogram.setCurve(data);
                    curveLoading = false;
                    self.refreshHistogram();
                }
            });
        }else{
            self.visHistogram.setCurve(dataCurve);
            curveLoading = false;
            self.refreshHistogram();
        }
    }

    function loadStatistics() {
        if (self.wiHistogramCtrl) {
            $timeout(function () {
                // self.wiHistogramCtrl.loadStatistics(self.visHistogram);
            });
        }
    }

	this.$onDestroy = function () {
        wiComponentService.dropComponent(self.name);
        document.removeEventListener('resize', self.resizeHandler);
        wiComponentService.removeEvent(wiComponentService.DELETE_MODEL, self.onDelete);
        wiComponentService.removeEvent(wiComponentService.MODIFIED_CURVE_DATA, self.onModifiedCurve);
	}
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-d3-histogram.html',
    controller: Controller,
    controllerAs: componentName,
    transclude: true,
    bindings: {
        name: '@',
        wiHistogramCtrl: '<',
        idHistogram: '<',
        selections: '<',
        containerName: '@',
        curvesProperties: '<',
        config: '<'
    }
});
app.filter('toFixed2', function() {
    return function(item) {
        if (item) return item.toFixed(2);
    }
});
exports.name = moduleName;
