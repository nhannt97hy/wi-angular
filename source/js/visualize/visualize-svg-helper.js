module.exports = exports = SvgHelper;

function SvgHelper(svgGroup, config) {
    this.svgGroup = svgGroup;
    this.fillStyle = config.fillStyle || 'transparent';
    this.strokeStyle = config.strokeStyle || 'transparent';
    this.lineWidth = config.lineWidth || 1;
    this.lineDash = config.lineDash || '';
    this.size = config.size || 4;
}

SvgHelper.prototype.line = function(x1, y1, x2, y2) {
    let line = this.svgGroup.append('path')
        .attr('d', 'M' + x1 + ',' + y1 + 'L' + x2 + ',' + y2)

    this.draw(line);
    return line;
}

SvgHelper.prototype.circle = function(x, y) {
    let circle = this.svgGroup.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', this.size);
    this.draw(circle);
    return circle;
}

SvgHelper.prototype.square = function(x, y) {
    let a = this.size;
    let square = this.svgGroup.append('rect')
        .attr('x', x-a)
        .attr('y', y-a)
        .attr('width', a*2)
        .attr('height', a*2);
    this.draw(square);
    return square;
}

SvgHelper.prototype.draw = function(element) {
    return element
        .attr('fill', this.fillStyle)
        .attr('stroke', this.strokeStyle)
        .attr('stroke-width', this.lineWidth)
        .attr('stroke-dasharray', this.lineDash);
}
