const componentName = 'wiD3CorrelationTrack';
const moduleName = 'wi-d3-correlation-track';
const componentAlias = 'wiD3Track';

let wiD3AbstractTrack = require('./wi-d3-abstract-track.js');
Controller.prototype = Object.create(wiD3AbstractTrack.prototype);
Controller.prototype.constructor = Controller;

function Controller ($scope, wiComponentService, wiApiService, ModalService, $timeout) {
    wiD3AbstractTrack.call(this, wiApiService, wiComponentService);
    let self = this;
    let Utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let graph = wiComponentService.getComponent(wiComponentService.GRAPH);
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);

    this.$onInit = function() {
        // wiD3AbstractTrack.prototype.$onInit.call(self);
        this.plotAreaId = this.name + 'plotArea'; 
    }
    this.onReady = function() {
        this.viTrack = createVisualizeCorrelationTrack(this.getProperties());
        self.registerTrackCallback();
        self.registerTrackHorizontalResizerDragCallback();
    }

    function createVisualizeCorrelationTrack(config) {
        return graph.createCorrelationTrack(config, document.getElementById(self.plotAreaId));   
    }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: '../wi-d3-track-template.html',
    controller: Controller,
    controllerAs: componentAlias,
    transclude: true,
    bindings: {
        name: '@',
        wiD3Ctrl: '<',
        properties: "<",
        minY: '<',
        maxY: '<'
    }
});
exports.name = moduleName;
