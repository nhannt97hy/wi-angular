var DialogUtils = require('./DialogUtils');
var wiComponentService = require('./wi-component-service');

var app = angular.module('app', ['angularModalService', 'kendo.directives', 'ngSanitize', 'ui.select', wiComponentService.name]);

app.controller('SampleController', function($scope, ModalService) {
    $scope.show = function() {
        DialogUtils.fillPatternSettingDialog(ModalService, function(ret) {
        	console.log(ret);
        });
    }

});

