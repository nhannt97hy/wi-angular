var registeredPlots = new Array();
setInterval(function() {
    registeredPlots.forEach(function(plot) {
        if(plot.periodicTask) plot.periodicTask();
    });
}, 2000);

function roundUp(value, granularity) {
    return Math.ceil(value / granularity) * granularity;
}
function roundDown(value, granularity) {
    return Math.floor(value / granularity) * granularity;
}

function appendTrackHeader(container, trackName) {
    container.append('div')
        .attr('class', 'track-header text-center')
            .append('label')
            .attr('class', 'track-name text-center')
                .text(trackName);
}

function appendDepthHeader(base, unit) {
    var trackHeader = base.selectAll('.track-header');
    trackHeader.append('label')
        .attr('class', 'data-header double-height text-center')
        .text(unit);
}

function appendToTrackHeader(base, dataSetName, unit, minVal, maxVal) {
    var unitHeaderData = [minVal, unit, maxVal];
    var trackHeader = base.selectAll('.track-header');
    var temp = trackHeader.append('label')
        .attr('class', 'data-header text-center')
        .text(dataSetName);

    trackHeader.append('label')
        .attr('class', 'unit-header flex-row')
        .selectAll('div').data(unitHeaderData).enter()
            .append('div')
                .attr('class', function(d, i) {
                    switch(i) {
                        case 0:
                            return 'text-left';
                        case 1:
                            return 'flex-1 text-center';
                        case 2:
                            return 'text-right';
                    }
                    return '';
                })
                .text(function(d) { return d; });
}

function appendTrack(baseElement, trackName, plotWidth) {
    var trackContainer = d3.select(baseElement).append('div')
        .attr('class', 'track-container')
        .style('width', plotWidth + 'px');
    appendTrackHeader(trackContainer, trackName);
    trackContainer.append('div')
        .attr('class', 'plot-container');
    return trackContainer;
}

