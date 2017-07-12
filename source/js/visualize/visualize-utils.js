exports.roundUp = roundUp;
exports.roundDown = roundDown;
exports.invertColor = invertColor;
exports.appendTrack = appendTrack;

function roundUp(value, granularity) {
    return Math.ceil(value / granularity) * granularity;
}
function roundDown(value, granularity) {
    return Math.floor(value / granularity) * granularity;
}

function invertColor(color) {
    let d3Color = d3.rgb(color)
    d3Color.r = Math.floor(d3Color.r / 2);
    d3Color.g = Math.floor(d3Color.g / 2);
    d3Color.b = Math.floor(d3Color.b / 2);
    return d3Color;
}

function appendTrackHeader(plotArea, container, trackName) {
    container.append('div')
        .attr('class', 'track-header text-center')
            .append('label')
            .attr('class', 'track-name text-center')
                .text(trackName);
    container.append('div')
        .attr('class', 'vresizer')
        .call(d3.drag()
            .on('drag', function() {
                var plotHeight = container.select('.plot-container').node().clientHeight;
                d3.select(plotArea).selectAll('.plot-container')
                    .style('height', (plotHeight - d3.event.dy) + "px");
            })
        );
}

function appendTrack(baseElement, trackName, plotWidth) {
    var compensator;
    var minPlotWidth = plotWidth;
    var trackContainer = d3.select(baseElement).append('div')
        .attr('class', 'track-container')
        .style('width', plotWidth + 'px');
    appendTrackHeader(baseElement, trackContainer, trackName);
    var resizer = d3.select(baseElement).append('div')
        .attr('class', 'resizer track-resizer')
        .call(d3.drag()
            .on('start', function() {
                compensator = 0;
            })
            .on('drag', function() {
                compensator += d3.event.dx;
                if (( plotWidth + compensator ) > minPlotWidth) {
                    plotWidth += compensator;
                    compensator = 0;
                    trackContainer.style('width', plotWidth + 'px');
                }
            })
        );
    trackContainer.append('div')
        .attr('class', 'plot-container');
    return trackContainer;
}


/*exports.createLogTrack = function(config, domElem) {
    var plot = new Plot(config);
    plot.init(domElem);
    return plot;
}
exports.createDepthTrack = function(config, domElem) {
    var depthTrack = new DepthTrack(config);
    depthTrack.init(domElem);
    return depthTrack;
}*/
