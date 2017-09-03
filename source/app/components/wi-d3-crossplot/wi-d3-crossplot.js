const componentName = 'wiD3Crossplot';
const moduleName = 'wi-d3-crossplot';

function Controller($scope, wiComponentService, $timeout, ModalService, wiApiService) {
    let self = this;
    let graph = wiComponentService.getComponent('GRAPH');
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let viCrossplot;

    this.$onInit = function () {
        self.crossplotAreaId = self.name.replace('D3Area', '');
        if (self.name) {
            wiComponentService.putComponent(self.name, self);
            wiComponentService.emit(self.name);
        }
        console.log(self.crossplotAreaId)
    };
    function PropertyGridButtonClicked() {
        console.log('PropertyGridButton is clicked');
        let layoutManager = wiComponentService.getComponent('LAYOUT_MANAGER');

            layoutManager.putComponentRight('property-block', 'Reference Window');
    }
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
                PropertyGridButtonClicked();
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

    this.createVisualizeCrossplot = function (xCurveData, yCurveData, config) {
        if (!config) config = {};
        let xCurve = graph.buildCurve({}, xCurveData);
        let yCurve = graph.buildCurve({}, yCurveData);
        let domElem = document.getElementById(self.crossplotAreaId);
        viCrossplot = graph.createCrossplot(xCurve, yCurve, config, domElem);
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
