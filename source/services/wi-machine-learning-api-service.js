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

//const machineLearningUrl = "http://54.169.13.92:3002/atore/api"
//const mlToolkitUrl = "http://54.169.13.92:4002/wipm/api/task/regression";
const mlToolkitUrl = "http://13.251.24.65:4002/wipm/api/task/regression";


const ML_TOOL_KIT = {
    TRAIN: mlToolkitUrl + '/curve/model',
    PREDICT_CURVE: mlToolkitUrl + '/curve/predict',
    PREDICT_ANFIS: mlToolkitUrl + '/anfis/predict',
    PREDICT_FACIES:  mlToolkitUrl + '/faces/predict'
}

const URL = ML_TOOL_KIT;
//const wiMachineLearningURL = machineLearningUrl;
const wiMachineLearningURL = mlToolkitUrl;;

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
            toastr.error(response.data.message);
            callback(null);
        }
        else
            callback(response.data);
    }, function(err) {
        wiComponentService.getComponent('SPINNER').hide();
        console.log(err);
        toastr.error(err.message);
        callback(null);
    });
}

WiMachineLearningApi.prototype.trainModel = function(payload, callback) {
    this.doPost(URL.TRAIN, payload, callback);
}

// WiMachineLearningApi.prototype.saveModel = function(payload, callback) {
//     this.doPost(SAVE_MODEL, payload, callback);
// }

WiMachineLearningApi.prototype.predictCurve = function(payload, callback) {
    this.doPost(URL.PREDICT_CURVE, payload, callback);
}

WiMachineLearningApi.prototype.predictAnfis = function(payload, callback) {
    this.doPost(URL.PREDICT_ANFIS, payload, callback);
}

WiMachineLearningApi.prototype.predictFacies = function(payload, callback) {
    this.doPost(URL.PREDICT_FACIES, payload, callback);
}

WiMachineLearningApi.prototype.getwiMachineLeaningUrl = function() { return wiMachineLeaningURL; }
exports.name = moduleName;
exports.wiMachineLearningUrl = wiMachineLearningURL;
