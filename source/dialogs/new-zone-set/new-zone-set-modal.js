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

        function randomString() {
            let text = "";
            let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for (let i = 0; i < 15; i++)
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            return text;
        }


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
            console.log($scope.name);
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
