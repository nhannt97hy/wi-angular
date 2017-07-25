module.exports = Track;

/**
 * Represent a general track
 * @constructor
 */
function Track() {}

/**
 * Check if class of this instance is LogTrack
 * @returns {Boolean}
 */
Track.prototype.isLogTrack = function() {
    return this.constructor.name == 'LogTrack';
}

/**
 * Check if class of this instance is DepthTrack
 * @returns {Boolean}
 */
Track.prototype.isDepthTrack = function() {
    return this.constructor.name = 'DepthTrack';
}
