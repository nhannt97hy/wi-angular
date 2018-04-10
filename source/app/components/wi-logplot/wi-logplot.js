const componentName = 'wiLogplot';
const moduleName = 'wi-logplot';

function Controller($scope, wiComponentService, wiApiService, ModalService, $timeout, $element) {
    let self = this;
    let previousSlidingBarState = {};
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let logplotHandlers = wiComponentService.getComponent('LOGPLOT_HANDLERS');
    this.cropDisplay = false;

    this.$onInit = function () {
        self.slidingbarName = self.name + 'Slidingbar';
        self.wiD3AreaName = self.name + 'D3Area';
        self.isFitWindow = false;
        self.isReferenceLine = true;
        self.isTooltip = true;
        self.logplotModel = self.getLogplotModel();
        self.wellModel = utils.getModel('well', self.logplotModel.properties.idWell);
        if (self.showToolbar == undefined || self.showToolbar == null) self.showToolbar = true;
        if (self.containerName == undefined || self.containerName == null) self.containerName = '';

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

    this.onFooterReady = function() {
        // let parentSelector = d3.select($element[0]);
        // let footerDOM = parentSelector.select('.logplot-footer').node();
        // $(footerDOM).draggable();
        // $(footerDOM).on('dragstop', function() {
        //     self.showFooter = !self.showFooter;
        // });
    }

    this.$doCheck = function () {
        // if (!self.slidingBar) return;
        // if (!utils.isEqual(previousSlidingBarState, self.slidingBar.slidingBarState)) {
        //     utils.objcpy(previousSlidingBarState, self.slidingBar.slidingBarState);
        //     let wiD3Controller = self.getwiD3Ctrl();
        //     let max = wiD3Controller.getMaxDepth();
        //     let min = wiD3Controller.getMinDepth();
        //     let low = min + (max - min) * previousSlidingBarState.top / 100;
        //     let high = low + (max - min) * previousSlidingBarState.range / 100;
        //     wiD3Controller.setDepthRange([low, high]);
        //     // wiD3Controller.plotAll();
        // }
    };
    this.updateScale = function (scale) {
        this.currentView = scale.currentView;
        this.displayView = scale.displayView;
        this.getSlidingbarCtrl().updateScale(scale);
    }

    this.getLogplotModel = function () {
        return utils.findLogplotModelById(self.id);
    };

    this.getSlidingbarCtrl = function () {
        return self.slidingBar = wiComponentService.getComponent(self.slidingbarName);
    };

    this.getwiD3Ctrl = function () {
        return wiComponentService.getComponent(self.wiD3AreaName);
    };

    this.$onDestroy = function() {
        wiComponentService.dropComponent(self.name);
    }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-logplot.html',
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
