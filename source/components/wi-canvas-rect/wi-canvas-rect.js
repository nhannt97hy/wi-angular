const wiCanvasRectName = 'wiCanvasRect';
const moduleName = 'wi-canvas-rect';

function Controller(wiComponentService, $timeout) {
    let self = this;

    this.$onInit = function () {
    	wiComponentService.putComponent(self.name, self);
    }
    this.patternStyle = {
    	pattern: self.pattern,
    	foreground : self.foreground,
    	background : self.background
    }
    this.paint = function() {
        let graph = wiComponentService.getComponent(wiComponentService.GRAPH);
        let canvasHelper = graph.CanvasHelper;
        let canvas = $('#' + self.name)[0];
        if(!canvas) return;
        let context = canvas.getContext('2d');
        if(!context) return;
        context.clearRect(0,0, canvas.width, canvas.height);
        context.beginPath();
        canvasHelper.createPattern2(
            context, 
            self.pattern, 
            self.foreground, 
            self.background,
            function(img, option) {
                context.fillStyle = context.createPattern(img, option);
                context.rect(0, 0, self.width, self.height);
                context.fill();
            }
        );
    }
    this.$onChanges = function(changesObj) {
        if(changesObj) {
            self.paint();
        }
    }
}

let app = angular.module(moduleName, []);
app.component(wiCanvasRectName, {
    templateUrl: 'wi-canvas-rect.html',
    controller: Controller,
    controllerAs: wiCanvasRectName,
    bindings: {
        name: '@',
        pattern: '@',
        width: '@',
        height: '@',
        foreground: '@',
        background: '@'
    }
});

exports.name = moduleName;