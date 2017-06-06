var name = 'wiButton';

function Controller() {
    var self = this;

    this.onClick = function() {
        // TODO: Error checking must be added here
        self.handlers.onclick();
        // self.config.handler.onclick();
    }
    this.onMouseOver = function() {
        // TODO: Error checking must be added here
        self.handlers.mouseover();
    }
    this.$onInit = function() {
        self.label = self.config.label;
        self.layout = self.config.layout;
        self.imgurl = self.config.imgUrl;
        self.handlers = self.config.handler;
        // console.log(self.label);
        // console.log(self.layout);
        // console.log(self.imgurl);
        // console.log(self.handlers);
        console.log(self.config);
        this.wi_toolbar_CTRL.addButton(self.config);
    }
    

}

app.component(name, {
    templateUrl: 'wi-button.html',
    transclude: true,
    require: {
        wi_toolbar_CTRL: '^wiToolbar'
    },
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
