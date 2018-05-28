
const wiServiceName = 'wiOnlineInvService';
const moduleName = 'wi-online-inv-service';

let app = angular.module(moduleName, []);

// const BASE_URL = 'http://13.250.197.210';
const BASE_URL = 'http://inv.sflow.me';

// const BASE_URL = 'http://13.229.66.151';
//const BASE_URL = 'http://13.250.177.181';
// const BASE_URL = 'http://localhost:9000';
// const AUTHENTICATION_SERVICE = 'http://login.sflow.me';
const AUTHENTICATION_SERVICE = 'http://login.i2g.cloud';

// const AUTHENTICATION_SERVICE = 'http://localhost:2999';

// route: GET, CREATE, UPDATE, DELETE
const USER_INFO = '/user/info';

const EXPORT_WELL = '/export/well';

const UPLOAD_FILES = '/upload/lases';

// const LIST_FILES = '/user/files';
// const FILE_INFO = '/user/file/info';
// const EDIT_FILE = '/user/file/edit';
// const DELETE_FILE = '/user/file/delete';

const GET_INVENTORY = '/user/fullinfo';

const LIST_WELLS = '/user/wells';
const WELL_INFO = '/user/well/info';
const EDIT_WELL = '/user/well/edit';
const EDIT_WELL_HEADER = '/user/well/editHeader';
const DELETE_WELL = '/user/well/delete';

const LIST_DATASETS = '/user/well/datasets';
const DATASET_INFO = '/user/well/dataset/info';
const EDIT_DATASET = '/user/well/dataset/edit';
const DELETE_DATASET = '/user/well/dataset/delete';

const LIST_CURVES = '/user/well/dataset/curves';
const CURVE_INFO = '/user/well/dataset/curve/info';
const CURVE_DATA = '/user/well/dataset/curve/data';
const EDIT_CURVE = '/user/well/dataset/curve/edit';
const DELETE_CURVE = '/user/well/dataset/curve/delete';

function Service(baseUrl, $http, wiComponentService, Upload) {
    this.baseUrl = baseUrl;
    this.$http = $http;
    this.Upload = Upload;
    this.wiComponentService = wiComponentService;
    this.wiApiWorker = new wiApiWorker($http, wiComponentService);
}

Service.prototype.getUtils = function () {
    let utils = this.wiComponentService.getComponent(this.wiComponentService.UTILS);
    return utils;
}

/**
 * Construct wiApiWorker to handle numbers of request to server each time
 */
