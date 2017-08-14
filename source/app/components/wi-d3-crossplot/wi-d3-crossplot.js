const componentName = 'wiD3Crossplot';
const moduleName = 'wi-d3-crossplot';

function Controller($scope, wiComponentService, $timeout, ModalService, wiApiService) {
    let self = this;
    let graph = wiComponentService.getComponent('GRAPH');

    this.$onInit = function () {
        self.crossplotAreaId = self.name + 'CrossplotArea';
        
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
