const wiServiceName = 'wiApiService';
const moduleName = 'wi-api-service';

let app = angular.module(moduleName, []);

// route: GET, CREATE, UPDATE, DELETE
const UPLOAD_FILE = '/file-1';
const IMPORT_FILE = '/file-2';

const GET_PROJECT = '/project/fullinfo';

const EDIT_WELL = '/project/well/edit';
const DELETE_WELL = '/project/well/delete';

const EDIT_DATASET = '/project/well/dataset/edit';
const DELETE_DATASET = '/project/well/dataset/delete';

const CURVE = '/project/well/dataset/curve/getData';
const EXPORT_CURVE = '/project/well/dataset/curve/export';
const CREATE_CURVE = '/project/well/dataset/curve/new';
const EDIT_CURVE = '/project/well/dataset/curve/edit';
const DELETE_CURVE = '/project/well/dataset/curve/delete';

const CREATE_PLOT = '/project/well/plot/new';
const EDIT_PLOT = '/project/well/plot/edit';
const DELETE_PLOT = '/project/well/plot/delete';
const GET_PLOT = '/project/well/plot/info';

const CREATE_LOG_TRACK = '/project/well/plot/track/new';
const DELETE_LOG_TRACK = '/project/well/plot/track/delete';
const GET_LOG_TRACK = '/project/well/plot/track/info';

const CREATE_DEPTH_AXIS = '/project/well/plot/depth-axis/new';
const DELETE_DEPTH_AXIS = '/project/well/plot/depth-axis/delete';
const GET_DEPTH_AXIS = '/project/well/plot/depth-axis/info';

const CREATE_LINE = '/project/well/plot/track/line/new';
const DELETE_LINE = '/project/well/plot/track/line/delete';
const EDIT_LINE = '/project/well/plot/track/line/edit';
function Service(baseUrl, $http, wiComponentService, Upload) {
    this.baseUrl = baseUrl;
    this.$http = $http;
    this.Upload = Upload;
    this.wiComponentService = wiComponentService;
}

Service.prototype.GET_PROJECT = '/project/fullinfo';
Service.prototype.CURVE = '/project/well/dataset/curve/getData';

Service.prototype.DELETE_WELL = '/project/well/delete';

Service.prototype.CREATE_PLOT = '/project/well/plot/new';
Service.prototype.EDIT_PLOT = '/project/well/plot/edit';
Service.prototype.DELETE_PLOT = '/project/well/plot/delete';
Service.prototype.GET_PLOT = '/project/well/plot/info';

Service.prototype.CREATE_LOG_TRACK = '/project/well/plot/track/new';
Service.prototype.DELETE_LOG_TRACK = DELETE_LOG_TRACK;
Service.prototype.GET_LOG_TRACK = '/project/well/plot/track/info';

Service.prototype.CREATE_DEPTH_AXIS = '/project/well/plot/depth-axis/new';
Service.prototype.DELETE_DEPTH_AXIS = '/project/well/plot/depth-axis/delete';
Service.prototype.GET_DEPTH_AXIS = '/project/well/plot/depth-axis/info';

Service.prototype.CREATE_LINE = '/project/well/plot/track/line/new';
Service.prototype.DELETE_LINE = DELETE_LINE;

