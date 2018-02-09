const wiServiceName = 'wiBatchApiService';
const moduleName = 'wi-batch-api-service';

//const wiBatchURL = "http://192.168.0.91:33333";
const wiBatchURL = "http://batch.sflow.me";

const LIST_WF = wiBatchURL + "/workflow/list";
const DELETE_DATADIR = wiBatchURL + "/workflow/delete-data";
let app = angular.module(moduleName, []);
app.factory(wiServiceName, function ($http) {
    return new WiBatchApi($http);
});

function WiBatchApi($http) {
    this.$http = $http;
}

WiBatchApi.prototype.listWorkflows = function(callback) {
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
}
WiBatchApi.prototype.deleteDataDir = function(dataDir, callback) {
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
}
WiBatchApi.prototype.getWiBatchUrl = function() { return wiBatchURL; }
exports.name = moduleName;
