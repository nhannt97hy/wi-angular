const componentName = 'wiSlidingbar';
const moduleName = 'wi-slidingbar';

const MIN_RANGE = 1;

function Controller($scope, wiComponentService, $timeout) {
    let self = this;

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
        let initialHeight = Math.round(parentHeight * (MIN_RANGE) / 100);

        self.tinyWindow = {
            top: 0,
            height: parentHeight
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

        new ResizeSensor($(self.contentId), function() {
            let currentParentHeight = parseInt($(self.contentId).height());

            if (currentParentHeight !== parentHeight) self.refreshHandler();
        });

        $(self.contentId).on("mousewheel", onMouseWheel);
        $(self.handleId).on("mousewheel", onMouseWheel);

        function onMouseWheel(event) {
            let tempTopHandler = self.tinyWindow.top + event.deltaY;

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
