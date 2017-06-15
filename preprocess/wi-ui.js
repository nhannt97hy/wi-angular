XLSX = require('xlsx');
var fs = require('fs');
workbook = XLSX.readFile('../Wi-UI.xlsx');
// workbook.SheetNames.forEach(function(aSheet) {
//     console.log(aSheet);
// });

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
function sheetToJson(sheetName, attrCols) {
    var worksheet = workbook.Sheets[sheetName];
    var range = XLSX.utils.decode_range(worksheet['!ref']);

    var RESULT = new Object();
    RESULT.name = "html";

    var componentArr = [];
    for (var R = range.s.r + 1; R <= range.e.r; ++R) {
        var index = getValueAtCell(R, 0, worksheet);
        if (isInt(index)) {
            componentArr[index] = buildComponent(R, 1, worksheet, attrCols);
        } else {
            var indexTree = index.toString().split(".");
            var temp = componentArr[indexTree[0]];
            indexTree.forEach(function (branch, i) {
                if (i == 0 || i == indexTree.length - 1) return;
                temp = temp.content[branch];
            });
            if (typeof temp != 'undefined') {
                temp.content[indexTree[indexTree.length - 1]] = buildComponent(R, 1, worksheet, attrCols);
            }
        }
    }
    cleanComponentArr(componentArr);
    RESULT.content = componentArr;
    return RESULT;
}

// printToFile("ribon.json", JSON.stringify(sheetToJson("RibbonBlock", [3])));
printToFile("out.json", JSON.stringify(sheetToJson("ProjectTab", [3, 5])));
//Remove empty element in array component
function cleanComponentArr(component_Arr) {
    component_Arr.cleanData();
    component_Arr.forEach(function (compose) {
        cleanComponentArr(compose.content);
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
    newComponent.name = getValueAtCell(row, nameCol, sheet);
    attrCols.forEach(function (col) {
        newComponent[FIELD[col]] = getValueAtCell(row, col, sheet);
    });
    newComponent.content = [];
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
    fs.writeFile(fileName, content, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved");
    });
}