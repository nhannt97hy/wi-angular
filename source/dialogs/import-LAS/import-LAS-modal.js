let helper = require('./DialogHelper');
module.exports = function (ModalService) {
    function ModalController($scope, close, wiComponentService, wiApiService) {
        let self = this;
        this.error = null;
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        const utils = wiComponentService.getComponent(wiComponentService.UTILS);

        this.lasFile = null;
        this.selectedWell = null;
        this.selectedDataset = null;
        this.isDisabled = false;
        this.wellName = null;
        this.datasetName = null;

        this.projectLoaded = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);

        this.onWellNameChange = function () {
            self.error = null;
            if (self.wellName != null) {
                self.projectLoaded.wells.forEach(function (well) {
                    if (well.name.toLowerCase() == self.wellName.toLowerCase()) {
                        self.error = 'Well name already existed!';
                    }
                });
            }
        }
        this.onDatasetNameChange = function() {
            self.error = null;
            if (self.datasetName != null) {
                self.selectedWell.datasets.forEach(function (dataset) {
                    if (dataset.name.toLowerCase() == self.datasetName.toLowerCase()) {
                        self.error = 'Dataset name already existed';
                    }
                })
            }
        }
        this.onLoadButtonClicked = function () {
            if (self.error) return;

            if (!self.lasFile) return;

            self.isDisabled = true;

            let payloadParams = {
                id_project: self.projectLoaded.idProject
            };

            if (self.selectedWell) {
                payloadParams.id_well = self.selectedWell.idWell;
            }

            if (self.selectedDataset) {
                payloadParams.id_dataset = self.selectedDataset.idDataset;
            }
            if (self.wellName) {
                payloadParams.well_name = self.wellName;
            }
            if (self.datasetName) {
                payloadParams.dataset_name = self.datasetName;
            }
            payloadParams.file = self.lasFile;

            let spinner = wiComponentService.getComponent('SPINNER');
            if(self.selectedDataset){
                DialogUtils.confirmDialog(ModalService, "WARNING!", "Importing data to dataset existed! Do you want to continue?", function(yes){
                    if(!yes){
                        self.isDisabled = false;
                    } else {
                        spinner.show();
                        wiApiService.postWithFile('/file', payloadParams)
                        .then(function (well) {
                            console.log('well response', well);
                            if (well) {
                                setTimeout(function() {
                                    utils.refreshProjectState()
                                        .then(function () {
                                            close(well, 500);
                                        })
                                        .catch(function () {
                                            self.isDisabled = false;
                                            utils.error(err);
                                        });
                                    spinner.hide();
                                }, 2000);
                            }
                        })
                        .catch(function (err) {
                            spinner.hide();
                            console.log('err', err);
                            self.isDisabled = false;
                            utils.error(err);
                        })
                    }
                });
            } else {
                if(self.selectedWell){
                    DialogUtils.confirmDialog(ModalService, "WARNING!", "Importing data to well existed! Do you want to continue?", function(yes){
                        if(!yes){
                            self.isDisabled = false;
                        } else {
                            spinner.show();
                            wiApiService.postWithFile('/file', payloadParams)
                            .then(function (well) {
                                console.log('well response', well);
                                if (well) {
                                    setTimeout(function() {
                                        utils.refreshProjectState()
                                            .then(function () {
                                                close(well, 500);
                                            })
                                            .catch(function () {
                                                self.isDisabled = false;
                                                utils.error(err);
                                            });
                                        spinner.hide();
                                    }, 2000);
                                }
                            })
                            .catch(function (err) {
                                spinner.hide();
                                console.log('err', err);
                                self.isDisabled = false;
                                utils.error(err);
                            })
                        }
                    });
                } else {
                    spinner.show();
                    wiApiService.postWithFile('/file', payloadParams)
                    .then(function (well) {
                        console.log('well response', well);
                        if (well) {
                            setTimeout(function () {
                                utils.refreshProjectState()
                                    .then(function () {
                                        close(well, 500);
                                    })
                                    .catch(function () {
                                        self.isDisabled = false;
                                        utils.error(err);
                                    });
                                spinner.hide();
                            }, 2000)
                        }
                    })
                    .catch(function (err) {
                        spinner.hide();
                        console.log('err', err);
                        self.isDisabled = false;
                        utils.error(err);
                    })
                }
            }
        };

        this.onCancelButtonClicked = function () {
            console.log("onCancelButtonClicked");
            close(null, 100);
        };
    }

    ModalService.showModal({
        templateUrl: "import-LAS-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (data) {
            helper.removeBackdrop();
            if (data) console.log("imported", data);
        });
    });
};