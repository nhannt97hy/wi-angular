const componentName = 'wiCrossplot';
const moduleName = 'wi-crossplot';

function Controller($scope, wiComponentService, wiApiService, ModalService, $timeout) {
    let self = this;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    
    this.$onInit = function () {
        if (self.name) wiComponentService.putComponent(self.name, self);        
        self.wiD3CrossplotAreaName = self.name + 'D3Area';
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
    };

    this.getWiD3CrossplotCtrl = function () {
        return wiComponentService.getComponent(self.wiD3CrossplotAreaName);
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
