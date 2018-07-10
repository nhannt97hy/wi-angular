module.exports = Histogram;

let Utils = require('./visualize-utils');
let Selection = require('./visualize-selection');

const _MINOR_TICKS = 5;
const _DECIMAL_LEN = 4;

/**
 * Visualize Histogram contructor
 * @param: {Object} config: configuration of visualize histogram object
 *
 */
function Histogram(props) {
    this.handlers = new Object();
    this.histogramModel = props;
    this.curves = props.curves;
    this.config = props.config;

    this.wells = props.wells;

    this.discriminatorArr = null;

    this.discriminatorData = [];
    this.rawData = [];

    this.showTooltip = false;
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

Histogram.prototype.setHistogramModel = function(histogramModel) {
    this.histogramModel = histogramModel;
}

Histogram.prototype.setProperties = function (props) {
    Utils.setIfNotUndefined(this, 'histogramModel', props);
    Utils.setIfNotUndefined(this, 'curves', props.curves);
    Utils.setIfNotUndefined(this, 'config', props.config);
    Utils.setIfNotUndefined(this, 'wells', props.wells);
}

Histogram.prototype.setConfig = function (props) {
    Utils.setIfNotNull(this.config, 'nBins', props.nBins);
    Utils.setIfNotNull(this.config, 'nDecimal', props.nDecimal);
    Utils.setIfNotNull(this.config, 'domain', props.domain);
    Utils.setIfNotNull(this.config, 'thresholds', props.thresholds);
    Utils.setIfNotNull(this.config, 'step', props.step);
    Utils.setIfNotNull(this.config, 'realStep', props.realStep);
}

Histogram.prototype.setZoneSet = function(zoneSet) {
    this.zoneSet = zoneSet;
}
Histogram.prototype.setCurve = function(data) {
    if (data == null) {
        delete this.idCurve;
        delete this.data;
        this.zoneData.length = 0;
        this.zoneBins.length = 0;
        delete this.intervalData;
        delete this.intervalBins;
        delete this.mean;
        delete this.standardDeviation;
        return;
    }
    this.data = data;
}
Histogram.prototype.setSelection = function(viSelection) {
    this.viSelection = viSelection;
}

Histogram.prototype.setMode = function(mode) {
    this.svgContainer.style('cursor', mode == null ? 'default' : 'copy');
    this.mode = mode;
}

Histogram.prototype.getDiscriminatorData = function (){
    let self = this;
    let discriminatorData = [];
    this.curves.forEach(curve => {
        let idx = self.curves.indexOf(curve);
        self.rawData.push(curve.data);
        if (self.discriminatorArr && self.discriminatorArr[idx] && self.discriminatorArr[idx].length) {
            let result = [];
            for (let i = 0; i < curve.data.length; i++) {
                if (self.discriminatorArr[idx][i]) {
                    result.push(curve.data[i]);
                }
            }
            result = result.filter(d => {
                return !isNaN(d.x);
            });
            result.id = curve.idCurve;
            discriminatorData.push(result);
        } else {
            curve.data = curve.data.filter(d => {
                return !isNaN(d.x);
            });
            curve.data.id = curve.idCurve;
            discriminatorData.push(curve.data);
        }
    });
    return discriminatorData;
}

Histogram.prototype.filterF = function(d, idCurve, zoneIdx) {
    let tempDepth = 0;
    if (!this.histogramModel) return false;
    if (this.config.scale.left == this.config.scale.right) return false;
    if (this.histogramModel.idZoneSet & !zoneIdx) {
        return true;
    }

    let well = this.wells[idCurve];
    let startDepth = well.topDepth;
    let endDepth = well.bottomDepth;
    let depthStep = well.step;

    tempDepth = startDepth + depthStep * parseInt(d.y);
    let left = Math.min(this.config.scale.left, this.config.scale.right);
    let right = Math.max(this.config.scale.left, this.config.scale.right);

    if (this.histogramModel && this.histogramModel.idZoneSet) {
        let zone = this.zoneSet[zoneIdx];
        return (!isNaN(d.y) && ( tempDepth >= zone.properties.startDepth ) &&
                ( tempDepth < zone.properties.endDepth ) && (parseFloat(d.x) >= left) && (parseFloat(d.x) <= right));
    }
    let xFloat = parseFloat(d.x);
    return (
        !isNaN(d.y) &&
        ( tempDepth >= this.histogramModel.intervalDepthTop ) &&
        ( tempDepth < this.histogramModel.intervalDepthBottom ) &&
        (xFloat >= left) &&
        (xFloat <= right)
    );
}

Histogram.prototype.filterSelection = function(d, selectionDataSegment) {
    let self = this;
    let tempDepth = 0;
    if (!self.histogramModel) return false;
    if (self.histogramModel.leftScale == self.histogramModel.rightScale) return false;

    tempDepth = self.startDepth + self.depthStep * parseInt(d.y);
    left = Math.min(self.histogramModel.leftScale, self.histogramModel.rightScale);
    right = Math.max(self.histogramModel.leftScale, self.histogramModel.rightScale);

    if (self.histogramModel) {
        return (!isNaN(d.y) && (tempDepth >= selectionDataSegment.startDepth) &&
            (tempDepth < selectionDataSegment.stopDepth) && (parseFloat(d.x) >= left) && (parseFloat(d.x) <= right));
    }
    let xFloat = parseFloat(d.x);
    return (
        !isNaN(d.y) &&
        (tempDepth >= self.histogramModel.intervalDepthTop) &&
        (tempDepth < self.histogramModel.intervalDepthBottom) &&
        (xFloat >= left) &&
        (xFloat <= right)
    );
}

Histogram.prototype.getZoneData = function(idx) {
    let self = this;
    return this.discriminatorData.filter(function(d) {
        return self.filterF.call(self, d, idx);
    }).map(function(d) { return parseFloat(d.x); });
}

Histogram.prototype.getIntervalData = function() {
    let self = this;
    let intervalData = [];
    this.discriminatorData.forEach(discriminatorDatum => {
        intervalData.push(discriminatorDatum.filter(d => {
            return self.filterF(d, discriminatorDatum.id);
        }).map(d => { return parseFloat(d.x); }));
    });
    return intervalData;
}

Histogram.prototype.getFullData = function() {
    let self = this;
    let fullData = [];
    this.discriminatorData.forEach(discriminatorDatum => {
        fullData.push(discriminatorDatum.map(d => {
            return parseFloat(d.x);
        }));
    });
    return fullData;
}
Histogram.prototype.getSelectionData = function(selectionData) {
    let self = this;
    return this.discriminatorData.filter(d => {
        return selectionData.includes(+d.y);
    }).map(function(d) { return parseFloat(d.x); });
}

Histogram.prototype.updateConfig = function () {
    let wdX = this.getWindowX();
    let vpX = this.getViewportX();
    let vpY = this.getViewportY();
    let transformX = this.getTransformX();
    let nBins = this.config.numOfDivisions;
    let domain = this.getDomainX();
    let thresholds = null;
    if (!this.config.loga) {
        thresholds = d3.range(domain[0], domain[1], (domain[1] - domain[0]) / nBins);
    } else {
        let targetThresholds = d3.range(vpX[0], vpX[1], (vpX[1] - vpX[0]) / nBins);
        thresholds = targetThresholds.map(d => {
            return transformX.invert(d);
        });
    }
    let step = (wdX[1] - wdX[0]) / nBins;
    let jumpFactorSeed = vpX[1] <= 200 ? 5 : 20;
    let realStep = step;
    let jumpFactor = Math.ceil(nBins / jumpFactorSeed);
    if (jumpFactor > 1) realStep = jumpFactor * step;
    let nDecimal = 2;
    let cfg = {
        nBins: nBins,
        nDecimal: nDecimal,
        domain: domain,
        thresholds: thresholds,
        step: step,
        realStep: realStep
    };
    this.setConfig(cfg);
}

Histogram.prototype.prepareAxesContainer = function () {
    let self = this;

    this.axesContainer = this.svgContainer.append('g')
        .attr('class', 'wi-histogram-axes-container')
        .attr('width', $(this.container.node()).width())
        .attr('height', $(this.container.node()).height());

    this.axesContainer
        .selectAll('g.vi-histogram-axis-group')
        .data([
            'vi-histogram-axis-ticks vi-histogram-axis-x-ticks',
            'vi-histogram-axis-grids vi-histogram-axis-x-grids',
            'vi-histogram-axis-ticks vi-histogram-axis-y-ticks',
            'vi-histogram-axis-ticks vi-histogram-axis-cumulative-y-ticks',
            'vi-histogram-axis-grids vi-histogram-axis-y-grids'
        ])
        .enter()
        .append('g')
        .attr('class', function (d) { return 'vi-histogram-axis-group ' + d; });
}

Histogram.prototype.prepareDrawContainer = function () {
    let self = this;

    this.svgContainer.append('defs')
        .append('clipPath')
            .attr('id', self.getClipPathId())
            .append('rect')
                .attr("x", 0)
                .attr("y", 0)
                .attr('width', self.rect.width)
                .attr('height', self.rect.height);

    this.drawContainer = this.svgContainer.append('g')
        .attr('class', 'wi-histogram-draw-container')
        .attr('clip-path', 'url(#' + self.getClipPathId() + ')')
            .append('g')
                .attr('width', self.rect.width)
                .attr('height', self.rect.height);
}

Histogram.prototype._doPlot = function () {
    if($(this.container.node()).width() < 0 || $(this.container.node()).height() < 0) return;
    this.adjustSize();
    this.clearPlot();
    this.updateConfig();
    this.updateClipPath();
    this.generateHistogram();
    this.plotAxesContainer();
    this.plotDrawContainer();
}

Histogram.prototype.updateHistogram = function (newProps) {
    this.setProperties(newProps);

    if (!newProps) {
        this.doPlot();
        return;
    }

    this.svgContainer.selectAll('*').remove();
    this.prepareAxesContainer();
    this.prepareDrawContainer();
    if (!this.curves.length) return;
    this.doPlot();
}

Histogram.prototype.adjustSize = function () {
    let self = this;
    this.containerSize = {
        width: $(this.container.node()).width(),
        height: $(this.container.node()).height()
    };

    this.rect = this.containerSize;

    this.svgContainer
        .attr('width', this.containerSize.width)
        .attr('height', this.containerSize.height);

    this.selectionSvgContainer.forEach(function (svg) {
        svg.svg
            .attr('width', self.containerSize.width)
            .attr('height', self.containerSize.height);
    });

    this.axesContainer
        .attr('width', this.containerSize.width)
        .attr('height', this.containerSize.height);

    this.drawContainer
        .attr('width', this.containerSize.width)
        .attr('height', this.containerSize.height);
}

Histogram.prototype.clearPlot = function () {
    this.drawContainer.selectAll('*').remove();
    this.selectionSvgContainer.forEach(function(svg) {
        svg.svg.selectAll('.selection-bars').remove();
    });
}

Histogram.prototype.updateClipPath = function() {
    let self = this;
    let vpX = this.getViewportX();
    let vpY = this.getViewportY();

    this.svgContainer.select('clipPath')
        .attr('id', self.getClipPathId())
        .select('rect')
        .attr('x', d3.min(vpX))
        .attr('y', d3.min(vpY))
        .attr('width', Math.abs(vpX[0] - vpX[1]))
        .attr('height', Math.abs(vpY[0] - vpY[1]));
}

Histogram.prototype.getClipPathId = function () {
    return 'histogramClipPath' + this.histogramModel.idHistogram;
}

Histogram.prototype.generateHistogram = function () {
    let self = this;
    let histogramGenerator = d3.histogram()
        .domain(self.config.domain)
        .thresholds(self.config.thresholds);
    this.discriminatorData = this.getDiscriminatorData();
    this.fullData = this.getFullData();
    this.fullBins = [];
    this.fullData.forEach(data => {
        self.fullBins.push(histogramGenerator(data));
    });
    if (this.config.step < 0) {
        this.fullBins.forEach(bin => {
            self.reverseBins(bin);
        });
    }
    this.intervalData = this.getIntervalData();
    this.intervalBins = [];
    this.intervalData.forEach(data => {
        self.intervalBins.push(histogramGenerator(data));
    });
    if (this.config.step < 0) {
        this.intervalBins.forEach(bin => {
            self.reverseBins(bin);
        });
    }
    this.mean = this.getAverage();
    this.standardDeviation = this.getStandardDeviation();
    this.bigData = this.getBigData();
    this.signal('data-processing-done');
}

Histogram.prototype.plotAxesContainer = function () {
    let self = this;
    let wdX = this.getWindowX();
    let wdY = this.getWindowY();
    let vpX = this.getViewportX();
    let vpY = this.getViewportY();
    let transformX = this.getTransformX();
    let transformY = this.getTransformY();
    let transformCumulativeY = this.getTransformCumulativeY();

    let xTickValues;
    if (!this.config.loga) {
        xTickValues = d3.range(wdX[0], wdX[1], self.config.realStep);
    } else {
        xTickValues = Utils.genLogTickValues(wdX[0], wdX[1]);
    }
    this.axisX = d3.axisBottom(transformX)
        .tickValues(xTickValues)
        .tickFormat(Utils.getDecimalFormatter(self.config.nDecimal))
        .tickPadding(10);
    let yTicks = (Math.floor(vpY[1] / 40) - 1) * _MINOR_TICKS + 1;
    this.axisYLeft = d3.axisLeft(transformY)
        .ticks(yTicks, ',.0f')
        .tickFormat((d, i) => {
            return (i % _MINOR_TICKS) ? '' : d;
        })
        .tickPadding(10);
    this.axisYRight = d3.axisRight(transformY)
        .ticks(yTicks, ',.0f')
        .tickFormat((d, i) => {
            return (i % _MINOR_TICKS) ? '' : transformCumulativeY.invert(transformY(d)).toFixed(0);
        })
        .tickPadding(10);

    this.axisX = this.axisX.tickSize(-this.rect.height);
    this.axisYLeft = this.axisYLeft.tickSize(-this.rect.width);
    this.axisYRight = this.axisYRight.tickSize(0);

    this.axisXGroup = this.axesContainer.select('g.vi-histogram-axis-x-ticks')
        .attr('transform', 'translate(' + 0 + ', ' + vpY[1] + ')')
        .call(self.axisX);
    if (!this.config.loga) {
        this.axisXGroup.selectAll('.tick').classed('majorX', true);
    } else {
        this.axisXGroup.selectAll('.tick').classed('majorX', (d, i) => {
            return Utils.logMajorTest(xTickValues[i]);
        });
    }
    this.axisYLeftGroup = this.axesContainer.select('g.vi-histogram-axis-y-ticks')
        .attr('transform', 'translate(' + vpX[0] + ', ' + 0 + ')')
        .call(self.axisYLeft);
    this.axisYRightGroup = this.axesContainer.select('g.vi-histogram-axis-cumulative-y-ticks')
        .attr('transform', 'translate(' + (vpX[0] + self.rect.width) + ', ' + 0 + ')')
        .call(self.axisYRight);

    this.axesContainer.selectAll('g.vi-histogram-axis-y-ticks .tick.major')
        .classed('major', false)
        .select('.second-label')
        .remove();
    this.axesContainer.selectAll('g.vi-histogram-axis-y-ticks .tick')
        .filter((d, i) => {
            return (i % _MINOR_TICKS) == 0;
        })
        .classed('major', true);
    this.axesContainer.select('g.vi-histogram-axis-cumulative-y-ticks path')
        .style('opacity', 0);

    if (this.config.showGrid) {
        this.container
            .classed('show-grid', true)
            .classed('hide-grid', false);
    } else {
        this.container
            .classed('hide-grid', true)
            .classed('show-grid', false);
    }
}

Histogram.prototype.plotDrawContainer = function () {
    let self = this;
    this.curves.forEach(curve => {
        let idx = self.curves.indexOf(curve);
        let curveDrawContainer = self.drawContainer.append('g')
            .attr('class', 'curve-' + curve.idCurve + '-draw-container');
        if (curve.options.plot === 'Bar')
            self.drawBarHistogram(curveDrawContainer, idx);
        else if (curve.options.plot === 'Curve')
            self.drawCurveHistogram(curveDrawContainer, idx);
        if (curve.options.showGaussian)
            self.drawGaussianCurve(curveDrawContainer, idx);
        if (curve.options.showCumulative)
            self.drawCumulativeCurve(curveDrawContainer, idx);
    });
}

Histogram.prototype.drawBarHistogram = function (curveDrawContainer, idx) {
    let self = this;
    let wdY = this.getWindowY();
    let transformX = this.getTransformX();
    let transformY = this.getTransformY();
    let fullData = this.fullData[idx];
    let fullBins = this.fullBins[idx];
    let intervalData = this.intervalData[idx];
    let intervalBins = this.intervalBins[idx];
    let bars = curveDrawContainer.selectAll('.bars')
        .data(fullBins).enter()
        .append('g')
        .attr('class', 'bars')
        .attr('transform', (d) => {
            if (self.config.plotType != 'Frequency') {
                return 'translate(' + transformX(d.x0) + ', ' + transformY(d.length * 100 / fullData.length) + ')';
            }
            return 'translate(' + transformX(d.x0) + ', ' + transformY(d.length) + ')';
        });

    if (intervalBins) {
        bars.append('rect')
            .attr('x', 3)
            .attr('width', (d, i) => {
                let width = Math.abs(transformX(fullBins[i].x1) - transformX(fullBins[i].x0));
                return width - 3;
            })
            .attr('y', (d, i) => {
                if (self.config.plotType != 'Frequency') {
                    return (transformY(intervalBins[i].length * 100 / intervalData.length) - transformY(fullBins[i].length * 100 / fullData.length));
                }
                return (transformY(intervalBins[i].length) - transformY(fullBins[i].length));
            })
            .attr('height', (d, i) => {
                if (self.config.plotType != 'Frequency') {
                    return transformY(wdY[0])
                        - transformY(intervalBins[i].length * 100 / intervalData.length);
                }
                return transformY(wdY[0]) - transformY(intervalBins[i].length);
            })
            .attr('fill', () => {
                return self.curves[idx].options.lineColor;
            })
            .on('mousemove', (d, i) => {
                if (self.showTooltip)
                    showTooltip(intervalBins[i], idx);
            })
            .on('mouseout', hideTooltip);
    } else {
        // For zonalDepth case
        for (let j in self.zoneBins) {
            bars.append('rect')
                //.attr('x', gap/2)
                //.attr('width', colWidth - gap)
                .attr('x', 3)
                .attr('width', function (d, i) {
                    let width = Math.abs(transformX(self.fullBins[i].x1) - transformX(self.fullBins[i].x0));
                    return width - 3;
                })
                .attr('y', function (d, i) {
                    let fullBinHeight, cumHeight;
                    if (self.histogramModel.plotType != 'Frequency') {
                        let len = self.getLength();
                        fullBinHeight = (transformY(wdY[0]) - transformY(self.fullBins[i].length * 100 / self.fullData.length));
                        cumHeight = fullBinHeight;
                        for (let k = 0; k <= j; k++) {
                            cumHeight = cumHeight - (transformY(wdY[0]) - transformY(self.zoneBins[k][i].length * 100 / len));
                        }
                        return cumHeight;
                        //return (transformY(self.zoneBins[j][i].length * 100 / self.zoneBins[j].length)
                        //        - transformY(self.fullBins[i].length * 100 / self.fullData.length));
                    }
                    fullBinHeight = (transformY(wdY[0]) - transformY(self.fullBins[i].length));
                    cumHeight = fullBinHeight;
                    for (let k = 0; k <= j; k++) {
                        cumHeight = cumHeight - (transformY(wdY[0]) - transformY(self.zoneBins[k][i].length));
                    }
                    return cumHeight;
                })
                .attr('height', function (d, i) {
                    if (self.histogramModel.plotType != 'Frequency') {
                        let len = self.getLength();
                        return transformY(wdY[0])
                            - transformY(self.zoneBins[j][i].length * 100 / len);
                    }
                    return transformY(wdY[0]) - transformY(self.zoneBins[j][i].length);
                })
                .attr('fill', self.histogramModel.colorBy == 'curve' ? self.histogramModel.color : (self.zoneSet[j].properties.background || 'steelblue'))
                .attr('stroke', self.histogramModel.colorBy == 'curve' ? 'black' : 'transparent')
                .on('mousemove', function (d, i) {
                    if (self.histogramModel.showTooltip)
                        showTooltip(self.zoneBins[j][i]);
                })
                .on('mouseout', hideTooltip);
        }
    }

    // Tooltip
    function showTooltip(data, idx) {
        let content = null;
        if (self.config.plotType != 'Frequency') {
            content = '<span>' + (data.length * 100 / self.getLength(idx)).toFixed(2) + '%</span>';
        }
        else {
            content = '<div>' + data.length + '</div>';
        }
        let pos = d3.mouse(self.container.node());
        self.tooltipContainer
            .style('opacity', 0.9)
            .html(content)
            .style("left", pos[0] + "px")
            .style("top", (pos[1] - 30) + "px");
    }

    function hideTooltip() {
        self.tooltipContainer
            .style('opacity', 0)
            .style("left", 0)
            .style("top", 0);
    }
}

Histogram.prototype.drawCurveHistogram = function (curveDrawContainer, idx) {
    let self = this;
    let wdY = this.getWindowY();
    let transformX = this.getTransformX();
    let transformY = this.getTransformY();
    let fullData = this.fullData[idx];
    let fullBins = this.fullBins[idx];
    let intervalData = this.intervalData[idx];
    let intervalBins = this.intervalBins[idx];

    let line = d3.line().curve(d3.curveBasis);
    let path = curveDrawContainer.append('path')
        .attr('class', 'curves');

    if (intervalBins) {
        line
            .x((d, i) => {
                let width = Math.abs(transformX(fullBins[i].x1) - transformX(fullBins[i].x0));
                return transformX(d.x0) + width / 2;
            })
            .y((d, i) => {
                if (self.config.plotType != 'Frequency') {
                    return transformY(d.length * 100 / fullData.length) + (transformY(intervalBins[i].length * 100 / intervalData.length) - transformY(d.length * 100 / fullData.length));
                }
                return transformY(d.length) + (transformY(intervalBins[i].length) - transformY(d.length));
            });

        path.attr('stroke', () => {
            return self.curves[idx].options.lineColor;
        });

    } else {
        line
            .x(function (d, i) {
                let width = Math.abs(transformX(self.fullBins[i].x1) - transformX(self.fullBins[i].x0));
                return transformX(d.x0) + width / 2;
            })
            .y(function (d, i) {
                let binsHeight = 0;
                for (let j = 0; j < self.zoneBins.length; ++j) {
                    if (!binsHeight) {
                        binsHeight = self.zoneBins[j][i].length;
                    } else {
                        binsHeight += self.zoneBins[j][i].length;
                    }
                }
                if (self.histogramModel.plotType != 'Frequency') {
                    let len = self.getLength();
                    return transformY(binsHeight * 100 / len);
                }
                return transformY(binsHeight);
            });
        path.attr('stroke', self.zoneSet[self.zoneSet.length - 1].properties.background ? self.zoneSet[self.zoneSet.length - 1].properties.background : 'blue');
    }

    path.datum(fullBins)
        .attr('d', line);
}

Histogram.prototype.drawGaussianCurve = function (curveDrawContainer, idx) {
    let self = this;
    let wdX = this.getWindowX();
    let wdY = this.getWindowY();
    let vpX = this.getViewportX();
    let vpY = this.getViewportY();
    let transformX = this.getTransformX();
    let transformY = this.getTransformY();
    let fullData = this.fullData[idx];
    let fullBins = this.fullBins[idx];
    let intervalData = this.intervalData[idx];
    let intervalBins = this.intervalBins[idx];

    let mean = this.mean[idx];
    let standardDeviation = this.standardDeviation[idx];

    let gaussianPoints = getData(4000);
    let gaussianTransformY = d3.scaleLinear()
        .domain(d3.extent(gaussianPoints, function (d) { return d.y; }))
        .range([vpY[1], vpY[0]]);

    let line = d3.line()
        .x((d) => {
            return transformX(d.x);
        })
        .y(function (d) {
            return gaussianTransformY(d.y);
        })
        .curve(d3.curveCatmullRom.alpha(0.2));

    curveDrawContainer.append('path')
        .datum(gaussianPoints)
        .attr('class', 'gaussian-line')
        .attr('d', line);

    let meanPos = transformX(mean);
    let leftSigmaPos = transformX(mean - standardDeviation);
    let rightSigmaPos = transformX(mean + standardDeviation);

    curveDrawContainer.append('line')
        .attr('class', 'mean-line')
        .attr('x1', meanPos)
        .attr('y1', 0)
        .attr('x2', meanPos)
        .attr('y2', vpY[1]);

    curveDrawContainer.append("text")
        .attr("y", 10)
        .attr("x", meanPos)
        .attr('text-anchor', 'start')
        .attr("class", "mean-label")
        .text("Avg");

    curveDrawContainer.append('line')
        .attr('class', 'sigma-line')
        .attr('x1', rightSigmaPos)
        .attr('y1', 0)
        .attr('x2', rightSigmaPos)
        .attr('y2', vpY[1]);

    curveDrawContainer.append("text")
        .attr("y", 10)
        .attr("x", rightSigmaPos)
        .attr('text-anchor', 'start')
        .attr("class", "sigma-label")
        .text("Std Dev");

    curveDrawContainer.append('line')
        .attr('class', 'sigma-line')
        .attr('x1', leftSigmaPos)
        .attr('y1', 0)
        .attr('x2', leftSigmaPos)
        .attr('y2', vpY[1]);

    curveDrawContainer.append("text")
        .attr("y", 10)
        .attr("x", leftSigmaPos)
        .attr('text-anchor', 'start')
        .attr("class", "sigma-label")
        .text("Std Dev");

    function normal() {
        let x = 0, y = 0, rds, c;
        let xSample;
        let left = Math.min(wdX[0], wdX[1]);
        let right = Math.max(wdX[0], wdX[1]);
        do {
            do {
                x = (Math.random() * 2 - 1);
                y = (Math.random() * 2 - 1);
                rds = x * x + y * y;
            } while (rds == 0 || rds > 1);
            c = Math.sqrt(-2 * Math.log(rds) / rds); // Box-Muller transform
            xSample = mean + standardDeviation * x * c;
        } while (xSample < left || xSample > right);

        return xSample;
    }

    //taken from Jason Davies science library
    // https://github.com/jasondavies/science.js/
    function gaussian(x) {
        let gaussianConstant = 1 / Math.sqrt(2 * Math.PI),
            m = mean,
            sigma = standardDeviation;

        x = (x - m) / sigma;
        return gaussianConstant * Math.exp(-.5 * x * x) / sigma;
    }

    function getData(numSamples) {
        let data = new Array();
        // loop to populate data array with
        // probabily - quantile pairs
        for (let i = 0; i < numSamples; i++) {
            x = normal(); // calc random draw from normal dist
            y = gaussian(x) // calc prob of rand draw
            point = {
                x: x,
                y: y
            }
            data.push(point);
        };
        // need to sort for plotting
        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
        data.sort(function (x, y) {
            return x.x - y.x;
        });
        return data;
    }
}

Histogram.prototype.drawCumulativeCurve = function (curveDrawContainer, idx) {
    let self = this;
    let wdX = this.getWindowX();
    let wdY = this.getWindowY();
    let vpX = this.getViewportX();
    let vpY = this.getViewportY();
    let transformX = this.getTransformX();
    let transformY = this.getTransformY();
    let fullData = this.fullData[idx];
    let fullBins = this.fullBins[idx];
    let intervalData = this.intervalData[idx];
    let intervalBins = this.intervalBins[idx];

    let cumulativePoints = getCumulativeData();
    let cumulativeTransformY = d3.scaleLinear()
        .domain(d3.extent(cumulativePoints, function (d) { return d.y; }))
        .range([vpY[1], vpY[0]]);

    let line = d3.line()
        .x((d) => {
            return transformX(d.x);
        })
        .y((d) => {
            return cumulativeTransformY(d.y);
        })
        .curve(d3.curveBasis);

    curveDrawContainer.append('path')
        .datum(cumulativePoints)
        .attr('class', 'cumulative-line')
        .attr('d', line);

    function getCumulativeData() {
        let cumulativeVal = 0;
        let points = new Array();
        if (intervalBins) {
            if (self.config.plotType != 'Frequency') {
                for (let i in intervalBins) {
                    cumulativeVal += intervalBins[i].length * 100 / fullData.length;
                    points.push({
                        x: (intervalBins[i].x0 + intervalBins[i].x1) / 2,
                        y: cumulativeVal
                    });
                }
            }
            else {
                for (let i in intervalBins) {
                    cumulativeVal += intervalBins[i].length;
                    points.push({
                        x: (intervalBins[i].x0 + intervalBins[i].x1) / 2,
                        y: cumulativeVal
                    });
                }
            }
        }
        else {
            if (self.histogramModel.plotType != 'Frequency') {
                let fullData = 0;

                for (let i in self.zoneBins)
                    fullData += d3.sum(self.zoneBins[i], function (d) { return d.length; });

                for (let i in self.fullBins) {
                    let tempVal = 0;
                    for (let j in self.zoneBins) {
                        tempVal += self.zoneBins[j][i].length;
                    }
                    tempVal = tempVal * 100 / fullData;
                    cumulativeVal += tempVal;
                    points.push({
                        x: (self.fullBins[i].x0 + self.fullBins[i].x1) / 2,
                        y: cumulativeVal
                    });
                }
            }
            else {
                for (let i in self.fullBins) {
                    let tempVal = 0;
                    for (let j in self.zoneBins) {
                        tempVal += self.zoneBins[j][i].length;
                    }
                    cumulativeVal += tempVal;
                    points.push({
                        x: (self.fullBins[i].x0 + self.fullBins[i].x1) / 2,
                        y: cumulativeVal
                    });
                }
            }
        }
        return points;
    }
}

Histogram.prototype.reverseBins = function (bins) {
    let len = bins.length;
    let halfLen = Math.floor(len / 2);
    let temp = null;

    for (let i = 0; i < halfLen; i++) {
        temp = bins[i];
        bins[i] = bins[len - i - 1];
        bins[len - i - 1] = temp;

        temp = bins[i].x0;
        bins[i].x0 = bins[i].x1;
        bins[i].x1 = temp;

        temp = bins[len - i - 1].x0;
        bins[len - i - 1].x0 = bins[len - i - 1].x1;
        bins[len - i - 1].x1 = temp;
    }

    if (len % 2) {
        temp = bins[halfLen].x0;
        bins[halfLen].x0 = bins[halfLen].x1;
        bins[halfLen].x1 = temp;
    }
}

Histogram.prototype.doPlot = function() {
    if (this.timerHandle) {
        clearTimeout(this.timerHandle);
    }
    this.timerHandle = setTimeout(() => {
        this.timerHandle = null;
        this._doPlot();
    }, 500);
}

Histogram.prototype.init = function(domElem) {
    let self = this;
    console.log("init histogram into domElem:", domElem);
    this.container = d3.select(domElem).classed('vi-histogram-container', true);

    this.selectionSvgContainer = [];
    this.svgContainer = this.container.append('svg')
        .attr('class', 'vi-histogram-svg')
        .attr('width', $(this.container.node()).width())
        .attr('height', $(this.container.node()).height());

    this.rect = this.containerSize = {
        width: $(this.container.node()).width(),
        height: $(this.container.node()).height()
    };

    this.tooltipContainer = this.container.append('div').attr('class', 'vi-histogram-tooltip').style('opacity', 0);

    this.prepareAxesContainer();
    this.prepareDrawContainer();
    this.doPlot();

    let zoom = d3.zoom()
        .scaleExtent([1, 10])
        .translateExtent([[-500, 0], [this.rect.width + 500, this.rect.height]])
        .extent([[0, 0], [this.rect.width, this.rect.height]])
        .on('zoom', zooming);
    zoom.filter(function () {
        d3.event.preventDefault();
        d3.event.stopPropagation();
        return d3.event.ctrlKey;
    });
    function zooming() {
        let transform = d3.event.transform;
        self.drawContainer.attr('transform', transform);
        if (!self.axisXGroup && !self.axisYLeftGroup && !self.axisYRightGroup) return;
        self.axisXGroup.call(self.axisX.scale(transform.rescaleX(self.getTransformX())));
        self.axisYLeftGroup.call(self.axisYLeft.scale(transform.rescaleY(self.getTransformY())));
        self.axisYRightGroup.call(self.axisYRight.scale(transform.rescaleY(self.getTransformY())));
    }
    this.svgContainer.call(zoom.transform, d3.zoomIdentity);
    this.svgContainer.call(zoom);
    this.svgContainer.on('dblclick.zoom', null);
}

Histogram.prototype.getViewportY = function() {
    return [0, this.containerSize.height];
}
Histogram.prototype.getViewportX = function() {
    return [0, this.containerSize.width];
}
Histogram.prototype.getWindowY = function() {
    if (!this.histogramModel.idZoneSet) {
        // intervalDepth case
        let self = this;
        let max = -1;
        let total = d3.max(this.intervalData, (d) => { return d.length; });
        this.intervalBins.forEach(bin => {
            let tmpMax;
            if (self.config.plotType != 'Frequency') {
                tmpMax = d3.max(bin, function (d) { return d.length * 100 / total; });
            } else {
                tmpMax = d3.max(bin, function (d) { return d.length; });
            }
            if (tmpMax > max) max = tmpMax;
        });
        return [0, max];
    }else{
        // zoneDepth case
        let totalLenArr = this.zoneBins.reduce(function (r, a) {
            a.forEach(function (b, i) {
                r[i] = (r[i] || 0) + b.length;
            });
            return r;
        }, []);

        if (this.histogramModel.plotType != 'Frequency') {
            let total = this.getLength();
            return [0, d3.max(totalLenArr, function(d) { return d*100/total;})];
        }
        return [0, d3.max(totalLenArr)];
    }
}
Histogram.prototype.getWindowX = function() {
    let left = this.config.scale.left;
    let right = this.config.scale.right;

    if (this.config.flipHorizontal) {
        left = this.config.scale.right;
        right = this.config.scale.left;
    }

    return [left, right];
}

Histogram.prototype.getDomainX = function() {
    return d3.extent(this.getWindowX());
}

Histogram.prototype.getTransformX = function() {
    let scaleFunc = this.config.loga ? d3.scaleLog() : d3.scaleLinear();
    return scaleFunc
        .domain(this.getWindowX())
        .range(this.getViewportX());
}

Histogram.prototype.getTransformY = function () {
    return d3.scaleLinear()
        .domain(this.getWindowY().reverse())
        .range(this.getViewportY());
}

Histogram.prototype.getTransformCumulativeY = function() {
    let wdY = this.getWindowY();
    return d3.scaleLinear()
        .domain([100, 0])
        .range(this.getViewportY());
}

Histogram.prototype.getLength = function (idx) {
    if (!this.histogramModel.idZoneSet) {
        // intervalDepth case
        return this.intervalData[idx] ? this.intervalData[idx].length : null;
    }
    // zonalDepth case
    if (!this.zoneData || !this.zoneData.length) return null;

    let allLength = this.zoneData.reduce(function(sumLength, aZoneData) {
        return sumLength + aZoneData.length;
    }, 0);

    return allLength;
}

Histogram.prototype.joinZoneData = function() {
    if (!this.joinedZoneData) {
        this.joinedZoneData = [].concat.apply([], this.zoneData);
    }
    return this.joinedZoneData;
}
Histogram.prototype.unsetJoinedZoneData = function() {
    delete this.joinedZoneData;
}

Histogram.prototype.getAverage = function () {
    if (!this.histogramModel.idZoneSet) {
        // intervalDepth case
        let self = this;
        let mean = [];
        if (this.intervalData && this.intervalData.length) {
            this.intervalData.forEach(data => {
                mean.push(d3.mean(data));
            });
        }
        return mean;
    }
    // zonalDepth case
    if (!this.zoneData || !this.zoneData.length) return null;
    return d3.mean(this.joinZoneData());
}

Histogram.prototype.getStandardDeviation = function () {
    if (!this.histogramModel.idZoneSet) {
        // intervalDepth case
        let self = this;
        let standardDeviation = [];
        if (this.intervalData && this.intervalData.length) {
            this.intervalData.forEach(data => {
                standardDeviation.push(d3.deviation(data));
            });
        }
        return standardDeviation;
    }
    // zonalDepth case
    if (!this.zoneData || !this.zoneData.length) return null;
    let newArray = this.joinZoneData();
    return d3.deviation(newArray);
}

// For Statistics

Histogram.prototype.getBigData = function () {
    if (!this.intervalData.length) return;
    let data = new Array();
    this.intervalData.forEach(d => {
        data = data.concat(d);
    });
    return data;
}

Histogram.prototype.getLengthStats = function () {
    if (!this.bigData) return;
    return this.bigData.length;
}

Histogram.prototype.getMinStats = function () {
    if (!this.histogramModel.idZoneSet) {
        // intervalDepth case
        if (!this.bigData) return null;
        return d3.min(this.bigData);
    }
    // zonalDepth case
    if (!this.zoneData || !this.zoneData.length) return null;

    let minOfAll = this.zoneData.reduce(function (minVal, aZoneData) {
        let aMin = d3.min(aZoneData);
        return (minVal > aMin) ? aMin : minVal;
    }, 9999999);

    return minOfAll;
}

Histogram.prototype.getMaxStats = function () {
    if (!this.histogramModel.idZoneSet) {
        // intervalDepth case
        if (!this.bigData) return null;
        return d3.max(this.bigData);
    }
    // zonalDepth case
    if (!this.zoneData || !this.zoneData.length) return null;

    let maxOfAll = this.zoneData.reduce(function (maxVal, aZoneData) {
        let aMax = d3.max(aZoneData);
        return (maxVal < aMax) ? aMax : maxVal;
    }, -9999999);

    return maxOfAll;
}

Histogram.prototype.getAverageStats = function () {
    if (!this.bigData) return;
    return d3.mean(this.bigData).toFixed(_DECIMAL_LEN);
}

Histogram.prototype.getAverageDeviationStats = function () {
    if (!this.histogramModel.idZoneSet) {
        // intervalDepth case
        if (!this.bigData) return null;
        return calAverageDeviation(this.bigData);
    }
    // zonalDepth case
    if (!this.zoneData || !this.zoneData.length) return null;
    let newArray = this.joinZoneData();
    return calAverageDeviation(newArray);

    function calAverageDeviation(data) {
        let mean = d3.mean(data);

        return d3.mean(data, function (d) {
            return Math.abs(d - mean)
        }).toFixed(_DECIMAL_LEN);
    }
}

Histogram.prototype.getStandardDeviationStats = function () {
    if (!this.histogramModel.idZoneSet) {
        // intervalDepth case
        if (!this.bigData) return;
        return d3.deviation(this.bigData).toFixed(_DECIMAL_LEN);
    }
    // zonalDepth case
    if (!this.zoneData || !this.zoneData.length) return null;
    let newArray = this.joinZoneData();
    return d3.deviation(newArray);
}

Histogram.prototype.getVarianceStats = function () {
    if (!this.histogramModel.idZoneSet) {
        // intervalDepth case
        if (!this.bigData) return null;
        return d3.variance(this.bigData).toFixed(_DECIMAL_LEN);
    }
    // zonalDepth case
    if (!this.zoneData || !this.zoneData.length) return null;
    let newArray = this.joinZoneData();
    return d3.variance(newArray).toFixed(_DECIMAL_LEN);
}

Histogram.prototype.getSkewnessStats = function () {
    if (!this.histogramModel.idZoneSet) {
        // intervalDepth case
        if (!this.bigData) return null;
        return ss.sampleSkewness(this.bigData).toFixed(_DECIMAL_LEN);
    }
    // zonalDepth case
    if (!this.zoneData || !this.zoneData.length) return null;
    return ss.sampleSkewness(this.joinZoneData()).toFixed(_DECIMAL_LEN);

}

Histogram.prototype.getKurtosisStats = function () {
    if (!this.histogramModel.idZoneSet) {
        // intervalDepth case
        if (!this.bigData) return null;
        return ss.sampleKurtosis(this.bigData).toFixed(_DECIMAL_LEN);
    }
    // zonalDepth case
    if (!this.zoneData || !this.zoneData.length) return null;
    return ss.sampleKurtosis(this.joinZoneData()).toFixed(_DECIMAL_LEN);
}

Histogram.prototype.getMedianStats = function () {
    if (!this.histogramModel.idZoneSet) {
        // intervalDepth case
        if (!this.bigData) return null;
        return d3.median(this.bigData).toFixed(_DECIMAL_LEN);
    }
    // zonalDepth case
    if (!this.zoneData || !this.zoneData.length) return null;
    return d3.median(this.joinZoneData()).toFixed(_DECIMAL_LEN);
}

Histogram.prototype.getPercentileStats = function (p) {
    if (!this.histogramModel.idZoneSet) {
        // intervalDepth case
        if (!this.bigData) return null;
        return calPercentile(this.bigData, p);
    }
    // zonalDepth case
    if (!this.zoneData || !this.zoneData.length) return null;
    return calPercentile(this.joinZoneData(), p);

    function calPercentile(data, p) {
        return d3.quantile(data.sort(function (a, b) {
            return a - b;
        }), p).toFixed(_DECIMAL_LEN);
    }
}

Histogram.prototype.addViSelectionToHistogram = function(selectionConfig) {
    let viSelection = new Selection(selectionConfig);
    viSelection.initSvg(this.container, 'histogram');
    this.selectionSvgContainer.push(viSelection);
    return viSelection;
}

Histogram.prototype.getSelection = function(id) {
    return this.selectionSvgContainer.find(d => d.isSelection() && d.idSelectionTool == id);
}

Histogram.prototype.removeViSelection = function (viSelection) {
    if (!viSelection) return;
    viSelection.svg.remove();
    viSelection.destroy();

    let idx = this.selectionSvgContainer.indexOf(viSelection);
    this.selectionSvgContainer.splice(idx, 1);
}