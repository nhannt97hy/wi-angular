let Curve = require('./visualize-curve.js');
let Shading = require('./visualize-shading.js');

let Utils = require('./visualize-utils.js');

let roundUp = Utils.roundUp;
let roundDown = Utils.roundDown;
let appendTrack = Utils.appendTrack;

module.exports = LogTrack;

/**
 * Represents a LogTrack
 * @constructor
 * @param {Object} config - Contain configurations.
 * @param {String} [config.xAxisPosition] - Position of the x axis. Default: 'top'
 * @param {String} [config.yAxisPosition] - Position of the y axis. Default: 'left'
 * @param {Number} [config.xNTicks] - Number of ticks shown in x axis. Default: 4
 * @param {Number} [config.yNTicks] - Number of ticks shown in y axis. Default: 20
 * @param {Number} [config.plotWidth] - Width in pixel of the bounding rectangle. Default: 200
 * @param {String} [config.xFormatter] - d3 formatter for numbers in x axis. Default: 'g'
 * @param {String} [config.yFormatter] - d3 formatter for numbers in y axis. Default: 'g'
 * @param {Number} [config.yStep] - Step to scale y ordinate. Default: 1.0
 * @param {Number} [config.xPadding] - Horizontal padding for inner drawings. Default: 0
 * @param {Number} [config.yPadding] - Vertical padding for inner drawings. Default: 0
 */

