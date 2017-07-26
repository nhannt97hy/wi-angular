/**
 * A module for data visualization
 * @module visualize
 */

let DepthTrack = require('./visualize-depth-track');
let LogTrack = require('./visualize-log-track');
let Curve = require('./visualize-curve');
let Utils = require('./visualize-utils');
let CanvasHelper = require('./visualize-canvas-helper');


let registeredTracks = [];

/**
 * Create and draw a new Log Track inside a specified DOM element
 * @param {Object} config - Configurations of new Log Track
 * @param {Object} domElem - The DOM element to contain the track
 * @returns {Object} The created track
 */
exports.createLogTrack = function(config, domElem) {
    let logTrack = new LogTrack(config);
    logTrack.init(domElem);
    registeredTracks.push(logTrack);
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
    registeredTracks.push(depthTrack);
    return depthTrack;
}


/**
 * Remove a track inside a specified DOM element
 * @param {Number} trackIdx - Index of the track in the element
 * @param {Object} domElem - The DOM element containing the track
 */
exports.removeTrack = function(trackIdx, domElem) {
    Utils.removeTrack(trackIdx, domElem);
    registeredTracks.splice(trackIdx, 1);
}

/**
 * Create a curve inside a specified DOM element
 * @param {Object} config - Configurations of new Curve
 * @param {Array} data - Curve data
 * @param {Object} domElem - The DOM element containing the curve
 * @returns {Object} The created curve
 */
exports.createCurve = function(config, data, domElem) {
    let curve = new Curve(config);
    curve.init(data, domElem);
    return curve;
}

exports.CanvasHelper = CanvasHelper;

setInterval(function() {
    registeredTracks.forEach(function(plot) {
        if(plot.periodicTask) plot.periodicTask();
    });
}, 2000);
