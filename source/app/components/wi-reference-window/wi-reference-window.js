const componentName = 'wiReferenceWindow';
const moduleName = 'wi-reference-window';

function Controller($scope, wiComponentService, wiApiService, ModalService, $timeout) {
    let self = this;
    let _minY = 0;
    let _maxY = 10000;
    let _top = 0;
    let _bottom = _maxY;
    let _scale = -1;
    let _dpcm = -1;
    let _vertLineNo = 5;
    let _refCurveContainer = null;
    let _viCurves = new Array();
    self.loading = false;
    //this._viCurves = _viCurves;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let graph = wiComponentService.getComponent(wiComponentService.GRAPH);    

    this.$onInit = function () {
        if (self.name) wiComponentService.putComponent(self.name, self);
    }
    this.onReady = function() {
        if (self.onRefWindCtrlReady) self.onRefWindCtrlReady(self);
        new ResizeSensor(document.getElementById(self.name), function() {
            //_viCurves.forEach(function(c) { c.doPlot(); });
            refresh();
        });
        self.svg = getRefCurveContainer().append('svg')
            .attr('class', 'grid-svg')
            .attr('width', $(getRefCurveContainer().node()).width())
            .attr('height', $(getRefCurveContainer().node()).height());

        self.svg.selectAll('g.vi-refwind-axis-group').data([
                'vi-refwind-axis-ticks vi-refwind-axis-x-ticks', 
                'vi-refwind-axis-ticks vi-refwind-axis-y-ticks'
            ]).enter()
            .append('g')
                .attr('class', function(d) { return 'vi-refwind-axis-group ' + d; });
        console.log(self.name + "-spinner");
        document.getElementById(self.name + "-spinner").appendChild((new Spinner()).spin().el);
    }

    this.doPlot = function() {
        if (!_viCurves || !_viCurves.length) return;
        _viCurves.forEach(function(curve) { curve.doPlot();});
    }

    function getParentCtrl() {
        return wiComponentService.getComponent(self.name.replace('RefWind', ''));
    }

    function getDpcm() {
        if (_dpcm < 0) _dpcm = utils.getDpcm();
        return _dpcm;
    }

    function getRefCurveContainer() {
        if ( !_refCurveContainer ) {
            console.log('getRefCurveContainer', self.name);
            _refCurveContainer = d3.select("#" + self.name).classed('vi-refwind-container', true);
            console.log(_refCurveContainer);

        }
        return _refCurveContainer;
    }

    this.addRefCurve = function(idCurve, config, callback) {
        var viCurve = null;
        utils.getCurveData(wiApiService, idCurve, function (err, dataCurve) {
            if (err) {
                utils.error(err);
                return;
            }
            viCurve = graph.createCurve(config, dataCurve, getRefCurveContainer());
            //viCurve.doPlot();
            _viCurves.push(viCurve);
            if (callback) callback();
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

    function adjustRange() {
        if (_scale <= 0) {
            _top = _minY;
            _bottom = _maxY;
        }
        else {
            let pxHeight = $(getRefCurveContainer().node()).height();
            let cmHeight = pxHeight / utils.getDpcm();
            let realHeight = cmHeight * _scale / 100; // in meters
            if (realHeight > (_maxY - _minY)) {
                _top = _minY;
                _bottom = _maxY;
            }
            else {
                _bottom = _top + realHeight;
                if (_bottom > _maxY) {
                    _bottom = _maxY;
                    _top = _bottom - realHeight;
                }
            }
        }
    }

    function refresh(top, scale) {
        if (!_viCurves || !_viCurves.length) return;
        if (top) _top = top;
        if (_top < _minY) _top = _minY;

        if (scale) _scale = scale;
        
        adjustRange();

        _viCurves.forEach(function(viCurve) {
            viCurve.minY = _top;
            viCurve.maxY = _bottom;
            viCurve.offsetY = _top;
            viCurve.doPlot();
        });

        self.svg.attr('width', $(getRefCurveContainer().node()).width())
            .attr('height', $(getRefCurveContainer().node()).height());

        let transformY = _viCurves[0].getTransformY();
        let transformX = d3.scaleLinear().range([0, $(getRefCurveContainer().node()).width()]);

        let axisX = d3.axisTop(transformX).ticks(_vertLineNo)
            .tickSize(-1*$(getRefCurveContainer().node()).height())
            .tickFormat("");

        let step = _scale / 100;
        let axisY = d3.axisLeft(transformY).tickValues(d3.range(Math.ceil(_top), Math.floor(_bottom), step))
            .tickFormat(d3.format(',.0f'))
            .tickSize(-1 * $(getRefCurveContainer().node()).width());

        self.svg.select('.vi-refwind-axis-x-ticks').call(axisX);
        self.svg.select('.vi-refwind-axis-y-ticks').call(axisY);
        
        getRefCurveContainer()
            .on('mousewheel', function() {
                let absDeltaY = Math.abs(d3.event.deltaY);
                absDeltaY = ( absDeltaY > 4) ? (absDeltaY / 2) : absDeltaY;
                let sign = (d3.event.deltaY < 0)?-1:1;
                let realDeltaY = sign * absDeltaY * _scale / getDpcm() / 100;
                refresh(_top + realDeltaY);
            })
            .call(d3.drag()
                .on('start', function() {
                    console.log('start', this);
                    d3.select(this).select('canvas').style('cursor', 'move');
                })
                .on('drag', function() {
                    let realDeltaY = -1 * d3.event.dy * _scale / getDpcm() / 100;
                    refresh(_top + realDeltaY);
                })
                .on('end', function() {
                    d3.select(this).select('canvas').style('cursor', 'crosshair');
                })
            );
    }

    this.update = update;
    function update(well, referenceCurves, scale, vertLineNo) {
        // Update reference windows TODO !!!
        let familyArray = wiComponentService.getComponent(wiComponentService.LIST_FAMILY);
        _minY = parseFloat(well.properties.topDepth);
        _maxY = parseFloat(well.properties.bottomDepth);
        //if (!_top || _top < _minY) 
        _top = _minY;
        if (scale) _scale = scale;
        if (vertLineNo && !isNaN(vertLineNo)) _vertLineNo = vertLineNo;
        
        adjustRange();

        let stepY = parseFloat(well.properties.step);

        var refWindCtrl = self;
        if (!referenceCurves || !referenceCurves.length) {
            refWindCtrl.removeAllRefCurves();
        }
        else {
            for (let i = _viCurves.length - 1; i >= 0; i--) {
                if (!referenceCurves.find(
                        function(curve) { 
                            return _viCurves[i].id == curve.idCurve;
                        }
                    ) 
                ) {
                    _viCurves[i].destroy();
                    _viCurves.splice(i, 1);
                }
            }
            getRefCurveContainer().on('mousewheel', null);
            self.loading = true;
            async.eachOf(referenceCurves, function(refCurve, idx, callback) {
                let config = {
                    minX: refCurve.left,
                    maxX: refCurve.right,
                    minY: _top,
                    maxY: _bottom,
                    yStep: stepY,
                    offsetY: _top,
                    line: { 
                        color: refCurve.color
                    }
                }

                refWindCtrl.addRefCurve(refCurve.idCurve, config, callback);
            }, function(err) {
                refresh();
                self.loading = false;
            });
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

