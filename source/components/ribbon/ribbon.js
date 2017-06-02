var name = 'ribbon';

function Controller() {
    var self = this;
    
}

app.component(name, {
    templateUrl: 'ribbon-button.html',
    controller: Controller,
    controllerAs: name,
    bindings: {
        data: '<'
    }
});
