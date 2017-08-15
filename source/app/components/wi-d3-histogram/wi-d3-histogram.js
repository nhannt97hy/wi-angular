const componentName = 'wiD3Histogram';
const moduleName = 'wi-d3-histogram';

function Controller($scope, wiComponentService, $timeout, ModalService, wiApiService) {
    let self = this;
    let graph = wiComponentService.getComponent('GRAPH');

    this.$onInit = function () {
        self.histogramAreaId = self.name + 'HistogramArea';
        
        if (self.name) {
            wiComponentService.putComponent(self.name, self);
            wiComponentService.emit(self.name);
        }
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
                
            }
        }, {
            name: "FlipHorizontalAxis",
            label: "Flip Horizontal Axis",
            icon: "",
            handler: function () {
                
            }
        }, {
            name: "ShowGrid",
            label: "Show Grid",
            icon: "",
            handler: function () {
                
            }
        }, {
            name: "ShowGaussian",
            label: "Show Gaussian",
            icon: "",
            handler: function () {
                
            }
        }, {
            name: "ShowAxisYAsPercent",
            label: "Show Axis Y as Percent",
            icon: "",
            handler: function () {
                
            }
        }, {
            name: "ShowReferenceWindow",
            label: "Show Reference Window",
            icon: "",
            handler: function () {
                
            }
        }, {
            name: "ShowCumulative",
            label: "Show Cumulative",
            icon: "",
            handler: function () {
                
            }
        }, {
            name: "ShowCumulativeCurve",
            label: "Show Cumulative Curve",
            icon: "",
            handler: function () {
                
            }
        }, {
            name: "ShowTooltip",
            label: "Show Tooltip",
            icon: "",
            handler: function () {
                
            }
        }, {
            name: "FrequencyInfor",
            label: "Frequency Infor",
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
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-d3-histogram.html',
    controller: Controller,
    controllerAs: componentName,
    transclude: true,
    bindings: {
        name: '@',
        wiHistogramCtrl: '<'
    }
});

exports.name = moduleName;
