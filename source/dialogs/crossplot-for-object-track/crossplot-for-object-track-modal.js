let helper = require('./DialogHelper');
module.exports = function (ModalService, objectConfig, callback) {
    function ModalController(close, wiComponentService, wiApiService, $timeout) {
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let self = this;
        this.curvesArr = objectConfig.curves;
        this.crossplotProps = angular.copy(objectConfig.properties);
        this.background = objectConfig.background;
        this.SelectedCurveX = null;
        this.SelectedCurveY = null;
        this.depthType = "intervalDepth";
        this.dragToCreate = objectConfig.dragToCreate;
        this.selectPointSymbol = ["Circle", "Cross", "Diamond", "Plus", "Square", "Star", "Triangle"];
        this.overlayLine = "----------------";
        this.selectOverlayLines = ["----------------"];
        this.datasets = [];
        this.well = utils.findWellById(this.crossplotProps.idWell);

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
                }
            }
        });

        if(this.curvesArr && !this.SelectedCurveX && this.crossplotProps.idCurveX) {
            self.SelectedCurveX = findCurveById(this.crossplotProps.idCurveX);
        }
        if(this.curvesArr && !this.SelectedCurveY && this.crossplotProps.idCurveY) {
            self.SelectedCurveY = findCurveById(this.crossplotProps.idCurveY);
        }
        if(this.curvesArr && !this.SelectedCurveZ && this.crossplotProps.idCurveZ) {
            self.SelectedCurveZ = findCurveById(this.crossplotProps.idCurveZ);
        }
        this.groupFn = function(item){
            return item.properties.dataset;
        }


        function getScaleKeys(symbol) {
            return {
                'X': ['scaleLeft', 'scaleRight'],
                'Y': ['scaleBottom', 'scaleTop'],
                'Z': ['scaleMin', 'scaleMax']
            }[symbol];
        }

        function findCurveById (idCurve) {
            for(let curve of self.curvesArr) {
                if(curve.idCurve == idCurve || curve.id == idCurve) {
                    return curve;
                }
            }
            return null;
        }

        function onSelectedCurveChange(symbol) {
            let curve = self['SelectedCurve' + symbol]
            // let idCurve = self.crossplotProps['idCurve' + symbol];
            if (curve) {
                let scaleKeys = getScaleKeys(symbol);
                let key1 = scaleKeys[0], key2 = scaleKeys[1];
                self.crossplotProps[key1] = curve.minX;
                self.crossplotProps[key2] = curve.maxX;
                self.crossplotProps['idCurve' + symbol] = curve.idCurve;
            }
        }

        this.onselectedCurveXChange = function() {
            onSelectedCurveChange('X');
        }
        this.onselectedCurveYChange = function() {
            onSelectedCurveChange('Y');
        }
        this.onselectedCurveZChange = function() {
            onSelectedCurveChange('Z');
        }

        this.pointColorSymbol = function () {
            DialogUtils.colorPickerDialog(ModalService, self.crossplotProps.pointColor, function (colorStr) {
                self.crossplotProps.pointColor = colorStr;
            });
        };

        this.backgroundColorSymbol = function() {
            DialogUtils.colorPickerDialog(ModalService, self.background, function (colorStr) {
                self.background = colorStr;
            });
        }

        this.drawIcon = utils.drawIcon;

        this.isNotValid = function () {
            let inValid = false;
            if(!self.SelectedCurveX || !self.SelectedCurveY) {
                inValid = true;
            }
            return inValid;
        }

        this.checkNameAvailable = function () {
            let isAvailable = true;
            wiApiService.getWell(self.crossplotProps.idWell, function(wellReturned) {
                if(wellReturned && wellReturned.crossplots.length) {
                    wellReturned.crossplots.forEach(function (crossplotItem) {
                        if(self.crossplotProps.name == crossplotItem.name) {
                            isAvailable = false;
                        }
                    })
                }
                if(isAvailable) {
                    DialogUtils.successMessageDialog(ModalService, "crossplot name is available");
                } else {
                    DialogUtils.warningMessageDialog(ModalService, "crossplot name existed!");
                }
            })
        }

        this.onOkButtonClicked = function () {
            self.crossplotProps.curveX = this.SelectedCurveX;
            self.crossplotProps.labelX = this.SelectedCurveX.name;
            self.crossplotProps.curveY = this.SelectedCurveY;
            self.crossplotProps.labelY = this.SelectedCurveY.name;
            self.crossplotProps.curveZ = this.SelectedCurveZ;
            self.crossplotProps.well = this.well;
            self.crossplotProps.background = this.background;

            if(callback) {
                callback(self.crossplotProps);
            }
            close(null);
        }

        this.onApplyButtonClicked = function () {
            self.crossplotProps.curveX = this.SelectedCurveX;
            self.crossplotProps.labelX = this.SelectedCurveX.name;
            self.crossplotProps.curveY = this.SelectedCurveY;
            self.crossplotProps.labelY = this.SelectedCurveY.name;
            self.crossplotProps.curveZ = this.SelectedCurveZ;
            self.crossplotProps.well = this.well;
            self.crossplotProps.background = this.background;

            if(callback) {
                callback(self.crossplotProps);
            }
        }

        this.onCancelButtonClicked = function () {
                close(null);
        }
    }
    ModalService.showModal({
        templateUrl: "crossplot-for-object-track-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function () {
            helper.removeBackdrop();
        });
    });
}