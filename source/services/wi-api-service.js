const wiServiceName = 'wiApiService';
const moduleName = 'wi-api-service';

var __USERINFO = {
    username: null,
    token: null,
    refreshToken: null
};

function getAuthInfo () {
    __USERINFO.username = window.localStorage.getItem('username');
    __USERINFO.token = window.localStorage.getItem('token');
    __USERINFO.refreshToken = window.localStorage.getItem('refreshToken');
}
getAuthInfo();

let app = angular.module(moduleName, []);

//dev
const BASE_URL = 'http://dev.sflow.me';
const AUTHENTICATION_SERVICE = 'http://login.sflow.me';
const PROCESSING_SERVICE = 'http://54.169.13.92';
const INVENTORY_SERVICE = 'http://inv.sflow.me';

//production
// const BASE_URL = 'http://wi.i2g.cloud';
// const AUTHENTICATION_SERVICE = 'http://login.i2g.cloud';
// const PROCESSING_SERVICE = 'http://54.169.13.92';
// const INVENTORY_SERVICE = 'http://inv.sflow.me';

//local
// const BASE_URL = 'http://localhost:3000';
// const AUTHENTICATION_SERVICE = 'http://login.sflow.me';
// const PROCESSING_SERVICE = 'http://54.169.13.92';
// const INVENTORY_SERVICE = 'http://inv.sflow.me';

// route: GET, CREATE, UPDATE, DELETE
const REGISTER = '/register';
const LOGIN = '/login';
const DATABASE_UPDATE = '/database/update';
const REFRESH_TOKEN = '/refresh-token';

const UPLOAD_MULTIFILES = '/files';
const UPLOAD_MULTIFILES_PREPARE = '/files/prepare';
const UPLOAD_FILE = '/file-1';
const UPLOAD_IMAGE = '/image-upload';
const UPLOAD_PLOT_TEMPLATE = '/project/well/plot/import';
const UPLOAD_PLOT_TRACK_TEMPLATE = '/project/well/plot/track/import';

const IMPORT_FILE = '/file-2';
const GET_PROJECT = '/project/fullinfo';
const CREATE_PROJECT = '/project/new';
const GET_PROJECT_LIST = '/project/list';
const GET_PROJECT_INFO = '/project/info';

const CREATE_WELL = '/project/well/new';
const EDIT_WELL = '/project/well/edit';
const DELETE_WELL = '/project/well/delete';
const INFO_WELL = '/project/well/info';

const CREATE_DATASET = '/project/well/dataset/new';
const EDIT_DATASET = '/project/well/dataset/edit';
const DELETE_DATASET = '/project/well/dataset/delete';

const INFO_CURVE = '/project/well/dataset/curve/info';
const DATA_CURVE = '/project/well/dataset/curve/getData';
const EXPORT_CURVE = '/project/well/dataset/curve/export';
const CREATE_CURVE = '/project/well/dataset/curve/new';
const EDIT_CURVE = '/project/well/dataset/curve/edit';
const DELETE_CURVE = '/project/well/dataset/curve/delete';
const COPY_CURVE = '/project/well/dataset/curve/copy';
const CUT_CURVE = '/project/well/dataset/curve/move';
const SCALE_CURVE = '/project/well/dataset/curve/scale';
const EDIT_DATA_CURVE = '/project/well/dataset/curve/updateData';

const PROCESSING_DATA_CURVE = '/project/well/dataset/curve/processing';

const FAMILY_LIST = '/family/list';

const CREATE_PLOT = '/project/well/plot/new';
const EDIT_PLOT = '/project/well/plot/edit';
const DELETE_PLOT = '/project/well/plot/delete';
const GET_PLOT = '/project/well/plot/info';
const DUPLICATE_PLOT = '/project/well/plot/duplicate';
const EXPORT_PLOT = '/project/well/plot/export';
const EXPORT_PLOT_TRACK = '/project/well/plot/track/export';
const SAVE_PLOT_AS = '/project/well/plot/save-as';

const CREATE_LOG_TRACK = '/project/well/plot/track/new';
const DELETE_LOG_TRACK = '/project/well/plot/track/delete';
const GET_LOG_TRACK = '/project/well/plot/track/info';
const EDIT_TRACK = '/project/well/plot/track/edit';
const DUPLICATE_LOG_TRACK = '/project/well/plot/track/duplicate';

const CREATE_DEPTH_AXIS = '/project/well/plot/depth-axis/new';
const DELETE_DEPTH_AXIS = '/project/well/plot/depth-axis/delete';
const GET_DEPTH_AXIS = '/project/well/plot/depth-axis/info';
const EDIT_DEPTH_AXIS = '/project/well/plot/depth-axis/edit';

const CREATE_LINE = '/project/well/plot/track/line/new';
const DELETE_LINE = '/project/well/plot/track/line/delete';
const EDIT_LINE = '/project/well/plot/track/line/edit';
const GET_LINE = '/project/well/plot/track/line/info';

const CREATE_SHADING = '/project/well/plot/track/shading/new';
const DELETE_SHADING = '/project/well/plot/track/shading/delete';
const EDIT_SHADING = '/project/well/plot/track/shading/edit';
const GET_SHADING = '/project/well/plot/track/shading/info';

const CREATE_MARKER = '/project/well/plot/track/marker/new';
const EDIT_MARKER = '/project/well/plot/track/marker/edit';
const GET_MARKER = '/project/well/plot/track/marker/info';
const DELETE_MARKER = '/project/well/plot/track/marker/delete';

const CREATE_ANNOTATION = '/project/well/plot/track/annotation/new';
const EDIT_ANNOTATION = '/project/well/plot/track/annotation/edit';
const GET_ANNOTATION = '/project/well/plot/track/annotation/info';
const DELETE_ANNOTATION = '/project/well/plot/track/annotation/delete';

const CREATE_ZONE_TRACK = '/project/well/plot/zone-track/new';
const EDIT_ZONE_TRACK = '/project/well/plot/zone-track/edit';
const GET_ZONE_TRACK = '/project/well/plot/zone-track/info';
const DELETE_ZONE_TRACK = '/project/well/plot/zone-track/delete';

const CREATE_ZONE_SET = '/project/well/zone-set/new';
const LIST_ZONE_SET = '/project/well/zone-set/list';
const EDIT_ZONE_SET = '/project/well/zone-set/edit';
const GET_ZONE_SET = '/project/well/zone-set/info';
const DELETE_ZONE_SET = '/project/well/zone-set/delete';

const CREATE_ZONE = '/project/well/zone-set/zone/new';
const EDIT_ZONE = '/project/well/zone-set/zone/edit';
const GET_ZONE = '/project/well/zone-set/zone/info';
const DELETE_ZONE = '/project/well/zone-set/zone/delete';

