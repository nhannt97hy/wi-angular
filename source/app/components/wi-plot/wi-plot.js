const componentName = 'wiPlot';
const moduleName = 'wi-plot';

function Controller($scope, wiComponentService, wiApiService, ModalService, $timeout) {
    let self = this;
    let graph = wiComponentService.getComponent(wiComponentService.GRAPH);
    this.$onInit = function () {
        console.log('wi plot initialization: ', this);
        self.plotAreaId = self.configs.x.label + "-" + self.configs.y.label + '-plot-area';
    }
    this.onReady = function () {
        self.viWiPlot = graph.createVisualizeWiPlot({
            configs: self.configs,
            options: self.options
        }, document.getElementById(self.plotAreaId));
    }
    this.$onChanges = function (changeObj) {
        let changes = {}
        Object.keys(changeObj).forEach((key) => {
            changes[key] = changeObj[key].currentValue;
        })
        if(self.viWiPlot) {
            self.viWiPlot.updateConfigurations(changes);
        }
    }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-plot.html',
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        options: '<',
        configs: '<'
    }
});

exports.name = moduleName;
