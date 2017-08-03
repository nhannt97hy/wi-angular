const componentName = 'wiList';
const moduleName = 'wi-list';

function Controller(wiComponentService) {
    let self = this;
    this.shown = true;

    this.$onInit = function() {
        if (self.name) wiComponentService.putComponent(self.name, self);
    };

    this.addItem = function (key, value) {
        self.items.push({key, value});
    };

    this.onChange = debounce(function (item) {
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        utils.editProperty(item);
    }, 300);

    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-list.html',
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        name : '@',
        heading: '@',
        items: '<'
    }
});

exports.name = moduleName;
