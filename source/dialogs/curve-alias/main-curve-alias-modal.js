var DialogUtils = require('./DialogUtils');
var app = angular.module('app', ['angularModalService']);

app.controller('SampleController', function($scope, ModalService) {
    $scope.show = function() {
        DialogUtils.curveAliasDialog(ModalService, function(ret) {
        	console.log(ret);
        });
    }
});

