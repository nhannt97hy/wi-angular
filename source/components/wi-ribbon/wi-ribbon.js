const name = 'wiRibbon';
const moduleName = 'wi-ribbon';

function Controller() {
    var self = this;
}

var app = angular.module(moduleName, []);

app.component(name, {
    templateUrl: 'wi-ribbon.html',
    transclude: true,
    controller: Controller,
    controllerAs: name
});

exports.name = moduleName;
