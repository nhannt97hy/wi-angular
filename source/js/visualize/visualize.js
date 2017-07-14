let Curve = require('./visualize-curve.js').Curve;
let Shading = require('./visualize-shading.js').Shading;
let DepthTrack = require('./visualize-depth-track.js').DepthTrack;

let Utils = require('./visualize-utils.js');

let roundUp = Utils.roundUp;
let roundDown = Utils.roundDown;
let appendTrack = Utils.appendTrack;
let invertColor = Utils.invertColor;


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


let registeredPlots = new Array();
setInterval(function() {
    registeredPlots.forEach(function(plot) {
        if(plot.periodicTask) plot.periodicTask();
    });
}, 2000);

function appendToTrackHeader(base, dataSetName, unit, minVal, maxVal) {
    let unitHeaderData = [minVal, unit, maxVal];
    let trackHeader = base.selectAll('.track-header');
    let temp = trackHeader.append('label')
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

function removeFromTrackHeader(base, idx) {
    base.selectAll('.data-header')
        .filter(function(d, i) { return i == idx; })
        .remove();

    base.selectAll('.unit-header')
        .filter(function(d, i) { return i == idx; })
        .remove();
}


function Plot(config) {
    let self = this;
    let _viewportX = new Array(), _viewportY = new Array();
    if( !config ) {
        console.error("config must not be null");
        return;
    }
    let _curves = new Array();
    let _shadings = new Array();
    let refLine;
    let refX = 10;
    let root;
    let base;
    let svg;
    let clientRect;
    let translateOpts = new Object();
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
    let xFormatter = d3.format(config.xFormatter || 'g'),
        yFormatter = d3.format(config.yFormatter || 'g');

    let usedColors = d3.set();
    let refLineColor = '#3e3e3e';
    let shading = false;
    let currentCurveIdx = -1;

    let axisCfg = {
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

    this.getYStep = function() { return yStep; };
    this.getCurves = function() { return _curves; };
    this.getCurrentCurveIdx = function() { return currentCurveIdx; };

    this.getYMax = function() {
        if (_curves.length == 0) return null;
        let curvesData = _curves.map(function(c) { return c.getData(); });
        let mergedCurvesData = [].concat.apply([], curvesData);
        return yStep * d3.max(mergedCurvesData, function(d) { return d.y });
    }

    this.getYMin = function() {
        if (_curves.length == 0) return null;
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

        svg = base.append('svg')
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
        new ResizeSensor(base.node(), function() {
            let previousWidth = clientRect.width;
            clientRect = base.node().getBoundingClientRect();

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
    this.onDrop = function(dropCallback){
        base.on('mouseover', function() {
            dropCallback();
        });
    }

    this.onMouseDown = function(mouseDownCallback) {
        base.on('mousedown', function() {
            mouseDownCallback();
        });
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

    this.doPlot = function() {
        _doPlot();
    }

    this.plotCurve = function(curveIdx) {
        if (curveIdx == currentCurveIdx) {
            _curves[curveIdx].doPlot(_viewportX, _viewportY, transformX, transformY, shading, 2, refX, yStep);
        }
        else {
            _curves[curveIdx].doPlot(_viewportX, _viewportY, transformX, transformY, shading, 1, refX, yStep);
        }
    }

    this.plotAllCurves = function() {
        for (let i = 0; i < _curves.length; i ++) {
            self.plotCurve(i);
        }
    }

    this.highlight = function(idx) {
        currentCurveIdx = idx;
        self.plotAllCurves();
    }

    this.plotAllShadings = function() {
        for (let i = 0; i < _shadings.length; i ++) {
            _shadings[i].doPlot(_viewportX, _viewportY, transformX, transformY, refX, yStep);
        }
    }

    this.onClick = function(callback) {
        svg.on('click', function() {callback();});
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

    this.addCurve = function(data, dataSetName, unit, min, max) {
        appendToTrackHeader(root, dataSetName, unit, min, max);

        let curve = new Curve({ color: _genColor() });
        curve.init(base, data);
        return _curves.push(curve) -1;
    }

    this.toggleShading = function() {
        shading = !shading;
    }

    this.removeCurve = function(curveIdx) {
        if (curveIdx < 0 || curveIdx >= _curves.length) return;
        let curve = _curves[curveIdx];
        usedColors.remove(curve.getColor());
        usedColors.remove(curve.getInvertedColor());
        curve.destroy();

        removeFromTrackHeader(root, curveIdx);

        _curves.splice(curveIdx, 1)[0];

        if (curveIdx == currentCurveIdx)
            currentCurveIdx = -1;
        else if (curveIdx < currentCurveIdx)
            currentCurveIdx -= 1;
    };

    this.removeCurrentCurve = function() { self.removeCurve(currentCurveIdx); };

    this.removeAllCurves = function() {
        usedColors.clear();
        _curves.forEach(function(c) {
            c.destroy();
        });
        _curves = [];
    };

    this.addShading = function(leftCurveIdx, rightCurveIdx, config) {
        config = typeof config != 'object' ? {} : config;
        console.log('Add shading in plot');
        let leftCurve = _curves[leftCurveIdx];
        let rightCurve = _curves[rightCurveIdx];
        let shading = new Shading({
            color: config.color || _genColor(),
            name: config.name || (leftCurve.getName() + ' - ' + rightCurve.getName())
        });
        shading.init(base, leftCurve, rightCurve);
        _shadings.push(shading);
    }

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
    const trackerLifetime = 1 * 1000; // 1 seconds
    this.periodicTask = function() {
        if( Date.now() - freshness > trackerLifetime )
            svg.selectAll('.wi-tooltip, .tooltipBg, .tooltipLine').remove();
    }
    registeredPlots.push(this);
}
