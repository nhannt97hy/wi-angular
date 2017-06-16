const componentName = 'wiSlidingbar';
const moduleName = 'wi-slidingbar';

const MIN_RANGE = 10;

app.factory(componentName, function() {
    var slidingBarState = {
        top: 0,
        range: MIN_RANGE
    };
    return slidingBarState;
});

function Controller(wiSlidingbar) {
    var self = this;
    self.tinyWindow = {
        height: 150,
        top: 0
    };
    var parentHeight = 0;

    function update(ui) {
        parentHeight = parseInt($("#sliding-bar-content").height());
        if (ui.size) {
            self.tinyWindow.height = (ui.size.height > parentHeight)?parentHeight:ui.size.height;
        }
        if(ui.position) {
            self.tinyWindow.top = (ui.position.top > 0) ? ui.position.top : 0;
        }
        wiSlidingbar.top = Math.round(self.tinyWindow.top/parentHeight*100);
        wiSlidingbar.range = Math.round(self.tinyWindow.height/parentHeight*100);
    }
    this.$onInit = function () {
        parentHeight = parseInt($("#sliding-bar-content").height());
        var initialHeight = Math.round(parentHeight * MIN_RANGE/100);
        console.log(MIN_RANGE);
        $("#sliding-handle").draggable({
            axis: "y",
            containment: "parent"
        }).resizable({
            minHeight: initialHeight,
            containment: "parent",
            handles: "n, s"
        });
        $('#sliding-handle').height(initialHeight);

        $( "#sliding-handle" ).on( "resize", function( event, ui ) {
            update(ui);
            //console.log(getValues());
        });
        $( "#sliding-handle" ).on( "drag", function( event, ui ) {
            update(ui);
            //console.log(getValues());
        });
    }
}
var app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-slidingbar.html',
    controller: Controller,
    controllerAs: componentName,
    transclude: true,
    bindings: {}
});


exports.name = moduleName;
