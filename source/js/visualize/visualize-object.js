let Utils = require('./visualize-utils');
let Drawing = require('./visualize-drawing');
let CanvasHelper = require('./visualize-canvas-helper');
let graph = require('./visualize');

const _OVERFLOW_VIEWPORT_TOP = 1;
const _OVERFLOW_VIEWPORT_BOTTOM = 2;
const _INSIDE_VIEWPORT = 3;
const _OVERFLOW_VIEWPORT_TOP_BOTTOM = 4;
const _OUT_OF_VIEWPORT = 5;

module.exports = ObjectOfTrack;

Utils.extend(Drawing, ObjectOfTrack);

function ObjectOfTrack(config) {
    Drawing.call(this, config);
    this.id = config.idObjectOfTrack || config.id;
    this.idObjectTrack = config.idObjectTrack;
    this.startDepth = config.startDepth || config.topDepth;
    this.endDepth = config.endDepth || config.bottomDepth;
    this.name = "Object " + this.id;
    this.background = "white";
    this.currentDraw = null; // TO BE FIXED
}

ObjectOfTrack.prototype.getProperties = function() {
    return {
        idObjectOfTrack: this.id,
        idObjectTrack: this.idObjectTrack,
        name: this.name,
        startDepth: this.startDepth,
        endDepth: this.endDepth,
        background: this.background,
        type: this.currentDraw || "undefined", // TO BE FIXED
    }
}

ObjectOfTrack.prototype.setProperties = function(props) {
    Utils.setIfNotNull(this, 'id', props.idObjectOfTrack);
    Utils.setIfNotNull(this, 'id', props.id);
    Utils.setIfNotNull(this, 'idObjectTrack', props.idObjectTrack);
    Utils.setIfNotNull(this, 'name', props.name);
    Utils.setIfNotNull(this, 'showName', props.showName);
    Utils.setIfNotNull(this, 'startDepth', props.startDepth);
    Utils.setIfNotNull(this, 'endDepth', props.endDepth);
    Utils.setIfNotNull(this, 'background', props.background);
    Utils.setIfNotNull(this, 'currentDraw', props.type);

    if (this.startDepth > this.endDepth) {
        let tmp = this.startDepth;
        this.startDepth = this.endDepth;
        this.endDepth = tmp;
    }

    if(props.name) this.updateHeader();
    if(props.background) this.doPlot();
}

ObjectOfTrack.prototype.exportsProperties = function() {
    let self = this;
    let properties = new Object();

    properties.idObjectOfTrack = this.id;
    properties.idObjectTrack = this.idObjectTrack;
    properties.topDepth = this.startDepth;
    properties.bottomDepth = this.endDepth;

    let objectToSave = new Object();
    if (this.idHistogram) {
        let objProps = {
            type: 'Histogram',
            idHistogram: this.idHistogram,
            background: this.background
        };
        properties.object = JSON.stringify(objProps);
    }
    else if (this.idCrossplot) {
        let objProps = {
            type: 'Crossplot',
            idCrossplot: this.idCrossplot,
            background: this.background
        };
        properties.object = JSON.stringify(objProps);
    }
    return properties;
}

ObjectOfTrack.prototype.save = function() {
    if (!this.idHistogram && !this.idCrossplot) return;
    this.wiApiService.editObjectOfObjectTrack(this.exportsProperties(), function(returnedObject){
        console.log('saved', returnedObject);
    });
}

