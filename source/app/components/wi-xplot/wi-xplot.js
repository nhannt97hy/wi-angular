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
        async.eachSeries(this.idPointsets, function (id, next) {
            wiApiService.getPointSet(id, function (pointSet) {
                pointSet = {
                    idPointSet: id,
                    scale: {
                        left: null,
                        right: null,
                        bottom: null,
                        top: null
                    },
                    curveX: {
                        idCurve: pointSet.idCurveX,
                        data: {}
                    },
                    curveY: {
                        idCurve: pointSet.idCurveY,
                        data: {}
                    }
                };
                async.parallel([
                    function (cb) {
                        wiApiService.infoCurve(pointSet.curveX.idCurve, function (curveInfo) {
                            pointSet.scale.left = curveInfo.LineProperty.minScale;
                            pointSet.scale.right = curveInfo.LineProperty.maxScale;
                            wiApiService.dataCurve(pointSet.curveX.idCurve, function (curveData) {
                                pointSet.curveX.data = curveData;
                                cb();
                            });
                        });
                    },
                    function (cb) {
                        wiApiService.infoCurve(pointSet.curveY.idCurve, function (curveInfo) {
                            pointSet.scale.bottom = curveInfo.LineProperty.minScale;
                            pointSet.scale.top = curveInfo.LineProperty.maxScale;
                            wiApiService.dataCurve(pointSet.curveY.idCurve, function (curveData) {
                                pointSet.curveY.data = curveData;
                                cb();
                            });
                        });
                    }
                ], function (cb) {
                    self.pointsets.push(pointSet);
                    next();
                });
            });
        }, function (err, result) {
            if (err) {
                console.log(err);
                return;
            }
            console.log('pointsets', self.pointsets);
            // test
            let scale = self.pointsets[0].scale;
            // end test
            self.viWiXplot = graph.createVisualizeWiXplot({
                pointsets: self.pointsets,
                scale: scale
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
        idPointsets: '<'
    }
});

exports.name = moduleName;
