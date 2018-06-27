let Utils = require('./visualize-utils');
let gUtils = require('./../utils');
let Drawing = require('./visualize-drawing');
let CanvasHelper = require('./visualize-canvas-helper');

module.exports = Curve;

Utils.extend(Drawing, Curve);

/**
 * Represents a Curve
 * @constructor
 * @param {Object} config - Configurations of new curve
 * @param {Number} [config.id] - The id of this line(curve) in backend (idLine field)
 * @param {Number} [config.idCurve] - The id of this line(curve) in backend (idCurve field)
 * @param {Number} [config.idDataset] - The id of the dataset in backend (idDataset field)
 * @param {String} [config.datasetName] - the datasetName (datasetName feild)
 * @param {String} [config.name] - Name of new curve
 * @param {Array} [config._data] - Data containing x, y coordinates or the curve * CHANGE config.data -> config._data -- TUNG *
 * @param {String} [config.unit] - Unit of data
 * @param {Number} [config.minX] - Mininum x value to show
 * @param {Number} [config.maxX] - Maximum x value to show
 * @param {Number} [config.minY] - Mininum y value to show
 * @param {Number} [config.maxY] - Maximum y value to show
 * @param {String} [config.scale] - Scale type (Linear or Logarithmic)
 * @param {String} [config.alias] - Text to show on header
 * @param {Boolean} [config.showHeader] - Flag to show or hide header
 * @param {String} [config.blockPosition] - Display curve as blocks with the data point at specified position (start, middle, end, none)
 * @param {String} [config.wrapMode] - Wrap outliers to specified side of the plot (left, right, both, none)
 * @param {Object} [config.line] - Configuration to draw line
 * @param {String} [config.line.color] - Line color
 * @param {Number} [config.line.width] - Line width
 * @param {Array} [config.line.dash] - Line dash style
 * @param {Object} [config.symbol] - Configuration to draw symbol
 * @param {String} [config.symbol.style] - Symbol style (circle, square, cross, diamond, plus, star)
 * @param {String} [config.symbol.fillStyle] - Symbol fill style
 * @param {String} [config.symbol.strokeStyle] - Symbol stroke style
 * @param {Number} [config.symbol.lineWidth] - Symbol line width
 * @param {Array} [config.symbol.lineDash] - Symbol line dash
 * @param {Number} [config.symbol.size] - Symbol size
 * @param {String} [config.symbol.displayAs] - Normal, Cumulative, Mirror, Pid
 */
function Curve(config) {
    Drawing.call(this, config);
    if (typeof config != 'object') config = {};
    // let datasetName = gUtils.findDatasetById(config.idDataset) ? gUtils.findDatasetById(config.idDataset).name : null;
    this.id = config.id;
    this.idCurve = config.idCurve;
    this.idDataset = config.idDataset;
    this.datasetName = config.dataset;
    this.name = config.name || 'Noname';
    this.unit = config.unit || 'm3';

    this.minX = config.minX;
    this.maxX = config.maxX;

    this.scale = config.scale || 'Linear';
    this.alias = config.alias || this.name;
    this.line = config.line;
    this.symbol = config.symbol;
    this.showHeader = (config.showHeader == null) ? true : config.showHeader;
    this.showDataset = (config.showDataset == null) ? false : config.showDataset;

    this.blockPosition = config.blockPosition || 'none';
    this.wrapMode = config.wrapMode || 'none';
    this.displayAs = config.displayAs || 'Normal';
    this.displayMode = config.displayMode || 'Line';
    this.autoValueScale = config.autoValueScale || false;
    this.yStep = config.yStep || 1;
    this.offsetY = config.offsetY || 0;

    // this.rawData = config.data || [];
    this.rawData = config._data || [];

    this.data = Utils.parseData(this.rawData);
    // this.data = Utils.trimData(this.data);
    // this.data = Utils.interpolateData(this.data);
    this.orderNum = config.orderNum;

    let self = this;
    this.data = this.data.map(function(d) {
        return {
            x: d.x,
            y: d.y * self.yStep + self.offsetY
        };
    });
    let dataMap = {};
    this.data.forEach(function(d) {
        dataMap[d.y] = d.x;
    });
    this.dataMap = dataMap;

    if (this.minX == null || this.maxX == null)
        this.autoScaleX();

    if (this.minY == null || this.maxY == null) {
        let extentY = this.getExtentY();
        this.minY = extentY[0];
        this.maxY = extentY[1];
    }
    this.prevProps = {};
}

