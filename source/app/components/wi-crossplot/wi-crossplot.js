const componentName = 'wiCrossplot';
const moduleName = 'wi-crossplot';

function Controller($scope, wiComponentService, wiApiService, ModalService, $timeout) {
    let self = this;
    this.isShowWiZone = false;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let _wiD3CrossplotCtrl = null;
    let refWindCtrl = null;
    this.$onInit = function () {
        if (self.name) wiComponentService.putComponent(self.name, self);
        self.wiD3CrossplotName = self.name + 'D3Area';
        if (self.showToolbar == undefined || self.showToolbar == null) self.showToolbar = true;
        const crossplotHandlers = wiComponentService.getComponent(wiComponentService.CROSSPLOT_HANDLERS);
        $scope.handlers = {};
        utils.bindFunctions($scope.handlers, crossplotHandlers, {
            $scope: $scope,
            wiComponentService: wiComponentService,
            wiApiService: wiApiService,
            ModalService: ModalService,
            $timeout: $timeout,
            wiCrossplot: self
        });
        self.handlers = $scope.handlers;
        // self.curvesProperties = [{ 'x': 1, 'y': 2, options: {} }, { 'x': 2, 'y': 1, options: {} }];
        self.curvesProperties = [];
        self.config = {
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
            },
            isShowWiZone: false,
            referenceDisplay: false
        };
        //self.crossplotModel = utils.getModel('crossplot', self.id);
    };
    this.CloseZone = function () {
        let wiD3CrossplotCtrl = self.getWiD3CrossplotCtrl();
        if (!wiD3CrossplotCtrl) return;
        wiD3CrossplotCtrl.switchReferenceZone(false);
    }

    this.getWiZoneCtrlName = function () {
        return self.name + "Zone";
    }
    this.getWiZoneCtrl = function () {
        return wiComponentService.getComponent(self.getWiZoneCtrlName());
    }

    this.onZoneCtrlReady = function(zoneCtrl) {
        zoneCtrl.trap('zone-data', function(data) {
            console.log("zone data", data);
            let wiD3CrossplotCtrl = self.getWiD3CrossplotCtrl();
            if (wiD3CrossplotCtrl) {
                wiD3CrossplotCtrl.updateViCrossplotZones(data);
            }
        });
    }
    let _well = null;
    this.getWell = getWell;
    function getWell() {
        if (!_well) {
            _well = utils.findWellByCrossplot(self.id);
        }
        return _well;
    }

    this.onRefWindCtrlReady = function(refWindCtrl) {
        let wiD3CrossplotCtrl = self.getWiD3CrossplotCtrl();
        console.log('Reference window is ready to update', wiD3CrossplotCtrl);
        if (!wiD3CrossplotCtrl || !wiD3CrossplotCtrl.crossplotModel 
            || !wiD3CrossplotCtrl.crossplotModel.properties
            || !wiD3CrossplotCtrl.crossplotModel.properties.reference_curves) return;
        console.log('start update reference window ', wiD3CrossplotCtrl);
        // refWindCtrl.update(
        //     getWell(),
        //     wiD3CrossplotCtrl.crossplotModel.properties.reference_curves,
        //     wiD3CrossplotCtrl.crossplotModel.properties.referenceScale,
        //     wiD3CrossplotCtrl.crossplotModel.properties.referenceVertLineNumber,
        //     wiD3CrossplotCtrl.crossplotModel.properties.referenceTopDepth,
        //     wiD3CrossplotCtrl.crossplotModel.properties.referenceBottomDepth,
        //     wiD3CrossplotCtrl.crossplotModel.properties.referenceShowDepthGrid);
    }

    this.zoneArr = null; // important. This will be set in wi-d3-crossplot. TUNG

    this.getWiD3CrossplotCtrl = function () {
        if (!_wiD3CrossplotCtrl) {
            _wiD3CrossplotCtrl = wiComponentService.getComponent(self.wiD3CrossplotName);
        }
        return _wiD3CrossplotCtrl;
    }
    this.getWiRefWindCtrlName = function () {
        return self.name + "RefWind";
    }

    this.getWiRefWindCtrl = function () {
        if (!refWindCtrl) refWindCtrl =  wiComponentService.getComponent(self.getWiRefWindCtrlName());
        return refWindCtrl;
    }
    this.CloseReferenceWindow = function () {
        let wiD3CrossplotCtrl = self.getWiD3CrossplotCtrl();
        if (!wiD3CrossplotCtrl) return;
        wiD3CrossplotCtrl.switchReferenceWindow(false);
    }

    this.$onDestroy = function() {
        wiComponentService.dropComponent(self.name);
        wiComponentService.dropComponent(self.wiD3CrossplotName);
    }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-crossplot.html',
    controller: Controller,
    controllerAs: componentName,
    transclude: true,
    bindings: {
        name: '@',
        id: '@',
        showToolbar: '<',
        containerName: '@'
    }
});

exports.name = moduleName;
