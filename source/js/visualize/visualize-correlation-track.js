let visUtils = require('./visualize-utils');
let gUtils = require('../utils');
let Track = require('./visualize-track');

module.exports = CorrelationTrack;
visUtils.extend(Track, CorrelationTrack);

function CorrelationTrack(config) {
    Track.call(this, config);
    this.leftZoneset = config.leftZoneset;
    this.rightZoneset = config.rightZoneset;
}

CorrelationTrack.prototype.init = function(baseElement) {
    Track.prototype.init.call(this, baseElement); 
    this.trackContainer.attr('class', 'vi-correlation-track-container');
    this.svgContainer = this.plotContainer.append('svg')
        .attr('vi-correlation-track-svg-container');
}

CorrelationTrack.prototype.doPlot = function() {
    Track.prototype.doPlot.call(this);
}
