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
    this.currentDraw = null;
}

ObjectOfTrack.prototype.getProperties = function() {
    return {
        idObjectOfTrack: this.id,
        idObjectTrack: this.idObjectTrack,
        name: this.name,
        startDepth: this.startDepth,
        endDepth: this.endDepth,
        background: this.background,
        type: this.currentDraw || "undefined",
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
    let properties = new Object();

    properties.idObjectOfTrack = this.id;
    properties.idObjectTrack = this.idObjectTrack;
    properties.topDepth = this.startDepth;
    properties.bottomDepth = this.endDepth;

    let objectToSave = new Object();
    switch(this.currentDraw) {
        case 'Histogram':
            objectToSave.type = "Histogram";
            let histogramProps = this.viHistogram.histogramModel.properties;
            objectToSave.idHistogram = histogramProps.idHistogram;
            objectToSave.background = this.background;

            break;
        case 'Crossplot':
            objectToSave.type = "Crossplot";
            let pointSet = this.viCrossplot.pointSet;

            objectToSave.idCrossPlot = this.viCrossplot.idCrossPlot;
            objectToSave.idPointSet = pointSet.idPointSet;
            objectToSave.name = this.name;
            objectToSave.background = this.background;
            objectToSave.idWell = this.viCrossplot.idWell;
            break;
        default:
            objectToSave = {
                type: 'unknown'
            }
            break;
    }
    properties.object = JSON.stringify(objectToSave);
    return properties;
}

ObjectOfTrack.prototype.init = function(plotContainer, $scope, wiApiService, __Utils) {
    Drawing.prototype.init.call(this, plotContainer);
    this.scopeObj = $scope;
    let self = this;

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
            // containment: self.svgContainer.node().parentNode,
            axis: 'y',
        })
        .resizable({
            // containment: self.svgContainer.node().parentNode,
            minHeight: 30,
            handles: "n, s",
        })
        .on('resize', function(event, ui) {
            self.showTooltip(event, ui);
            
            let newDepth = self.updateDepth(event, ui);
            let transformY = self.getTransformY();
            self.onViewportChange(null, null, transformY(newDepth[0]), transformY(newDepth[1]), false, true, true);
            
        })
        .on('drag', function(event, ui) {
            self.showTooltip(event, ui);

            let newDepth = self.updateDepth(event, ui);
            let transformY = self.getTransformY();
            self.onViewportChange(null, null, transformY(newDepth[0]), transformY(newDepth[1]), false, true);
        })
        .on('dragstop', function(event, ui) {
            event.stopPropagation();
            console.log("event detected: ", event,"ui: ", ui);
            
            let newDepth = self.updateDepth(event, ui);
            
            let newProps = {};
            switch (self.currentDraw) {
                case 'Histogram' :
                    newProps = self.viHistogram.histogramModel.properties;
                    newProps.intervalDepthTop = parseFloat(newDepth[0].toFixed(4));
                    newProps.intervalDepthBottom = parseFloat(newDepth[1].toFixed(4));
                    break;
                case 'Crossplot' :
                    newProps = self.viCrossplot.pointSet;
                    newProps.intervalDepthTop = parseFloat(newDepth[0].toFixed(4));
                    newProps.intervalDepthBottom = parseFloat(newDepth[1].toFixed(4));
                    break;
                default :
                    break;
            }
            self.refreshObjectOfTrack(newProps, wiApiService, function () {
                __Utils.refreshProjectState();
            });
            self.hideTooltip();
        })
        .on('resizestop', function(event, ui) {
            event.stopPropagation();
            console.log("event detected: ", event,"ui: ", ui)

            let newDepth = self.updateDepth(event, ui);
            
            switch (self.currentDraw) {
                case 'Histogram' : 
                    self.viHistogram.histogramModel.properties.intervalDepthTop = parseFloat(newDepth[0].toFixed(4));
                    self.viHistogram.histogramModel.properties.intervalDepthBottom = parseFloat(newDepth[1].toFixed(4));
                    break;
                case 'Crossplot' :
                    self.viCrossplot.pointSet.intervalDepthTop = parseFloat(newDepth[0].toFixed(4));
                    self.viCrossplot.pointSet.intervalDepthBottom = parseFloat(newDepth[1].toFixed(4));
                    break;
                default :
                    break;
            }
            self.refreshObjectOfTrack(null, wiApiService, function () {
                __Utils.refreshProjectState();
            });
            self.hideTooltip();
        });
    this.updateHeader();
}

