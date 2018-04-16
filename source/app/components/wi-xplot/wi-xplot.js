const componentName = 'wiXplot';
const moduleName = 'wi-xplot';

function Controller($scope, wiComponentService, wiApiService, ModalService, $timeout) {
    let self = this;
    let graph = wiComponentService.getComponent(wiComponentService.GRAPH);

    this.$onInit = function () {
        console.log('wi xplot initialization: ', this);
        this.plotAreaId = 'wi-xplot-area';
        this.viWiXplot = {};
        this.pointsets = [];
    }
    this.onReady = function () {
        this.createViWiXplot();
    }

    this.createViWiXplot = function () {
        let self = this;
        let pointSet = {};
        async.eachSeries(this.idCurves, function (config, next) {
            pointSet = {
                scale: {
                    left: null,
                    right: null,
                    bottom: null,
                    top: null
                },
                curveX: {
                    idCurve: config.x,
                    name: '',
                    data: {}
                },
                curveY: {
                    idCurve: config.y,
                    name: '',
                    data: {}
                }
            }
            async.parallel([
                function (cb) {
                    wiApiService.infoCurve(config.x, function (curveInfo) {
                        pointSet.scale.left = curveInfo.LineProperty.minScale;
                        pointSet.scale.right = curveInfo.LineProperty.maxScale;
                        pointSet.curveX.name = curveInfo.name;
                        wiApiService.dataCurve(config.x, function (curveData) {
                            pointSet.curveX.data = curveData;
                            cb();
                        });
                    });
                },
                function (cb) {
                    wiApiService.infoCurve(config.y, function (curveInfo) {
                        pointSet.scale.bottom = curveInfo.LineProperty.minScale;
                        pointSet.scale.top = curveInfo.LineProperty.maxScale;
                        pointSet.curveY.name = curveInfo.name;
                        wiApiService.dataCurve(config.y, function (curveData) {
                            pointSet.curveY.data = curveData;
                            cb();
                        });
                    });
                }
            ], function (cb) {
                self.pointsets.push(pointSet);
                next();
            });
        }, function (err, result) {
            if (err) {
                console.log(err);
                return;
            }
            console.log('pointsets', self.pointsets);
            // test
            let scale = self.pointsets[0].scale;
            let config = {
                logX: false,
                logY: false,
                majorX: 5,
                majorY: 5,
                minorX : 5,
                minorY : 5,
                decimalsX: 2,
                decimalsY: 2
            };
            // end test
            self.viWiXplot = graph.createVisualizeWiXplot({
                pointsets: self.pointsets,
                scale: scale,
                config: config
            }, document.getElementById(self.plotAreaId));
        });
    }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-xplot.html',
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        idCurves: '<'
    }
});

exports.name = moduleName;