const CREATE_IMAGE_TRACK = '/project/well/plot/image-track/new';
const EDIT_IMAGE_TRACK = '/project/well/plot/image-track/edit';
const GET_IMAGE_TRACK = '/project/well/plot/image-track/info';
const DELETE_IMAGE_TRACK = '/project/well/plot/image-track/delete';

const CREATE_IMAGE = '/project/well/plot/image-track/image/new';
const EDIT_IMAGE = '/project/well/plot/image-track/image/edit';
const GET_IMAGE = '/project/well/plot/image-track/image/info';
const DELETE_IMAGE = '/project/well/plot/image-track/image/delete';
const LIST_IMAGE_OF_TRACK = '/project/well/plot/image-track/image/list';

const GET_IMAGE_GALLERY = '/image-list';

const CREATE_CROSSPLOT = '/project/well/cross-plot/new';
const EDIT_CROSSPLOT = '/project/well/cross-plot/edit';
const GET_CROSSPLOT = '/project/well/cross-plot/info';
const DELETE_CROSSPLOT = '/project/well/cross-plot/delete';
const DUPLICATE_CROSSPLOT = '/project/well/cross-plot/duplicate';
const SAVE_CROSSPLOT_AS = '/project/well/cross-plot/save-as';

const CREATE_POINTSET = '/project/well/cross-plot/point-set/new';
const EDIT_POINTSET = '/project/well/cross-plot/point-set/edit';
const GET_POINTSET = '/project/well/cross-plot/point-set/info';
const DELETE_POINTSET = '/project/well/cross-plot/point-set/delete';

const CREATE_POLYGON = '/project/well/cross-plot/polygon/new';
const EDIT_POLYGON = '/project/well/cross-plot/polygon/edit';
const GET_POLYGON = '/project/well/cross-plot/polygon/info';
const DELETE_POLYGON = '/project/well/cross-plot/polygon/delete';

const CREATE_REGRESSIONLINES = '/project/well/cross-plot/regression-line/new';
const EDIT_REGRESSIONLINES = '/project/well/cross-plot/regression-line/edit';
const GET_REGRESSIONLINES = '/project/well/cross-plot/regression-line/info';
const DELETE_REGRESSIONLINES = '/project/well/cross-plot/regression-line/delete';

const GET_PALETTES = '/pal/all';

const CREATE_HISTOGRAM = '/project/well/histogram/new';
const EDIT_HISTOGRAM = '/project/well/histogram/edit';
const GET_HISTOGRAM = '/project/well/histogram/info';
const DELETE_HISTOGRAM = '/project/well/histogram/delete';
const DUPLICATE_HISTOGRAM = '/project/well/histogram/duplicate';
const SAVE_HISTOGRAM_AS = '/project/well/histogram/save-as';

const CREATE_REF_CURVE = '/project/well/reference-curve/new';
const EDIT_REF_CURVE = '/project/well/reference-curve/edit';
const GET_REF_CURVE = '/project/well/reference-curve/info';
const DELETE_REF_CURVE = '/project/well/reference-curve/delete';

const CREATE_USER_DEFINE_LINE = '/project/well/cross-plot/user-define-line/new';
const EDIT_USER_DEFINE_LINE = '/project/well/cross-plot/user-define-line/edit';
const GET_USER_DEFINE_LINE = '/project/well/cross-plot/user-define-line/info';
const DELETE_USER_DEFINE_LINE = '/project/well/cross-plot/user-define-line/delete';

const CREATE_TERNARY = '/project/well/cross-plot/ternary/new';
const EDIT_TERNARY = '/project/well/cross-plot/ternary/edit';
const GET_TERNARY = '/project/well/cross-plot/ternary/info';
const DELETE_TERNARY = '/project/well/cross-plot/ternary/delete';

const GET_CUSTOM_FILLS = '/custom-fill/all';
const SAVE_CUSTOM_FILLS = '/custom-fill/save';

const CREATE_COMBINED_BOX = '/project/well/combined-box/new';
const EDIT_COMBINED_BOX = '/project/well/combined-box/edit';
const GET_COMBINED_BOX = '/project/well/combined-box/info';
const DELETE_COMBINED_BOX = '/project/well/combined-box/delete';

const CREATE_COMBINED_BOX_TOOL = '/project/well/combined-box/tool/new';
const EDIT_COMBINED_BOX_TOOL = '/project/well/combined-box/tool/edit';
const GET_COMBINED_BOX_TOOL = '/project/well/combined-box/tool/info';
const DELETE_COMBINED_BOX_TOOL = '/project/well/combined-box/tool/delete';
const LIST_COMBINED_BOX_TOOL = '/project/well/combined-box/tool/list';

const DUSTBIN = '/dustbin';
const RESTORE_OBJECT = '/dustbin/restore';
const DELETE_OBJECT = '/dustbin/delete';

const CREATE_GROUP = '/project/group/new';
const EDIT_GROUP = '/project/group/edit';
const DELETE_GROUP = '/project/group/delete';
const GET_GROUP = '/project/group/info';

const CREATE_OBJECT_TRACK = '/project/well/plot/object-track/new/';
const GET_OBJECT_TRACK = '/project/well/plot/object-track/info/';
const EDIT_OBJECT_TRACK = '/project/well/plot/object-track/edit/';
const DELETE_OBJECT_TRACK = '/project/well/plot/object-track/delete/';

const CREATE_OBJECT_OF_OBJECT_TRACK = '/project/well/plot/object-track/object/new/';
const GET_OBJECT_OF_OBJECT_TRACK = '/project/well/plot/object-track/object/info/';
const EDIT_OBJECT_OF_OBJECT_TRACK = '/project/well/plot/object-track/object/edit/';
const DELETE_OBJECT_OF_OBJECT_TRACK = '/project/well/plot/object-track/object/delete/';

const LIST_OVERLAY_LINE = '/project/well/cross-plot/overlay-line/list/'
const GET_OVERLAY_LINE = '/project/well/cross-plot/overlay-line/info/'

const GET_INVENTORY = '/user/fullinfo';

function Service(baseUrl, $http, wiComponentService, Upload) {
    this.baseUrl = baseUrl;
    this.$http = $http;
    this.Upload = Upload;
    this.wiComponentService = wiComponentService;

    this.wiApiWorker = new wiApiWorker($http, wiComponentService);
}

Service.prototype.BASE_URL = BASE_URL;

Service.prototype.GET_PROJECT = GET_PROJECT; //'/project/fullinfo';
Service.prototype.DATA_CURVE = DATA_CURVE; //'/project/well/dataset/curve/getData';

Service.prototype.DELETE_WELL = DELETE_WELL; //'/project/well/delete';

