let Utils = require('./visualize-utils');
let Drawing = require('./visualize-drawing');
let CanvasHelper = require('./visualize-canvas-helper');
let gUtils = require('./../utils');

module.exports = Zone;

Utils.extend(Drawing, Zone);

function Zone(config) {
    Drawing.call(this, config);

    this.id = config.idZone || config.id;
    this.idZoneSet = config.idZoneSet;
    this.idZoneTrack = config.idZoneTrack;
    this.fill = Utils.isJson(config.zone_template) ? JSON.parse(config.zone_template) : config.zone_template;

    this.name = config.zone_template ? config.zone_template.name : (config.name ? config.name:'Zone');
    this.showName = config.showName == null ? true : config.showName;

    this.startDepth = config.startDepth;
    this.endDepth = config.endDepth;

    this.scaleLeft = config.scaleLeft;
    this.scaleRight = config.scaleRight;

    this.params = config.params || [];
}

Zone.prototype.getProperties = function() {
    return {
        idZone: this.id,
        idZoneSet: this.idZoneSet,
        idZoneTrack: this.idZoneTrack,
        name: this.name,
        showName: this.showName,
        startDepth: this.startDepth,
        endDepth: this.endDepth,
        zone_template: this.fill
    }
}

Zone.prototype.setProperties = function(props) {
    Utils.setIfNotNull(this, 'id', props.idZone);
    Utils.setIfNotNull(this, 'idZoneSet', props.idZoneSet);
    Utils.setIfNotNull(this, 'idZoneTrack', props.idZoneTrack);
    Utils.setIfNotNull(this, 'name', props.name);
    Utils.setIfNotNull(this, 'showName', props.showName);
    Utils.setIfNotNull(this, 'startDepth', props.startDepth);
    Utils.setIfNotNull(this, 'endDepth', props.endDepth);
    Utils.setIfNotNull(this, 'fill', Utils.isJson(props.zone_template) ? JSON.parse(props.zone_template) : props.zone_template);
    Utils.setIfNotNull(this, 'params', props.params);
    Utils.setIfNotNull(this, 'scaleLeft', props.scaleLeft);
    Utils.setIfNotNull(this, 'scaleRight', props.scaleRight);

    if (this.startDepth > this.endDepth) {
        let tmp = this.startDepth;
        this.startDepth = this.endDepth;
        this.endDepth = tmp;
    }
}

Zone.prototype.getWindowX = function() {
    return [this.scaleLeft, this.scaleRight];
}

Zone.prototype.getTransformX = function() {
    let windowX = this.getWindowX();
    let rangeX = this.getViewportX();
    return d3.scaleLinear()
            .domain(windowX)
            .range(rangeX);
}

Zone.prototype.init = function(plotContainer) {
    Drawing.prototype.init.call(this, plotContainer);
    let self = this;

    this.svgContainer = plotContainer.select('.vi-track-svg-container');
    this.svgGroup = this.svgContainer.append('g')
        .classed('vi-zone-svg-group', true);


    this.patternDefs = this.svgGroup.append('defs')
        .append('pattern')
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('width', 128)
        .attr('height', 128);

    this.patternGroup = this.patternDefs.append('g');
    this.rect = this.svgGroup.append('rect');
    this.lines = this.svgGroup.selectAll('line.vi-zone-line')
        .data(['', ''])
        .enter()
        .append('line')
        .attr('class', 'vi-zone-line');

    this.lines.call(d3.drag()
        .on('drag', function() {
            self.lineDragCallback(d3.select(this));
        })
    );
    this.textRect = this.svgGroup.append('rect')
        .attr('class', 'vi-zone-text-rect');
    this.text = this.svgGroup.append('text')
        .attr('class', 'vi-zone-text')
        .attr('font-size', 10);

    if(this.params) {
        this.controlLineContainer = this.svgContainer.append('g')
            .attr('class', 'vi-zone-control-line-container');

        this.controlLines = this.controlLineContainer.selectAll('line.vi-zone-control-line')
            .data(self.params || [])
            .enter()
            .append('line')
                .attr('class', 'vi-zone-control-line')
                .attr('stroke', gUtils.colorGenerator())
                .attr('stroke-width', '2')
                .style('cursor', 'col-resize');
    }
}

Zone.prototype.onControlinesDrag = function(cb) {
    let lastOpacity = null;
    if(this.controlLines) {
        let self = this;
        this.controlLines.call(d3.drag()
            .on('drag', function() {
                self.controlLineDragCallback(d3.select(this), cb);
                self.drawControlLineText([d3.select(this).datum()]);
            })
            .on('end', function() {
                self.drawControlLineText([]);
            }))
    }
}

