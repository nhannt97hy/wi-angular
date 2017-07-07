const wiServiceName = 'WiProject';
const moduleName = 'wi-project-service';

let app = angular.module(moduleName, []);
app.factory(wiServiceName, function ($http) {
    function WiProject() {

    }

    WiProject.prototype = {
        create : function () {
            let request = {
                url: 'http://54.169.109.34/project/new',
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json'
                },
                data: data
            };

            $http(request).then(
                function (response) {
                    console.log('response', response.data);

                    if (response.data && response.data.code === 200) {
                        return close(response.data.content, 500);
                    } else if (response.data) {
                        self.error = response.data.reason;
                    } else {
                        self.error = 'Something went wrong!';
                    }
                },
                function (err) {
                    self.error = err;
                }
            );
            return $http
        }
    };

    return WiProject;
});

exports.name = moduleName;