Service.prototype.CREATE_PLOT = CREATE_PLOT; //'/project/well/plot/new';
Service.prototype.EDIT_PLOT = EDIT_PLOT; //'/project/well/plot/edit';
Service.prototype.DELETE_PLOT = DELETE_PLOT; //'/project/well/plot/delete';
Service.prototype.GET_PLOT = GET_PLOT; //'/project/well/plot/info';

Service.prototype.CREATE_LOG_TRACK = CREATE_LOG_TRACK;
Service.prototype.DELETE_LOG_TRACK = DELETE_LOG_TRACK;
Service.prototype.GET_LOG_TRACK = GET_LOG_TRACK; //'/project/well/plot/track/info';

Service.prototype.CREATE_DEPTH_AXIS = CREATE_DEPTH_AXIS; //'/project/well/plot/depth-axis/new';
Service.prototype.DELETE_DEPTH_AXIS = DELETE_DEPTH_AXIS;//'/project/well/plot/depth-axis/delete';
Service.prototype.GET_DEPTH_AXIS = GET_DEPTH_AXIS; //'/project/well/plot/depth-axis/info';
Service.prototype.EDIT_DEPTH_AXIS = EDIT_DEPTH_AXIS; // '/project/well/plot/depth-axis/edit';
Service.prototype.CREATE_LINE = CREATE_LINE; //'/project/well/plot/track/line/new';
Service.prototype.DELETE_LINE = DELETE_LINE;
Service.prototype.EDIT_LINE = EDIT_LINE;
Service.prototype.GET_LINE = GET_LINE;

Service.prototype.CREATE_SHADING = CREATE_SHADING;
Service.prototype.DELETE_SHADING = DELETE_SHADING;
Service.prototype.EDIT_SHADING = EDIT_SHADING;
Service.prototype.GET_SHADING = GET_SHADING;

Service.prototype.EDIT_TRACK = EDIT_TRACK;

Service.prototype.CREATE_HISTOGRAM = CREATE_HISTOGRAM;
Service.prototype.EDIT_HISTOGRAM = EDIT_HISTOGRAM;
Service.prototype.DELTE_HISTOGRAM = DELETE_HISTOGRAM;

Service.prototype.GET_PALETTES = GET_PALETTES;
Service.prototype.GET_CUSTOM_FILLS = GET_CUSTOM_FILLS;
Service.prototype.SAVE_CUSTOM_FILLS = SAVE_CUSTOM_FILLS;

Service.prototype.getUtils = function () {
    let utils = this.wiComponentService.getComponent(this.wiComponentService.UTILS);
    // console.log(utils);
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
                                getAuthInfo();
                            });
                        });
                    } else {
                        self.stopWorking();
                        if (err.reason) toastr.error(err.reason);
                        job.callback && job.callback(null, err)
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
            break;
        case 'inventory':
            url = INVENTORY_SERVICE + route;
            break;
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
            'Authorization': __USERINFO.token
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
            'Authorization': __USERINFO.token
        },
        data: payload
    };
    let jobObj = {
        request: requestObj,
        callback: callback
    };
    self.wiApiWorker.enqueueJob(jobObj);
}
/*
Service.prototype.post = function (route, payload) {
    var self = this;
    return new Promise(function (resolve, reject) {
        let request = {
            url: self.baseUrl + route,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Referrer-Policy': 'no-referrer',
                'Authorization': __USERINFO.token
            },
            data: payload
        };

        self.$http(request).then(
            function (rudesponse) {
                if (response.data && response.data.code === 200) {
                    return resolve(response.data.content);
                }else if (response.data && response.data.code === 401){
                    window.localStorage.removeItem('token');
                    window.localStorage.removeItem('username');
                    window.localStorage.removeItem('password');
                    window.localStorage.removeItem('rememberAuth');
                    location.reload();
                }else if (response.data) {
                    return reject(response.data.reason);
                } else {
                    return reject('Something went wrong!');
                }
            },
            reject
        );
    });
}

Service.prototype.delete = function (route, payload) {
    var self = this;
    return new Promise(function (resolve, reject) {
        let request = {
            url: self.baseUrl + route,
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Referrer-Policy': 'no-referrer',
                'Authorization': __USERINFO.token
            },
            data: payload
        };

        self.$http(request).then(
            function (response) {
                if (response.data && response.data.code === 200) {
                    return resolve(response.data.content);
                }else if (response.data && response.data.code === 401){
                    window.localStorage.removeItem('token');
                    window.localStorage.removeItem('username');
                    window.localStorage.removeItem('password');
                    window.localStorage.removeItem('rememberAuth');
                    location.reload();
                } else if (response.data) {
                    return reject(response.data.reason);
                } else {
                    return reject('Something went wrong!');
                }
            },
            reject
        );
    });
}
*/

Service.prototype.login = function (data, callback) {
    if (!data || !callback) return;
    let self = this;
    this.post(LOGIN, data, callback, 'auth');
}
Service.prototype.register = function (data, callback) {
    if (!data || !callback) return;
    let self = this;
    console.log(data);
    this.post(REGISTER, data, callback, 'auth');
}
Service.prototype.createDatabase = function (data, callback){
    this.post(DATABASE_UPDATE, data, callback);
}
Service.prototype.dropDatabase = function (data, callback){
    this.delete(DATABASE_UPDATE, data, callback);
}
Service.prototype.refreshToken = function (refreshToken, callback) {
  if (!refreshToken) return;
  let self = this;
  this.post(REFRESH_TOKEN, {refresh_token: refreshToken}, function (res, err) {
    if (err) {
        if (err.code == 401) {
            self.getUtils().doLogin(function () {
                getAuthInfo();
            });
        }
        return;
    }
    window.localStorage.setItem('token', res.token);
    window.localStorage.setItem('refreshToken', res.refresh_token);
    getAuthInfo();
    callback && callback();
  },  'auth');
}
Service.prototype.postWithTemplateFile = function (dataPayload) {
    var self = this;
    return new Promise(function (resolve, reject) {
        let configUpload = {
            url: self.baseUrl + UPLOAD_PLOT_TEMPLATE,
            headers: {
                'Referrer-Policy': 'no-referrer',
                'Authorization': __USERINFO.token
            },
            data: dataPayload
        };

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
                console.log('evt upload', progress);
            }
        );
    });
}

Service.prototype.postWithTrackTemplateFile = function (dataPayload) {
    var self = this;
    return new Promise(function (resolve, reject) {
        let configUpload = {
            url: self.baseUrl + UPLOAD_PLOT_TRACK_TEMPLATE,
            headers: {
                'Referrer-Policy': 'no-referrer',
                'Authorization': __USERINFO.token
            },
            data: dataPayload
        };

        self.Upload.upload(configUpload).then(
            function (responseSuccess) {
                if (responseSuccess.data && responseSuccess.data.code === 200 && responseSuccess.data.content) {
                    return resolve(responseSuccess.data);
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
                console.log('evt upload', progress);
            }
        );
    });
}

Service.prototype.postWithFile = function (route, dataPayload, callback) {
    var self = this;
    return new Promise(function (resolve, reject) {
        let configUpload = {
            url: self.baseUrl + route,
            headers: {
                'Referrer-Policy': 'no-referrer',
                'Authorization': __USERINFO.token
            },
            data: dataPayload
        };

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
                console.log('evt upload', progress);
                if(callback) callback(progress);
            }
        );
    });
}