/**
 * @returns {Object} Properties of the curve
 */
Curve.prototype.getProperties = function() {
    let self = this;
    // function getDisplayMode() {
    //     if (self.line && self.symbol) return 'Both';
    //     if (self.line && !self.symbol) return 'Line';
    //     if (!self.line && self.symbol) return 'Symbol';
    //     return 'None';
    // }

    let line = this.line || {};
    let symbol = this.symbol || {};
    return {
        idLine: this.id,
        idCurve: this.idCurve,
        idDataset: this.idDataset,
        alias: this.alias,
        name: this.name,
        unit: this.unit,
        showHeader: this.showHeader,
        showDataset: this.showDataset,
        minValue: this.minX,
        maxValue: this.maxX,
        autoValueScale: this.autoValueScale,
        displayMode: this.displayMode,
        wrapMode: Utils.capitalize(this.wrapMode),
        blockPosition: Utils.capitalize(this.blockPosition),
        ignoreMissingValues: false,
        displayType: Utils.capitalize(this.scale),
        displayAs: 'Normal',
        lineStyle: line.dash,
        lineWidth: line.width,
        lineColor: line.color,
        symbolName: Utils.capitalize(symbol.style),
        symbolSize: symbol.size,
        symbolStrokeStyle: symbol.strokeStyle,
        symbolFillStyle: symbol.fillStyle,
        symbolLineWidth: symbol.lineWidth,
        symbolLineDash: symbol.lineDash,
        displayAs: this.displayAs,
        orderNum: this.orderNum
    }
}

/**
 * @param {Object} props - New properties for the curve
 * @param {Array} units - list of units for the curve
 */
Curve.prototype.setProperties = function(props, units) {
    let self = this;
    this.prevProps = this.getProperties();

    Utils.setIfNotNull(this, 'id', props.idLine);
    Utils.setIfNotNull(this, 'idCurve', props.idCurve);
    Utils.setIfNotNull(this, 'idDataset', props.idDataset);
    Utils.setIfNotNull(this, 'alias', props.alias);
    Utils.setIfNotNull(this, 'name', props.name);
    Utils.setIfNotNull(this, 'unit', props.unit);
    Utils.setIfNotNull(this, 'showHeader', props.showHeader);
    Utils.setIfNotNull(this, 'showDataset', props.showDataset);
    Utils.setIfNotNull(this, 'autoValueScale', props.autoValueScale);
    Utils.setIfNotNull(this, 'minX', props.minValue);
    Utils.setIfNotNull(this, 'maxX', props.maxValue);
    Utils.setIfNotNull(this, 'scale', Utils.capitalize(props.displayType));
    Utils.setIfNotNull(this, 'blockPosition', Utils.lowercase(props.blockPosition));
    Utils.setIfNotNull(this, 'wrapMode', Utils.lowercase(props.wrapMode));
    Utils.setIfNotNull(this, 'displayAs', Utils.capitalize(props.displayAs));
    Utils.setIfNotNull(this, 'displayMode', Utils.capitalize(props.displayMode));

    if (props.displayMode == 'Both' || props.displayMode == 'Line') {
        this.line = {
            dash: eval(props.lineStyle),
            width: parseInt(props.lineWidth),
            color: Utils.convertColorToRGB(props.lineColor)
        }
        // if (props.displayMode == 'Line') this.symbol = null;
    }

    if (props.displayMode == 'Both' || props.displayMode == 'Symbol') {
        this.symbol = {
            style: Utils.lowercase(props.symbolName),
            size: parseInt(props.symbolSize),
            strokeStyle: Utils.convertColorToRGB(props.symbolStrokeStyle),
            fillStyle: Utils.convertColorToRGB(props.symbolFillStyle),
            lineWidth: parseInt(props.symbolLineWidth),
            lineDash: eval(props.symbolLineDash)
        }
        // if (props.displayMode == 'Symbol') this.line = null;
    }

    if(props.rawData && Array.isArray(props.rawData) && props.rawData.length){
        this.rawData = props.rawData;
        this.data = Utils.parseData(this.rawData);
        this.data = this.data.map(function(d) {
            return {
                x: d.x,
                y: d.y * self.yStep + self.offsetY
            };
        });
        let dataMap = {};
        this.data.forEach(function(d) {
            dataMap[d.y] = d.x;
        });
        this.dataMap = dataMap;
    }

    if(this.prevProps.unit && props.unit && this.prevProps.unit !== props.unit) {
        if(units && Array.isArray(units)) {
            let prevUnit = units.find(u => u.name === this.prevProps.unit);
            let currUnit = units.find(u => u.name === props.unit);
            self.changeUnitValue(prevUnit, currUnit);
        } else {
            console.error('no unit list for convertion')   
        }
    }

    // if (props.displayMode == 'None') {
    //     this.symbol = null;
    //     this.line = null;
    // }
}

