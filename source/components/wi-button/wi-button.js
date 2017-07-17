const wiButtonName = 'wiButton';
const moduleName = 'wi-button';

function ButtonController(wiComponentService) {
    let self = this;

    this.default = {
        type: 'normal',
        label: '',
        tooltip: '',
        layout: 'icon-top',
        icon: 'project-new-16x16',
        disabled: false,
        initialState: {}
    };

    this.onClick = function () {
        if (self.handler) self.handler();
    };

    this.$onInit = function () {
        if (self.name) wiComponentService.putComponent(self.name, self);

        if (self.container === 'ribbon' || self.container === 'explorer') {
            this.default.initialState.disabled = self.isDisabled() + '';

            wiComponentService.on('project-loaded-event', function () {
                self.disabled = "false";
            });

            wiComponentService.on('project-unloaded-event', function () {
                self.disabled = self.default.initialState.disabled;
            });
        }
    };

    this.initTooltip = function () {
        $('[data-toggle="tooltip"]').tooltip();
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
app.component(wiButtonName, {
    templateUrl: 'wi-button.html',
    controller: ButtonController,
    controllerAs: wiButtonName,
    bindings: {
        config: '<',
        type: '@',
        name: '@',
        tooltip: '@',
        label: '@',
        layout: '@',
        icon: '@',
        handler: '<',
        disabled: '@',
        separator: '@',
        container: '@'
    }
});

exports.name = moduleName;