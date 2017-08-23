const componentName = 'wiLogplot';
const moduleName = 'wi-logplot';

function Controller($scope, wiComponentService, wiApiService, ModalService, $timeout) {
    let self = this;
    let previousSlidingBarState = {};
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let logplotHandlers = wiComponentService.getComponent('LOGPLOT_HANDLERS');

    this.$onInit = function () {
        self.slidingbarName = self.name + 'Slidingbar';
        self.wiD3AreaName = self.name + 'D3Area';
        self.isFitWindow = false;
        self.isReferenceLine = true;
        self.isTooltip = true;
        self.logplotModel = self.getLogplotModel();
        self.wellName = self.logplotModel ? utils.getModel('well', self.logplotModel.properties.idWell).properties.name : 'Well';

        // Setup handlers for logplot
        $scope.handlers = {};
        utils.bindFunctions($scope.handlers, logplotHandlers, {
            $scope: $scope,
            wiComponentService: wiComponentService,
            wiApiService: wiApiService,
            ModalService: ModalService,
            $timeout: $timeout,
            wiLogplot: self
        });
        self.handlers = $scope.handlers;

        if (self.name) wiComponentService.putComponent(self.name, self);
    };

    this.$doCheck = function () {
        if (!self.slidingBar) return;
        if (!utils.isEqual(previousSlidingBarState, self.slidingBar.slidingBarState)) {
            utils.objcpy(previousSlidingBarState, self.slidingBar.slidingBarState);
            let wiD3Controller = self.getwiD3Ctrl();
            let max = wiD3Controller.getMaxDepth();
            let min = wiD3Controller.getMinDepth();
            let low = min + (max - min) * previousSlidingBarState.top / 100;
            let high = low + (max - min) * previousSlidingBarState.range / 100;
            wiD3Controller.setDepthRange([low, high]);
            // wiD3Controller.plotAll();
        }
    };

    this.getLogplotModel = function () {
        return utils.findLogplotModelById(self.id);
    };

    this.getSlidingbarCtrl = function () {
        return self.slidingBar = wiComponentService.getComponent(self.slidingbarName);
    };

    this.getwiD3Ctrl = function () {
        return wiComponentService.getComponent(self.wiD3AreaName);
    };
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-logplot.html',
    controller: Controller,
    controllerAs: componentName,
    transclude: true,
    bindings: {
        name: '@',
        id: '@'
    }
});

exports.name = moduleName;
