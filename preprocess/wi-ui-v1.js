XLSX = require('xlsx');

var fs = require('fs');
Array.prototype.cleanData = function (deleteValue) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == deleteValue) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
};
//Param: sheetName: name of sheet
//       attrCols: array of colums contain attribute data (index start from 0)
function sheetToJson(workbook, sheetName, attrCols) {
    var worksheet = workbook.Sheets[sheetName];
    var range = XLSX.utils.decode_range(worksheet['!ref']);

    var componentArr = [];
    for (var R = range.s.r + 1; R <= range.e.r; ++R) {
        var index = getValueAtCell(R, 0, worksheet);
        if (isInt(index)) {
            componentArr[index] = buildComponent(R, 1, worksheet, attrCols);
        } else {
            var indexTree = index.toString().trim().split(".");
            var temp = componentArr[indexTree[0]];
            indexTree.forEach(function (branch, i) {
                if (i == 0 || i == indexTree.length - 1) return;

                temp = temp.children[branch];
            });
            if (typeof temp != 'undefined') {
                temp.children[indexTree[indexTree.length - 1]] = buildComponent(R, 1, worksheet, attrCols);
            }
        }
    }
    cleanComponentArr(componentArr);
    return componentArr;
}

//Remove empty element in array component
function cleanComponentArr(component_Arr) {
    component_Arr.cleanData();
    component_Arr.forEach(function (compose) {
        cleanComponentArr(compose.children);
    });

}
//Build a component object in row with attributes in attrCols
function buildComponent(row, nameCol, sheet, attrCols) {
    var FIELD = new Object();
    attrCols.forEach(function (col) {
        var value = getValueAtCell(0, col, sheet);
        FIELD[col] = value;
    });
    var newComponent = new Object();
    var attrObject = new Object();
    attrObject.name = getValueAtCell(row, nameCol, sheet);
    console.log('attrObject.name', attrObject.name);

    attrCols.forEach(function (col) {
        attrObject[FIELD[col]] = getValueAtCell(row, col, sheet);
    });
    var dependency = getValueAtCell(row, 2, sheet);

    newComponent.name = dependency.replace("wi", "wi-").toLowerCase();
    if (newComponent.name === 'wi-button') {
        attrObject.handler = 'handlers.' + clickFunctionName(attrObject.name);
    }
    newComponent.attrs = attrObject;
    newComponent.children = [];
    return newComponent;
}
//Get value data in a cell
//Return string "" if cell is empty
function getValueAtCell(rowIndex, colIndex, sheet) {
    var cellPositionObject = {r: rowIndex, c: colIndex};
    var cellPositionString = XLSX.utils.encode_cell(cellPositionObject);
    var cell = sheet[cellPositionString];
    if (typeof cell === 'undefined') {
        return "";
    }
    return cell.v;
}
//Check if data is integer number
function isInt(data) {
    var check = /\./.test(data);
    return !check;
}
//Just print string to file
function printToFile(fileName, content) {
    fs.writeFileSync(fileName, content);
    console.log("The file " + fileName + " was saved");
}

// MAIN function
//var processTabInfos = require('./config.js').getTabInfos();
exports.xlsxToJson = function (xlsxFile, configFile) {
    //var processTabInfos = require('./config.js').processTabInfos;
    var processTabInfos = require('./' + configFile).processTabInfos;
    //var workbook = XLSX.readFile('../Wi-UI.xlsx');
    console.log(xlsxFile);
    var workbook = XLSX.readFile(xlsxFile);
    processTabInfos.forEach(function (item) {
        printToFile(item.file, JSON.stringify(sheetToJson(workbook, item.tab, [5, 6, 7, 8, 9])));
    });
};

function clickFunctionName(name) {
    return (name + 'Clicked').replace(/\&/g, 'And')
        .replace(/\+/g, 'Plus')
        .replace(/^3/g, 'Tri')
        .replace(/[\/\-\.]/g, '_');
}

function genFunctionsFromSheet(workbook, sheetName) {
    var worksheet = workbook.Sheets[sheetName];
    var range = XLSX.utils.decode_range(worksheet['!ref']);
    var nameCol = 1;
    var functions = [];
    var functionStr;
    var name;
    for (var R = range.s.r + 1; R <= range.e.r; ++R) {
        functionStr = '';
        name = getValueAtCell(R, nameCol, worksheet);
        var fName = clickFunctionName(name);
        if (/Button$/.test(name)) {
            functionStr = 'exports.' + fName + ' = function() {\n' +
                '    console.log(\'' + name + ' is clicked\');\n' +
                '}';
            functions.push(functionStr);
        }
    }
    return functions;
}

exports.genFunctionsFromXlsx = function (xlsxFile, outputFile, configFile) {
    var processTabInfos = require('./' + configFile).processTabInfos;
    var workbook = XLSX.readFile(xlsxFile);
    processTabInfos.forEach(function (item) {
        fs.appendFileSync(outputFile, genFunctionsFromSheet(workbook, item.tab).join('\n\n') + "\n\n");
        console.log("Tab " + item.tab + " was processed");
    });
}
