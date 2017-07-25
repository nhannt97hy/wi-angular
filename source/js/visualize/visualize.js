/**
 * A module for data visualization
 * @module visualize
 */

let DepthTrack = require('./visualize-depth-track.js');
let LogTrack = require('./visualize-log-track.js');
let Utils = require('./visualize-utils.js');

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

setInterval(function() {
    registeredTracks.forEach(function(plot) {
        if(plot.periodicTask) plot.periodicTask();
    });
}, 2000);
