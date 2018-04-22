const componentName = 'wiXplot';
const moduleName = 'wi-xplot';

function Controller($scope, wiComponentService, wiApiService, ModalService, $timeout) {
    let self = this;
    let graph = wiComponentService.getComponent(wiComponentService.GRAPH);

    this.$onInit = function () {
        console.log('wi xplot initialization: ', this);
        this.plotAreaId = 'wi-xplot-area';
        this.viWiXplot = null;
        wiComponentService.putComponent('wi-xplot', this);
    }
    this.onReady = function () {
        this.createViWiXplot();
    }

    this.update = function (changes) {
        if (this.viWiXplot) {
            changes.idCurves.forEach(datum => delete datum.$$hashKey);
            let existedIdCurves = this.viWiXplot.getProperties().pointsets.map(pointSet => {
                return {
                    x: pointSet.curveX.idCurve,
                    y: pointSet.curveY.idCurve
                };
            });
            let isChanged = existedIdCurves.length >= changes.idCurves.length ?
                _.differenceWith(existedIdCurves, changes.idCurves, _.isEqual).length :
                _.differenceWith(changes.idCurves, existedIdCurves, _.isEqual).length;
            if (isChanged && !changes.idCurves.length) {
                this.config = {
                    logX: false,
                    logY: false,
                    majorX: 5,
                    majorY: 5,
                    minorX : 1,
                    minorY : 1,
                    decimalsX: 2,
                    decimalsY: 2,
                    scale: {
                        left: null,
                        right: null,
                        bottom: null,
                        top: null
                    }
                };
                this.viWiXplot.pointsets = [];
                this.viWiXplot.updatePlot(changes);
                this.viWiXplot.plotContainer.remove();
                delete this.viWiXplot;
            } else if (isChanged) {
                this.createViWiXplot(changes);
            } else {
                this.viWiXplot.updatePlot(changes);
            }
        } else {
            this.createViWiXplot();
        }
    }

    this.createViWiXplot = function (changes) {
        let self = this;
        let pointSet = {};
        this.pointsets = [];
        if (!this.idCurves.length) return;
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

            if (!self.viWiXplot) {
                // test
                self.config.scale = (self.pointsets[0] || {}).scale;
                // end test
                self.viWiXplot = graph.createVisualizeWiXplot({
                    pointsets: self.pointsets,
                    config: self.config
                }, document.getElementById(self.plotAreaId));
            } else {
                self.viWiXplot.pointsets = self.pointsets;
                self.viWiXplot.updatePlot(changes);
            }
        });
    }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-xplot.html',
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        idCurves: '<',
        config: '='
    }
});

exports.name = moduleName;
