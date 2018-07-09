let visUtils = require('./visualize-utils');
let gUtils = require('../utils');
let Track = require('./visualize-track');

module.exports = CorrelationTrack;
visUtils.extend(Track, CorrelationTrack);

function CorrelationTrack(config) {
    Track.call(this, config);
    this.name = config.name;
    this.width = config.width || 80;
    this.leftTrack = config.leftTrack;
    this.rightTrack = config.rightTrack;
}

CorrelationTrack.prototype.init = function(baseElement) {
    Track.prototype.init.call(this, baseElement); 
    this.trackContainer.classed('vi-correlation-track-container', true);
}

CorrelationTrack.prototype.doPlot = function() {
    Track.prototype.doPlot.call(this);

    if (this.leftTrack && this.rightTrack 
        && this.leftTrack.viTrack.idZoneSet && this.rightTrack.viTrack.idZoneSet) {
        let leftZoneSet = this.leftTrack.getProperties().zone_set;
        let rightZoneSet = this.rightTrack.getProperties().zone_set;
        if(leftZoneSet && rightZoneSet) {
            this.drawCorrelationZones(); 
        } 
    } else {
        this.removeAllCorrelationZones();
    }

}

CorrelationTrack.prototype.drawCorrelationZones = function () {
    let leftZones = this.leftTrack.getProperties().zone_set.zones; 
    let rightZones = this.rightTrack.getProperties().zone_set.zones;
    let leftViZones = this.leftTrack.viTrack.getZones();
    if (!leftZones || !rightZones || !leftZones.length || !rightZones.length) return;
    let self = this;
    let transformY = this.getTransformY();
    let viewportX = this.getViewportX();
    let pointsList = [];

    leftZones.forEach((leftZone, leftIdx) => {
        let rightZone = rightZones[leftIdx];
        if(rightZone && leftZone.idZoneTemplate == rightZone.idZoneTemplate) {
            let minYLeft = transformY(leftZone.startDepth);
            let maxYLeft = transformY(leftZone.endDepth);
            let minYRight = transformY(rightZone.startDepth);
            let maxYRight = transformY(rightZone.endDepth);

            let pointsGroup = [
                {x: viewportX[0], y: minYLeft},
                {x: viewportX[1], y: minYRight},
                {x: viewportX[1], y: maxYRight},
                {x: viewportX[0], y: maxYLeft},
            ]
            pointsList.push({
                points: pointsGroup,
                fillStyle: leftViZones[leftIdx].rect.attr('fill')
            });
        }
    })

    let polygons = this.svgContainer.selectAll('polygon.vi-correlation-zone').data(pointsList);
    polygons.enter()
        .append('polygon')
            .classed('vi-correlation-zone', true)
            .attr('stroke', 'black')
            .attr('stroke-width', 0.5);
    polygons
        .attr('points', d => d.points.map(point => [point.x, point.y].join(',')).join(' '))
        .attr('fill', d => d.fillStyle)
    polygons
        .exit()
        .remove();
}

CorrelationTrack.prototype.removeAllCorrelationZones = function() {
    this.svgContainer.selectAll('polygon.vi-correlation-zone').remove();
}

CorrelationTrack.prototype.setBackgroundColor = function(color) {
    this.trackContainer
        .style('background-color', 'transparent');
    if(this.leftTrack && this.rightTrack) {
        if(!this.backgroundSvgContainer) 
            this.backgroundSvgContainer = this.bodyContainer.append('svg')
                .style('width', '100%')
                .attr('height', '100%')
                .attr('class', 'vi-track-background');
        let transformY = this.getTransformY();
        let leftWell = this.leftTrack.getWellProps();
        let rightWell = this.rightTrack.getWellProps();
        if (transformY && leftWell && rightWell) {
            let minYLeft = transformY(leftWell.topDepth);
            let maxYLeft = transformY(leftWell.bottomDepth);
            let minYRight = transformY(rightWell.topDepth);
            let maxYRight = transformY(rightWell.bottomDepth);
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
