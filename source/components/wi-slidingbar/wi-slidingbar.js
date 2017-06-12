const componentName = 'wiSlidingbar';
const moduleName = 'wi-slidingbar';

function Controller() {
    var self = this;
    this.$onInit = function () {
        $("#tiny-screen").draggable({
            axis: "y",
            containment: "parent"
        });

        $("#tiny-screen").resizable({
            containment: "parent",
            minHeight: 150,
            minWidth: 300,
            maxWidth: 300,
            handles: "n, s"
        });

        $( "#tiny-screen" ).on( "resize", function( event, ui ) {
            console.log(ui);
        } );
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