ObjectOfTrack.prototype.init = function(plotContainer, wiComponentService, wiApiService) {
    Drawing.prototype.init.call(this, plotContainer);
    let self = this;

    this.wiComponentService = wiComponentService;
    this.wiApiService = wiApiService;
    this.svgContainer = plotContainer.select('.vi-track-svg-container');

    this.svgGroup = this.svgContainer.append('g')
        .classed('vi-object-svg-group', true);

    this.foreignObject = this.svgGroup.append('foreignObject');
    this.objectContainer = this.foreignObject.append('xhtml:div')
                                .attr('class', 'object-container')
                                .style('position', 'relative');
    
    this.tooltip = this.objectContainer.append('div')
                            .attr('class', 'vi-object-tooltip');

    $(self.objectContainer.node())
        .draggable({
            containment: false,
            axis: 'y',
        })
        .resizable({
            minHeight: 200,
            containment: false,
            handles: "n, s",
        })
        .on('resize', function(event, ui) {
            self.showTooltip(self.updateDepth(event, ui));
        })
        .on('drag', function(event, ui) {
            self.showTooltip(self.updateDepth(event, ui));
        })
        .on('dragstop', function(event, ui) {
            event.stopPropagation();
            updateObject(ui);
            self.save();
        })
        .on('resizestop', function(event, ui) {
            event.stopPropagation();
            updateObject(ui);
            self.save();
        });
    
    this.updateHeader();

    function updateObject(ui) {
        let newDepth = self.updateDepth(event, ui);
        let viHistogram = self.getViHistogram();
        if (viHistogram) {
            viHistogram.histogramModel.properties.intervalDepthTop = newDepth[0];
            viHistogram.histogramModel.properties.intervalDepthBottom = newDepth[1];
            viHistogram.saveHistogramNow(function() {
                viHistogram.visHistogram.signal('histogram-update', 'Dragged');
                self.hideTooltip();
            });
        }

        let viCrossplot = self.getViCrossplot();
        if (viCrossplot) {
            viCrossplot.crossplotModel.properties.pointsets[0].intervalDepthTop = newDepth[0];
            viCrossplot.crossplotModel.properties.pointsets[0].intervalDepthBottom = newDepth[1];
            viCrossplot.saveCrossplotNow(function() {
                viCrossplot.viCrossplot.pointSet.intervalDepthTop = newDepth[0];
                viCrossplot.viCrossplot.pointSet.intervalDepthBottom = newDepth[1];
                viCrossplot.viCrossplot.doPlot();
                self.hideTooltip();
            });
        }
    }
}

ObjectOfTrack.prototype.showTooltip = function(newDepth) {
    let self = this;
    self.objectContainer.selectAll("div:not(.vi-object-tooltip):not(.ui-resizable-handle)").style('filter', "blur(3px)");
    content = '<span>' + (newDepth[0].toFixed(2) + ' - ' + newDepth[1].toFixed(2)) + '</span>';
    self.tooltip
        .style('opacity', 0.9)
        .style('z-index', 89)
        .html(content);
}
ObjectOfTrack.prototype.hideTooltip = function() {
    let self = this;
    self.objectContainer.selectAll("div:not(.vi-object-tooltip):not(.ui-resizable-handle)").style('filter', "blur(0px)");
    self.tooltip
        .style('z-index', 0)
        .style('opacity', 0);
}

ObjectOfTrack.prototype.raise = function () {
    let self = this;
    this.svgGroup.raise();
    return;
}

ObjectOfTrack.prototype.updateDepth = function(event, ui){
    let self = this;
    let transformY = this.getTransformY();
    if (ui.size) {
        let bottom = ui.position.top + ui.size.height;
        self.startDepth = transformY.invert(ui.position.top);
        self.endDepth = transformY.invert(bottom);
    }
    else {
        let interval = self.endDepth - self.startDepth;
        self.startDepth = transformY.invert(ui.position.top);
        self.endDepth = self.startDepth + interval;
    }
    return [self.startDepth, self.endDepth];
};

ObjectOfTrack.prototype.doPlot = function(highlight, forcePlot) {
    if (this.startDepth == null || this.endDepth == null) return;
    
    let transformY = this.getTransformY();
    let viewportX = this.getViewportX();

    let minY = transformY(this.startDepth);
    let maxY = transformY(this.endDepth);
    let minX = d3.min(viewportX);
    let maxX = d3.max(viewportX);

    this.drawContainer(minX, maxX, minY, maxY, forcePlot, highlight);

    if(this.objectContainer) {
        this.objectContainer.style('background-color', this.background || 'blue');
    }
    this.updateHeader();
}

ObjectOfTrack.prototype.updateHeader = function() {
    Drawing.prototype.updateHeader.call(this);
    if (!this.header) return;
    let rect = this.header.node().getBoundingClientRect();
    let headerBorderWidth = parseInt(this.header.style('border-width'));

    let width = rect.width - headerBorderWidth - 1;
    let height = rect.height - headerBorderWidth - 1;

    if(width < 0 || height < 0) {
        return;
    }

    let fillArea = this.header.select('.vi-drawing-header-fill')
        .attr('width', width)
        .attr('height', height);

    fillArea.selectAll('rect').remove();
    let fill = this.background;
    fillArea
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', height)
        .attr('fill', fill);
}

ObjectOfTrack.prototype.on = function(type, cb) {
    this.svgGroup.on(type, cb);
}

