let visUtils = require('./visualize-utils');
let utils = require('./../utils');
module.exports = Track;

/**
 * Represent a general track
 * @constructor
 */
function Track(config) {
    // this.HEADER_NAME_COLOR = '#88CC88';
    this.HEADER_NAME_COLOR = '#ccc';
    this.HEADER_ITEM_BORDER_WIDTH = 1;
    this.HEADER_ITEM_MARGIN_BOTTOM = 1;
    this.HEADER_HIGHLIGHT_COLOR = 'rgb(255, 215, 215)';
    //this.BODY_CONTAINER_HEIGHT = 340;
    this.HEADER_CONTAINER_HEIGHT = 100;
    this.HORIZONTAL_RESIZER_HEIGHT = 5;
    this.BODY_CONTAINER_HEIGHT = 70;
    this.BODY_HIGHLIGHT_COLOR = '#ffffe0';
    this.BODY_DEFAULT_COLOR = 'transparent';
    this.MIN_WIDTH = 0;

    this.orderNum = config.orderNum;
    this.bgColor = config.bgColor || this.BODY_DEFAULT_COLOR;
    this.yStep = config.yStep || 1;
    this.offsetY = config.offsetY || 0;
    this.type = visUtils.pascalCaseToLowerDash(this.constructor.name);
    this.justification = config.justification || 'center';
    this.showTitle = (config.showTitle == null) ? true : config.showTitle;

    this.xPadding = config.xPadding || this.DEFAULT_X_PADDING;
    this.yPadding = config.yPadding || this.DEFAULT_Y_PADDING;

    this.zoomFactor = config.zoomFactor || 1.0;
    this._shouldRescaleWindowY = true;

    this.minY = config.minY;
    this.maxY = config.maxY;
}

Track.prototype.DEFAULT_X_PADDING = 0;
Track.prototype.DEFAULT_Y_PADDING = 0;

/**
 * Check if class of this instance is LogTrack
 * @returns {Boolean}
 */
Track.prototype.isLogTrack = function() {
    return this.constructor.name == 'LogTrack';
}

/**
 * Check if class of this instance is DepthTrack
 * @returns {Boolean}
 */
Track.prototype.isDepthTrack = function() {
    return this.constructor.name == 'DepthTrack';
}

/**
 * Check if class of this instance is ImageTrack
 * @returns {Boolean}
 */
Track.prototype.isImageTrack = function () {
    return this.constructor.name == 'ImageTrack';
}

/**
 * Check if class of this instance is ZoneTrack
 * @returns {Boolean}
 */
Track.prototype.isZoneTrack = function() {
    return this.constructor.name == 'ZoneTrack';
}

/**
 * Check if class of this instance is ObjectTrack
 * @returns {Boolean}
 */
Track.prototype.isObjectTrack = function() {
    return this.constructor.name == 'ObjectTrack';
}

/**
 * Set background color for the track
 * @param {String} color - CSS color string
 */
Track.prototype.setBackgroundColor = function(color) {
    this.trackContainer
        .style('background-color', color)
}

/**
 * Initialize DOM elements
 * @param {Object} domElem - The DOM elements to contain the track
 */
Track.prototype.init = function(domElem) {
    this.root = d3.select(domElem);
    this.createContainer();
    this.createHeaderContainer();
    this.createHorizontalResizer();
    this.createVerticalResizer();
    this.createBodyContainer();
}

/**
 * Create outer-most DOM element containing the track
 */
Track.prototype.createContainer = function() {
    this.trackContainer = this.root.append('div')
        .datum(this.orderNum)
        .attr('class', 'vi-track-container')
        .attr('tabindex', isNaN(this.orderNum) ? -1 : this.orderNum)
        .attr('data-order-num', function(d) { return d; })
        .style('width', this.width + 'px')
        .style('display', 'flex')
        .style('flex-direction', 'column')
        .style('outline', 'none')
        //.style('margin-left', '-3px');
}
Track.prototype.updateOrderNum = function() {
    this.trackContainer.datum(this.orderNum)
        .attr('tabindex', isNaN(this.orderNum) ? -1 : this.orderNum)
        .attr('data-order-num', function(d) { return d; })
        .style('width', this.width + 'px')
        .style('display', 'flex')
        .style('flex-direction', 'column')
        .style('outline', 'none');
    this.verticalResizer.datum(this.orderNum + "*")
        .attr('class', 'vi-track-vertical-resizer')
        .attr('data-order-num', function(d) {return d;})
        .style('width', '5px')
        .style('cursor', 'col-resize');

    // component node
    d3.select(this.root.node().parentNode).datum(this.orderNum)
        .attr('data-order-num', function (d) {return d; });
}
/**
 * Create DOM element containing header
 */
