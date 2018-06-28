let visUtils = require('./visualize-utils');
let gUtils = require('../utils');
let Track = require('./visualize-track');

module.exports = CorrelationTrack;
visUtils.extend(Track, CorrelationTrack);

function CorrelationTrack(config) {
    Track.call(this, config);
    this.name = config.name;
    this.width = config.width || 80;
    this.left = config.left;
    this.right = config.right;
}

CorrelationTrack.prototype.init = function(baseElement) {
    Track.prototype.init.call(this, baseElement); 
    this.trackContainer.classed('vi-correlation-track-container', true);
}

CorrelationTrack.prototype.doPlot = function() {
    Track.prototype.doPlot.call(this);
}

CorrelationTrack.prototype.setBackgroundColor = function(color) {
    this.trackContainer
        .style('background-color', 'transparent');
    if(this.left && this.right) {
        if(!this.backgroundSvgContainer) 
            this.backgroundSvgContainer = this.bodyContainer.append('svg')
                .style('width', '100%')
                .attr('height', '100%')
                .attr('class', 'vi-track-background');
        let transformY = this.getTransformY();
        if (transformY) {
            let minYLeft = transformY(this.left.well.topDepth);
            let maxYLeft = transformY(this.left.well.bottomDepth);
            let minYRight = transformY(this.right.well.topDepth);
            let maxYRight = transformY(this.right.well.bottomDepth);
            let viewportX = this.getViewportX();

            let points = [
                {x: viewportX[0], y: minYLeft},
                {x: viewportX[1], y: minYRight},
                {x: viewportX[1], y: maxYRight},
                {x: viewportX[0], y: maxYLeft},
            ]

            let bgPolygon = this.backgroundSvgContainer.selectAll('polygon').data([points]);
            bgPolygon.enter()
                .append('polygon')
                .attr('stroke', 'black')
                .attr('stroke-width', .5);
            bgPolygon
                .attr('points', function(d) {
                    return d.map(point => [point.x, point.y].join(',')).join(' ');
                })
                .attr('fill', color)
            bgPolygon.exit()
                .remove();
        }
    }
}