Service.prototype.uploadMultiFiles = function (dataPayload) {
    var self = this;
    return new Promise(function (resolve, reject) {
        let configUpload = {
            url: self.baseUrl + UPLOAD_MULTIFILES,
            headers: {
                'Referrer-Policy': 'no-referrer',
                'Authorization': __USERINFO.token
            },
            arrayKey: '',
            data: dataPayload
        };

        self.Upload.upload(configUpload).then(
            function (responseSuccess) {
                //console.log('response', responseSuccess);
                if (responseSuccess.data && responseSuccess.data.content) {
                    return resolve(responseSuccess.data.content);
                } else if (responseSuccess.data && responseSuccess.data.code === 401) {
                    window.localStorage.removeItem('token');
                    window.localStorage.removeItem('username');
                    window.localStorage.removeItem('password');
                    window.localStorage.removeItem('rememberAuth');
                    location.reload();
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
                console.log('evt upload', progress);
            }
        );
    });
}

Service.prototype.uploadMultiFilesPrepare = function (dataPayLoad, callback) {
    let self = this;
    let configUpload = {
        url: self.baseUrl + UPLOAD_MULTIFILES_PREPARE,
        headers: {
            'Referrer-Policy': 'no-referrer',
            'Authorization': __USERINFO.token
        },
        arrayKey: '',
        data: dataPayLoad
    };
    self.Upload.upload(configUpload).then(function (response) {
        if (response.data && response.data.content) {
            callback(response.data.content);
        } else if (response.data && response.data.code === 401) {
            window.localStorage.removeItem('token');
            window.localStorage.removeItem('username');
            window.localStorage.removeItem('password');
            window.localStorage.removeItem('rememberAuth');
            location.reload();
        } else {
            callback(null);
        }
    }).catch(function (err) {
        console.log(err);
        self.getUtils().error(err);
    });
}

// Service.prototype.uploadMultiFiles = function (dataPayLoad, callback) {
//     let self = this;
//     let configUpload = {
//         url: self.baseUrl + UPLOAD_MULTIFILES,
//         headers: {
//             'Referrer-Policy': 'no-referrer'
//         },
//         arrayKey: '',
//         data: dataPayLoad
//     };
//     self.Upload.upload(configUpload).then(function (response) {
//         callback(response.data.content);
//     }).catch(function (err) {
//         console.log(err);
//         self.getUtils().error(err);
//     });
// }

Service.prototype.uploadFile = function (data, callback) {
    let self = this;
    let returnData = {
        step: 0.1524,
        topDepth: 1119.8325,
        bottomDepth: 2184.8064,
        depthUnit: 'M',
        curves: [
            {
                lasName: 'DTCO3',
                unit: 'US/F'
            }, {
                lasName: 'ECGR',
                unit: 'GAPI'
            }
        ]
    };
    callback(returnData);
    /*this.postWithFile(UPLOAD_FILE, data)
        .then(function (returnData) {
            callback(returnData);
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });*/
}

Service.prototype.createProject = function (infoProject, callback) {
    console.log('infoProject', infoProject);
    this.post(CREATE_PROJECT, infoProject, callback);
}

Service.prototype.getProject = function (infoProject, callback) {
    console.log('infoProject', infoProject);
    this.post(GET_PROJECT, infoProject, callback);
}

Service.prototype.getProjectInfo = function (idProject, callback) {
    let self = this;
    if (__USERINFO.refreshToken) {
        this.refreshToken(__USERINFO.refreshToken, function () {
            self.post(GET_PROJECT_INFO, {idProject:idProject}, callback);
        });
    } else {
        self.post(GET_PROJECT_INFO, {idProject:idProject}, callback);
    }
}

Service.prototype.getProjectList = function (infoProject, callback) {
    this.post(GET_PROJECT_LIST, infoProject, callback);
}

Service.prototype.createWell = function (infoWell, callback) {
    console.log('infoWell', infoWell);
    this.post(CREATE_WELL, infoWell, callback);
}

Service.prototype.editWell = function (infoWell, callback) {
    let self = this;
    console.log('infoWell', infoWell);
    this.post(EDIT_WELL, infoWell, callback);
}

Service.prototype.removeWell = function (idWell, callback) {
    let self = this;
    let dataRequest = {
        idWell: idWell
    }
    this.delete(DELETE_WELL, dataRequest, callback);
}

Service.prototype.getWell = function (idWell, callback) {
    this.post(INFO_WELL, {idWell : idWell}, callback);
}

Service.prototype.createDataset = function (infoDataset, callback) {
    let self = this;
    let dataRequest = infoDataset;
    this.post(CREATE_DATASET, dataRequest, callback);
}
Service.prototype.editDataset = function (infoDataset, callback) {
    let self = this;
    this.post(EDIT_DATASET, infoDataset, callback);
}

Service.prototype.removeDataset = function (idDataset, callback) {
    let self = this;
    let dataRequest = {
        idDataset: idDataset
    }
    this.delete(DELETE_DATASET, dataRequest, callback);
}
//hoangbd start
Service.prototype.copyCurve = function (copyData, callback) {
    let self = this;
    this.post(COPY_CURVE, copyData, callback);
}
Service.prototype.cutCurve = function (cutData, callback) {
    let self = this;
    this.post(CUT_CURVE, cutData, callback);
}
//end hoangbd
Service.prototype.createCurve = function (curveInfo, callback) {
    let self = this;
    console.log(curveInfo);
    if (!curveInfo.initValue) curveInfo.initValue = '-2810';
    this.post(CREATE_CURVE, curveInfo, callback);
}

Service.prototype.editCurve = function (curveInfo, callback) {
    if (!curveInfo.initValue) curveInfo.initValue = '-2810';
    let self = this;
    console.log(curveInfo);
    this.post(EDIT_CURVE, curveInfo, callback);
}

Service.prototype.infoCurve = function (idCurve, callback) {
    let self = this;
    this.post(INFO_CURVE, {idCurve: idCurve}, callback);
}

Service.prototype.dataCurve = function (idCurve, callback) {
    let self = this;
    this.post(DATA_CURVE, {idCurve: idCurve}, callback);
}

Service.prototype.exportCurve = function (idCurve, callback) {
    let self = this;
    let dataRequest = {
        idCurve: idCurve
    }
    self.wiComponentService.getComponent('SPINNER').show();
    self.$http({
        url: self.baseUrl + EXPORT_CURVE,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Referrer-Policy': 'no-referrer',
            'Authorization': __USERINFO.token
        },
        responseType: "arraybuffer",
        data: dataRequest
    }).then(function (res) {
        self.wiComponentService.getComponent('SPINNER').hide();
        callback(res.data, res.headers('Content-Type'));

    }, function (err) {
        console.error(err);
        self.wiComponentService.getComponent('SPINNER').hide();
        self.getUtils().error("File not found!");
    });
}

