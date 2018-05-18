module.exports = ViWiHis;

let Utils = require('./visualize-utils');

const _MARGIN = {
    left: 50,
    right: 0,
    bottom: 15,
    top: 15
};
const _MINOR_TICKS = 5;

function ViWiHis(props) {
    this.curves = props.curves;
    this.config = props.config;

    this.discriminatorArr = null;

    this.discriminatorData = [];
    this.rawData = [];

    this.showTooltip = false;
}

ViWiHis.prototype.init = function (domElem) {
    let self = this;
    console.log('init', domElem);

    this.root = d3.select(domElem);

    this.plotContainer = this.root.select('.wi-his-plot-container');

    this.rect = this.plotContainer.node().getBoundingClientRect();

    this.svgContainer = this.plotContainer.append('svg')
        .attr('class', 'wi-his-svg-container')
        .attr('width', self.rect.width)
        .attr('height', self.rect.height);

    this.tooltipContainer = this.plotContainer.append('div')
        .attr('class', 'vi-histogram-tooltip')
        .style('opacity', 0);

    this.calcPlotContainerSize();
    this.prepareAxesContainer();
    this.prepareDrawContainer();
    this.doPlot();

    let zoom = d3.zoom()
        .scaleExtent([1, 10])
        .translateExtent([[-500, 0], [this.plotContainerSize.width + 500, this.plotContainerSize.height]])
        .extent([[0, 0], [this.plotContainerSize.width, this.plotContainerSize.height]])
        .on('zoom', zooming);
    zoom.filter(function () {
        d3.event.preventDefault();
        d3.event.stopPropagation();
        return d3.event.ctrlKey;
    });
    function zooming() {
        let transform = d3.event.transform;
        self.drawContainer.attr('transform', transform);
        self.axisXGroup.call(self.axisX.scale(transform.rescaleX(self.getTransformX())));
        self.axisYLeftGroup.call(self.axisYLeft.scale(transform.rescaleY(self.getTransformY())));
        self.axisYRightGroup.call(self.axisYRight.scale(transform.rescaleY(self.getTransformY())));
    }
    this.svgContainer.call(zoom.transform, d3.zoomIdentity);
    this.svgContainer.call(zoom);
    this.svgContainer.on('dblclick.zoom', null);
}

ViWiHis.prototype.setProperties = function (props) {
    Utils.setIfNotUndefined(this, 'curves', props.curves);
    Utils.setIfNotUndefined(this, 'config', props.config);
}

ViWiHis.prototype.setConfig = function (props) {
    Utils.setIfNotNull(this.config, 'nBins', props.nBins);
    Utils.setIfNotNull(this.config, 'nDecimal', props.nDecimal);
    Utils.setIfNotNull(this.config, 'domain', props.domain);
    Utils.setIfNotNull(this.config, 'thresholds', props.thresholds);
    Utils.setIfNotNull(this.config, 'step', props.step);
    Utils.setIfNotNull(this.config, 'realStep', props.realStep);
}

// Prepare data
ViWiHis.prototype.getDiscriminatorData = function () {
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
            discriminatorData.push(result.filter(d => {
                return !isNaN(d.x);
            }));
        } else {
            console.log('no discriminator');
            discriminatorData.push(curve.data.filter(d => {
                return !isNaN(d.x);
            }));
        }
    });
    return discriminatorData;
}

ViWiHis.prototype.getIntervalData = function () {
    let self = this;
    let intervalData = [];
    this.discriminatorData.forEach(discriminatorDatum => {
        intervalData.push(discriminatorDatum.filter(d => {
            return self.filterF.call(self, d);
        }).map(d => { return parseFloat(d.x); }));
    });
    return intervalData;
}

ViWiHis.prototype.getFullData = function () {
    let self = this;
    let fullData = [];
    this.discriminatorData.forEach(discriminatorDatum => {
        fullData.push(discriminatorDatum.map(d => {
            return parseFloat(d.x);
        }));
    });
    return fullData;
}

