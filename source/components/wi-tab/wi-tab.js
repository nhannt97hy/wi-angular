const name = 'wiTab';
const moduleName = 'wi-tab';

function Controller(index) {
    var self = this;
}

var app = angular.module(moduleName, ['ui.bootstrap']);

app.component(name, {
    templateUrl: 'wi-tab.html',
    transclude: true,
    controller: Controller,
    controllerAs: name
});

exports.name = moduleName;