const componentName = 'wiD3Crossplot';
const moduleName = 'wi-d3-crossplot';

function Controller($scope, wiComponentService, $timeout, ModalService, wiApiService) {
    let self = this;
    let graph = wiComponentService.getComponent('GRAPH');
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let viCrossplot;

    this.$onInit = function () {
        self.crossplotAreaId = self.name + 'CrossplotArea';

        if (self.name) {
            wiComponentService.putComponent(self.name, self);
            wiComponentService.emit(self.name);
        }
        console.log(self.crossplotAreaId)
        $timeout(createVisualizeCrossplot);
    };

    this.contextMenu = [
        {
            name: "Refresh",
            label: "Refresh",
            icon: "reload-16x16",
            handler: function () {
            }
        }, {
            name: "Properties",
            label: "Properties",
            icon: "properties2-16x16",
            handler: function () {
                DialogUtils.crossplotFormatDialog(ModalService, self.wiCrossplotCtrl, function() {
                    console.log("crossplotFormatDialog");
                })
            }
        }, {
            name: "ShowOverlay",
            label: "Show Overlay",
            icon: "",
            handler: function () {

            }
        }, {
            name: "ShowReferenceZone",
            label: "Show Reference Zone",
            icon: "",
            handler: function () {

            }
        }, {
            name: "ShowReferenceWindow",
            label: "Show Reference Window",
            icon: "logplot-blank-16x16",
            handler: function () {

            }
        }, {
            name: "ShowTooltip",
            label: "Show Tooltip",
            icon: "",
            handler: function () {

            }
        }, {
            name: "ShowHistogram",
            label: "Show Histogram",
            icon: "",
            handler: function () {

            }
        }, {
            name: "Function",
            label: "Function",
            icon: "",
            handler: function () {

            }
        }
    ];

    this.showContextMenu = function (event) {
        if (event.button != 2) return;
        event.stopPropagation();
        wiComponentService.getComponent('ContextMenu')
            .open(event.clientX, event.clientY, self.contextMenu);
    }

    function createVisualizeCrossplot() {

        function genSamples(extentX, extentY) {
            let samples = [];
            let transform = d3.scaleLinear().domain([0,1]).range(extentX);

            for (let i = extentY[0]; i <= extentY[1]; i++) {
                samples.push({y: i, x: transform(Math.random())});
            }
            return samples;
        }

        let xData = genSamples([0,10], [0,1000]);
        let yData = genSamples([0,5], [0,1000]);
        let xCurve = graph.buildCurve({}, xData);
        let yCurve = graph.buildCurve({}, yData);
        let domElem = document.getElementById(self.crossplotAreaId);
        viCrossplot = graph.createCrossplot(xCurve, yCurve, {}, domElem);
    }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-d3-crossplot.html',
    controller: Controller,
    controllerAs: componentName,
    transclude: true,
    bindings: {
        name: '@',
        wiCrossplotCtrl: '<'
    }
});

exports.name = moduleName;