Zone.prototype.drawControlLineText = function(params) {
    if(!this.controlLineContainer || !this.controlLines) return;
    let self = this;
    let transformY = this.getTransformY();
    let transformX = this.getTransformX();
    let yValue = d3.event.y ? d3.event.y : transformY(self.startDepth);
    let textGroup =  this.controlLineContainer.selectAll('g.vi-zone-control-line-text').data(params);
    // enter
    let group = textGroup.enter()
                    .append('g')
                    .attr('class', 'vi-zone-control-line-text');
    group.append('text')
            .attr('text-anchor', 'middle');
    group.append('rect')
        .attr('height', '2em')
        .attr('fill', '#f4ce42')
        .attr('stroke', 'black')
        .attr('stroke-width', 1);

    textGroup.select('text')
            .attr('y', yValue - 10)
            .attr('dx', d => transformX(d.value))
            .html(d => d.label);
    let textBBox = textGroup.select('text').node() ? textGroup.select('text').node().getBBox():{width: 40, height: 20};
    textGroup.select('rect')
        .attr('width', textBBox.width + 10)
        .attr('y', yValue - textBBox.height - 13)
        .attr('x', d => transformX(d.value) - textBBox.width/2 - 5)
        .lower();

    textGroup.exit()
        .remove();
}

Zone.prototype.controlLineDragCallback = function(controlLine, cb) {
    let self = this;
    let transformX = self.getTransformX();
    let xValue = d3.mouse(self.root.node())[0];
    controlLine
        .attr('x1', xValue)
        .attr('x2', xValue);
    let datum = controlLine.datum();
    let param = self.params.find(p => p.label == datum.label);
    param.value = transformX.invert(xValue);
    cb(param);
}

Zone.prototype.doPlot = async function(highlight) {
    if (this.startDepth == null || this.endDepth == null) return;
    let self = this;

    let transformY = this.getTransformY();
    let viewportX = this.getViewportX();

    let minY = transformY(this.startDepth);
    let maxY = transformY(this.endDepth);
    let minX = d3.min(viewportX);
    let maxX = d3.max(viewportX);

    if (Number.isNaN(minY) || Number.isNaN(maxY)) return;

    this.lines
        .data([
            { x1: minX, y1: minY, x2: maxX, y2: minY },
            { x1: minX, y1: maxY, x2: maxX, y2: maxY }
        ])
        .attr('x1', function(d) { return d.x1; })
        .attr('x2', function(d) { return d.x2; })
        .attr('y1', function(d) { return d.y1; })
        .attr('y2', function(d) { return d.y2; })
        .attr('stroke', 'black')
        .attr('stroke-width', highlight ? 3 : 1)
        .attr('stroke-dasharray', highlight ? '5, 5' : '');

    this.rect
        .attr('x', minX)
        .attr('y', minY)
        .attr('width', maxX - minX)
        .attr('height', maxY - minY)
        .attr('fill', await this.createFillStyle());

    if(this.controlLines) {
        let transformX = this.getTransformX();
        let controlLines = this.controlLines.data(self.params || [])
        controlLines
            .enter()
            .append('line')
                .attr('class', 'vi-zone-control-line')
                .attr('stroke', 'black')
                .attr('stroke-width', '1.5')
                .style('cursor', 'col-resize');
        controlLines
            .attr('x1', d => transformX(d.value))
            .attr('x2', d => transformX(d.value))
            .attr('y1', minY)
            .attr('y2', maxY)
        controlLines
            .exit()
            .remove();
    }

    this.updateHeader();
    this.updateText();
}