/**
 * @param {String} prevUnit - previous unit for the curve
 * @param {String} currUnit - current unit for the curve
 * @param {Array} units - list of units for the curve
 */
Curve.prototype.changeUnitValue = function(prevUnit, currUnit) {
    let self = this;
    function mapUnit(x) {
        return x * currUnit.rate / prevUnit.rate;
    }
    this.data.forEach(function(d) {
        d.x = mapUnit(d.x);
        self.dataMap[d.y] = d.x;
    })
}

/**
 * Get x window of curve
 * @returns {Array} Range of x values to show
 */
Curve.prototype.getWindowX = function() {
    return [this.minX, this.maxX];
}

/**
 * Get x extent of curve
 * @returns {Array} Extent of y values
 */
Curve.prototype.getExtentX = function() {
    let xs = this.data.map(function(d) {
        return d.x;
    })
    return [d3.min(xs), d3.max(xs)];
}

/**
 * Get y extent of curve
 * @returns {Array} Extent of y values
 */
Curve.prototype.getExtentY = function() {
    let ys = this.data.map(function(d) {
        return d.y;
    })
    return [d3.min(ys), d3.max(ys)];
}

/**
 * Auto set x window by x extent
 * @param {Number} granularity - level of detail to round
 */
Curve.prototype.autoScaleX = function(granularity) {
    if (!granularity) granularity = this.yStep;
    let extentX = this.getExtentX();
    this.minX = Utils.roundDown(extentX[0], granularity);
    this.maxX = Utils.roundUp(extentX[1], granularity);
}

/**
 * Initialize DOM elements
 * @param {Object} plotContainer - The DOM element to contain the curve
 */
Curve.prototype.init = function(plotContainer, track) {
    Drawing.prototype.init.call(this, plotContainer);

    this.track = track;
    this.canvas = plotContainer.append('canvas')
        .attr('class', 'vi-track-drawing vi-track-curve')
        .attr('id', this.id)
        .style('cursor', 'crosshair');

    this.adjustSize();

    this.ctx = this.canvas.node().getContext('2d');
    return this;
}

/**
 * Check if the curve near a point
 * @param {Number} x - x coordinate of the point
 * @param {Number} y - y coordinate of the point
 * @returns {Boolean}
 */
Curve.prototype.nearPoint = function(x, y) {
    return Drawing.prototype.nearPoint.call(this, x, y, 4);
}

/**
 * Get all colors used by the curve
 * @returns {Array}
 */
Curve.prototype.getAllColors = function() {
    let colors = [];
    if (this.line && d3.color(this.line.color))
        colors.push(d3.color(this.line.color).toString());
    if (this.symbol && d3.color(this.symbol.strokeStyle))
        colors.push(d3.color(this.symbol.strokeStyle).toString());
    if (this.symbol && d3.color(this.symbol.fillStyle))
        colors.push(d3.color(this.symbol.fillStyle).toString());
    return colors;
}

/**
 * Get transform function for x coordinate
 */
Curve.prototype.getTransformX = function() {
    //let rect = this.root.node().getBoundingClientRect();
    let rect = Utils.getBoundingClientDimension(this.root.node());
    let windowX = this.getWindowX();
    let self = this;

    switch(Utils.lowercase(this.scale)) {
        case 'linear':
            return d3.scaleLinear()
                .domain(windowX)
                .range([0, rect.width]);
        case 'logarithmic':
            let minX = d3.min(self.getWindowX());
            function toPositive(val) {
                return val - minX + 0.01;
            }
            function fromPositive(val) {
                return val + minX - 0.01;
            }
            let d3LogFunc = d3.scaleLog()
                .domain([toPositive(windowX[0]), toPositive(windowX[1])])
                .range([0, rect.width])
                .clamp(true);

            function logFunc(x) {
                return d3LogFunc(toPositive(x));
            }
            logFunc.invert = function(x) {
                return fromPositive(d3LogFunc.invert(x));
            }
            return logFunc;
    }
}

