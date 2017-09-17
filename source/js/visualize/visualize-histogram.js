module.exports = Histogram;

/**
 * Visualize Histogram contructor
 * @param: {Object} config: configuration of visualize histogram object
 *
 */
function Histogram(histogramModel) {
    this.handlers = new Object();

    this.data = null;

    this.histogramModel = histogramModel;
    this.idCurve = histogramModel.properties.idCurve;

    // visualize instant vars
    this.svg = null;

}
Histogram.prototype.trap = function (eventName, handlerCb) {
    let eventHandlers = this.handlers[eventName];
    if (!Array.isArray(eventHandlers)) {
        this.handlers[eventName] = [];
    }

    this.handlers[eventName].push(handlerCb);
    return this;
}

Histogram.prototype.signal = function (eventName, data) {
    let eventHandlers = this.handlers[eventName];
    if (Array.isArray(eventHandlers)) {
        eventHandlers.forEach(function (handler) {
            handler(data);
        });
    }
}

Histogram.prototype.setCurve = function(data) {
    this.data = data; // ? clone
}

Histogram.prototype.doPlot = function() {
    if (!this.data) return;
}

Histogram.prototype.init = function(domElem) {
    var self = this;
    console.log("init histogram into domElem:", domElem);
    this.container = d3.select(domElem).attr('class', 'vi-histogram-container');
    new ResizeSensor($(this.container.node()), function(param) {
        console.log("On resize", param, this);
        self.svg.attr('width',self.container.node().clientWidth)
            .attr('height', self.container.node().clientHeight);
    });
    this.svg = this.container.append('svg')
        .attr('class', 'vi-histogram-svg')
        .attr('width',this.container.node().clientWidth)
        .attr('height', this.container.node().clientHeight);

    this.trap('histogram-update', function() {
        console.log('Update histogram');
    });
}