function DepthTrack(config) {
    var self = this;
    var _viewportX = new Array(), _viewportY = new Array();
    
    if( !config ) {
        console.error("config must not be null");
        return;
    }
    var unit = config.unit || 'm';
    var root;
    var base;
    var svg;
    var clientRect;
    var yAxisGroup;
    var yAxisGroup1;
    var transformY;
    var yAxisClass = 'depthtrack';
    var yNTicks = config.yNTicks || 20;
    var plotWidth = config.plotWidth || 200;
    var yStep = config.yStep || 1.0;
    var yFormatter = d3.format(config.yFormatter || 'g');
    var xPadding = config.xPadding || 0, yPadding = config.yPadding || 0;
    this.getYStep = function() { 
        return yStep; 
    }
    this.init = function(baseElement) {
        root = appendTrack(baseElement, 'Depth', plotWidth);
        base = root.select('.plot-container');
        appendDepthHeader(root, unit);
        clientRect = base.node().getBoundingClientRect();

        svg = base.append('svg')
                .attr('width', clientRect.width)
                .attr('height', clientRect.height);
        yAxisGroup = svg.append('g')
            .attr('class', yAxisClass)
            .attr('transform', 'translate(' + (clientRect.width - xPadding) + ', 0)');
        yAxisGroup1 = svg.append('g')
            .attr('class', yAxisClass);
            //.attr('transform', 'translate(' + (clientRect.width - xPadding) + ', 0)');
    }
    function _doPlot() {
        transformY = d3.scaleLinear().domain(_viewportY).range([yPadding, clientRect.height - yPadding]);
        function setupAxes() {
            var start = roundUp(_viewportY[0], yStep);
            var end = roundDown(_viewportY[1], yStep);
            var yAxis = d3.axisLeft(transformY)
                .tickValues(d3.range(start, end, (end - start)/yNTicks))
                .tickFormat(yFormatter)
                .tickSize(5);
            var yAxis1 = d3.axisRight(transformY)
                .tickValues(d3.range(start, end, (end - start)/yNTicks))
                .tickFormat('')
                .tickSize(5);

            yAxisGroup.call(yAxis);
            yAxisGroup1.call(yAxis1);
        }
        setupAxes();
    }
    this.doPlot = function() {
        _doPlot();
    }
    this.setYRange = function(vY) {
        _viewportY[0] = vY[0];
        _viewportY[1] = vY[1];
    }
}
function Plot(config) {
    var self = this;
    var _data, _viewportX = new Array(), _viewportY = new Array();
    if( !config ) {
        console.error("config must not be null");
        return;
    }
    var root;
    var base;
    var svg;
    var clientRect;
    var translateOpts = new Object();
    var ctx;
    var xAxisGroup, yAxisGroup;
    var transformX;
    var transformY;
    var xAxisClass = 'grid', yAxisClass = 'grid';
    var xAxisPosition = config.xAxisPosition || 'top', yAxisPosition = config.yAxisPosition || 'left';
    var xNTicks = config.xNTicks || 4;
    var yNTicks = config.yNTicks || 20;
    var plotWidth = config.plotWidth || 200;
    var yStep = config.yStep || 1.0;

    var xPadding = config.xPadding || 0, yPadding = config.yPadding || 0;
    var xFormatter = d3.format(config.xFormatter || 'g'), 
        yFormatter = d3.format(config.yFormatter || 'g');
    

    var axisCfg = {
        top: function(transformX) {
            return d3.axisTop(transformX);
        },
        bottom: function(transformX) {
            return d3.axisBottom(transformX);
        },
        left: function(transformY) {
            return d3.axisLeft(transformY);
        },
        right: function(transformY) {
            return d3.axisRight(transformY);
        }
    }
    this.getYStep = function() { 
        return yStep; 
    }
    this.getYMax = function() {
        console.log('getYMax:', _data);
        if (!_data || _data.length == 0) return null;
        return (_data.length - 1) * yStep;
    }
    this.getYMin = function() {
        if (!_data || _data.length == 0) return null;
        return 0;
    }
    function updateTranslateOpts(translateOpts, clientRect) {
        translateOpts.top = 'translate(0, ' + yPadding + ')';
        translateOpts.bottom = 'translate(0, ' + (clientRect.height - yPadding) + ')';
        translateOpts.left = 'translate(' + xPadding + ', 0)';
        translateOpts.right = 'translate(' + (clientRect.width - xPadding) + ', 0)';
    }
    this.init = function(baseElement) {
        root = appendTrack(baseElement, 'Track', plotWidth);
        base = root.select('.plot-container');
        clientRect = base.node().getBoundingClientRect();
        updateTranslateOpts(translateOpts, clientRect);

        canvas = base.append('canvas')
                .attr('width', clientRect.width)
                .attr('height', clientRect.height);
        
        svg = base.append('svg')
                .attr('width', clientRect.width)
                .attr('height', clientRect.height);

        ctx = canvas.node().getContext('2d');

        // Axes
        xAxisGroup = svg.append('g')
            .attr('class', xAxisClass)
            .attr('transform', translateOpts[xAxisPosition]);
        yAxisGroup = svg.append('g')
            .attr('class', yAxisClass)
            .attr('transform', translateOpts[yAxisPosition]);

        new ResizeSensor(base.node(), function() {
            clientRect = base.node().getBoundingClientRect();

            updateTranslateOpts(translateOpts, clientRect);

            canvas
                .attr('width', clientRect.width)
                .attr('height', clientRect.height);
            svg
                .attr('width', clientRect.width)
                .attr('height', clientRect.height);
            xAxisGroup.attr('transform', translateOpts[xAxisPosition]);
            yAxisGroup.attr('transform', translateOpts[yAxisPosition]);
            if(_data) _doPlot();
        });
    }
    function _doPlot() {
        console.log(_viewportX, _viewportY);
        var axisRange = {
            top: [yPadding, clientRect.height - yPadding],
            bottom: [yPadding, clientRect.height - yPadding].reverse(),
            left: [xPadding, clientRect.width - xPadding],
            right: [xPadding, clientRect.width - xPadding].reverse()
        }
        transformX = d3.scaleLinear().domain(_viewportX).range(axisRange[yAxisPosition]);
        transformY = d3.scaleLinear().domain(_viewportY).range(axisRange[xAxisPosition]);
        function setupAxes() {
            var xAxis = axisCfg[xAxisPosition](transformX)
                .tickValues(d3.range(_viewportX[0], _viewportX[1], (_viewportX[1] - _viewportX[0])/xNTicks))
                //.tickFormat(xFormatter)
                .tickFormat("")
                .tickSize(-(clientRect.height - 2 * yPadding));
            var start = roundUp(_viewportY[0], yStep);
            var end = roundDown(_viewportY[1], yStep);
            var yAxis = axisCfg[yAxisPosition](transformY)
                .tickValues(d3.range(start, end, (end - start)/yNTicks))
                .tickFormat(yFormatter)
                .tickSize(-(clientRect.width - 2 * xPadding));

            xAxisGroup.call(xAxis);
            yAxisGroup.call(yAxis);
        }
        function plotOnCanvas() {
            ctx.clearRect(0, 0, clientRect.width, clientRect.height);
            var plotSamples = _data.filter(function(item){
                var ret =(item.x >= _viewportX[0] && 
                       item.x <= _viewportX[1] && 
                       item.y * yStep >= _viewportY[0] &&
                       item.y * yStep <= _viewportY[1]);
                return ret;
            });
            ctx.beginPath();
            plotSamples.forEach(function(item) {
                ctx.lineTo(transformX(item.x), transformY(item.y * yStep));
            });
            ctx.stroke();
        }
        setupAxes();
        plotOnCanvas();
    }
    this.doPlot = function() {
        _doPlot();
    }
    this.plotPoint = function(samples, viewportX, viewportY) {
        _data = samples;
        _viewportX[0] = viewportX[0];
        _viewportX[1] = viewportX[1];
        _viewportY[0] = viewportY[0];
        _viewportY[1] = viewportY[1];
        _doPlot();
    }
    this.onClick = function(callback) {
        svg.on('click', function() {callback();});
    }

    var freshness = 0;
    function mousemoveHandler() {
        freshness = Date.now();
        var coordinate = d3.mouse(svg.node());
        svg.selectAll('text.wi-tooltip').remove();
        svg.selectAll('rect.tooltipBg').remove();
        svg.selectAll('line.tooltipLine').remove();
        var lines = [
            {x1: 0, y1:coordinate[1], x2: clientRect.width, y2:coordinate[1]},
            {x1: coordinate[0], y1:0, x2: coordinate[0], y2: clientRect.height}
        ];
        svg.selectAll('line.tooltipLine').data(lines).enter().append('line')
            .attr('class', 'tooltipLine')
            .attr('x1', function(d) {
                return d.x1;
            })
            .attr('y1', function(d) {
                return d.y1;
            })
            .attr('x2', function(d) {
                return d.x2;
            })
            .attr('y2', function(d) {
                return d.y2;
            })
            .style('stroke', 'red');
            
        var tooltip = svg.append('text')
            .attr('class', 'wi-tooltip')
            .attr('y', coordinate[1])
            .attr('fill', 'red');
        tooltip.append('tspan').attr('dy', '1.2em')
            .attr('x', coordinate[0] + 5)
            .text("X:" + xFormatter(transformX.invert(coordinate[0])));
        tooltip.append('tspan').attr('dy', '1.2em')
            .attr('x', coordinate[0] + 5)
            .text('Y:' + yFormatter(transformY.invert(coordinate[1])));

        var textRect = tooltip.node().getBBox();
        var tooltipBg = svg.append('rect')
            .attr('class', 'tooltipBg')
            .attr('x', textRect.x)
            .attr('y', textRect.y)
            .attr('width', textRect.width)
            .attr('height', textRect.height);
        tooltip.raise();
    }
    function mouseleaveHandler() {
        svg.selectAll('.wi-tooltip, .tooltipBg, .tooltipLine').remove();
    }
    this.trackPointer = function(isOn) {
        if( isOn && transformX && transformY ) {
            svg.on('mousemove', mousemoveHandler)
                .on('mouseleave', mouseleaveHandler);
        }
        else {
            svg.on('mousemove', null)
                .on('mouseleave', null);
        }
    }
    this.setData = function(data, dataSetName, unit, min, max) {
        appendToTrackHeader(root, dataSetName, unit, min, max);
        _data = data;
    }
    this.setYRange = function(vY) {
        _viewportY[0] = vY[0];
        _viewportY[1] = vY[1];
    }
    this.setXRange = function(vX) {
        _viewportX[0] = vX[0];
        _viewportX[1] = vX[1];
    }
    this.adjustXRange = function(kFactor) {
        if( _data ) {
            var tempVport= d3.extent(_data, function(d) { return d.x; });
            _viewportX[0] = 0;
            _viewportX[1] = tempVport[1] * kFactor;
        }
    }
    const trackerLifetime = 10 * 1000; // 1 seconds
    this.periodicTask = function() {
        if( Date.now() - freshness > trackerLifetime )
            svg.selectAll('.wi-tooltip, .tooltipBg, .tooltipLine').remove();
    }
    registeredPlots.push(this);
}
exports.createLogTrack = function(config, domElem) {
    var plot = new Plot(config);
    plot.init(domElem);
    return plot;
}
exports.createDepthTrack = function(config, domElem) {
    var depthTrack = new DepthTrack(config);
    depthTrack.init(domElem);
    return depthTrack;
}
