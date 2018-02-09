let helper = require('./DialogHelper');
module.exports = function (ModalService) {
    function ModalController($scope, $sce, close, wiComponentService, wiApiService) {
        let self = this;
        let inventoryBaseUrl = wiApiService.getInventoryUrl();
        this.inventoryUrl = $sce.trustAsResourceUrl(inventoryBaseUrl + `?token=${localStorage.getItem('token')}`);
        this.onCancelButtonClicked = function () {
            close(null, 100);
        };
    }

    ModalService.showModal({
        templateUrl: "inventory-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (data) {
            helper.removeBackdrop();
        });
    });
}