ObjectOfTrack.prototype.showTooltip = function(event, ui) {
    let self = this;
    let newDepth = self.updateDepth(event, ui);
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

    switch(self.currentDraw) {
        case "Histogram" : 
            self.viHistogram.resizeSensor.detach();
            self.viHistogram.resizeSensor = new ResizeSensor($(self.viHistogram.container.node()), function(param) {
                self.viHistogram.doPlot();
            } )
            break;
        case "Crossplot" :
            self.viCrossplot.resizeSensor.detach();
            self.viCrossplot.resizeSensor = new ResizeSensor($(self.viCrossplot.root.node()), function(param) {
                self.viCrossplot._doPlot();
            } )
            break;
        default:
            break;
    }
}

ObjectOfTrack.prototype.updateDepth = function(event, ui){
    let self = this;
    let transformY = this.getTransformY();

    let minY = transformY(this.startDepth);
    let maxY = transformY(this.endDepth);
    let originalHeight = maxY - minY;

    let viewportStatus = self.getStatusOfViewport();

    if(event.type == "dragstop" || event.type == "drag") {
        let intervalDepth = self.endDepth - self.startDepth;

        switch (viewportStatus) {
            case _OVERFLOW_VIEWPORT_TOP:
            case _OVERFLOW_VIEWPORT_TOP_BOTTOM:
                self.endDepth = transformY.invert(ui.position.top + self.objectContainer.node().getBoundingClientRect().height);
                self.startDepth = self.endDepth - intervalDepth;
                break;
            case _INSIDE_VIEWPORT:
            case _OVERFLOW_VIEWPORT_BOTTOM:
                self.startDepth = transformY.invert(ui.position.top);
                self.endDepth = self.startDepth + intervalDepth;
                break;
            default:
                break;
        }
    } else if(event.type == "resizestop" || event.type == "resize") {
        switch(viewportStatus) {
            case _OVERFLOW_VIEWPORT_TOP:
                if (!(ui.originalPosition.top + ui.size.height > self.getViewportY()[1])) {
                    self.endDepth = transformY.invert(ui.originalPosition.top + ui.size.height);
                }
                break;
            case _OVERFLOW_VIEWPORT_BOTTOM:
                if (ui.position.top > 0) {
                    self.startDepth = transformY.invert(ui.position.top);
                }
                break;
            case _INSIDE_VIEWPORT:
                if(ui.position.top != ui.originalPosition.top) {
                    self.startDepth = transformY.invert(ui.position.top);
                } else {
                    self.endDepth = transformY.invert(ui.position.top + ui.size.height);
                }
                break;
            case _OVERFLOW_VIEWPORT_TOP_BOTTOM:

                break;
            default:
                break;
        }
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

    this.onViewportChange(minX, maxX, minY, maxY, forcePlot, highlight);

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

ObjectOfTrack.prototype.createHistogramToForeignObject = function(config, wellProp) {
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
            .node();

    this.viHistogram = graph.createHistogram(histogramModel, (parseFloat(config.curve.yStep) || parseFloat(wellProp.step)), parseFloat(wellProp.topDepth), parseFloat(wellProp.bottomDepth), domEle);

    this.viHistogram.setCurve(config.curve.rawData);
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

    if(!crossplotConfig.curve1.data) {
        crossplotConfig.curve1.data = processingData(crossplotConfig.curve1.rawData, wellProp);
    }
    if(!crossplotConfig.curve2.data) {
        crossplotConfig.curve2.data = processingData(crossplotConfig.curve2.rawData, wellProp);
    }

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

ObjectOfTrack.prototype.getStatusOfViewport = function(minY, maxY){
    let self = this;
    let viewportY = self.getViewportY();
    let transformY = self.getTransformY();
    minY = minY ? minY:transformY(self.startDepth);
    maxY = maxY ? maxY:transformY(self.endDepth);

    if(minY < viewportY[0] && maxY <= (viewportY[1]) && maxY >= viewportY[0]) {
        return _OVERFLOW_VIEWPORT_TOP;
    } else if(minY >= viewportY[0] && minY <= viewportY[1] && maxY >= viewportY[0] && maxY <= (viewportY[1])) {
        return _INSIDE_VIEWPORT;
    } else if(minY >= viewportY[0] && minY <= viewportY[1] && maxY > (viewportY[1])) {
        return _OVERFLOW_VIEWPORT_BOTTOM;
    } else if(minY < viewportY[0] && maxY > (viewportY[1])) {
        return _OVERFLOW_VIEWPORT_TOP_BOTTOM;
    } else {
        return _OUT_OF_VIEWPORT;
    }
};

ObjectOfTrack.prototype.onViewportChange = function(minX, maxX, minY, maxY, forcePlot, highlight, isResizing) {
    //console.log('onViewportChange');
    let self = this;
    let viewportX = this.getViewportX();
    let maxViewportY = this.getViewportY()[1];
    let transformY = this.getTransformY();

    minX = minX || d3.min(viewportX);
    maxX = maxX || d3.max(viewportX);

    this.objectContainer
            .style('x', minX)
            .style('top', minY)
            .style('width', maxX - minX)
            .style('height', maxY - minY);

    let viewportStatus = self.getStatusOfViewport();
    self.changeStatusOfViewport(viewportStatus, isResizing);

    let top = minY;
    let height = maxY - minY;
    switch(viewportStatus) {
        case _OVERFLOW_VIEWPORT_TOP:
            top = -minY;
            height = maxY;
            break;
        case _OVERFLOW_VIEWPORT_TOP_BOTTOM:
            top = -minY;
            height = maxViewportY;
            break;
        case _OVERFLOW_VIEWPORT_BOTTOM:
            top = 0;
            height = maxViewportY - minY;
            break;
        case _INSIDE_VIEWPORT:
            top = 0;
            height = maxY - minY;
            break;
        case _OUT_OF_VIEWPORT: 
            top = 0;
            height = 0;
            break;
    }

    switch(self.currentDraw) {
        case 'Histogram':
            self.objectContainer
                    .select('.vi-object-histogram')
                        .style('overflow', 'hidden')
                        .style('top', top)
                        .style('height', height);
            break;
        case 'Crossplot':
            self.objectContainer
                    .select('.vi-object-crossplot')
                        .style('overflow', 'hidden')
                        .style('top', top)
                        .style('height', height);
            break;
    }

    self.tooltip
        .style('top', top)
        .style('height', height);

    if(forcePlot) {
        if (this.viHistogram) {
            this.viHistogram.doPlot();
        } else if(this.viCrossplot) {
            this.viCrossplot._doPlot();
        }
    }
}

ObjectOfTrack.prototype.changeStatusOfViewport = function(newStatus, isResizing){
    let self = this;
    if(!self.lastViewportSatus || self.lastViewportSatus != newStatus) {
        self.lastViewportSatus = newStatus;
        self.enableAllState();
        switch (newStatus) {
            case _OVERFLOW_VIEWPORT_TOP:
                self.objectContainer.style('border-top', 'none');
                if(self.objectContainer.classed('ui-resizable') && !isResizing) {
                    $(self.objectContainer.node()).resizable("option", "handles", "s");
                }
                break;
            case _INSIDE_VIEWPORT:
                
                break;
            case _OVERFLOW_VIEWPORT_BOTTOM:
                self.objectContainer.style('border-bottom', 'none');
                if(self.objectContainer.classed('ui-resizable') && !isResizing) {
                    $(self.objectContainer.node()).resizable("option", "handles", "n");
                }
                break;
            case _OVERFLOW_VIEWPORT_TOP_BOTTOM:
                self.objectContainer.style('border-top', 'none');
                self.objectContainer.style('border-bottom', 'none');
                if(self.objectContainer.classed('ui-resizable') && !isResizing) {
                    $(self.objectContainer.node()).resizable("disable");
                }
                break;
            case _OUT_OF_VIEWPORT:
                break;
        }
    } else {
        return;
    }
};

ObjectOfTrack.prototype.enableAllState = function(){
    this.objectContainer.style('border-top', '1px solid blue');
    this.objectContainer.style('border-bottom', '1px solid blue');
    if(this.objectContainer.classed('ui-resizable')) {
        if($(this.objectContainer.node()).resizable( "option", "disabled" )) {
            $(this.objectContainer.node()).resizable("enable");
        }   
        $(this.objectContainer.node()).resizable("option", "handles", "n, s");
    }
};

ObjectOfTrack.prototype.refreshObjectOfTrack = function(newProp, wiApiService, callback) {
    let self = this;    
    switch (this.currentDraw) {
        case 'Histogram':
            var __props = newProp;
            if(__props) {
                self.viHistogram.histogramModel.properties = __props;
                self.setProperties(__props);
            } else {
              __props = self.viHistogram.histogramModel.properties;
            }

            if(__props.curve && __props.curve.rawData) {
                self.viHistogram.setCurve(__props.curve.rawData);
                self.viHistogram.histogramModel.properties.curveId = __props.curve.idCurve;
            }

            if(__props.intervalDepthTop != self.startDepth || __props.intervalDepthBottom != self.endDepth) {
                self.startDepth = __props.intervalDepthTop;
                self.endDepth = __props.intervalDepthBottom;
                self.doPlot(true, true);
            } else {
                self.viHistogram.doPlot();
            }

            wiApiService.editObjectOfObjectTrack(self.exportsProperties(), function() {
                console.log("Object edited");
                let histogramPropsToRequest = angular.copy(self.viHistogram.histogramModel.properties);
                histogramPropsToRequest.idCurve = self.viHistogram.histogramModel.properties.curveId;
                delete histogramPropsToRequest.curve;
                delete histogramPropsToRequest.curveId;
                delete histogramPropsToRequest.discriminator;
                wiApiService.editHistogram(histogramPropsToRequest, function(histogramEdited) {
                    console.log("Histogram edited", histogramEdited);
                    if(callback) callback();
                })
            });
            break;
        case 'Crossplot': 
            var __props = newProp;
            if(__props) {
                self.viCrossplot.pointSet = __props;

            } else {
                __props = self.viCrossplot.pointSet;
            }
            wiApiService.editCrossplot({
                idCrossPlot: self.viCrossplot.idCrossPlot,
                name: __props.name || self.name,
                idWell: self.viCrossplot.idWell
            }, function(returnedCrossplot) {
                if(!returnedCrossplot.idCrossPlot) {
                    alert("Error when edit crossplot!");
                    return;
                }
                console.log("crossplot edited ", returnedCrossplot);
                self.viCrossplot.setProperties(returnedCrossplot);
                            self.setProperties({
                    name: __props.name
                })
                if(__props.intervalDepthTop != self.startDepth || 
                    __props.intervalDepthBottom != self.endDepth ||
                    (__props.background && __props.background != self.background)) {
                    self.startDepth = __props.intervalDepthTop;
                    self.endDepth = __props.intervalDepthBottom;
                    if(__props.background) {
                        self.background = __props.background;
                    }
                    self.doPlot(true, true);
                } else {
                    self.viCrossplot._doPlot();
                }

                wiApiService.editObjectOfObjectTrack(self.exportsProperties(), function() {
                    console.log("Object edited");
                    let pointSetProps = angular.copy(self.viCrossplot.pointSet);
                    delete pointSetProps.curveX;
                    delete pointSetProps.curveY;
                    delete pointSetProps.curveZ;
                    delete pointSetProps.background;
                    delete pointSetProps.name;

                    wiApiService.editPointSet(pointSetProps, function(returnedPointSet) {
                        console.log("pointSet edited ", returnedPointSet);
                        if(callback) {
                            callback();
                        }
                    });
                });
            });
            break;
        default:
            break;
    }
}

ObjectOfTrack.prototype.handleQuest = function(quest, wellProp) {
    if(!quest || !quest.name) return;
    switch(quest.name) {
        case 'addHistogram':
            console.log("Well properties: ", wellProp);
            console.log("Quest config: ", quest.config);
            this.createHistogramToForeignObject(quest.config, wellProp);
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