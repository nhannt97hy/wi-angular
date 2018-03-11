module.exports = ViWiPlot;

const MARGIN = { top: 20, right: 20, bottom: 50, left: 70};

let defaultOptions = {
    lineColor: '#888',
    lineStyle: 'solid',
    pointColor: 'steelblue',
    pointStyle: 'circle',
    gridColor: '#888',
    showLine: true,
    showPoint: true
}

let lineStyle = {
    solid: 'none',
}

function ViWiPlot(config) {
    this.configs = config.configs;
    this.options = defaultOptions;
    this.setOptions(config.options);
}

ViWiPlot.prototype.setOptions = function (newOptions) {
    let self = this;
    if(!newOptions) return;
    Object.keys(newOptions).forEach((key) => {
        self.options[key] = newOptions[key];
    });
}

ViWiPlot.prototype.setConfigs = function (newConfigs) {
    let self = this;
    if(!newConfigs) return;
    Object.keys(newConfigs).forEach((key) => {
        if(self.configs[key]) {
            self.configs[key] = newConfigs[key];
        }
    });
}

ViWiPlot.prototype.updateConfigurations = function (newConfig) {
    let self = this;
    self.setConfigs(newConfig.configs);
    self.setOptions(newConfig.options);

    if(!newConfig.configs) {
        self.draw();
        return;
    }
    self.clearPlotContainer();
    self.prepareData();
    self.prepareContainer();
    self.draw();
}

ViWiPlot.prototype.getProperties = function () {
    let self = this;
    return {
        configs: self.configs,
        options: self.options
    }
};

ViWiPlot.prototype.init = function (domElem) {
    let self = this;
    console.log("initialization wi plot into DOM: ", domElem, " with configs: ", self.getProperties());
    this.root = d3.select(domElem);

    this.plotContainer = self.root.append('div')
        .attr('class', 'wi-plot-plot-container');
    this.svgContainer = self.plotContainer.append('svg')
        .attr('class', 'wi-plot-svg-container')
        .attr('width', function() { return self.plotContainer.node().getBoundingClientRect().width;})
        .attr('height', function() { return self.plotContainer.node().getBoundingClientRect().height;});

    this.prepareData();
    this.prepareContainer();
    this.draw();
}

ViWiPlot.prototype.prepareData = function () {
    let self = this;
    self.data = self.configs.x.data.map((d,i) => {
        return {
            x: d,
            y: self.configs.y.data[i]
        };
    });
    return self.data;
}

ViWiPlot.prototype.getDrawContainerSize = function () {
    let self = this;
    let svgSize = self.svgContainer.node().getBoundingClientRect();
    let drawContainerSize = {
        x: MARGIN.left,
        y: MARGIN.top,
        width: svgSize.width - MARGIN.left - MARGIN.right,
        height: svgSize.height - MARGIN.top - MARGIN.bottom
    };
    return drawContainerSize;
}

ViWiPlot.prototype.getTransformX = function () {
    let self = this;
    let drawContainerSize = self.getDrawContainerSize();
    return d3.scaleLinear().domain([self.configs.x.min, self.configs.x.max]).range([0, drawContainerSize.width]);
}

ViWiPlot.prototype.getTransformY = function () {
    let self = this;
    let drawContainerSize = self.getDrawContainerSize();
    return d3.scaleLinear().domain([self.configs.y.min, self.configs.y.max]).range([drawContainerSize.height, 0]);
}

