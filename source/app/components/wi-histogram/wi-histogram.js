const componentName = 'wiHistogram';
const moduleName = 'wi-histogram';

function Controller($scope, wiComponentService, wiApiService, ModalService, $timeout) {
    let self = this;
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

        self.histogramModel = self.getHistogramModel();
        console.log('histogramModel: ', self.histogramModel);
    };
    this.getwiD3Ctrl = function() {
        return wiComponentService.getComponent(self.wiD3AreaName);
    }

    this.getHistogramModel = function(){
        return utils.findHistogramModelById(self.id);
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
