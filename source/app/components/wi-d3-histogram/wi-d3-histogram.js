const componentName = 'wiD3Histogram';
const moduleName = 'wi-d3-histogram';


function isFunction(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

function Controller($scope, wiComponentService, $timeout, ModalService, wiApiService) {
    let self = this;
    let _well = null;

    let curveLoading = false;
    this.visHistogram = {};
    let graph = wiComponentService.getComponent(wiComponentService.GRAPH);
    self.histogramModel = null;
    self.curveModel = null;
    let zoneCtrl = null, refWindCtrl;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);

    var saveHistogram= utils.debounce(function() {
            wiApiService.editHistogram(self.histogramModel.properties, function(returnData) {
                console.log('updated');
            });
        }, 3000);

    this.saveHistogram = saveHistogram;

    this.statistics = {
        length: null,
        min: null,
        max: null,
        avg: null,
        avg_dev: null,
        std_dev: null,
        var: null,
        skew: null,
        kur: null,
        med: null,
        p10: null,
        p50: null,
        p90: null
    }
    this.zoneArr = null;

    this.isShowWiZone = true;
    this.isShowReferenceWindow = true;

    function getIdHistogram() {
        return self.name.replace('histogram', "").replace("D3Area", "");
    }

    this.getWell = getWell;
    function getWell() {
        if (!_well) {
            _well = utils.findWellByHistogram(self.wiHistogramCtrl.id);
        }
        return _well;
    }
    function getHistogramTitle() {
        let well = getWell();
        if (!self.histogramModel.properties.idCurve) return "Empty";
        let curve = utils.getCurveFromId(self.histogramModel.properties.idCurve);
        let datasetId = curve.properties.idDataset;
        for (let dataset of well.children) {
            if (dataset.type == 'dataset' && dataset.id == datasetId) {
                return well.properties.name + "." + dataset.properties.name;
            }
        }
        return "Empty";
    }

    function getXLabel() {
        if (self.curveModel) {
            let idDataset = self.curveModel.properties.idDataset;
            let datasetModel = utils.getModel('dataset', idDataset);
            return datasetModel.properties.name + "." + self.curveModel.properties.name;
        }
        return "";
    }
    this.linkModels = function () {
        self.zoneArr = null;
        if (self.histogramModel.properties.idZoneSet) {
            self.zoneSetModel= utils.getModel('zoneset', self.histogramModel.properties.idZoneSet);
            self.zoneArr = self.zoneSetModel.children;
            // self.zoneArr.forEach(function (zone) {
            //     zone.handler = function () {
            //         console.log("----", zone.properties.idZone);
            //     }
            // });
            self.getZoneCtrl().zones = self.zoneArr;

        }
        else {
            self.zoneSetModel = null;
        }
        if (self.histogramModel.properties.idCurve) {
            self.curveModel = utils.getCurveFromId(self.histogramModel.properties.idCurve);
            if (self.visHistogram) {
                if (self.visHistogram.idCurve != self.histogramModel.properties.idCurve) {
                    self.visHistogram.idCurve = self.histogramModel.properties.idCurve;
                    loadCurve(self.visHistogram.idCurve);
                } else {
                    self.visHistogram.signal('histogram-update', "no load curve");
                }
            }
        }
        self.histogramModel.properties.histogramTitle = getHistogramTitle();
        self.histogramModel.properties.xLabel = getXLabel();
    }
    this.refreshHistogram = function() {
        if (self.visHistogram) {
            let activeZones = self.getZoneCtrl().getActiveZones();
            console.warn("---", activeZones);
            if ( isFunction(self.visHistogram.setZoneSet) ) 
                self.visHistogram.setZoneSet(activeZones);
        }
        if ( isFunction(self.visHistogram.signal) ) 
            self.visHistogram.signal('histogram-update', "refresh");
    }
    this.onZoneCtrlReady = function(zoneCtrl) {
        console.log(zoneCtrl);
        zoneCtrl.trap('zone-data', function() {
            self.refreshHistogram();
        });
    }
    this.onRefWindCtrlReady = function(refWindCtrl) {
        refWindCtrl.update(getWell(), self.histogramModel.properties.reference_curves);
    }
    this.getWiZoneCtrlName = function () {
        return self.name + "Zone";
    }
    this.getZoneCtrl = function () {
        if (!zoneCtrl) zoneCtrl =  wiComponentService.getComponent(self.getWiZoneCtrlName());
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
        let domElem = document.getElementById(self.histogramAreaId);
        console.log(self.histogramAreaId, domElem);
        self.createVisualizeHistogram(self.histogramModel, domElem);
        self.histogramModel.properties.histogramTitle = getHistogramTitle();
    }
    this.$onInit = function() {
        self.histogramAreaId = self.name + 'HistogramArea';
        self.histogramModel = self.wiHistogramCtrl.getHistogramModel();
        if (self.name) {
            wiComponentService.putComponent(self.name, self);
            wiComponentService.emit(self.name);
        }
    };

    this.toggleShowWiZone = function () {
        self.isShowWiZone = !self.isShowWiZone;
    }

    this.CloseZone = function () {
        self.isShowWiZone = false;
    }

    this.toogleShowReferenceWindow = function () {
        self.isShowReferenceWindow = !self.isShowReferenceWindow;
    }

    this.CloseReferenceWindow = function () {
        self.isShowReferenceWindow = false;
    }

    this.histogramFormat = function(){
        DialogUtils.histogramFormatDialog(ModalService, self.wiHistogramCtrl, function(histogramProperties) {
            self.linkModels();
            self.getZoneCtrl().zoneUpdate();
            self.getWiRefWindCtrl().update(getWell(), histogramProperties.reference_curves);

            /*
            // Update reference windows TODO !!!
            let familyArray = wiComponentService.getComponent(wiComponentService.LIST_FAMILY);
            let minY = parseFloat(well.properties.topDepth);
            let maxY = parseFloat(well.properties.bottomDepth);
            let stepY = parseFloat(well.properties.step);

            let config = {
                //minX: infoCurve.LineProperty ? infoCurve.LineProperty.minScale : 0,
                //maxX: infoCurve.LineProperty ? infoCurve.LineProperty.maxScale : 200,
                minY: minY,
                maxY: maxY,
                yStep: stepY,
                offsetY: minY
                //line: {
                //    color: infoCurve.LineProperty ? infoCurve.LineProperty.lineColor : 'black',
                //}
            }

            var refWindCtrl = self.getWiRefWindCtrl();
            if (!histogramProperties.reference_curves || !histogramProperties.reference_curves.length) {
                refWindCtrl.removeAllRefCurves();
            }
            else {
                for (let i = refWindCtrl._viCurves.length - 1; i >= 0; i--) {
                    if (!histogramProperties.reference_curves.find(
                            function(curve) { 
                                return refWindCtrl._viCurves[i].id == curve.idCurve;
                            }
                        ) 
                    ) {
                        refWindCtrl._viCurves[i].destroy();
                        refWindCtrl._viCurves.splice(i, 1);
                    }
                }
                for (let refCurve of histogramProperties.reference_curves) {
                    if (!refWindCtrl._viCurves.find(function(vc) { return vc.id == refCurve.idCurve; })) {
                        let curveModel = utils.getModel('curve', refCurve.idCurve);
                        if (curveModel.properties.idFamily) {
                            let family = familyArray.find(function(f) {
                                return f.idFamily == curveModel.properties.idFamily;
                            });
                            config.minX = family.minScale;
                            config.maxX = family.maxScale;
                            let dash = null;
                            try {
                                dash = JSON.parse(family.lineStyle);
                            }
                            catch (err) {
                                dash = [0];
                            }
                            config.line = { 
                                color: family.lineColor,
                                width: family.lineWidth,
                                dash: dash
                            }
                        }
                        else {
                            config.minX = curveModel.properties.minScale;
                            config.maxX = curveModel.properties.maxScale;
                            config.line = { 
                                color: 'black'
                            }
                        }

                        refWindCtrl.addRefCurve(refCurve.idCurve, config);
                    }
                }
            }
            */
        });
    }

    this.histogramDiscriminator = function(){
        DialogUtils.discriminatorDialog(ModalService, 'histogram', self.wiHistogramCtrl, function(){
            console.log('Discriminator');
        })
    }
    this.showContextMenu = function (event) {
        if (event.button != 2) return;
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
            icon: "properties2-16x16",
            handler: function () {
                self.histogramDiscriminator();
            }
        }, {
            name: "FlipHorizontalAxis",
            label: "Flip Horizontal Axis",
            "isCheckType": "true",
            checked: self.histogramModel ? self.histogramModel.properties.flipHorizontal : false,
            handler: function (index) {
                self.histogramModel.properties.flipHorizontal = !self.histogramModel.properties.flipHorizontal;
                self.contextMenu[index].checked = self.histogramModel.properties.flipHorizontal;
                // TODO
            }
        }, {
            name: "ShowGrid",
            label: "Show Grid",
            "isCheckType": "true",
            checked: self.histogramModel ? self.histogramModel.properties.showGrid : false,
            handler: function (index) {
                self.histogramModel.properties.showGrid = !self.histogramModel.properties.showGrid;
                self.contextMenu[index].checked = self.histogramModel.properties.showGrid;
                self.visHistogram.signal('histogram-update', 'show/hide grid');
                saveHistogram();
            }
        }, {
            name: "ShowGaussian",
            label: "Show Gaussian",
            "isCheckType": "true",
            checked: self.histogramModel ? self.histogramModel.properties.showGaussian : false,
            handler: function (index) {
                self.histogramModel.properties.showGaussian = !self.histogramModel.properties.showGaussian;
                self.contextMenu[index].checked = self.histogramModel.properties.showGaussian;
                self.visHistogram.signal('histogram-update', 'show/hide gaussian');
                saveHistogram();
            }
        }, {
            name: "ShowAxisYAsPercent",
            label: "Show Axis Y as Percent",
            "isCheckType": "true",
            checked: self.histogramModel ? (self.histogramModel.properties.plotType == "Percent") : false,
            handler: function (index) {
                if (self.histogramModel.properties.plotType == "Frequency")
                    self.histogramModel.properties.plotType = "Percent";
                else self.histogramModel.properties.plotType = "Frequency";
                self.contextMenu[index].checked = self.histogramModel ? (self.histogramModel.properties.plotType == "Percent") : false;
                self.visHistogram.signal('histogram-update', "update frequency/percentile");
                saveHistogram();
            }
        }, {
            name: "ShowReferenceWindow",
            label: "Show/Hide Reference Window",
            handler: function () {
                self.toogleShowReferenceWindow();
            }
        }, {
            name: "ShowCumulative",
            label: "Show Cumulative",
            "isCheckType": "true",
            checked: self.histogramModel ? self.histogramModel.properties.showCumulative : false,
            handler: function (index) {
                self.histogramModel.properties.showCumulative = !self.histogramModel.properties.showCumulative;
                self.contextMenu[index].checked = self.histogramModel.properties.showCumulative;
                self.visHistogram.signal('histogram-update', "show/hide Cumulative curve");
                saveHistogram();
            }
        }, {
            name: "ShowTooltip",
            label: "Show/Hide Tooltip",
            handler: function () {

            }
        }, {
            name: "FrequencyInfor",
            label: "Frequency Infor",
            icon: "ti-info-alt",
            handler: function () {
                if (self.visHistogram.data) {
                    DialogUtils.histogramFrequencyInfoDialog(ModalService, self);
                }
            }
        }];
        event.stopPropagation();
        wiComponentService.getComponent('ContextMenu')
            .open(event.clientX, event.clientY, self.contextMenu);
    }

    function buildConfigFromHistogramModel(histogramModel) {
        var config = {
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
            discriminators: {},
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

    this.createVisualizeHistogram = function (histogramModel) {
        var elem = document.getElementById(self.histogramAreaId);

        var well = getWell();
        self.visHistogram = graph.createHistogram(histogramModel, parseFloat(well.properties.step), 
                parseFloat(well.properties.topDepth), 
                parseFloat(well.properties.bottomDepth), elem);
        //self.visHistogram.zoneSetModel = self.zoneSetModel;
        //self.visHistogram.zoneSet = self.zoneSetModel?self.zoneSetModel.children : null;
        
        // trap load-statistic event to process
        self.visHistogram.trap('data-processing-done', function(arg) {
            console.log("data processing ready: we load statistics:", arg);
            loadStatistics();
        });

        if (self.visHistogram.idCurve) {
            loadCurve(self.visHistogram.idCurve);
        }
    }

    function loadCurve(idCurve) {
        if (curveLoading) return;
        curveLoading = true;
        wiApiService.dataCurve(idCurve, function (data) {
            if (self.visHistogram) {
                console.warn('curve loaded');
                self.visHistogram.setCurve(data);
                curveLoading = false;
                self.refreshHistogram();
            }
        });
    }

    function loadStatistics() {
        $timeout(function () {
            self.statistics.length = self.visHistogram.getLength();
            self.statistics.min = self.visHistogram.getMin();
            self.statistics.max = self.visHistogram.getMax();
            self.statistics.avg = self.visHistogram.getAverage();
            self.statistics.avg_dev = self.visHistogram.getAverageDeviation();
            self.statistics.std_dev = self.visHistogram.getStandardDeviation();
            self.statistics.var = self.visHistogram.getVariance();
            self.statistics.skew = self.visHistogram.getSkewness();
            self.statistics.kur = self.visHistogram.getKurtosis();
            self.statistics.med = self.visHistogram.getMedian();
            self.statistics.p10 = self.visHistogram.getPercentile(0.1);
            self.statistics.p50 = self.visHistogram.getPercentile(0.5);
            self.statistics.p90 = self.visHistogram.getPercentile(0.9);
        });
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
        wiHistogramCtrl: '<'
    }
});

exports.name = moduleName;
