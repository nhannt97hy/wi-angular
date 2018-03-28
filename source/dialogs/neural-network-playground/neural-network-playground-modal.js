let helper = require('./DialogHelper');
let defaultConfig = {
    inputCurves: [],
    nLayers: 1,
    nNodes: 1,
    outputCurves: []
}
module.exports = function (ModalService, config, callback) {
    function ModalController($scope, close, wiApiService, $timeout) {
        let self = this;

        this.nnConfig = config || defaultConfig;
        this.selectedInputCurves = [];
        this.selectedOutputCurves = [];

        this.selectInputCurve = function (event, index, curve) {
            // toggle appearance
            let curveNodeSelected = d3.select('#input-curve-' + index);
            if(curveNodeSelected.classed('selected')) {
                curveNodeSelected.classed('selected', false);
                self.selectedInputCurves.splice(self.selectedInputCurves.indexOf(curve), 1);
            } else {
                curveNodeSelected.classed('selected', true);
                self.selectedInputCurves.push(curve);
            }
            console.log('current selected input curves: ', self.selectedInputCurves);
        }

        this.selectOutputCurve = function (event, index, curve) {
            // toggle appearance
            let curveNodeSelected = d3.select('#output-curve-' + index);
            if(curveNodeSelected.classed('selected')) {
                curveNodeSelected.classed('selected', false);
                self.selectedOutputCurves.splice(self.selectedOutputCurves.indexOf(curve), 1);
            } else {
                curveNodeSelected.classed('selected', true);
                self.selectedOutputCurves.push(curve);
            }
            console.log('current selected output curves: ', self.selectedOutputCurves);
        }

        this.addInputCurveButtonClicked = function () {
            console.log('add input curve button clicked');
        }

        this.removeInputCurveButtonClicked = function () {
            console.log('remove curve button clicked');
            self.selectedInputCurves.forEach(function (curve) {
                self.nnConfig.inputCurves.splice(self.nnConfig.inputCurves.indexOf(curve), 1);
            });
            self.selectedInputCurves.length = 0;
        }

        this.addOutputCurveButtonClicked = function () {
            console.log('add output curve button clicked');
        }

        this.removeOutputCurveButtonClicked = function () {
            console.log('remove output curve button clicked');
            self.selectedOutputCurves.forEach(function (curve) {
                self.nnConfig.outputCurves.splice(self.nnConfig.outputCurves.indexOf(curve), 1);
            });
            self.selectedOutputCurves.length = 0;
        }

        this.onOkButtonClicked = function () {
            close(self.nnConfig);
        };

        this.onCancelButtonClicked = function () {
            close(null);
        };
    }

    ModalService.showModal({
        templateUrl: 'neural-network-playground-modal.html',
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (data) {
            helper.removeBackdrop();
            $('.modal-backdrop').remove();
            data && callback && callback(data);
        });
    });
};
