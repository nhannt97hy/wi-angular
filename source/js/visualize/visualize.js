/**
 * A module for data visualization
 * @module visualize
 */

let DepthTrack = require('./visualize-depth-track');
let LogTrack = require('./visualize-log-track');
let ImageTrack = require('./visualize-image-track');
let ZoneTrack = require('./visualize-zone-track');
let ObjectTrack = require('./visualize-object-track');
let Crossplot = require('./visualize-crossplot');
let Curve = require('./visualize-curve');
let CanvasHelper = require('./visualize-canvas-helper');
let Histogram = require('./visualize-histogram');
let neuralNetworkPlayground = require('./neural-network/visualize-neural-network-playground');
let visualizeWiPlot = require('./visualize-wi-plot');

let Selection = require('./visualize-selection');

exports.CanvasHelper = CanvasHelper;

/**
 * Create and draw a new Log Track inside a specified DOM element
 * @param {Object} config - Configurations of new Log Track
 * @param {Object} domElem - The DOM element to contain the track
 * @returns {Object} The created track
 */
exports.createLogTrack = function(config, domElem, wiApiService) {
    let logTrack = new LogTrack(config, wiApiService);
    logTrack.init(domElem);
    return logTrack;
}

/**
 * Create and draw a new Depth Track inside a specified DOM element
 * @param {Object} config - Configurations of new Depth Track
 * @param {Object} domElem - The DOM element to contain the track
 * @returns {Object} The created track
 */
exports.createDepthTrack = function(config, domElem) {
    let depthTrack = new DepthTrack(config);
    depthTrack.init(domElem);
    return depthTrack;
}

/**
 * Create and draw a new Zone Track inside a specified DOM element
 * @param {Object} config - Configurations of new Zone Track
 * @param {Object} domElem - The DOM element to contain the track
 * @returns {Object} The created track
 */
exports.createZoneTrack = function(config, domElem) {
    let zoneTrack = new ZoneTrack(config);
    zoneTrack.init(domElem);
    return zoneTrack;
}

/**
 * Create and draw a new ImageTrack inside a new specified DOM element
 * @param {Object} config - configurations of new ImageTrack
 * @param {Object} domElem - the DOM element to contain the track
 * @returns {Object} The created track
 */
exports.createImageTrack = function (config, domElem) {
    let imageTrack = new ImageTrack(config);
    imageTrack.init(domElem);
    return imageTrack;
}

/**
 * Create and draw a new ObjectTrack inside a new specified DOM element
 * @param {Object} config - configurations of new ObjectTrack
 * @param {Object} domElem - the DOM element to contain the track
 * @returns {Object} The created track
 */
exports.createObjectTrack = function(config, domElem) {
    let objectTrack = new ObjectTrack(config);
    objectTrack.init(domElem);
    return objectTrack;
}

/**
 * Remove a track
 * @param {Object} - The track object to remove
 */
exports.removeTrack = function(track, domElem) {
    track.destroy();
}

/**
 * Create a curve inside a specified DOM element
 * @param {Object} config - Configurations of new Curve
 * @param {Array} data - Curve data
 * @param {Object} domElem - The DOM element containing the curve
 * @returns {Object} The created curve
 */
exports.createCurve = function(config, data, domElem) {
    config._data = data;
    let curve = new Curve(config);
    curve.init(domElem);
    return curve;
}

/**
 * Build a new visualize depth track object without creating DOM element
 * @param {Object} config - Configurations of new Depth Track
 * @returns {Object} The built track
 */
exports.buildDepthTrack = function(config) {
    return new DepthTrack(config);
}

/**
 * Build a new visualize log track object without creating DOM element
 * @param {Object} config - Configurations of new Log Track
 * @returns {Object} The built track
 */
exports.buildLogTrack = function(config) {
    return new LogTrack(config);
}

/**
 * Build a new visualize curve object without creating DOM element
 * @param {Object} config - Configurations of new Curve
 * @param {Array} data - Array containing x, y coordinates
 * @returns {Object} The built curve
 */
exports.buildCurve = function(config, data, well) {
    if (well) {
        config.offsetY = parseFloat(well.topDepth);
        config.yStep = parseFloat(well.step);
    }
    config._data = data;
    return new Curve(config);
}
/**
 * Rearange tracks in wi-d3 area
 */
exports.rearrangeTracks = function(wiD3Ctrl) {
    let wiD3Name = wiD3Ctrl.name;

    // d3.select('[name=' + wiD3Name + ']').selectAll('.vi-track-container, .vi-track-vertical-resizer').sort();

    d3.select('[name=' + wiD3Name + ']').selectAll('.wi-d3-track-component').sort();
}

