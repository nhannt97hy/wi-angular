const componentName = 'wiDropdown';
const moduleName = 'wi-dropdown';

function Controller(wiComponentService) {
    let self = this;

    this.default = {
        label: '',
        type: 'normal',
        layout: 'icon-top',
        // icon: 'project-new-32x32',
        disabled: false,
        initialState: {}
    };

    this.onClick = function () {
        if (self.handler) self.handler();
    };

    this.$onInit = function () {
        // if (self.name) wiComponentService.putComponent(self.name, self);

        if (self.container === 'ribbon' || self.container === 'explorer') {
            this.default.initialState.disabled = self.isDisabled() + '';

            wiComponentService.on(wiComponentService.PROJECT_LOADED_EVENT, function () {
                self.disabled = "false";
            });

            wiComponentService.on(wiComponentService.PROJECT_UNLOADED_EVENT, function () {
                self.disabled = self.default.initialState.disabled;
            });
        }
    };

    this.isDisabled = function () {
        if (self.disabled === 'true') {
            return true;
        } else if (self.disabled === 'false') {
            return false;
        } else {
            return self.default.disabled;
        }
    }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-dropdown.html',
    controller: Controller,
    controllerAs: componentName,
    transclude: true,
    bindings: {
        config: '<',
        name: '@',
        type: '@',
        label: '@',
        layout: '@',
        icon: '@',
        handler: '<',
        disabled: '@',
        container: '@'
    }
});

exports.name = moduleName;
