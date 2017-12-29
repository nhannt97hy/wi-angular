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
    let _wiD3CrossplotCtrl = null;
    self.loading = false;
    this._viCurves = _viCurves;
    // this.referenceCurves = new Array();
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let graph = wiComponentService.getComponent(wiComponentService.GRAPH);

    const CANVAS_WIDTH = 5;
    const CANVAS_STROKE_COLOR = 'Green';

    this.$onInit = function () {
        if (self.name) {
            // console.log('crossplot-reference-window', self.name);
            wiComponentService.putComponent(self.name, self);
        }
    }
    this.onReady = function() {
        if (self.onRefWindCtrlReady) self.onRefWindCtrlReady(self);
        document.addEventListener('resize', function (event) {
            refresh();
        })
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

        self.canvas = getRefCurveContainer().append('canvas')
            .attr('class', 'point-canvas')
            .attr('width', CANVAS_WIDTH)
            .attr('height', $(getRefCurveContainer().node()).height())
            .style('transform', 'translateX(-' + CANVAS_WIDTH + 'px)');
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

    function getWid3CrossplotCtrl() {
        if ( !_wiD3CrossplotCtrl ) {
            _wiD3CrossplotCtrl = wiComponentService.getComponent(self.name.replace('RefWind', ''));
        }
        return _wiD3CrossplotCtrl;
    }

    this.addRefCurve = function(idCurve, config, callback) {
        var viCurve = null;
        utils.getCurveData(wiApiService, idCurve, function (err, dataCurve) {
            if (err) {
                utils.error(err);
                return;
            }
            viCurve = graph.createCurve(config, dataCurve, getRefCurveContainer());
            console.log(viCurve);
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
    this.refresh = refresh;
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

        self.canvas.attr('height', $(getRefCurveContainer().node()).height());

        self.updateCanvas();

        let transformY = _viCurves[0].getTransformY();
        let transformX = d3.scaleLinear().range([0, $(getRefCurveContainer().node()).width()]);

        let axisX = d3.axisTop(transformX)
            .tickValues(d3.range(0, 1, 1 / _vertLineNo))
            .tickSize(-1*$(getRefCurveContainer().node()).height())
            .tickFormat("");
        if (_scale < 0) {
            _scale = (_bottom - _top) * 100 / $(getRefCurveContainer().node()).height()*getDpcm();
        }
        let step = _scale / 100;
        let axisY = d3.axisLeft(transformY).tickValues(d3.range(Math.ceil(_top), Math.round(_bottom), step))
            .tickFormat(d3.format(',.0f'))
            .tickSize(-1 * $(getRefCurveContainer().node()).width());

            if(!self.showGrid){
                self.svg.select('.vi-refwind-axis-y-ticks').call(axisY)
                .selectAll('.vi-refwind-axis-y-ticks .tick line')
                .style('stroke-opacity', 0);
            }else{
                self.svg.select('.vi-refwind-axis-y-ticks').call(axisY)
                .selectAll('.vi-refwind-axis-y-ticks .tick line')
                .style('stroke-opacity', 0.3);
            }
            self.svg.select('.vi-refwind-axis-x-ticks').call(axisX);
            self.svg.select('.vi-refwind-axis-y-ticks').call(axisY)
            .selectAll('.vi-refwind-axis-y-ticks .tick text')
            .style('transform', 'translateX(-' + CANVAS_WIDTH + 'px)');
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

    this.updateCanvas = updateCanvas;
    function updateCanvas() {
        let transformY = _viCurves[0].getTransformY();
        let viCrossplot = getWid3CrossplotCtrl().viCrossplot;
        let ctx = self.canvas.node().getContext('2d');
        ctx.clearRect(0, 0, CANVAS_WIDTH, $(getRefCurveContainer().node()).height());
        if (viCrossplot && viCrossplot.data && viCrossplot.area && viCrossplot.area.points) {
            let points = viCrossplot.data.filter(function(p) {
                return p.depth >= _top && p.depth <= _bottom;
            });
            points = viCrossplot.filterByPolygons([viCrossplot.area], points);
            ctx.beginPath();
            points.forEach(function(p) {
                let y = transformY(p.depth);
                ctx.moveTo(0, y);
                ctx.lineTo(CANVAS_WIDTH, y);
            });
            ctx.strokeStyle = CANVAS_STROKE_COLOR;
            ctx.stroke();
        }
    }

    this.update = update;
    function update(well, referenceCurves, scale, vertLineNo, top, bottom, grid) {
        self.showGrid = grid;
        // self.referenceCurves.length = 0;
        let familyArray = wiComponentService.getComponent(wiComponentService.LIST_FAMILY);
        _minY = top;
        _maxY = bottom;
        //if (!_top || _top < _minY)
        _top = _minY;
        if (scale) _scale = scale;
        if (vertLineNo && !isNaN(vertLineNo)) _vertLineNo = vertLineNo;

        adjustRange();

        let stepY = parseFloat(well.properties.step);

        var refWindCtrl = self;
        refWindCtrl.removeAllRefCurves();
        if (referenceCurves && referenceCurves.length) {
        // }
        // else {
            // for (let i = _viCurves.length - 1; i >= 0; i--) {
            //     let notExisted = !referenceCurves.find(
            //         function(curve) {
            //             return _viCurves[i].id == curve.idCurve;
            //         }
            //     )
            //     if (notExisted) {
            //         _viCurves[i].destroy();
            //         _viCurves.splice(i, 1);
            //     }
            // }
            getRefCurveContainer().on('mousewheel', null);
            self.loading = true;
            async.eachOf(referenceCurves, function(refCurve, idx, callback) {
                if(refCurve.idCurve && refCurve.visiable){
                    refCurve.datasetName = utils.findDatasetById(refCurve.curve.idDataset).properties.name;
                    let config = {
                        idCurve: refCurve.idCurve,
                        name: refCurve.datasetName + '.' + refCurve.curve.name,
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
                }else{
                    callback();
                }
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

