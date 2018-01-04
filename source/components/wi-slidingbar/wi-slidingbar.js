const componentName = 'wiSlidingbar';
const moduleName = 'wi-slidingbar';

const MIN_RANGE = 1;

function Controller($scope, wiComponentService, wiApiService, $timeout) {
    let self = this;
    let _offsetTop = 0;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    //let _scaleView = false;
    let _viCurve = null;
    let parentHeight = 0;
    this.tinyWindow = {
        top: 0,
        height: 0
    };
    // tiny windows by percent
    this.slidingBarState = {
        top: 0,
        range: MIN_RANGE
    };
    let logPlotCtrl = null;

    function createPreview(idCurve) {
        console.log(idCurve);
        if (!idCurve) {
            createPreviewWithDefault();
            return;
        }
        let logPlotName = self.name.replace('Slidingbar', '');
        logPlotCtrl = wiComponentService.getComponent(logPlotName);
        let logplotId = logPlotCtrl.id;

        let well = utils.findWellByLogplot(logplotId);
        let graph = wiComponentService.getComponent(wiComponentService.GRAPH);
        let minY = parseFloat(well.properties.topDepth);
        let maxY = parseFloat(well.properties.bottomDepth);
        let stepY = parseFloat(well.properties.step);
        wiApiService.infoCurve(idCurve, function (infoCurve) {
            let config = {
                minX: infoCurve.LineProperty ? infoCurve.LineProperty.minScale : 0,
                maxX: infoCurve.LineProperty ? infoCurve.LineProperty.maxScale : 200,
                minY: minY,
                maxY: maxY,
                yStep: stepY,
                offsetY: minY,
                //scale: "Logarithmic" || "Linear",
                scale: infoCurve.LineProperty ? infoCurve.LineProperty.displayType : "Linear",
                line: {
                    color: infoCurve.LineProperty ? infoCurve.LineProperty.lineColor : 'black',
                }
            };
            utils.getCurveData(wiApiService, idCurve, function (err, dataCurve) {
                if (err) {
                    utils.error(err);
                    return;
                }
                if (_viCurve) _viCurve.destroy();
                console.log("slidingCurve", config);
                config._data = dataCurve;
                _viCurve = graph.createCurve(config, dataCurve, d3.select(self.contentId));
                // _viCurve.setProperties({displayType: 'Logarithmic | Linear'})
                _viCurve.setProperties({displayType: config.scale});
                _viCurve.doPlot();
            });
        })
        let logplotModel = logPlotCtrl.getLogplotModel();
        let logplotRequest = angular.copy(logplotModel.properties);
        logplotRequest.referenceCurve = idCurve;
        wiApiService.editLogplot(logplotRequest, function () {
            logplotModel.properties.referenceCurve = idCurve;
        });
    }

    this.verifyDroppedIdCurve = function(idCurve) {
        let well1 = utils.findWellByLogplot(logPlotCtrl.id);
        let well2 = utils.findWellByCurve(idCurve) || {properties:{}};

        if (!well1.properties.idWell || !well2.properties.idWell) return -1;
        if (well1.properties.idWell && well2.properties.idWell && (well1.properties.idWell == well2.properties.idWell)) return 1;
        return 0;
    }

    this.createPreview = createPreview;

    function createPreviewWithDefault() {
        let logPlotName = self.name.replace('Slidingbar', '');
        logPlotCtrl = wiComponentService.getComponent(logPlotName);
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let logplotId = logPlotCtrl.id;
        let well = utils.findWellByLogplot(logplotId);
        if (!well) return;
        let firstCurve = well.children[0].children[0];

        createPreview(firstCurve.properties.idCurve);
        /*
        utils.getCurveData(wiApiService, firstCurve.properties.idCurve, function (err, data) {
            let config = {
                minY: parseFloat(well.properties.topDepth),
                maxY: parseFloat(well.properties.bottomDepth),
                yStep: parseFloat(well.properties.step),
                offsetY: parseFloat(well.properties.topDepth),
                line: {
                    color: 'blue'
                }
            }
            //let viCurve = graph.createCurve(config, data, d3.select(self.contentId));
            if (_viCurve) _viCurve.destroy();
            _viCurve = graph.createCurve(config, data, d3.select(self.contentId));
            _viCurve.doPlot();
        });
        */
    }

    function update(ui) {
        parentHeight = $(self.contentId).height();
        let tempTinyWindowsHeight = self.tinyWindow.height;
        let tempTinyWindowsTop = self.tinyWindow.top;

        if (ui.size) {
            tempTinyWindowsHeight = (ui.size.height > parentHeight) ? parentHeight : ui.size.height;
        }
        if (ui.position) {
            tempTinyWindowsTop = ((ui.position.top > 0) ? ui.position.top : 0) + _offsetTop;
        }

        $timeout(function () {
            updateState(tempTinyWindowsTop, tempTinyWindowsHeight, parentHeight);
        });
    }

    function updateWid3() {
        let wiD3Controller = wiComponentService.getD3AreaForSlidingBar(self.name);
        let max = wiD3Controller.getMaxDepth();
        let min = wiD3Controller.getMinDepth();
        let low = min + (max - min) * self.slidingBarState.top / 100.;
        let high = low + (max - min) * self.slidingBarState.range / 100.;
        wiD3Controller.setDepthRange([low, high], true);
        wiD3Controller.processZoomFactor();
        wiD3Controller.plotAll();
        wiD3Controller.updateScale();
    }

    function updateState(top, height, pHeight) {
        self.slidingBarState.top = top / pHeight * 100.;
        self.slidingBarState.range = height / pHeight * 100.;

        self.tinyWindow.height = height;
        self.tinyWindow.top = top;
    }

    let saveStateToServer = _.debounce(function () {
        let wiD3Controller = wiComponentService.getD3AreaForSlidingBar(self.name);
        let max = wiD3Controller.getMaxDepth();
        let min = wiD3Controller.getMinDepth();
        let low = min + (max - min) * self.slidingBarState.top / 100.;
        let high = low + (max - min) * self.slidingBarState.range / 100.;
        let newLogplot = {
            idPlot: logPlotCtrl.getLogplotModel().properties.idPlot,
            currentState: {
                top: low,
                bottom: high
            }
        }
        wiApiService.editLogplot(newLogplot, null, { silent: true });
    }, 1000);
    
    this.$onInit = function () {
        self.contentId = '#sliding-bar-content' + self.name;
        self.handleId = '#sliding-handle' + self.name;

        if (self.name) wiComponentService.putComponent(self.name, self);
    };

    this.onReady = function () {
        let logPlotName = self.name.replace('Slidingbar', '');
        logPlotCtrl = wiComponentService.getComponent(logPlotName);
        parentHeight = $(self.contentId).height();
        //self.parentHeight = parentHeight;
        let initialHeight = parentHeight * (MIN_RANGE) / 100.;

        self.tinyWindow = {
            top: 0,
            height: parentHeight / 20 || 1
        };

        // init tiny window height
        $(self.handleId).height(self.tinyWindow.height);
        $(self.handleId).css('top', self.tinyWindow.top + 'px');

        self.slidingBarState.top = self.tinyWindow.top / parentHeight * 100.;
        self.slidingBarState.range = self.tinyWindow.height / parentHeight * 100.;

        let tungTrickHandle = null;
        function tungTrick(ui) {
            if (tungTrickHandle) {
                clearTimeout(tungTrickHandle);
                tungTrickHandle = null;
            }
            let _ui = ui;
            tungTrickHandle = setTimeout(function() {
                update(_ui);
                updateWid3();
                tungTrickHandle = null;
            }, 200);
        }
        $(self.handleId).draggable({
            axis: "y",
            containment: "parent"
        }).resizable({
            minHeight: initialHeight,
            containment: "parent",
            handles: "n, s"
        });

        $(self.handleId).on("resize", function (event, ui) {
            event.stopPropagation();
            update(ui);
            updateWid3();
            tungTrick(ui);
        });
        $(self.handleId).on("resizestop", function (event, ui) {
            event.stopPropagation();
            update(ui);
            updateWid3();
            tungTrick(ui);
            saveStateToServer();
        });

        $(self.handleId).on("drag", function (event, ui) {
            event.stopPropagation();
            update(ui);
            updateWid3();
        });
        $(self.handleId).on("dragstop", function (event, ui) {
            event.stopPropagation();
            update(ui);
            updateWid3();
            saveStateToServer();
        });

        new ResizeSensor($(self.contentId), function () {
            let currentParentHeight = $(self.contentId).height();
            if (currentParentHeight && currentParentHeight !== parentHeight) self.refreshHandler();
            _viCurve && _viCurve.doPlot();
        });
        document.addEventListener('resize', function (event) {
            let currentParentHeight = $(self.contentId).height();
            if (currentParentHeight && currentParentHeight !== parentHeight) self.refreshHandler();
            _viCurve && _viCurve.doPlot();
        })

        $(self.contentId).on("mousewheel", onMouseWheel);
        $(self.handleId).on("mousewheel", onMouseWheel);

        let dragMan = wiComponentService.getComponent(wiComponentService.DRAG_MAN);
        $(`wi-slidingbar[name=${self.name}]`).on('mouseover', function () {
            dragMan.wiSlidingBarCtrl = self;
            dragMan.wiD3Ctrl = null;
        });

        $(`wi-slidingbar[name=${self.name}]`).on('mouseleave', function () {
            dragMan.wiSlidingBarCtrl = null;
        });
    };

    this.scroll = scroll;

    function scroll(sign) {
        let pHeight = $(self.contentId).parent().height();
        let realDeltaY = pHeight * self.slidingBarState.range / 100. * 0.1;
        realDeltaY = (realDeltaY > 1)?realDeltaY:1;
        realDeltaY *= sign;
        let tempTopHandler = self.tinyWindow.top - realDeltaY;

        if (tempTopHandler < 0 + _offsetTop) {
            tempTopHandler = 0 + _offsetTop;
        }
        else if (tempTopHandler + self.tinyWindow.height > pHeight + _offsetTop ) {
            tempTopHandler = pHeight + _offsetTop - self.tinyWindow.height;
        }

        //let newTop = Math.round(tempTopHandler);
        //let newHeight = Math.ceil(self.tinyWindow.height);
        let newTop = tempTopHandler;
        let newHeight = self.tinyWindow.height;
        updateSlidingHandler(newTop, newHeight);
        updateWid3();
        saveStateToServer();
    }

    function onMouseWheel(event) {
        let value = ( event.deltaY<0) ? -1 : 1;
        scroll(value);
    }
/*
    function onMouseWheel(event) {
        let sign = (event.deltaY<0)?"-":"";
        //let sign = (event.deltaY<0)?"":"-";
        let absDelta = Math.abs(event.deltaY);
        let value = ( absDelta > 4) ? (absDelta / 3) : absDelta;
        scroll(parseInt(sign + value));
    }
*/
    function updateSlidingHandler(top, height) {
        $(self.handleId).css('top', (top - _offsetTop) + 'px');
        $(self.handleId).css('height', height + 'px');

        $timeout(function () {
            updateState(top, height, parentHeight);
        });
    }

    this.refreshHandler = function () {
        parentHeight = $(self.contentId).height();
        //self.parentHeight = parentHeight;
        self.updateSlidingHandlerByPercent(self.slidingBarState.top, self.slidingBarState.range);
    }

    this.updateSlidingHandlerByPercent = function (topPercent, rangePercent) {
        //let newTop = Math.round((topPercent * parentHeight) / 100);
        //let newHeight = Math.ceil((rangePercent * parentHeight) / 100);
        let newTop = (topPercent * parentHeight) / 100.;
        let newHeight = (rangePercent * parentHeight) / 100.;

        if (newTop < 0) newTop = 0;

        if (newHeight + newTop > parentHeight && newHeight <= parentHeight) {
            newTop = parentHeight - newHeight;
        } else if (newHeight + newTop > parentHeight && newHeight > parentHeight) {
            newTop = 0;
            newHeight = parentHeight;
        }
        updateSlidingHandler(newTop, newHeight);
    };

    this.updateRangeSlidingHandler = function (rangePercent) {
        self.updateSlidingHandlerByPercent(self.slidingBarState.top, rangePercent);
    };

    this.zoomIn = function () {
        let deltaRange = 4;
        let newRange = self.slidingBarState.range - (deltaRange * 2);
        let newTop = self.slidingBarState.top + deltaRange;

        if (newRange <= 0) return;

        self.updateSlidingHandlerByPercent(newTop, newRange);
    };

    this.zoomOut = function () {
        let deltaRange = 4;
        let newRange = self.slidingBarState.range + (deltaRange * 2);
        let newTop = self.slidingBarState.top - deltaRange;
        self.updateSlidingHandlerByPercent(newTop, newRange);
    };

    this.scaleView = function() {
        if ( logPlotCtrl.cropDisplay ) return;
        logPlotCtrl.cropDisplay = true;
        //if ( parentHeight !== $(self.contentId).parent().parent().height()) return;
        let currentParentHeight = $(self.contentId).height();
        let scale = currentParentHeight / self.tinyWindow.height;
        let newParentHeight = currentParentHeight * scale;
        let newTop = (self.slidingBarState.top * newParentHeight) / 100.;

        $(self.contentId).height(newParentHeight);
        _offsetTop = newTop;
        $(self.contentId).css('top', '-' + newTop + 'px');
        _viCurve.doPlot();
    }

    this.resetView = function() {
        logPlotCtrl.cropDisplay = false;
        let defaultParentHeight = $(self.contentId).parent().parent().height();
        _offsetTop = 0;
        $(self.contentId).height('auto').css('top', 0);
        if (_viCurve) _viCurve.doPlot();
    }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-slidingbar.html',
    controller: Controller,
    controllerAs: componentName,
    transclude: true,
    bindings: {
        name: '@'
    }
});

exports.name = moduleName;
exports.componentName = componentName;
