var DialogUtils = require('./DialogUtils');
var wiTabs = require('./wi-tabs');
var app = angular.module('app', ['angularModalService', 'kendo.directives', 'ngSanitize', 'ui.select', wiTabs.name]);

app.controller('SampleController', function($scope, ModalService) {
    $scope.show = function() {
        DialogUtils.symbolStyleDialog(ModalService, function(ret) {
            console.log(ret);
        }, {
            defaultColor: "#ff00ff"
        });
    }
});