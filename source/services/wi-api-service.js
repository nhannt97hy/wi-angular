const wiServiceName = 'wiApiService';
const moduleName = 'wi-api-service';

var __USERINFO = {
    username: null,
    password: null,
    token: null
};

__USERINFO.username = window.localStorage.getItem('username');
__USERINFO.password = window.localStorage.getItem('password');
__USERINFO.token = window.localStorage.getItem('token');

let app = angular.module(moduleName, []);

//const BASE_URL = 'http://54.169.109.34';
// const BASE_URL = 'http://sflow.me';
const BASE_URL = 'http://localhost:3000';
//const BASE_URL = 'http://dev.sflow.me';

// route: GET, CREATE, UPDATE, DELETE
const REGISTER = '/register';
const LOGIN = '/login';

const UPLOAD_MULTIFILES = '/files';
const UPLOAD_MULTIFILES_PREPARE = '/files/prepare';
const UPLOAD_FILE = '/file-1';
const UPLOAD_IMAGE = '/image-upload'

const IMPORT_FILE = '/file-2';
const GET_PROJECT = '/project/fullinfo';

const EDIT_WELL = '/project/well/edit';
const DELETE_WELL = '/project/well/delete';

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

const FAMILY_LIST = '/family/list';

const CREATE_PLOT = '/project/well/plot/new';
const EDIT_PLOT = '/project/well/plot/edit';
const DELETE_PLOT = '/project/well/plot/delete';
const GET_PLOT = '/project/well/plot/info';

const CREATE_LOG_TRACK = '/project/well/plot/track/new';
const DELETE_LOG_TRACK = '/project/well/plot/track/delete';
const GET_LOG_TRACK = '/project/well/plot/track/info';
const EDIT_TRACK = '/project/well/plot/track/edit';

const CREATE_IMAGE  = '/project/well/plot/track/image/new';
const EDIT_IMAGE = '/project/well/plot/track/image/edit';
const GET_IMAGE = '/project/well/plot/track/image/info';
const DELETE_IMAGE = '/project/well/plot/track/image/delete';

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

const CREATE_CROSSPLOT = '/project/well/cross-plot/new';
const EDIT_CROSSPLOT = '/project/well/cross-plot/edit';
const GET_CROSSPLOT = '/project/well/cross-plot/info';
const DELETE_CROSSPLOT = '/project/well/cross-plot/delete';

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

const CREATE_DISCRIM = '/project/well/cross-plot/discrim/new';
const EDIT_DISCRIM = '/project/well/cross-plot/discrim/edit';
const GET_DISCRIM = '/project/well/cross-plot/discrim/info';
const DELETE_DISCRIM = '/project/well/cross-plot/discrim/delete';

const GET_PALETTES = '/pal/all';

const CREATE_HISTOGRAM = '/project/well/histogram/new';
const EDIT_HISTOGRAM = '/project/well/histogram/edit';
const GET_HISTOGRAM = '/project/well/histogram/info';
const DELETE_HISTOGRAM = '/project/well/histogram/delete';