Track.prototype.createHeaderContainer = function() {
    let self = this;

    this.headerContainer = this.trackContainer.append('div')
        .attr('class', 'vi-track-header-container')
        .style('background-color', 'white')
        .style('position', 'relative')
        // .style('z-index', 11)
        .style('width', '100%')
        .style('flex', 1)
        .style('overflow', 'hidden')
        .style('text-align', 'center');

    this.headerNameBlock = this.headerContainer.append('div')
        .attr('class', 'vi-track-header-name')
        .style('display', this.showTitle ? 'block' : 'none')
        .style('text-align', this.justification)
        .style('position', 'relative')
        .style('background-color', this.HEADER_NAME_COLOR)
        .style('border-bottom', this.HEADER_ITEM_BORDER_WIDTH + 'px solid black')
        .style('margin-bottom', this.HEADER_ITEM_MARGIN_BOTTOM + 'px')
        .style('z-index', 1)
        .style('white-space', 'nowrap')
        .html(this.name)
        .on('mousedown', function(d) {
        })
        .on('mouseup', function(d) {
        });

    this.drawingHeaderContainer = this.headerContainer.append('div')
        .attr('class', 'vi-track-drawing-header-container')
        .style('position', 'absolute')
        .style('top', this.headerNameBlock.node().clientHeight + this.HEADER_ITEM_BORDER_WIDTH + this.HEADER_ITEM_MARGIN_BOTTOM + 'px')
        .style('width', 'calc(100% - 2px)')
        .style('margin', '0 1px')
        .lower()
        .on('mousewheel', function() {
            //if (d3.event.shiftKey) {
                self.headerScrollCallback();
            //}
        })
        .on('mousedown', function() {
            d3.event.preventDefault();
            d3.event.stopPropagation();
            self.trackContainer.node().focus();
        })
        // .call(d3.drag()
        //     .on('drag', function() {
        //         self.headerScrollCallback();
        //     })
        // );
}

/**
 * Create DOM element containing body
 */
Track.prototype.createBodyContainer = function() {
    // let existedPlot = this.rootNode
    //     .select('.vi-track-body-container');

    let existedPlot = d3.select(this.root.node().parentNode.parentNode.parentNode)
        .select('.vi-track-body-container');

    this.bodyContainer = this.trackContainer.append('div')
        .attr('class', 'vi-track-body-container')
        .style('position', 'relative')
        .style('height', `calc(100% - ${this.HEADER_CONTAINER_HEIGHT + this.HORIZONTAL_RESIZER_HEIGHT}px)`);

    this.plotContainer = this.bodyContainer.append('div')
        .attr('class', 'vi-track-plot-container')
        .style('position', 'absolute');
        // .style('z-index', 1);

    if (!existedPlot.empty()) {
        this.bodyContainer
            .style('height', existedPlot.style('height'));
    }
}

/**
 * Create vertical resizer to resize track width
 */
Track.prototype.createVerticalResizer = function() {
    let minWidth = this.MIN_WIDTH;
    let compensator;
    let self = this;

    this.verticalResizer = this.root.append('div')
        .datum(this.orderNum + "*")
        .attr('class', 'vi-track-vertical-resizer')
        .attr('data-order-num', function (d) { return d; })
    this.verticalResizer.append('div');
}

/**
 * Function to call when vertical resizer is dragged
 */
