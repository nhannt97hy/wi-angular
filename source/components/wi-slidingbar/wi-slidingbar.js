const componentName = 'wiSlidingbar';
const moduleName = 'wi-slidingbar';

const MIN_RANGE = 1;

function Controller($scope, wiComponentService, wiApiService, $timeout) {
    let self = this;
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

    function createPreview1(idCurve) {
        let logPlotName = self.name.replace('Slidingbar', '');
        let logPlotCtrl = wiComponentService.getComponent(logPlotName);
        let logplotId = logPlotCtrl.id;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);

        let well = utils.findWellByLogplot(logplotId);
        let graph = wiComponentService.getComponent(wiComponentService.GRAPH);
        let minY = parseFloat(well.properties.topDepth);
        let maxY = parseFloat(well.properties.bottomDepth);
        let stepY = parseFloat(well.properties.step);
        console.log('%%%%%%%%%%%%%%%');
        utils.getCurveData(wiApiService, idCurve, function(err, data) {
            let config = {
                minY: minY,
                maxY: maxY,
                yStep: stepY,
                offsetY: minY,
                line: {
                    color: 'blue'
                }
            }
            if (_viCurve) _viCurve.destroy();
            _viCurve = graph.createCurve(config, data, d3.select(self.contentId));
            _viCurve.doPlot();
        });
    }
    this.createPreview1 = createPreview1;
    function createPreview() {
        let logPlotName = self.name.replace('Slidingbar', '');
        let logPlotCtrl = wiComponentService.getComponent(logPlotName);
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let logplotId = logPlotCtrl.id;
        let well = utils.findWellByLogplot(logplotId);
        if (!well) return;
        let firstCurve = well.children[0].children[0];

        createPreview1(firstCurve.properties.idCurve);

        /*utils.getCurveData(wiApiService, firstCurve.properties.idCurve, function(err, data) {
            let config = {
                minY: parseFloat(well.properties.topDepth),
                maxY: parseFloat(well.properties.bottomDepth),
                yStep: parseFloat(well.properties.step),
                offsetY: parseFloat(well.properties.topDepth),
                line: {
                    color: 'blue'
                }
            }
            let viCurve = graph.createCurve(config, data, d3.select(self.contentId));
            viCurve.doPlot();
        });*/
    }

    function update(ui) {
        parentHeight = parseInt($(self.contentId).height());
        let tempTinyWindowsHeight = self.tinyWindow.height;
        let tempTinyWindowsTop = self.tinyWindow.top;

        if (ui.size) {
            tempTinyWindowsHeight = (ui.size.height > parentHeight) ? parentHeight : ui.size.height;
        }
        if (ui.position) {
            tempTinyWindowsTop = (ui.position.top > 0) ? ui.position.top : 0;
        }

        $timeout(function () {
            updateState(tempTinyWindowsTop, tempTinyWindowsHeight, parentHeight);
        });
    }

    function updateState(top, height, parentHeight) {
        self.slidingBarState.top = top / parentHeight * 100;
        self.slidingBarState.range = height / parentHeight * 100;

        self.tinyWindow.height = height;
        self.tinyWindow.top = top;
    }

    this.$onInit = function () {
        self.contentId = '#sliding-bar-content' + self.name;
        self.handleId = '#sliding-handle' + self.name;

        if (self.name) wiComponentService.putComponent(self.name, self);
    };

    this.onReady = function () {
        parentHeight = parseInt($(self.contentId).height());
        self.parentHeight = parentHeight;
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
        });

        $(self.handleId).on("drag", function (event, ui) {
            event.stopPropagation();
            update(ui);
        });

        createPreview();

        new ResizeSensor($(self.contentId), function() {
            let currentParentHeight = parseInt($(self.contentId).height());

            if (currentParentHeight !== parentHeight) self.refreshHandler();
        });

        $(self.contentId).on("mousewheel", onMouseWheel);
        $(self.handleId).on("mousewheel", onMouseWheel);

        console.log('**********:',$(self.contentId));

        let dragMan = wiComponentService.getComponent(wiComponentService.DRAG_MAN);
        $(self.contentId).on('mouseover', function() {
            console.log('mouseover');
            dragMan.wiSlidingBarCtrl = self;
        });

        $(self.contentId).on('mouseleave', function() {
            console.log('mouseleave');
            dragMan.wiSlidingBarCtrl = null;
        });

        function onMouseWheel(event) {
            let tempTopHandler = self.tinyWindow.top - event.deltaY;

            if (tempTopHandler < 0) {
                tempTopHandler = 0;
            } else if (tempTopHandler + self.tinyWindow.height > parentHeight) {
                tempTopHandler = parentHeight - self.tinyWindow.height;
            }

            let newTop = Math.round(tempTopHandler);
            let newHeight = Math.ceil(self.tinyWindow.height);
            updateSlidingHandler(newTop, newHeight);
        }

        function updateSlidingHandler(top, height) {
            $(self.handleId).css('top', top + 'px');
            $(self.handleId).css('height', height + 'px');

            $timeout(function () {
                updateState(top, height, parentHeight);
            });
        }

        this.refreshHandler = function() {
            parentHeight = parseInt($(self.contentId).height());
            self.parentHeight = parentHeight;
            self.updateSlidingHandlerByPercent(self.slidingBarState.top, self.slidingBarState.range);
        }

        this.updateSlidingHandlerByPercent = function (topPercent, rangePercent) {
            let newTop = Math.round((topPercent * parentHeight) / 100);
            let newHeight = Math.ceil((rangePercent * parentHeight) / 100);

            if (newTop < 0) newTop = 0;

            if (newHeight + newTop > parentHeight && newHeight <= parentHeight) {
                newTop = parentHeight - newHeight;
            } else if (newHeight + newTop > parentHeight && newHeight > parentHeight){
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

    };
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
