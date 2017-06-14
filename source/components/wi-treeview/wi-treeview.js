const componentName = 'wiTreeview';
const moduleName = 'wi-treeview';

function Controller() {
    var self = this;

    this.$onInit = function () {
        console.log('on init tree view', self.config);
    };

    this.onSelectItem = function ($index) {
        self.config[$index].data.handler();
    };
}

var app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-treeview.html',
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        config: '<'
    }
});

exports.name = moduleName;
