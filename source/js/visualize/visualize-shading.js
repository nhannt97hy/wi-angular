module.exports = Shading;

function Shading(config) {
    let self = this;
    let canvas;
    let ctx;
    let clientRect;
    let _leftCurve;
    let _rightCurve;
    let _color = config.color || 'green';
    let _name = config.name || 'Noname';

    this.init = function(plotContainer, leftCurve, rightCurve) {
        _leftCurve = leftCurve;
        _rightCurve = rightCurve;
        clientRect = plotContainer.node().getBoundingClientRect();

        canvas = plotContainer.append('canvas')
            .attr('width', clientRect.width)
            .attr('height', clientRect.height);

        ctx = canvas.node().getContext('2d');
        return self;
    }

    this.destroy = function() { canvas.remove(); };

    this.adjustSize = function(rect) {
        clientRect = rect;
        canvas
            .attr('width', clientRect.width)
            .attr('height', clientRect.height);
    }

    this.setColor = function(color) {
        _color = color;
    }

    this.doPlot = function(viewportX, viewportY, transformX, transformY, refX, yStep) {
        ctx.clearRect(0, 0, clientRect.width, clientRect.height);

        let filteredData = [_leftCurve.getData(), _rightCurve.getData().slice().reverse()].map(function(data) {
            return data.filter(function(item) {
                let ret = (item.x >= viewportX[0] &&
                   item.x <= viewportX[1] &&
                   item.y * yStep >= viewportY[0] &&
                   item.y * yStep <= viewportY[1]);
                return ret;
            });
        });

        let plotSamples = [].concat.apply([], filteredData);
        if (plotSamples.length == 0) return;
        ctx.fillStyle = _color;
        ctx.lineWidth = 0;

        ctx.beginPath();
        ctx.moveTo(transformX(plotSamples[0].x), transformY(plotSamples[0].y * yStep));
        plotSamples.forEach(function(item) {
            ctx.lineTo(transformX(item.x), transformY(item.y * yStep));
        });
        ctx.fill();
    }
}
