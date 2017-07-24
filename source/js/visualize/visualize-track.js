module.exports = Track;

function Track() {}

Track.prototype.isLogTrack = function() {
    return this.constructor.name == 'LogTrack';
}

Track.prototype.isDepthTrack = function() {
    return this.constructor.name = 'DepthTrack';
}
