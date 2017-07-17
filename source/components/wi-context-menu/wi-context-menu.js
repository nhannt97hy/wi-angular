const componentName = 'wiContextMenu';
const moduleName = 'wi-context-menu';

__WICS = null;
function Controller($scope, wiComponentService) {
    let self = this;
    self.shown = false;
    this.buttons = null;
    self.contextMenus = [];
    this.$onInit = function () {
        if (self.name) wiComponentService.putComponent(self.name, self);
    };

    this.dismissAll = function () {
        self.shown = false;
        self.contextMenus = [];
    };
    this.open = function (x, y, buttons) {
        if (!buttons || buttons.length === 0) return;
        let contextMenu = {};
        if (buttons) contextMenu.buttons = buttons;
        contextMenu.top = y;
        contextMenu.left = x;
        self.contextMenus.push(contextMenu);
        self.shown = true;
    };

    this.showChildContextMenu = function (parent, $event, $index) {
        let childContextMenu = parent.childContextMenu || [];
        if (childContextMenu.length) {
            // let parentWidth = $event.currentTarget.firstChild.clientWidth;
            let parentHeight = $event.currentTarget.firstChild.clientHeight;
            let parentMenuX = $event.currentTarget.parentElement.offsetLeft;
            let parentMenuY = $event.currentTarget.parentElement.offsetTop;
            let parentMenuWidth = $event.currentTarget.parentElement.offsetWidth;
            // let menuHeight = $event.currentTarget.parentElement.offsetHeight;
            let x = parentMenuX + parentMenuWidth;
            let y = parentMenuY + (parentHeight * $index);
            self.open(x, y, childContextMenu);
        }
    }
    this.dismissChildContextMenu = function (parent) {
        let childContextMenu = parent.childContextMenu || [];
        if (childContextMenu.length) {
            self.contextMenus.pop();
        }
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
