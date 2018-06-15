let helper = require('./DialogHelper');
module.exports = function(ModalService, wiComponentService){
    function ModalController(wiComponentService, wiApiService, close, $timeout){
        let self = this;
        window.DERI = this;
        this.applyingInProgress = false;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);

        this.refresh = function (cb) {
            self.wells = utils.findWells().filter(well => {
                return well.children.find(c => c.type == 'dataset');
            });
            if(!self.selectedWell){
                if(selectedNodes && selectedNodes.length){
                    switch (selectedNodes[0].type){
                        case 'well':
                        self.selectedWell = selectedNodes[0];
                        break;

                        case 'dataset':
                        self.selectedWell = utils.findWellById(selectedNodes[0].properties.idWell);
                        break;

                        case 'curve':
                        self.selectedWell = utils.findWellByCurve(selectedNodes[0].id);
                        break;

                        default:
                        self.selectedWell = self.wells && self.wells.length ? self.wells[0] : null;
                    }
                }
                else {
                    self.selectedWell = self.wells && self.wells.length ? self.wells[0]: null;
                }
            }else {
                self.selectedWell = self.wells.find(function (well) {
                    return well.id == self.selectedWell.id;
                })
            }
            if(cb) cb();
        }
        this.refresh();
        this.datasets =[];
        this.curves = [];
        this.checked = false;
        this.curveData = [];
        this.onWellChange = function () {
            self.datasets.length = 0;
            self.curves.length = 0;
            if(self.selectedWell){
                this.selectedWell.children.forEach(function (child, i) {
                    if (child.type == 'dataset')
                        self.datasets.push(child);
                    if (i == self.selectedWell.children.length - 1) {
                        self.datasets.forEach(function (child) {
                            child.children.forEach(function (item) {
                                if (item.type == 'curve') {
                                    self.curves.push(item);
                                }
                            })
                        });
                    }
                })
                self.topDepth = self.selectedWell.topDepth;
                self.bottomDepth = self.selectedWell.bottomDepth;
                if (self.curves.length) {
                    self.SelectedCurve = self.curves[0];
                    self.selectedDataset = self.datasets[0].id;
                    self.firstCurve = {
                        idDataset: self.selectedDataset,
                        curveName: self.SelectedCurve.name,
                        idDesCurve: self.SelectedCurve.properties.idDataset != self.selectedDataset ? null: self.SelectedCurve.id,
                        unit: self.SelectedCurve.properties.unit,
                        data: []
                    }
                    self.secondCurve = {
                        idDataset: self.selectedDataset,
                        curveName: self.SelectedCurve.name,
                        idDesCurve: self.SelectedCurve.properties.idDataset != self.selectedDataset ? null: self.SelectedCurve.id,
                        unit: self.SelectedCurve.properties.unit,
                        data: []
                    }
                }else {
                    delete self.firstCurve;
                    delete self.secondCurve;
                    delete self.SelectedCurve;
                    delete self.selectedDataset;
                }
            }
        }
        this.onWellChange();
        this.onRefresh = function() {
            self.applyingInProgress = false;
            if(self.firstCurve.idDesCurve || (self.checked && self.secondCurve.idDesCurve)){
                delete self.lastCurve;
            }
            $timeout(function(){
                self.refresh(function(){
                    self.onWellChange();
                });
            }, 0);
        }
        wiComponentService.on(wiComponentService.PROJECT_REFRESH_EVENT, self.onRefresh);

        this.onDatasetChange = function(){
            self.firstCurve.idDataset = self.selectedDataset;
            self.secondCurve.idDataset = self.selectedDataset;
        }
        this.groupFn = function(item){
            return item.parent;
        }

        function saveCurve(curve, reload, cb){
            let payload = angular.copy(curve);
            if(curve.idDesCurve) delete payload.curveName;
            wiApiService.processingDataCurve(payload, function(res){
                console.log('Curve Saved!');
                if(!res.idCurve) {
                    wiComponentService.emit(wiComponentService.MODIFIED_CURVE_DATA, {
                        idCurve: payload.idDesCurve,
                        data: payload.data
                    })
                }
                if(reload) utils.refreshProjectState();
                if(cb) cb();
            })
        }

        this.validate = function(){
            if(self.applyingInProgress) return true;

            if(self.topDepth == null || self.bottomDepth == null || self.topDepth > self.bottomDepth){
                return true;
            }
            if ((self.firstCurve && self.firstCurve.curveName == '') || typeof self.firstCurve == 'undefined') {
                return true;
            }

            if (self.checked) {
                if ((self.secondCurve && self.secondCurve.curveName == '') || typeof self.secondCurve == 'undefined') {
                    return true;
                }
                if(self.firstCurve.curveName == self.secondCurve.curveName) return true;
            }
        }
        this.clickDefault = function () {
            self.topDepth = self.selectedWell.topDepth;
            self.bottomDepth = self.selectedWell.bottomDepth;
        }

        function derivative(input){
            let out = new Array(input.length).fill(NaN);
            for(let i = 0; i < input.length - 1; i++){
                let step = self.selectedWell.step;
                let currentDepth = i * step + self.selectedWell.topDepth;
                if(currentDepth >= self.topDepth && currentDepth <= self.bottomDepth)
                    out[i] = (input[i + 1] - input[i])/step;
            }
            return out;
        }

        function processing(){
            self.firstCurve.data = derivative(self.curveData);
            if(self.checked){
                saveCurve(self.firstCurve, false, processing2);
            }else{
                saveCurve(self.firstCurve, true);
            }
        }

        function processing2(){
            self.secondCurve.data = derivative(self.firstCurve.data);
            saveCurve(self.secondCurve, true);
        }

        function run(){
            if(!self.lastCurve || self.lastCurve != self.SelectedCurve.id){
                self.lastCurve = self.SelectedCurve.id;
                wiApiService.dataCurve(self.SelectedCurve.id, function(data){
                    self.curveData = data.map(d => {return d.x;});
                    processing();
                })
            }else{
                processing();
            }
        }

        this.onRunButtonClicked = function(){
            if (self.applyingInProgress) return;
            self.applyingInProgress = true;

            if(self.firstCurve.idDesCurve || (self.checked && self.secondCurve.idDesCurve)){
                DialogUtils.confirmDialog(ModalService, "Save Curves", "Overwrite?", function(ret){
                    if(ret){
                        run();
                    }else{
                        self.applyingInProgress = false;
                    }
                })
            }else{
                run();
            }
        }

        this.onCancelButtonClicked = function(){
            close(null);
            wiComponentService.removeEvent(wiComponentService.PROJECT_REFRESH_EVENT, self.onRefresh);
        }
    }

    ModalService.showModal({
        templateUrl: "curve-derivative-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function () {
            helper.removeBackdrop();
        });
    });
}