const moduleName = 'wi-resizable-x';
const componentName = 'wiResizableX';

function Controller($timeout) {
    var self = this;
    var _x = 0;
    this.onResizeStart = function($event) {
        console.log('mousedown');
        _x = $event.clientX;
    }
    this.onResizing = function($event, factor) {
        if ($event.buttons) {
            var offsetX = $event.clientX - _x;
            _x = $event.clientX;
       //     $timeout(function() {
                self.width += (factor*offsetX);
                self.width = (self.width < 0)?self.minWidth:self.width;
       //     });
        }
    }
    this.onResizeEnd = function($event, factor) {
        console.log('mouse up');
        var offsetX = $event.clientX - _x;
        $timeout(function() {
            self.width += (factor*offsetX);
            self.width = (self.width < 0)?self.minWidth:self.width;
        });
    }

    this.$onInit = function() {
        self.minWidth = self.minWidth?self.minWidth:60;
    }
}
let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-resizable-x.html',
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        width: "<",
        minWidth: "<",
        resizeLeft: "<",
        resizeRight: "<"
    },
    transclude: true
});

exports.name = moduleName;
