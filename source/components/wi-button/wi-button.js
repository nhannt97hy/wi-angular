const wiButtonName = 'wiButton';
const moduleName = 'wi-button';

function ButtonController(wiComponentService) {
    let self = this;

    this.default = {
        type: 'small',
        label: '',
        tooltip: '',
        layout: 'icon-top',
        // icon: 'project-new-16x16',
        disabled: false,
        initialState: {}
    };

    this.onClick = function () {
        if(self.isCheckType){
            self.checked = !self.checked;
        }
        if (self.handler) {
            if (self.index) {
                self.handler(self.index);
            } else {
                if (self.handlerArgs) {
                    if (Array.isArray(self.handlerArgs)) self.handler(...self.handlerArgs);
                    else self.handler(self.handlerArgs);
                } else {
                    self.handler();
                }
            }
        }
    };

    this.$onInit = function () {
        if (self.container === 'ribbon' || self.container === 'explorer') {
            this.default.initialState.disabled = self.isDisabled();

            wiComponentService.on(wiComponentService.PROJECT_LOADED_EVENT, function () {
                self.disabled = false;
            });

            wiComponentService.on(wiComponentService.PROJECT_UNLOADED_EVENT, function () {
                self.disabled = self.default.initialState.disabled;
            });
        }
    };

    this.initTooltip = function () {
        $('[data-toggle="tooltip"]').tooltip();
    };

    this.isDisabled = function () {
        if (self.disabled === true) {
            return true;
        } else if (self.disabled === false) {
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
        style: '@',
        type: '@',
        isCheckType: '<',
        name: '@',
        index: "<",
        tooltip: '@',
        label: '@',
        layout: '@',
        icon: '@',
        checked: '<',
        handler: '<',
        handlerArgs: '<',
        disabled: '<',
        separator: '@',
        container: '@'
    }
});

exports.name = moduleName;