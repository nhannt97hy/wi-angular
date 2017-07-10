const wiServiceName = 'wiApiService';
const moduleName = 'wi-api-service';

let app = angular.module(moduleName, []);
app.factory(wiServiceName, function ($http) {
    const BASE_URL = 'http://54.169.109.34';

    return {
        post: function (route, payload) {
            return new Promise(function (resolve, reject) {
                let request = {
                    url: BASE_URL + route,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
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
        }
    };
});

exports.name = moduleName;