ViWiHis.prototype.updateConfig = function () {
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
    let nDecimal = Math.ceil(-1 * Math.log10(Math.abs(realStep)));
    nDecimal = nDecimal >= 0 ? nDecimal : 0;
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

// Filter func
ViWiHis.prototype.filterF = function (d, zoneIdx) {
    let tempDepth = 0;
    if (this.config.scale.left == this.config.scale.right) return false;
    // test
    const startDepth = 1119.8352;
    const depthStep = 0.1524;
    tempDepth = startDepth + depthStep * parseInt(d.y);
    // end test
    let left = Math.min(this.config.scale.left, this.config.scale.right);
    let right = Math.max(this.config.scale.left, this.config.scale.right);

    let xFloat = parseFloat(d.x);
    // test
    const intervalDepthTop = 1119.8352;
    const intervalDepthBottom = 2184.8064;
    // end test
    return (
        !isNaN(d.y) &&
        (tempDepth >= intervalDepthTop) &&
        (tempDepth <= intervalDepthBottom) &&
        (xFloat >= left) &&
        (xFloat <= right)
    );
}

// Prepare axes container
ViWiHis.prototype.prepareAxesContainer = function () {
    let self = this;

    this.axesContainer = this.svgContainer.append('g')
        .attr('class', 'wi-his-axes-container')
        .attr('width', self.rect.width)
        .attr('height', self.rect.height);

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

// Prepare draw container
ViWiHis.prototype.prepareDrawContainer = function () {
    let self = this;

    this.svgContainer.append('defs')
        .append('clipPath')
            .attr('id', 'myClip')
            .append('rect')
                .attr("x", self.plotContainerSize.x)
                .attr("y", self.plotContainerSize.y)
                .attr('width', self.plotContainerSize.width - _MARGIN.left)
                .attr('height', self.plotContainerSize.height - _MARGIN.bottom);

    this.drawContainer = this.svgContainer.append('g')
        .attr('class', 'wi-his-draw-container')
        .attr('clip-path', 'url(#myClip)')
            .append('g')
                .attr('width', self.plotContainerSize.width)
                .attr('height', self.plotContainerSize.height);
}

// Do plot
ViWiHis.prototype.doPlot = function () {
    if (this.rect.width < 0 || this.rect.height < 0) return;
    this.adjustSize();
    this.clearPlot();
    this.updateConfig();
    this.generateHistogram();
    this.plotAxesContainer();
    this.plotDrawContainer();
}

// Generate histogram
ViWiHis.prototype.generateHistogram = function () {
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
}

// Plot axes container
ViWiHis.prototype.plotAxesContainer = function () {
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

    this.axisX = this.axisX.tickSize(-this.plotContainerSize.height + _MARGIN.bottom);
    this.axisYLeft = this.axisYLeft.tickSize(-this.plotContainerSize.width + _MARGIN.left);
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
        .attr('transform', 'translate(' + (vpX[0] + self.plotContainerSize.width - _MARGIN.left) + ', ' + 0 + ')')
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
        this.plotContainer
            .classed('show-grid', true)
            .classed('hide-grid', false);
    } else {
        this.plotContainer
            .classed('hide-grid', true)
            .classed('show-grid', false);
    }
}

// Plot draw container
ViWiHis.prototype.plotDrawContainer = function () {
    let self = this;
    this.curves.forEach(curve => {
        let idx = self.curves.indexOf(curve);
        let curveDrawContainer = self.drawContainer.append('g')
            .attr('id', 'curve-' + curve.idCurve + '-draw-container');
        self.drawBarHistogram(curveDrawContainer, idx);
        self.drawCurveHistogram(curveDrawContainer, idx);
        if (self.config.showGaussian)
            self.drawGaussianCurve(curveDrawContainer, idx);
        if (self.config.showCumulative)
            self.drawCumulativeCurve(curveDrawContainer, idx);
    });
}

// Draw
ViWiHis.prototype.drawBarHistogram = function (curveDrawContainer, idx) {
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
        let pos = d3.mouse(self.plotContainer.node());
        self.tooltipContainer
            .style('opacity', 0.9)
            .html(content)
            .style("left", pos[0] + "px")
            .style("top", (pos[1] - 30 + 175) + "px");
    }

    function hideTooltip() {
        self.tooltipContainer
            .style('opacity', 0)
            .style("left", 0)
            .style("top", 0);
    }
}

