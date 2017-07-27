const componentName = 'wiLogplot';
const moduleName = 'wi-logplot';

function Controller($scope, wiComponentService, ModalService, $timeout) {
    let self = this;
    let previousSlidingBarState = {};
    let utils = wiComponentService.getComponent('UTILS');
    let logplotHandlers = wiComponentService.getComponent('LOGPLOT_HANDLERS');

    this.$onInit = function () {
        self.slidingbarName = self.name + 'Slidingbar';
        self.wiD3AreaName = self.name + 'D3Area';
        self.isFitWindow = false;
        self.isReferenceLine = true;
        self.isTooltip = true;

        // Setup handlers for logplot
        $scope.handlers = {};
        utils.bindFunctions($scope.handlers, logplotHandlers, {
            $scope: $scope,
            wiComponentService: wiComponentService,
            ModalService: ModalService,
            wiLogplot: self
        });

        wiComponentService.on(wiComponentService.UPDATE_TRACKS_EVENT, function (logplotModel) {
            let wiD3Controller = self.getwiD3Ctrl();
            if (logplotModel.tracks && logplotModel.tracks.length) {
                logplotModel.tracks.forEach(function(track) {
                    if (track.type == 'log') {
                        $timeout(function(){
                            wiD3Controller.pushLogTrack(track);
                            // wiD3Controller.pushLogTrack();
                        });
                    }
                    if (track.type == 'depth') {
                        $timeout(function(){
                            wiD3Controller.pushDepthTrack(track);
                            // wiD3Controller.pushDepthTrack();
                        });
                    }
                });
            }
        });
        if (self.name) wiComponentService.putComponent(self.name, self);
    };

    this.$doCheck = function () {
        if (!self.slidingBar) return;
        if (!utils.isEqual(previousSlidingBarState, self.slidingBar.slidingBarState)) {
            utils.objcpy(previousSlidingBarState, self.slidingBar.slidingBarState);
            let wiD3Controller = self.getwiD3Ctrl();
            let max = wiD3Controller.getMaxDepth();
            let low = max * previousSlidingBarState.top / 100;
            let high = max * ( previousSlidingBarState.top + previousSlidingBarState.range ) / 100;
            wiD3Controller.setDepthRange([low, high]);
            // wiD3Controller.plotAll();
        }
    };

    this.getLogplotModel = function () {
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
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