function buildHistogramProps(config, wellProps) {
    var histogramProps = {
        idHistogram: config.idHistogram,
        idWell: config.idWell,
        name: config.name || "BlankHistogram",
        intervalDepthTop: config.intervalDepthTop,
        intervalDepthBottom: config.intervalDepthBottom,
        divisions: config.divisions || 10,
        leftScale: config.leftScale,
        rightScale: config.rightScale,
        showGaussian: config.showGaussian || false,
        loga: config.loga || false,
        showGrid: config.showGrid || false,
        showCumulative: config.showCumulative || false,
        flipHorizontal: config.flipHorizontal || false,
        plot: config.plot || "Bar",
        plotType: config.plotType || "Frequency",
        color: config.color || "Blue",
        discriminator: config.discriminator || null,
        curveId: config.curve.idCurve,
        yStep: config.curve.yStep || parseFloat(wellProps.step),
    };
    return histogramProps;
}

let getWiD3HistogramName, getWiD3CrossplotName;
ObjectOfTrack.prototype.createHistogram = function(idHistogram, histogramName, scopeObj, compileFunc, containerName) {
    getWiD3HistogramName = function (idHistogram) {
        return containerName + 'objHistogram' + idHistogram + 'D3Area';
    }
    this.idHistogram = idHistogram;
    var domEle = this.objectContainer
            .append("div")
            .style('position', 'absolute')
            .style('overflow', 'hidden')
            .attr('class', 'vi-object-histogram')
            .style('width', '100%')
            .style('height', '100%')
            .style('display', 'flex')
            .node();

    let html = '<wi-d3-histogram style="flex: 1; display: flex;flex-direction:column;" name="' 
               + (getWiD3HistogramName(idHistogram)) + '" id-histogram="'
               + idHistogram + '"></wi-d3-histogram>';
    $(domEle).html(compileFunc(html)(scopeObj));
    this.currentDraw = "Histogram";
    this.name = histogramName

    this.doPlot(true, true);
}
ObjectOfTrack.prototype.createCrossplot = function(idCrossplot, crossplotName, scopeObj, compileFunc, containerName) {
    getWiD3CrossplotName = function (idCrossplot) {
        return containerName + 'objCrossplot' + idCrossplot + 'D3Area';
    }
    this.idCrossplot = idCrossplot;
    var domEle = this.objectContainer
            .append("div")
            .style('position', 'absolute')
            .style('overflow', 'hidden')
            .attr('class', 'vi-object-crossplot')
            .style('width', '100%')
            .style('height', '100%')
            .style('display', 'flex')
            .node();

    let html = '<wi-d3-crossplot style="flex: 1; display: flex;flex-direction:column;" name="' 
               + (getWiD3CrossplotName(idCrossplot)) + '" id-crossplot="'
               + idCrossplot + '"></wi-d3-crossplot>';
    $(domEle).html(compileFunc(html)(scopeObj));
    this.currentDraw = "Crossplot";
    this.name = crossplotName;

    this.doPlot(true, true);
}
ObjectOfTrack.prototype.getViHistogram = function() {
    let self = this;
    return this.wiComponentService.getComponent(getWiD3HistogramName(self.idHistogram));
}
ObjectOfTrack.prototype.getViCrossplot = function() {
    let self = this;
    return this.wiComponentService.getComponent(getWiD3CrossplotName(self.idCrossplot));
}

ObjectOfTrack.prototype.createHistogramToForeignObject = function(config, wellProp, scopeObj, compileFunc) {
    if(config.dragToCreate) {
        config.intervalDepthTop = parseFloat(this.startDepth.toFixed(4));  
        config.intervalDepthBottom = parseFloat(this.endDepth.toFixed(4));
        config.dragToCreate = false;
    } else {
        this.startDepth = config.intervalDepthTop;
        this.endDepth = config.intervalDepthBottom;
    }
    if(!config.background) {
        config.background = "rgba(255, 255, 255, 1)";
    }

    let histogramModel = {
        properties: buildHistogramProps(config, wellProp)
    }

    var domEle = this.objectContainer
            .append("div")
            .style('position', 'absolute')
            .style('overflow', 'hidden')
            .attr('class', 'vi-object-histogram')
            .style('width', '100%')
            .style('height', '100%')
            .style('display', 'flex')
            .node();

    let html = '<wi-d3-histogram style="flex: 1; display: flex;flex-direction:column;" name="' 
               + getWiD3HistogramName(config.idHistogram) + '" id-histogram="'
               + config.idHistogram + '"></wi-d3-histogram>';
    $(domEle).html(compileFunc(html)(scopeObj));
    this.currentDraw = "Histogram";
    this.setProperties({
        name: histogramModel.properties.name,
        background: config.background
    });

    this.doPlot(true, true);
}

