let initModal;
exports.setInitFunc = function(initFunction) {
    initModal = initFunction;
}
exports.dialogFunc = runImportWellTopDialog;

function runImportWellTopDialog(ModalService, wtCSV, callback) {
    function ModalController($scope, close, wiBatchApiService, $timeout) {
        let self = this;
        this.onOkButtonClicked = function () {
            close(null);
        };
        self.startImportWT = startImportWT;
        function startImportWT() {
            if (self.projectName && self.projectName.length)
                wiBatchApiService.runImportWellTopCSV(self.projectName, wtCSV.idUserFileUploaded, function(err, successWells){
                    if (err) toastr.error("Error:" + err.message);
                    else self.successWells = successWells;
                });
            else {
                toastr.error("Error: Enter project name to import");
            }
        }
    }

    ModalService.showModal({
        templateUrl: 'run-import-well-top-modal.html',
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

