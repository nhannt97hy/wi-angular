const componentName = 'wiSlidingbar';
const moduleName = 'wi-slidingbar';

const MIN_RANGE = 1;

function actual(selector, dim) {
    const tabElement = $(`.lm_item_container[style*="display: none"]`).has(selector);
    if (!tabElement.length) return $(selector)[dim]();
    tabElement.css({ display: 'block' });
    const result = $(selector)[dim]();
    tabElement.css({ display: 'none' });
    return result;
}

function Controller($scope, wiComponentService, wiApiService, $timeout) {
    let self = this;
    let _offsetTop = 0;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    //let _scaleView = false;
    let _viCurve = null;
    //let parentHeight = 0;
    let _tinyWindow = {
        top: 0,
        height: 0
    };
    // tiny windows by percent
    this.slidingBarState = {
        top0:0,
        range0: 100.,
        top: 0,
        range: MIN_RANGE
    };
    let __well = null;

    function getWell() {
        if (!__well) {
            __well = utils.findWellByLogplot(self.wiLogplotCtrl.id);
        }
        return __well;
    }

    function createPreview(idCurve, callback) {
        console.log(idCurve);
        if (!idCurve) {
            createPreviewWithDefault(callback);
            return;
        }
        let logplotId = self.wiLogplotCtrl.id;

        let well = utils.findWellByCurve(idCurve);
        // handle error when curve has no longer existed
        if(!well) {
            let request = {
                idPlot: self.wiLogplotCtrl.id,
                referenceCurve: null
            }
            wiApiService.editLogplot(request, function(res) {
                console.log(`response from server ${JSON.stringify(res)}`);
                callback && callback();
            })
            return;
        }
        let graph = wiComponentService.getComponent(wiComponentService.GRAPH);
        let minY = self.wiLogplotCtrl.getwiD3Ctrl().getMinDepth(); // well.topDepth;
        let maxY = self.wiLogplotCtrl.getwiD3Ctrl().getMaxDepth(); // well.bottomDepth;
        let stepY = well.step;
        let offsetY = well.topDepth;
        if(_viCurve && _viCurve.idCurve == idCurve) {
            _viCurve.updateWindowY(minY, maxY);   
            callback && callback();
        } else {
            wiApiService.infoCurve(idCurve, function (infoCurve) {
                let config = {
                    idCurve: idCurve,
                    minX: infoCurve.LineProperty ? infoCurve.LineProperty.minScale : 0,
                    maxX: infoCurve.LineProperty ? infoCurve.LineProperty.maxScale : 200,
                    minY: minY,
                    maxY: maxY,
                    yStep: stepY,
                    offsetY: offsetY,
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
                    const tabElement = $(`div[style*="display: none"]`).has(self.contentId);
                    if (tabElement.length) {
                        tabElement.css({display: 'block'});
                        tabElement.wrap('<div style="position: absolute; z-index: -1"></div>')
                            _viCurve = graph.createCurve(config, dataCurve, d3.select(self.contentId));
                        _viCurve.setProperties({displayType: config.scale});
                        _viCurve.doPlot();
                        setTimeout(() => {
                            tabElement.css({display: 'none'});
                            tabElement.unwrap();
                        }, 1000);
                    } else {
                        _viCurve = graph.createCurve(config, dataCurve, d3.select(self.contentId));
                        // _viCurve.setProperties({displayType: 'Logarithmic | Linear'})
                        _viCurve.setProperties({displayType: config.scale});
                        _viCurve.doPlot();
                    }
                    callback && callback();
                });
            })
        }
    }

    this.verifyDroppedIdCurve = function(idCurve) {
        return 1;
        // let well1 = utils.findWellByLogplot(self.wiLogplotCtrl.id);
        // let well2 = utils.findWellByCurve(idCurve) || {properties:{}};

        // if (!well1.properties.idWell || !well2.properties.idWell) return -1;
        // if (well1.properties.idWell && well2.properties.idWell && (well1.properties.idWell == well2.properties.idWell)) return 1;
        // return 0;
    }

    this.createPreview = createPreview;

    function createPreviewWithDefault(callback) {
        if(_viCurve && _viCurve.idCurve) {
            createPreview(_viCurve.idCurve, callback);
            return;
        }
        callback && callback();
        /*
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let logplotId = self.wiLogplotCtrl.id;
        let well = utils.findWellByLogplot(logplotId);
        if (!well) return;
        let firstCurve = well.children[0].children[0];

        createPreview(firstCurve.properties.idCurve);
        */

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
        let parentHeight = actual(self.contentId, 'height');
        let tempTinyWindowsHeight = _tinyWindow.height;
        let tempTinyWindowsTop = _tinyWindow.top;

        if (ui.size) {
            tempTinyWindowsHeight = (ui.size.height > parentHeight) ? parentHeight : ui.size.height;
        }
        if (ui.position) {
            tempTinyWindowsTop = ((ui.position.top > 0) ? ui.position.top : 0) + _offsetTop;
        }

        updateState(tempTinyWindowsTop, tempTinyWindowsHeight);
    }
    
    this.updateWid3 = updateWid3;
    function updateWid3() {
        let wiD3Controller = wiComponentService.getD3AreaForSlidingBar(self.name);
        let max = wiD3Controller.getMaxDepth();
        let min = wiD3Controller.getMinDepth();
        let low = min + (max - min) * self.slidingBarState.top / 100.;
        let high = low + (max - min) * self.slidingBarState.range / 100.;

        wiD3Controller.setDepthRange([low, high], true);
        wiD3Controller.processZoomFactor();
        //wiD3Controller.plotAll();
        wiD3Controller.updateScale();

        self.wiLogplotCtrl.emit('depth-range-updated', [low, high]);
    }

    function updateState(top, height) {
        let pHeight = actual(self.contentId, 'height');
        self.slidingBarState.top = top / pHeight * 100.;
        self.slidingBarState.range = height / pHeight * 100.;

        _tinyWindow.height = height;
        _tinyWindow.top = top;
    }

    let saveStateToServer = _.debounce(async function () {
        let wiD3Controller = wiComponentService.getD3AreaForSlidingBar(self.name);
        if (!wiD3Controller) return;
        let max = wiD3Controller.getMaxDepth();
        let min = wiD3Controller.getMinDepth();
        let low = min + (max - min) * self.slidingBarState.top / 100.;
        let high = low + (max - min) * self.slidingBarState.range / 100.;
        let logplotModel = await self.wiLogplotCtrl.getLogplotModelAsync(); 
        let newLogplot = {
            idPlot: logplotModel.properties.idPlot,
            cropDisplay: self.wiLogplotCtrl.cropDisplay,
            currentState: {
                top0: self.slidingBarState.top0,
                range0: self.slidingBarState.range0,
                top: low,
                bottom: high
            }
        }
        wiApiService.editLogplot(newLogplot, null, { silent: true });
    }, 1000);

    function getHandleId() {
        return '#sliding-handle' + self.name;
    }
    this.$onInit = function () {
        self.contentId = '#sliding-bar-content' + self.name;
        self.handleId = '#sliding-handle' + self.name;

        if (self.name) wiComponentService.putComponent(self.name, self);
    };

    this.onReady = function () {
        let parentHeight = actual(self.contentId, 'height');
        _tinyWindow = {
            top: 0,
            height: parentHeight / 10 || 1
        };

        // init tiny window height
        $(self.handleId).height(_tinyWindow.height);
        $(self.handleId).css('top', _tinyWindow.top + 'px');

        self.slidingBarState.top = _tinyWindow.top / parentHeight * 100.;
        self.slidingBarState.range = _tinyWindow.height / parentHeight * 100.;

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
            minHeight: getMinTinyWinHeight(),
            containment: "parent",
            handles: "n, s"
        });

        $(self.handleId).on("resize", function (event, ui) {
            event.stopPropagation();
            update(ui);
            updateWid3();
            //tungTrick(ui);
        });
        $(self.handleId).on("resizestop", function (event, ui) {
            event.stopPropagation();
            update(ui);
            updateWid3();
            //tungTrick(ui);
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

        let sensor = new ResizeSensor($(self.contentId), function () {
            self.refreshHandler();
            _viCurve && _viCurve.doPlot();
        });

        function handler() {
            self.refreshHandler();
            _viCurve && _viCurve.doPlot();
            if (!sensor || !sensor.detach) return;
            sensor.detach();
            sensor = new ResizeSensor($(self.contentId), function () {
                self.refreshHandler();
                _viCurve && _viCurve.doPlot();
            });
        }
        self.resizeHandler = resizeHandler;
        function resizeHandler(event) {
            let model = event.model;
            if (self.containerName) {
                if (model.type == 'logplot') return;
                let comboviewId = +self.containerName.replace('comboview', '');
                if (model.type == 'comboview' && comboviewId == model.properties.id) handler();
                return;
            }
            if (model.type == 'logplot' && model.id == self.wiLogplotCtrl.id) handler();
        }
        document.addEventListener('resize', self.resizeHandler);

        $(self.contentId).on("mousewheel", onMouseWheel);
        $(self.handleId).on("mousewheel", onMouseWheel);

        let dragMan = wiComponentService.getComponent(wiComponentService.DRAG_MAN);
        $(`wi-slidingbar[name=${self.name}]`).on('mouseover', function () {
            dragMan.wiSlidingBarCtrl = self;
        });
        $(`wi-slidingbar[name=${self.name}]`).on('mouseleave', function () {
            dragMan.wiSlidingBarCtrl = null;
            dragMan.wiD3Ctrl = null;
        });
        wiComponentService.on(wiComponentService.DELETE_MODEL, self.onDelete);
    };
    this.onDelete = function(model) {
        console.log('onDelete Sliding bar: ', model);
        switch(model.type){
            case 'curve':
            if(_viCurve && _viCurve.idCurve == model.id) {
                console.log('removing curve from sliding bar', _viCurve);
                let request = {
                    idPlot: self.wiLogplotCtrl.id,
                    referenceCurve: null 
                }
                wiApiService.editLogplot(request, function(res) {
                    console.log('response from server', res);
                    _viCurve.destroy();
                    _viCurve = null;
                })
            }
            break;
            default:
            break;
        }
    }

    this.scroll = scroll;

    function scroll(sign) {
        const SCROLL_FACTOR = 0.15;
        const MIN_SCROLL = 2;

        let wholeHeight = actual(self.contentId, 'height');
        let viewHeight = actual($(self.contentId).parent(), 'height');

        let realDeltaY = wholeHeight * self.slidingBarState.range / 100. * SCROLL_FACTOR;
        realDeltaY = (realDeltaY > MIN_SCROLL)?realDeltaY:MIN_SCROLL;
        realDeltaY *= sign;
        let tempTopHandler = _tinyWindow.top - realDeltaY;

        if (tempTopHandler < 0 + _offsetTop) {
            tempTopHandler = 0 + _offsetTop;
        }
        else if (tempTopHandler + _tinyWindow.height > viewHeight + _offsetTop ) {
            tempTopHandler = viewHeight + _offsetTop - _tinyWindow.height;
        }

        let newTop = tempTopHandler;
        let newHeight = _tinyWindow.height;
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
        if(!_.isNumber(_offsetTop)) _offsetTop = 0;
        $(self.handleId).css('top', (top - _offsetTop) + 'px');
        $(self.handleId).css('height', height + 'px');
        $(self.handleId).resizable("option", "minHeight", getMinTinyWinHeight());
        updateState(top, height);
    }

    this.refreshHandler = function () {
        //parentHeight = $(self.contentId).height();
        _doScaleView(self.slidingBarState);
        self.updateSlidingHandlerByPercent(self.slidingBarState.top, self.slidingBarState.range);
    }

    this.updateSlidingHandlerByPercent = function (topPercent, rangePercent) {
        //let newTop = Math.round((topPercent * parentHeight) / 100);
        //let newHeight = Math.ceil((rangePercent * parentHeight) / 100);
        let parentHeight = actual(self.contentId, 'height');
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
        saveStateToServer();
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
    }

    let __minRange = -1;
    function getMinRange() {
        const MIN_STEPS_OF_VIEW = 20;
        if (__minRange < 0) {
            let wiD3Controller = wiComponentService.getD3AreaForSlidingBar(self.name);
            let max = wiD3Controller.getMaxDepth();
            let min = wiD3Controller.getMinDepth();
            // __minRange = MIN_STEPS_OF_VIEW * getWell().step / (max - min);

            let step = _viCurve ? viCurve.yStep:0.1;
            __minRange = MIN_STEPS_OF_VIEW * step / (max - min);
        }
        return __minRange;
    }
    function getMinTinyWinHeight() {
        return Math.max(10, getMinRange() * actual(self.contentId, 'height'));
    }

    this.scaleView = function(top0, range0, force) {
        const CROPVIEW_FACTOR = 5;
        if (_tinyWindow.height < CROPVIEW_FACTOR * getMinTinyWinHeight() && !force) {
            toastr.warning('Current view is too small for cropping');
            $(self.handleId + " .sliding-handle-border").addClass('too-small');
            setTimeout(function() {
                $(self.handleId + " .sliding-handle-border").removeClass('too-small');
            }, 200);
            return;
        }
        self.wiLogplotCtrl.cropDisplay = true;

        self.slidingBarState.top0 = top0?top0:self.slidingBarState.top;
        self.slidingBarState.range0 = range0?range0:self.slidingBarState.range;
        _doScaleView(self.slidingBarState);
        saveStateToServer();
        return;
    }

    function redrawLogplot() {
        const wiD3Controller = wiComponentService.getD3AreaForSlidingBar(self.name);
        wiD3Controller.updateScale();
    }

    function _doScaleView(slidingBarState) {
        let viewHeight = actual($(self.contentId).parent().parent(), 'height');
        let newParentHeight = viewHeight * 100. / slidingBarState.range0;
        let newTop = (slidingBarState.top0 * newParentHeight) / 100.;

        $(self.contentId).height(newParentHeight);

        _offsetTop = newTop;
        $(self.contentId).css('top', '-' + newTop + 'px');
        if (_viCurve) _viCurve.doPlot();

        // TUNG for limiting height of resizable
        $(self.handleId).resizable('option', 'minHeight', getMinTinyWinHeight());
        
        redrawLogplot();
    }

    this.resetView = function() {
        self.wiLogplotCtrl.cropDisplay = false;
        self.slidingBarState.top0 = 0;
        self.slidingBarState.range0 = 100.;
        _doScaleView(self.slidingBarState);
        saveStateToServer();
        return;

        let defaultParentHeight = actual($(self.contentId).parent().parent(), 'height');
        _offsetTop = 0;
        $(self.contentId).height('auto').css('top', 0);


        if (_viCurve) _viCurve.doPlot();

        // TUNG for limiting height of resizable
        $(self.handleId).resizable('option', 'minHeight', getMinTinyWinHeight());

        saveStateToServer();
    }

    this.updateScale = function (scale) {
        const handleElem = $(self.handleId);
        const currentViewContainer = handleElem.find('.current-view-container');
        currentViewContainer.find('.current-view-top').text(scale.currentView[0]);
        currentViewContainer.find('.current-view-bottom').text(scale.currentView[1]);
        const css = {
            default: {
                height: '100%',
                top: 0
            },
            overflow: {
                height: 'calc(100% + 40px)',
                top: -20
            },
            top: {
                height: 'calc(100% + 20px)',
                top: 0
            },
            bottom: {
                height: 'calc(100% + 20px)',
                top: -20
            }
        }
        if (handleElem.height() < 40) {
            currentViewContainer.css(css.overflow);
            if (handleElem.css('top').replace('px','') < 20) currentViewContainer.css(css.top)
            else if ($(self.contentId).height() - handleElem.height() - handleElem.css('top').replace('px','') < 20) currentViewContainer.css(css.bottom);
        } else currentViewContainer.css(css.default);
    }

	this.$onDestroy = function () {
        wiComponentService.dropComponent(self.name);
        document.removeEventListener('resize', self.resizeHandler);
	}
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-slidingbar.html',
    controller: Controller,
    controllerAs: componentName,
    transclude: true,
    bindings: {
        name: '@',
        containerName: '@',
        wiLogplotCtrl: "<"
    }
});

exports.name = moduleName;
exports.componentName = componentName;
