let Utils = require('./visualize-utils');
let Drawing = require('./visualize-drawing');

module.exports = ViImage;

Utils.extend(Drawing, ViImage);

function ViImage(config) {
    Drawing.call(this, config);
    console.log('config', config);

    this.src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSarZEJPiMYzVmU_95UQAahZB2Fi6hH24UstuGJC-23Qzsvoktr';
    this.top = null;
    this.bottom = null;
    this.left = 50;
    this.width =  50;
    this.image = null;

    this.setProperties(config);
}

ViImage.prototype.PROPERTIES = ['src', 'top', 'bottom', 'left', 'width'];
ViImage.prototype.FLOAT_PROPERTIES = ['top', 'bottom', 'left', 'width'];

ViImage.prototype.getProperties = function() {
    let props = Utils.only(this, this.PROPERTIES);
    props.idImage = this.image;
    return props;
}

ViImage.prototype.setProperties = function(props) {
    let self = this;
    Utils.merge(this, Utils.only(props, this.PROPERTIES), function(props, key) {
        return (self.FLOAT_PROPERTIES.indexOf(props) > -1) ? parseFloat(props[key]) : props[key];
    });
    Utils.setIfNotNull(this, 'id', props.idImage);
}

ViImage.prototype.init = function(plotContainer) {
    Drawing.prototype.init.call(this, plotContainer);
    let rect = plotContainer
        .node()
        .getBoundingClientRect();

    this.canvas = plotContainer.append('canvas')
        .attr('class', 'vi-track-drawing');

    this.adjustSize(rect);
    this.ctx = this.canvas.node().getContext('2d');
}

ViImage.prototype.doPlot = function() {
    this.adjustSize(this.root.node().getBoundingClientRect());
    if (!this.src) return;

    let transformY = this.getTransformY();
    let viewportX = this.getViewportX();
    let viewportY = this.getViewportY();
    let vpWidth = viewportX[1] - viewportX[0];
    let vpHeight = viewportY[1] - viewportY[0];

    this.ctx.clearRect(viewportX[0], viewportY[0], vpWidth, vpHeight);

    let x = viewportX[0] + this.left / 100 * vpWidth;
    let y = transformY(this.top);
    let width = vpWidth * this.width / 100;
    let height = Math.abs(transformY(this.bottom) - y);

    if (!this.image || this.image.src != this.src) {
        this.image = new Image();
        this.image.src = this.src;

        let self = this;
        this.image.onload = function() {
            self.ctx.drawImage(self.image, x, y, width, height);
        }
    }
    else {
        this.ctx.drawImage(this.image, x, y, width, height);
    }
}
