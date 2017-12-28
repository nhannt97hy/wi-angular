const componentName = 'wiHistogram';
const moduleName = 'wi-histogram';

function Controller($scope, wiComponentService, wiApiService, ModalService, $timeout) {
    let self = this;
    let _well = null;
    self.histogramModel = null;
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

    this.toggleShowWiZone = function () {
        self.isShowWiZone = !self.isShowWiZone;
    }
    this.CloseZone = function () {
        self.isShowWiZone = false;
    }
    this.CloseReferenceWindow = function () {
        if (self.histogramModel) 
            self.histogramModel.properties.referenceDisplay = false;
    }

    this.getWiZoneCtrlName = function () {
        return self.name + "D3AreaZone";
    }
    this.getWiRefWindCtrlName = function () {
        return self.name + "D3AreaRefWind";
    }

    this.zoneArr = null; // important. This will be set in wi-d3-histogram. TUNG

    $scope.handlers = new Object();
    let histogramHandlers = wiComponentService.getComponent(wiComponentService.HISTOGRAM_HANDLERS);
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    utils.bindFunctions($scope.handlers, histogramHandlers, {
        $scope: $scope,
        wiComponentService: wiComponentService,
        wiApiService: wiApiService,
        ModalService: ModalService,
        $timeout: $timeout,
        wiHistogram: self
    });
    this.$onInit = function () {
        self.wiD3AreaName = self.name + "D3Area";
        if (self.name) wiComponentService.putComponent(self.name, self);

        self.histogramModel = self.getModel();
        self.isShowWiZone = self.histogramModel ? !!self.histogramModel.properties.idZoneSet: false;
        
    };
    this.getwiD3Ctrl = function() {
        return wiComponentService.getComponent(self.wiD3AreaName);
    }

    this.getModel = function() {
        return utils.findHistogramModelById(self.id);
    }

    this.loadStatistics = function(visHistogram) {
        self.statistics.length = visHistogram.getLength();
        self.statistics.min = visHistogram.getMin();
        self.statistics.max = visHistogram.getMax();
        self.statistics.avg = visHistogram.getAverage();
        self.statistics.avg_dev = visHistogram.getAverageDeviation();
        self.statistics.std_dev = visHistogram.getStandardDeviation();
        self.statistics.var = visHistogram.getVariance();
        self.statistics.skew = visHistogram.getSkewness();
        self.statistics.kur = visHistogram.getKurtosis();
        self.statistics.med = visHistogram.getMedian();
        self.statistics.p10 = visHistogram.getPercentile(0.1);
        self.statistics.p50 = visHistogram.getPercentile(0.5);
        self.statistics.p90 = visHistogram.getPercentile(0.9);
    }

    this.onZoneCtrlReady = function(zoneCtrl) {
        zoneCtrl.trap('zone-data', function() {
            let wiD3Ctrl = self.getwiD3Ctrl();
            if (wiD3Ctrl) wiD3Ctrl.refreshHistogram();
        });
    }
    this.onRefWindCtrlReady = function(refWindCtrl) {
        console.log('RefWindCtrlReady');
        refWindCtrl.update(getWell(), 
            self.histogramModel.properties.reference_curves, 
            self.histogramModel.properties.referenceScale,
            self.histogramModel.properties.referenceVertLineNumber,
            self.histogramModel.properties.referenceTopDepth,
            self.histogramModel.properties.referenceBottomDepth,
            self.histogramModel.properties.referenceShowDepthGrid);
            //true);
    }
    this.getWell = getWell;
    function getWell() {
        if (!_well) {
            _well = utils.findWellByHistogram(self.id);
        }
        return _well;
    }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-histogram.html',
    controller: Controller,
    controllerAs: componentName,
    transclude: true,
    bindings: {
        name: '@',
        id: '@'
    }
});

exports.name = moduleName;
