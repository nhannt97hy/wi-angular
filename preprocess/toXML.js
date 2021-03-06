'use strict';
const fs = require('fs');
const mkdirp = require('mkdirp');
const jsonxml = require('jsontoxml');
let getDirName = require('path').dirname;

let obj;

/*
toXML("project-tab.json","project-tab/index.html");
toXML("well-tab.json", "well-tab/index.html");
toXML("data-processing-tab.json", "data-processing-data/index.html");
toXML("help-tab.json", "help-tab/index.html");
toXML("petrophysics-tab.json", "petrophysics-tab/index.html");
toXML("data-analysis-tab.json", "data-analysis-tab/index.html");
*/

function printToFile(path, contents, cb) {
    mkdirp(getDirName(path), function (err) {
        if (err) return cb(err);

        fs.writeFile(path, contents, function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file "+path+" was saved");
        });
    });
}

function toXML(jsonFileName,xmlFileName) {
    fs.readFile(jsonFileName, 'utf8', function (err, data) {
        if (err) throw err;
        obj = JSON.parse(data);
        var xml = jsonxml(obj, {prettyPrint: true});
        printToFile(xmlFileName, xml);
    });
}

exports.jsonToXML = function(configFile) {
    var processTabInfos = require('./' + configFile).processTabInfos;
    processTabInfos.forEach(function(item){
        toXML(item.file, item.dir + "/index.html");
    });
};
