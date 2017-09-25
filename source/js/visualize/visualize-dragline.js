let SvgHelper = require('./visualize-svg-helper');
let Utils = require('./visualize-utils');

module.exports = DragLine;

function DragLine(config) {
    this.setProperties(config);
}

DragLine.prototype.PROPERTIES = {
    points: {
        type: 'Array',
        item: {
            type: 'Object',
            properties: {
                x: { type: 'Float' },
                y: { type: 'Float' }
            }
        }
    },
    direction: {
        type: 'Enum',
        values: ['Vertical', 'Horizontal'],
        default: 'Vertical'
    }
}

DragLine.prototype.getProperties = function() {
    return Utils.getProperties(this);
}

DragLine.prototype.setProperties = function(props) {
    this.prevProps = Utils.getProperties(this);
    Utils.setProperties(this, props);
}

DragLine.prototype.init = function(svgBase) {
    let self = this;
    this.root = svgBase;

    this.svgGroup = svgBase.append('g')
        .classed('vi-dragline-group', true)
        .style('pointer-events', 'all');

    this.helper = new SvgHelper(this.svgGroup, {
        fillStyle: 'red',
        strokeStyle: 'black',
        lineWidth: 1,
        size: 4
    });

    this.dragFunc = d3.drag()
        .on('drag', function() {
            self.dragCallback();
        });

    this.svgGroup.call(this.dragFunc);
}

DragLine.prototype.needRePlot = function() {
    if (this.prevProps == {}) return true;
    let pp1 = this.prevProps.points[0];
    let pp2 = this.prevProps.points[1];
    let p1 = this.points[0];
    let p2 = this.points[1];

    return (pp1.x != p1.x || pp1.y || p1.y || pp2.x != p2.x || pp2.y != p2.y);
}

DragLine.prototype.doPlot = function() {
    if (!this.needRePlot()) return;
    let self = this;

    let point1 = this.points[0];
    let point2 = this.points[1];

    this.svgGroup.selectAll('.vi-dragline-item').remove();

    this.helper.line(point1.x, point1.y, point2.x, point2.y)
        .classed('vi-dragline-item', true)
        .classed('vi-dragline-line', true);

    [point1, Utils.getMiddlePoint(point1, point2), point2].forEach(function(p, i) {
        self.helper.square(p.x, p.y)
            .classed('vi-dragline-item', true)
            .classed('vi-dragline-symbol', true);
    });
}

DragLine.prototype.dragCallback = function() {
    let newP1 = Utils.clone(this.points[0]);
    let newP2 = Utils.clone(this.points[1]);

    if (this.direction == 'Vertical') {
        newP1.y += d3.event.dy;
        newP2.y += d3.event.dy;
    }
    else if (this.direction == 'Horizontal') {
        newP1.x += d3.event.dx;
        newP2.x += d3.event.dx;
    }
    this.points = [newP1, newP2];
    this.doPlot();
}

DragLine.prototype.on = function(type, callback) {
    let self = this;
    if (type == 'dragStart') {
        self.dragFunc.on('start', callback);
        self.svgGroup.call(self.dragFunc);
    }
    else if (type == 'dragging') {
        self.dragFunc.on('drag', function() {
            self.dragCallback();
            callback();
        });
        self.svgGroup.call(self.dragFunc);
    }
    else if (type == 'dragEnd') {
        self.dragFunc.on('end', callback);
        self.svgGroup.call(self.dragFunc);
    }
    else self.svgGroup.on(type, callback);
    return this;
}
