let CanvasHelper = require('./visualize-canvas-helper');
let SvgHelper = require('./visualize-svg-helper');

exports.round = round;
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
exports.uniq = uniq;
exports.clone = clone;
exports.range = range;
exports.sort = sort;
exports.getScaleFunc = getScaleFunc;
exports.setIfNotNull = setIfNotNull;
exports.setIfSelfNull = setIfSelfNull;
exports.setIfNotUndefined = setIfNotUndefined;
exports.isJson = isJson;
exports.only = only;
exports.merge = merge;
exports.getDecimalFormatter = getDecimalFormatter;
exports.setProperties = setProperties;
exports.getProperties = getProperties;
exports.sortByKey = sortByKey;
exports.getMiddlePoint = getMiddlePoint;
exports.isMouseInside = isMouseInside;
exports.getLinearEquation = getLinearEquation;
exports.getPointByFraction = getPointByFraction;
exports.getLineFunc = getLineFunc;
exports.getIntersection = getIntersection;
exports.getLineFuncFromTwoPoints = getLineFuncFromTwoPoints;
exports.getDistance = getDistance;
exports.sum = sum;
exports.mean = mean;
exports.getBoundingClientDimension = getBoundingClientDimension;

function getProperties(obj) {
    let props = {};
    Object.keys(obj.PROPERTIES).forEach(function(key) {
        let value = obj[key];
        let schema = obj.PROPERTIES[key];
        if (value === undefined) return;

        if (schema.type == 'Object' && schema.properties !== undefined) {
            let tmpObj = obj[key] || {};
            tmpObj.PROPERTIES = schema.properties;
            let tmpProps = getProperties(tmpObj);
            props[key] = tmpProps;
        }
        else if (schema.type == 'Array' && schema.item !== undefined) {
            props[key] = getArrayFromSchema(value, schema.item);
        }
        else {
            if (value === undefined) return;
            props[key] = value;
        }
    });
    return props;
}

function setProperties(obj, props, forArray) {
    if (typeof props != 'object') props = {};

    Object.keys(obj.PROPERTIES).forEach(function(key) {
        let value = props[key];
        let schema = obj.PROPERTIES[key];

        if (value === undefined && schema.type != 'Object') {
            if (obj[key] === undefined && schema.default !== undefined) obj[key] = schema.default;
        }
        else if (value === null) {
            if (obj[key] === undefined && schema.null === false && schema.default !== undefined) obj[key] = schema.default;
        }
        else if (schema.type == 'Integer') {
            obj[key] = value == null ? null : parseInt(value);
        }
        else if (schema.type == 'Float') {
            obj[key] = value == null ? null : parseFloat(value);
        }
        else if (schema.type == 'Enum') {
            if (schema.values.indexOf(value) == -1) obj[key] = schema.default;
            else obj[key] = value;
        }
        else if (schema.type == 'Object' && schema.properties !== undefined) {
            let tmpObj = obj[key] === undefined ? {} : obj[key];
            tmpObj.PROPERTIES = schema.properties;
            setProperties(tmpObj, props[key]);
            delete tmpObj.PROPERTIES;
            if (obj[key] === undefined) obj[key] = tmpObj;
            else merge(obj[key], tmpObj);
        }
        else if (schema.type == 'Array' && schema.item !== undefined) {
            obj[key] = getArrayFromSchema(value, schema.item);
        }
        else {
            if (value !== undefined) {
                obj[key] = value;
            }
        }
    });
}

function getArrayFromSchema(arr, schema) {
    let tmpArr = [];
    if(Array.isArray(arr) && arr.length) {
        arr.forEach(function(val) {
            if (schema.type == 'Integer') tmpArr.push(parseInt(val))
            else if (schema.type == 'Float') tmpArr.push(parseFloat(val))
            else if (schema.type == 'Object' && schema.properties !== undefined) {
                let tmpObj = { PROPERTIES: schema.properties };
                setProperties(tmpObj, val);
                delete tmpObj.PROPERTIES;
                tmpArr.push(tmpObj);
            }
            else if (schema.type == 'Array' && schema.item != undefined) {
                tmpArr.push(getArrayFromSchema(val, schema.item));
            }
            else tmpArr.push(val);
        });
    }
    return tmpArr;
}

/**
 * Filter only object with only specified attributes
 */