Track.prototype.onVerticalResizerDrag = function (cb) {
    let minWidth = this.MIN_WIDTH;
    let compensator;
    let self = this;
    this.verticalResizer.call(d3.drag()
        .on('start', function () {
            compensator = 0;
        })
        .on('drag', function () {
            compensator += d3.event.dx;
            if ((self.width + compensator) > minWidth) {
                self.width += compensator;
                compensator = 0;
                self.trackContainer.style('width', self.width + 'px');
                self.doPlot();
            }
        }).on('end', function () {
            cb();
        }));
}

/**
 * Create horizontal resiser to resize track height
 */
Track.prototype.createHorizontalResizer = function() {
    let self = this;
    this.horizontalVertical = this.trackContainer.append('div')
        .attr('class', 'vi-track-horizontal-resizer')
        .style('height', this.HORIZONTAL_RESIZER_HEIGHT + 'px')
        .style('background-color', '#e1e1e1')
        .style('width', '100%')
        .style('cursor', 'row-resize')
        .call(d3.drag()
            .on('drag', function() {
                self.horizontalResizerDragCallback();
            })
        );
}

/**
 * Function to call when the horizontal resizer is dragged
 */
Track.prototype.horizontalResizerDragCallback = function() {
    let plotHeight = this.bodyContainer
        .node()
        .clientHeight;

    this.bodyContainer
        .style('height', (plotHeight - d3.event.dy) + 'px');

    this.headerScrollCallback();
    this.doPlot();
}

/**
 * Function to call when header is scrolled
 */
Track.prototype.headerScrollCallback = function() {
    let rowHeight = this.headerNameBlock.node().clientHeight;
    let extraHeight = this.HEADER_ITEM_BORDER_WIDTH + this.HEADER_ITEM_MARGIN_BOTTOM;

    //let dy = d3.event.dy || (Math.sign(d3.event.deltaY) > 0 ? -(rowHeight+extraHeight)*2: (rowHeight+extraHeight)*2);
    let step = this.headerContainer.node().clientHeight/5.;
    let dy = d3.event.dy || (Math.sign(d3.event.deltaY) > 0 ? (0 - step) : step);
    let top = parseInt(this.drawingHeaderContainer.style('top').replace('px', '')) + dy;
    let maxTop = rowHeight + extraHeight;
    let minTop = this.headerContainer.node().clientHeight - this.drawingHeaderContainer.node().clientHeight + extraHeight - 3;

    top = minTop < maxTop ? visUtils.clip(top, [minTop, maxTop]) : maxTop;
    this.drawingHeaderContainer
        .style('top', top + 'px');
}

/**
 * Register event when dragging horizontal resizer
 */
Track.prototype.onHorizontalResizerDrag = function(cb) {
    let self = this;
    this.horizontalVertical.call(d3.drag().on('drag', function(){
        cb();
        self.horizontalResizerDragCallback();
    }))
}

/**
 * Register event when drag track
 */
Track.prototype.onTrackDrag = function(callbackDrop) {
    let self = this;
    let width;
    function onTrackDropHandler(event) {
        if (self == event.desTrack) {
            console.log('drop into yourself');
            return;
        }
        callbackDrop(event.desTrack);
    }
    $(this.trackContainer.node()).draggable({
    // $(this.root.node().parentNode).draggable({
        axis: 'x',
        containment: $(this.root.node().parentNode.parentNode.parentNode),
        helper: function () {
            return $(self.headerNameBlock.node()).clone()
                .css({'z-index': 99, 'width': self.width, 'background-color': 'rgb(69, 129, 69)', 'box-shadow': '1px 1px 2px 2px rgba(0,0,0,0.2)', 'color': '#fff'});
        },
        distance: 10,
        handle: '.vi-track-header-name',
        snap: '.vi-track-container',
        scope: 'tracks',
        start: function (event, ui) {
            document.addEventListener('ontrackdrop', onTrackDropHandler);
        },
        stop : function () {
            document.removeEventListener('ontrackdrop', onTrackDropHandler);
        }
    });
    $(this.trackContainer.node()).droppable({
    // $(this.root.node().parentNode).droppable({
        accept: '.vi-track-container',
        tolerance: 'pointer',
        scope: 'tracks',
        drop: function (event, ui) {
            let onTrackDrop = new Event('ontrackdrop');
            onTrackDrop.desTrack = self;
            document.dispatchEvent(onTrackDrop);
        }
    });
}

