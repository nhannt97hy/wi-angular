const wiServiceName = 'wiApiService';
const moduleName = 'wi-api-service';

let app = angular.module(moduleName, []);
app.factory(wiServiceName, function ($http, Upload) {
    const BASE_URL = 'http://54.169.109.34';
    // const BASE_URL = 'http://localhost:3000';

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
        }
    };
});

exports.name = moduleName;