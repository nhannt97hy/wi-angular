const componentName = 'wiContextMenu';
const moduleName = 'wi-context-menu';

__WICS = null;
function Controller($scope, wiComponentService) {
    let self = this;
    self.shown = false;
    this.buttons = null;
    this.$onInit = function() {
        if (self.name) wiComponentService.putComponent(self.name, self);
    }
    this.dismiss = function() {
        self.shown = false;
    }
    this.open = function(x, y, buttons) {
        if (buttons) self.buttons = buttons;
        if (!self.buttons || self.buttons.length == 0) return;
        self.top = y;
        self.left = x;
        self.shown = true;
    }
}
let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-context-menu.html',
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        name: '@'
    }
});

exports.name = moduleName;