function only(obj, attrs) {
    let newObj = {};
    attrs.forEach(function(attr) {
        if (obj[attr] === undefined) return;
        newObj[attr] = obj[attr];
    });
    return newObj;
}

/**
 * Merge props into obj with each value in props being processed by evalFunc
 */
function merge(obj, props, evalFunc) {
    Object.keys(props).forEach(function(key) {
        setIfNotUndefined(obj, key, evalFunc ? evalFunc(props, key) : props[key]);
    });
}

function isJson(str) {
    try {
        JSON.parse(str);
    }
    catch (e) {
        return false;
    }
    return true;
}

function setIfNotNull(obj, attr, newProp) {
    obj[attr] = newProp == null ? obj[attr] : newProp;
}

function setIfSelfNull(obj, attr, newProp) {
    obj[attr] = obj[attr] == null ? newProp : obj[attr];
}

function setIfNotUndefined(obj, attr, newProp) {
    obj[attr] = newProp === undefined ? obj[attr] : newProp;
}

function getScaleFunc(scale) {
    return {
        'linear': d3.scaleLinear(),
        'logarithmic': d3.scaleLog()
    }[lowercase(scale)];
}

function getDecimalFormatter(decimal) {
    decimal = decimal < 0 ? 0 : decimal;
    return d3.format('.' + decimal + 'f');
}

/**
 * Create an array with each element is an integer from 'start' up to 'end'
 */
function range(start, end, step) {
    if (!step) step = 1;
    return Array.apply(null, {length: (end-start+step) / step}).map(function(d, i) {
        return i*step + start;
    });
}

/**
 * Deep copy an object
 */
function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Remove duplications from array
 * @param {Array} Original array containing duplications
 * @returns {Array} Array with no duplicated items
 */
function uniq(array) {
    return array.filter(function(item, i) {
        return array.indexOf(item) == i;
    });
}

/**
 * @param {String} color - CSS color
 * @returns {String} String representation of color in rgb format, null if the input string cannot be converted
 */
function convertColorToRGB(color) {
    let d3Color = d3.color(color);
    if (!d3Color) return null;
    return d3Color.toString();
}

/**
 * Cluster original array of data into sub-arrays separated by null values
 * Each sub-array contains no null data
 * @param {Array} data - Array of x,y coordinates
 * @returns {Array} Array of sub-arrays
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

/**
 * Cluster original pair of same-length data arrays into arrays of pairs of arrays
 * Original data are divided into sub-groups when there is null value in either of the two input arrays
 * Each sub-group is an array of a pair of array from two original data arrays containing no null values
 * @param {Array} data1 - First set of data containing x,y coordinates
 * @param {Array} data2 - Second set of data containing x,y coordinates
 * @returns {Array} Array of sub-arrays
 */
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

/**
 * @param {String} str
 * @returns {String} New string with all characters to the uppercase
 */
function uppercase(str) {
    if (typeof str != 'string') return null;
    return str.toUpperCase();
}

/**
 * @param {String} str
 * @returns {String} New string with all characters to the lowercase
 */
function lowercase(str) {
    if (typeof str != 'string') return null;
    return str.toLowerCase();
}

/**
 * @param {String} str
 * @returns {String} New string with the first character to the uppercase
 */
function capitalize(str) {
    if (typeof str != 'string') return null;
    return str.replace(str[0], str[0].toUpperCase());
    // return str.capitalize();
}

/**
 * @param {String} str - String in pascal case
 * @returns {String} New string with all lowercase characters, words are separated by dash "-"
 */
function pascalCaseToLowerDash(str) {
    return str.replace(/\.?[A-Z]/g, function(c) {
        return '-' + c.toLowerCase()
    }).replace(/^-/, '');
}

/**
 * @param {Number} value - Number to round
 * @param {Number} granularity - The rounded number is the multiplier of this value
 * @returns {Number}
 */
function round(value, granularity) {
    return Math.round(value / granularity) * granularity;
}

/**
 * @param {Number} value - Number to round up
 * @param {Number} granularity - The rounded number is the multiplier of this value
 * @returns {Number}
 */
function roundUp(value, granularity) {
    return Math.ceil(value / granularity) * granularity;
}

/**
 * @param {Number} value - Number to round down
 * @param {Number} granularity - The rounded number is the multiplier of this value
 * @returns {Number}
 */
function roundDown(value, granularity) {
    return Math.floor(value / granularity) * granularity;
}

