var name = 'wiToolbar';

function Controller() {
    var self = this;

    this.dataConfig = DATA_CONFIG;
}

app.component(name, {
    templateUrl: 'wi-toolbar.html',
    controller: Controller,
    controllerAs: name
});
