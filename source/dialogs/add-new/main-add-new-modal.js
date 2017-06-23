var DialogUtils = require('./DialogUtils');
var app = angular.module('app', ['angularModalService']);

app.controller('SampleController', ["$scope", "ModalService", function($scope, ModalService) {
    $scope.show = function() {
        DialogUtils.addNewDialog(ModalService, function(ret){
        	console.log(ret);
        });
    }

}]);