function LogTrack(config) {
    config = typeof config === 'object' ? config : {};
    let self = this;

    let _curves = [];
    let _shadings = [];
    let _curveHeaders = [];
    let _shadingHeaders = [];
    let _viewportX = [];
    let _viewportY = [];
    let currentCurveIdx = -1;
    let currentShadingIdx = -1;

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
    let xAxisPosition = config.xAxisPosition || 'top';
    let yAxisPosition = config.yAxisPosition || 'left';
    let xNTicks = config.xNTicks || 4;
    let yNTicks = config.yNTicks || 20;
    let plotWidth = config.plotWidth || 200;
    let yStep = config.yStep || 1.0;

    let xPadding = config.xPadding || 0, yPadding = config.yPadding || 0;
    let xFormatter = d3.format(config.xFormatter || 'g');
    let yFormatter = d3.format(config.yFormatter || 'g');

    let usedColors = [];
    let refLineColor = '#3e3e3e';
    let shading = false;
    let freshness = 0;
    let curvesRemoved = 0;

    let axisCfg = {
        top: function(transformX) { return d3.axisTop(transformX); },
        bottom: function(transformX) { return d3.axisBottom(transformX); },
        left: function(transformY) { return d3.axisLeft(transformY); },
        right: function(transformY) { return d3.axisRight(transformY); }
    }

    /** @returns {String} Position of x axis (top or bottom) */
    this.getXAxisPosition = function() { return xAxisPosition; }

    /** @returns {String} Position of y axis (left or right) */
    this.getYAxisPosition = function() { return yAxisPosition; }

    /** @returns {Number} Number of ticks shown in x axis */
    this.getXNTicks = function() { return xNTicks; }

    /** @returns {Number} Number of ticks shown in y axis */
    this.getYNTicks = function() { return yNTicks; }

    /** @returns {Number} Width in pixel of the bounding rectangle*/
    this.getPlotWidth = function() { return clientRect.width; }

    /** @returns {String} d3 formatter for numbers in x axis */
    this.getXFormatter = function() { return xFormatter; }

    /** @returns {String} d3 formatter for numbers in y axis */
    this.getYFormatter = function() { return yFormatter; }

    /** @returns {Number} Step to scale y ordinate */
    this.getYStep = function() { return yStep; }

    /** @returns {Number} Horizontal padding for inner drawings */
    this.getXPadding = function() { return xPadding; }

    /** @returns {Number} Vertical padding for inner drawings */
    this.getYPadding = function() { return yPadding; }

    /** @return {Array} All curve objects in this track */
    this.getCurves = function() { return _curves; }

    /** @return {Array} All shading objects in this track */
    this.getShadings = function() { return _shadings; }

    /** @return {Number} Index of the current curve, -1 if no curve is set to be current */
    this.getCurrentCurveIdx = function() { return currentCurveIdx; }

    /** @return {Number} Index of the current shading, -1 if no shading is set to be current */
    this.getCurrentShadingIdx = function() { return currentShadingIdx; }

    /** @return {Object} The current curve object */
    this.getCurrentCurve = function() { return _curves[currentCurveIdx]; }

    /** @return {Object} The current shading object */
    this.getCurrentShading = function() { return _shadings[currentShadingIdx]; }

    /** @return {Object} The current drawing (curve or shading) object */
    this.getCurrentDrawing = function() {
        if (currentShadingIdx >= 0) return _shadings[currentShadingIdx];
        if (currentCurveIdx >= 0) return _curves[currentCurveIdx];
        return null;
    }

    /** @return {Array} All headers for curves in this track */
    this.getCurveHeaders = function() { return _curveHeaders; }

    /** @return {Array} All headers for shadings in this track */
    this.getShadingHeaders = function() { return _shadingHeaders; }

    /** @return {Number} Maximum y value among all curves, null if there is no curve */
    this.getYMax = function() {
        if (_curves.length == 0) return null;
        let curvesData = _curves.map(function(c) { return c.getData(); });
        let mergedCurvesData = [].concat.apply([], curvesData);
        return yStep * d3.max(mergedCurvesData, function(d) { return d.y });
    }

    /** @return {Number} Mininum y value, null if there is no curve */
    this.getYMin = function() {
        if (_curves.length == 0) return null;
        return 0;
    };

    /** @todo Pending */
    this.setXAxisPosition = function(val) {}

    /** @todo Pending */
    this.setYAxisPosition = function(val) {}

    /** @todo Pending */
    this.setXNTicks = function(val) {}

    /** @todo Pending */
    this.setYNTicks = function(val) {}

    /** @todo Pending */
    this.setPlotWidth = function(val) {}

    /** @todo Pending */
    this.setXFormatter = function(val) {}

    /** @todo Pending */
    this.setYFormatter = function(val) {}

    /** @todo Pending */
    this.setYStep = function(val) {}

    /** @todo Pending */
    this.setXPadding = function(val) {}

    /** @todo Pending */
    this.setYPadding = function(val) {}

    /**
     * Set y range of viewport
     * @param {Array} vY - Start and end y coordinates within which data is shown
     */
    this.setYRange = function(vY) {
        _viewportY[0] = vY[0];
        _viewportY[1] = vY[1];
    }

    /**
     * Set current curve and highlight the curve drawing and header
     * @param {Number} idx - Index of the curve
     */
    this.setCurrentCurveIdx = function(idx) {
        currentCurveIdx = idx;
        self.plotAllCurves();
        _highlightCurveHeader();
    }

    /**
     * Set current shading and highlight the shading and header
     * @param {Number} idx - Index of the shading
     * @todos Pending
     */
    this.setCurrentShadingIdx = function(idx) {}

    /**
     * Set color for current curve
     * @param {String} color - CSS color string
     */
    this.setCurrentCurveColor = function(color) {
        let curve = self.getCurrentCurve();
        if (!curve) return;

        let d3Color = d3.color(color);
        if (!d3Color) return;

        let d3ColorString = d3Color.toString();

        usedColors.push(d3ColorString);
        curve.setColor(d3ColorString);
        self.plotCurve(currentCurveIdx);
    }

    /**
     * Initialize DOM elements for the track
     * param {Object} domElem - The DOM element to contain the track
     */
    this.init = function(baseElement) {
        trackContainer = appendTrack(baseElement, 'Track', plotWidth);
        plotContainer = trackContainer.select('.plot-container');
        headerContainer = trackContainer.select('.track-header');

        clientRect = plotContainer.node().getBoundingClientRect();
        _updateTranslateOpts(translateOpts, clientRect);

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

            _updateTranslateOpts(translateOpts, clientRect);

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

    /** Draw axes and curves */
    this.doPlot = function() { _doPlot(); }


    /**
     * Add curve to track
     * @param {Object} data - Array of objects containing x, y coordinates
     * @param {Object} config - Configurations of new curve
     * @param {String} [config.name] - Name of new curve. Default: auto generate
     * @param {String} [config.unit] - Unit of data. Default: 'm3'
     * @param {Number} [config.xMin] - Mininum x value to show. Default: auto detect
     * @param {Number} [config.xMax] - Maximum x value to show. Default: auto detect
     * @param {String} [config.color] - CSS color of new curve. Default: auto generate
     * @return {Number} Index of created curve
     */
    this.addCurve = function(data, config) {
        config = typeof config != 'object' ? {} : config;

        let name = config.name || ('Curve ' + (_curves.length + curvesRemoved));
        let unit = config.unit || 'm3';
        let xMin = config.xMin || roundDown(d3.min(data, function(d) { return d.x; }), 1);
        let xMax = config.xMax || roundUp(d3.max(data, function(d) { return d.x; }), 1);
        let color = config.color || _genColor();
        _addCurveHeader(name, unit, xMin, xMax);

        let curve = new Curve({
            color: color,
            name: name,
            unit: unit,
            xMin: xMin,
            xMax: xMax
        });

        curve.init(plotContainer, data);
        let idx = _curves.push(curve) -1;

        return idx;
    }

    /**
     * Add shading to track
     * @param {Number} leftCurveIdx - Index of left curve, -1 if drawing left shading
     * @param {Number} rightCurveIdx - Index of right curve, -1 if drawing right shading
     * @param {Object} config - Configurations of new shading
     * @param {String} [config.name] - Name of new shading. Default: auto generate
     * @param {String} [config.color] - CSS color of new shading. Default: auto generate
     * @param {Number} [config.refX] - x coordiate of reference line for custom shading
     * @returns {Number} Index of created shading
     * @todos Pending
     */
    this.addShading = function(leftCurveIdx, rightCurveIdx, config) {
        config = typeof config != 'object' ? {} : config;

        let leftCurve = _curves[leftCurveIdx];
        let rightCurve = _curves[rightCurveIdx];
        let color = config.color || _genColor();

        let leftName = leftCurve ? leftCurve.getName() : 'left';
        let rightName = rightCurve ? rightCurve.getName() : 'right';
        let name = config.name || (leftName + ' - ' + rightName) ;

        let shading = new Shading({
            color: color,
            name: name,
            refX: config.refX
        });

        shading.init(plotContainer, leftCurve, rightCurve);
        let idx = _shadings.push(shading) -1;
        return idx;
    }

    /**
     * Remove a curve from track
     * @param {Number} curveIdx - Index of the curve to remove
     */
    this.removeCurve = function(curveIdx) {
        if (curveIdx < 0 || curveIdx >= _curves.length) return;
        let curve = _curves[curveIdx];
        usedColors.splice(usedColors.indexOf(curve.getColor()), 1);
        curve.destroy();

        _removeCurveHeader(curveIdx);
        _curves.splice(curveIdx, 1)[0];
        _curveHeaders.splice(curveIdx, 1)[0];

        if (curveIdx == currentCurveIdx)
            currentCurveIdx = -1;
        else if (curveIdx < currentCurveIdx)
            currentCurveIdx -= 1;
    }

    /**
     * Remove a shading from track
     * @param {Number} shadingIdx - Index of the shading to remove
     * @todos Pending
     */
    this.removeShading = function(shadingIdx) {}

    /** Remove current curve from track */
    this.removeCurrentCurve = function() {
        self.removeCurve(currentCurveIdx);
    }

    /**
     * Remove current shading from track
     * @todos Pending
     */
    this.removeCurrentShading = function() {
        self.removeShading(currentShadingIdx);
    }

    /**
     * Remove current drawing (curve or shading) from track
     * @todos Pending
     */
    this.removeCurrentDrawing = function() {
        self.removeCurrentCurve();
        self.removeCurrentShading();
    }

    /** Remove all curves from track */
    this.removeAllCurves = function() {
        usedColors = [];
        for (let i = 0; i < _curves.length; i ++) {
            _curves[i].destroy();
            _removeCurveHeader(i);
        }
        _curves = [];
        _curveHeaders = [];
        currentCurveIdx = -1;
    }

    /**
     * Remove all shadings from track
     * @todos Pending
     */

    this.removeAllShadings = function() {}

    /**
     * Remove all drawings (curves and shadings) from track
     * @todos Pending
     */
    this.removeAllDrawings = function() {}

    /**
     * Plot one curve
     * @param {Number} curveIdx - Index of the curve to plot
     */
    this.plotCurve = function(curveIdx) {
        let lineWidth = curveIdx == currentCurveIdx ? 2 : 1;
        _curves[curveIdx].doPlot(_viewportX, _viewportY, transformX, transformY, shading, lineWidth, refX, yStep);
    }

    /**
     * Plot one shading
     * @param {Number} shadingIdx - Index of the shading to plot
     * @todos Pending
     */
    this.plotShading = function(shadingIdx) {
        _shadings[shadingIdx].doPlot(_viewportX, _viewportY, transformX, transformY, refX, yStep);
    }

    /** Plot all curves */
    this.plotAllCurves = function() {
        for (let i = 0; i < _curves.length; i ++) {
            self.plotCurve(i);
        }
    }

    /**
     * Plot all shadings
     * @todos Pending
     */
    this.plotAllShadings = function() {
        for (let i = 0; i < _shadings.length; i ++) {
            self.plotShading(i);
        }
    }

    /**
     * Plot all drawings (curves and shadings)
     */
    this.plotAllDrawings = function() {
        self.plotAllCurves();
        self.plotAllShadings();
    }

    /**
     * Register event when mouse over the plot area
     */
    this.onPlotMouseOver = function(cb){
        plotContainer.on('mouseover', cb);
    }

    /**
     * Register event when mouse leave the plot area
     */
    this.onPlotMouseLeave = function(cb) {
        plotContainer.on('mouseleave', cb);
    }

    /**
     * Register event when mouse down the plot area
     */
    this.onPlotMouseDown = function(cb) {
        plotContainer
            .on('mousedown', cb)
            .on('contextmenu', cb);
    }

    /**
     * Register event when mouse down the header area
     */
    this.onHeaderMouseDown = function(cb) {
        trackContainer.select('.track-header-viewport').on('mousedown',cb);
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

    function _updateTranslateOpts(translateOpts, clientRect) {
        translateOpts.top = 'translate(0, ' + yPadding + ')';
        translateOpts.bottom = 'translate(0, ' + (clientRect.height - yPadding) + ')';
        translateOpts.left = 'translate(' + xPadding + ', 0)';
        translateOpts.right = 'translate(' + (clientRect.width - xPadding) + ', 0)';
    }

    function _getAxisRange(axis) {
        return {
            top: [yPadding, clientRect.height - yPadding],
            bottom: [yPadding, clientRect.height - yPadding].reverse(),
            left: [xPadding, clientRect.width - xPadding],
            right: [xPadding, clientRect.width - xPadding].reverse()
        }[axis];
    }

    function _doPlot() {
        transformX = d3.scaleLinear().domain(_viewportX).range(_getAxisRange(yAxisPosition));
        transformY = d3.scaleLinear().domain(_viewportY).range(_getAxisRange(xAxisPosition));
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
        let color;
        for (let i = 0; i <= _curves.concat(_shadings).length; i++)  {
            if (i >= DEFAULT_COLORS.length) {
                do {
                    color = d3.rgb(rand(255), rand(255), rand(255)).toString();
                }
                while (usedColors.indexOf(color) >= 0);
            }
            else {
                color = d3.color(DEFAULT_COLORS[i]).toString();
            }
            if (usedColors.indexOf(color) < 0) {
                usedColors.push(color);
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
}
