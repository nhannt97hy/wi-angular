let wiZone = require('./wi-zone');

let wiElementReady = require('./wi-element-ready');

let wiComponentService = require('./wi-component-service');

let app = angular.module('helloapp', [wiZone.name, wiElementReady.name, wiComponentService.name]);

app.controller('WiDummy', function ($scope, wiComponentService) {
    $scope.actZone = 3;
    $scope.zones = [{
            idZone: 2,
            startDepth: 1150.55,
            endDepth: 1165.07,
            background: "rgb(165, 42, 42)",
            name: "1139",
            handler: function(){
                console.log('1139');
            }
        },
        {
            idZone: 3,
            startDepth: 1119.3,
            endDepth: 1134.45,
            "background": "rgb(0, 128, 0)",
            name: "1120",
            handler: function(){
                console.log('1120');
            }
        },
        {
            idZone: 4,
            startDepth: 1134.45,
            endDepth: 1150.55,
            "background": "rgb(184, 134, 11)",
            name: "1125",
            handler: function(){
                console.log('1125');
            }
        }
    ];

    $scope.AllZoneClick = function () {
        console.log('AllZoneClick');
    }

    $scope.ActiveZoneClick = function () {
        console.log('ActiveZoneClick');
    }

})