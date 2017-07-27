const wiCanvasRectName = 'wiCanvasRect';
const moduleName = 'wi-canvas-rect';

function Controller(wiComponentService, $timeout) {
    let self = this;

    this.$onInit = function () {
    	console.log(self.name, self.pattern, self.width, self.height, self.foreground);
    }
    this.patternStyle = {
    	pattern: self.pattern,
    	foreground : self.foreground,
    	background : self.background
    }
    this.onReady = function() {
        console.log("onReady", self.name, self.pattern, self.width);
    	let graph = wiComponentService.getComponent(wiComponentService.GRAPH);
    	let canvasHelper = graph.CanvasHelper;

		let context = $('#' + self.name)[0].getContext('2d');
		context.beginPath();
		canvasHelper.createPattern2(
			context, 
			self.pattern, 
			self.foreground, 
			self.background,
			function(img, option) {
				context.fillStyle = context.createPattern(img, option);
				context.rect(0, 0, 200, 20);
				context.fill();
			}
		);
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