let CanvasHelper = require('./visualize-canvas-helper');

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

function getProperties(obj) {
    let props = {};
    Object.keys(obj.PROPERTIES).forEach(function(key) {
        let value = obj[key];
        let schema = obj.PROPERTIES[key];

        if (schema.type == 'Object' && schema.properties !== undefined) {
            let tmpObj = obj[key];
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
            if (schema.default !== undefined) obj[key] = schema.default;
        }
        else if (schema.type == 'Integer') obj[key] = parseInt(value);
        else if (schema.type == 'Float') obj[key] = parseFloat(value);
        else if (schema.type == 'Enum') {
            if (schema.values.indexOf(value) == -1) obj[key] = schema.default;
        }
        else if (schema.type == 'Object' && schema.properties !== undefined) {
            let tmpObj = { PROPERTIES: schema.properties };
            setProperties(tmpObj, props[key]);
            delete tmpObj.PROPERTIES;
            obj[key] = tmpObj;
        }
        else if (schema.type == 'Array' && schema.item !== undefined) {
            obj[key] = getArrayFromSchema(value, schema.item);
        }
        else obj[key] = value;
    });
}

function getArrayFromSchema(arr, schema) {
    let tmpArr = [];
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
    // return str.replace(str[0], str[0].toUpperCase());
    return str.capitalize();
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
function _createFillStyles(ctx, fills, callback) {
    let patterns = [];

    asyncLoop(
        fills.length,
        function(loop) {
            let fill = fills[loop.iteration()];
            if (!fill) {
                patterns.push('transparent');
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
            else if (fill.gradient) {
                let startX = fill.gradient.startX;
                let endX = fill.gradient.endX;
                let startColor = fill.gradient.startColor;
                let endColor = fill.gradient.endColor;
                let data = fill.gradient.data;
                let minY = data[0].y;
                let maxY = data[data.length-1].y;
                let gradient = ctx.createLinearGradient(0, minY, 0, maxY);
                let transform = d3.scaleLinear()
                    .domain([startX, endX])
                    .range([startColor, endColor])
                    .clamp(true);

                for (let i = 0; i < data.length - 1; i ++) {
                    let x = data[i].x;
                    let color = transform(x);
                    gradient.addColorStop((data[i].y - minY) / (maxY-minY), color);
                    gradient.addColorStop((data[i+1].y - minY) / (maxY-minY), color);
                }
                patterns.push(gradient);
                loop.next();
            }
            else {
                patterns.push('transparent');
                loop.next();
            }
        },
        function() {
            callback(patterns);
        }
    );
}
function createFillStyles(ctx, fills, callback) {
    let fillStyles = [];

    asyncLoop(
        fills.length,
        function(loop) {
            let fill = fills[loop.iteration()];
            if (!fill) {
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
                let minY = data[0].y;
                let maxY = data[data.length-1].y;
                let transform;
                let gradient = ctx.createLinearGradient(0, minY, 0, maxY);

                if (fill.varShading.gradient) {
                    let startColor = fill.varShading.gradient.startColor;
                    let endColor = fill.varShading.gradient.endColor;
                    transform = d3.scaleLinear()
                        .domain([startX, endX])
                        .range([startColor, endColor])
                        .clamp(true);

                }
                else if (fill.varShading.pallete) {
                    let pallete = fill.varShading.pallete.map(function(c) {
                        return d3.rgb(c.red, c.green, c.blue, c.alpha).toString();
                    });
                    transform = d3.scaleQuantize()
                        .domain([startX, endX])
                        .range(pallete);
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
