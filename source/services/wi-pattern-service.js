const wiServiceName = 'wiPatternService';
const moduleName = 'wi-pattern-service';

let app = angular.module(moduleName, []);

app.factory(wiServiceName, function(wiComponentService, wiApiService) {
	return new Service(wiComponentService, wiApiService); 
});

function Service(wiComponentService, wiApiService) {
	this.wiComponentService = wiComponentService;
	this.wiApiService = wiApiService;
	
	/*this.patternList = {
		basement: {
			src: 'img/pattern/Breccia 1.png'
		},
        chert: {
        	src: 'img/pattern/Breccia 2.png'
        },
        dolomite: {
        	src: 'img/pattern/Basaltic flows.png'
        },
        limestone: {
        	src:'img/pattern/Bedded chert 1.png'
        },
        sandstone: {
        	src: 'img/pattern/Bedded chert 2.png'
        },
        shale: {
        	src: 'img/pattern/Cherty limestone 1.png'
        },
        siltstone:{ 
        	src: 'img/pattern/Cherty limestone 2.png'
        }
	};*/
}
Service.prototype.patternList = function() {
	return this.wiComponentService.getComponent(this.wiComponentService.PATTERN);
}
Service.prototype.getPattern = function(patternName) {
	let self = this;
	this.patternList = this.wiComponentService.getComponent(this.wiComponentService.PATTERN);
	let patternEntry = this.patternList[patternName];
	if (!patternEntry ) {
		return new Promise(function(resolve) {
			resolve(null);
		});
	}
	if (patternEntry.promise) {
		return patternEntry.promise;
	}

	let promise = new Promise(function(resolve, reject) {
		let image = patternEntry.data;
	    if(image) {
	    	resolve(image);
	    	return;
		}
	    image = new Image();
	    
	    image.src = self.patternList[patternName].src;
	    // image.crossOrigin = "anonymous";
	    image.onload = function() {
	    	self.patternList[patternName].promise = null;
			self.patternList[patternName].data = image;
			resolve(image);
	    }
	});
	patternEntry.promise = promise;
	return promise;
};
	
Service.prototype.blendColor = function(image, foreground, background) {
	let utils = this.wiComponentService.getComponent(this.wiComponentService.UTILS);
	
	if (!image) return null;
	let fgColor = null, bgColor = null;
	if(foreground.slice(0, 3) !== 'rgb') fgColor = utils.hexToRgbA(foreground)
		else fgColor = utils.rgbaStringToObj(foreground);
	if(background.slice(0, 3) !== 'rgb') bgColor = utils.hexToRgbA(background)
		else bgColor = utils.rgbaStringToObj(background);

	let canvas = document.createElement('canvas');
	canvas.width = image.width;
	canvas.height = image.height;

    let ctx = canvas.getContext('2d');
	ctx.drawImage(image, 0, 0);
	let dataImg = ctx.getImageData(0, 0, 128, 128);
    var pixels = dataImg.data;
    for(var i = 0; i < pixels.length; i+=4) {
        let existingAlpha = pixels[i+3]/255;
        
        pixels[i] = fgColor.r * existingAlpha + bgColor.r * (1-existingAlpha);
        pixels[i+1] = fgColor.g * existingAlpha + bgColor.g * (1-existingAlpha); 
        pixels[i+2] = fgColor.b * existingAlpha + bgColor.b * (1-existingAlpha);
        let newAlpha = fgColor.a * existingAlpha + bgColor.a * (1-existingAlpha);
        pixels[i+3] = parseInt(255 * newAlpha);
    }
    ctx.putImageData(dataImg, 0, 0);
    return canvas;
}

Service.prototype.createPattern = async function (context, name, foreground, background, callback) {
	let self = this;
	let image = await self.getPattern(name);
	let canvas = self.blendColor(image, foreground, background);
	if (!canvas) {
		callback(background);
		return;
	} 
	let pattern = context.createPattern(canvas, 'repeat');
	callback(pattern);
};
Service.prototype.createPatternSync = async function (context, name, foreground, background) {
	let self = this;
	let image = await self.getPattern(name);
	let canvas = self.blendColor(image, foreground, background);
	if (!canvas) {
		return background;
	} 
	let pattern = context.createPattern(canvas, 'repeat');
	return pattern;
}
module.exports.name = moduleName;