const WORKER_REQUEST_DELAY = 300; // 300ms
const MAXIMUM_REQUEST = 4;
var wiApiWorker = function ($http, wiComponentService) {
    var self = this;
    var timerHandle = null;
    this.jobQueue = [];
    //this.isFree = true;
    this.enqueueJob = function (newJob) {
        this.jobQueue.push(newJob);
        this.working();
    }
    this.currentRequestWorking = 0;
    this.$http = $http;
    this.wiComponentService = wiComponentService;
    this.dequeueJob = function () {
        return this.jobQueue.shift();
    }
    this.working = function () {
        if (self.isAvailable() && self.jobQueue.length) {
            var job = self.dequeueJob();
            var now = new Date();
            let silent = job.option && job.option.silent;
            self.startWorking(silent);
            // Uncomment this line below to debug
            // console.log('worker is now working with: ', job, "at: " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds() + ":" + now.getMilliseconds());
            // console.log('worker: current Request: ', self.currentRequestWorking);
            self.$http(job.request)
                .then(
                    function (response) {
                        if (!response.data) {
                            self.stopWorking();
                            return;
                        }
                        if (response.data.code == 200) {
                            if (job.callback) job.callback(response.data.content);
                        } else {
                            // job.callback(response.data.reason);
                            // if (response.data.reason) self.getUtils().error('Error: ' + response.data.reason);
                            throw response.data;
                        }
                        self.stopWorking();
                    })
                .catch(function (err) {
                    self.isFree = true;
                    if (err.status >= 500 || err.status < 0) {
                        self.getUtils().error('Error connecting to server!', function () {
                            job.callback && job.callback(null, err)
                        });
                        self.stopWorking();
                        return;
                    }
                    if (err.status == 401) {
                        self.stopWorking();
                        if (err.data.reason) self.getUtils().error(err.data.reason, function () {
                            window.localStorage.removeItem('token');
                            window.localStorage.removeItem('refreshToken');
                            window.localStorage.removeItem('username');
                            window.localStorage.removeItem('rememberAuth');
                            self.getUtils().doLogin(function () {
                                console.log('logged in');
                            });
                        });
                    } else {
                        self.stopWorking();
                        if (err.reason) self.getUtils().error(err.reason, function () {
                            job.callback && job.callback(null, err)
                        });
                        console.error(err);
                    }
                });

        }
        /*
        else if( self.jobQueue.length ) {
            setTimeout(function(){
                // console.log('worker: current Queued jobs: ', self.jobQueue);
                self.working();
            }, WORKER_REQUEST_DELAY); // delay 300ms before continue do request to server.
        } */
        else {
            if (!timerHandle) {
                timerHandle = setTimeout(function () {
                    // console.log('worker continue working after', WORKER_REQUEST_DELAY, 'ms');
                    self.working();
                }, WORKER_REQUEST_DELAY);
                timerHandle = null;
            }
        }
    }
}
wiApiWorker.prototype.startWorking = function (silent = false) {
    let self = this;
    self.wiComponentService.getComponent('SPINNER').show(silent);
    self.currentRequestWorking++;
    // if(self.currentRequestWorking >= MAXIMUM_REQUEST){
    //     self.isFree = false;
    // }
}
wiApiWorker.prototype.isAvailable = function () {
    return this.currentRequestWorking < MAXIMUM_REQUEST;
}
wiApiWorker.prototype.stopWorking = function () {
    let self = this;
    self.currentRequestWorking--;
    self.wiComponentService.getComponent('SPINNER').hide();
    // if(self.currentRequestWorking < MAXIMUM_REQUEST){
    //     self.isFree = true;
    // }
    self.working();
}
wiApiWorker.prototype.getUtils = Service.prototype.getUtils;

//add authenService parameter for using authenticate service
Service.prototype.post = function (route, payload, callback, option) {
    var self = this;
    for (const key in payload) {
       if (payload[key] != null && typeof payload[key] == 'object') {
           //    payload[key] = JSON.stringify(payload[key]);
           console.log('*********PAYLOAD WITH OBJECT**********', payload);
           break;
       }
    }
    let url = null;
    switch (option) {
        case 'auth':
            url = AUTHENTICATION_SERVICE + route;
            break;
        case 'processing':
            url = PROCESSING_SERVICE + route;
        default:
            url = self.baseUrl + route;
            break;
    }
    let requestObj = {
        url: url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Referrer-Policy': 'no-referrer',
            'Authorization': window.localStorage.getItem('token')
        },
        data: payload
    };
    let jobObj = {
        request: requestObj,
        callback: callback,
        option: option
    };
    self.wiApiWorker.enqueueJob(jobObj);
}
Service.prototype.delete = function (route, payload, callback, authenService) {
    var self = this;
    let requestObj = {
        url: authenService ? AUTHENTICATION_SERVICE + route : self.baseUrl + route,
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Referrer-Policy': 'no-referrer',
            'Authorization': window.localStorage.getItem('token')
        },
        data: payload
    };
    let jobObj = {
        request: requestObj,
        callback: callback
    };
    self.wiApiWorker.enqueueJob(jobObj);
}