/**
 * Actually draw the curve
 * @param {Boolean} highlight
 */
Curve.prototype.doPlot = function(highlight, keepPrevious) {
    //console.log('doPlot', this.constructor.name, this.name);
    let self = this;
    //let rect = this.root.node().getBoundingClientRect();
    let rect = Utils.getBoundingClientDimension(this.root.node());
    if (!keepPrevious) this.adjustSize();
    this.updateHeader();

    let transformX = this.getTransformX();
    let transformY = this.getTransformY();
    let windowY = this.getWindowY();

    let plotSamples = this.data.filter(function(item) {
        return Utils.isWithinYRange(item, [windowY[0] - self.yStep, windowY[1] + self.yStep]);
    });
    if (plotSamples.length == 0) return;
    let ctx = this.ctx;
    if (!keepPrevious) ctx.clearRect(0, 0, rect.width, rect.height);

    Utils.clusterData(plotSamples).forEach(function(clustered) {
        let data = clustered.map(function(s) {
            return {
                x: transformX(s.x),
                y: transformY(s.y)
            }
        });
        self.getCanvasTranslateXForWrapMode().forEach(function(translateX) {
            ctx.save();
            ctx.translate(translateX, 0);
            if (self.line && (self.displayMode == 'Line' || self.displayMode == 'Both'))
                plotLine(self, data, highlight);
            if (self.symbol && (self.displayMode == 'Symbol' || self.displayMode == 'Both'))
                plotSymbol(self, data, highlight);

            if (self.displayAs == 'Pid' && (self.line || self.symbol)) {
                plotPid(self, data, highlight);
            }
            ctx.restore();
        });
    });
    if ((this.displayAs == 'Cumulative' && this.prevProps.displayAs != 'Cumulative') ||
        (this.displayAs != 'Cumulative' && this.prevProps.displayAs == 'Cumulative') && this.track) {
        this.prevProps.displayAs = this.displayAs;
        const cCurves = this.track.getCurves().filter(function(curve) {
            return curve.displayAs == 'Cumulative';
        });
        cCurves.forEach(function(curve) {
            if (curve == self) return;
            curve.doPlot();
        });
        const cCurveIds = new Set(cCurves.map(function(c) { return c.id; }));
        const cShadings = this.track.getShadings().filter(function(sh) {
            return (sh.leftCurve && cCurveIds.has(sh.leftCurve.id)) ||
                (sh.rightCurve && cCurveIds.has(sh.rightCurve.id));
        });

        cShadings.forEach(function(sh) {
            sh.doPlot();
        })
    }
    return this;
}

Curve.prototype.updateHeader = function() {
    if (!this.header) return;

    let self = this;
    this.header
        .style('color', self.line.color)
        .style('display', this.showHeader ? 'block' : 'none')
        .select('.vi-curve-name')
        .text(this.alias);

    this.header
        .select('.vi-curve-data')
        .selectAll('div')
        .each(function(d, i) {
            let elem = d3.select(this);
            if (i == 0) elem.text(self.minX);
            if (i == 1) elem.text(self.unit);
            if (i == 2) elem.text(self.maxX);
        })
    const rect = this.header.node().getBoundingClientRect();
    const headerBorderWidth = parseInt(this.header.style('border-width'));
    const width = rect.width - headerBorderWidth;
    const height = Math.max(_.get(self, 'line.width') || 0, _.get(self, 'symbol.size') || 0);
    const headerCanvas = this.header.select('canvas');
    headerCanvas.attr('width', width).attr('height', height);
    const headerCtx = headerCanvas.node().getContext('2d');
    if (self.line && (self.displayMode == 'Line' || self.displayMode == 'Both')) {
        headerCtx.beginPath();
        headerCtx.strokeStyle = self.line.color;
        headerCtx.lineWidth = self.line.width;
        headerCtx.setLineDash(self.line.dash);
        headerCtx.moveTo(0, height/2);
        headerCtx.lineTo(width, height/2);
        headerCtx.stroke();
    }
    if (self.symbol && (self.displayMode == 'Symbol' || self.displayMode == 'Both')) {
        const helper = new CanvasHelper(headerCtx, {
            strokeStyle: self.symbol.fillStyle,
            fillStyle: self.symbol.fillStyle,
            lineWidth: self.symbol.lineWidth,
            lineDash: self.symbol.lineDash,
            size: self.symbol.size
        });
        const symbolPlotFunc = helper[self.symbol.style.toLowerCase()];
        if (typeof symbolPlotFunc === 'function') {
            const y = height / 2;
            let x = 0;
            do {
                symbolPlotFunc.call(helper, x, y);
                x += self.symbol.size * 2;
            } while (x < width);
        }
    }
}

