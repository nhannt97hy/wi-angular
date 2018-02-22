let helper = require('./DialogHelper');
module.exports = function (ModalService, callback) {
    function ModalController($scope, wiComponentService, wiApiService, close, $timeout) {
        let self = this;
        window.curveAvg = this;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let wiExplorer = wiComponentService.getComponent(wiComponentService.WI_EXPLORER);

        this.wells = utils.findWells();
        this.applyingInProgress = false;

        this.availableCurves = [];
        this.selectedCurves = [];
        this.datasets = [];
        this.calcMethod = "lateral";
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
        }
        this.select = function (curve) {
            curve.flag = !curve.flag;
        }

        function refresh (cb) {
            self.datasets = [];
            self.availableCurves = [];
            self.wellModel = utils.findWellById(self.idWell);
            defaultDepth();
            getAllCurvesOnSelectWell(self.wellModel);
            if(cb) cb();
        }
        wiComponentService.on(wiComponentService.PROJECT_REFRESH_EVENT, function() {
            self.applyingInProgress = false;
            self.wells = utils.findWells();
            $timeout(function(){
                refresh(function(){
                });
            }, 100);
        });
        function curveAverageCacl () {
            if (self.applyingInProgress) return;
            self.applyingInProgress = true;
            if(self.topDepth < self.wellModel.topDepth || self.bottomDepth > self.wellModel.bottomDepth)
                dialogUtils.errorMessageDialog(ModalService, "Input invalid [" + self.wellModel.topDepth + "," + self.wellModel.bottomDepth+ "]" );
            let selectedCurves = [];
            let allData = [];
            let dataAvg = [];
            selectedCurves = self.availableCurves.filter(function(curve, index) {
                return (curve.flag == true);
            });
            let yTop = Math.round((
                self.topDepth - self.wellModel.topDepth)
            /self.wellModel.step);
            let yBottom = Math.round((
                self.bottomDepth - self.wellModel.topDepth)
            /self.wellModel.step);
            console.log("yy", yTop, yBottom);
            if(selectedCurves.length > 0){
                async.eachOfSeries(selectedCurves, function(item, idx, callback) {
                    wiApiService.dataCurve(item.id, function (dataCurve){
                        allData.push(dataCurve.map(d => d.x));
                        callback();
                    });
                }, function(err) {
                    if (err) {
                        DialogUtils.errorMessageDialog(ModalService, err);
                    }
                    let meanData = [];
                    if(self.calcMethod == 'lateral') {
                        let len = allData[0].length;
                        for( let i = 0; i < len; i++){
                            let sum = 0;
                            let count = 0;
                            for ( let j = 0; j < allData.length; j++) {
                                if (allData[j][i] == null || isNaN(allData[j][i])) count += 1;
                                else sum += parseFloat(allData[j][i]);
                            }
                            if (count > 0) meanData.push(null);
                            else meanData.push(sum / allData.length);
                        }
                        self.desCurve.data = utils.getDataTopBottomRange(meanData, yTop, yBottom);
                    } else if (self.calcMethod == 'arithmetic') {
                        for( let i = 0; i < allData[0].length; i++){
                            let sum = 0;
                            for ( let j = 0; j < allData.length; j++) {
                                if (allData[j][i] == null || isNaN(allData[j][i])) count += 1;
                                else sum += parseFloat(allData[j][i]);
                            }
                            meanData.push(sum / (allData.length - count));
                        }
                        self.desCurve.data = utils.getDataTopBottomRange(meanData, yTop, yBottom);
                    }
                    console.log("desCurve", self.desCurve);
                    let request = {};
                    if(self.desCurve.idDesCurve) {
                        dialogUtils.confirmDialog(ModalService, "WARNING", "OverWrite!", function (ret) {
                            if(ret) {
                                let request = self.desCurve;
                                delete request.curveName;
                                console.log(request);
                                wiApiService.processingDataCurve(request, function(res) {
                                    console.log("processingDataCurve", res);
                                    utils.refreshProjectState();
                                    self.applyInProgress = false;
                                })
                            }
                        });
                    }
                    else {
                        console.log(request);
                        wiApiService.processingDataCurve(self.desCurve, function(res) {
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
        };

        this.onRunButtonClicked = function () {
            curveAverageCacl();
        }
        this.onCancelButtonClicked = function () {
            close(null, 100);
        };

    }

    ModalService.showModal({
        templateUrl: "curve-average-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (ret) {
            helper.removeBackdrop();
            callback(ret);
        });
    });
}