const GET_CUSTOM_FILLS = '/custom-fill/all';
const SAVE_CUSTOM_FILLS = '/custom-fill/save';
function Service(baseUrl, $http, wiComponentService, Upload) {
    this.baseUrl = baseUrl;
    this.$http = $http;
    this.Upload = Upload;
    this.wiComponentService = wiComponentService;
}

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
            function (response) {
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

Service.prototype.login = function (data, callback) {
    if (!data || !callback) return;
    let self = this;
    this.post(LOGIN, data).then(function (ret) {
            callback(ret);
        })
        .catch(function (err) {
            console.error(err);
            alert("Login error: " + err);
        });
}
Service.prototype.register = function (data, callback) {
    if (!data || !callback) return;
    let self = this;
    console.log(data);
    this.post(REGISTER, data)
        .then(function (ret) {
            callback(ret);
        })
        .catch(function (err) {
            console.error(err);
            alert('Error', err);
        })
}

Service.prototype.postWithFile = function (route, dataPayload) {
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
                }else if (responseSuccess.data && responseSuccess.data.code === 401){
                    window.localStorage.removeItem('token');
                    window.localStorage.removeItem('username');
                    window.localStorage.removeItem('password');
                    window.localStorage.removeItem('rememberAuth');
                    location.reload();
                } else if (responseSuccess.data && responseSuccess.data.reason){
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
                }else if (responseSuccess.data && responseSuccess.data.code === 401){
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
        if (response.data && response.data.content){
            callback(response.data.content);
        }else if (response.data && response.data.code === 401) {
            window.localStorage.removeItem('token');
            window.localStorage.removeItem('username');
            window.localStorage.removeItem('password');
            window.localStorage.removeItem('rememberAuth');
            location.reload();
        }else {
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

Service.prototype.editWell = function (infoWell, callback) {
    let self = this;
    console.log('infoWell', infoWell);
    this.post(EDIT_WELL, infoWell)
        .then(callback)
        .catch(function (err) {
            console.error(err);
            self.getUtils().error(err);
        });
}

Service.prototype.removeWell = function (idWell, callback) {
    let self = this;
    let dataRequest = {
        idWell: idWell
    }
    this.delete(DELETE_WELL, dataRequest)
        .then(callback)
        .catch(function (err) {
            console.error(err);
            self.getUtils().error(err);
        });
}
Service.prototype.createDataset = function (infoDataset, callback) {
    let self = this;
    let dataRequest = infoDataset;
    this.post(CREATE_DATASET, dataRequest)
        .then(callback)
        .catch(function (err) {
            console.error(err);
            self.getUtils().error(err);
        });
}
Service.prototype.editDataset = function (infoDataset, callback) {
    let self = this;
    this.post(EDIT_DATASET, infoDataset)
        .then(callback)
        .catch(function (err) {
            console.error(err);
            self.getUtils().error(err);
        });
}

Service.prototype.removeDataset = function (idDataset, callback) {
    let self = this;
    let dataRequest = {
        idDataset: idDataset
    }
    this.delete(DELETE_DATASET, dataRequest)
        .then(callback)
        .catch(function (err) {
            console.error(err);
            self.getUtils().error(err);
        });
}
//hoangbd start
Service.prototype.copyCurve = function (copyData, callback) {
    let self = this;
    this.post(COPY_CURVE, copyData).then(function (rs) {
        callback(rs);
    }).catch(function (err) {
        self.getUtils().error(err);
    });
}
Service.prototype.cutCurve = function (cutData, callback) {
    let self = this;
    this.post(CUT_CURVE, cutData).then(function (rs) {
        callback(rs);
    }).catch(function (err) {
        self.getUtils().error(err);
    });
}
//end hoangbd
Service.prototype.createCurve = function (curveInfo, callback) {
    let self = this;
    console.log(curveInfo);
    if (!curveInfo.initValue) curveInfo.initValue = '-2810';
    this.post(CREATE_CURVE, curveInfo)
        .then(function (curve) {
            console.log("curve created", curve);
            callback(curve);
        })
        .catch(function (err) {
            console.error(err);
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
            console.error(err);
            self.getUtils().error(err);
        })
}

Service.prototype.infoCurve = function (idCurve, callback) {
    let self = this;
    this.post(INFO_CURVE, {idCurve: idCurve})
        .then(function (res) {
            callback(res)
        })
        .catch(function (err) {
            console.error(err);
            self.getUtils().error(err);
        })
}

Service.prototype.dataCurve = function (idCurve, callback) {
    let self = this;
    this.post(DATA_CURVE, {idCurve: idCurve})
        .then(function (res) {
            callback(res)
        })
        .catch(function (err) {
            console.error(err);
            self.getUtils().error(err);
        })
}

Service.prototype.exportCurve = function (idCurve, callback) {
    let self = this;
    let dataRequest = {
        idCurve: idCurve
    }
    self.$http({
        url: self.baseUrl + EXPORT_CURVE,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Referrer-Policy': 'no-referrer',
			'Authorization' : __USERINFO.token
        },
        responseType: "arraybuffer",
        data: dataRequest
    }).then(function (res) {
        callback(res.data, res.headers('Content-Type'));
    }, function (err) {
        console.error(err);
        self.getUtils().error("File not found!");
    });
}

Service.prototype.removeCurve = function (idCurve, callback) {
    let self = this;
    this.delete(DELETE_CURVE, {idCurve: idCurve})
        .then(function (res) {
            callback(res)
        })
        .catch(function (err) {
            console.error(err);
            self.getUtils().error(err);
        })
}

Service.prototype.scaleCurve = function (idCurve, callback) {
    let self = this;
    let dataRequest = {
        idCurve: idCurve
    }
    this.post(SCALE_CURVE, dataRequest)
        .then(callback)
        .catch(function (err) {
            console.error(err);
            self.getUtils().error(err);
        });
}

Service.prototype.asyncScaleCurve = async function (idCurve) {
    const self = this;
    try {
        return await this.post(SCALE_CURVE, {idCurve: idCurve});
    } catch (err) {
        self.getUtils().error(err);        
    }
 }

Service.prototype.listFamily = async function (callback) {
    const self = this;
    this.post(FAMILY_LIST)
        .then(function (res) {
            if (callback) callback(res);
        })
        .catch(function (err) {
            self.getUtils().error(err);
        })
}

Service.prototype.editLogplot = function (infoLogplot, callback) {
    if (!infoLogplot.option) infoLogplot.option = '';
    let self = this;
    this.post(EDIT_PLOT, infoLogplot)
        .then(callback)
        .catch(function (err) {
            console.error(err);
            self.getUtils().error(err);
        });
}
Service.prototype.removeLogplot = function (idLogplot, callback) {
    let self = this;
    this.delete(DELETE_PLOT, { idPlot: idLogplot })
        .then(function () {
            callback();
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}

Service.prototype.createLogTrack = function (idPlot, orderNum, callback) {
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
            console.error(err);
            self.getUtils().error(err);
        });
}

Service.prototype.removeLogTrack = function (idTrack, callback) {
    var self = this;
    let dataRequest = {
        idTrack: idTrack
    };
    this.delete(DELETE_LOG_TRACK, dataRequest)
        .then(callback)
        .catch(function (err) {
            console.error(err);
            self.getUtils().error(err);
        });
}

Service.prototype.infoTrack = function (idTrack, callback) {
    let self = this;
    let dataRequest = {
        idTrack: idTrack
    };
    this.post(GET_LOG_TRACK, dataRequest)
        .then(function (infoTrack) {
            if (!callback) return;
            callback(infoTrack);
        })
        .catch(function (err) {
            console.error(err);
            self.getUtils().error(err);
        });
}

Service.prototype.editTrack = function (trackObj, callback) {
    var self = this;
    let dataRequest = trackObj;
    this.post(EDIT_TRACK, dataRequest)
        .then(function (track) {
            if (!callback) return;
            callback(track);
        })
        .catch(function (err) {
            console.error(err);
            self.getUtils().error(err);
        });
}


Service.prototype.createImage = function (imageObj, callback) {
    var self = this;
    this.post(CREATE_IMAGE, imageObj)
        .then(function (image) {
            callback(image);
        })
        .catch(function (err) {
            console.error(err);
            self.getUtils().error(err);
        });
}

Service.prototype.removeImage = function (idImage, callback) {
    var self = this;
    let dataRequest = {
        idImage: idImage
    };
    this.delete(DELETE_IMAGE, dataRequest)
        .then(callback)
        .catch(function (err) {
            console.error(err);
            self.getUtils().error(err);
        });
}

Service.prototype.editImage = function (imageObj, callback) {
    var self = this;
    let dataRequest = imageObj;
    this.post(EDIT_IMAGE, dataRequest)
        .then(function (image) {
            if (!callback) return;
            callback(image);
        })
        .catch(function (err) {
            console.error(err);
            self.getUtils().error(err);
        });
}

Service.prototype.createDepthTrack = function (idPlot, orderNum, callback) {
    var self = this;
    console.log("createDepthTrack", self);
    let dataRequest = {
        idPlot: idPlot,
        orderNum: orderNum, 
        geogetryWidth: 1
    };
    this.post(CREATE_DEPTH_AXIS, dataRequest)
        .then(callback)
        .catch(function (err) {
            console.error(err);
            self.getUtils().error(err);
        });
}
Service.prototype.removeDepthTrack = function (idDepthAxis, callback) {
    var self = this;
    let dataRequest = {
        idDepthAxis: idDepthAxis
    };
    this.delete(DELETE_DEPTH_AXIS, dataRequest)
        .then(callback)
        .catch(function (err) {
            console.error(err);
            self.getUtils().error(err);
        });
}
Service.prototype.editDepthTrack = function (depthTrackObj, callback) {
    var self = this;
    let dataRequest = depthTrackObj;
    this.post(EDIT_DEPTH_AXIS, dataRequest)
        .then(function (depthTrack) {
            if (!callback) return;
            callback(depthTrack);
        })
        .catch(function (err) {
            console.error(err);
            self.getUtils().error(err);
        });
}

Service.prototype.removeLine = function (idLine, callback) {
    var self = this;
    let dataRequest = {
        idLine: idLine
    };
    this.delete(DELETE_LINE, dataRequest)
        .then(callback)
        .catch(function (err) {
            console.error(err);
            self.getUtils().error(err);
        });
}

Service.prototype.createLine = function (lineObj, callback) {
    var self = this;
    let dataRequest = lineObj;
    this.post(CREATE_LINE, dataRequest)
        .then(function (line) {
            callback(line);
        })
        .catch(function (err) {
            console.error(err);
            self.getUtils().error(err);
        });
}

Service.prototype.editLine = function (lineObj, callback) {
    var self = this;
    let dataRequest = lineObj;
    this.post(EDIT_LINE, dataRequest)
        .then(callback)
        .catch(function (err) {
            console.error(err);
            self.getUtils().error(err);
        });
}
Service.prototype.infoLine = function (idLine, callback) {
    let self = this;
    let dataRequest = {
        idLine: idLine
    };
    this.post(GET_LINE, dataRequest)
        .then(function (infoLine) {
            if (!callback) return;
            callback(infoLine);
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}
Service.prototype.createShading = function (shadingObj, callback) {
    var self = this;
    let dataRequest = shadingObj;
    this.post(CREATE_SHADING, dataRequest)
        .then(callback)
        .catch(function (err) {
            console.error(err);
            self.getUtils().error(err);
        });
}
Service.prototype.editShading = function (shadingObj, callback) {
    let self = this;
    let dataRequest = shadingObj;

    this.post(EDIT_SHADING, dataRequest)
        .then(callback)
        .catch(function (err) {
            console.error(err);
            self.getUtils().error(err);
        });
}
Service.prototype.removeShading = function (idShading, callback) {
    var self = this;
    let dataRequest = {
        idShading: idShading
    };
    this.delete(DELETE_SHADING, dataRequest)
        .then(callback)
        .catch(function (err) {
            console.error(err);
            self.getUtils().error(err);
        });
}
Service.prototype.infoShading = function (idShading, callback) {
    let self = this;
    let dataRequest = {
        idShading: idShading
    };
    this.post(GET_SHADING, dataRequest)
        .then(function (infoShading) {
            if (!callback) return;
            callback(infoShading);
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}

Service.prototype.createMarker = function (markerObj, callback) {
    var self = this;
    let dataRequest = markerObj;
    this.post(CREATE_MARKER, dataRequest)
        .then(function (marker) {
            callback(marker)
        })
        .catch(function (err) {
            console.error(err);
            self.getUtils().error(err);
        });
}
Service.prototype.editMarker = function (markerObj, callback) {
    let self = this;
    let dataRequest = markerObj;

    this.post(EDIT_MARKER, dataRequest)
        .then(callback)
        .catch(function (err) {
            console.error(err);
            self.getUtils().error(err);
        });
}
Service.prototype.getMarker = function (idMarker, callback) {
    let self = this;
    let dataRequest = {
        idMarker: idMarker
    };
    this.post(GET_MARKER, dataRequest)
        .then(function (infoMarker) {
            if (!callback) return;
            callback(infoMarker);
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}
Service.prototype.removeMarker = function (idMarker, callback) {
    var self = this;
    let dataRequest = {
        idMarker: idMarker
    };
    this.delete(DELETE_MARKER, dataRequest)
        .then(callback)
        .catch(function (err) {
            console.error(err);
            self.getUtils().error(err);
        });
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
    this.post(CREATE_ZONE_TRACK, data)
        .then(function (returnData) {
            callback(returnData);
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}
Service.prototype.editZoneTrack = function (data, callback) {
    let self = this;
    this.post(EDIT_ZONE_TRACK, data)
        .then(function (returnData) {
            callback();
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}
Service.prototype.getZoneTrack = function (idZoneTrack, callback) {
    let self = this;
    this.post(GET_ZONE_TRACK, { idZoneTrack: idZoneTrack })
        .then(function (returnData) {
            callback(returnData);
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}
Service.prototype.removeZoneTrack = function (idZoneTrack, callback) {
    let self = this;
    this.delete(DELETE_ZONE_TRACK, { idZoneTrack: idZoneTrack })
        .then(function (returnData) {
            callback();
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}

Service.prototype.createZoneSet = function (data, callback) {
    let self = this;
    this.post(CREATE_ZONE_SET, data)
        .then(function (returnData) {
            callback();
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}
Service.prototype.editZoneSet = function (data, callback) {
    let self = this;
    this.post(EDIT_ZONE_SET, data)
        .then(function (returnData) {
            callback();
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}
Service.prototype.listZoneSet = function (idWell, callback) {
    let self = this;
    this.post(LIST_ZONE_SET, { idWell: idWell })
        .then(function (returnData) {
            callback(returnData);
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}
Service.prototype.getZoneSet = function (idZoneSet, callback) {
    let self = this;
    this.post(GET_ZONE_SET, { idZoneSet: idZoneSet })
        .then(function (returnData) {
            callback(returnData);
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}
Service.prototype.removeZoneSet = function (idZoneSet, callback) {
    let self = this;
    this.delete(DELETE_ZONE_SET, { idZoneSet: idZoneSet })
        .then(function (returnData) {
            callback();
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}


Service.prototype.createZone = function (data, callback) {
    let self = this;
    this.post(CREATE_ZONE, data)
        .then(function (returnData) {
            if(callback) callback(returnData);
            self.getUtils().refreshProjectState();
        })
        .catch(function (err) {
            callback(null, err);
            self.getUtils().error(err);
        });
}
Service.prototype.editZone = function (data, callback) {
    let self = this;
    this.post(EDIT_ZONE, data)
        .then(function (returnData) {
            if(callback) callback();
            self.getUtils().refreshProjectState();
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}
Service.prototype.getZone = function (idZone, callback) {
    let self = this;
    this.post(GET_ZONE, { idZone: idZone })
        .then(function (returnData) {
            callback(returnData);
            self.getUtils().refreshProjectState();
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}
Service.prototype.removeZone = function (idZone, callback) {
    let self = this;
    this.delete(DELETE_ZONE, { idZone: idZone })
        .then(function (returnData) {
            if(callback) callback();
            self.getUtils().refreshProjectState();
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}

Service.prototype.createCrossplot = function (data, callback) {
    let self = this;
    this.post(CREATE_CROSSPLOT, data)
        .then(function (returnData) {
            callback(returnData);
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}
Service.prototype.editCrossplot = function (data, callback) {
    let self = this;
    this.post(EDIT_CROSSPLOT, data)
        .then(function (returnData) {
            callback();
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}
Service.prototype.getCrossplot = function (idCrossplot, callback) {
    let self = this;
    this.post(GET_CROSSPLOT, { idCrossPlot: idCrossplot })
        .then(function (returnData) {
            callback(returnData);
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}
Service.prototype.removeCrossplot = function (idCrossplot, callback) {
    let self = this;
    this.delete(DELETE_CROSSPLOT, { idCrossPlot: idCrossplot })
        .then(function (returnData) {
            callback();
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}

Service.prototype.createPointSet = function (data, callback) {
    let self = this;
    this.post(CREATE_POINTSET, data)
        .then(function (returnData) {
            callback(returnData);
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}
Service.prototype.editPointSet = function (data, callback) {
    let self = this;
    this.post(EDIT_POINTSET, data)
        .then(function (returnData) {
            callback();
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}
Service.prototype.getPointSet = function (idPointSet, callback) {
    let self = this;
    this.post(GET_POINTSET, { idPointSet: idPointSet })
        .then(function (returnData) {
            callback(returnData);
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}
Service.prototype.removePointSet = function (idPointSet, callback) {
    let self = this;
    this.delete(DELETE_POINTSET, { idPointSet: idPointSet })
        .then(function (returnData) {
            callback();
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}

Service.prototype.createPolygon = function (data, callback) {
    let self = this;
    this.post(CREATE_POLYGON, data)
        .then(function (returnData) {
            if (callback) {
                callback(returnData);
            }
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}
Service.prototype.editPolygon = function (data, callback) {
    let self = this;
    this.post(EDIT_POLYGON, data)
        .then(function (returnData) {
            if (callback) {
                callback(returnData);
            }
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}
Service.prototype.getPolygon = function (idPolygon, callback) {
    let self = this;
    this.post(GET_POLYGON, { idPolygon: idPolygon })
        .then(function (returnData) {
            if (callback) {
                callback(returnData);
            }
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}
Service.prototype.removePolygon = function (idPolygon, callback) {
    let self = this;
    this.delete(DELETE_POLYGON, { idPolygon: idPolygon })
        .then(function (returnData) {
            if (callback) {
                callback(returnData);
            }
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}

Service.prototype.createRegressionLines = function (data, callback) {
    let self = this;
    this.post(CREATE_REGRESSIONLINES, data)
        .then(function (returnData) {
            if (callback) {
                callback(returnData);
            }
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}
Service.prototype.editRegressionLines = function (data, callback) {
    let self = this;
    this.post(EDIT_REGRESSIONLINES, data)
        .then(function (returnData) {
            if (callback) {
                callback(returnData);
            }
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}
Service.prototype.getRegressionLines = function (idRegressionLine, callback) {
    let self = this;
    this.post(GET_REGRESSIONLINES, { idRegressionLine: idRegressionLine })
        .then(function (returnData) {
            if (callback) {
                callback(returnData);
            }
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}
Service.prototype.removeRegressionLines = function (idRegressionLine, callback) {
    let self = this;
    this.delete(DELETE_REGRESSIONLINES, { idRegressionLine: idRegressionLine })
        .then(function (returnData) {
            if (callback) {
                callback(returnData);
            }
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}

Service.prototype.createDiscrim = function (data, callback) {
    let self = this;
    this.post(CREATE_DISCRIM, data)
        .then(function (returnData) {
            callback(returnData);
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}
Service.prototype.editDiscrim = function (data, callback) {
    let self = this;
    this.post(EDIT_DISCRIM, data)
        .then(function (returnData) {
            callback();
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}
Service.prototype.getDiscrim = function (idDiscrim, callback) {
    let self = this;
    this.post(GET_DISCRIM, { idDiscrim: idDiscrim })
        .then(function (returnData) {
            callback(returnData);
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}
Service.prototype.removeDiscrim = function (idDiscrim, callback) {
    let self = this;
    this.delete(DELETE_DISCRIM, { idDiscrim: idDiscrim })
        .then(function (returnData) {
            callback();
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}

// histogram apis
Service.prototype.createHistogram = function (data, callback) {
    let self = this;
    this.post(CREATE_HISTOGRAM, data)
        .then(function (returnData) {
            callback(returnData);
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}
Service.prototype.editHistogram = function (data, callback) {
    let self = this;
    this.post(EDIT_HISTOGRAM, data)
        .then(function (returnData) {
            callback();
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}
Service.prototype.getHistogram = function (idHistogram, callback) {
    let self = this;
    this.post(GET_HISTOGRAM, { idHistogram: idHistogram })
        .then(function (returnData) {
            callback(returnData);
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}
Service.prototype.removeHistogram = function (idHistogram, callback) {
    let self = this;
    this.delete(DELETE_HISTOGRAM, { idHistogram: idHistogram })
        .then(function (returnData) {
            callback();
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}


app.factory(wiServiceName, function ($http, wiComponentService, Upload) {
    return new Service(BASE_URL, $http, wiComponentService, Upload);
});

Service.prototype.getPalettes = function (callback) {
    let self = this;
    this.post(GET_PALETTES, {})
        .then(function (returnData) {
            callback(returnData);
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}
Service.prototype.getCustomFills = function (callback) {
    let self = this;
    this.post(GET_CUSTOM_FILLS, {})
        .then(function (returnData) {
            callback(returnData);
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}
Service.prototype.saveCustomFills = function (customFills, callback) {
    let self = this;
    this.post(SAVE_CUSTOM_FILLS, customFills)
        .then(function (returnData) {
            callback(returnData);
        })
        .catch(function (err) {
            self.getUtils().error(err);
        });
}
Service.prototype.setAuthenticationInfo = function(authenInfo) {
    __USERINFO.username = authenInfo.username;
    __USERINFO.password = authenInfo.password;
    __USERINFO.token = authenInfo.token;
}
exports.name = moduleName;

