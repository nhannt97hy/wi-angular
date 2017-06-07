const componentName = 'wiList';
const moduleName = 'wi-list';

function Controller() {
    var self = this;
    this.$onInit = function () {
        console.log(self.items);
    }

    setInterval(function () {
        var newItem = {
            imgUrl: '',
            key: 'key',
            value: 'value' + Date.now()
        };
        self.items.push(newItem);
        console.log('push')
        console.log(newItem)
        console.log(self.items.length)
    }, 1000);

    this.myTrackingFunction = function (n) {
        console.log('tracking func', n)
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