/**
 * Destroy all DOM elements of the track
 */
Track.prototype.destroy = function() {
    this.trackContainer.remove();
    this.verticalResizer.remove();
}

/**
 * Function to call if the track is highlighted
 */
Track.prototype.highlightCallback = function() {
    this.highlight = true;
    this.setBackgroundColor(this.BODY_HIGHLIGHT_COLOR);
}

/**
 * Plot the track and children elements
 */
Track.prototype.doPlot = function(highlight) {
    if (highlight != null) this.highlight = highlight;
    this.trackContainer.style('width', this.width + 'px');
    if (this.highlight && (typeof this.highlightCallback == 'function')) this.highlightCallback();
    else this.setBackgroundColor(this.bgColor);
    this.updateHeader();
    this.updateBody();
}

/**
 * Get d3 decimal formatter function
 */
Track.prototype.getDecimalFormatter = function(decimal) {
    decimal = decimal < 0 ? 0 : decimal;
    return d3.format('.' + decimal + 'f');
}

/**
 * Register event for track container
 */
Track.prototype.on = function(type, cb) {
    if (!cb) return this.trackContainer.on(type);
    this.trackContainer.on(type, cb);
}

/**
 * Update header container
 */
Track.prototype.updateHeader = function() {
    let name = this.name 
        + (this.zoomFactor == 1 ? '' : (' (' + this.zoomFactor + 'x)'))
        + (this.wellName ? ('<strong>/' + this.wellName) + '</strong>':'');       

    this.headerNameBlock
        .style('display', this.showTitle ? 'block': 'none')
        .style('text-align', this.justification)
        .html(name);
}

Track.prototype.shouldRescaleWindowY = function() {
    return this._shouldRescaleWindowY;
}

/**
 * Update body container
 */
Track.prototype.updateBody = function() {
    let bodyRect = visUtils.getBoundingClientDimension(this.bodyContainer.node());

    let top = this.yPadding;
    let bottom = this.yPadding;
    let left = this.xPadding;
    let right = this.xPadding;

    if (!this.shouldRescaleWindowY()) {
        let middleY = bodyRect.height / 2;
        let vpY = [this.yPadding, bodyRect.height - this.yPadding];
        let newVpY0 = middleY - (middleY - vpY[0]) * this.zoomFactor / this._maxZoomFactor;
        let newVpY1 = middleY + (vpY[1] - middleY) * this.zoomFactor / this._maxZoomFactor;
        top = newVpY0;
        bottom = bodyRect.height - newVpY1;
    }
    let rect = visUtils.getBoundingClientDimension(
            this.plotContainer
                .style('top', top + 'px')
                .style('bottom', bottom + 'px')
                .style('left', left + 'px')
                .style('right', right + 'px')
                .node()
        );

    this.plotContainer.selectAll('.vi-track-drawing')
        .attr('width', rect.width)
        .attr('height', rect.height);
}

/**
 * Get y window of the track
 * @returns {Array} Range of x values to show
 */
Track.prototype.getWindowY = function(lazy) {
    if (lazy && this._windowY) {
        return this._windowY;
    }

    let wdY = (this.minY != null && this.maxY != null)
        ? [this.minY, this.maxY]
        : [0, 10000];

    if (this.shouldRescaleWindowY()) {
        let middleY = wdY[0] + (wdY[1] - wdY[0]) / 2;
        wdY[0] = middleY - (middleY - wdY[0]) / this.zoomFactor;
        wdY[1] = middleY + (wdY[1] - middleY) / this.zoomFactor;
    }
    this._windowY = wdY;
    return wdY;
}


/**
 * Get y viewport of the track
 * @returns {Array} Range of transformed y values to show
 */
Track.prototype.getViewportY = function() {
    let vpY = [0, visUtils.getBoundingClientDimension(this.plotContainer.node()).height];

    return vpY;
}

/**
 * Get x viewport of the track
 * @returns {Array} Range of transformed x values to show
 */
