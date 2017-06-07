/**
 * Created by cuong on 6/6/2017.
 */
var wiButtonName = 'wiButton';
var wiToolbarButtonName = 'wiToolbarButton';

function ButtonController() {
    var self = this;
}

function ToolbarButtonController() {
    var self = this;

    this.$onInit = function() {
        this.wi_toolbar_CTRL.addButton(self.config);
    };
}
var app = angular.module('wi-buttons', []);
app.component(wiButtonName, {
    templateUrl: 'wi-button.html',
    controller: ButtonController,
    controllerAs: wiButtonName,
    bindings: {
        config: '<',
        label: '@',
        layout: '@',
        imgurl: '@',
        handlers: '<'
    }
});
app.component(wiToolbarButtonName, {
    templateUrl: 'wi-toolbar-button.html',
    transclude: true,
    require: {
        wi_toolbar_CTRL: '^wiToolbar'
    },
    controller: ToolbarButtonController,
    controllerAs: wiToolbarButtonName,
    bindings: {
        config: '<',
        label: '@',
        layout: '@',
        imgurl: '@',
        handlers: '<'
    }
});
