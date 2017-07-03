const wiButtonName = 'wiButton';
const moduleName = 'wi-button';

function ButtonController(wiComponentService) {
    let self = this;

    this.default = {
        type: 'normal',
        label: '',
        tooltip: '',
        layout: 'icon-top',
        icon: 'project-new-32x32',
        disabled: false
    };

    this.onClick = function () {
        if (self.handler) self.handler();
    };

    this.$onInit = function() {
        if (self.disabled === 'true'){
            self.disabled = true;
        } else {
            self.disabled = self.default.disabled;
        }

        if (self.name) wiComponentService.putComponent(self.name, self);
    };

    this.initTooltip = function () {
        $('[data-toggle="tooltip"]').tooltip();
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
        disabled: '@'
    }
});

exports.name = moduleName;