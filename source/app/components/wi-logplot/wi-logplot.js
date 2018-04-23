const componentName = 'wiLogplot';
const moduleName = 'wi-logplot';

let EventManager = require('./event-manager.js');
Controller.prototype = Object.create(EventManager.prototype);
Controller.prototype.constructor = Controller;

function Controller($scope, wiComponentService, wiApiService, ModalService, $timeout) {
    EventManager.call(this);
    let self = this;
    let previousSlidingBarState = {};
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let logplotHandlers = wiComponentService.getComponent('LOGPLOT_HANDLERS');
    this.cropDisplay = false;

    this.$onInit = async function () {
        self.slidingbarName = self.name + 'Slidingbar';
        self.wiD3AreaName = self.name + 'D3Area';
        self.isFitWindow = false;
        self.isReferenceLine = true;
        self.isTooltip = true;
        self.logplotModel = await self.getLogplotModelAsync();
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

    this.updateScale = function (scale) {
        this.currentView = scale.currentView;
        this.displayView = scale.displayView;
        this.getSlidingbarCtrl().updateScale(scale);
    }

    this.getLogplotModelAsync = function () {
        return utils.findLogplotModelByIdAsync(self.id);
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