/**
 * Copy prototype of a function into another function
 * @param {Function} base - Base function which has already defined prototypes
 * @param {Function} sub - Function to inherit prototypes
 */
function extend(base, sub) {
    sub.prototype = Object.create(base.prototype);
    sub.prototype.constructor = sub;
}

/**
 * Limit a value against an extent
 * @param {Number} val - The value to limit
 * @param {Array} extent - The range to limit the value
 * @returns {Number}
 */
function clip(val, extent) {
    if (val > extent[1]) return extent[1];
    if (val < extent[0]) return extent[0];
    return val;
}

/**
 * Check if data point has y coordinate within a specified range
 * @param {Object} item - Data item containing x, y coordinates
 * @param {Array} extentY - Range of y coordinate
 * @returns {Boolean}
 */
function isWithinYRange(item, extentY) {
    return (item.y >= extentY[0] && item.y <= extentY[1]);
}

/**
 * Create canvas fillstyle from objects defining style
 * @async
 * @param {Object} ctx - The canvas context to create fillstyle
 * @param {Object[]} fills - Array of object defining fillstyle. Each fill style has only one key: color, pattern or gradient
 * @param {String} [fills[].color] - CSS color
 * @param {Object} [fills[].pattern] - Object defining pattern
 * @param {String} [fills[].pattern.name] - Pattern name
 * @param {String} [fills[].pattern.foreground] - Pattern foreground
 * @param {String} [fills[].pattern.background] - Pattern background
 * @param {Function} callback - The function to call back after creating fillstyles
 */

