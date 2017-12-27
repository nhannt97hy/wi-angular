const componentName = 'wiCrossplot';
const moduleName = 'wi-crossplot';

function Controller($scope, wiComponentService, wiApiService, ModalService, $timeout) {
    let self = this;
    this.isShowWiZone = true;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    
    let refWindCtrl = null;
    this.$onInit = function () {
        if (self.name) wiComponentService.putComponent(self.name, self);        
        self.wiD3CrossplotName = self.name + 'D3Area';
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
        self.crossplotModel = utils.getModel('crossplot', self.id);
    };
    this.CloseZone = function () {
        self.isShowWiZone = false;
        //utils.triggerWindowResize();
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

    this.zoneArr = null; // important. This will be set in wi-d3-crossplot. TUNG

    this.getWiD3CrossplotCtrl = function () {
        return wiComponentService.getComponent(self.wiD3CrossplotName);
    }
    this.getWiRefWindCtrlName = function () {
        return self.name + "RefWind";
    }

    this.getWiRefWindCtrl = function () {
        if (!refWindCtrl) refWindCtrl =  wiComponentService.getComponent(self.getWiRefWindCtrlName());
        return refWindCtrl;
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
        id: '@'
    }
});

exports.name = moduleName;
