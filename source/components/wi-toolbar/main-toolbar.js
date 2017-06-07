wiButtons = require('./wi-buttons.js');
console.log(wiButtons);

wiToolbar = require('./wi-toolbar.js');
console.log(wiToolbar);

app=angular.module('helloapp', ['ui.bootstrap', wiToolbar.name, wiButtons.name]);
app.controller('WiDummy', function($scope) {
        $scope.buttonCfg = buttonCfg;
        $scope.buttonCfg2 = buttonCfg2;
    });
buttonCfg = {
    type: 'button',
    imgUrl: 'img/32x32/project_new_32x32.png',
    label: 'New Project',
    layout: 'icon-left',
    handlers: {
        onclick: function() {
            console.log('click');
        },
        onmouseover: function() {
            console.log('mouseOver');
        }
    }
};
buttonCfg2 = {
    type: 'button',
    imgUrl: 'img/32x32/project_new_32x32.png',
    label: 'New Button',
    layout: 'icon-top'
};
myHandlers = {
    onclick:function() {console.log('click');},
    onmouseover:function() {console.log('mouseOver');}
};
