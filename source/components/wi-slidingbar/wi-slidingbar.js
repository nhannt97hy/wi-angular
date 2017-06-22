const componentName = 'wiSlidingbar';
const moduleName = 'wi-slidingbar';

const MIN_RANGE = 30;

var slidingBarState = {
    top: 0,
    range: MIN_RANGE
};

function Controller($scope, $timeout, wiSlidingbar) {
    var self = this;
    self.tinyWindow = null;
    var parentHeight = 0;

    function update(ui) {
        parentHeight = parseInt($("#sliding-bar-content").height());

        if (ui.size) {
            self.tinyWindow.height = (ui.size.height > parentHeight) ? parentHeight : ui.size.height;
        }
        if (ui.position) {
            self.tinyWindow.top = (ui.position.top > 0) ? ui.position.top : 0;
        }
        wiSlidingbar.top = Math.round(self.tinyWindow.top / parentHeight * 100);
        wiSlidingbar.range = Math.round(self.tinyWindow.height / parentHeight * 100);

        // call apply to call all parent scope watcher
        $scope.$apply();
    }

    this.$postLink = function () {
        parentHeight = parseInt($("#sliding-bar-content").height());
        var initialHeight = Math.round(parentHeight * MIN_RANGE / 100);

        self.tinyWindow = {
            height: initialHeight,
            top: 0
        };

        $("#sliding-handle").draggable({
            axis: "y",
            containment: "parent"
        }).resizable({
            minHeight: initialHeight,
            containment: "parent",
            handles: "n, s"
        });

        $timeout(function () {
            setSlidingHandleHeight();
        }, 0);

        $("#sliding-handle").on("resize", function (event, ui) {
            update(ui);
        });

        $("#sliding-handle").on("drag", function (event, ui) {
            update(ui);
        });
    };

    function setSlidingHandleHeight() {
        parentHeight = parseInt($("#sliding-bar-content").height());

        var initialHeight = Math.round(parentHeight * MIN_RANGE / 100);
        $('#sliding-handle').height(initialHeight);
        self.tinyWindow.height = initialHeight;
    }
}
var app = angular.module(moduleName, []);

app.factory(componentName, function () {
    return slidingBarState;
});

app.component(componentName, {
    templateUrl: 'wi-slidingbar.html',
    controller: Controller,
    controllerAs: componentName,
    transclude: true,
    bindings: {}
});

exports.name = moduleName;
exports.componentName = componentName;
