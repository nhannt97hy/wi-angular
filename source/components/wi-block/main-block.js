let wiBlock = require('./wi-block.js');
let wiButton = require('./wi-button.js');

let app = angular.module('helloapp', ['ui.bootstrap', wiBlock.name, wiButton.name]);
app.controller('WiBlockController', WiBlockController);

function WiBlockController($scope) {
    $scope.myHandlers = {
        onclick: function () {
            console.log('click');
        },
        onmouseover: function () {
            console.log('onmouseover');
        }
    };
}