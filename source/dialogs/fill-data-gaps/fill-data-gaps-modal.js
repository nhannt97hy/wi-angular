let helper = require('./DialogHelper');
module.exports = function(ModalService, wiComponentService){
    function ModalController(wiComponentService, wiApiService, close, $timeout){
        let self = this;
        window.filldata = this;
        this.applyingInProgress = false;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);

        function refresh(cb) {
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
            self.CurvesData = new Array();
            if(cb) cb();
        }
        refresh();
        this.gapsMaximum = 3;
        this.calcMethod = 'sample';
        this.suffix = '_fg';
        this.datasets =[];
        this.curves = [];
        this.getCurveData = function () {
            let curveModel = self.CurvesData.find(curve => {return curve.id == self.SelectedCurve.id;});
            if(curveModel){
                self.Nullnumber = curveModel.data.filter(d => {return isNaN(parseFloat(d.x));}).length;
            }else{
                wiApiService.dataCurve(self.SelectedCurve.id,function (data) {
                    self.CurvesData.push({
                        id: self.SelectedCurve.id,
                        data: data
                    });
                    self.Nullnumber = data.filter(d => { return isNaN(parseFloat(d.x));}).length;
                })
            }
            self.curveName = self.SelectedCurve.properties.name;
        }
        this.onWellChange = function () {
            self.datasets.length = 0;
            self.curves.length = 0;
            if(self.selectedWell){
                this.selectedWell.children.forEach(function(child,i) {
                    if(child.type == 'dataset')
                       self.datasets.push(child);
                   if(i == self.selectedWell.children.length - 1){
                       self.datasets.forEach(function (child) {
                           child.children.forEach(function (item) {
                               if (item.type == 'curve') {
                                   let d = item;
                                   d.flag = false;
                                   d.overwrite = false;
                                   self.curves.push(d);
                               }
                           })
                       });
                   }
               })
                self.topDepth = self.selectedWell.topDepth;
                self.bottomDepth = self.selectedWell.bottomDepth;
                self.SelectedCurve = self.curves[0];
                self.selectedDataset = self.datasets[0];
                this.getCurveData();
                self.curveName = self.SelectedCurve.properties.name;
            }
        }

        this.onWellChange();
        this.onRefresh = function() {
            self.applyingInProgress = false;
            self.CurvesData.length = 0;
            $timeout(function(){
                refresh(function(){
                    self.onWellChange();
                });
            }, 0);
        }
        wiComponentService.on(wiComponentService.PROJECT_REFRESH_EVENT, self.onRefresh);
        this.clickDefault = function () {
            self.topDepth = self.selectedWell.topDepth;
            self.bottomDepth = self.selectedWell.bottomDepth;
        }
        this.groupFn = function(item){
            return item.properties.dataset;
        }

        this.checked = false;
        this.select = function (curve) {
            curve.flag = !curve.flag;
        }
        this.checkAll = function () {
            self.checked = !self.checked;
            self.curves.forEach(function (curve) {
               curve.flag = self.checked;
           })
        }
        this.CurveF = function(curve){
            return curve.id != self.SelectedCurve.id;
        }

        function visit(node, data, start, visitedPath, max){
            if(!node || isNaN(start.x)) return false;
            visitedPath.push(node);

            if(!isNaN(node.x)){
                return true;
            }else{
                let i = parseInt(node.y) - parseInt(start.y) + 1;
                while(i <= max){
                    if(visit(data[parseInt(start.y) + i], data, start,visitedPath, max)){
                        return true;
                    }
                    visitedPath.pop();
                    i++;
                }
            }
            return false;
        }
        function processing(data, callback){
            async.eachOf(data, function(d, i, cb){
                if(isNaN(data[i].x) && i != 0 && i != data.length - 1){
                    let start = data[i - 1];
                    let path = new Array();
                    let retVal = visit(data[i], data, start, path, self.maxgaps);
                    if(retVal){
                        let end = path[path.length - 1];
                        let mean = (parseFloat(end.x) - parseFloat(start.x))/path.length;
                        for(let j = 0; j < path.length - 1; j++){
                            index = parseInt(path[j].y);
                            data[index].x = (parseFloat(data[index - 1].x) + mean).toString();
                        }
                    }
                }
                cb();
            }, function(err){
                if(callback) callback();
            })
        }

        function processing2(curve, data, callback){
            processing(data, function(){
                let payload = {
                    idDataset: self.selectedDataset.id,
                    curveName: curve.name + self.suffix,
                    unit: curve.properties.unit,
                    idDesCurve: curve.id,
                    data: data.map(d => {return parseFloat(d.x);})
                }
                if(curve.overwrite) delete payload.curveName;
                wiApiService.processingDataCurve(payload, function(res){
                    if(!res.idCurve) {
                        wiComponentService.emit(wiComponentService.MODIFIED_CURVE_DATA, {
                            idCurve: payload.idDesCurve,
                            data: payload.data
                        })
                    }
                    console.log("Save curve: ", payload.curveName);
                    callback();
                })
            })
        }
        function run(){
            let step = self.selectedWell.step;
            self.maxgaps = self.calcMethod == 'sample' ? self.gapsMaximum : (self.gapsMaximum/step);
            let data = self.CurvesData.find(d => {return d.id == self.SelectedCurve.id;}).data;
            processing(data, function(){
                let payload = {
                    idDataset: self.selectedDataset.id,
                    curveName: self.curveName + self.suffix,
                    unit: self.SelectedCurve.properties.unit,
                    idDesCurve: self.SelectedCurve.id,
                    data: data.map(d => {return parseFloat(d.x);})
                }
                if(self.overwriteSelCurve){
                    delete payload.curveName;
                }
                wiApiService.processingDataCurve(payload, function(res){
                    if(!res.idCurve) {
                        wiComponentService.emit(wiComponentService.MODIFIED_CURVE_DATA, {
                            idCurve: payload.idDesCurve,
                            data: payload.data
                        })
                    }
                    console.log("Save curve: ", payload.curveName);
                    if(self.otherCurves.length){
                        async.each(self.otherCurves, function(curve, cb){
                            let curveModel = self.CurvesData.find(d => {return d.id == curve.id;});
                            if(curveModel){
                                let data = curveModel.data;
                                processing2(curve, data, cb);
                            }else{
                                wiApiService.dataCurve(curve.id, function(dataCurve){
                                    let data = dataCurve;
                                    processing2(curve, data, cb);
                                })
                            }
                        }, function(err){
                            console.log('Done processing other curves');
                            utils.refreshProjectState();
                        })

                    }else{
                        console.log('No other curves!');
                        utils.refreshProjectState();
                    }
                })

            });
        }
        function validate(){
            self.otherCurves = self.curves.filter(curve => {
				return curve.flag == true && curve.id != self.SelectedCurve.id;
			});
            if(self.otherCurves.length){
                async.each(self.otherCurves, (curve, cb) => {
                    let newName = curve.name + self.suffix;
                    let curveModel = self.otherCurves.find(c => {
                        return c.name == newName && self.selectedDataset.id == curve.properties.idDataset;
                    })
                    if(curveModel) {
                        curve.overwrite = true;
                    }
                    cb();
                }, function(err){
                    let ovw = self.otherCurves.filter(curve => {
                        return curve.overwrite == true;
                    })
                    if(ovw.length) return true;
                })
            }
            self.overwriteSelCurve = self.curves.find(c => {
                return c.name == self.curveName + self.suffix && self.selectedDataset.id == c.properties.idDataset;
            })
            if(self.overwriteSelCurve){
                return true;
            }
            return false;
        }

        this.onRunButtonClicked = function(){
            if(self.applyingInProgress) return;
            self.applyingInProgress = true;
            if(validate()){
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
        }
    }

    ModalService.showModal({
        templateUrl: "fill-data-gaps-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function () {
            wiComponentService.removeEvent(wiComponentService.PROJECT_REFRESH_EVENT, self.onRefresh)
            helper.removeBackdrop();
        });
    });
}