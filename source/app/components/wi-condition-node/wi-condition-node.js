const name = 'wiConditionNode';
const moduleName = 'wi-condition-node';

function Controller() {
    let self = this;
}

let app = angular.module(moduleName, []);

app.component(name, {
    templateUrl: 'wi-condition-node.html',
    transclude: true,
    controller: Controller,
    controllerAs: name,
    bindings: {
        'item': '<'
    }
});

exports.name = moduleName;
