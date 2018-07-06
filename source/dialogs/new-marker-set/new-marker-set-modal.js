let helper = require('./DialogHelper');
module.exports = function (ModalService, callback) {
    function ModalController($scope, close, wiApiService, $timeout) {
        let self = this;
        $scope.name = "";
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
            wiApiService.listMarkerTemplate(function (tmps) {
                tmps.unshift({template: ''});
                let uniqTmps = _.uniq(tmps, 'template');
                wiItemDropdownCtrl.items = uniqTmps.map(function (tmp) {
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
            self.template = templateProp.template;
            console.log($scope.name);
        }
    }

    ModalService.showModal({
        templateUrl: 'new-marker-set-modal.html',
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
