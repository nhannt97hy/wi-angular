const wiButtonName = 'wiButton';
const moduleName = 'wi-button';

function ButtonController(wiComponentService) {
    let self = this;

    this.default = {
        type: 'normal',
        label: '',
        layout: 'icon-top',
        icon: 'project-new-32x32'
    };

    this.onClick = function () {
        if (self.handler) self.handler();
    };

    this.$onInit = function() {
        if (self.name) wiComponentService.putComponent(self.name, self);
    }
}

let app = angular.module(moduleName, []);
app.component(wiButtonName, {
    templateUrl: 'wi-button.html',
    controller: ButtonController,
    controllerAs: wiButtonName,
    bindings: {
        config: '<',
        type: '@',
        name: '@',
        label: '@',
        layout: '@',
        icon: '@',
        handler: '<'
    }
});

exports.name = moduleName;
