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
        wiD3AbstractTrack.prototype.$onInit.call(this);
        this.plotAreaId = this.name + 'plotArea'; 
    }

    this.onReady = function() {
        this.viTrack = createVisualizeCorrelationTrack(this.getProperties());
        this.getProperties().controller = this;
        this.registerTrackCallback();
        this.registerTrackHorizontalResizerDragCallback();
        this.registerTrackMouseEventHandlers();
        // if (this.wiD3Ctrl) {
        //     this.wiD3Ctrl.trackComponents.push(self.getProperties()); 
        // }
        if (this.leftTrack && this.leftTrack.controller) {
            this.viTrack.left = {
                well: this.leftTrack.controller.getWellProps()
            }
        }
        if (this.rightTrack && this.rightTrack.controller) {
            this.viTrack.right = {
                well: this.rightTrack.controller.getWellProps()
            }
            this.rightTrack.controller.correlationTrack = this;
        }
        this.viTrack.doPlot();
    }

    this.$doCheck = function() {
        wiD3AbstractTrack.prototype.$doCheck.call(self);
        if(this.leftTrack && this.viTrack)
            if(this.leftTrack.controller) {
                if(this.leftTrack.controller.getWellProps().idWell != this.viTrack.left.well.idWell) {
                    this.viTrack.left.well = this.leftTrack.controller.getWellProps();
                    this.viTrack.doPlot();
                }
            }
    }

    function createVisualizeCorrelationTrack(config) {
        return graph.createCorrelationTrack(config, document.getElementById(self.plotAreaId));   
    }

    this.$onDestroy = function() {
        this.viTrack.destroy();
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
        maxY: '<',
        leftTrack: '<',
        rightTrack: '<'
    }
});
exports.name = moduleName;
