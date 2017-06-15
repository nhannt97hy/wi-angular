// todo: write some services
var DialogUtils = require('./DialogUtils');
var app = angular.module('app', ['angularModalService']);

app.controller('SampleController', ["$scope", "ModalService", function($scope, ModalService) {
    $scope.show = function() {
        // console.log(DialogUtils);
        DialogUtils.newProjectDialog($scope, ModalService);
    }

}]);
