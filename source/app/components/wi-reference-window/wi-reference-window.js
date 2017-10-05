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
    this.onReady = function() {
        if (self.onRefWindCtrlReady) self.onRefWindCtrlReady(self);
        new ResizeSensor(document.getElementById(self.name), function() {
            _viCurves.forEach(function(c) { c.doPlot(); });
        });
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
            _viCurves.push(viCurve);
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
    this.update = update;
    function update(well, referenceCurves) {
        // Update reference windows TODO !!!
        let familyArray = wiComponentService.getComponent(wiComponentService.LIST_FAMILY);
        let minY = parseFloat(well.properties.topDepth);
        let maxY = parseFloat(well.properties.bottomDepth);
        let stepY = parseFloat(well.properties.step);


        var refWindCtrl = self;
        if (!referenceCurves || !referenceCurves.length) {
            refWindCtrl.removeAllRefCurves();
        }
        else {
            for (let i = refWindCtrl._viCurves.length - 1; i >= 0; i--) {
                if (!referenceCurves.find(
                        function(curve) { 
                            return refWindCtrl._viCurves[i].id == curve.idCurve;
                        }
                    ) 
                ) {
                    refWindCtrl._viCurves[i].destroy();
                    refWindCtrl._viCurves.splice(i, 1);
                }
            }
            for (let refCurve of referenceCurves) {
                let config = {
                    minX: refCurve.left,
                    maxX: refCurve.right,
                    //minX: infoCurve.LineProperty ? infoCurve.LineProperty.minScale : 0,
                    //maxX: infoCurve.LineProperty ? infoCurve.LineProperty.maxScale : 200,
                    minY: minY,
                    maxY: maxY,
                    yStep: stepY,
                    offsetY: minY,
                    line: { 
                        color: refCurve.color
                    }
                    //line: {
                    //    color: infoCurve.LineProperty ? infoCurve.LineProperty.lineColor : 'black',
                    //}
                }

                refWindCtrl.addRefCurve(refCurve.idCurve, config);
            }
        }
    }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-reference-window.html',
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        name: '@',
        onRefWindCtrlReady: "<"
    }
});

exports.name = moduleName;

