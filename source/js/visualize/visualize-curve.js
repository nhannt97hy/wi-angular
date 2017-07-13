var invertColor = require('./visualize-utils.js').invertColor;

exports.Curve = Curve;

function Curve(config) {
    var self = this;
    var canvas;
    var ctx;
    var clientRect;
    var _data;
    var color = config.color || 'blue';
    var shadingColor, invertedColor, invertedShadingColor;
    var _shading;

    this.init = function(plotContainer, data) {
        _data = data;
        _updateColors();
        clientRect = plotContainer.node().getBoundingClientRect();

        canvas = plotContainer.append('canvas')
            .attr('width', clientRect.width)
            .attr('height', clientRect.height);

        ctx = canvas.node().getContext('2d');
        return self;
    }

    function _updateColors() {
        let d3Color = d3.color(color);
        let d3InvertedColor = invertColor(d3Color);

        invertedColor = d3InvertedColor.toString();
        shadingColor = d3.rgb(d3Color.r, d3Color.g, d3Color.b, 0.5).toString();
        invertedShadingColor = d3.rgb(d3InvertedColor.r, d3InvertedColor.g, d3InvertedColor.b, 0.5).toString();
    }

    this.getData = function() {
        return _data;
    }

    this.getColor = function() {
        return color;
    }

    this.getInvertedColor = function() {
        return invertedColor;
    }

    this.adjustSize = function(rect) {
        clientRect = rect;
        canvas
            .attr('width', clientRect.width)
            .attr('height', clientRect.height);
    }

    this.setColor = function(c) {
        color = c;
        _updateColors();
        return self;
    }

    this.nearPoint = function(x, y) {
        let e = 4;
        let imgData = ctx.getImageData(x-e, y-e, e*2, e*2);
        let r, g, b, a, tmpColor;
        for (let i = 0; i < imgData.width * imgData.height; i ++) {
            r = imgData.data[i * 4];
            g = imgData.data[i * 4 + 1];
            b = imgData.data[i * 4 + 2];
            a = imgData.data[i * 4 + 3];

            // if (r != 0 && g != 0 && b != 0 && a!= 127) console.log(r,g,b,a);
            // tmpColor = d3.rgb(r, g, b).toString();
            // if ((tmpColor == color || tmpColor == invertedColor) && a != 127)
            if ((r > 0 || g > 0 || b > 0 || a > 0) && a != 127)
                return true;
        }

        return false;
    }

    this.destroy = function() {
        canvas.remove();
    }

    this.doPlot = function(viewportX, viewportY, transformX, transformY, shading, lineWidth, refX, yStep) {
        _shading = shading;
        ctx.clearRect(0, 0, clientRect.width, clientRect.height);
        var plotSamples = _data.filter(function(item) {
            var ret =(item.x >= viewportX[0] &&
                   item.x <= viewportX[1] &&
                   item.y * yStep >= viewportY[0] &&
                   item.y * yStep <= viewportY[1]);
            return ret;
        });

        if (plotSamples.length == 0) return;

        /* draw shade */

        if (shading) {
            let gradient = ctx.createLinearGradient(refX - 2, 0, refX + 2, 0);
            gradient.addColorStop(0, invertedShadingColor);
            gradient.addColorStop(1, shadingColor);
            ctx.fillStyle = gradient;
            ctx.lineWidth = 0;
            ctx.beginPath();
            ctx.moveTo(refX, transformY(plotSamples[0].y * yStep));
            plotSamples.forEach(function(item) {
                ctx.lineTo(transformX(item.x), transformY(item.y * yStep));
            });
            ctx.lineTo(refX, transformY(plotSamples[plotSamples.length - 1].y * yStep));
            ctx.closePath();
            ctx.fill();
        }

        /* draw curve */
        let gradient = ctx.createLinearGradient(refX - 2, 0, refX + 2, 0);
        gradient.addColorStop(0, invertedColor);
        gradient.addColorStop(1, color);
        ctx.strokeStyle = shading ? gradient : color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(transformX(plotSamples[0].x), transformY(plotSamples[0].y * yStep));
        plotSamples.forEach(function(item) {
            ctx.lineTo(transformX(item.x), transformY(item.y * yStep));
        });
        ctx.stroke();
    }
}

