let helper = require('./DialogHelper');
module.exports = function (ModalService, curveModel, listFamily, callback) {
    function ModalController(close) {
        this.familyGroups = {};
        this.selectedFamily = listFamily.find(f => f.idFamily === curveModel.properties.idFamily);
        listFamily.forEach(family => {
            const groupKey = _.snakeCase(family.familyGroup);
            if (!this.familyGroups[groupKey]) this.familyGroups[groupKey] = [];
            this.familyGroups[groupKey].push(family);
            if (family === this.selectedFamily) this.selectedGroup = this.familyGroups[groupKey];
        })
        this.onOkButtonClicked = function () {
            close(this.selectedFamily);
        }
        this.onCancelButtonClicked = function () {
            close(null);
        }
    }
    ModalService.showModal({
        templateUrl: 'curve-family-modal.html',
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (data) {
            helper.removeBackdrop();
            if (data) {
                callback(data);
            }
        })
    })
}