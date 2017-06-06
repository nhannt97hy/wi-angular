var name = 'wiButton';

function Controller() {
    var self = this;

    this.onClick = function() {
        // TODO: Error checking must be added here
        self.handlers.onclick();
    }
    this.onMouseOver = function() {
        // TODO: Error checking must be added here
        self.handlers.mouseover();
    }
    this.$onInit = function() {
        console.log(self.label);
        console.log(self.layout);
        console.log(self.imgurl);
        console.log(self.handlers);
        console.log(self.config);
    }
}

app.component(name, {
    templateUrl: 'wi-button.html',
    controller: Controller,
    controllerAs: name,
    bindings: {
        config: '<',
        label: '@',
        layout: '@',
        imgurl: '@',
        handlers: '<'
    }
});
