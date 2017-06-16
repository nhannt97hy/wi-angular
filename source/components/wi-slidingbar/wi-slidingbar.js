const componentName = 'wiSlidingbar';
const moduleName = 'wi-slidingbar';

function Controller() {
    var self = this;
    self.tinyWindow = {
        height: 150,
        top: 0
    };

    this.$onInit = function () {
        $("#tiny-screen").draggable({
            axis: "y",
            containment: "parent"
        }).resizable({
            minHeight: 150,
            handles: "n, s"
        });

        $( "#tiny-screen" ).on( "resize", function( event, ui ) {
            self.tinyWindow.height = ui.size.height;
            console.log('height: ', self.tinyWindow.height);
        });
        $( "#tiny-screen" ).on( "drag", function( event, ui ) {
            self.tinyWindow.top = ui.position.top;
            console.log('top: ', self.tinyWindow.top);
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
