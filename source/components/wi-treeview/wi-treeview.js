const componentName = 'wiTreeview';
const moduleName = 'wi-treeview';

function Controller() {
    var self = this;

    this.$onInit = function () {
        console.log('config: ', self.config);
    }

    this.onCaretClick = function () {
        self.data.childExpanded = !self.data.childExpanded;
    }
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
