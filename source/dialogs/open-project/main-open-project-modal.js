// todo: write some services
var DialogUtils = require('./DialogUtils');
var app = angular.module('app', ['angularModalService']);

app.controller('SampleController', function($scope, ModalService) {
    $scope.show = function() {
        DialogUtils.openProjectDialog($scope, ModalService, function(ret) {
        	console.log('Dialog closed with return val: ', ret);
        });
    }

});

