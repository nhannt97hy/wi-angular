module.exports = Histogram;

function Histogram(config) {
    console.log(config);
}

Histogram.prototype.init = function(domElem) {
    console.log("init histogram into domElem:", domElem);
}
