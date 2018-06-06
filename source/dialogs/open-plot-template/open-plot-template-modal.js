let helper = require('./DialogHelper');
module.exports = function (ModalService, projectLoaded, callback) {
    function ModalController($scope, close, wiComponentService, wiApiService) {
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        const utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let payloadParams = new Object();
        this.plotName = "PlotTemplate";
        payloadParams.idProject = projectLoaded.idProject;
        this.error = null;
        this.tplFile = null;
        let self = this;
        window.iml = this;
        this.onCancelButtonClicked = function () {
            close(null, 100);
        };
        this.onOkButtonClicked = function () {
            payloadParams.file = self.tplFile;
            payloadParams.plotName = self.plotName;
            wiApiService.postWithTemplateFile(payloadParams)
            .then(function (response) {
                if (response.length == 0) {
                    utils.refreshProjectState()
                    .then(function () {
                        close(response, 500);
                    })
                    .catch(function (err) {
                        utils.error(err);
                        close(null, 500);
                    });
                } else {
                    utils.refreshProjectState().then(function(){
                        close(response, 500);
                        let message = "";
                        if(!response.idPlot){
                            response.forEach(function(r){
                                message += "Curve: " + r.dataset + "." + r.curve + " Not exist! <br>";
                            });
                            setTimeout(function(){
                                DialogUtils.warningMessageDialog(ModalService, message);
                            }, 1000);
                        }
                    });
                }
            })
            .catch(function (err) {
                utils.error(err);
            })
        };
    }

    ModalService.showModal({
        templateUrl: "open-plot-template.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (data) {
            helper.removeBackdrop();
            if (data) console.log("imported", data);
            if(callback && data) callback(data);
        });
    });
}