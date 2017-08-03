let Utils = require('./visualize-utils');

module.exports = Track;

/**
 * Represent a general track
 * @constructor
 */
function Track(config) {
    this.HEADER_NAME_COLOR = '#88CC88';
    this.HEADER_ITEM_BORDER_WIDTH = 1;
    this.HEADER_ITEM_MARGIN_BOTTOM = 1;
    this.HEADER_HIGHLIGHT_COLOR = 'rgb(255,128,128)';
    this.BODY_CONTAINER_HEIGHT = 340;
    this.BODY_HIGHLIGHT_COLOR = '#ffffe0';
    this.BODY_DEFAULT_COLOR = 'transparent';
    this.MIN_WIDTH = 120;

    this.bgColor = config.bgColor || this.BODY_DEFAULT_COLOR;
    this.yStep = config.yStep || 1;
    this.offsetY = config.offsetY || 0;
    this.type = config.type || Utils.pascalCaseToLowerDash(this.constructor.name);
    this.justification = config.justification || 'center';
    this.showTitle = (config.showTitle == null) ? true : config.showTitle;
}

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
    return this.constructor.name = 'DepthTrack';
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
        .attr('class', 'vi-track-container')
        .style('width', this.width + 'px')
        .style('display', 'flex')
        .style('flex-direction', 'column');
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
        .style('border', this.HEADER_ITEM_BORDER_WIDTH + 'px solid black')
        .style('margin-bottom', this.HEADER_ITEM_MARGIN_BOTTOM + 'px')
        .style('z-index', 2)
        .text(this.name);

    this.drawingHeaderContainer = this.headerContainer.append('div')
        .attr('class', 'vi-track-drawing-header-container')
        .style('position', 'absolute')
        .style('top', this.headerNameBlock.node().clientHeight + this.HEADER_ITEM_BORDER_WIDTH*2 + this.HEADER_ITEM_MARGIN_BOTTOM + 'px')
        .style('width', '100%')
        .lower()
        .on('mousewheel', function() {
            self.headerScrollCallback();
        })
        .on('mousedown', function() {
            d3.event.preventDefault();
            d3.event.stopPropagation();
        })
        .call(d3.drag().on('drag', function() {
            self.headerScrollCallback();
        }));
}

/**
 * Create DOM element containing body
 */
Track.prototype.createBodyContainer = function() {
    let existedPlot = this.root
        .select('.vi-track-body-container');

    this.bodyContainer = this.trackContainer.append('div')
        .attr('class', 'vi-track-body-container')
        .style('position', 'relative')
        .style('height', this.BODY_CONTAINER_HEIGHT + 'px');

    this.plotContainer = this.bodyContainer.append('div')
        .attr('class', 'vi-track-plot-container')
        .style('position', 'absolute')
        .style('z-index', 1);

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
        .attr('class', 'vi-track-vertical-resizer')
        .style('width', '2px')
        .style('cursor', 'col-resize')
        .call(d3.drag()
            .on('start', function() {
                compensator = 0;
            })
            .on('drag', function() {
                compensator += d3.event.dx;
                if (( self.width + compensator ) > minWidth) {
                    self.width += compensator;
                    compensator = 0;
                    self.trackContainer.style('width', self.width + 'px');
                    self.doPlot();
                }
            })
        );
}

/**
 * Create horizontal resiser to resize track height
 */
Track.prototype.createHorizontalResizer = function() {
    let self = this;
    this.horizontalVertical = this.trackContainer.append('div')
        .attr('class', 'vi-track-horizontal-resizer')
        .style('height', '5px')
        .style('background-color', 'lightgray')
        .style('border-radius', '3px')
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
    let extraHeight = this.HEADER_ITEM_BORDER_WIDTH*2 + this.HEADER_ITEM_MARGIN_BOTTOM;

    let dy = d3.event.dy || (Math.sign(d3.event.deltaY) > 0 ? -(rowHeight+extraHeight)*2: (rowHeight+extraHeight)*2);
    let top = parseInt(this.drawingHeaderContainer.style('top').replace('px', '')) + dy;
    let maxTop = rowHeight + extraHeight;
    let minTop = this.headerContainer.node().clientHeight - this.drawingHeaderContainer.node().clientHeight + extraHeight;

    top = minTop < maxTop ? Utils.clip(top, [minTop, maxTop]) : maxTop;
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
    this.setBackgroundColor(this.BODY_HIGHLIGHT_COLOR);
}

/**
 * Plot the track and children elements
 */
Track.prototype.doPlot = function(highlight) {
    this.setBackgroundColor(this.BODY_DEFAULT_COLOR);
    if (highlight && (typeof this.highlightCallback == 'function'))
        this.highlightCallback();
}

/**
 *
 */
Track.prototype.getDecimalFormatter = function(decimal) {
    decimal = decimal < 0 ? 0 : decimal;
    return d3.format('.' + decimal + 'f');
}
