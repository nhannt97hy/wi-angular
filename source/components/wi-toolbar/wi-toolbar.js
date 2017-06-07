const name = 'wiToolbar';
const moduleName = 'wi-toolbar';

function Controller() {
    var self = this;
    var Btns = this.Btns = [];
    this.$onInit = function () {
        console.log('wi-toolbar');
    }

    this.addButton = function (btn) {
        Btns.push(btn);
    }
}

var app = angular.module(moduleName, []);

app.component(name, {
    templateUrl: 'wi-toolbar.html',
    transclude: true,
    controller: Controller,
    controllerAs: name,
    bindings: {
        label: '@'
    }
});

exports.name = moduleName;
