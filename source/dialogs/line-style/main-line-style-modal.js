var DialogUtils = require('./DialogUtils');
var app = angular.module('app', ['angularModalService', 'kendo.directives', 'ngSanitize', 'ui.select']);

app.controller('SampleController', function($scope, ModalService) {
    $scope.show = function() {
        DialogUtils.lineStyleDialog(ModalService, function(ret) {
            console.log(ret);
        }, {
            defaultColor: "#ff00ff"
        });
    }
});
