let helper = require('./DialogHelper');
module.exports = function (ModalService, callback) {
    function ModalController($scope, wiComponentService, wiApiService, close, $timeout) {

        let self = this;
        window.uf = this;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let wiExplorer = wiComponentService.getComponent(wiComponentService.WI_EXPLORER);
        this.wells = utils.findWells();
        let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);

        this.applyingInProgress = false;


        if( selectedNodes && selectedNodes[0].type == 'well') this.wellModel = selectedNodes[0];
        else this.wellModel = this.wells[0];

        this.idWell = this.wellModel.id;
        selectWell(this.idWell);

        this.selectWell = selectWell;
        function selectWell (idWell) {
            self.wellModel = utils.findWellById(idWell);
            self.curves = [];
            self.datasets = [];
            getAllCurvesOnSelectWell(self.wellModel);
        }

        function getAllCurvesOnSelectWell(well) {
            well.children.forEach(function (child) {
                if (child.type == 'dataset') self.datasets.push(child);
            });
            self.datasets.forEach(function (child) {
                child.children.forEach(function (item) {
                    if (item.type == 'curve') {
                        self.curves.push(item);
                    }
                })
            });
            self.selectedDataset = self.datasets[0];
            self.desCurve = {
                idDataset: self.curves[0].properties.idDataset,
                curveName: self.curves[0].name,
                idDesCurve: self.curves[0].id,
                data: []
            };
        }

        this.onRunButtonClicked = function () {

        }
        this.onCancelButtonClicked = function () {
            close(null, 100);
        };

    }

    ModalService.showModal({
        templateUrl: "user-formula-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (ret) {
            helper.removeBackdrop();
        });
    });
}