Track.prototype.getViewportX = function() {
    return [0, visUtils.getBoundingClientDimension(this.plotContainer.node()).width];
}

/**
 * Get transform function for y coordinate
 */
Track.prototype.getTransformY = function() {
    return d3.scaleLinear()
        .domain(this.getWindowY())
        .range(this.getViewportY());
}

Track.prototype.genColor = function() {
    function rand(x) {
        return Math.floor(Math.random() * x);
    }

    const DEFAULT_COLORS = ['Blue', 'Brown', 'Green', 'DarkGoldenRod', 'DimGray', 'Indigo', 'Navy'];
    let usedColors = [];
    this.drawings.forEach(function(d) {
        if (!d.getAllColors) return;
        usedColors = usedColors.concat(d.getAllColors());
    });

    let color;
    for (let i = 0; i <= this.drawings.length; i++)  {
        if (i >= DEFAULT_COLORS.length) {
            do {
                color = d3.rgb(rand(255), rand(255), rand(255)).toString();
            }
            while (usedColors.indexOf(color) >= 0);
        }
        else color = d3.color(DEFAULT_COLORS[i]).toString();
        if (usedColors.indexOf(color) < 0) break;
    }
    return color;
}
// TUNG: move onPlotMouseWheel from subclass LogTrack to superclass Track,
//    so that other kinds of track can be scrollable
Track.prototype.onPlotMouseWheel = function(cb) {
    this.plotContainer
        .on('mousewheel', cb);
}

Track.prototype.prepareTicks = function() {
    let windowY = this.getWindowY();
    let transformY = this.getTransformY();

    let zoomFactor = this.shouldRescaleWindowY() ? this.zoomFactor : this.zoomFactor / this._maxZoomFactor;
    let inchStep = (transformY.invert(utils.getDpcm()) - windowY[0]) * zoomFactor;

    return d3.range(0, windowY[1], inchStep);

    // let range = windowY[1] - windowY[0];
    // let lower = Math.pow(10, Math.floor(Math.log(windowY[0]) / Math.log(10))); // 200 -> 100
    // let higher = Math.pow(10, Math.ceil(Math.log(windowY[1]) / Math.log(10))); // 200 -> 1000

    // let properMainTickNo = 3;
    // let multiplyByFive = false;
    // let mainTickNo, mainStep = higher;

    // do {
    //     mainStep /= 10;
    //     mainTickNo = range / mainStep;
    // }
    // while (mainTickNo < properMainTickNo);

    // if (mainTickNo > properMainTickNo + 2) {
    //     mainStep *= 5;
    //     mainTickNo = range / mainStep;
    //     multiplyByFive = true;
    // }

    // let zoomFactor = this.shouldRescaleWindowY() ? this.zoomFactor : this.zoomFactor / this._maxZoomFactor;
    // mainStep *= zoomFactor;

    // let mainTicks = d3.range(lower, higher, mainStep);

    // let inchStep = (transformY.invert(utils.getDpcm()) - windowY[0]) * zoomFactor;

    // let anchor, candidate1, candidate2;
    // for (let i = 0; i < mainTicks.length; i ++) {
    //     if (mainTicks[i] > windowY[0]) {
    //         candidate1 = mainTicks[i];
    //         candidate2 = mainTicks[i+1];
    //         break;
    //     }
    // }

    // if (!multiplyByFive)
    //     anchor = candidate1;
    // else {
    //     if ((candidate1 - lower) % (mainStep * 2) == 0) {
    //         anchor = candidate1;
    //     }
    //     else
    //         anchor = candidate2;
    // }

    // let leftHalf = d3.range(anchor, visUtils.roundDown(windowY[0], inchStep), -inchStep).reverse();
    // let rightHalf = d3.range(anchor + inchStep, visUtils.roundUp(windowY[1], inchStep) + inchStep / 2, inchStep);

    // return [
    //     leftHalf.concat(rightHalf).map(function(x) {
    //         return x.toFixed(6);
    //     }),
    //     mainTicks.map(function(x) {
    //         return x.toFixed(6);
    //     })
    // ];
}

