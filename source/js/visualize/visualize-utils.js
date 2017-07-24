exports.roundUp = roundUp;
exports.roundDown = roundDown;
exports.appendTrack = appendTrack;
exports.removeTrack = removeTrack;
exports.isWithinYRange = isWithinYRange;
exports.trimData = trimData;
exports.interpolateData = interpolateData;
exports.parseData = parseData;
exports.extend = extend

function roundUp(value, granularity) {
    return Math.ceil(value / granularity) * granularity;
}
function roundDown(value, granularity) {
    return Math.floor(value / granularity) * granularity;
}

function extend(base, sub) {
    sub.prototype = Object.create(base.prototype);
    sub.prototype.constructor = sub;
}

function clip(val, extent) {
    if (val > extent[1]) return extent[1];
    if (val < extent[0]) return extent[0];
    return val;
}

function isWithinYRange(item, extentY) {
    return (item.y >= extentY[0] && item.y <= extentY[1]);
}

function trimData(data) {
    let i = 0, j = data.length -1;
    for (;i < data.length && data[i].x == null; i++);
    for (;j >= 0 && data[j].x == null; j--);
    if (i >= j) return [];
    return data.slice(i, j+1);
}

function parseData(data) {
    data.forEach(function(d) {
        d.x = d.x == null ? null : parseFloat(d.x);
        d.y = d.y == null ? null : parseFloat(d.y);
    });
}

function interpolateData(data) {
    let prev = 0;
    let i, j;
    for (i = 0; i < data.length; i ++) {
        if (data[i].x == null) continue;
        for (j = prev + 1; j < i; j ++) {
            data[j].x = (data[j].y - data[prev].y) / (data[i].y - data[prev].y) * (data[i].x - data[prev].x) + data[prev].x;
        }
        prev = i;
    }
    return data;
}

function appendTrackHeader(plotArea, container, trackName) {
    let headerViewport = container.append('div')
        .attr('class', 'track-header-viewport text-center')

    let nameLabel = headerViewport.append('label')
        .attr('class', 'track-name text-center')
        .style('z-index', 2)
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
