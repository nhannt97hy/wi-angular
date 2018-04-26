const componentName = 'wiD3DepthTrack';
const moduleName = 'wi-d3-depth-track';
const componentAlias = 'wiD3Track';

let wiD3AbstractTrack = require('./wi-d3-abstract-track.js');
Controller.prototype = Object.create(wiD3AbstractTrack.prototype);
Controller.prototype.constructor = Controller;

function Controller ($scope, wiComponentService, wiApiService, ModalService, $element) {
    wiD3AbstractTrack.call(this, wiApiService, wiComponentService);
    let self = this;
    let graph = wiComponentService.getComponent(wiComponentService.GRAPH);
    let Utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let props = null;
    this.plotAreaId = null;
    let contextMenu = [{
        name: "TrackProperties",
        label: "Track Properties",
        icon: 'track-properties-16x16',
        handler: function() {
            self.openPropertiesDialog()
        }
    }]
    /*
    this.showContextMenu = function (event) {
        let items = self.wiD3Ctrl.getCommonContextMenuItems();
        self.wiD3Ctrl.setContextMenu(self.wiD3Ctrl.buildContextMenu(items));
    }
    */
    this.getContextMenu = function () {
        return _(contextMenu).concat(self.wiD3Ctrl.contextMenu).value();  
    }
    
    this.openPropertiesDialog = function () {
        DialogUtils.depthTrackPropertiesDialog(ModalService, self.viTrack, function (props) {
            if (props) {
                console.log('depthTrackPropertiesData', props);
            }
        });
    }

    /* creational method */
    this.$onInit = function () {
        wiD3AbstractTrack.prototype.$onInit.call(self);
        self.plotAreaId = self.name + 'PlotArea';

        // subcribe with wiComponentService
        // if(self.name) {
        //     wiComponentService.putComponent(self.name, self);
        //     wiComponentService.emit(self.name);
        // }
    }
    this.onReady = function () {
        self.viTrack = createVisualizeDepthTrack(self.getProperties());
        self.registerTrackCallback();
        self.registerTrackHorizontalResizerDragCallback();
        self.viTrack.on('keydown', self.onTrackKeyPressCallback);
        self.registerTrackMouseEventHandlers();
        self.getProperties().controller = self;
        if(self.wiD3Ctrl) self.wiD3Ctrl.registerTrackDragCallback(self);
    }

    this.$doCheck = function() {
        wiD3AbstractTrack.prototype.$doCheck.call(self);
    }
    this.$onDestroy = function () {
        // wiComponentService.putComponent(self.name, null);
    }

    /* Private End*/
    /*
    function getProperties() {
        if(!props) {
            props = self.wiD3Ctrl.trackComponents.find(function(track) { return track.name == self.name}).props;
        }
        return props;
    }
    */
    function createVisualizeDepthTrack(depthTrack) {
        let config = {
            id: depthTrack.idDepthAxis,
            idPlot: depthTrack.idPlot,
            name: depthTrack.title,
            orderNum: depthTrack.orderNum,
            yStep: parseFloat(self.wiD3Ctrl.getWellProps().step),
            offsetY: parseFloat(self.wiD3Ctrl.getWellProps().topDepth),
            showTitle: depthTrack.showTitle,
            justification: depthTrack.justification,
            width: Utils.inchToPixel(depthTrack.width),
            depthType: depthTrack.depthType,
            unit: depthTrack.unitType,
            bgColor: depthTrack.trackBackground,
            decimal: depthTrack.decimals
        };
        console.log("config", config);
        let track = graph.createDepthTrack(config, document.getElementById(self.plotAreaId));
        return track;
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
