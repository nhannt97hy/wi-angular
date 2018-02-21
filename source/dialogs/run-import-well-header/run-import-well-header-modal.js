let initModal;
exports.setInitFunc = function(initFunction) {
    initModal = initFunction;
}
exports.dialogFunc = runImportWellHeaderDialog;

function runImportWellHeaderDialog(ModalService, initFunc, callback) {
    function ModalController($scope, close, wiBatchApiService, $timeout, wiComponentService) {
        let self = this;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        this.onOkButtonClicked = function () {
            close(null);
        };
        this.onInitDialog = function() {
            let spinner = new Spinner({
                color: '#FFF',
                shadow: true
            });
            let backdrop = document.getElementById('spinner-holder');
            backdrop.appendChild(spinner.spin().el);
            self.loading = true;
            initFunc && initFunc(function(err, successWells) {
                if (err) toastr.error("Error:" + (err.message || err));
                successWells.sort(function(w1, w2) {
                    return (w1.wellName < w2.wellName) ? -1 : 1;
                });
                self.successWells = successWells.map(function(well) {
                    let wellModel = utils.createWellModel(well);
                    wellModel.children = new Array();
                    for (let hdr in well.header) {
                        wellModel.children.push({
                            type: 'header',
                            data: {
                                childExpanded: false,
                                icon: 'fa fa-code',
                                label: hdr + " = " + well.header[hdr]
                            },
                            children: []
                        });
                    }
                    return wellModel;
                });
                self.loading = false;
            });
            /*
            wiBatchApiService.runImportWellHeaderCSV(whCSV.idUserFileUploaded, function(err, successWells){
                if (err) toastr.error("Error:" + (err.message || err));
                self.successWells = successWells;
                self.loading = false;
            });
            */
        }
    }

    ModalService.showModal({
        templateUrl: 'run-import-well-header-modal.html',
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        initModal(modal);
        modal.close.then(function (data) {
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');
            if (callback) {
                callback(data);
            }
        });
    });
};

