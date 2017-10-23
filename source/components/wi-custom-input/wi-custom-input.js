const name = 'wiCustomInput';
const moduleName = 'wi-custom-input';

function Controller() {
    let self = this;

    this.onClick = function(val){
        self.model = val;
    }
}

let app = angular.module(moduleName, []);

app.component(name, {
    templateUrl: 'wi-custom-input.html',
    controller: Controller,
    controllerAs: name,
    bindings: {
        model: '=',
        options: '<'
    }
});

exports.name = moduleName;