/********************** THANG: move draw tooltip from subclass to superclass ******************/
Track.prototype.drawTooltipLines = function(depth, drawVertical) {
    let plotRect = visUtils.getBoundingClientDimension(this.plotContainer.node());
    let svg = this.svgContainer;
    let y = this.getTransformY()(depth);
    let x = d3.mouse(this.plotContainer.node())[0];
    let lineData = drawVertical ? [
        {x1: x, y1: 0, x2: x, y2: plotRect.height},
        {x1: 0, y1: y, x2: plotRect.width, y2: y}
    ] : [
        {x1: 0, y1: y, x2: plotRect.width, y2: y}
    ];

    let lines = svg.selectAll('line.tooltip-line')
        .data(lineData);

    lines.enter().append('line')
        .attr('class', 'tooltip-line');

    lines
        .attr('x1', function(d) { return d.x1; })
        .attr('x2', function(d) { return d.x2; })
        .attr('y1', function(d) { return d.y1; })
        .attr('y2', function(d) { return d.y2; });
}

Track.prototype.removeTooltipLines = function() {
    this.svgContainer.selectAll('line.tooltip-line').remove();
}

Track.prototype.drawTooltipText = function(depth, showDepth) {
    let plotMouse = d3.mouse(this.plotContainer.node());
    let plotRect = visUtils.getBoundingClientDimension(this.plotContainer.node());
    let y = this.getTransformY()(depth);
    let svg = this.svgContainer;
	let self = this;

    svg.selectAll('text.tooltip-text, rect.tooltip-rect').remove();
    
	// remove tool tip when have nothing to show (prevent showing a tiny square in top-right corner of track)
	if((self.isLogTrack() && self.getCurves().length == 0) || (!self.isLogTrack() && !showDepth)) return;

	let tooltip = svg.append('text')
        .attr('class', 'tooltip-text')
        .attr('y', y);

	let yDecimal = this.yDecimal || 2;
    let yFormatter = this.getDecimalFormatter(yDecimal);
	
    let textData = showDepth ? [{
        text: 'Depth: ' + yFormatter(this.getTransformY().invert(y)),
        color: 'black'
    }] : [];
	if (this.getCurves) {
		this.getCurves().forEach(function(curve) {
			let xDecimal = self.xDecimal || 2;
			let xFormatter = self.getDecimalFormatter(xDecimal);
			let curveY = curve.getTransformY().invert(y);
			curveY = curve.offsetY + visUtils.round(curveY - curve.offsetY, curve.yStep);

			let value = curve.dataMap[curveY];
			value = value == null ? null : xFormatter(value);
			textData.push({
				text: curve.alias + ': ' + value,
				color: curve.line ? curve.line.color : (curve.symbol ? curve.symbol.fillStyle : 'black')
			});
		})
	}

    tooltip.selectAll('tspan')
        .data(textData)
        .enter()
        .append('tspan')
            .style('fill', function(d) { return d.color; })
            .attr('dy', '1.2em')
            .text(function(d) { return d.text; });

    let bbox = tooltip.node().getBBox();
    let offset = 20;
    let rectX = bbox.x + offset;
    let rectY = bbox.y - offset - bbox.height;

    if (rectY < 0) rectY = bbox.y + offset - 10;

    tooltip.attr('y', rectY).selectAll('tspan').attr('x', rectX);

    bbox = tooltip.node().getBBox();
    let padding = 2;
    let rect = svg.append('rect')
        .attr('class', 'tooltip-rect')
        .attr('y', bbox.y - padding)
        .attr('width', bbox.width + padding*2)
        .attr('height', bbox.height + padding*2);

    visUtils.alignSvg(rect, this.plotContainer, visUtils.ALIGN.RIGHT);
    let x = parseFloat(rect.attr('x')) + padding;
    tooltip.selectAll('tspan')
        .attr('x', x);
    visUtils.alignSvg(rect, this.plotContainer, visUtils.ALIGN.TOP);
    y = parseFloat(rect.attr('y'));
    tooltip.attr('y', y)

    tooltip.raise();
}

Track.prototype.removeTooltipText = function() {
    this.svgContainer.selectAll('text.tooltip-text, rect.tooltip-rect').remove();
}