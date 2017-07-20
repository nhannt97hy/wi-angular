exports.roundUp = roundUp;
exports.roundDown = roundDown;
exports.invertColor = invertColor;
exports.appendTrack = appendTrack;
exports.removeTrack = removeTrack;
exports.isWithin = isWithin;

function roundUp(value, granularity) {
    return Math.ceil(value / granularity) * granularity;
}
function roundDown(value, granularity) {
    return Math.floor(value / granularity) * granularity;
}

function clip(val, extent) {
    if (val > extent[1]) return extent[1];
    if (val < extent[0]) return extent[0];
    return val;
}

function isWithin(item, extentX, extentY) {
    return (item.x >= extentX[0] &&
       item.x <= extentX[1] &&
       item.y >= extentY[0] &&
       item.y <= extentY[1]);
}

function invertColor(color) {
    let d3Color = d3.rgb(color)
    d3Color.r = Math.floor(d3Color.r / 2);
    d3Color.g = Math.floor(d3Color.g / 2);
    d3Color.b = Math.floor(d3Color.b / 2);
    return d3Color;
}

function appendTrackHeader(plotArea, container, trackName) {
    let headerViewport = container.append('div')
        .attr('class', 'track-header-viewport text-center')

    let nameLabel = headerViewport.append('label')
        .attr('class', 'track-name text-center')
            .text(trackName);

    let header = headerViewport.append('div')
        .attr('class', 'track-header')
        .style('top', nameLabel.node().clientHeight + 3 + 'px')

    function _headerScrollCallback(header) {
        let rowHeight = nameLabel.node().clientHeight;
        let dy = d3.event.dy || (Math.sign(d3.event.deltaY) > 0 ? -rowHeight*2 -6: rowHeight*2 + 6);
        let top = parseInt(header.style('top').replace('px', '')) + dy;
        let maxTop = rowHeight + 3;
        let minTop = headerViewport.node().clientHeight - header.node().clientHeight + 2;


        top = minTop < maxTop ? clip(top, [minTop, maxTop]) : maxTop;
        header.style('top', top + 'px');
    }

    header
        .on('mousewheel', function() {
            _headerScrollCallback(d3.select(this));
        })
        .call(d3.drag().on('drag', function() {
            _headerScrollCallback(d3.select(this))
        }));

    container.append('div')
        .attr('class', 'vresizer')
        .call(d3.drag()
            .on('drag', function() {
                let plotHeight = container.select('.plot-container').node().clientHeight;
                d3.select(plotArea).selectAll('.plot-container')
                    .style('height', (plotHeight - d3.event.dy) + 'px');

                d3.select(plotArea).selectAll('.track-header').each(function(h) {
                    _headerScrollCallback(d3.select(this));
                })
            })
        );
}

function appendTrack(baseElement, trackName, plotWidth) {
    let compensator;
    let minPlotWidth = plotWidth;
    let root = d3.select(baseElement);
    let trackContainer = root.append('div')
        .attr('class', 'track-container')
        .style('width', plotWidth + 'px')

    appendTrackHeader(baseElement, trackContainer, trackName);
    let resizer = root.append('div')
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
    let existedPlot = d3.select('.plot-container')
    let plotContainer = trackContainer.append('div')
        .attr('class', 'plot-container')

    if (!existedPlot.empty()) {
        plotContainer.style('height', existedPlot.style('height'));
    }

    return trackContainer;
}

function removeTrack(idx, baseElement) {
    let base = d3.select(baseElement);
    base.selectAll('.track-container')
        .filter(function (d, i) {
            return i == idx;
        })
        .remove();

    base.selectAll('.track-resizer')
        .filter(function (d, i) {
            return i == idx;
        })
        .remove();
}
