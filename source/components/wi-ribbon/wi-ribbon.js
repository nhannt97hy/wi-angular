var name = 'wiRibbon';

var TABS = RIBBON_TAB_DATA_CONFIG;

function Controller() {
    var self = this;

    this.tabs = TABS;
}

app.component(name, {
    templateUrl: 'wi-ribbon.html',
    controller: Controller,
    controllerAs: name
});