function createFillStyles(ctx, fills, callback) {
    let fillStyles = [];

    asyncLoop(
        fills.length,
        function(loop) {
            let fill = fills[loop.iteration()];
            if (!fill || fill.display === false) {
                fillStyles.push('transparent');
                loop.next();
            }
            else if (fill.color) {
                fillStyles.push(fill.color);
                loop.next();
            }
            else if (fill.pattern) {
                let name = fill.pattern.name;
                let fg = fill.pattern.foreground;
                let bg = fill.pattern.background;
                CanvasHelper.createPattern(ctx, name, fg, bg, function(pattern) {
                    fillStyles.push(pattern);
                    loop.next();
                });
            }
            else if (fill.varShading) {
                let startX = fill.varShading.startX;
                let endX = fill.varShading.endX;
                let data = fill.varShading.data;

                if (!data || data.length <= 1) {
                    fillStyles.push('transparent');
                    loop.next();
                    return;
                }

                let minY = d3.min(data, function(d) { return d.y; });
                let maxY = d3.max(data, function(d) { return d.y; });
                let transform;

                if (fill.varShading.customFills) {
                    let customFills = fill.varShading.customFills;
                    let content = customFills.content;
                    let patCanvasId = customFills.patCanvasId;

                    let minX = d3.min(data, function(d) { return d.x; });
                    let maxX = d3.max(data, function(d) { return d.x; });

                    if (minX == null || maxX == null || maxX - minX == 0) {
                        fillStyles.push('transparent');
                        loop.next();
                        return;
                    }

                    let patCanvas = d3.select('#' + patCanvasId);
                    if (!patCanvas.node()) patCanvas = d3.select('body').append('canvas');

                    patCanvas
                        .attr('id', patCanvasId)
                        .attr('width', CanvasHelper.PATTERN_WIDTH)
                        .attr('height', maxY - minY)
                        .style('display', 'none');
                    let patCtx = patCanvas.node().getContext('2d');

                    let patFills = content.map(function(d) {
                        return {
                            pattern: {
                                name: d.pattern,
                                foreground: d.foreground,
                                background: d.background
                            }
                        };
                    });

                    createFillStyles(ctx, patFills, function(patFillStyles) {
                        let range = ['transparent'];
                        patFillStyles.forEach(function (p) {
                            range.push(p);
                            range.push('transparent');
                        });

                        let domain = [minX - 1];
                        content.forEach(function(d) {
                            domain.push(d.lowVal);
                            domain.push(d.highVal);
                        });
                        domain.push(maxX + 1);
                        transform = d3.scaleQuantile().domain(domain).range(range);

                        for (let i = 0; i < data.length - 1; i ++) {
                            let patFillStyle = transform(data[i].x);
                            if (patFillStyle == 'transparent') continue;
                            patCtx.fillStyle = patFillStyle;
                            patCtx.fillRect(0, data[i].y - minY, CanvasHelper.PATTERN_WIDTH, data[i+1].y - data[i].y);
                        }
                        fillStyles.push(ctx.createPattern(patCanvas.node(), 'repeat-x'));
                        loop.next();
                    });
                }
                else {
                    let gradient = ctx.createLinearGradient(0, minY, 0, maxY);
                    let reverse = startX > endX;

                    if (fill.varShading.gradient) {
                        let startColor = fill.varShading.gradient.startColor;
                        let endColor = fill.varShading.gradient.endColor;
                        transform = d3.scaleLinear()
                            .domain(sort([startX, endX]))
                            .range(reverse ? [startColor, endColor].reverse() : [startColor, endColor] )
                            .clamp(true);

                    }
                    else if (fill.varShading.palette) {
                        let palette = fill.varShading.palette.map(function(c) {
                            return d3.rgb(c.red, c.green, c.blue, c.alpha).toString();
                        });
                        transform = d3.scaleQuantize()
                            .domain(sort([startX, endX]))
                            .range(reverse ? palette.reverse() : palette);
                    }

                    if (transform)
                        for (let i = 0; i < data.length - 1; i ++) {
                            let x = data[i].x;
                            let color = transform(x);
                            gradient.addColorStop((data[i].y - minY) / (maxY-minY), color);
                            gradient.addColorStop((data[i+1].y - minY) / (maxY-minY), color);
                        }

                    fillStyles.push(gradient);
                    loop.next();
                }

            }
            else {
                fillStyles.push('transparent');
                loop.next();
            }
        },
        function() {
            callback(fillStyles);
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

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        let x = a[key];
        let y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

function sort(array) {
    return array.sort(function(a, b) {
        return a - b;
    });
}

function getPointByFraction(point1, point2, fraction) {
    return {
        x: point1.x + (point2.x - point1.x) * fraction,
        y: point1.y + (point2.y - point1.y) * fraction
    }
}

function getMiddlePoint(point1, point2) {
    return {
        x: point1.x + (point2.x - point1.x) / 2,
        y: point1.y + (point2.y - point1.y) / 2
    }
}

function isMouseInside(element) {
    let mouse = d3.mouse(element);
    let x = mouse[0];
    let y = mouse[1];
    let r = element.getBBox();

    return x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height;
}

function getLinearEquation(point1, point2) {
    if (point2.x == point1.x) {
        let x = +point1.x.toFixed(6);
        return 'x=' + x;
    }
    else {
        let slope = (point2.y - point1.y) / (point2.x - point1.x);
        let intercept = -slope * point1.x + point1.y;
        let a = +slope.toFixed(6);
        let b = +intercept.toFixed(6);
        return 'y=' + (a == 0 ? '' : (a + '*x')) + (b < 0 || a == 0 ? b : ('+' + b));
    }
}

function getLineFunc(slope, point) {
    if (slope == null) {
        return { constant: point.x };
    }

    let intercept = point.y - slope * point.x;
    let func = function(x) {
        return x * slope + intercept;
    }
    func.slope = slope;
    func.intercept = intercept;
    return func;
}

function getLineFuncFromTwoPoints(p1, p2) {
    if (p1.x == p2.x) {
        return { constant: p1.x };
    }

    let slope = (p2.y - p1.y) / (p2.x - p1.x);
    return getLineFunc(slope, p1);
}

function getIntersection(f1, f2) {
    if (f1.constant != null && f2.constant != null)
        return null;
    else if (f1.constant != null && f2.constant == null)
        return { x: f1.constant, y: f2(f1.constant) };
    else if (f1.constant == null && f2.constant != null)
        return { x: f2.constant, y: f1(f2.constant) };
    else {
        if (f1.slope == f2.slope) return null;
        let x = (f2.intercept - f1.intercept) / (f1.slope - f2.slope);
        let y = f1(x);
        return {x: x, y: y};
    }
}

function getDistance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function sum(arr) {
    return arr.reduce(function(sum, value) { return sum + value; }, 0);
}

function mean(arr) {
    return sum(arr) / arr.length;
}

function getBoundingClientDimension(aNode) {
    var jQueryObj = $(aNode);
    return {width:jQueryObj.width(), height:jQueryObj.height()};
}
