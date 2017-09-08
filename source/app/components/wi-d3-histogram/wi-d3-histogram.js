const componentName = 'wiD3Histogram';
const moduleName = 'wi-d3-histogram';

function Controller($scope, wiComponentService, $timeout, ModalService, wiApiService) {
    let self = this;
    this.visHistogram = null;
    let graph = wiComponentService.getComponent('GRAPH');

    this.curveName = "Linh tinh";
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
            "isCheckType": "true",
            checked: true,
            handler: function () {
                
            }
        }, {
            name: "ShowGrid",
            label: "Show Grid",
            "isCheckType": "true",
            checked: true,
            handler: function () {
                
            }
        }, {
            name: "ShowGaussian",
            label: "Show Gaussian",
            "isCheckType": "true",
            checked: true,
            handler: function () {
                
            }
        }, {
            name: "ShowAxisYAsPercent",
            label: "Show Axis Y as Percent",
            "isCheckType": "true",
            checked: true,
            handler: function () {
                
            }
        }, {
            name: "ShowReferenceWindow",
            label: "Show Reference Window",
            "isCheckType": "true",
            checked: true,
            handler: function () {
                
            }
        }, {
            name: "ShowCumulative",
            label: "Show Cumulative",
            "isCheckType": "true",
            checked: true,
            handler: function () {
                
            }
        }, {
            name: "ShowCumulativeCurve",
            label: "Show Cumulative Curve",
            "isCheckType": "true",
            checked: true,
            handler: function () {
                
            }
        }, {
            name: "ShowTooltip",
            label: "Show Tooltip",
            "isCheckType": "true",
            checked: true,
            handler: function () {
                
            }
        }, {
            name: "FrequencyInfor",
            label: "Frequency Infor",
            icon: "ti-info-alt",
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

    function buildConfigFromHistogramModel(histogramModel, callback) {
        var config = {
            idHistogram: histogramModel.properties.idHistogram,
            histogramTitle: histogramModel.properties.histogramTitle || "Noname",
            hardCopyWidth: histogramModel.properties.hardCopyWidth,
            hardCopyHeight: histogramModel.properties.hardCopyHeight,
            intervalDepthTop: histogramModel.properties.intervalDepthTop,
            intervalDepthBottom: histogramModel.properties.intervalDepthBottom,
            divisions: histogramModel.properties.divisions,
            leftScale: histogramModel.properties.leftScale,
            rightScale: histogramModel.properties.rightScale,
            showGaussian: histogramModel.properties.showGaussian || false,
            loga: histogramModel.properties.loga || false,
            showGrid: histogramModel.properties.showGrid || false,
            flipHorizontal: histogramModel.properties.flipHorizontal || false,
            line: {
                color: histogramModel.properties.lineColor,
                width: histogramModel.properties.lineWidth,
                dash: histogramModel.properties.lineStyle
            },
            plotType: histogramModel.properties.plotType,
            fill: {
                pattern: null,
                background: histogramModel.properties.color,
                foreground: histogramModel.properties.color
            },
            discriminators: {},
            idWell: histogramModel.properties.idWell,
            idCurve: histogramModel.properties.idCurve,
            //idZoneSet: null
            data: null,
            zones: histogramModel.protoperties.zones
        }
        return config;
    }

    this.createVisualizeHistogram = function(histogram) {
        console.log('createHistogram:' , histogram, self.histogramAreaId);
        config = buildConfigFromHistogramModel(histogram);
        self.visHistogram = graph.createHistogram(config, document.getElementById(self.histogramAreaId));
    }
    function loadCurve(histogramModel) {
        wiApiService.dataCurve(histogramModel.properties.idCurve, function(data) {
            visHistogram.setCurve(data);
        });
    }
    this.addCurve = function(curveId, histogram) {
        histogram.properties.idCurve = idCurve;
        wiApiService.editHistogram(histogram.properties, function(histogram) {
            loadCurve(histogram)
        });
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
