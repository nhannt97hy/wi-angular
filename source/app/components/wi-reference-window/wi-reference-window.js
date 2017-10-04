const componentName = 'wiReferenceWindow';
const moduleName = 'wi-reference-window';

function Controller($scope, wiComponentService, wiApiService, ModalService, $timeout) {
    let self = this;
    let _viCurves = new Array();
    this._viCurves = _viCurves;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let graph = wiComponentService.getComponent(wiComponentService.GRAPH);
    
    
    this.$onInit = function () {
        if (self.name) wiComponentService.putComponent(self.name, self);
    }

    this.doPlot = function() {
        if (!_viCurves || !_viCurves.length) return;
        _viCurves.forEach(function(curve) { curve.doPlot();});
    }

    function getParentCtrl() {
        return wiComponentService.getComponent(self.name.replace('RefWind', ''));
    }

    this.addRefCurve = function(idCurve, config) {
        var viCurve = null;
        utils.getCurveData(wiApiService, idCurve, function (err, dataCurve) {
            if (err) {
                utils.error(err);
                return;
            }
            viCurve = graph.createCurve(config, dataCurve, d3.select("#" + self.name));
            viCurve.doPlot();
            _viCurve.push(viCurve);
        });
    }

    this.removeRefCurve = function(idx) {
        var removeArr = _viCurves.splice(idx, 1);
        if (removeArr.length) removeArr[0].destroy();
    }

    this.removeAllRefCurves = function() {
        _viCurves.forEach(function(vc) { vc.destroy(); });
        _viCurves.length = 0;
    }

    this.getRefCurves = function() {
        return _viCurves.map(function(vc) {
            return vc.id;
        });
    }
    
    this.isRefCurveAdded = function(idCurve) {
        for (let vc of _viCurves) {
            if (idCurve == vc.id) return true;
        }
        return false;
    }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-reference-window.html',
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        name: '@'
    }
});

exports.name = moduleName;

