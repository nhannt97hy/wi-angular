module.exports = exports = CanvasHelper;

function CanvasHelper(ctx, config) {
    this.ctx = ctx;
    this.fillStyle = config.fillStyle || 'transparent';
    this.strokeStyle = config.strokeStyle || 'blue';
    this.lineWidth = config.lineWidth || 1;
    this.lineDash = config.lineDash || null;
    this.size = config.size || 4;
}

CanvasHelper.prototype.circle = function(x, y) {
    prepare(this);
    let r = this.size;
    this.ctx.arc(x, y, r, 0, Math.PI*2, true);
    draw(this);
}

CanvasHelper.prototype.square = function(x, y) {
    prepare(this);
    let a = this.size;
    this.ctx.rect(x-a, y-a, a*2, a*2);
    draw(this);
}

CanvasHelper.prototype.cross = function(x, y) {
    prepare(this);
    let d = this.size;
    this.ctx.moveTo(x-d, y-d);
    this.ctx.lineTo(x+d, y+d);
    this.ctx.moveTo(x-d, y+d);
    this.ctx.lineTo(x+d, y-d);
    draw(this);
}

CanvasHelper.prototype.diamond = function(x, y) {
    prepare(this);
    let d = this.size;
    this.ctx.moveTo(x-d, y);
    this.ctx.lineTo(x, y+d);
    this.ctx.lineTo(x+d, y);
    this.ctx.lineTo(x, y-d);
    this.ctx.closePath();
    draw(this);
}

CanvasHelper.prototype.plus = function(x, y) {
    prepare(this);
    let d = this.size;
    this.ctx.moveTo(x-d, y);
    this.ctx.lineTo(x+d, y);
    this.ctx.moveTo(x, y-d);
    this.ctx.lineTo(x, y+d);
    draw(this);
}

CanvasHelper.prototype.star = function(x, y) {
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

CanvasHelper.createPattern = function(ctx, name, foreground, background) {
    let src = CanvasHelper.RAW_PATTERNS[name];
    if (!src) return null;
    let image = new Image();
    if (foreground)
        src = src.replace(/(stroke=")\w+(")/, '$1'+foreground+'$2');
    if (background)
        src = src.replace(/(fill=")\w+(")/, '$1'+background+'$2');

    image.src = src;

    return ctx.createPattern(image, 'repeat');
}

CanvasHelper.createPattern2 = function(ctx, name, foreground, background, callback) {
    let src = CanvasHelper.RAW_PATTERNS[name];
    if (!src) return null;
    let image = new Image();
    if (foreground)
        src = src.replace(/(stroke=")\w+(")/, '$1'+foreground+'$2');
    if (background)
        src = src.replace(/(fill=")\w+(")/, '$1'+background+'$2');

    image.src = src;
    image.onload = function() {
        callback(image, 'repeat');
    }
}

CanvasHelper.RAW_PATTERNS = {
    basement: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" version="1.1"><g><path d="M0,0L0,16L16,16L16,0" fill="none"/><path d="M2,0L8,6M9,15L15,9" stroke="black" fill="none"/></g></svg>',
    chert: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" version="1.1"><g><path d="M0,0L0,16L16,16L16,0" fill="none"/><path d="M0,3L3,0L6,3M8,7L11,4L14,7M1,11L4,8L7,11M9,15L12,12L15,15" stroke="black" fill="none"/></g></svg>',
    dolomite: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" version="1.1"><g><path d="M0,0L0,16L16,16L16,0" fill="none"/><path d="M0,4L16,4M0,12L16,12M6,4L2,12M12,0L10,4M14,12L12,16" stroke="black" fill="none"/></g></svg>',
    limestone: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" version="1.1"><g><path d="M0,0L0,16L16,16L16,0" fill="white"/><path d="M0,4L16,4M0,12L16,12M4,4L4,12M12,0L12,4M12,12L12,16" stroke="blue" fill="red"/></g></svg>',
}

function prepare(canvas) {
    let ctx = canvas.ctx;
    ctx.save();

    ctx.beginPath();
    ctx.fillStyle = canvas.fillStyle;
    ctx.strokeStyle = canvas.strokeStyle;
    ctx.lineWidth = canvas.lineWidth;
    if (canvas.lineDash)
        ctx.setLineDash(canvas.lineDash);
}

function draw(canvas) {
    let ctx = canvas.ctx;
    ctx.stroke();
    ctx.fill();
    ctx.restore();
}