/**
 * Create tooltip lines on a DOM SVG at mouse position
 */
exports.createTooltipLines = function(domSvg) {
    let svg = d3.select(domSvg);
    let mousePosition = d3.mouse(domSvg);
    let x = mousePosition[0];
    let y = mousePosition[1];
    let lineData = [
        // {x1: x, y1: 0, x2: x, y2: domSvg.clientHeight},
        {x1: 0, y1: y, x2: domSvg.clientWidth, y2: y}
    ];
    let lines = svg.selectAll('line.tooltip-line')
        .data(lineData);

    lines.enter().append('line')
        .attr('class', 'tooltip-line');

    lines
        .attr('x1', function(d) { return d.x1; })
        .attr('x2', function(d) { return d.x2; })
        .attr('y1', function(d) { return d.y1; })
        .attr('y2', function(d) { return d.y2; })
        .style('stroke', 'black')
        .style('stroke-dasharray', '2, 1')
        .style('stroke-width', '1px');
}

/**
 * Remove tooltip lines from a DOM SVG
 */
exports.removeTooltipLines = function(domSvg) {
    d3.select(domSvg).selectAll('line.tooltip-line').remove();
}

exports.sheetDraggable = function(domElem) {
    return;
    d3.select(domElem)
        .datum({baseX:0})
        .call(d3.drag()
            .on('start', function(d) {
                console.log('drag start', d3.event.wiHeaderClick, d3.event.wiHeaderDrag);
                d.cursor = d3.select(this).style('cursor');
                d3.select(this).classed('moving', true);
            })
            .on('drag', function(d) {
                d3.event.sourceEvent.preventDefault();
                d3.event.sourceEvent.stopPropagation();
                d.baseX += d3.event.dx;
                d3.select(this).style('left', d.baseX + "px");
            })
            .on("end", function(d) {
                if (d.baseX > 0) {
                    d.baseX = 0;
                }
                else {
                    let logplotWidth = d3.select('.logplot-main-content').node().clientWidth;
                    let slidingBarWidth = d3.select('.slidingbar').node().clientWidth;
                    let offsetMax = this.clientWidth - (logplotWidth - slidingBarWidth - 16);
                    if (-d.baseX > offsetMax) d.baseX = -offsetMax;
                }
                d3.select(this).style('left', d.baseX + "px");
                d3.select(this).classed('moving', false);
            })
        );
}

/**
 * Create and draw a new Crossplot inside a specified DOM element
 * @param {Object} curveX - The curve in x axis
 * @param {Object} curveY - The curve in y axis
 * @param {Object} config - Configurations of new Crossplot
 * @param {Object} domElem - The DOM element to contain the crossplot
 * @returns {Object} The created crossplot
 */
exports.createCrossplot = function(curveX, curveY, config, domElem) {
    let pointSet = (config || {}).pointSet || {};
    pointSet.curveX = curveX;
    pointSet.curveY = curveY;
    config.pointSet = pointSet;
    let crossplot = new Crossplot(config);
    crossplot.init(domElem);
    return crossplot;
}

/**
 * Create and draw a new Histogram inside a specified DOM elementa
 * @param {Object} curve - The curve to plot histogram
 * @param {Object} config - Configurations of the new Histogram
 * @param {HtmlDomElem} domElem - The DOM element that contains the Histogram
 * @returns {Object} The newly created histogram
 */
exports.createHistogram = function(config, depthStep, startDepth, endDepth, domElem) {
    let histogram = new Histogram(config);
    histogram.depthStep = depthStep;
    histogram.startDepth = startDepth;
    histogram.endDepth = endDepth;
    console.log('---', config, domElem);
    histogram.init(domElem);
    return histogram;
}

exports.plotSelection = function (logTracks, selectionId, color, newDatum) {
    logTracks.forEach(t => {
        let selection = t.getSelection(selectionId);
        selection.color = color;
        selection.setProperties({maskData: newDatum});
        selection._doPlot();
    })
}

exports.createNNPlayground = function (config, domElem) {
    let neuralNetWork = new neuralNetworkPlayground(config);
    neuralNetWork.init(domElem);
    return neuralNetWork;
}
exports.createSelection = function (config) {
    let selection = new Selection(config);
    return selection;
}

exports.createVisualizeWiPlot = function (config, domElem) {
    let viWiPlot = new visualizeWiPlot(config);
    viWiPlot.init(domElem);
    return viWiPlot;
}
