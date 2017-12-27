const componentName = 'wiD3Histogram';
const moduleName = 'wi-d3-histogram';


function isFunction(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

function Controller($scope, wiComponentService, $timeout, ModalService, wiApiService) {
    let self = this;
    window.VISD3HISTOGRAM = self;
    let _well = null;

    let curveLoading = false;
    this.visHistogram = {};
    let graph = wiComponentService.getComponent(wiComponentService.GRAPH);
    self.histogramModel = null;
    self.curveModel = null;
    let zoneCtrl = null, refWindCtrl = null;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);

    var saveHistogram= _.debounce(function(callback) {
            wiApiService.editHistogram(self.histogramModel.properties, function(returnData) {
                console.log('updated');
                if (callback) callback();
            });
        }, 3000);

    this.saveHistogram = saveHistogram;

    function saveHistogramNow(callback) {
        wiApiService.editHistogram(self.histogramModel.properties, function(returnData) {
            if (callback) callback();
        });
    }
    this.saveHistogramNow = saveHistogramNow;
/*
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
*/
//    this.zoneArr = null;

    //this.isShowWiZone = true;
    // this.isShowReferenceWindow = true;

    function getIdHistogram() {
        return self.name.replace('histogram', "").replace("D3Area", "");
    }

    this.getWell = getWell;
    function getWell() {
        if (!_well) {
            _well = utils.findWellByHistogram(self.idHistogram || self.wiHistogramCtrl.id);
        }
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
                else self.histogramModel.properties.histogramTitle = well.properties.name + '.' + curve.datasetName;
            }
            saveHistogramNow(function(){
                console.log('change title');
            });
        }
    }

    function getXLabel() {
        if (self.curveModel) {
            return self.curveModel.datasetName + "." + self.curveModel.properties.name;
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
        if (self.histogramModel.properties.idZoneSet) {
            self.zoneSetModel= utils.getModel('zoneset', self.histogramModel.properties.idZoneSet);
            if (self.visHistogram && isFunction(self.visHistogram.setHistogramModel) )
                self.visHistogram.setHistogramModel(self.histogramModel);
            if (self.getZoneCtrl()) zoneCtrl.zones = self.zoneSetModel.children;
            //self.zoneArr = self.zoneSetModel.children;
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
    }
    this.refreshHistogram = function() {
        if (self.visHistogram) {
            let activeZones = null;
            if (self.getZoneCtrl()) activeZones = zoneCtrl.getActiveZones();
            console.warn("---", activeZones);
            if ( isFunction(self.visHistogram.setHistogramModel) )
                self.visHistogram.setHistogramModel(self.histogramModel);
            if ( isFunction(self.visHistogram.setZoneSet) ) 
                self.visHistogram.setZoneSet(activeZones);
        }
        if ( isFunction(self.visHistogram.signal) ) 
            self.visHistogram.signal('histogram-update', "refresh");
    }
    this.onZoneCtrlReady = function(zoneCtrl) {
        zoneCtrl.trap('zone-data', function() {
            self.refreshHistogram();
        });
    }
    // this.onRefWindCtrlReady = function(refWindCtrl) {
    //     console.log('RefWindCtrlReady');
    //     refWindCtrl.update(getWell(), 
    //         self.histogramModel.properties.reference_curves, 
    //         self.histogramModel.properties.referenceScale,
    //         self.histogramModel.properties.referenceVertLineNumber,
    //         self.histogramModel.properties.referenceTopDepth,
    //         self.histogramModel.properties.referenceBottomDepth);
    // }
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
        self.createVisualizeHistogram(self.histogramModel, domElem);
    }
    this.$onInit = function() {
        self.histogramAreaId = self.name + 'HistogramArea';
        self.histogramModel = self.getModel();
        if (self.name) {
            wiComponentService.putComponent(self.name, self);
            wiComponentService.emit(self.name);
        }
    };

/*
    this.toggleShowWiZone = function () {
        self.isShowWiZone = !self.isShowWiZone;
    }
    this.CloseZone = function () {
        self.isShowWiZone = false;
    }

    this.CloseReferenceWindow = function () {
        self.histogramModel.properties.referenceDisplay = false;
    }
*/

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
                if (self.getZoneCtrl()) zoneCtrl.zoneUpdate();
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
                    saveHistogramNow(function() {
                        self.getWiRefWindCtrl().update(getWell(), 
                            self.histogramModel.properties.reference_curves, 
                            self.histogramModel.properties.referenceScale,
                            self.histogramModel.properties.referenceVertLineNumber,
                            self.histogramModel.properties.referenceTopDepth,
                            self.histogramModel.properties.referenceBottomDepth,
                            self.histogramModel.properties.referenceShowDepthGrid);
                    });
                });
            }
        },{
            name: "FlipHorizontalAxis",
            label: "Flip Horizontal Axis",
            "isCheckType": "true",
            checked: self.histogramModel ? self.histogramModel.properties.flipHorizontal : false,
            handler: function (index) {
                self.histogramModel.properties.flipHorizontal = !self.histogramModel.properties.flipHorizontal;
                self.contextMenu[index].checked = self.histogramModel.properties.flipHorizontal;
                self.visHistogram.signal('histogram-update', 'flip horizontally');
                saveHistogram();
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
            label: "Show Reference Window",
            "isCheckType": "true",
            checked: self.histogramModel ? self.histogramModel.properties.referenceDisplay : false,
            handler: function (index) {
                self.histogramModel.properties.referenceDisplay = !self.histogramModel.properties.referenceDisplay;
                self.contextMenu[index].checked = self.histogramModel.properties.referenceDisplay;
            }
        },{
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
                self.histogramModel.properties.showTooltip = !(self.histogramModel.properties.showTooltip || false);
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
            loadStatistics();
        });

        if(self.visHistogram.discriminator){
            utils.evaluateExpr(getWell(), self.visHistogram.discriminator, function(result){
                console.log(result);
                self.visHistogram.discriminatorArr = result;
                console.log('createVisualizeHistogram');
                if (self.visHistogram.idCurve) {
                    loadCurve(self.visHistogram.idCurve);
                }
            });            
        }else{
            if (self.visHistogram.idCurve) {
                loadCurve(self.visHistogram.idCurve);
            }
        }

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
        if (self.wiHistogramCtrl) {
            $timeout(function () {
                self.wiHistogramCtrl.loadStatistics(self.visHistogram);
                /*
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
                */
            });
        }
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
        idHistogram: '<'
    }
});
app.filter('toFixed2', function() {
    return function(item) {
        return item.toFixed(2);
    }
});
exports.name = moduleName;
