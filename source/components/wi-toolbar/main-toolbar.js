wiRibbon = require('./wi-button.js');
wiToolbar = require('./wi-toolbar.js');

app=angular.module('helloapp', ['ui.bootstrap', wiToolbar.name, wiRibbon.name]);
app.controller('WiDummy', function($scope) {
        $scope.buttonCfg = buttonCfg;
        $scope.buttonCfg2 = buttonCfg2;
    });
buttonCfg = {
    type: 'button',
    imgUrl: 'img/32x32/project_new_32x32.png',
    label: 'New Projecttttt',
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
    label: 'New Buttooooon',
    layout: 'icon-top'
};
