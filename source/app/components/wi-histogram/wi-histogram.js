const componentName = 'wiHistogram';
const moduleName = 'wi-histogram';

function Controller($scope, wiComponentService, wiApiService, ModalService, $timeout) {
    let self = this;
    this.$onInit = function () {
        self.wiD3AreaName = self.name + "D3Area";
        if (self.name) wiComponentService.putComponent(self.name, self);
        
        $timeout()
    };
    this.getwiD3Ctrl = function() {
        return wiComponentService.getComponent(self.wiD3AreaName);
    }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-histogram.html',
    controller: Controller,
    controllerAs: componentName,
    transclude: true,
    bindings: {
        name: '@',
        id: '@'
    }
});

exports.name = moduleName;
