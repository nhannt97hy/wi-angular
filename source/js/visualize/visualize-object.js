let Utils = require('./visualize-utils');
let Drawing = require('./visualize-drawing');
let CanvasHelper = require('./visualize-canvas-helper');
let graph = require('./visualize');


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

            objectToSave.leftScale = histogramProps.leftScale;
            objectToSave.rightScale = histogramProps.rightScale;
            objectToSave.plot = histogramProps.plot;
            objectToSave.curveId = histogramProps.curveId;
            objectToSave.yStep = histogramProps.yStep;
            objectToSave.plotType = histogramProps.plotType;
            objectToSave.showGaussian = histogramProps.showGaussian;
            objectToSave.showGrid = histogramProps.showGrid;
            objectToSave.showCumulative = histogramProps.showCumulative;
            objectToSave.name = histogramProps.name;
            objectToSave.background = this.background;
            objectToSave.color = histogramProps.color;
            objectToSave.divisions = histogramProps.divisions;
            objectToSave.loga = histogramProps.loga;
            objectToSave.topDepth = this.viHistogram.startDepth;
            objectToSave.bottomDepth = this.viHistogram.endDepth;

            break;
        case 'Crossplot':
            objectToSave.type = "Crossplot";
            let pointSet = this.viCrossplot.pointSet;

            objectToSave.idCrossPlot = this.viCrossplot.idCrossPlot;
            objectToSave.idPointSet = pointSet.idPointSet;
            objectToSave.name = this.name;
            objectToSave.background = this.background;
            objectToSave.idWell = this.viCrossplot.idWell;
            /*
            objectToSave.idCurveX = pointSet.idCurveX;
            objectToSave.idCurveY = pointSet.idCurveY;
            objectToSave.majorX = pointSet.majorX;
            objectToSave.minorX = pointSet.minorX;
            objectToSave.majorY = pointSet.majorY;
            objectToSave.minorY = pointSet.minorY;
            objectToSave.scaleLeft = pointSet.scaleLeft;
            objectToSave.scaleRight = pointSet.scaleRight;
            objectToSave.scaleTop = pointSet.scaleTop;
            objectToSave.scaleBottom = pointSet.scaleBottom;
            objectToSave.numColor = pointSet.numColor;
            */
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

ObjectOfTrack.prototype.init = function(plotContainer, $scope, wiApiService) {
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
            containment: self.svgContainer.node().parentNode,
            axis: 'y',
        })
        .resizable({
            minHeight: 30,
            containment: self.svgContainer.node().parentNode,
            handles: "n, s",
        })
        .on('resize', function(event, ui) {
            self.showTootip(event, ui);
        })
        .on('drag', function(event, ui) {
            self.showTootip(event, ui);
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
            self.refreshObjectOfTrack(newProps, wiApiService);
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
            self.refreshObjectOfTrack(null, wiApiService);
            self.hideTooltip();
        });
    this.updateHeader();
}

ObjectOfTrack.prototype.showTootip = function(event, ui) {
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
                console.log("On resize", param, self.viHistogram);
                self.viHistogram.doPlot();
            } )
            break;
        case "Crossplot" :
            self.viCrossplot.resizeSensor.detach();
            self.viCrossplot.resizeSensor = new ResizeSensor($(self.viCrossplot.root.node()), function(param) {
                console.log("On resize", param, self.viCrossplot);
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
    /*
    console.log("before change: ", minY, maxY);
    console.log("depth: ", self.startDepth, self.endDepth);
    */
    if(event.type == "dragstop" || event.type == "drag") {
        if(ui.position.top < 0) {
            ui.position.top = 0;
        }
        let intervalDepth = self.endDepth - self.startDepth;
        self.startDepth = transformY.invert(ui.position.top);
        self.endDepth = self.startDepth + intervalDepth;
    } else if(event.type == "resizestop" || event.type == "resize") {
        let yChanged = ui.position.top - ui.originalPosition.top;

        if(yChanged) {
            // minY = maxY - ui.size.height;
            self.startDepth = transformY.invert(ui.position.top);
        } else {
            // maxY = minY + ui.size.height;
            self.endDepth = transformY.invert(ui.position.top + ui.size.height);
        }

        // self.startDepth = transformY.invert(minY);
        // self.endDepth = transformY.invert(maxY);
    }
    /*
    console.log("after change: ", minY, maxY);
    console.log("depth: ", self.startDepth, self.endDepth);
    */
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

function buildHistogramProps(config) {
    var histogramProps = {
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
        yStep: config.curve.yStep,
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
        properties: buildHistogramProps(config)
    }

    var domEle = this.objectContainer
            .append("div")
            .style('position', 'absolute')
            .style('overflow', 'hidden')
            .style('width', '100%')
            .style('height', '100%')
            .node();

    this.viHistogram = graph.createHistogram(histogramModel, parseFloat(config.curve.yStep), parseFloat(wellProp.topDepth), parseFloat(wellProp.bottomDepth), domEle);

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
            .style("height", "100%")
            .style('display', 'flex')
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

ObjectOfTrack.prototype.onViewportChange = function(minX, maxX, minY, maxY, forcePlot, highlight) {
    //console.log('onViewportChange');
    let self = this;
    let viewportX = this.getViewportX();
    let maxViewportY = this.getViewportY()[1];


    minX = minX || d3.min(viewportX);
    maxX = maxX || d3.max(viewportX);

    // get out of the viewport
    if(maxY > maxViewportY && minY > maxViewportY &&
        minY < 0 && maxY < 0) {
        return;
    }

    // special case
    if(( minY < 0 && maxY > 0 ) || ( maxY > maxViewportY + 1 && minY < maxViewportY )) {
        self.enableAllState();
        // change states
        if(minY < 0 && maxY > 0) {
            minY = 0;
            self.objectContainer.style('border-top', 'none');
            if(self.objectContainer.classed('ui-resizable')) {
                $(self.objectContainer.node()).resizable("option", "handles", "s");
            }
        }
        if(maxY > maxViewportY + 1 && minY < maxViewportY) {
            maxY = maxViewportY;
            self.objectContainer.style('border-bottom', 'none');
            if(self.objectContainer.classed('ui-resizable')) {
                if($(self.objectContainer.node()).resizable("option", "handles") == "s") {
                    $(self.objectContainer.node()).resizable("disable");
                } else {
                    $(self.objectContainer.node()).resizable("option", "handles", "n");
                }
            }
        }
        if(self.objectContainer.classed('ui-draggable')) {
            $(self.objectContainer.node()).draggable("disable");
        }
    } else {
        self.enableAllState();
    }

    this.objectContainer
            .style('x', minX)
            .style('top', minY)
            .style('width', maxX - minX)
            .style('height', maxY - minY);

    if(forcePlot) {
        if (this.viHistogram) {
            this.viHistogram.doPlot();
        } else if(this.viCrossplot) {
            this.viCrossplot._doPlot();
        }
    }
}

ObjectOfTrack.prototype.enableAllState = function(){
    this.objectContainer.style('border-top', '1px solid blue');
    this.objectContainer.style('border-bottom', '1px solid blue');

    if(this.objectContainer.classed('ui-draggable')) {
        if($(this.objectContainer.node()).draggable( "option", "disabled" )) {
            $(this.objectContainer.node()).draggable("enable");
        }
    }
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
            console.log("Histogram Props: ", quest.config);
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

function getRandomColor(alpha) {
    let red = Math.round(Math.random()*255);
    let green = Math.round(Math.random()*255);
    let blue = Math.round(Math.random()*255);
    return "rgba(" + red + ", " + green + ", " + blue + ", "+ alpha + ")";
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