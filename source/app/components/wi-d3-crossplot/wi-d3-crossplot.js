const componentName = 'wiD3Crossplot';
const moduleName = 'wi-d3-crossplot';

function Controller($scope, wiComponentService, $timeout, ModalService, wiApiService) {
    let self = this;
    let graph = wiComponentService.getComponent('GRAPH');
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let viCrossplot;
    this.isShowWiZone = true;
    this.isShowReferenceWindow = true;
    
    this.$onInit = function () {
        self.crossplotAreaId = self.name.replace('D3Area', '');
        if (self.name) {
            wiComponentService.putComponent(self.name, self);
            wiComponentService.emit(self.name);
        }
    };
    this.toggleShowWiZone = function () {
        self.isShowWiZone = !self.isShowWiZone;
    }

    this.CloseZone = function(){
        self.isShowWiZone = false;
    }

    this.toogleShowReferenceWindow = function () {
        self.isShowReferenceWindow = !self.isShowReferenceWindow;
    }

    this.CloseReferenceWindow = function(){
        self.isShowReferenceWindow = false;
    }
    function PropertyGridButtonClicked() {
        console.log('PropertyGridButton is clicked');
        let layoutManager = wiComponentService.getComponent('LAYOUT_MANAGER');

        layoutManager.putComponentRight('property-block', 'Reference Window');
    }
    this.propertiesDialog = function () {
        DialogUtils.crossplotFormatDialog(ModalService, self.wiCrossplotCtrl, viCrossplot, function () {
            console.log("crossplotFormatDialog");
        })
    }
    let commonCtxMenu = [
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
                self.propertiesDialog();
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
            childContextMenu: [

            ],
            handler: function () {

            }
        }
    ];
    this.contextMenu = commonCtxMenu;
    this.setContextMenu = function (contextMenu) {
        self.contextMenu = contextMenu;
    }
    this.showContextMenu = function (event) {
        if (event.button != 2) return;
        event.stopPropagation();
        wiComponentService.getComponent('ContextMenu')
            .open(event.clientX, event.clientY, self.contextMenu);
    }

    this.createVisualizeCrossplot = function (curveX, curveY, config) {
        if (!config) config = {};
        if (!viCrossplot) {
            let domElem = document.getElementById(self.crossplotAreaId);
            viCrossplot = graph.createCrossplot(curveX, curveY, config, domElem);
        } 
        return viCrossplot;
    }
    this.initPolygons = function (polygons) {
        viCrossplot.polygons = [];
        polygons.forEach(function (polygon) {
            viCrossplot.polygons.push(polygon);
        })
        viCrossplot.doPlot();
    }
    this.getPolygons = function () {
        if (!viCrossplot) return [];
        return viCrossplot.polygons;
    }
    this.drawPolygon = function (idPolygon, callback) {
        if (idPolygon) {
            viCrossplot.startEditPolygon(idPolygon);            
            self.setContextMenu([
                {
                    name: "End",
                    label: "End",
                    icon: "",
                    handler: function () {
                        callback(viCrossplot.endEditPolygon());
                        self.contextMenu = commonCtxMenu;
                    }
                }
            ])
        } else {
            viCrossplot.startAddPolygon();
            self.setContextMenu([
                {
                    name: "End",
                    label: "End",
                    icon: "",
                    handler: function () {
                        callback(viCrossplot.endAddPolygon());
                        self.contextMenu = commonCtxMenu;
                    }
                }
            ])
        }
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
