let wiButton = require('./wi-button');

let wiElementReady = require('./wi-element-ready');

let wiComponentService = require('./wi-component-service');

let app = angular.module('helloapp', [wiButton.name, wiElementReady.name, wiComponentService.name]);
app.controller('WiDummy', function ($scope, wiComponentService) {
    $scope.myHandler2 = function () {
        let buttonController = wiComponentService.getComponent('TestButton');
        console.log(buttonController);
        buttonController.label = 'New label';
    }

    // $scope.myHandler2 = function () {
    //     let buttonController = wiComponentService.getComponent('Test4Button');
    //     buttonController.toggleCheckbox();
    //     console.log(buttonController);
    // }
    $scope.isChecked = false;
    $scope.myHandler = function () {
        $scope.isChecked = !$scope.isChecked;
        // buttonController.toggleCheckbox();
    }
});