ObjectOfTrack.prototype.createCrossplotToForeignObject = function(crossplotConfig, wellProp) {
    if(!crossplotConfig.config.pointSet || (crossplotConfig.config.pointSet && !crossplotConfig.config.pointSet.idPointSet)) {
        return;
    }
    if(crossplotConfig.dragToCreate) {
        crossplotConfig.config.pointSet.intervalDepthTop = parseFloat(this.startDepth.toFixed(4));  
        crossplotConfig.config.pointSet.intervalDepthBottom = parseFloat(this.endDepth.toFixed(4));
        crossplotConfig.dragToCreate = false;
    } else {
        this.startDepth = parseFloat(crossplotConfig.config.pointSet.intervalDepthTop);
        this.endDepth = parseFloat(crossplotConfig.config.pointSet.intervalDepthBottom);
    }

    if(!crossplotConfig.background) {
        crossplotConfig.background = "rgba(255, 255, 255, 1)";
    }

    /*
    if(!crossplotConfig.curve1.data) {
        crossplotConfig.curve1.data = processingData(crossplotConfig.curve1.rawData, wellProp);
    }
    if(!crossplotConfig.curve2.data) {
        crossplotConfig.curve2.data = processingData(crossplotConfig.curve2.rawData, wellProp);
    }
    */
    crossplotConfig.curve1 = graph.buildCurve(crossplotConfig.curve1, crossplotConfig.curve1.rawData, wellProp);
    crossplotConfig.curve2 = graph.buildCurve(crossplotConfig.curve2, crossplotConfig.curve2.rawData, wellProp);

    var domEle = this.objectContainer
        .append("div")
            .style('overflow', 'hidden')
            .style("height", "100%")
            .style('display', 'flex')
            .attr('class', 'vi-object-crossplot')
            .node();
    
    d3.select(domEle)
        .append("div")
            .style('flex', 1)
            .style('overflow', 'hidden')
            .attr('class', 'vi-crossplot-container');

    this.viCrossplot = graph.createCrossplot(crossplotConfig.curve1, crossplotConfig.curve2, crossplotConfig.config, domEle);
    
    console.log("cross plot of this object: ", this.viCrossplot);
    this.currentDraw = "Crossplot";
    this.setProperties({
        name: crossplotConfig.config.name,
        background: crossplotConfig.background
    });

    this.doPlot(true, false);
}

ObjectOfTrack.prototype.drawContainer = function(minX, maxX, minY, maxY, forcePlot, highlight) {
    this.objectContainer
            .style('x', minX)
            .style('top', minY)
            .style('width', maxX - minX)
            .style('height', maxY - minY);
    console.log('drawContainer forcePlot');
    if (this.idHistogram) {
        if (this.getViHistogram().visHistogram.doPlot) {
            this.getViHistogram().visHistogram.doPlot();
        }
    }
    if (this.idCrossplot) {
        if (this.getViCrossplot().viCrossplot.doPlot) {
            this.getViCrossplot().viCrossplot.doPlot();
        }
    }
}
ObjectOfTrack.prototype.handleQuest = function(quest, wellProp) {
    if(!quest || !quest.name) return;
    switch(quest.name) {
        case 'addHistogram':
            console.log("Well properties: ", wellProp);
            console.log("Quest config: ", quest.config);
            this.createHistogramToForeignObject(quest.config, wellProp, quest.scopeObj, quest.compileFunc);
            break;
        case 'addCrossplot':
            console.log("well properties: ", wellProp);
            console.log("crossplot Props: ", quest.config);
            this.createCrossplotToForeignObject(quest.config, wellProp);
            break;
        default:
            console.log('unknown quest.');
    }
}

function processingData(rawData, well) {
    let data = [];

    data = Utils.parseData(rawData);
    data = Utils.trimData(data);

    data = data.map(function(d) {
        return {
            x: d.x,
            y: d.y * parseFloat(well.step) + parseFloat(well.topDepth)
        };
    });
    return data;
}

ObjectOfTrack.prototype.getDepthRange = function(){
    return [this.startDepth, this.endDepth];
};
