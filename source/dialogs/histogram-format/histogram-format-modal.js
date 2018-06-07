let helper = require('./DialogHelper');
module.exports = function (ModalService, wiHistogramId, callback, cancelCallback, options) {
    function ModalController(close, wiComponentService, wiApiService, $timeout) {
        let self = this;
        if (options) this.hideApply = options.hideApply;
        window.hisFormat = this;
        this._FNEW = 1;
        this._FEDIT = 2;
        this._FDEL = 3;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let histogramModel = utils.getModel('histogram', wiHistogramId);
        this.histogramProps = angular.copy(histogramModel.properties);
        this.depthType = histogramModel.properties.idZoneSet != null ? "zonalDepth" : "intervalDepth";
        this.selectedZoneSet = null;
        this.SelectedActiveZone = self.histogramProps.activeZone != null ? self.histogramProps.activeZone : "All";
        this.well = utils.findWellByHistogram(wiHistogramId);
        this.datasets = [];
        this.zoneSetList = [];
        this.curvesArr = [];
        this.SelectedCurve = {};
        this.well.children.forEach(function (child, i) {
            switch (child.type) {
                case 'dataset':
                    self.datasets.push(child);
                    break;

                case 'zonesets':
                    self.zoneSetList = angular.copy(child.children);
                    break;
            }

            if (i == self.well.children.length - 1) {
                // set default curve
                self.datasets.forEach(function (child) {
                    child.children.forEach(function (item) {
                        if (item.type == 'curve') {
                            let d = item;
                            self.curvesArr.push(d);
                            if (d.id == self.histogramProps.idCurve) {
                                self.SelectedCurve = d;
                            }
                        }
                    })
                });

                // set default zone && activezone
                if (self.zoneSetList && self.zoneSetList.length > 0) {
                    if (!self.histogramProps.idZoneSet) {
                        self.selectedZoneSet = self.zoneSetList[0];
                    }

                    for (let i = self.zoneSetList.length - 1; i >= 0; i--) {
                        self.zoneSetList[i].idx = i;
                        if (self.zoneSetList[i].properties.idZoneSet == self.histogramProps.idZoneSet) {
                            self.selectedZoneSet = self.zoneSetList[i];
                        }
                        if (!self.zoneSetList[i].children || !self.zoneSetList[i].children.length) {
                            self.zoneSetList.splice(i, 1);
                        }
                    }
                }
            }
        })

        this.onZoneSetChange = function () {
            if (self.selectedZoneSet) {
                self.histogramProps.idZoneSet = self.selectedZoneSet.properties.idZoneSet;
            }
        }

        this.onActiveZoneChange = function () {
            if (self.SelectedActiveZone) {
                self.histogramProps.activeZone = self.SelectedActiveZone;
            }
        }

        this.onSelectCurveChange = function () {
            self.histogramProps.idCurve = self.SelectedCurve.id;
            if (options && options.autoName) {
                self.histogramProps.name = "Histogram-" + self.SelectedCurve.properties.name + "-" + self.histogramProps.idHistogram;
            }
            if (self.SelectedCurve.lineProperties) {
                self.histogramProps.leftScale = self.SelectedCurve.lineProperties.minScale;
                self.histogramProps.rightScale = self.SelectedCurve.lineProperties.maxScale;
                self.histogramProps.color = self.SelectedCurve.lineProperties.lineColor;
            } else {
                wiApiService.infoCurve(self.SelectedCurve.id, function (info) {
                    $timeout(function () {
                        self.histogramProps.leftScale = info.LineProperty.minScale;
                        self.histogramProps.rightScale = info.LineProperty.maxScale;
                        self.histogramProps.color = info.LineProperty.lineColor;
                    });
                })
            }
        }
        this.groupFn = function(item){
            return item.parent;
        }

        function getTopFromWell() {
            return self.well.topDepth;
        }

        function getBottomFromWell() {
            return self.well.bottomDepth;
        }
        this.onDepthTypeChanged = function () {
            switch (self.depthType) {
                case "intervalDepth":
                self.histogramProps.intervalDepthTop = self.histogramProps.intervalDepthTop ? self.histogramProps.intervalDepthTop: getTopFromWell();
                self.histogramProps.intervalDepthBottom = self.histogramProps.intervalDepthBottom ? self.histogramProps.intervalDepthBottom : getBottomFromWell();
                self.histogramProps.idZoneSet = null;
                break;
                case "zonalDepth":
                if(self.selectedZoneSet){
                    self.histogramProps.idZoneSet = self.selectedZoneSet.properties.idZoneSet;
                }
                break;
            }
        }

        this.defaultDepthButtonClick = function(){
            self.histogramProps.referenceTopDepth = getTopFromWell();
            self.histogramProps.referenceBottomDepth = getBottomFromWell();
        }

        this.chooseChartColor = function () {
            DialogUtils.colorPickerDialog(ModalService, self.histogramProps.color, function (colorStr) {
                self.histogramProps.color = colorStr;
            });
        }

        this.chooseRefCurveColor = function(index){
            DialogUtils.colorPickerDialog(ModalService, self.ref_Curves_Arr[index].color, function (colorStr) {
                self.ref_Curves_Arr[index].color = colorStr;
            });
        }

        this.setClickedRow = function(index){
            self.SelectedRefCurve = index;
        }
        this.isNotValid = function () {
            let inValid = false;
            if (!self.histogramProps.idZoneSet) {
                if (self.histogramProps.intervalDepthTop == null || self.histogramProps.intervalDepthBottom == null || self.histogramProps.intervalDepthTop > self.histogramProps.intervalDepthBottom) {
                    inValid = true;
                }
            }

            if (self.histogramProps.leftScale == null || self.histogramProps.rightScale == null || self.histogramProps.leftScale == self.histogramProps.rightScale) {
                inValid = true;
            }

            return inValid;
        }

        this.onApplyButtonClicked = function() {
            console.log("on Apply clicked");
            histogramModel.properties = self.histogramProps;
            wiApiService.editHistogram(histogramModel.properties, function(returnData) {
                console.log('Return Data', returnData);
                if (callback) callback(histogramModel.properties);
            });
        }

        this.onOKButtonClicked = function () {
            self.onApplyButtonClicked();
            console.log("on OK clicked");
            close(null);
        }
        this.onCancelButtonClicked = function () {
            if (cancelCallback) cancelCallback();
            close(null);
        }
    }
    ModalService.showModal({
        templateUrl: "histogram-format-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (ret) {
            helper.removeBackdrop();
            if (!ret) return;
        })
    });
};