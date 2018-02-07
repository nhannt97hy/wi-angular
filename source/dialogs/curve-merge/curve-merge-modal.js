let helper = require('./DialogHelper');
module.exports = function (ModalService) {
    function ModalController($scope, wiComponentService, wiApiService, close, $timeout) {
        let self = this;
        window.merge = this;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);

        this.wells = utils.findWells();
        this.applyingInProgress = false;

        this.availableCurves = [];
        this.selectedCurves = [];
        this.datasets = [];
        this.method = "average";
        this.selectedDataset = {};
        this.idSelectedDataset = null;
        this.desCurve = null;
        let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
        if( selectedNodes && selectedNodes.length){
            switch(selectedNodes[0].type){
                case 'well':
                self.wellModel = selectedNodes[0];
                break;

                case 'dataset':
                self.wellModel = utils.findWellById(selectedNodes[0].properties.idWell);
                break;

                case 'curve':
                self.wellModel = utils.findWellByCurve(selectedNodes[0].id);
                break;

                default:
                self.wellModel = self.wells && self.wells.length ? angular.copy(self.wells[0]) : null;
                break;
            }
        }else{
            self.wellModel = self.wells && self.wells.length ? angular.copy(self.wells[0]) : null;
        }

        self.idWell = self.wellModel.id;
        refresh();
        this.defaultDepth = defaultDepth;
        function defaultDepth () {
            self.topDepth = self.wellModel.topDepth;
            self.bottomDepth = self.wellModel.bottomDepth;
        }

        this.selectWell = function(idWell) {
            self.wellModel = utils.findWellById(idWell);
            defaultDepth();
            self.availableCurves = [];
            self.datasets = [];
            getAllCurvesOnSelectWell(self.wellModel);
        };
        function getAllCurvesOnSelectWell(well) {
            well.children.forEach(function (child) {
                if (child.type == 'dataset') self.datasets.push(child);
            });
            self.datasets.forEach(function (child) {
                child.children.forEach(function (item) {
                    if (item.type == 'curve') {
                        item.properties.dataset = child.properties.name;
                        item.flag = false;
                        self.availableCurves.push(item);
                    }
                })
            });
            self.selectedDataset = self.datasets[0];
            self.desCurve = {
                idDataset: self.availableCurves[0].properties.idDataset,
                curveName: self.availableCurves[0].name,
                idDesCurve: self.availableCurves[0].id,
                data: []
            };
            console.log("curves", self.availableCurves);
        }
        this.select = function (curve) {
            curve.flag = !curve.flag;
        }

        function refresh () {
            self.datasets = [];
            self.availableCurves = [];
            self.wellModel = utils.findWellById(self.idWell);
            defaultDepth();
            getAllCurvesOnSelectWell(self.wellModel);
        }
        wiComponentService.on(wiComponentService.PROJECT_REFRESH_EVENT, function() {
            self.applyingInProgress = false;
            self.wells = utils.findWells();
            $timeout(function(){
                refresh(function(){
                });
            }, 100);
        });
        this.onRunButtonClicked = function () {
            if (self.applyingInProgress) return;
            self.applyingInProgress = true;
            if(self.topDepth < self.wellModel.topDepth || self.bottomDepth > self.wellModel.bottomDepth)
                dialogUtils.errorMessageDialog(ModalService, "Input invalid [" + self.wellModel.topDepth + "," + self.wellModel.bottomDepth+ "]" );
            let allData = [];
            self.selectedCurves = self.availableCurves.filter(function(curve, index) {
                return (curve.flag == true);
            });
            let yTop = Math.round((
                self.topDepth - self.wellModel.topDepth)
            /self.wellModel.step);
            let yBottom = Math.round((
                self.bottomDepth - self.wellModel.topDepth)
            /self.wellModel.step);
            console.log("yy", yTop, yBottom);
            if(self.selectedCurves.length > 0){
                async.eachOfSeries(self.selectedCurves, function(item, idx, callback) {
                    wiApiService.dataCurve(item.id, function (dataCurve){
                        allData.push(dataCurve.map(d => parseFloat(d.x)));
                        callback();
                    });
                }, function(err) {
                    if (err) {
                        DialogUtils.errorMessageDialog(ModalService, err);
                    }
                    let dataRes = [];
                    let N = allData.length;
                    let len = allData[0].length;
                    for( let i = 0; i < len; i++){

                        function getAllX (allData) {
                            let tempArr = [];
                            let count = 0;
                            for ( let j = 0; j < N; j++) {
                                if (allData[j][i] == null || isNaN(allData[j][i])) count += 1;
                                else tempArr.push((allData[j][i]));
                            }
                            return {tempArr: tempArr, count: count };
                        }

                        switch (self.method) {
                            case "min":
                            if(!getAllX(allData).count) dataRes.push(NaN);
                            else dataRes.push(Math.min.apply(null, getAllX(allData).tempArr));
                            break;
                            case "max":
                            if(!getAllX(allData).count) dataRes.push(NaN);
                            else dataRes.push(Math.max.apply(null, getAllX(allData).tempArr));
                            break;
                            case "average":
                            if(!getAllX(allData).count) dataRes.push(NaN);
                            else dataRes.push(((getAllX(allData).tempArr).reduce((a, b) => a + b, 0)) / N);
                            break;
                            case "sum":
                            if(!getAllX(allData).count) dataRes.push(NaN);
                            else dataRes.push((getAllX(allData).tempArr).reduce((a, b) => a + b, 0));
                            break;
                            default:
                            break;
                        }
                    }
                    console.log("desCurve", dataRes );
                    self.desCurve.data = utils.getDataTopBottomRange(dataRes, yTop, yBottom);
                    let request = {};
                    if(self.desCurve.idDesCurve) {
                        dialogUtils.confirmDialog(ModalService, "WARNING", "OverWrite!", function (ret) {
                            if(ret) {
                                let request = self.desCurve;
                                delete request.curveName;
                                console.log("req", request);
                                wiApiService.processingDataCurve(request, function(res) {
                                    console.log("processingDataCurve", res);
                                    utils.refreshProjectState();
                                    self.applyInProgress = false;
                                })
                            }
                        });
                    }
                    else {
                        let request = self.desCurve;
                        delete request.idDesCurve;
                        console.log("req", request);
                        wiApiService.processingDataCurve(request, function(res) {
                            console.log("processingDataCurve", res);
                            utils.refreshProjectState();
                            self.applyInProgress = false;
                        })
                    }
                });
            } else {
                utils.refreshProjectState();
                self.applyInProgress = false;
            }
        }
        this.onCancelButtonClicked = function () {
            close(null, 100);
        };
    }
    ModalService.showModal({
        templateUrl: "curve-merge-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function () {
            helper.removeBackdrop();
        });
    });
}