Service.prototype.EDIT_LINE = EDIT_LINE;
Service.prototype.getUtils = function() {
    let utils = this.wiComponentService.getComponent(this.wiComponentService.UTILS);
    // console.log(utils);
    return utils;
}
Service.prototype.post = function (route, payload) {
    var self = this;
    return new Promise(function (resolve, reject) {
        let request = {
            url: self.baseUrl + route,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Referrer-Policy': 'no-referrer'
            },
            data: payload
        };

        self.$http(request).then(
            function (response) {
                if (response.data && response.data.code === 200) {
                    return resolve(response.data.content);
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

Service.prototype.delete = function (route, payload) {
    var self = this;
    return new Promise(function (resolve, reject) {
        let request = {
            url: self.baseUrl + route,
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Referrer-Policy': 'no-referrer'
            },
            data: payload
        };

        self.$http(request).then(
            function (response) {
                if (response.data && response.data.code === 200) {
                    return resolve(response.data.content);
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

Service.prototype.postWithFile = function (route, dataPayload) {
    var self = this;
    return new Promise(function (resolve, reject) {
        let configUpload = {
            url: self.baseUrl + route,
            // url: 'http://localhost:3000' + route,
            headers: {
                'Referrer-Policy': 'no-referrer'
            },
            data: dataPayload
        };

        self.Upload.upload(configUpload).then(
            function (responseSuccess) {
                if (responseSuccess.data && responseSuccess.data.content){
                    return resolve(responseSuccess.data.content);
                } else {
                    return reject('Response is invalid!');
                }
            },
            function (responseError) {
                if (responseError.data && responseError.data.content){
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

Service.prototype.postMultiFiles = function (route, dataPayload) {
    var self = this;
    return new Promise(function (resolve, reject) {
        let configUpload = {
            url: self.baseUrl + route,
            headers: {
                'Referrer-Policy': 'no-referrer'
            },
            data: dataPayload
        };

        self.Upload.upload(configUpload).then(
            function (responseSuccess) {
                console.log('response', responseSuccess);
                if (responseSuccess.data && responseSuccess.data.content){
                    return resolve(responseSuccess.data.content);
                } else {
                    return reject('Response is invalid!');
                }
            },
            function (responseError) {
                if (responseError.data && responseError.data.content){
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

Service.prototype.editWell = function(infoWell, callback) {
    let self = this;
    console.log('infoWell', infoWell);
    this.post(EDIT_WELL, infoWell)
        .then(callback)
        .catch(function (err) {
            self.getUtils().error(err);
        });
}

Service.prototype.removeWell = function(idWell, callback) {
    let self = this;    
    let dataRequest = {
        idWell: idWell
    }
    this.delete(DELETE_WELL, dataRequest)
        .then(callback)
        .catch(function (err) {
            self.getUtils().error(err);
        });
}

Service.prototype.editDataset = function (infoDataset, callback) {
    let self = this;
    this.post(EDIT_DATASET, infoDataset)
        .then(callback)
        .catch(function (err) {
            self.getUtils().error(err);
        });
}

Service.prototype.removeDataset = function(idDataset, callback) {
    let self = this;
    let dataRequest = {
        idDataset: idDataset
    }
    this.delete(DELETE_DATASET, dataRequest)
        .then(callback)
        .catch(function (err) {
            self.getUtils().error(err);
        });
}

Service.prototype.createCurve = function (curveInfo, callback) {
    let self = this;
    console.log(curveInfo);
    this.post(CREATE_CURVE, curveInfo)
        .then(function (curve) {
            console.log("curve created", curve);
            callback(curve);
        })
        .catch(function (err) {
            self.getUtils().error(err);
        })
}

Service.prototype.editCurve = function (curveInfo, callback) {
    if (!curveInfo.initValue) curveInfo.initValue = '-2810';
    let self = this;
    console.log(curveInfo);
    this.post(EDIT_CURVE, curveInfo)
        .then(callback)
        .catch(function (err) {
            self.getUtils().error(err);
        })
}

Service.prototype.exportCurve = function (idCurve, callback) {
    let self = this;
    let dataRequest = {
        idCurve: idCurve
    }
    callback('https://raw.githubusercontent.com/minhnt95/wi-angular/master/package.json');
    // this.post(EXPORT_CURVE, dataRequest)
    //     .then(function (curveFileUrl) {
    //         callback(curveFileUrl);
    //     })
    //     .catch(function (err) {
    //         self.getUtils().error(err);
    //     })
}

Service.prototype.removeCurve = function(idCurve, callback) {
    let self = this;
    let dataRequest = {
        idCurve: idCurve
    }
    this.delete(DELETE_CURVE, dataRequest)
        .then(callback)
        .catch(function (err) {
            self.getUtils().error(err);
        });
}

Service.prototype.editLogplot = function (infoLogplot, callback) {
    if (!infoLogplot.option) infoLogplot.option = '';
    let self = this;
    this.post(EDIT_PLOT, infoLogplot)
        .then(callback)
        .catch(function (err) {
            self.getUtils().error(err);
        });
}

Service.prototype.createLogTrack = function(idPlot, orderNum, callback) {
    var self = this;
    let dataRequest = {
        idPlot: idPlot,
        orderNum: orderNum
    };
    this.post(CREATE_LOG_TRACK, dataRequest)
        .then(function (logTrack) {
            console.log("Success: ", logTrack);
            callback(logTrack);
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}

Service.prototype.removeLogTrack = function(idTrack, callback) {
    var self = this;
    let dataRequest = {
        idTrack: idTrack
    };
    this.delete(DELETE_LOG_TRACK, dataRequest)
        .then(callback)
        .catch(function(err) {
            self.getUtils().error(err);
        });
}

Service.prototype.createDepthTrack = function(idPlot, orderNum, callback) {
    var self = this;
    console.log("createDepthTrack", self);
    let dataRequest = {
        idPlot: idPlot,
        orderNum: orderNum
    };
    this.post(CREATE_DEPTH_AXIS, dataRequest)
        .then(callback)
        .catch(function(err) {
            self.getUtils().error(err);
        });
}
Service.prototype.removeDepthTrack = function(idDepthAxis, callback) {
    var self = this;
    let dataRequest = {
        idDepthAxis: idDepthAxis
    };
    this.delete(DELETE_DEPTH_AXIS, dataRequest)
        .then(callback)
        .catch(function(err) {
            self.getUtils().error(err);
        });
}

Service.prototype.removeLine = function(idLine, callback) {
    var self = this;
    let dataRequest = {
        idLine: idLine
    };
    this.delete(DELETE_LINE, dataRequest)
        .then(callback)
        .catch(function(err) {
            self.getUtils().error(err);
        });
}
Service.prototype.editLine = function (lineObj, callback) {
    var self = this;
    this.post(EDIT_LINE, lineObj)
        .then(callback)
        .catch(function (err) {
            self.getUtils().error(err);
        });
}

app.factory(wiServiceName, function ($http, wiComponentService, Upload) {
    const BASE_URL = 'http://54.169.109.34';
    // const BASE_URL = 'http://localhost:3000';
    return new Service(BASE_URL, $http, wiComponentService, Upload);
/*
    return {
        post: function (route, payload) {
            return new Promise(function (resolve, reject) {
                let request = {
                    url: BASE_URL + route,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Referrer-Policy': 'no-referrer'
                    },
                    data: payload
                };

                $http(request).then(
                    function (response) {
                        if (response.data && response.data.code === 200) {
                            return resolve(response.data.content);
                        } else if (response.data) {
                            return reject(response.data.reason);
                        } else {
                            return reject('Something went wrong!');
                        }
                    },
                    reject
                );
            });
        },

        delete: function (route, payload) {
            return new Promise(function (resolve, reject) {
                let request = {
                    url: BASE_URL + route,
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Referrer-Policy': 'no-referrer'
                    },
                    data: payload
                };

                $http(request).then(
                    function (response) {
                        if (response.data && response.data.code === 200) {
                            return resolve(response.data.content);
                        } else if (response.data) {
                            return reject(response.data.reason);
                        } else {
                            return reject('Something went wrong!');
                        }
                    },
                    reject
                );
            });
        },

        postWithFile: function (route, dataPayload) {
            return new Promise(function (resolve, reject) {
                let configUpload = {
                    url: BASE_URL + route,
                    // url: 'http://localhost:3000' + route,
                    headers: {
                        'Referrer-Policy': 'no-referrer'
                    },
                    data: dataPayload
                };

                Upload.upload(configUpload).then(
                    function (responseSuccess) {
                        if (responseSuccess.data && responseSuccess.data.content){
                            return resolve(responseSuccess.data.content);
                        } else {
                            return reject('Response is invalid!');
                        }
                    },
                    function (responseError) {
                        if (responseError.data && responseError.data.content){
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
        },

        postMultiFiles: function (route, dataPayload) {
            return new Promise(function (resolve, reject) {
                let configUpload = {
                    url: BASE_URL + route,
                    // url: 'http://localhost:3000' + route,
                    headers: {
                        'Referrer-Policy': 'no-referrer'
                    },
                    data: dataPayload
                };

                Upload.upload(configUpload).then(
                    function (responseSuccess) {
                        console.log('response', responseSuccess);
                        if (responseSuccess.data && responseSuccess.data.content){
                            return resolve(responseSuccess.data.content);
                        } else {
                            return reject('Response is invalid!');
                        }
                    },
                    function (responseError) {
                        if (responseError.data && responseError.data.content){
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
        },

        // route: GET, CREATE, UPDATE, DELETE
        GET_PROJECT: '/project/fullinfo',
        CURVE: '/project/well/dataset/curve/getData',

        DELETE_WELL: '/project/well/delete',

        CREATE_PLOT: '/project/well/plot/new',
        EDIT_PLOT: '/project/well/plot/edit',
        DELETE_PLOT: '/project/well/plot/delete',
        GET_PLOT: '/project/well/plot/info',

        CREATE_LOG_TRACK: '/project/well/plot/track/new',
        DELETE_LOG_TRACK: '/project/well/plot/track/delete',
        GET_LOG_TRACK: '/project/well/plot/track/info',

        CREATE_DEPTH_AXIS: '/project/well/plot/depth-axis/new',
        DELETE_DEPTH_AXIS: '/project/well/plot/depth-axis/delete',
        GET_DEPTH_AXIS: '/project/well/plot/depth-axis/info',

        CREATE_LINE: '/project/well/plot/track/line/new',
    };
*/
});

exports.name = moduleName;
