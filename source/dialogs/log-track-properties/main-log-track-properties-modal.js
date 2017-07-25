var DialogUtils = require('./DialogUtils');
var wiTabs = require('./wi-tabs');
var wiComponentService = require('./wi-component-service');
var app = angular.module('app', ['angularModalService', 'kendo.directives', 'ngSanitize', 'ui.select', wiTabs.name, wiComponentService.name]);

app.controller('SampleController', function($scope, ModalService) {
    $scope.show = function() {
        DialogUtils.trackPropertiesDialog(ModalService, DialogUtils, function(ret) {
            console.log(ret);
        });
    }
});
