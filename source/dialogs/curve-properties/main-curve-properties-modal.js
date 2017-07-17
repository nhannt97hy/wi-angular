var DialogUtils = require('./DialogUtils');
var app = angular.module('app', ['angularModalService']);

app.controller('SampleController', function($scope, ModalService) {
    $scope.show = function() {
        DialogUtils.curvePropertiesDialog(ModalService, DialogUtils, function(ret) {
            console.log(ret);
        });
    }
});
