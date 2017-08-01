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
exports.removeTrack = function(track, domElem) {
    track.destroy();
    let trackIdx = registeredTracks.indexOf(track);
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
    config.data = data;
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
 * @param {Array} data - Curve data
 * @returns {Object} The built curve
 */
exports.buildCurve = function(config, data) {
    config.data = data;
    return new Curve(config);
}

exports.CanvasHelper = CanvasHelper;

setInterval(function() {
    registeredTracks.forEach(function(plot) {
        if(plot.periodicTask) plot.periodicTask();
    });
}, 2000);