Service.prototype.postWithFile = function (route, dataPayload) {
    var self = this;
    return new Promise(function (resolve, reject) {
        let configUpload = {
            url: self.baseUrl + route,
            headers: {
                'Referrer-Policy': 'no-referrer',
                'Authorization': window.localStorage.getItem('token')
            },
            arrayKey: '',
            data: dataPayload
        };
        self.wiComponentService.getComponent('SPINNER').show();
        self.Upload.upload(configUpload).then(
            function (responseSuccess) {
                if (responseSuccess.data && responseSuccess.data.code === 200 && responseSuccess.data.content) {
                    return resolve(responseSuccess.data.content);
                } else if (responseSuccess.data && responseSuccess.data.code === 401) {
                    window.localStorage.removeItem('token');
                    window.localStorage.removeItem('username');
                    window.localStorage.removeItem('password');
                    window.localStorage.removeItem('rememberAuth');
                    location.reload();
                } else if (responseSuccess.data && responseSuccess.data.reason) {
                    return reject(responseSuccess.data.reason);
                } else {
                    return reject('Response is invalid!');
                }
            },
            function (responseError) {
                if (responseError.data && responseError.data.content) {
                    return reject(responseError.data.reason);
                } else {
                    return reject(responseError);
                }
            },
            function (evt) {
                let progress = Math.round(100.0 * evt.loaded / evt.total);
                if (progress >= 100) {
                    self.wiComponentService.getComponent('SPINNER').hide();
                }
                console.log('evt upload', progress);
            }
        );
    });
}

Service.prototype.uploadFiles = function (payload, callback) {
    this.postWithFile(UPLOAD_FILES, payload)
        .then(function (response) {
            if (callback) callback(response);
        })
        .catch(function (err) {
            console.log(err);
            callback(err);
        })
}

Service.prototype.getInventory = function (callback) {
    this.post(GET_INVENTORY, {}, callback);
}

// well apis
Service.prototype.listWells = function (option, callback) {
    var payload = option || {};
    this.post(LIST_WELLS, payload, callback);
}

Service.prototype.wellInfo = function (idWell, callback) {
    this.post(WELL_INFO, {idWell: idWell}, callback);
}

Service.prototype.editWell = function (request, callback) {
    this.post(EDIT_WELL, request, callback);
}

Service.prototype.editWellHeader = function (request, callback) {
    this.post(EDIT_WELL_HEADER, request, callback);
}

Service.prototype.deleteWell = function (idWell, callback) {
    this.post(DELETE_WELL, {idWell: idWell}, callback);
}

// dataset apis
Service.prototype.listDatasets = function (idWell, callback) {
    this.post(LIST_DATASETS, {idWell: idWell}, callback);
}

Service.prototype.datasetInfo = function (idDataset, callback) {
    this.post(DATASET_INFO, {idDataset: idDataset}, callback);
}

Service.prototype.editDataset = function (dataset, callback) {
    this.post(EDIT_DATASET, dataset, callback);
}

Service.prototype.deleteDataset = function (idDataset, callback) {
    this.post(DELETE_DATASET, {idDataset: idDataset}, callback);
}

// curve apis
Service.prototype.listCurves = function (idDataset, callback) {
    this.post(LIST_CURVES, {idDataset: idDataset}, callback);
}

Service.prototype.curveInfo = function (idCurve, callback) {
    this.post(CURVE_INFO, {idCurve: idCurve}, callback);
}

Service.prototype.curveData = function (idCurve, callback) {
    this.post(CURVE_DATA, {idCurve: idCurve}, callback);
}

Service.prototype.editCurve = function (curve, callback) {
    this.post(EDIT_CURVE, curve, callback);
}

Service.prototype.deleteCurve = function (idCurve, callback) {
    this.post(DELETE_CURVE, {idCurve: idCurve}, callback);
}

Service.prototype.exportAllItems = function(idObj, callback){
    console.log('idObj', idObj);
    this.post(EXPORT_WELL, {idObjs: idObj}, callback);
}

Service.prototype.getFileUrl = function(url){
    return this.baseUrl + "/" + url;
}

Service.prototype.getCaptcha = function () {
    return AUTHENTICATION_SERVICE + "/captcha.png";
};


app.factory(wiServiceName, function ($http, wiComponentService, Upload) {
    return new Service(BASE_URL, $http, wiComponentService, Upload);
});
exports.name = moduleName;