ViWiPlot.prototype.prepareContainer = function () {
    let self = this;
    let drawContainerSize = self.getDrawContainerSize();

    // draw graph container
    let graphContainer = self.svgContainer.append('g')
        .attr('class', 'wi-plot-graph-container')
        .attr('transform', 'translate(' + drawContainerSize.x + ', ' + drawContainerSize.y + ')');
    graphContainer.append('defs').append('clipPath')
        .attr('id', 'myClip')
        .append('rect')
            .attr("x", 0)
            .attr("y", 0)
            .attr('width', drawContainerSize.width)
            .attr('height', drawContainerSize.height);

    self.view = graphContainer.append('g')
        .attr('class', 'view')
        .attr('clip-path', 'url(#myClip)')
            .append('g')
                .attr('width', drawContainerSize.width)
                .attr('height', drawContainerSize.height);

    // draw axis container
    let xScale = self.getTransformX();
    let yScale = self.getTransformY();

    let axesContainer = self.svgContainer.append('g')
        .attr('class', 'wi-plot-axes-container');
    let xAxis = d3.axisTop(xScale)
        .ticks((drawContainerSize.width + 2) / (drawContainerSize.height + 2) * 10)
        .tickSize(drawContainerSize.height)
        .tickPadding(8 - drawContainerSize.height);
    let gX = axesContainer.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', 'translate(' + drawContainerSize.x + ', ' + (drawContainerSize.y + drawContainerSize.height) + ')')
        .call(xAxis);
    let xAxisBottom = d3.axisBottom(xScale);
    let gXBottom = axesContainer.append('g')
        .attr('class', 'axis axis--x-bottom')
        .attr('transform', 'translate(' + drawContainerSize.x + ', ' + (drawContainerSize.y + drawContainerSize.height) + ')')
        .call(xAxisBottom);
    axesContainer.append('text')
        .attr('class', 'wi-plot-axes-label')
        .attr('x', function() { return drawContainerSize.x + drawContainerSize.width/2; })
        .attr('y', function() { return drawContainerSize.y + drawContainerSize.height + MARGIN.bottom; })
        .attr('text-anchor', 'middle')
        .text(self.configs.x.label);
    let yAxis = d3.axisRight(yScale)
        .ticks(10)
        .tickSize(drawContainerSize.width)
        .tickPadding(8 - drawContainerSize.width);
    let gY = axesContainer.append('g')
        .attr('class', 'axis axis--y')
        .attr('transform', 'translate(' + drawContainerSize.x + ', ' + drawContainerSize.y + ')')
        .call(yAxis);
    let yAxisLeft = d3.axisLeft(yScale);
    let gYLeft = axesContainer.append('g')
        .attr('class', 'axis axis--y-left')
        .attr('transform', 'translate(' + drawContainerSize.x + ', ' + drawContainerSize.y + ')')
        .call(yAxisLeft);
    axesContainer.append('text')
        .attr('class', 'wi-plot-axes-label')
        .attr('transform', 'rotate(-90)')
        .attr('y', MARGIN.left/2 )
        .attr('x', -(drawContainerSize.height/2) )
        .attr('text-anchor', 'middle')
        .text(self.configs.y.label);

    let zoom = d3.zoom()
        .scaleExtent([1, 40])
        .translateExtent([[-100, -100], [drawContainerSize.x + drawContainerSize.width + 90, drawContainerSize.y + drawContainerSize.height + 100]])
        .on('zoom', zoomed);
    function zoomed() {
        self.view.attr('transform', d3.event.transform);
        gX.call(xAxis.scale(d3.event.transform.rescaleX(self.getTransformX())));
        gY.call(yAxis.scale(d3.event.transform.rescaleY(self.getTransformY())));
        gXBottom.call(xAxisBottom.scale(d3.event.transform.rescaleX(self.getTransformX())));
        gYLeft.call(yAxisLeft.scale(d3.event.transform.rescaleY(self.getTransformY())));
    }
    self.svgContainer.call(zoom.transform, d3.zoomIdentity);
    self.svgContainer.call(zoom);
    return self.view;
}

ViWiPlot.prototype.clearPlotContainer = function () {
    this.svgContainer.selectAll('*').remove();
}

ViWiPlot.prototype.draw = function () {
    let self = this;
    let xScale = self.getTransformX();
    let yScale = self.getTransformY();
    let view = self.view || self.prepareContainer();
    let data = self.data || self.prepareData();

    // draw points
    let pointStyle = self.options.pointStyle;
    let point = view.selectAll(pointStyle)
        .data(data);
    point.enter()
        .append(pointStyle)
            .attr('r', 3)
            .attr('cx', (d)=> xScale(d.x))
            .attr('cy', (d)=> yScale(d.y))
            .attr('fill', function() { return self.options.showPoint ? self.options.pointColor:'none';})
            .attr('stroke', 'none');
    point.attr('fill', function() { return self.options.showPoint ? self.options.pointColor:'none';})
        .attr('cx', (d)=> xScale(d.x))
        .attr('cy', (d)=> yScale(d.y));
    point.exit().remove();


    // draw lines
    let line = d3.line()
        .x((d)=> xScale(d.x))
        .y((d)=> yScale(d.y))
        .curve(d3.curveCatmullRom.alpha(0.5));

    let curve = view.selectAll('path')
        .data([data]);

    curve.enter()
        .append('path')
            .attr('stroke', function() { return self.options.showLine ? self.options.lineColor : 'none';})
            .attr('stroke-width', '1')
            .attr('stroke-dasharray', lineStyle[self.options.lineStyle])
            .attr('fill', 'none')
            .datum(function (d) { return d;})
                .attr('d', line);
    curve.attr('stroke', function() { return self.options.showLine ? self.options.lineColor : 'none';})
        .attr('stroke-width', '1')
        .attr('stroke-dasharray', lineStyle[self.options.lineStyle])
        .attr('fill', 'none')
        .datum(function (d) { return d;})
            .attr('d', line);
    curve.exit().remove();
}
