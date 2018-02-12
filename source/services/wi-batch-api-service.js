const wiServiceName = 'wiBatchApiService';
const moduleName = 'wi-batch-api-service';

//const wiBatchURL = "http://192.168.0.91:33333";
const wiBatchURL = "http://batch.sflow.me";

const LIST_WF = wiBatchURL + "/workflow/list";
const LIST_WH = wiBatchURL + "/well-header/list-file";
const LIST_WT = wiBatchURL + "/well-top/list-file";
const RUN_WH = wiBatchURL + "/well-header/run";
const RUN_WT = wiBatchURL + "/well-top/run";
const DELETE_DATADIR = wiBatchURL + "/workflow/delete-data";
const DELETE_WELL_HEADER_CSV = wiBatchURL + "/well-header/delete";
const DELETE_WELL_TOP_CSV = wiBatchURL + "/well-top/delete";
const UPLOAD_WELL_HEADER = wiBatchURL + "/well-header/upload";
const UPLOAD_WELL_TOP = wiBatchURL + "/well-top/upload";
let app = angular.module(moduleName, []);
app.factory(wiServiceName, function ($http, Upload) {
    return new WiBatchApi($http, Upload);
});

function WiBatchApi($http, Upload) {
    this.$http = $http;
    this.Upload = Upload;
}

WiBatchApi.prototype.doPost = function(url, paramObj, callback) {
    this.$http({
        method: 'POST',
        url: url,
        headers: {
            Authorization: window.localStorage.getItem('token')
        },
        data: paramObj
    }).then(function(response) {
        if (response.data.code != 200) {
            callback(new Error(response.data.reason));
        }
        else {
            callback(null, response.data.content);
        }
    }, function(err) {
        callback(err);
    });
}

WiBatchApi.prototype.listWorkflows = function(callback) {
    this.doPost(LIST_WF, null, callback);
    /*
    this.$http({
        method: 'POST',
        url: LIST_WF,
        headers: {
            Authorization: window.localStorage.getItem('token')
        }
    }).then(function(response) {
        if (response.data.code != 200) {
            callback(new Error(response.data.reason));
        }
        else {
            callback(null, response.data.content);
        }
    }, function(err) {
        callback(err);
    });
    */
}
WiBatchApi.prototype.deleteDataDir = function(dataDir, callback) {
    this.doPost(DELETE_DATADIR, {dataDir}, callback);
/*
    this.$http({
        method: 'POST',
        url: DELETE_DATADIR,
        headers: {
            Authorization: window.localStorage.getItem('token')
        },
        data: {
            dataDir: dataDir
        }
    }).then(function(response) {
        if (response.data.code != 200) {
            callback(new Error(response.data.reason));
        }
        else {
            callback(null, response.data.content);
        }
    }, function(err) {
        callback(err);
    });
*/
}
WiBatchApi.prototype.uploadFile = function(uploadRoute, file, callback) {
    this.Upload.upload({
        url: uploadRoute,
        headers: {
            'Referrer-Policy': 'no-referrer',
            'Authorization': window.localStorage.getItem('token')
        },
        data: {file:file}
    }).then(function(response) {
        if (response.data.code != 200) {
            callback(new Error(response.data.reason));
        }
        else {
            callback(null, response.data.content);
        }
    }, function(err) {
        callback(err);
    }, function (evt) {
        let progress = Math.round(100.0 * evt.loaded / evt.total);
        console.log('evt upload', progress);
    });
}

WiBatchApi.prototype.uploadWellHeader = function(file, callback) {
    this.uploadFile(UPLOAD_WELL_HEADER, file, callback);
}

WiBatchApi.prototype.uploadWellTop = function(file, callback) {
    this.uploadFile(UPLOAD_WELL_TOP, file, callback);
}

WiBatchApi.prototype.listWellHeaderCSVs = function(callback) {
    this.doPost(LIST_WH, undefined, callback);
}
WiBatchApi.prototype.listWellTopCSVs = function(callback) {
    this.doPost(LIST_WT, undefined, callback);
}
WiBatchApi.prototype.deleteWellHeaderCSV = function(idUserFileUploaded, callback) {
    this.doPost(DELETE_WELL_HEADER_CSV, {idUserFileUploaded}, callback);
}
WiBatchApi.prototype.deleteWellTopCSV = function(idUserFileUploaded, callback) {
    this.doPost(DELETE_WELL_TOP_CSV, {idUserFileUploaded}, callback);
}
WiBatchApi.prototype.runImportWellHeaderCSV = function(idUserFileUploaded, callback) {
    this.doPost(RUN_WH, {idUserFileUploaded}, callback);
}
WiBatchApi.prototype.runImportWellTopCSV = function(projectName, idUserFileUploaded, callback) {
    this.doPost(RUN_WT, {idUserFileUploaded, projectName}, callback);
}

WiBatchApi.prototype.getWiBatchUrl = function() { return wiBatchURL; }
exports.name = moduleName;
exports.wiBatchUrl = wiBatchURL;
