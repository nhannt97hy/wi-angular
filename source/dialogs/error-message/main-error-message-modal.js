var DialogUtils = require('./DialogUtils');
var wiComponentService = require('./wi-component-service');
var utils = require('./utils');
var app = angular.module('app', ['angularModalService', wiComponentService.name]);
app.controller('SampleController', function($scope, ModalService, wiComponentService) {
    wiComponentService.putComponent(wiComponentService.DIALOG_UTILS, DialogUtils);
    $scope.show = function() {
        utils.error(wiComponentService, ModalService, "Something went wrong!");
    }
});

