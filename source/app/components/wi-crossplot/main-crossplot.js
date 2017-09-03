let wiButton = require('./wi-button.js');
let wiToolbar = require('./wi-toolbar.js');
let wiSlidingbar = require('./wi-slidingbar.js');
let wiContextMenu = require('./wi-context-menu.js');
let wiDropdown = require('./wi-dropdown');

let graph = require('./visualize/visualize.js');
let wiD3Crossplot = require('./wi-d3-crossplot');
let wiCrossplot = require('./wi-crossplot');
let wiExplorer = require('./wi-explorer');
let wiProperties = require('./wi-properties');
let wiElementReadyDirective = require('./wi-element-ready');

let wiRightClick = require('./wi-right-click');

let wiComponentService = require('./wi-component-service');
let wiApiService = require('./wi-api-service');
let wiTreeConfig = require('./wi-tree-config.model');
let wiTreeItem = require('./wi-tree-item.model');
let wiWell = require('./wi-well.model');
let wiProperty = require('./wi-property.model');
let wiListview = require('./wi-listview.model');
let wiDataset = require('./wi-dataset.model');
let wiDepth = require('./wi-depth.model');
let wiCurve = require('./wi-curve.model');
let wiLogplotsModel = require('./wi-logplots.model');
let wiLogplotModel = require('./wi-logplot.model');

let utils = require('./utils');

let dragMan = {
    dragging: false,
    draggedObj: null,
    cancelingId: null
};


let app = angular.module('helloapp', [
    wiCrossplot.name,
    wiButton.name,
    wiToolbar.name,
    wiSlidingbar.name,
    wiContextMenu.name,
    wiD3Crossplot.name,
    wiComponentService.name,
    wiElementReadyDirective.name,
    'angularModalService',
    'ngFileUpload',
    wiDropdown.name,
    wiApiService.name,
    wiExplorer.name,
    wiProperties.name,
    wiWell.name,
    wiTreeItem.name,
    wiTreeConfig.name,
    wiProperty.name,
    wiListview.name,
    wiDataset.name,
    wiCurve.name,
    wiDepth.name,
    wiLogplotModel.name,
    wiLogplotsModel.name
]);

app.controller('WiDummy', function ($scope, $timeout, wiComponentService) {
    wiComponentService.putComponent("GRAPH", graph);
    wiComponentService.putComponent("UTILS", utils);
    wiComponentService.putComponent('DRAG_MAN', dragMan);

    let functionBindingProp = {
        wiComponentService
    };
    utils.setGlobalObj(functionBindingProp);

    function genSamples(extentX, extentY) {
        let samples = [];
        let transform = d3.scaleLinear().domain([0,1]).range(extentX);

        for (let i = extentY[0]; i <= extentY[1]; i++) {
            samples.push({y: i, x: transform(Math.random())});
        }
        return samples;
    }

    $timeout(function() {
        let wiCrossplotCtrl = wiComponentService.getComponent('myCrossPlot');
        let wiD3CrossplotCtrl = wiCrossplotCtrl.getWiD3CrossplotCtrl();

        let dataX = genSamples([0,10], [0,1000]);
        let dataY = genSamples([0,5], [0,1000]);
        wiD3CrossplotCtrl.createVisualizeCrossplot(dataX, dataY, {curveZ: graph.buildCurve({}, dataX)});
    });
});
