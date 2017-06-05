var name = 'ribbonButton';

function Controller() {
    var self = this;

    this.$onInit = function() {
        self.onClick = HANDLER_FUNCTION[self.data.handler];
    };
}

app.component(name, {
    templateUrl: 'ribbon-button.html',
    controller: Controller,
    controllerAs: name,
    bindings: {
        data: '<'
    }
});
