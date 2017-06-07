const componentName = 'wiList';
const moduleName = 'wi-list';

function Controller($timeout) {
    var self = this;
    this.$onInit = function () {
        console.log(self.items);
    }
    this.tick = function() {
        var newItem = {
            imgUrl: '',
            key: 'key',
            value: 'value' + Date.now()
        };
        self.items.push(newItem);
        console.log('push')
        console.log(newItem)
        console.log(self.items.length);
        $timeout(self.tick, 1000);
    };
    $timeout(self.tick, 1000);

    this.onclick = function () {
        var newItem = {
            imgUrl: '',
            key: 'key',
            value: 'value' + Date.now()
        };
        self.items.push(newItem);
        console.log('push')
    }
}

var app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-list.html',
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        heading: '@',
        items: '<'
    }
});

exports.name = moduleName;