Curve.prototype.getCanvasTranslateXForWrapMode = function() {
    //let width = this.root.node().clientWidth;
    let width = $(this.root.node()).width();
    let wrapMode = Utils.lowercase(this.wrapMode);
    let ret = [];

    ret.push(0);
    if (wrapMode == 'left' || wrapMode == 'both')
        ret.push(-width);
    if (wrapMode == 'right' || wrapMode == 'both')
        ret.push(width);

    return ret;
}

Curve.prototype.updateOrderNum = function(orderNum) {
    this.orderNum = orderNum || this.orderNum;
    this.header.datum(this.orderNum + '-' + this.name)
        .attr('data-order-num', function(d) { return d; });
}

Curve.prototype.calculateDataForBlockPosition = function(originData) {
    let self = this;
    let data = [];
    originData.forEach(function(d, i) {
        data.push(d);
        if (i == originData.length - 1) return;
        if (d.x == null || originData[i+1].x == null) return;

        switch (Utils.lowercase(self.blockPosition)) {
            case 'start':
                data.push({
                    x: d.x,
                    y: originData[i+1].y
                })
                return;
            case 'middle':
                data.push({
                    x: d.x,
                    y: (d.y + originData[i+1].y) / 2
                });
                data.push({
                    x: originData[i+1].x,
                    y: (d.y + originData[i+1].y) / 2
                })
                return;
            case 'end':
                data.push({
                    x: originData[i+1].x,
                    y: d.y
                });
                return;
        }
    });

    return data;
}

Curve.prototype.calculateDataForDisplayAs = function(originData) {
    let self = this;
    let data = [];
    switch (this.displayAs) {
        case 'Mirror':
            let vpX = this.getViewportX();
            for (let i = originData.length -1; i >= 0; i--) {
                data.push({
                    x: vpX[0] - originData[i].x + vpX[1],
                    y: originData[i].y
                });
            }
            return originData.concat(data);
        case 'Cumulative':
            if (!this.track) return originData;
            let cumulativeCurves = this.track.getCurves().filter(function(curve) {
                return curve.displayAs == 'Cumulative';
            });
            let index = cumulativeCurves.indexOf(this);
            cumulativeCurves = cumulativeCurves.slice(0, index);

            let transformX = this.getTransformX();
            let transformY = this.getTransformY();

            originData.forEach(function(d) {
                let x = transformX.invert(d.x);
                let y = transformY.invert(d.y);

                if (x == null || isNaN(x) || y == null || isNaN(y))
                    return;

                cumulativeCurves.forEach(function(curve) {
                    if (curve.dataMap[y] != null && !isNaN(curve.dataMap[y]))
                        x += curve.dataMap[y];
                });

                x = transformX(x);
                y = transformY(y);

                if (x != null && !isNaN(x) && y != null && !isNaN(y))
                    data.push({ x: x, y: y });
            });
            return data;
        default:
            return originData;
    }
}

Curve.prototype.addHighlightEffect = function() {
    let ctx = this.ctx;
    ctx.shadowColor = Utils.convertColorToRGB(ctx.strokeStyle) || 'black';
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 2;
}

Curve.prototype.updateWindowY = function(minY, maxY) {
    this.minY = minY;
    this.maxY = maxY;
    this.doPlot();
}

