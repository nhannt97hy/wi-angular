const componentName = 'wiNeuralNetwork';
const moduleName = 'wi-neural-network';

function Controller($scope, wiComponentService, wiApiService, ModalService, $timeout) {
    let self = this;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let graph = wiComponentService.getComponent(wiComponentService.GRAPH);

    this.neuralNetworkPlotAreaId = 'neuralNetworkPlotArea';

    this.onReady = function () {
        this.viNeuralNetwork = graph.createNNPlayground(self.getConfigs(), document.getElementById(self.neuralNetworkPlotAreaId));
    }
    this.$onChanges = function (changeObj) {
        // console.log("objectChanges: ", changeObj);
        if(self.viNeuralNetwork) {
            // // when visualization element is ready
            Object.keys(changeObj).forEach((key)=> {
                let change = {};
                change[key] = self[key];
                self.viNeuralNetwork.setProperties(change);
                self.viNeuralNetwork.prepareLayers();
            });
        }
    }
    this.neuralNetWorkProperties = function () {
        let config = self.getConfigs();
        DialogUtils.neuralNetWorkPropertiesDialog(ModalService, config, function (nnConfig) {
            self.setConfigs(nnConfig);
            self.viNeuralNetwork.setProperties(nnConfig);
            self.viNeuralNetwork.prepareLayers();
        });
    }
    this.getConfigs = function () {
        return {
            inputCurves: self.inputCurves,
            // nLayers: self.nLayers,
            // nNodes: self.nNodes,
            outputCurves: self.outputCurves,
            hiddenLayer: self.hiddenLayer
        }
    }
    this.setConfigs = function (newConfig) {
        Object.keys(newConfig).forEach((key)=> {
            self[key] = newConfig[key];
        });
    }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-neural-network.html',
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        inputCurves: '<',
        // nLayers: '<',
        // nNodes: '<',
        outputCurves: '<',
        hiddenLayer: '<'
    }
});

exports.name = moduleName;
