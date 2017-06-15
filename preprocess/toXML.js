var fs = require('fs');
var jsonxml = require('jsontoxml');
var obj;
fs.readFile('out.json', 'utf8', function (err, data) {
    if (err) throw err;
    obj = JSON.parse(data);
    var xml = jsonxml(obj);
    printToFile("result.xml", xml);
});
function printToFile(fileName, content) {
    fs.writeFile(fileName, content, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved");
    });
}