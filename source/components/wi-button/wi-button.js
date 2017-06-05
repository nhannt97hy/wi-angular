var name = 'wiButton';

function Controller() {
    var self = this;

    this.$onInit = function() {
        self.onClick = HANDLER_FUNCTION[self.data.handler];
    };
}

app.component(name, {
    templateUrl: 'wi-button.html',
    controller: Controller,
    controllerAs: name,
    bindings: {
        data: '<'
    }
});