Curve.prototype.drawControlLines = function(params) {
    let headerBox = this.header.node().getBoundingClientRect();
    let transformX = this.getTransformX();
    if(!this.headerSvgContainer) 
        this.headerSvgContainer = this.header.append('svg')
            .attr('class', 'vi-curve-header-svg-container')
            .attr('width', headerBox.width)
            .attr('height', headerBox.height)
            .style('position', 'absolute')
            .style('top', 0)
            .style('left', 0);
    let controlLines = this.headerSvgContainer.selectAll('line.vi-control-line').data(params); 
    controlLines
        .enter()
            .append('line')
            .attr('y1', 0)
            .attr('y2', headerBox.height)
            .attr('class', 'vi-control-line')
            .attr('stroke', 'black')
            .attr('stroke-width', 1.5);
    controlLines
        .attr('x1', d => transformX(d.value))
        .attr('x2', d => transformX(d.value));
    controlLines
        .exit().remove();
}

Curve.prototype.drawControlLineText = function(params) {
    if(!this.headerSvgContainer) return;
    let headerBox = this.header.node().getBoundingClientRect();
    let transformX = this.getTransformX();
    // enter
    let textGroup = this.headerSvgContainer.selectAll('g.vi-control-line-header-text').data(params);
    let group = textGroup.enter().append('g')
            .attr('class', 'vi-control-line-header-text');
    group.append('rect')
            .attr('height', headerBox.height / 2)
            .attr('y', headerBox.height / 2 - 5)
            .attr('stroke', 'black')
            .attr('fill', '#f4ce42');
    group.append('text')
            .attr('y', headerBox.height * 3 / 4)
            .attr('text-anchor', 'middle')
    // update
    textGroup.select('text')
            .attr('dx', d => transformX(d.value))
            .html(d => d.value.toFixed(2))
            .raise();
    let textBBox = textGroup.select('text').node() ? textGroup.select('text').node().getBBox() : {width: 40, height: 20};
    textGroup.select('rect')
            .attr('width', textBBox.width + 10)
            .attr('x', d => transformX(d.value) - textBBox.width / 2 - 5);
    
    textGroup.raise();
    // exit
    textGroup.exit()
        .remove();

}

function plotLine(curve, data, highlight) {
    if (typeof curve.line != 'object') return;
    let ctx = curve.ctx;
    let line = curve.line;
    ctx.save();

    ctx.strokeStyle = line.color || 'blue';
    ctx.lineWidth = line.width || '1';
    if (highlight) curve.addHighlightEffect();
    if (line.dash) ctx.setLineDash(line.dash);

    let samples = curve.calculateDataForBlockPosition(data);

    if (curve.displayAs == 'Cumulative' || curve.displayAs == 'Mirror')
        samples = curve.calculateDataForDisplayAs(samples);

    ctx.beginPath();
    ctx.moveTo(samples[0].x, samples[0].y);
    samples.forEach(function(d) {
        ctx.lineTo(d.x, d.y);
    });
    ctx.stroke();
    if (curve.displayAs == 'Mirror') {
        let color = d3.color(ctx.strokeStyle);
        color.opacity = 0.5;
        ctx.fillStyle = color.toString();
        ctx.fill();
    }

    ctx.restore();
}

function plotSymbol(curve, data, highlight) {
    if (typeof curve.symbol != 'object') return;
    let ctx = curve.ctx;
    let symbol = curve.symbol;

    let helper = new CanvasHelper(ctx, {
        strokeStyle: symbol.strokeStyle,
        fillStyle: symbol.fillStyle,
        lineWidth: symbol.lineWidth,
        lineDash: symbol.lineDash,
        size: symbol.size
    });
    if (highlight) curve.addHighlightEffect();

    let plotFunc = helper[symbol.style.toLowerCase()];
    if (typeof plotFunc != 'function') return;

    data.forEach(function(d) {
        plotFunc.call(helper, d.x, d.y);
    });
}

function plotPid(curve, data, highlight) {
    let ctx = curve.ctx;
    ctx.save();

    ctx.strokeStyle = (curve.line || {}).color || (curve.symbol || {}).lineColor;
    ctx.lineWidth = (curve.line || {}).width || (curve.symbol || {}).lineWidth;

    if (highlight) curve.addHighlightEffect();

    let transformX = curve.getTransformX();
    let baseX = (Utils.capitalize(curve.scale) == 'Linear') ? transformX(0) : transformX(0.01);

    ctx.beginPath();
    data.forEach(function(d) {
        ctx.moveTo(baseX, d.y);
        ctx.lineTo(d.x, d.y);
    })
    ctx.stroke();


    ctx.restore();
}
