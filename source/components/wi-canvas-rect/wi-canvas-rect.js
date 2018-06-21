const wiCanvasRectName = 'wiCanvasRect';
const moduleName = 'wi-canvas-rect';

function Controller(wiComponentService, wiPatternService, $timeout) {
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
        if(self.pattern.toLowerCase() == "none" || self.pattern.toLowerCase() == "solid") {
            context.fillStyle = self.background;
            context.fillRect(0, 0, canvas.width, canvas.height);
            return;
        }
        wiPatternService.createPattern(context, self.pattern, self.foreground, self.background, function(pattern) {
            context.fillStyle = pattern;
            context.fillRect(0, 0, canvas.width, canvas.height);
        })
    }
    this.$onChanges = function(changesObj) {
        if(changesObj) {
            $timeout(function() {
                self.paint();
            },50)
        }
    }

	this.$onDestroy = function () {
		wiComponentService.dropComponent(self.name);
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