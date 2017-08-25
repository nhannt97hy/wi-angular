module.exports = exports = SvgHelper;

function SvgHelper(svgGroup, config) {
    this.svgGroup = config.svgGroup;
    this.fillStyle = config.fillStyle || 'transparent';
    this.strokeStyle = config.strokeStyle || 'transparent';
    this.lineWidth = config.lineWidth || 1;
    this.lineDash = config.lineDash || '';
    this.size = config.size || 4;
}

SvgHelper.prototype.circle = function(x, y) {
    let circle =  this.svgGroup.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', this.size);
    draw(circle);
    return circle;
}

SvgHelper.prototype.square = function(x, y) {
    prepare(this);
    let a = this.size;
    this.ctx.rect(x-a, y-a, a*2, a*2);
    draw(this);
}

SvgHelper.prototype.cross = function(x, y) {
    prepare(this);
    let d = this.size;
    this.ctx.moveTo(x-d, y-d);
    this.ctx.lineTo(x+d, y+d);
    this.ctx.moveTo(x-d, y+d);
    this.ctx.lineTo(x+d, y-d);
    draw(this);
}

SvgHelper.prototype.diamond = function(x, y) {
    prepare(this);
    let d = this.size;
    this.ctx.moveTo(x-d, y);
    this.ctx.lineTo(x, y+d);
    this.ctx.lineTo(x+d, y);
    this.ctx.lineTo(x, y-d);
    this.ctx.closePath();
    draw(this);
}

SvgHelper.prototype.plus = function(x, y) {
    prepare(this);
    let d = this.size;
    this.ctx.moveTo(x-d, y);
    this.ctx.lineTo(x+d, y);
    this.ctx.moveTo(x, y-d);
    this.ctx.lineTo(x, y+d);
    draw(this);
}

SvgHelper.prototype.star = function(x, y) {
    prepare(this);
    let d = this.size;
    this.ctx.translate(x, y);
    for (let i = 0; i < 3; i ++) {
        this.ctx.rotate(Math.PI / 3);
        this.ctx.moveTo(-d, 0)
        this.ctx.lineTo(+d, 0);
    }
    draw(this);
}

SvgHelper.prototype.draw = function(element) {
    element
        .attr('fill', this.fillStyle)
        .attr('stroke', this.strokeStyle)
        .attr('stroke-width', this.lineWidth)
        .attr('stroke-dasharray', this.lineDash);
}
