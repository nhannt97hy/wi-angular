let helper = require('./DialogHelper');
module.exports = function(ModalService, wiComponentService, isDeconvolution){
    function ModalController(wiComponentService, wiApiService, close, $timeout){
        let self = this;
        window.curveCov = this;
        this.isDeconvolution = isDeconvolution;
        this.applyingInProgress = false;
        this.percent = 0;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);

        this.refresh = function(cb){
            self.wellArr = utils.findWells().filter(well => {
                return well.children.find(c => c.type == 'dataset');
            });
            if(!self.SelectedWell){
                if(selectedNodes && selectedNodes.length){
                    switch (selectedNodes[0].type){
                        case 'well':
                        self.SelectedWell = selectedNodes[0];
                        break;

                        case 'dataset':
                        self.SelectedWell = utils.findWellById(selectedNodes[0].properties.idWell);
                        break;

                        case 'curve':
                        self.SelectedWell = utils.findWellByCurve(selectedNodes[0].id);
                        break;

                        default:
                        self.SelectedWell = self.wellArr && self.wellArr.length ? self.wellArr[0] : null;
                    }
                }
                else {
                    self.SelectedWell = self.wellArr && self.wellArr.length ? self.wellArr[0]: null;
                }
            }else{
                self.SelectedWell = self.wellArr.find(function(well){
                    return well.id == self.SelectedWell.id;
                })
            }
            if(cb) cb();
        }
        this.refresh();
        this.datasets = [];
        this.curvesArr = [];
        this.curveData = [];
        this.onWellChanged = function(){
            if(self.SelectedWell){
                self.datasets.length = 0;
                self.curvesArr.length = 0;
                self.SelectedWell.children.forEach(function(child, i){
                    if(child.type == 'dataset')
                        self.datasets.push(child);

                    if(i == self.SelectedWell.children.length - 1){
                        async.each(self.datasets, function(child, callback){
                            async.each(child.children, function(item, cb){
                                if (item.type == 'curve') {
                                    self.curvesArr.push(item);
                                }
                                cb();
                            }, function(err){
                                callback();
                            })
                        }, function(err){
                            if(self.curvesArr.length){
                                self.inputCurve = self.curvesArr[0];
                                self.stdCurve = self.curvesArr[0];
                                self.ResultCurve = {
                                    idDataset: self.datasets[0].id,
                                    curveName: self.inputCurve.name,
                                    idDesCurve: self.inputCurve.id,
                                    unit: self.inputCurve.properties.unit,
                                    data: []
                                }
                            }else {
                                delete self.inputCurve;
                                delete self.stdCurve;
                                delete self.ResultCurve;
                            }
                        })
                    }
                })
            }
        }

        this.onWellChanged();
        this.groupFn = function(item){
            return item.properties.dataset;
        }
        this.onRefresh = function() {
            self.applyingInProgress = false;
            self.percent = 0;
            $timeout(function(){
                self.refresh(function(){
                    self.onWellChanged();
                });
            }, 0);
        }

        wiComponentService.on(wiComponentService.PROJECT_REFRESH_EVENT, self.onRefresh);

        function convolution(input, kernel, out, callback){
            // check validity of params
            if(!input || !out || !kernel) callback(false);
            if(input.length < 1 || kernel.length < 1) callback(false);

            let lstIndex = new Array();
            let inputF = new Array();
            for(let i = 0; i < input.length; i++){
                if(!isNaN(input[i])){
                    inputF.push(input[i]);
                    lstIndex.push(i);
                }
            }
            let kernelF = kernel.filter(d => {return !isNaN(d);});
            out.length = input.length;
            out.fill(NaN);

            wiApiService.convolution({input: inputF, kernel: kernelF}, (result) => {
                let retArr = result.curve;
                let len = Math.min(lstIndex.length, retArr.length);
                for(let j = 0; j < len; j++){
                    out[lstIndex[j]] = retArr[j];
                    if(j == len - 1) {
                        console.log('Done!');
                        callback(true);
                    }
                }
            })
        }

        function deconvolution(input, kernel, out, callback){ // need update
             // check validity of params
             if(!input || !out || !kernel) callback(false);
             if(input.length < 1 || kernel.length < 1) callback(false);

             let lstIndex = new Array();
             let inputF = new Array();
             for(let i = 0; i < input.length; i++){
                 if(!isNaN(input[i])){
                     inputF.push(input[i]);
                     lstIndex.push(i);
                 }
             }
             let kernelF = kernel.filter(d => {return !isNaN(d);});
             out.length = input.length;
             out.fill(NaN);

             wiApiService.deconvolution({input: inputF, kernel: kernelF}, (result) => {
                 let retArr = result.curve;
                 let len = Math.min(lstIndex.length, retArr.length);
                 for(let j = 0; j < len; j++){
                     out[lstIndex[j]] = retArr[j];
                     if(j == len - 1) {
                         console.log('Done!');
                         callback(true);
                     }
                 }
             })
        }

        function saveCurve(curve){
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
                utils.refreshProjectState();
            }, function(percent){
                self.percent = percent;
            })
        }

        function run() {
            self.curveData.length = 0;
            let curveSet = new Set();
            curveSet.add(self.inputCurve.id);
            curveSet.add(self.stdCurve.id);
            async.eachOfSeries(Array.from(curveSet), function (curve, i, done) {
                wiApiService.dataCurve(curve, function (data) {
                    let dataF = data.map(function (d) {
                        return parseFloat(d.x);
                    })
                    self.curveData.push(dataF);
                    done();
                })
            }, function (err) {
                let input = angular.copy(self.curveData[0]);
                let kernel = self.curveData.length == 1 ? angular.copy(self.curveData[0]) : angular.copy(self.curveData[1]);
                if (self.isDeconvolution) {
                    deconvolution(input, kernel, self.ResultCurve.data, function (err) {
                        if (err) {
                            // console.log(self.ResultCurve.data);
                            // self.applyingInProgress = false;
                            saveCurve(self.ResultCurve);
                        } else {
                            console.log("Deconvolution Error!");
                            self.applyingInProgress = false;
                        }
                    })
                } else {
                    convolution(input, kernel, self.ResultCurve.data, function (err) {
                        if (err) {
                            // console.log(self.ResultCurve.data);
                            // self.applyingInProgress = false;
                            saveCurve(self.ResultCurve);
                        } else {
                            console.log("Convolution Error!");
                            self.applyingInProgress = false;
                        }
                    })
                }
            })
        }

        this.onRunButtonClicked = function(){
            if (self.applyingInProgress) return;
            self.applyingInProgress = true;

            if(self.ResultCurve.idDesCurve){
                DialogUtils.confirmDialog(ModalService, "Save Curve", "Overwrite?", function(ret){
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
        templateUrl: "curve-convolution-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function () {
            helper.removeBackdrop();
        });
    });
}