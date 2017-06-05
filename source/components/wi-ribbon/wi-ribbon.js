var name = 'wiRibbon';

function Controller() {
    var self = this;

    console.log('ok men')
}

app.component(name, {
    templateUrl: 'wi-ribbon.html',
    controller: Controller,
    controllerAs: name
});
