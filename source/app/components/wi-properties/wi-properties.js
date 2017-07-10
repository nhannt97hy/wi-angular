const componentName = 'wiProperties';
const moduleName = 'wi-properties';

function Controller(wiComponentService) {
    let self = this;

    this.$onInit = function () {
        if (self.name) wiComponentService.putComponent(self.name, self);

        wiComponentService.on('update-properties', doUpdateListConfig);
    };

    function doUpdateListConfig(newConfig) {
        self.listConfig = newConfig;

        console.log('doUpdateListConfig', newConfig)
    }

    this.updateListConfig = function(newConfig) {
        doUpdateListConfig(newConfig);       
    }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-properties.html',
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        name: '@',
        listConfig: '<'
    }
});

exports.name = moduleName;
