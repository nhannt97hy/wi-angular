let helper = require('./DialogHelper');
module.exports = function (ModalService, callback) {
    function ModalController($scope, wiComponentService, wiApiService, close, $timeout) {
        let self = this;
        window.split = this;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);

        this.process = false;

        this.disable = true;
        this.wells = utils.findWells();
        this.idWell; this.idCurve; this.idDataset;
        this.datasetModel;
        this.curves = [];
        this.datasets = [];
        this.topDepth; this.bottomDepth;
        this.numberSplit = 1;
        this.number = this.numberSplit;
        this.data;
        this.arrayCurve = [];
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
                self.curveModel = selectedNodes[0];
                self.wellModel = utils.findWellByCurve(self.curveModel.id);
                break;

                default:
                self.wellModel = self.wells && self.wells.length ? angular.copy(self.wells[0]) : null;
                break;
            }
        }else{
            self.wellModel = self.wells && self.wells.length ? angular.copy(self.wells[0]) : null;
        }

        getInfo();
        pushArrayCurve();
        function getAllCurve() {
            self.datasets = [];
            self.curves = [];
            self.wellModel.children.forEach(function(child) {
                if(child.type == 'dataset') {
                    self.datasets.push(child);
                    child.children.forEach(function(item) {
                        if(item.type == 'curve')
                            self.curves.push(item);
                    });
                }
            });
        }
        function getInfo() {
            getAllCurve();
            self.idWell = self.wellModel.id;
            self.datasetModel = self.datasets[0];
            self.idDataset = self.datasetModel.id;
            self.curveModel = self.curves[0];
            self.idCurve = self.curveModel.id;
            self.topDepth = self.wellModel.topDepth;
            self.bottomDepth = self.wellModel.bottomDepth;
        };
        this.selectWell = function (idWell) {
            self.wellModel = utils.findWellById(idWell);
            self.curveModel = self.wellModel.children[0].children[0];
            getInfo();
            self.arrayCurve.forEach(function( curve ) {
                curve.start = self.topDepth;
                curve.end = self.bottomDepth;
            });
        }
        this.selectCurve = function (idCurve) {
            self.curveModel = utils.getCurveFromId(idCurve);
        }
        this.selectDataset = function (idDataset) {
            self.datasetModel = utils.findDatasetById(idDataset);
            self.idDataset = self.datasetModel.id;
        }
        this.changeNumberSplit = changeNumberSplit;
        this.groupFn = function(item){
            return item.parent;
        }
        function pushArrayCurve() {
            self.arrayCurve.push({
                name: null,
                start: self.topDepth,
                end: self.bottomDepth,
                data: []
            });
        }
        function changeNumberSplit (numberSplit) {
            if(self.number <= numberSplit) {
                for(let i = self.number + 1; i <= numberSplit; i++)
                    pushArrayCurve();
            } else {
                self.arrayCurve.splice(numberSplit, self.number - numberSplit);
            }
            self.number = numberSplit;
        }
        function refresh() {
            self.wellModel = utils.findWellById(self.idWell);
            getInfo();
        }
        wiComponentService.on(wiComponentService.PROJECT_REFRESH_EVENT, function() {
            self.process = false;
            self.wells = utils.findWells();
            $timeout(function(){
                refresh();
            }, 100);
        });

        function check() {
            let valid = true;
            self.arrayCurve.forEach(function(curve){
                if(curve.start > curve.end ||
                    curve.start < self.topDepth ||
                    curve.end > self.bottomDepth) valid = false;
            });
            console.log("vvv", valid);
            return valid;
        }
        this.onRunButtonClicked = function () {
            if(self.process)
                return;
            self.process = true;
            let temp = check();
            if (!temp) {
                dialogUtils.errorMessageDialog(ModalService, "Depth Start or Depth End is invalid!", function(){
                    self.process = true;
                });
            } else {
                self.arrayCurve = self.arrayCurve.filter(function(c){
                    return (c.name);
                })
                wiApiService.dataCurve(self.curveModel.id, function(dataCurve) {
                    console.log(dataCurve);

                    async.each(self.arrayCurve,function(curve, cb) {
                        dataCurve.forEach(function(data, y) {
                            let currentDept = y*self.wellModel.step + self.wellModel.topDepth;

                            if(currentDept >= curve.start && currentDept <= curve.end) {
                                curve.data[y] = parseFloat(data.x);
                            }else {
                                curve.data[y] = NaN;
                            }
                        });
                        cb();
                    }, function (err) {
                        async.each(self.arrayCurve, function(curve, cb) {
                            let payload = {
                                idDataset: self.idDataset,
                                curveName: curve.name,
                                unit: self.curveModel.properties.unit,
                                data: curve.data
                            };
                            wiApiService.processingDataCurve(payload, cb);
                        }, function(err) {
                            console.log('done');
                            utils.refreshProjectState();
                            self.numberSplit = self.arrayCurve.length;
                        });
                    });
                });
            }

        }
        this.onCancelButtonClicked = function () {
            close(null, 100);
        };
    }
    ModalService.showModal({
        "templateUrl": "curve-split-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function () {
            helper.removeBackdrop();
        });
    });
}