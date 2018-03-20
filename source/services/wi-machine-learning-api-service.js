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

const TRAIN_MODEL = wiMachineLearningURL + "/model/train";
const SAVE_MODEL = wiMachineLearningURL + "/model/save";
const PREDICT = wiMachineLearningURL + "/predict";


let app = angular.module(moduleName, []);

app.factory(wiServiceName, function ($http, Upload, wiComponentService) {
    this.wiComponentService = wiComponentService;
    return new WiMachineLearningApi($http, Upload, this.wiComponentService);
});

function WiMachineLearningApi($http, Upload, wiComponentService) {
    this.$http = $http;
    this.Upload = Upload;
    this.wiComponentService = wiComponentService;
}

WiMachineLearningApi.prototype.doPost = function(url, paramObj, callback) {
    let wiComponentService = this.wiComponentService;
    wiComponentService.getComponent('SPINNER').show();
    this.$http({
        method: 'POST',
        url: url,
        data: paramObj
    }).then(function(response) {
        wiComponentService.getComponent('SPINNER').hide();
        console.log(response);
        if(response.data.status != 200) {
            toastr.error(response.data.content);
            callback(null);
        }
        else
            callback(response.data.content);
    }, function(err) {
        wiComponentService.getComponent('SPINNER').hide();
        console.log(err);
        toastr.error(err.message);
        callback(null);
    });
}

WiMachineLearningApi.prototype.trainModel = function(payload, callback) {
    this.doPost(TRAIN_MODEL, payload, callback);
}

WiMachineLearningApi.prototype.saveModel = function(payload, callback) {
    this.doPost(SAVE_MODEL, payload, callback);
}

WiMachineLearningApi.prototype.predict = function(payload, callback) {
    this.doPost(PREDICT, payload, callback);
}

WiMachineLearningApi.prototype.getwiMachineLeaningUrl = function() { return wiMachineLeaningURL; }
exports.name = moduleName;
exports.wiMachineLearningUrl = wiMachineLearningURL;