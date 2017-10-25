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
                _viCurve.doPlot();
            });
        })
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
        parentHeight = parseInt($(self.contentId).height());
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
        let low = min + (max - min) * self.slidingBarState.top / 100;
        let high = low + (max - min) * self.slidingBarState.range / 100;
        wiD3Controller.setDepthRange([low, high]);
        wiD3Controller.updateScale();
    }

    function updateState(top, height, pHeight) {
        self.slidingBarState.top = top / pHeight * 100;
        self.slidingBarState.range = height / pHeight * 100;

        self.tinyWindow.height = height;
        self.tinyWindow.top = top;
    }

    this.$onInit = function () {
        self.contentId = '#sliding-bar-content' + self.name;
        self.handleId = '#sliding-handle' + self.name;

        if (self.name) wiComponentService.putComponent(self.name, self);
    };

    this.onReady = function () {
        let logPlotName = self.name.replace('Slidingbar', '');
        logPlotCtrl = wiComponentService.getComponent(logPlotName);
        parentHeight = parseInt($(self.contentId).height());
        //self.parentHeight = parentHeight;
        let initialHeight = Math.round(parentHeight * (MIN_RANGE) / 100);

        self.tinyWindow = {
            top: 0,
            height: parseInt(parentHeight / 20) || 1
        };

        // init tiny window height
        $(self.handleId).height(self.tinyWindow.height);
        $(self.handleId).css('top', self.tinyWindow.top + 'px');

        self.slidingBarState.top = Math.round(self.tinyWindow.top / parentHeight * 100);
        self.slidingBarState.range = Math.round(self.tinyWindow.height / parentHeight * 100);

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
        });

        $(self.handleId).on("drag", function (event, ui) {
            event.stopPropagation();
            update(ui);
            updateWid3();
        });

        new ResizeSensor($(self.contentId), function () {
            let currentParentHeight = parseInt($(self.contentId).height());
            if (currentParentHeight !== parentHeight) self.refreshHandler();
            _viCurve.doPlot();
        });

        $(self.contentId).on("mousewheel", onMouseWheel);
        $(self.handleId).on("mousewheel", onMouseWheel);

        let dragMan = wiComponentService.getComponent(wiComponentService.DRAG_MAN);
        $(self.contentId).on('mouseover', function () {
            dragMan.wiSlidingBarCtrl = self;
        });

        $(self.contentId).on('mouseleave', function () {
            dragMan.wiSlidingBarCtrl = null;
        });
    };

    this.scroll = scroll;

    function scroll(deltaY) {
        let pHeight = $(self.contentId).parent().parent().height();
        let tempTopHandler = self.tinyWindow.top - deltaY;

        if (tempTopHandler < 0 + _offsetTop) {
            tempTopHandler = 0 + _offsetTop;
        }
        else if (tempTopHandler + self.tinyWindow.height > pHeight + _offsetTop ) {
            tempTopHandler = pHeight + _offsetTop - self.tinyWindow.height;
        }

        let newTop = Math.round(tempTopHandler);
        let newHeight = Math.ceil(self.tinyWindow.height);
        updateSlidingHandler(newTop, newHeight);

        updateWid3();
    }

    function onMouseWheel(event) {
        let sign = (event.deltaY<0)?"-":"";
        let absDelta = Math.abs(event.deltaY);
        let value = ( absDelta > 4) ? (absDelta / 3) : absDelta;
        scroll(parseInt(sign + value));
    }

    function updateSlidingHandler(top, height) {
        $(self.handleId).css('top', (top - _offsetTop) + 'px');
        $(self.handleId).css('height', height + 'px');

        $timeout(function () {
            updateState(top, height, parentHeight);
        });
    }

    this.refreshHandler = function () {
        parentHeight = parseInt($(self.contentId).height());
        //self.parentHeight = parentHeight;
        self.updateSlidingHandlerByPercent(self.slidingBarState.top, self.slidingBarState.range);
    }

    this.updateSlidingHandlerByPercent = function (topPercent, rangePercent) {
        let newTop = Math.round((topPercent * parentHeight) / 100);
        let newHeight = Math.ceil((rangePercent * parentHeight) / 100);

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
        //if ( _scaleView ) return;
        logPlotCtrl.cropDisplay = true;
        //if ( parentHeight !== $(self.contentId).parent().parent().height()) return;
        let currentParentHeight = $(self.contentId).height();
        let scale = currentParentHeight / self.tinyWindow.height;
        let newParentHeight = Math.round(currentParentHeight * scale);
        let newTop = Math.round((self.slidingBarState.top * newParentHeight) / 100);
        
        $(self.contentId).height(newParentHeight);
        _offsetTop = newTop;
        $(self.contentId).css('top', '-' + newTop + 'px');
        _viCurve.doPlot();
    }

    this.resetView = function() {
        //_scaleView = false;
        logPlotCtrl.cropDisplay = false;
        let defaultParentHeight = $(self.contentId).parent().parent().height();
        _offsetTop = 0;
        $(self.contentId).height('auto').css('top', 0);
        _viCurve.doPlot();
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
