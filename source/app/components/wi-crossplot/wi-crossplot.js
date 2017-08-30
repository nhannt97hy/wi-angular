const componentName = 'wiCrossplot';
const moduleName = 'wi-crossplot';

function Controller($scope, wiComponentService, wiApiService, ModalService, $timeout) {
    let self = this;
    
    // this.$onInit = function () {
    //     self.slidingbarName = self.name + 'Slidingbar';
    //     self.wiD3AreaName = self.name + 'D3Area';
    //     self.isFitWindow = false;
    //     self.isReferenceLine = true;
    //     self.isTooltip = true;
    //     self.logplotModel = self.getLogplotModel();
    //     self.wellName = self.logplotModel ? utils.getModel('well', self.logplotModel.properties.idWell).properties.name : 'Well';

    //     // Setup handlers for logplot
    //     $scope.handlers = {};
    //     utils.bindFunctions($scope.handlers, logplotHandlers, {
    //         $scope: $scope,
    //         wiComponentService: wiComponentService,
    //         wiApiService: wiApiService,
    //         ModalService: ModalService,
    //         $timeout: $timeout,
    //         wiLogplot: self
    //     });
    //     self.handlers = $scope.handlers;

    //     if (self.name) wiComponentService.putComponent(self.name, self);
    // };
    this.$onInit = function () {
        var globalHandlers = wiComponentService.getComponent(wiComponentService.GLOBAL_HANDLERS);
        $scope.handlers = globalHandlers;
        if (self.name) wiComponentService.putComponent(self.name, self);
    };
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
