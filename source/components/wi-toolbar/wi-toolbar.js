var name = 'wiToolbar';

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

var app = angular.module('wi-toolbar', []);
app.component(name, {
    templateUrl: 'wi-toolbar.html',
    transclude: true,
    controller: Controller,
    controllerAs: name,
    bindings: {
        label: '@'
    }
});
