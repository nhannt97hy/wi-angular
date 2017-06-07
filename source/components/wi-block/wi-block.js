const name = 'wiBlock';
const moduleName = 'wi-block';

function Controller() {
    var self = this;
}

var app = angular.module(moduleName, []);

app.component(name, {
    templateUrl: 'wi-block.html',
    transclude: true,
    controller: Controller,
    controllerAs: name
});

exports.name = moduleName;
