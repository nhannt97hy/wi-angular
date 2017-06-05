var name = 'ribbonToolbar';

function Controller() {
    var self = this;

    this.dataConfig = DATA_CONFIG;
}

app.component(name, {
    templateUrl: 'ribbon-toolbar.html',
    controller: Controller,
    controllerAs: name
});
