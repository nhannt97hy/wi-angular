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
    let _viewportX = [0, 1];
    let _viewportY = [];
    let _currentCurve = null;
    let _currentShading = null;

    let trackContainer;
    let plotContainer;
    let headerContainer;
    let clientRect;
    let svg;

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

    /** @return {Object} The current curve object */
    this.getCurrentCurve = function() { return _currentCurve; }

    /** @return {Object} The current shading object */
    this.getCurrentShading = function() { return _currentShading; }

    /** @return {Object} The current drawing (curve or shading) object */
    this.getCurrentDrawing = function() {
        if (_currentShading) return _currentShading;
        if (_currentCurve) return _currentCurve;
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
        let max = d3.max(mergedCurvesData, function(d) { return d.y });
        return roundUp(max, 100) * yStep;
    }

    /** @return {Number} Mininum y value, null if there is no curve */
    this.getYMin = function() {
        if (_curves.length == 0) return null;
        return 0;
    };

    /**
     * @return {Array} y range of viewport
     */
    this.getViewportY = function() {
        return _viewportY;
    }

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
    this.setViewportY = function(vY) {
        _viewportY[0] = vY[0];
        _viewportY[1] = vY[1];
    }

    /**
     * Set current curve and highlight the curve drawing and header
     * @param {Object} curve - The curve object
     */
    this.setCurrentCurve = function(curve) {
        _currentCurve = curve;
        _currentShading = null;
        self.plotAllDrawings();
        _highlightCurveHeader();
        _highlightShadingHeader();
    }

    /**
     * Set current shading and highlight the shading and header
     * @param {Object} shading - The shading object
     */
    this.setCurrentShading = function(shading) {
        _currentShading = shading;
        _currentCurve = null;
        self.plotAllDrawings();
        _highlightCurveHeader();
        _highlightShadingHeader();
    }

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
        self.plotCurve(self.getCurrentCurve());
    }

    /**
     * Initialize DOM elements for the track
     * param {Object} domElem - The DOM element to contain the track
     */
    this.init = function(baseElement) {
        trackContainer = appendTrack(baseElement, 'Track', plotWidth);
        plotContainer = trackContainer
            .select('.plot-container')
            .on('mousedown', _onPlotMouseDownCallback);

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

        new ResizeSensor(plotContainer.node(), function() {
            clientRect = plotContainer.node().getBoundingClientRect();

            _updateTranslateOpts(translateOpts, clientRect);

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
            self.doPlot();
        });
    }

    /** Draw axes, curves and shadings */
    this.doPlot = function() {
        _plotAxes();
        self.plotAllCurves();
        self.plotAllShadings();
    }


    /**
     * Add curve to track
     * @param {Object} data - Array of objects containing x, y coordinates
     * @param {Object} config - Configurations of new curve
     * @param {String} [config.name] - Name of new curve. Default: auto generate
     * @param {String} [config.unit] - Unit of data. Default: 'm3'
     * @param {Number} [config.xMin] - Mininum x value to show. Default: auto detect
     * @param {Number} [config.xMax] - Maximum x value to show. Default: auto detect
     * @param {String} [config.color] - CSS color of new curve. Default: auto generate
     * @return {Object} The created curve
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
        _curves.push(curve);
        return curve;
    }

    /**
     * Add left shading to track
     * @param {Object} curve - The curve to draw shading
     * @param {Object} config - Configurations of new shading
     * @param {String} [config.name] - Name of new shading. Default: auto generate
     * @param {String} [config.fillStyle] - Canvas fillStyle of new shading. Default: auto generate
     * @returns {Object} The created shading
     */
    this.addLeftShading = function(curve, config) {
        if (!curve) return;
        return self.addShading(null, curve, null, config);
    }

    /**
     * Add right shading to track
     * @param {Object} curve - The curve to draw shading
     * @param {Object} config - Configurations of new shading
     * @param {String} [config.name] - Name of new shading. Default: auto generate
     * @param {String} [config.fillStyle] - Canvas fillStyle of new shading. Default: auto generate
     * @returns {Object} The created shading
     */
    this.addRightShading = function(curve, config) {
        if (!curve) return;
        return self.addShading(curve, null, null, config);
    }

    /**
     * Add pair shading to track
     * @param {Object} firstCurve - The first curve to draw shading
     * @param {Object} secondCurve - The second curve to draw shading
     * @param {Object} config - Configurations of new shading
     * @param {String} [config.name] - Name of new shading. Default: auto generate
     * @param {String} [config.fillStyle] - Canvas fillStyle of new shading. Default: auto generate
     * @returns {Object} The created shading
     */
    this.addPairShading = function(firstCurve, secondCurve, config) {
        if (!firstCurve || !secondCurve) return;
        return self.addShading(firstCurve, secondCurve, null, config);
    }


    /**
     * Add custom shading to track
     * @param {Object} curve - The curve to draw shading
     * @param {Number} refX - x coordinate of reference line
     * @param {Object} config - Configurations of new shading
     * @param {String} [config.name] - Name of new shading. Default: auto generate
     * @param {String} [config.fillStyle] - Canvas fillStyle of new shading. Default: auto generate
     * @returns {Object} The created shading
     */
    this.addCustomShading = function(curve, refX, config) {
        if (!curve) return;
        let shading = self.addShading(curve, null, refX, config);

        shading.onRefLineDrag(function(){
            let rWidth = shading.getRefLineWidth();
            let leftMost = rWidth / 2;
            let rightMost = clientRect.width - rWidth / 2;
            refX = d3.event.x;
            refX = refX > rightMost ? rightMost : refX;
            refX = refX < leftMost ? leftMost : refX;
            shading.setRefX(refX);
            self.plotShading(shading);
        });
        return shading;
    }

    /**
     * Add shading to track
     * @param {Object} leftCurve - Left curve, null if drawing left shading
     * @param {Object} rightCurve - Right curve, null if drawing right shading
     * @param {Number} refX - x coordiate of reference line for custom shading
     * @param {Object} config - Configurations of new shading
     * @param {String} [config.name] - Name of new shading. Default: auto generate
     * @param {String} [config.fillStyle] - Canvas fillStyle of new shading. Default: auto generate
     * @returns {Object} The created shading
     */
    this.addShading = function(leftCurve, rightCurve, refX, config) {
        config = typeof config != 'object' ? {} : config;

        let fillStyle = config.fillStyle || _genColor();

        let leftName = leftCurve ? leftCurve.getName() : 'left';
        let rightName = rightCurve ? rightCurve.getName() : 'right';
        let name = config.name || (leftName + ' - ' + rightName) ;

        let shading = new Shading({
            fillStyle:fillStyle,
            name: name,
            refX: refX
        });

        shading.init(plotContainer, leftCurve, rightCurve);
        _shadings.push(shading);
        return shading;
    }

    /**
     * Remove a curve from track
     * @param {Object} curve - The curve to remove
     */
    this.removeCurve = function(curve) {
        if (!curve) return;
        usedColors.splice(usedColors.indexOf(curve.getColor()), 1);
        curve.destroy();

        let curveIdx = _curves.indexOf(curve);
        _removeCurveHeader(curve);
        _curves.splice(curveIdx, 1);
        _curveHeaders.splice(curveIdx, 1);

        if (curve == _currentCurve)
            _currentCurve = null;
    }

    /**
     * Remove a shading from track
     * @param {Object} shading - The shading to remove
     */
    this.removeShading = function(shading) {
        if (!shading) return;
        let d3Color = d3.color(shading.getFillStyle());
        if (d3Color) {
            usedColors.splice(usedColors.indexOf(d3Color.toString()), 1);
        }
        shading.destroy();
        let idx = _shadings.indexOf(shading);
        _shadings.splice(idx, 1);

        if (shading == _currentShading)
            _currentShading = null;
    }

    /**
     * Remove current curve from track
     */
    this.removeCurrentCurve = function() {
        self.removeCurve(_currentCurve);
    }

    /**
     * Remove current shading from track
     */
    this.removeCurrentShading = function() {
        self.removeShading(_currentShading);
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
        _curves.forEach(function(c) {
            self.removeCurve(c);
        })
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
     * @param {Object} curve - The curve to plot
     */
    this.plotCurve = function(curve) {
        if (!curve) return;
        let lineWidth = curve == self.getCurrentCurve() ? 2 : 1;
        curve.doPlot(
            _viewportY,
            _getAxisRange(yAxisPosition),
            _getAxisRange(xAxisPosition),
            {
                lineWidth: lineWidth,
                yStep: yStep
            }
        )
    }

    /**
     * Plot one shading
     * @param {Number} shadingIdx - Index of the shading to plot
     * @todos Pending
     */
    this.plotShading = function(shading) {
        if (!shading) return;
        shading.doPlot(
            _viewportY,
            _getAxisRange(yAxisPosition),
            _getAxisRange(xAxisPosition),
            {
                yStep: yStep
            }
        );
    }

    /** Plot all curves */
    this.plotAllCurves = function() {
        _curves.forEach(function(curve) {
            self.plotCurve(curve);
        });
    }

    /**
     * Plot all shadings
     * @todos Pending
     */
    this.plotAllShadings = function() {
        _shadings.forEach(function(shading) {
            self.plotShading(shading);
        });
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
     * Register event when mouse wheel on the plot area
     */
    this.onPlotMouseWheel = function(cb) {
        plotContainer.on('mousewheel', cb);
    }

    /**
     * Register event when mouse down the plot area
     */
    this.onPlotMouseDown = function(cb) {
        plotContainer
            .on('mousedown', function() {
                _onPlotMouseDownCallback();
                cb();
            })
            .on('contextmenu', cb);
    }

    /**
     * Register event when mouse down the header area
     */
    this.onHeaderMouseDown = function(cb) {
        trackContainer.select('.track-header-viewport').on('mousedown',cb);
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

    function _plotAxes() {
        transformX = d3.scaleLinear().domain(_viewportX).range(_getAxisRange(yAxisPosition));
        transformY = d3.scaleLinear().domain(_viewportY).range(_getAxisRange(xAxisPosition));
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

    function _addCurveHeader(name, unit, minVal, maxVal) {
        let unitHeaderData = [minVal, unit, maxVal];
        let curveHeader = headerContainer.append('div')
            .attr('class', 'curve-header');

        curveHeader.append('label')
            .attr('class', 'data-header text-center')
            .text(name);

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

    function _addShadingHeader(name, fillStyle) {

    }

    function _removeCurveHeader(curve) {
        let curveIdx = _curves.indexOf(curve);
        headerContainer.selectAll('.curve-header')
            .filter(function(d, i) { return i == curveIdx; })
            .remove();
    }

    function _highlightCurveHeader() {
        _curveHeaders.forEach(function(h, i) {
            let bgColor = i == _curves.indexOf(_currentCurve) ? 'rgba(255,0,0,0.2)' : 'transparent';
            h.style('background-color', bgColor);
        });
    }

    function _highlightShadingHeader() {}

    function _onPlotMouseDownCallback() {
        let current = null;
        _curves.forEach(function(c) {
            if (!current && c.nearPoint(d3.event.offsetX, d3.event.offsetY)) {
                current = c;
                d3.event.curveMouseDown = true;
            }
        });
        if (current) {
            self.setCurrentCurve(current);
            return;
        }
        _shadings.forEach(function(sh) {
            if (!current && sh.nearPoint(d3.event.offsetX, d3.event.offsetY)) {
                current = sh;
                d3.event.shadingMouseDown = true;
                return;
            }
        });
        self.setCurrentShading(current);
    }

    const trackerLifetime = 1 * 1000; // 1 seconds
    this.periodicTask = function() {
        if( Date.now() - freshness > trackerLifetime )
            svg.selectAll('.wi-tooltip, .tooltipBg, .tooltipLine').remove();
    }
}
