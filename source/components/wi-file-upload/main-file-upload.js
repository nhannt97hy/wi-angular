wiFileUpload = require('./wi-file-upload');

var app = angular.module('app', [wiFileUpload.name]);

app.controller('dummy', function($scope) {
    $scope.successHandler = function (responseSuccess) {
        console.log('success', responseSuccess);
    };
    $scope.errorHandler = function(responseError) {
        console.log('error:', responseError);
    };
    $scope.progressHandler = function(evt) {
        console.log('progress:', evt);
    };
});