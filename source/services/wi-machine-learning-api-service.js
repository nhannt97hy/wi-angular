const wiServiceName = 'wiMachineLearningApiService';
const moduleName = 'wi-machine-learning-api-service';

var __USERINFO = {
    username: null,
    token: null,
    refreshToken: null
};

function getAuthInfo() {
    __USERINFO.username = window.localStorage.getItem('username');
    __USERINFO.token = window.localStorage.getItem('token');
    __USERINFO.refreshToken = window.localStorage.getItem('refreshToken');
}
getAuthInfo();

const wiMachineLearningURL = "http://54.169.13.92:3002/store/api";

const LIST_MODEL = wiMachineLearningURL + "/model/list";
const TRAIN_MODEL = wiMachineLearningURL + "/model/new";
const RETRAIN_MODEL = wiMachineLearningURL + "/model/retrain";
const PREDICT = wiMachineLearningURL + "/predict";


let app = angular.module(moduleName, []);

app.factory(wiServiceName, function ($http, Upload) {
    return new WiMachineLearningApi($http, Upload);
});

function WiMachineLearningApi($http, Upload) {
    this.$http = $http;
    this.Upload = Upload;
}

WiMachineLearningApi.prototype.doPost = function(url, paramObj, callback) {
    this.$http({
        method: 'POST',
        url: url,
        data: paramObj
    }).then(function(response) {
        callback(response.data);
    }, function(err) {
        callback({statusCode: 400, content: err});
    });
}

WiMachineLearningApi.prototype.listModel = function(callback) {
    this.doPost(LIST_MODEL, {username: __USERINFO.username}, callback);
}

WiMachineLearningApi.prototype.trainModel = function(payload, callback) {
    this.doPost(TRAIN_MODEL, payload, callback);
}

WiMachineLearningApi.prototype.retrainModel = function(payload, callback) {
    this.doPost(RETRAIN_MODEL, payload, callback);
}

WiMachineLearningApi.prototype.predict = function(payload, callback) {
    this.doPost(PREDICT, payload, callback);
}

WiMachineLearningApi.prototype.getwiMachineLeaningUrl = function() { return wiMachineLeaningURL; }
exports.name = moduleName;
exports.wiMachineLearningUrl = wiMachineLearningURL;