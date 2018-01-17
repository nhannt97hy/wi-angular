let initModal;
function curveBulkUpdateDialog (ModalService, logTracks) {
    function ModalController(wiComponentService, wiApiService, close) {
        let self = this;
        window.cBulk = this;

        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let wiExplorer = wiComponentService.getComponent(wiComponentService.WI_EXPLORER);

        this.tracks = [];
        logTracks.forEach(function(l) {
            self.tracks.push({
                use : true,
                name : l.name,
                lines : (l.drawings).filter(d => d.type == 'curve')
            });
        });
        console.log("log: ", this.tracks);
        this.onOkButtonClicked = function(){
            close(self);
        };
        this.onCancelButtonClicked = function(){
            close(null);
        }
    }
    ModalService.showModal({
        templateUrl: "curve-bulk-update-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        initModal(modal);
        modal.close.then(function () {
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');
        });
    });
}
exports.setInitFunc = function(initFunction) {
    initModal = initFunction;
}
exports.curveBulkUpdateDialog = curveBulkUpdateDialog;