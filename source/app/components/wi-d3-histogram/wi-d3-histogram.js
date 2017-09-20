const componentName = 'wiD3Histogram';
const moduleName = 'wi-d3-histogram';

function Controller($scope, wiComponentService, $timeout, ModalService, wiApiService) {
    let self = this;
    this.visHistogram = {};
    let graph = wiComponentService.getComponent('GRAPH');
    self.histogramModel = null;
    self.curveModel = null;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
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

    function getHistogramTitle() {
        let well = utils.findWellByHistogram(self.wiHistogramCtrl.id);
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
            self.zoneSetModel = utils.getModel('zoneset', self.histogramModel.properties.idZoneSet);
            self.zoneArr = self.zoneSetModel.children;
            self.zoneArr.forEach(function (zone) {
                zone.handler = function () {
                    console.log("----", zone.properties.idZone);
                }
            })

            self.histogramModel.properties.histogramTitle = getHistogramTitle();
            self.histogramModel.properties.xLabel = getXLabel();
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
    }
    this.getZoneName = function () {
        return self.name + "Zone";
    }
    this.getZoneCtrl = function () {
        return wiComponentService.getComponent(self.getZoneName());
    }
    this.onReady = function () {
        self.linkModels();
        let domElem = document.getElementById(self.histogramAreaId);
        console.log(self.histogramAreaId, domElem);
        self.createVisualizeHistogram(self.histogramModel, domElem);
        self.histogramModel.properties.histogramTitle = getHistogramTitle();

    }
    this.$onInit = function () {
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
                utils.histogramFormat(ModalService, wiComponentService, self.wiHistogramCtrl);
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
                //
                //TODO
            }
        }, {
            name: "ShowGaussian",
            label: "Show Gaussian",
            "isCheckType": "true",
            checked: self.histogramModel ? self.histogramModel.properties.showGaussian : false,
            handler: function (index) {
                self.histogramModel.properties.showGaussian = !self.histogramModel.properties.showGaussian;
                self.contextMenu[index].checked = self.histogramModel.properties.showGaussian;
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
            }
        }, {
            name: "ShowCumulativeCurve",
            label: "Show Cumulative Curve",
            "isCheckType": "true",
            checked: false, // TODO
            handler: function () {

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
                if (self.visHistogram) {
                    DialogUtils.histogramFrequencyInfoDialog(ModalService, self.visHistogram, function () {
                        console.log('Frequency Info!!!!!');
                    })
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
            zones: histogramModel.properties.zones
        }
        return config;
    }

    this.createVisualizeHistogram = function (histogramModel) {
        var elem = document.getElementById(self.histogramAreaId);

        var well = utils.findWellByHistogram(self.wiHistogramCtrl.id);
        self.visHistogram = graph.createHistogram(histogramModel, parseFloat(well.properties.step),
            parseFloat(well.properties.topDepth),
            parseFloat(well.properties.bottomDepth), elem);

        if (self.visHistogram.idCurve) {
            loadCurve(self.visHistogram.idCurve);
        }
    }

    function loadCurve(idCurve) {
        wiApiService.dataCurve(idCurve, function (data) {
            if (self.visHistogram) {
                self.visHistogram.setCurve(data);
                self.visHistogram.signal('histogram-update', "linh tinh");
                loadStatistics();
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