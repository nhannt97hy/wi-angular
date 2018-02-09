let helper = require('./DialogHelper');
module.exports = function (ModalService, objectConfig, callback) {
    function ModalController(close, wiComponentService, wiApiService, $timeout) {
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let self = this;

        this.datasets = [];
        this.well = utils.findWellById(objectConfig.properties.idWell);
        this.curvesArr = objectConfig.curves;
        this.histogramProps = angular.copy(objectConfig.properties);
        this.histogramProps.dragToCreate = objectConfig.dragToCreate;
        this.histogramProps.background = objectConfig.background;
        this.SelectedCurve = this.histogramProps.curve;

        this.well.children.forEach(function (child, i) {
            switch (child.type) {
                case 'dataset':
                    self.datasets.push(child);
                    break;
            }

            if (i == self.well.children.length - 1) {
                for(let j = 0; j < self.curvesArr.length; ++j) {
                    let dataset = self.datasets.find(function (item) {
                        return item.id == self.curvesArr[j].idDataset;
                    });
                    // self.curvesArr[j].datasetName = dataset.name;
                    if((self.SelectedCurve && self.SelectedCurve.id == self.curvesArr[j].idCurve) || (self.histogramProps.curveId == self.curvesArr[j].idCurve)) {
                        self.SelectedCurve = self.curvesArr[j];
                    }
                }
            }
        });


        if(this.SelectedCurve != null) {
            self.histogramProps.idCurve = self.SelectedCurve.id;
            self.histogramProps.leftScale = this.histogramProps.leftScale || self.SelectedCurve.minX;
            self.histogramProps.rightScale = this.histogramProps.rightScale || self.SelectedCurve.maxX;
            if(!self.histogramProps.intervalDepthTop) {
                self.histogramProps.intervalDepthTop = self.SelectedCurve.minY;
            }
            if(!self.histogramProps.intervalDepthBottom) {
                self.histogramProps.intervalDepthBottom = self.SelectedCurve.maxY;
            }
        }

        this.onSelectCurveChange = function () {
            self.histogramProps.curveId = self.SelectedCurve.id;
            self.histogramProps.leftScale = self.SelectedCurve.minX;
            self.histogramProps.rightScale = self.SelectedCurve.maxX;
            if(!self.histogramProps.intervalDepthTop) {
                self.histogramProps.intervalDepthTop = self.SelectedCurve.minY;
            }
            if(!self.histogramProps.intervalDepthBottom) {
                self.histogramProps.intervalDepthBottom = self.SelectedCurve.maxY;
            }
            self.histogramProps.curve = self.SelectedCurve;
            //self.histogramProps.name = "Histogram " + this.SelectedCurve.alias;
        }

        this.chooseChartColor = function () {
            DialogUtils.colorPickerDialog(ModalService, self.histogramProps.color, function (colorStr) {
                self.histogramProps.color = colorStr;
            });
        }

        this.chooseBackground = function () {
            DialogUtils.colorPickerDialog(ModalService, self.histogramProps.background, function (colorStr) {
                self.histogramProps.background = colorStr;
            });
        }

        this.isNotValid = function () {
            let inValid = false;
            if (!self.histogramProps.idZoneSet) {
                if (self.histogramProps.intervalDepthTop > self.histogramProps.intervalDepthBottom) {
                    inValid = true;
                }
            }

            if (self.histogramProps.leftScale == null || self.histogramProps.rightScale == null || self.histogramProps.leftScale == self.histogramProps.rightScale) {
                inValid = true;
            }

            return inValid;
        }
        this.groupFn = function(item){
            return item.properties.dataset;
        }

        this.checkNameAvailable = function () {
            let isAvailable = true;
            wiApiService.getWell(self.histogramProps.idWell, function(wellReturned) {
                if(wellReturned && wellReturned.histograms.length) {
                    wellReturned.histograms.forEach(function (histogramItem) {
                        if(self.histogramProps.name == histogramItem.name) {
                            isAvailable = false;
                        }
                    })
                }
                if(isAvailable) {
                    DialogUtils.successMessageDialog(ModalService, "histogram name is available!");
                } else {
                    DialogUtils.warningMessageDialog(ModalService, "histogram name existed!");
                }
            })
        }

        this.onOKButtonClicked = function () {
            if(callback) {
                callback(self.histogramProps);
            }
            close(null);
        }

        this.onApplyButtonClicked = function () {
            if(callback) {
                callback(self.histogramProps);
            }
        }

        this.onCancelButtonClicked = function () {
                close(null);
        }
    }
    ModalService.showModal({
        templateUrl: "histogram-for-object-track-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function () {
            helper.removeBackdrop();
        });
    });
}