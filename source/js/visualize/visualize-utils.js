let CanvasHelper = require('./visualize-canvas-helper');

exports.roundUp = roundUp;
exports.roundDown = roundDown;
exports.isWithinYRange = isWithinYRange;
exports.trimData = trimData;
exports.interpolateData = interpolateData;
exports.parseData = parseData;
exports.extend = extend;
exports.createFillStyles = createFillStyles;
exports.clip = clip;
exports.pascalCaseToLowerDash = pascalCaseToLowerDash;
exports.clusterData = clusterData;
exports.clusterPairData = clusterPairData;
exports.capitalize = capitalize;
exports.lowercase = lowercase;
exports.uppercase = uppercase;
exports.convertColorToRGB = convertColorToRGB;

function convertColorToRGB (color) {
    let d3Color = d3.color(color);
    if (!d3Color) return null;
    return d3Color.toString();
}

/**
 * Cluster continuous data into groups
 */
function clusterData(data) {
    let ret = [];
    let tmp = [];
    let testData = data.concat([{y:-1, x: null}]);
    testData.forEach(function(d) {
        if (d.x == null) {
            if (tmp.length) ret.push(tmp);
            tmp = [];
        }
        else {
            tmp.push(d);
        }
    });
    return ret;
}

function clusterPairData(data1, data2) {
    if (!data1.length || !data2.length) return [[], []];

    let ret = [],
        tmp1 = [],
        tmp2 = [];

    for (let i = 0; i <= data1.length; i ++) {
        if (i == data1.length || data1[i].x == null || data2[i].x == null) {
            if (tmp1.length && tmp2.length)
                ret.push([tmp1, tmp2]);
            tmp1 = [];
            tmp2 = [];
        }
        else {
            tmp1.push(data1[i]);
            tmp2.push(data2[i]);
        }
    };
    return ret
}

function uppercase(str) {
    if (typeof str != 'string') return null;
    return str.toUpperCase();
}

function lowercase(str) {
    if (typeof str != 'string') return null;
    return str.toLowerCase();
}

function capitalize(str) {
    if (typeof str != 'string') return null;
    return str.replace(str[0], str[0].toUpperCase());
}

function pascalCaseToLowerDash(str) {
    return str.replace(/\.?[A-Z]/g, function(c) {
        return '-' + c.toLowerCase()
    }).replace(/^-/, '');
}

function roundUp(value, granularity) {
    return Math.ceil(value / granularity) * granularity;
}
function roundDown(value, granularity) {
    return Math.floor(value / granularity) * granularity;
}

function extend(base, sub) {
    sub.prototype = Object.create(base.prototype);
    sub.prototype.constructor = sub;
}

function clip(val, extent) {
    if (val > extent[1]) return extent[1];
    if (val < extent[0]) return extent[0];
    return val;
}

function isWithinYRange(item, extentY) {
    return (item.y >= extentY[0] && item.y <= extentY[1]);
}

function createFillStyles(ctx, fills, callback) {
    let patterns = [];

    asyncLoop(
        fills.length,
        function(loop) {
            let fill = fills[loop.iteration()];
            if (!fill) {
                patterns.push(null);
                loop.next();
            }
            else if (fill.color) {
                patterns.push(fill.color);
                loop.next();
            }
            else if (fill.pattern) {
                let name = fill.pattern.name;
                let fg = fill.pattern.foreground;
                let bg = fill.pattern.background;
                CanvasHelper.createPattern(ctx, name, fg, bg, function(pattern) {
                    patterns.push(pattern);
                    loop.next();
                });
            }
            else {
                patterns.push(null);
                loop.next();
            }
        },
        function() {
            callback(patterns);
        }
    );
}

function trimData(data) {
    let i = 0, j = data.length -1;
    for (;i < data.length && data[i].x == null; i++);
    for (;j >= 0 && data[j].x == null; j--);
    if (i >= j) return [];
    return data.slice(i, j+1);
}

function parseData(data) {
    return data.map(function(d) {
        return {
            x: (d.x == null || d.x == NaN) ? null : parseFloat(d.x),
            y: (d.y == null || d.y == NaN) ? null : parseFloat(d.y)
        }
    });
}

function interpolateData(data) {
    let prev = 0;
    let i, j;
    for (i = 0; i < data.length; i ++) {
        if (data[i].x == null) continue;
        for (j = prev + 1; j < i; j ++) {
            data[j].x = (data[j].y - data[prev].y) / (data[i].y - data[prev].y) * (data[i].x - data[prev].x) + data[prev].x;
        }
        prev = i;
    }
    return data;
}

function asyncLoop(iterations, func, callback) {
    let index = 0;
    let done = false;
    let loop = {
        next: function() {
            if (done) return;
            if (index < iterations) {
                index ++;
                func(loop);
            }
            else {
                done = true;
                callback();
            }
        },
        iteration: function() {
            return index - 1;
        },
        break: function() {
            done = true;
            callback();
        }
    };
    loop.next();
    return loop;
}