Service.prototype.removeCurve = function (idCurve, callback) {
    let self = this;
    this.delete(DELETE_CURVE, {idCurve: idCurve}, callback);
}

Service.prototype.scaleCurve = function (idCurve, callback) {
    let self = this;
    let dataRequest = {
        idCurve: idCurve
    }
    this.post(SCALE_CURVE, dataRequest, callback);
}

Service.prototype.scaleCurvePromise = function (idCurve) {
    const self = this;
    try {
        return this.post(SCALE_CURVE, {idCurve: idCurve});
    } catch (err) {
        self.getUtils().error(err);
    }
}
Service.prototype.asyncScaleCurve = async function (idCurve) {
    const self = this;
    try {
        var scale = {};
        await new Promise(function (resolve, reject) {
            self.post(SCALE_CURVE, {idCurve: idCurve}, function (response) {
                scale = response;
                resolve(scale);
            });
        });
        return scale;
    } catch (err) {
        self.getUtils().error(err);
    }
}
Service.prototype.editDataCurve = function (request, callback) {
    const self = this;
    this.postWithFile(EDIT_DATA_CURVE, request)
        .then(function (response) {
            if (callback) callback(response);
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}

Service.prototype.processingDataCurve = function (request, callback, progressCb) {
    const self = this;
    this.postWithFile(PROCESSING_DATA_CURVE, request, progressCb)
        .then(function (response) {
            if (callback) callback(response);
        })
        .catch(function (err) {
            toastr.error(err);
            if (callback) callback(null, err);
        });
}

Service.prototype.listFamily = function (callback) {
    const self = this;
    this.post(FAMILY_LIST, {}, callback);
}

Service.prototype.familyUpdate = function (request, callback) {
    const self = this;
    this.post('/family/update-spec', request, callback);
}

Service.prototype.getLogplot = function (idLogplot, callback) {
    let self = this;
    this.post(GET_PLOT, {idPlot: idLogplot}, callback);
}
Service.prototype.editLogplot = function (infoLogplot, callback, option) {
    if (!infoLogplot.option) infoLogplot.option = '';
    let self = this;
    this.post(EDIT_PLOT, infoLogplot, callback, option);
}
Service.prototype.removeLogplot = function (idLogplot, callback) {
    let self = this;
    this.delete(DELETE_PLOT, {idPlot: idLogplot}, callback);
}

Service.prototype.createLogTrack = function (idPlot, orderNum, callback) {
    var self = this;
    let dataRequest = {
        idPlot: idPlot,
        orderNum: orderNum
    };
    this.post(CREATE_LOG_TRACK, dataRequest, callback);
}

Service.prototype.removeLogTrack = function (idTrack, callback) {
    var self = this;
    let dataRequest = {
        idTrack: idTrack
    };
    this.delete(DELETE_LOG_TRACK, dataRequest, callback);
}


Service.prototype.duplicateLogTrack = function (idTrack, callback) {
    var self = this;
    let dataRequest = {
        idTrack: idTrack
    };
    this.post(DUPLICATE_LOG_TRACK, dataRequest, callback);
}

Service.prototype.infoTrack = function (idTrack, callback) {
    let self = this;
    let dataRequest = {
        idTrack: idTrack
    };
    this.post(GET_LOG_TRACK, dataRequest, callback);
}

Service.prototype.editTrack = function (trackObj, callback) {
    var self = this;
    let dataRequest = trackObj;
    this.post(EDIT_TRACK, dataRequest, callback);
}


Service.prototype.createDepthTrack = function (idPlot, orderNum, callback) {
    var self = this;
    console.log("createDepthTrack", self);
    let dataRequest = {
        idPlot: idPlot,
        orderNum: orderNum,
        geogetryWidth: 1
    };
    this.post(CREATE_DEPTH_AXIS, dataRequest, callback);
}
Service.prototype.removeDepthTrack = function (idDepthAxis, callback) {
    var self = this;
    let dataRequest = {
        idDepthAxis: idDepthAxis
    };
    this.delete(DELETE_DEPTH_AXIS, dataRequest, callback);
}
Service.prototype.editDepthTrack = function (depthTrackObj, callback) {
    var self = this;
    let dataRequest = depthTrackObj;
    this.post(EDIT_DEPTH_AXIS, dataRequest, callback);
}

Service.prototype.removeLine = function (idLine, callback) {
    var self = this;
    let dataRequest = {
        idLine: idLine
    };
    this.delete(DELETE_LINE, dataRequest, callback);
}

Service.prototype.createLine = function (lineObj, callback) {
    var self = this;
    let dataRequest = lineObj;
    this.post(CREATE_LINE, dataRequest, callback);
}

Service.prototype.editLine = function (lineObj, callback) {
    var self = this;
    let dataRequest = lineObj;
    this.post(EDIT_LINE, dataRequest, callback);
}
Service.prototype.infoLine = function (idLine, callback) {
    let self = this;
    let dataRequest = {
        idLine: idLine
    };
    this.post(GET_LINE, dataRequest, callback);
}
Service.prototype.createShading = function (shadingObj, callback) {
    var self = this;
    let dataRequest = shadingObj;
    this.post(CREATE_SHADING, dataRequest, callback);
}
Service.prototype.editShading = function (shadingObj, callback) {
    let self = this;
    let dataRequest = shadingObj;

    this.post(EDIT_SHADING, dataRequest, callback);
}
Service.prototype.removeShading = function (idShading, callback) {
    var self = this;
    let dataRequest = {
        idShading: idShading
    };
    this.delete(DELETE_SHADING, dataRequest, callback);
}
Service.prototype.infoShading = function (idShading, callback) {
    let self = this;
    let dataRequest = {
        idShading: idShading
    };
    this.post(GET_SHADING, dataRequest, callback);
}

Service.prototype.createMarker = function (markerObj, callback) {
    var self = this;
    let dataRequest = markerObj;
    this.post(CREATE_MARKER, dataRequest, callback);
}
Service.prototype.editMarker = function (markerObj, callback) {
    let self = this;
    let dataRequest = markerObj;

    this.post(EDIT_MARKER, dataRequest, callback);
}
Service.prototype.getMarker = function (idMarker, callback) {
    let self = this;
    let dataRequest = {
        idMarker: idMarker
    };
    this.post(GET_MARKER, dataRequest, callback);
}
Service.prototype.removeMarker = function (idMarker, callback) {
    var self = this;
    let dataRequest = {
        idMarker: idMarker
    };
    this.delete(DELETE_MARKER, dataRequest, callback);
}

Service.prototype.createAnnotation = function (annotationObj, callback) {
    var self = this;
    let dataRequest = annotationObj;
    this.post(CREATE_ANNOTATION, dataRequest, callback);
}
Service.prototype.editAnnotation = function (annotationObj, callback) {
    let self = this;
    let dataRequest = annotationObj;
    this.post(EDIT_ANNOTATION, dataRequest, callback);
}
Service.prototype.getAnnotation = function (idAnnotation, callback) {
    let self = this;
    let dataRequest = {
        idAnnotation: idAnnotation
    };
    this.post(GET_ANNOTATION, dataRequest, callback);
}
Service.prototype.removeAnnotation = function (idAnnotation, callback) {
    var self = this;
    let dataRequest = {
        idAnnotation: idAnnotation
    };
    this.delete(DELETE_ANNOTATION, dataRequest, callback);
}

Service.prototype.uploadImage = function (data, callback) {
    let self = this;
    this.postWithFile(UPLOAD_IMAGE, data)
        .then(function (returnData) {
            callback(BASE_URL + returnData);
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}

Service.prototype.createZoneTrack = function (data, callback) {
    let self = this;
    this.post(CREATE_ZONE_TRACK, data, callback);
}
Service.prototype.editZoneTrack = function (data, callback) {
    let self = this;
    this.post(EDIT_ZONE_TRACK, data, callback);
}
Service.prototype.getZoneTrack = function (idZoneTrack, callback) {
    let self = this;
    this.post(GET_ZONE_TRACK, {idZoneTrack: idZoneTrack}, callback);
}
Service.prototype.removeZoneTrack = function (idZoneTrack, callback) {
    let self = this;
    this.delete(DELETE_ZONE_TRACK, {idZoneTrack: idZoneTrack}, callback);
}

Service.prototype.createZoneSet = function (data, callback) {
    let self = this;
    this.post(CREATE_ZONE_SET, data, callback);
}
Service.prototype.editZoneSet = function (data, callback) {
    let self = this;
    this.post(EDIT_ZONE_SET, data, callback);
}
Service.prototype.listZoneSet = function (idWell, callback) {
    let self = this;
    this.post(LIST_ZONE_SET, {idWell: idWell}, callback);
}
Service.prototype.getZoneSet = function (idZoneSet, callback) {
    let self = this;
    this.post(GET_ZONE_SET, {idZoneSet: idZoneSet}, callback);
}
Service.prototype.removeZoneSet = function (idZoneSet, callback) {
    let self = this;
    this.delete(DELETE_ZONE_SET, {idZoneSet: idZoneSet}, callback);
}


Service.prototype.createZone = function (data, callback) {
    let self = this;
    this.post(CREATE_ZONE, data, function (returnData) {
        if (callback) callback(returnData);
        // self.getUtils().refreshProjectState();
    });
}
Service.prototype.editZone = function (data, callback) {
    let self = this;
    this.post(EDIT_ZONE, data, function (returnData) {
        if (callback) callback();
        // self.getUtils().refreshProjectState();
    });
}
Service.prototype.getZone = function (idZone, callback) {
    let self = this;
    this.post(GET_ZONE, {idZone: idZone}, function (returnData) {
        if (callback) callback(returnData);
        // self.getUtils().refreshProjectState();
    });
}
Service.prototype.removeZone = function (idZone, callback) {
    let self = this;
    this.delete(DELETE_ZONE, {idZone: idZone}, function (returnData) {
        if (callback) callback();
        // self.getUtils().refreshProjectState();
    });
}

Service.prototype.getImageGallery = function (callback) {
    let self = this;
    this.post(GET_IMAGE_GALLERY, {}, function (data) {
        if (callback) {
            callback(data);
        }
    });
}

Service.prototype.createImageTrack = function (data, callback) {
    let self = this;
    this.post(CREATE_IMAGE_TRACK, data, callback);
}
Service.prototype.editImageTrack = function (data, callback) {
    let self = this;
    this.post(EDIT_IMAGE_TRACK, data, callback);
}
Service.prototype.getImageTrack = function (idImageTrack, callback) {
    let self = this;
    this.post(GET_IMAGE_TRACK, {idImageTrack: idImageTrack}, function(data) {
        if (callback) {
            callback(data);
        }
    });
}
Service.prototype.removeImageTrack = function (idImageTrack, callback) {
    let self = this;
    this.delete(DELETE_IMAGE_TRACK, {idImageTrack: idImageTrack}, callback);
}

Service.prototype.createImage = function (data, callback) {
    let self = this;
    this.post(CREATE_IMAGE, data, function (returnData) {
        if (callback) callback(returnData);
    });
}
Service.prototype.editImage = function (data, callback) {
    let self = this;
    this.post(EDIT_IMAGE, data, function (returnData) {
        callback(returnData);
    });
}
Service.prototype.getImage = function (idImageOfTrack, callback) {
    let self = this;
    this.post(GET_IMAGE, {idImageOfTrack: idImageOfTrack}, function (returnData) {
        callback(returnData);
    });
}
Service.prototype.removeImage = function (idImageOfTrack, callback) {
    let self = this;
    this.delete(DELETE_IMAGE, {idImageOfTrack: idImageOfTrack}, function () {
        callback();
    });
}

Service.prototype.getImagesOfTrack = function (idImageTrack, callback) {
    var self = this;
    this.post(LIST_IMAGE_OF_TRACK, {idImageTrack: idImageTrack}, callback);
}

Service.prototype.createCrossplot = function (data, callback) {
    let self = this;
    this.post(CREATE_CROSSPLOT, data, callback);
}
Service.prototype.editCrossplot = function (data, callback) {
    let self = this;
    this.post(EDIT_CROSSPLOT, data, callback);
}
Service.prototype.getCrossplot = function (idCrossPlot, callback) {
    let self = this;
    this.post(GET_CROSSPLOT, {idCrossPlot: idCrossPlot}, callback);
}
Service.prototype.removeCrossplot = function (idCrossPlot, callback) {
    let self = this;
    this.delete(DELETE_CROSSPLOT, {idCrossPlot: idCrossPlot}, callback);
}

Service.prototype.createPointSet = function (data, callback) {
    let self = this;
    this.post(CREATE_POINTSET, data, callback);
}
Service.prototype.editPointSet = function (data, callback) {
    let self = this;
    this.post(EDIT_POINTSET, data, callback);
}
Service.prototype.getPointSet = function (idPointSet, callback) {
    let self = this;
    this.post(GET_POINTSET, {idPointSet: idPointSet}, callback);
}
Service.prototype.removePointSet = function (idPointSet, callback) {
    let self = this;
    this.delete(DELETE_POINTSET, {idPointSet: idPointSet}, callback);
}

Service.prototype.createPolygon = function (data, callback) {
    let self = this;
    this.post(CREATE_POLYGON, data, callback);
}
Service.prototype.editPolygon = function (data, callback) {
    let self = this;
    this.post(EDIT_POLYGON, data, callback);
}
Service.prototype.getPolygon = function (idPolygon, callback) {
    let self = this;
    this.post(GET_POLYGON, {idPolygon: idPolygon}, callback);
}
Service.prototype.removePolygon = function (idPolygon, callback) {
    let self = this;
    this.delete(DELETE_POLYGON, {idPolygon: idPolygon}, callback);
    // this.delete(DELETE_POLYGON, { idPolygon: idPolygon })
    //     .then(function (returnData) {
    //         if (callback) {
    //             callback(returnData);
    //         }
    //     })
    //     .catch(function (err) {
    //         self.getUtils().error(err);
    //     });
}

Service.prototype.createRegressionLines = function (data, callback) {
    let self = this;
    this.post(CREATE_REGRESSIONLINES, data, callback);
}
Service.prototype.editRegressionLines = function (data, callback) {
    let self = this;
    this.post(EDIT_REGRESSIONLINES, data, callback);
}
Service.prototype.getRegressionLines = function (idRegressionLine, callback) {
    let self = this;
    this.post(GET_REGRESSIONLINES, {idRegressionLine: idRegressionLine}, callback);
}
Service.prototype.removeRegressionLines = function (idRegressionLine, callback) {
    let self = this;
    this.delete(DELETE_REGRESSIONLINES, {idRegressionLine: idRegressionLine}, callback);
}

// histogram apis
Service.prototype.createHistogram = function (data, callback) {
    let self = this;
    this.post(CREATE_HISTOGRAM, data, callback);
}
Service.prototype.editHistogram = function (data, callback) {
    let self = this;
    this.post(EDIT_HISTOGRAM, data, callback);
}
Service.prototype.getHistogram = function (idHistogram, callback) {
    let self = this;
    this.post(GET_HISTOGRAM, {idHistogram: idHistogram}, callback);
}
Service.prototype.removeHistogram = function (idHistogram, callback) {
    let self = this;
    this.delete(DELETE_HISTOGRAM, {idHistogram: idHistogram}, callback);
}

Service.prototype.duplicateLogplot = function (idPlot, idWell, callback) {
    const self = this;
    this.post(DUPLICATE_PLOT, {idPlot: idPlot, idWell: idWell}, callback);
}

Service.prototype.duplicateCrossPlot = function (idCrossPlot, idWell, callback){
    let self = this;
    this.post(DUPLICATE_CROSSPLOT, {idCrossPlot : idCrossPlot, idWell: idWell}, callback);
}

Service.prototype.duplicateHistogram = function (idHistogram, idWell, callback) {
    let self = this;
    this.post(DUPLICATE_HISTOGRAM, {idHistogram: idHistogram, idWell: idWell}, callback);
}

Service.prototype.savePlotAs = function (payload, callback) {
    let self = this;
    this.post(SAVE_PLOT_AS, payload, callback);
}

Service.prototype.saveCrossplotAs = function (payload, callback) {
    let self = this;
    this.post(SAVE_CROSSPLOT_AS, payload, callback);
}

Service.prototype.saveHistogramAs = function (payload, callback) {
    let self = this;
    this.post(SAVE_HISTOGRAM_AS, payload, callback);
}

Service.prototype.exportLogPlot = function (idPlot, callback) {
    //console.log("HIHIHIHIHIH");
    let self = this;
    let dataRequest = {
        idPlot: idPlot
    }
    self.wiComponentService.getComponent('SPINNER').show();
    self.$http({
        url: self.baseUrl + EXPORT_PLOT,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Referrer-Policy': 'no-referrer',
            'Authorization': __USERINFO.token
        },
        responseType: "arraybuffer",
        data: dataRequest
    }).then(function (res) {
        self.wiComponentService.getComponent('SPINNER').hide();
        callback(res.data, res.headers('Content-Type'));
    }, function (err) {
        console.error(err);
        self.wiComponentService.getComponent('SPINNER').hide();
        self.getUtils().error("File not found!");
    });
}
Service.prototype.exportLogTrack = function (data, callback) {
    let self = this;
    let dataRequest = data
    self.wiComponentService.getComponent('SPINNER').show();
    self.$http({
        url: self.baseUrl + EXPORT_PLOT_TRACK,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Referrer-Policy': 'no-referrer',
            'Authorization': __USERINFO.token
        },
        responseType: "arraybuffer",
        data: dataRequest
    }).then(function (res) {
        self.wiComponentService.getComponent('SPINNER').hide();
        callback(res.data, res.headers('Content-Type'));
    }, function (err) {
        console.error(err);
        self.wiComponentService.getComponent('SPINNER').hide();
        self.getUtils().error("File not found!");
    });
}
// reference_curve apis
Service.prototype.createRefCurve = function (data, callback) {
    let self = this;
    this.post(CREATE_REF_CURVE, data, callback);
}
Service.prototype.editRefCurve = function (data, callback) {
    let self = this;
    this.post(EDIT_REF_CURVE, data, callback);
}
Service.prototype.getRefCurve = function (idReferenceCurve, callback) {
    let self = this;
    this.post(GET_REF_CURVE, {idReferenceCurve: idReferenceCurve}, callback);
}
Service.prototype.removeRefCurve = function (idReferenceCurve, callback) {
    let self = this;
    this.delete(DELETE_REF_CURVE, {idReferenceCurve: idReferenceCurve}, callback);
}
//user define line apis
Service.prototype.createUserDefineLine = function (data, callback) {
    let self = this;
    this.post(CREATE_USER_DEFINE_LINE, data, callback);
}
Service.prototype.editUserDefineLine = function (data, callback) {
    let self = this;
    this.post(EDIT_USER_DEFINE_LINE, data, callback);
}
Service.prototype.getUserDefineLine = function (idUserDefineLine, callback) {
    let self = this;
    this.post(GET_USER_DEFINE_LINE, {idUserDefineLine: idUserDefineLine}, callback);
}
Service.prototype.removeUserDefineLine = function (idUserDefineLine, callback) {
    let self = this;
    this.delete(DELETE_USER_DEFINE_LINE, {idUserDefineLine: idUserDefineLine}, callback);
}

// combinedbox
Service.prototype.createCombinedBox = function (data, callback) {
    let self = this;
    this.post(CREATE_COMBINED_BOX, data, callback);
}
Service.prototype.editCombinedBox = function (data, callback) {
    let self = this;
    this.post(EDIT_COMBINED_BOX, data, callback);
}
Service.prototype.getCombinedBox = function (idCombinedBox, callback) {
    let self = this;
    this.post(GET_COMBINED_BOX, {idCombinedBox: idCombinedBox}, callback);
}
Service.prototype.removeCombinedBox = function (idCombinedBox, callback) {
    let self = this;
    this.delete(DELETE_COMBINED_BOX, {idCombinedBox: idCombinedBox}, callback);
}

// combinedbox tool
Service.prototype.createCombinedBoxTool = function (data, callback) {
    let self = this;
    this.post(CREATE_COMBINED_BOX_TOOL, data, callback);
}
Service.prototype.editCombinedBoxTool = function (data, callback) {
    let self = this;
    this.post(EDIT_COMBINED_BOX_TOOL, data, callback);
}
Service.prototype.getCombinedBoxTool = function (idCombinedBoxTool, callback) {
    let self = this;
    this.post(GET_COMBINED_BOX_TOOL, {idCombinedBoxTool: idCombinedBoxTool}, callback);
}
Service.prototype.removeCombinedBoxTool = function (idCombinedBoxTool, callback) {
    let self = this;
    this.delete(DELETE_COMBINED_BOX_TOOL, {idCombinedBoxTool: idCombinedBoxTool}, callback);
}
Service.prototype.listCombinedBoxTool = function (idCombinedBox, callback) {
    let self = this;
    this.post(LIST_COMBINED_BOX_TOOL, {idCombinedBox: idCombinedBox}, callback);
}


//ternary apis
Service.prototype.createTernary = function (data, callback) {
    let self = this;
    this.post(CREATE_TERNARY, data, callback);
}
Service.prototype.editTernary = function (data, callback) {
    let self = this;
    this.post(EDIT_TERNARY, data, callback);
}
Service.prototype.getTernary = function (idTernary, callback) {
    let self = this;
    this.post(GET_TERNARY, {idTernary: idTernary}, callback);
}
Service.prototype.removeTernary = function (idTernary, callback) {
    let self = this;
    this.delete(DELETE_TERNARY, {idTernary: idTernary}, callback)
}

Service.prototype.getPalettes = function (callback) {
    let self = this;
    this.post(GET_PALETTES, {}, callback);
}
Service.prototype.getCustomFills = function (callback) {
    let self = this;
    this.post(GET_CUSTOM_FILLS, {}, callback);
}
Service.prototype.saveCustomFills = function (customFills, callback) {
    let self = this;
    this.post(SAVE_CUSTOM_FILLS, customFills, callback);
}
Service.prototype.setAuthenticationInfo = function (authenInfo, callback) {
    __USERINFO = authenInfo;
    if(callback) callback();
}

Service.prototype.getCaptcha = function () {
    return AUTHENTICATION_SERVICE + "/captcha.png";
};

Service.prototype.getDustbin = function (idProject, callback) {
    this.post(DUSTBIN, {idProject: idProject}, callback);
}

Service.prototype.restoreObject = function (payload, callback) {
    this.post(RESTORE_OBJECT, payload, callback);
}

Service.prototype.deleteObject = function (payload, callback) {
    this.post(DELETE_OBJECT, payload, callback);
}

//group apis
Service.prototype.createGroup = function (data, callback) {
    let self = this;
    this.post(CREATE_GROUP, data, callback);
}
Service.prototype.editGroup = function (data, callback) {
    let self = this;
    this.post(EDIT_GROUP, data, callback);
}
Service.prototype.getGroup = function (idGroup, callback) {
    let self = this;
    this.post(GET_GROUP, {idGroup: idGroup}, callback);
}
Service.prototype.removeGroup = function (idGroup, callback) {
    let self = this;
    this.delete(DELETE_GROUP, {idGroup: idGroup}, callback)
}

app.factory(wiServiceName, function ($http, wiComponentService, Upload) {
    return new Service(BASE_URL, $http, wiComponentService, Upload);
});
exports.name = moduleName;


Service.prototype.createObjectTrack = function (data, callback) {
    let self = this;
    this.post(CREATE_OBJECT_TRACK, data, callback);
}
Service.prototype.editObjectTrack = function (data, callback) {
    let self = this;
    this.post(EDIT_OBJECT_TRACK, data, callback);
}
Service.prototype.getObjectTrack = function (idObjectTrack, callback) {
    let self = this;
    this.post(GET_OBJECT_TRACK, { idObjectTrack: idObjectTrack }, callback);
}
Service.prototype.removeObjectTrack = function (idObjectTrack, callback) {
    let self = this;
    this.delete(DELETE_OBJECT_TRACK, { idObjectTrack: idObjectTrack }, callback);
}

Service.prototype.listOverlayLine = function(idCurveX, idCurveY, callback) {
    this.post(LIST_OVERLAY_LINE, { idCurveX: idCurveX, idCurveY: idCurveY }, callback);
}

Service.prototype.getOverlayLine = function(idOverlayLine, idCurveX, idCurveY, callback) {
    this.post(GET_OVERLAY_LINE, {
        idOverlayLine: idOverlayLine,
        idCurveX: idCurveX,
        idCurveY: idCurveY
    }, callback);
}

Service.prototype.createObjectOfObjectTrack = function (data, callback) {
    let self = this;
    this.post(CREATE_OBJECT_OF_OBJECT_TRACK, data, function (returnData) {
            if (callback) callback(returnData);
        });
}
Service.prototype.editObjectOfObjectTrack = function (data, callback) {
    let self = this;
    this.post(EDIT_OBJECT_OF_OBJECT_TRACK, data, function (returnData) {
            if(callback) callback();
        });
}
Service.prototype.getObjectOfObjectTrack = function (idObjectOfTrack, callback) {
    let self = this;
    this.post(GET_OBJECT_OF_OBJECT_TRACK, { idObjectOfTrack: idObjectOfTrack }, function (returnData) {
            if(callback) callback(returnData);
        });
}
Service.prototype.removeObjectOfObjectTrack = function (idObjectOfTrack, callback) {
    let self = this;
    this.delete(DELETE_OBJECT_OF_OBJECT_TRACK, { idObjectOfTrack: idObjectOfTrack }, function (returnData) {
            if(callback) callback();
        });
}
Service.prototype.convolution = function (data, callback){
    this.post('/convolution', data, callback, 'processing');
}
Service.prototype.deconvolution = function (data, callback){
    this.post('/deconvolution', data, callback, 'processing');
}
Service.prototype.medfil = function (data, callback){
    this.post('/median', data, callback, 'processing');
}
Service.prototype.savgolfil = function (data, callback){
    this.post('/savgol', data, callback, 'processing');
}

Service.prototype.getInventory = function (callback) {
    this.post(GET_INVENTORY, {}, callback, 'inventory');
}

Service.prototype.getInventoryUrl = function () {
    return INVENTORY_SERVICE;
};
