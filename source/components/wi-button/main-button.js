wiRibbon = require('./wi-button');

var app = angular.module('helloapp', [ wiRibbon.name]);
app.controller('WiDummy', function($scope) {
    $scope.buttonCfg = buttonCfg;
    $scope.myHandlers = myHandlers;
    $scope.ProjectTab = ProjectTab;
});

buttonCfg = {
    type: 'button',
    imgUrl: 'img/32x32/project_new_32x32.png',
    label: 'New Project',
    layout: 'icon-left',
    handler: function (thisButton) {
        console.log(thisButton.label);
    }
};

myHandlers = {
    onclick:function() {console.log('click');},
    onmouseover:function() {console.log('mouseOver');}
}
