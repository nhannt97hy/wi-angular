let Curve = require('./visualize-curve.js');
let Shading = require('./visualize-shading.js');
let DepthTrack = require('./visualize-depth-track.js');

let Utils = require('./visualize-utils.js');

let roundUp = Utils.roundUp;
let roundDown = Utils.roundDown;
let appendTrack = Utils.appendTrack;
let invertColor = Utils.invertColor;

exports.removeTrack = function(trackIdx, domElem) {
    Utils.removeTrack(trackIdx, domElem);
}

exports.createLogTrack = function(config, domElem) {
    let plot = new Plot(config);
    plot.init(domElem);
    return plot;
}
exports.createDepthTrack = function(config, domElem) {
    let depthTrack = new DepthTrack(config);
    depthTrack.init(domElem);
    return depthTrack;
}


let registeredPlots = [];
setInterval(function() {
    registeredPlots.forEach(function(plot) {
        if(plot.periodicTask) plot.periodicTask();
    });
}, 2000);

function Plot(config) {
    config = typeof config === 'object' ? config : {};
    let self = this;

    let _curves = [];
    let _shadings = [];
    let _curveHeaders = [];
    let _shadingHeaders = [];
    let _viewportX = [];
    let _viewportY = [];

    let trackContainer;
    let plotContainer;
    let headerContainer;
    let clientRect;
    let svg;

    let refLine;
    let refX = 10;
    let translateOpts = {};
    let xAxisGroup, yAxisGroup;
    let transformX;
    let transformY;
    let xAxisClass = 'grid', yAxisClass = 'grid';
    let xAxisPosition = config.xAxisPosition || 'top', yAxisPosition = config.yAxisPosition || 'left';
    let xNTicks = config.xNTicks || 4;
    let yNTicks = config.yNTicks || 20;
    let plotWidth = config.plotWidth || 200;
    let yStep = config.yStep || 1.0;

    let xPadding = config.xPadding || 0, yPadding = config.yPadding || 0;
    let xFormatter = d3.format(config.xFormatter || 'g');
    let yFormatter = d3.format(config.yFormatter || 'g');

    let usedColors = d3.set();
    let refLineColor = '#3e3e3e';
    let shading = false;
    let currentCurveIdx = -1;

    let axisCfg = {
        top: function(transformX) { return d3.axisTop(transformX); },
        bottom: function(transformX) { return d3.axisBottom(transformX); },
        left: function(transformY) { return d3.axisLeft(transformY); },
        right: function(transformY) { return d3.axisRight(transformY); }
    }

    /* Getter Begin */
    this.getYStep = function() { return yStep; };
    this.getCurves = function() { return _curves; };
    this.getCurveHeaders = function() { return _curveHeaders; };
    this.getCurrentCurveIdx = function() { return currentCurveIdx; };
    this.getCurrentCurve = function() { return _curves[currentCurveIdx]; };
    /* Getter End */

    this.getYMax = function() {
        if (_curves.length == 0) return null;
        let curvesData = _curves.map(function(c) { return c.getData(); });
        let mergedCurvesData = [].concat.apply([], curvesData);
        return yStep * d3.max(mergedCurvesData, function(d) { return d.y });
    }

    this.getYMin = function() { return (_curves.length == 0) ? null : 0; };

    function updateTranslateOpts(translateOpts, clientRect) {
        translateOpts.top = 'translate(0, ' + yPadding + ')';
        translateOpts.bottom = 'translate(0, ' + (clientRect.height - yPadding) + ')';
        translateOpts.left = 'translate(' + xPadding + ', 0)';
        translateOpts.right = 'translate(' + (clientRect.width - xPadding) + ', 0)';
    }
    this.init = function(baseElement) {
        trackContainer = appendTrack(baseElement, 'Track', plotWidth);
        plotContainer = trackContainer.select('.plot-container');
        headerContainer = trackContainer.select('.track-header');

        clientRect = plotContainer.node().getBoundingClientRect();
        updateTranslateOpts(translateOpts, clientRect);

        svg = plotContainer.append('svg')
                .attr('width', clientRect.width)
                .attr('height', clientRect.height);

        // Axes
        xAxisGroup = svg.append('g')
            .attr('class', xAxisClass)
            .attr('transform', translateOpts[xAxisPosition]);
        yAxisGroup = svg.append('g')
            .attr('class', yAxisClass)
            .attr('transform', translateOpts[yAxisPosition]);

        refLine = svg.append('line').attr('class', 'ref-line')
                .attr('x1', refX)
                .attr('x2', refX)
                .attr('y1', 0)
                .attr('y2', clientRect.height)
                .attr('style', 'stroke:' + refLineColor +'; stroke-width:4')
                .call(d3.drag().on('drag', function(){
                    refX = d3.event.x;
                    refX = (refX > clientRect.width-2) ? clientRect.width-2 : refX;
                    refX = (refX < xPadding+2) ? xPadding+2 : refX;
                    _doPlot();
                }))
                .raise();
        new ResizeSensor(plotContainer.node(), function() {
            let previousWidth = clientRect.width;
            clientRect = plotContainer.node().getBoundingClientRect();

            updateTranslateOpts(translateOpts, clientRect);

            refX = clientRect.width / previousWidth * refX;

            refLine
                .attr('x1', refX)
                .attr('x2', refX);

            svg
                .attr('width', clientRect.width)
                .attr('height', clientRect.height);

            xAxisGroup.attr('transform', translateOpts[xAxisPosition]);
            yAxisGroup.attr('transform', translateOpts[yAxisPosition]);

            _curves.forEach(function(curve) {
                curve.adjustSize(clientRect);
            });
            _shadings.forEach(function(shading) {
                shading.adjustSize(clientRect);
            });
            _doPlot();
        });
    }

    this.doPlot = function() {
        _doPlot();
    }

    this.highlight = function(idx) {
        currentCurveIdx = idx;
        self.plotAllCurves();
        _highlightCurveHeader();
    }

    let freshness = 0;
    function mousemoveHandler() {
        freshness = Date.now();
        let coordinate = d3.mouse(svg.node());
        svg.selectAll('text.wi-tooltip').remove();
        svg.selectAll('rect.tooltipBg').remove();
        svg.selectAll('line.tooltipLine').remove();
        let lines = [
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

        let tooltip = svg.append('text')
            .attr('class', 'wi-tooltip')
            .attr('y', coordinate[1])
            .attr('fill', 'red');
        tooltip.append('tspan').attr('dy', '1.2em')
            .attr('x', coordinate[0] + 5)
            .text("X:" + xFormatter(transformX.invert(coordinate[0])));
        tooltip.append('tspan').attr('dy', '1.2em')
            .attr('x', coordinate[0] + 5)
            .text('Y:' + yFormatter(transformY.invert(coordinate[1])));

        let textRect = tooltip.node().getBBox();
        let tooltipBg = svg.append('rect')
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

    /* Curve Begin */
    this.addCurve = function(data, dataSetName, unit, min, max) {
        _addCurveHeader(dataSetName, unit, min, max);

        let curve = new Curve({
            color: _genColor(),
            name: dataSetName
        });
        curve.init(plotContainer, data);
        let idx = _curves.push(curve) -1;
        return idx;
    }

    this.removeCurve = function(curveIdx) {
        if (curveIdx < 0 || curveIdx >= _curves.length) return;
        let curve = _curves[curveIdx];
        usedColors.remove(curve.getColor());
        usedColors.remove(curve.getInvertedColor());
        curve.destroy();

        _removeCurveHeader(curveIdx);
        _curves.splice(curveIdx, 1)[0];
        _curveHeaders.splice(curveIdx, 1)[0];

        if (curveIdx == currentCurveIdx)
            currentCurveIdx = -1;
        else if (curveIdx < currentCurveIdx)
            currentCurveIdx -= 1;
    };

    this.removeCurrentCurve = function() {
        self.removeCurve(currentCurveIdx);
    };

    this.removeAllCurves = function() {
        usedColors.clear();
        for (let i = 0; i < _curves.length; i ++) {
            _curves[i].destroy();
            _removeCurveHeader(i);
        }
        _curves = [];
        _curveHeaders = [];
        currentCurveIdx = -1;
    };

    this.plotCurve = function(curveIdx) {
        let lineWidth = curveIdx == currentCurveIdx ? 2 : 1;
        _curves[curveIdx].doPlot(_viewportX, _viewportY, transformX, transformY, shading, lineWidth, refX, yStep);
    };

    this.plotAllCurves = function() {
        for (let i = 0; i < _curves.length; i ++) {
            self.plotCurve(i);
        }
    };
    /* Curve End */

    /* Shading Begin */
    this.addShading = function(leftCurveIdx, rightCurveIdx, config) {
        config = typeof config != 'object' ? {} : config;
        let leftCurve = _curves[leftCurveIdx];
        let rightCurve = _curves[rightCurveIdx];
        let shading = new Shading({
            color: config.color || _genColor(),
            name: config.name || (leftCurve.getName() + ' - ' + rightCurve.getName())
        });
        shading.init(plotContainer, leftCurve, rightCurve);
        _shadings.push(shading);
    };

    this.plotShading = function(shadingIdx) {
        _shadings[shadingIdx].doPlot(_viewportX, _viewportY, transformX, transformY, refX, yStep);
    };

    this.plotAllShadings = function() {
        for (let i = 0; i < _shadings.length; i ++) {
            self.plotShading(i);
        }
    };
    /* Shading End */

    /* Event Begin */
    this.configMouseMovementEventForDropping = function(dragMan, wiD3Ctrl){
        plotContainer
            .on('mouseover', function() {
                if( !dragMan.dragging ) return;
                dragMan.wiD3Ctrl = wiD3Ctrl;
                dragMan.track = self;
            })
            .on('mouseleave', function() {
                if( !dragMan.dragging ) return;
                dragMan.wiD3Ctrl = null;
                dragMan.track = null;
            });
    };

    this.onPlotMouseDown = function(cb) {
        plotContainer.on('mousedown', cb);
    };

    this.onHeaderMouseDown = function(cb) {
        trackContainer.select('.track-header-viewport').on('mousedown',cb);
    };
    /* Event End */

    this.setColor = function(color) {
        if (currentCurveIdx < 0) return false;
        let d3Color = d3.color(color);
        if (!d3Color) return false;
        let d3ColorString = d3Color.toString();
        if (usedColors.has(d3ColorString)) return false;

        usedColors.add(d3ColorString);
        usedColors.add(invertColor(d3Color).toString());
        usedColors.remove(_curves[currentCurveIdx].getColor());
        usedColors.remove(_curves[currentCurveIdx].getInvertedColor());

        _curves[currentCurveIdx].setColor(d3ColorString);
        return true;
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
        if( _curves.length > 0) {
            let curvesData = _curves.map(function(c) { return c.getData(); });
            let mergedCurvesData = [].concat.apply([], curvesData);
            let tempVport= d3.extent(mergedCurvesData, function(d) { return d.x; });

            _viewportX[0] = 0;
            _viewportX[1] = tempVport[1] * kFactor;
        }
    }

    function _doPlot() {
        let axisRange = {
            top: [yPadding, clientRect.height - yPadding],
            bottom: [yPadding, clientRect.height - yPadding].reverse(),
            left: [xPadding, clientRect.width - xPadding],
            right: [xPadding, clientRect.width - xPadding].reverse()
        }
        transformX = d3.scaleLinear().domain(_viewportX).range(axisRange[yAxisPosition]);
        transformY = d3.scaleLinear().domain(_viewportY).range(axisRange[xAxisPosition]);
        function setupAxes() {
            let xAxis = axisCfg[xAxisPosition](transformX)
                .tickValues(d3.range(_viewportX[0], _viewportX[1], (_viewportX[1] - _viewportX[0])/xNTicks))
                .tickFormat("")
                .tickSize(-(clientRect.height - 2 * yPadding));
            let start = roundUp(_viewportY[0], yStep);
            let end = roundDown(_viewportY[1], yStep);
            let yAxis = axisCfg[yAxisPosition](transformY)
                .tickValues(d3.range(start, end, (end - start)/yNTicks))
                .tickFormat(yFormatter)
                .tickSize(-(clientRect.width - 2 * xPadding));

            xAxisGroup.call(xAxis);
            yAxisGroup.call(yAxis);
        }
        function drawRefLine() {
            refLine.attr('x1', refX)
                .attr('x2', refX)
                .attr('y1', 0)
                .attr('y2', clientRect.height)
                .attr('stroke', refLineColor)
                .raise();
        }
        setupAxes();
        drawRefLine();
        self.plotAllCurves();
        self.plotAllShadings();
    }

    function _genColor() {
        function rand(x) {
            return Math.floor(Math.random() * x);
        }

        const DEFAULT_COLORS = ['Blue', 'Brown', 'Green', 'DarkGoldenRod', 'DimGray', 'Indigo', 'Navy'];
        let color, invertedColor;
        for (let i = 0; i <= _curves.length; i++)  {
            if (i >= DEFAULT_COLORS.length) {
                do {
                    color = d3.rgb(rand(255), rand(255), rand(255)).toString();
                }
                while (usedColors.has(color));
            }
            else {
                color = d3.color(DEFAULT_COLORS[i]).toString();
            }
            invertedColor = invertColor(color).toString();
            if (!usedColors.has(color) && !usedColors.has(invertedColor)) {
                usedColors.add(color);
                usedColors.add(invertedColor);
                break;
            }
        }
        return color;
    }

    function _addCurveHeader(dataSetName, unit, minVal, maxVal) {
        let unitHeaderData = [minVal, unit, maxVal];
        let curveHeader = headerContainer.append('div')
            .attr('class', 'curve-header');

        curveHeader.append('label')
            .attr('class', 'data-header text-center')
            .text(dataSetName);

        curveHeader.append('label')
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

        _curveHeaders.push(curveHeader);
    }

    function _removeCurveHeader(curveIdx) {
        headerContainer.selectAll('.curve-header')
            .filter(function(d, i) { return i == curveIdx; })
            .remove();
    }

    function _highlightCurveHeader() {
        _curveHeaders.forEach(function(h, i) {
            let bgColor = i == currentCurveIdx ? 'rgba(255,0,0,0.2)' : 'transparent';
            h.style('background-color', bgColor);
        });
    }

    const trackerLifetime = 1 * 1000; // 1 seconds
    this.periodicTask = function() {
        if( Date.now() - freshness > trackerLifetime )
            svg.selectAll('.wi-tooltip, .tooltipBg, .tooltipLine').remove();
    }
    registeredPlots.push(this);
}
