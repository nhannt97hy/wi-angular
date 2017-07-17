let wiButton = require('./wi-button.js');
let wiContextMenu = require('./wi-context-menu.js');

let wiRightClick = require('./wi-right-click');

let wiComponentService = require('./wi-component-service');

let app = angular.module('helloapp', [wiContextMenu.name, wiButton.name, wiRightClick.name, wiComponentService.name]);
app.controller('WiDummy', function ($scope, wiComponentService) {
    $scope.buttonClick = function(event) {
        var contextMenu = wiComponentService.getComponent('ContextMenu1');
        contextMenu.open(event.clientX, event.clientY, [{
            name:'bbb',
            label: 'B B B',
            handler: function() {
                console.log('U ha ha');
            }
        }, {
            separator: "1"
        },{
            name: 'aaa',
            label: 'A A A A AA A A A A A A A AAPPA A A A AA A A A A',
            handler: function() {
                console.log('ah hu hu hu');
            }
        }]);
    }
    $scope.buttonClick2 = function() {
        var contextMenu = wiComponentService.getComponent('ContextMenu1');
        contextMenu.open(event.clientX, event.clientY);
    }
});

