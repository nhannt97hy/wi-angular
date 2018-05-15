const componentName = 'wiHis';
const moduleName = 'wi-his';

function Controller($scope, wiComponentService, wiApiService, ModalService, $timeout) {
    let self = this;
    let graph = wiComponentService.getComponent(wiComponentService.GRAPH);
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);

    this.$onInit = function () {
        console.log('wi his: ', this);
        this.mainHisAreaId = 'wi-his-main-area';
        this.viWiHis = null;
        wiComponentService.putComponent('wi-his', this);
    }
    this.onReady = function () {
        this.createViWiHis();
    }

    this.update = function (changes) {
        if (this.viWiHis) {
            console.log('viWiHis', this.viWiHis);
        } else {
            this.createViWiHis();
        }
    }

    this.createViWiHis = function (changes) {
        let self = this;
        let curve = {};
        let scale = {
            left: null,
            right: null
        };
        this.curves = [];
        if (!this.curvesProperties.length) return;
        async.eachSeries(this.curvesProperties, function (curveProps, next) {
            curve = {
                idCurve: curveProps.idCurve,
                name: '',
                options: {},
                data: []
            };
            wiApiService.infoCurve(curveProps.idCurve, function (curveInfo) {
                scale.left = curveInfo.LineProperty.minScale;
                scale.right = curveInfo.LineProperty.maxScale;
                curve.name = curveInfo.name;
                if (!curveProps.options.lineColor) curveProps.options.lineColor = curveInfo.LineProperty.lineColor;
                curve.options = curveProps.options;
                wiApiService.dataCurve(curveProps.idCurve, function (curveData) {
                    curve.data = curveData;
                    self.curves.push(curve);
                    next();
                });
            });
        }, function (err, result) {
            if (err) {
                console.log('err', err);
                return;
            }
            console.log('curves', self.curves);

            if (!self.viWiHis) {
                if (!self.config.scale.left && !self.config.scale.right) {
                    self.config.scale = scale;
                }
                if (self.config.loga) {
                    if (self.config.scale.left == 0
                        || self.config.scale.right == 0) {
                        self.config.loga = false;
                        toastr.error("Scale can't be 0 in Logarithmic");
                        return;
                    }
                }

                // test
                self.config.plotType = 'Frequency';
                self.config.numOfDivisions = 50;
                // end test

                self.viWiHis = graph.createVisualizeWiHis({
                    curves: self.curves,
                    config: self.config
                }, document.getElementById(self.mainHisAreaId));
                // debug
                window.__ViWiHis = self.viWiHis;
            }
        });
    }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-his.html',
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        curvesProperties: '<',
        config: '='
    }
});

exports.name = moduleName;