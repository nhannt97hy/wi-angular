wiRibbon = require('./wi-button.js');
wiToolbar = require('./wi-toolbar.js');

app=angular.module('helloapp', ['ui.bootstrap', wiToolbar.name, wiRibbon.name]);
app.controller('WiDummy', function($scope) {
        $scope.buttonCfg = buttonCfg;
        $scope.buttonCfg2 = buttonCfg2;
    });
buttonCfg = {
    icon: 'project-new-32x32',
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
    icon: 'project-open-32x32',
    label: 'Open Project',
    layout: 'icon-top'
};
