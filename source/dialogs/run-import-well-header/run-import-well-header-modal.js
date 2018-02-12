let initModal;
exports.setInitFunc = function(initFunction) {
    initModal = initFunction;
}
exports.dialogFunc = runImportWellHeaderDialog;

function runImportWellHeaderDialog(ModalService, whCSV, callback) {
    function ModalController($scope, close, wiBatchApiService, $timeout) {
        let self = this;
        this.onOkButtonClicked = function () {
            close(null);
        };

        wiBatchApiService.runImportWellHeaderCSV(whCSV.idUserFileUploaded, function(err, successWells){
            if (err) toastr.error("Error:" + (err.message || err));
            self.successWells = successWells;
        });
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

