let helper = require('./DialogHelper');
module.exports = function (ModalService, well, plotModel, callback) {
    function ModalController(close, wiComponentService, wiApiService, $timeout) {
        let self = this;
        this._FNEW = 1;
        this._FEDIT = 2;
        this._FDEL = 3;
        window.refW = this;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        this.props = angular.copy(plotModel.properties);
        this.props.referenceDisplay = true;
        this.ref_Curves_Arr = plotModel.properties.reference_curves?angular.copy(plotModel.properties.reference_curves):[];
        this.SelectedRefCurve = self.ref_Curves_Arr && self.ref_Curves_Arr.length ? 0: -1;
        this.well = well;
        this.datasets = [];
        this.curvesArr = [];
        this.groupFn = function(item){
            return item.properties.dataset;
        }

        this.scaleOpt = [
            {
                value: 20,
                label: '1:20'
            },
            {
                value: 50,
                label: '1:50'
            },
            {
                value: 100,
                label: '1:100'
            },
            {
                value: 200,
                label: '1:200'
            },
            {
                value: 300,
                label: '1:300'
            },
            {
                value: 500,
                label: '1:500'
            },
            {
                value: 1000,
                label: '1:1000'
            },
            {
                value: 2000,
                label: '1:2000'
            },
            {
                value: 3000,
                label: '1:3000'
            },
            {
                value: 5000,
                label: '1:5000'
            },
            {
                value: -1,
                label: 'Full'
            },
        ]
        this.well.children.forEach(function(child, i){
            switch (child.type){
                case 'dataset':
                    self.datasets.push(child);
                    break;
            }
            if (i == self.well.children.length - 1) {
                self.datasets.forEach(function (child) {
                    child.children.forEach(function (item) {
                        if (item.type == 'curve') {
                            self.curvesArr.push(item);
                        }
                    })
                });
            }
        })
        this.getTopFromWell = function() {
            return self.well.topDepth;
        }
        this.getBottomFromWell = function() {
            return self.well.bottomDepth;
        }

        this.defaultDepthButtonClick = function(){
            self.props.referenceTopDepth = self.getTopFromWell();
            self.props.referenceBottomDepth = self.getBottomFromWell();
        }

        this.chooseRefCurveColor = function(index){
            DialogUtils.colorPickerDialog(ModalService, self.ref_Curves_Arr[index].color, function (colorStr) {
                self.ref_Curves_Arr[index].color = colorStr;
            });
        }

        this.setClickedRow = function(index){
            self.SelectedRefCurve = index;
        }

        this.onRefCurveChange = function(index) {
            if(typeof self.ref_Curves_Arr[index].flag === 'undefined') {
                self.ref_Curves_Arr[index].flag = self._FEDIT;
            }
        }
        this.onSelectRefCurve = function(index){
            if(typeof self.ref_Curves_Arr[index].flag === 'undefined') {
                self.ref_Curves_Arr[index].flag = self._FEDIT;
            }

            let curve = self.curvesArr.find(c => c.id == self.ref_Curves_Arr[index].idCurve);
            self.ref_Curves_Arr[index].curve = curve.properties;
            let family = curve.lineProperties;
            if (family) {
                self.ref_Curves_Arr[index].left = family.minScale;
                self.ref_Curves_Arr[index].right = family.maxScale;
                self.ref_Curves_Arr[index].color = family.lineColor;
            }
            else {
                wiApiService.infoCurve(self.ref_Curves_Arr[index].idCurve, function(curve){
                    $timeout(function(){
                        self.ref_Curves_Arr[index].left = curve.LineProperty.minScale;
                        self.ref_Curves_Arr[index].right = curve.LineProperty.maxScale;
                        self.ref_Curves_Arr[index].color = 'black';
                    });
                })
            }
        }

        this.AddRefCurve = function(){
            let newRefCurve = {
                color: "rgb(0,0,0)",
                idHistogram: self.props.idHistogram ? self.props.idHistogram : null,
                idCrossPlot: self.props.idCrossPlot ? self.props.idCrossPlot : null,
                left: 0,
                right: 0,
                visiable: true,
                log: false,
                flag: self._FNEW
            }

            self.ref_Curves_Arr.push(newRefCurve);
        }

        this.Delete = function (index) {
            self.SelectedRefCurve = index;
            if (self.ref_Curves_Arr[self.SelectedRefCurve].flag != self._FNEW) {
                self.ref_Curves_Arr[self.SelectedRefCurve].flag = self._FDEL;
            } else {
                self.ref_Curves_Arr.splice(self.SelectedRefCurve, 1);
            }
            self.SelectedRefCurve = self.SelectedRefCurve > 0 ? self.SelectedRefCurve - 1 : -1;
        }
        this.roundDepth = function(){
            if(self.props.referenceTopDepth)
            self.props.referenceTopDepth = parseFloat(self.props.referenceTopDepth.toFixed(4));
            if(self.props.referenceBottomDepth)
            self.props.referenceBottomDepth = parseFloat(self.props.referenceBottomDepth.toFixed(4));
        }

        this.IsNotValid = function(){
            return self.props.referenceTopDepth == null || self.props.referenceBottomDepth == null ||self.props.referenceTopDepth >= self.props.referenceBottomDepth || self.props.referenceVertLineNumber == null;
        }

        this.onApplyButtonClicked = function() {
            console.log("on Apply clicked");
            if(self.ref_Curves_Arr && self.ref_Curves_Arr.length) {
                async.eachOfSeries(self.ref_Curves_Arr, function(curve, idx, cb) {
                    switch(self.ref_Curves_Arr[idx].flag){
                        case self._FDEL:
                            wiApiService.removeRefCurve(self.ref_Curves_Arr[idx].idReferenceCurve, function(){
                                console.log('removeRefCurve');
                                cb();
                            });
                            break;

                        case self._FNEW:
                            if(self.ref_Curves_Arr[idx].idCurve){
                                wiApiService.createRefCurve(self.ref_Curves_Arr[idx], function(data){
                                    self.ref_Curves_Arr[idx].idReferenceCurve = data.idReferenceCurve;
                                    console.log('createRefCurve');
                                    cb();
                                });
                            }else{
                                self.ref_Curves_Arr[idx].flag = self._FDEL;
                                cb();
                            }
                            break;

                        case self._FEDIT:
                            wiApiService.editRefCurve(self.ref_Curves_Arr[idx], function(){
                                console.log('editRefCurve');
                                cb();
                            })
                            break;

                        default:
                            cb();
                            break;
                    }
                }, function(err) {
                    for (let i = self.ref_Curves_Arr.length - 1; i >= 0; i--) {
                        switch(self.ref_Curves_Arr[i].flag){
                            case self._FDEL:
                                self.ref_Curves_Arr.splice(i, 1);
                                break;
                            case self._FNEW:
                            case self._FEDIT:
                                delete self.ref_Curves_Arr[i].flag;
                                break;
                        }
                    }
                    self.props.reference_curves = self.ref_Curves_Arr;
                    plotModel.properties = angular.copy(self.props);
                    console.log("plotModel:", plotModel.properties);
                    if (callback) callback();
                });
            }
            else {
                self.props.reference_curves = self.ref_Curves_Arr;
                plotModel.properties = angular.copy(self.props);
                if (callback) callback();
            }

        }

        this.onOKButtonClicked = function () {
            self.onApplyButtonClicked();
            close(null);
        }
        this.onCancelButtonClicked = function () {
            close(null);
        }
    }
    ModalService.showModal({
        templateUrl: "reference-windows-modal.html",
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