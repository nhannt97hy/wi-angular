let helper = require('./DialogHelper');
module.exports = function (ModalService, callback) {
    function ModalController($scope, close, wiApiService, $timeout) {
        let self = this;
        self.template = {template: ''};
        this.onOkButtonClicked = function () {
            let data = {
                name: $scope.name,
                template: self.template
            };
            close(data);
        };

        this.onCancelButtonClicked = function () {
            close(null);
        };
        this.getTemplateList = function (wiItemDropdownCtrl) {
            wiApiService.listZoneTemplate({}, function (tmps) {
                tmps.unshift({template: ''});
                wiItemDropdownCtrl.items = tmps.map(function (tmp) {
                    return {
                        data: {
                            label: tmp.template
                        },
                        properties: tmp
                    }
                });
            });
        };
        this.templateChanged = function (templateProp) {
            console.log(templateProp);
            self.template.idZoneTemplate = templateProp.idZoneTemplate;
            self.template.template = templateProp.template;
        }
    }

    ModalService.showModal({
        templateUrl: 'new-zone-set-modal.html',
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (data) {
            helper.removeBackdrop();
            if (data) {
                callback(data);
            }
        });
    });
};