Zone.prototype.updateText = function() {
    this.text
        .style('display', this.showName ? 'block' : 'none')
        .text(this.name);
    this.textRect
        .style('display', this.showName ? 'block' : 'none');

    let textRect = this.text.node().getBBox();
    let rect = this.rect.node().getBBox();

    let x = rect.x + (rect.width - textRect.width) / 2;
    let y = rect.y + (rect.height - textRect.height) / 2;
    let paddingBottom = 5;

    if (y < rect.y || y + textRect.height + paddingBottom > rect.y + rect.height) {
        this.text.style('display', 'none');
        this.textRect.style('display', 'none');
    }

    this.text
        .attr('x', x)
        .attr('y', y + textRect.height);
    this.textRect
        .attr('x', x)
        .attr('y', y)
        .attr('width', textRect.width)
        .attr('height', textRect.height + paddingBottom)
        .attr('fill', '#fff');
}
/*Zone.prototype.createFillStyle = function() {
    if (!this.fill || !this.fill.pattern) return null;
    let pattern = this.fill.pattern;
    if (pattern.name == 'none') return pattern.background;

    let src = CanvasHelper.RAW_PATTERNS[Utils.lowercase(pattern.name)];
    if (!src) return null;

    let patId = this.createPatternId(pattern);
    let patUrl = 'url(#' + patId + ')';
    if (patId == this.patternDefs.attr('id')) {
        return patUrl;
    }

    if (pattern.foreground)
        src = src.replace(/(stroke=")\w+(")/, '$1'+pattern.foreground+'$2');
    if (pattern.background)
        src = src.replace(/(fill=")\w+(")/, '$1'+pattern.background+'$2');
    this.patternDefs.selectAll('image').remove();
    this.patternDefs.attr('id', patId)
        .append('image')
        .attr('xlink:href', src)
        .attr('width', 16)
        .attr('height', 16);

    return patUrl;
}*/
Zone.prototype.createFillStyle = async function() {
    let wiPatternService = gUtils.getPatternService();
    let patternList = gUtils.getListPattern();
    // if (!this.fill || !this.fill.pattern) return null;
    if(!this.fill) return null;
    let pattern = this.fill.pattern;
    // if (pattern.name == 'none') return pattern.background;
    if(!pattern || pattern === 'none') return this.fill.background;

    // let src = patternList[pattern.name].src;
    let src = (patternList[pattern] || {}).src;
    if (!src) return null;

    let patId = this.createPatternId(pattern);
    let patUrl = 'url(#' + patId + ')';
    if (patId == this.patternDefs.attr('id')) {
        return patUrl;
    }
    let canvas = document.createElement('canvas');

    canvas.width = 128;
    canvas.height = 128;

    let context = canvas.getContext('2d'); 
    // let _pattern = await wiPatternService.createPatternSync(context, pattern.name, pattern.foreground, pattern.background);
    let _pattern = await wiPatternService.createPatternSync(context, this.fill.pattern, this.fill.foreground, this.fill.background);
    context.fillStyle = _pattern;
    context.fillRect(0, 0, 128, 128);

    let dataUrl = canvas.toDataURL();

    this.patternDefs.selectAll('image').remove();
    this.patternDefs.attr('id', patId)
        .append('image')
        .attr('xlink:href', dataUrl)
        .attr('width', 128)
        .attr('height', 128);

    return patUrl;
}

Zone.prototype.on = function(type, cb) {
    this.svgGroup.on(type, cb);
}

Zone.prototype.getAllColors = function() {
    if (!this.fill || !this.fill.pattern) return [];
    return [this.fill.pattern.background];
}

Zone.prototype.createPatternId = function(pattern) {
    if(!this.suffix) this.suffix = Date.now().toString();
    return 'vi-zone-pattern-' + this.id + '-' + btoa(pattern.name + '-' + pattern.background + '-' + pattern.foreground) + this.suffix;
}

Zone.prototype.updateHeader = async function() {
    Drawing.prototype.updateHeader.call(this);
    if (!this.header) return;
    let rect = this.header.node().getBoundingClientRect();
    let headerBorderWidth = parseInt(this.header.style('border-width'));

    let width = rect.width - headerBorderWidth - 1;
    let height = rect.height - headerBorderWidth - 1;

    if(width < 0 || height < 0) {
        return;
    }

    if (width < 0 || height < 0) return;

    let fillArea = this.header.select('.vi-drawing-header-fill')
        .attr('width', width)
        .attr('height', height);

    fillArea.selectAll('rect').remove();
    let fill = await this.createFillStyle();
    fillArea
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', height)
        .attr('fill', fill);

    this.header.datum(this.startDepth);
}

Zone.prototype.lineDragCallback = function(line) {
    let y = d3.mouse(this.root.node())[1];
    let transformY = this.getTransformY();
    line
        .attr('y1', y)
        .attr('y2', y);

    let newYs = [];
    this.lines.each(function() {
        newYs.push(parseFloat(d3.select(this).attr('y1')));
    });

    let minY = d3.min(newYs);
    let maxY = d3.max(newYs);

    this.rect
        .attr('y', minY)
        .attr('height', maxY - minY);

    if(this.controlLines) {
        this.controlLines
            .attr('y1', minY)
            .attr('y2', maxY);
    }

    this.startDepth = transformY.invert(minY);
    this.endDepth = transformY.invert(maxY);
    this.updateText();
}

Zone.prototype.onLineDragEnd = function(cb) {
    let self = this;
    this.lines.call(d3.drag()
        .on('drag', function() {
            self.lineDragCallback(d3.select(this));
        })
        .on('end', cb)
    );
}