ViWiHis.prototype.drawCurveHistogram = function (curveDrawContainer, idx) {
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

    }

    path.datum(fullBins)
        .attr('d', line);
}

ViWiHis.prototype.drawGaussianCurve = function (curveDrawContainer, idx) {
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

ViWiHis.prototype.drawCumulativeCurve = function (curveDrawContainer, idx) {
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
        return points;
    }
}

// Adjust size
ViWiHis.prototype.adjustSize = function () {
    let self = this;
    this.rect = this.plotContainer.node().getBoundingClientRect();

    this.svgContainer
        .attr('width', self.rect.width)
        .attr('height', self.rect.height);

    this.axesContainer
        .attr('width', self.rect.width)
        .attr('height', self.rect.height);

    this.drawContainer
        .attr('width', self.rect.width)
        .attr('height', self.rect.height);
}

// Update on changes
ViWiHis.prototype.updatePlot = function (newProps) {
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

// Clear
ViWiHis.prototype.clearPlot = function () {
    this.drawContainer.selectAll('*').remove();
}

// Statistics
ViWiHis.prototype.getAverage = function () {
    let self = this;
    let mean = [];
    if (this.intervalData && this.intervalData.length) {
        this.intervalData.forEach(data => {
            mean.push(d3.mean(data));
        });
    }
    return mean;
}

ViWiHis.prototype.getStandardDeviation = function () {
    let self = this;
    let standardDeviation = [];
    if (this.intervalData && this.intervalData.length) {
        this.intervalData.forEach(data => {
            standardDeviation.push(d3.deviation(data));
        });
    }
    return standardDeviation;
}

// Calculate scales
ViWiHis.prototype.getTransformX = function () {
    let scaleFunc = this.config.loga ? d3.scaleLog() : d3.scaleLinear();
    return scaleFunc
        .domain(this.getWindowX())
        .range(this.getViewportX());
}
ViWiHis.prototype.getTransformY = function () {
    return d3.scaleLinear()
        .domain(this.getWindowY().reverse())
        .range(this.getViewportY());
}

ViWiHis.prototype.getViewportX = function () {
    return [this.plotContainerSize.x, this.plotContainerSize.width];
}
ViWiHis.prototype.getViewportY = function () {
    return [this.plotContainerSize.y, this.plotContainerSize.height];
}

ViWiHis.prototype.getWindowX = function () {
    let left = this.config.scale.left;
    let right = this.config.scale.right;

    if (this.config.flipHorizontal) {
        left = this.config.scale.right;
        right = this.config.scale.left;
    }

    return [left, right];
}
ViWiHis.prototype.getWindowY = function () {
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
}

ViWiHis.prototype.getDomainX = function () {
    return d3.extent(this.getWindowX());
}

ViWiHis.prototype.getTransformCumulativeY = function () {
    let wdY = this.getWindowY();
    return d3.scaleLinear()
        .domain([100, 0])
        .range(this.getViewportY());
}

ViWiHis.prototype.calcPlotContainerSize = function () {
    let svgSize = this.svgContainer.node().getBoundingClientRect();
    this.plotContainerSize = {
        x: _MARGIN.left,
        y: _MARGIN.top,
        width: svgSize.width - _MARGIN.left - _MARGIN.right,
        height: svgSize.height - _MARGIN.top - _MARGIN.bottom
    };
}

// Utils
ViWiHis.prototype.reverseBins = function (bins) {
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

ViWiHis.prototype.getLength = function (idx) {
    return this.intervalData[idx] ? this.intervalData[idx].length : null;
}