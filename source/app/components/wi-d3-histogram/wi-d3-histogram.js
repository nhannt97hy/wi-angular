const componentName = 'wiD3Histogram';
const moduleName = 'wi-d3-histogram';

function Controller($scope, wiComponentService, $timeout, ModalService, wiApiService) {
    let self = this;
    this.visHistogram = null;
    let graph = wiComponentService.getComponent('GRAPH');
    self.histogramModel = null;
    self.curveModel = null;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);

    function getIdHistogram() {
        return self.name.replace('histogram', "").replace("D3Area", "");
    }

    function getHistogramTitle() {
        let well = utils.findWellByHistogram(self.wiHistogramCtrl.id);
        if (!self.histogramModel.properties.idCurve) return "Empty";
        let curve = utils.getCurveFromId(self.histogramModel.properties.idCurve);
        let datasetId = curve.properties.idDataset;
        for (let dataset of well.children) {
            if(dataset.type == 'dataset' && dataset.id == datasetId) {
                return well.properties.name + "." + dataset.properties.name;
            }
        }
        return "Empty";
    }
    function linkModels() {
        if (self.histogramModel.properties.idCurve) 
            self.curveModel = utils.getCurveFromId(self.histogramModel.properties.idCurve);
        if (self.histogramModel.properties.idZoneSet) 
            self.zoneSetModel = utils.getModel('zoneset', self.histogramModel.properties.idZoneSet);
    }

    this.onReady = function() {
        self.createVisualizeHistogram(self.histogramModel);
    }
    this.$onInit = function () {
        self.histogramAreaId = self.name + 'HistogramArea';
        self.histogramModel = self.wiHistogramCtrl.getHistogramModel();
        self.histogramModel.properties.histogramTitle = getHistogramTitle();
        linkModels();

        if (self.name) {
            wiComponentService.putComponent(self.name, self);
            wiComponentService.emit(self.name);
        }
    };

    

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
                DialogUtils.histogramFormatDialog(ModalService, self.wiHistogramCtrl, function (ret) {
                    console.log(ret);
                })
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
            checked: self.histogramModel ? (self.histogramModel.properties.plotType == "Percentile") : false,
            handler: function (index) {
                if (self.histogramModel.properties.plotType == "Frequency")
                    self.histogramModel.properties.plotType = "Percentile";
                else self.histogramModel.properties.plotType = "Frequency";
                self.contextMenu[index].checked = self.histogramModel ? (self.histogramModel.properties.plotType == "Percentile") : false;
            }
        }, {
            name: "ShowReferenceWindow",
            label: "Show/Hide Reference Window",
            handler: function () {
    
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
                DialogUtils.histogramFrequencyInfoDialog(ModalService, function(){
                    console.log('Frequency Info!!!!!');
                })
            }
        }];
        event.stopPropagation();
        wiComponentService.getComponent('ContextMenu')
            .open(event.clientX, event.clientY, self.contextMenu);
    }

    function buildConfigFromHistogramModel(histogramModel, callback) {
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
            plot: histogramModel.properties.plot,
            plotType: histogramModel.properties.plotType,
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

    this.createVisualizeHistogram = function(histogram) {
        var elem = document.getElementById(self.histogramAreaId);
        console.log('createHistogram:' , self.histogramAreaId, elem);
        config = buildConfigFromHistogramModel(histogram);
        self.visHistogram = graph.createHistogram(config, elem);
        if (histogram.properties.idCurve) loadCurve(histogram);
    }
    function loadCurve(histogramModel) {
        wiApiService.dataCurve(histogramModel.properties.idCurve, function(data) {
            if(self.visHistogram) self.visHistogram.setCurve(data);
        });
    }
    this.addCurve = function(curveId, histogram) {
        histogram.properties.idCurve = idCurve;
        loadCurve(histogram);
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
