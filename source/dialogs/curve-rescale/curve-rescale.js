let initModal;
function curveRescaleDialog (ModalService, callback) {
	function ModalController($scope, wiComponentService, wiApiService, close, $timeout) {
        let self = this;
        window.curveRe = this;
        this.applyingInProgress = false;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);

        this.curves = [];
        this.wells = utils.findWells();
        let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
        if( selectedNodes && selectedNodes.length){
            switch(selectedNodes[0].type){
                case 'well':
                    self.wellModel = selectedNodes[0];
                    break;

                case 'dataset':
                    self.wellModel = utils.findWellById(selectedNodes[0].properties.idWell);
                    self.curveModel = setLinePropertiesIfNull(selectedNodes[0].children[0]);
                    break;

                case 'curve':
                    self.wellModel = utils.findWellByCurve(selectedNodes[0].id);
                	self.curveModel = setLinePropertiesIfNull(selectedNodes[0]);
                    break;
                default:
                    self.wellModel = self.wells && self.wells.length ? angular.copy(self.wells[0]) : null;
                    break;               
            }
        }
        else {
            self.wellModel = self.wells && self.wells.length ? angular.copy(self.wells[0]) : null;
        };
        getAllCurvesOnSelectWell(self.wellModel);
        if( !this.curveModel ) {
            this.curveModel = setLinePropertiesIfNull(angular.copy(self.curves[0]));
        }
        this.idWell = this.wellModel.id;

        self.logInput = false;

        function getAllCurvesOnSelectWell(well) {
            self.datasets = [];
            self.curves = [];
            well.children.forEach(function (child) {
                if (child.type == 'dataset') self.datasets.push(child);
            });
            self.datasets.forEach(function (child) {
                child.children.forEach(function (item) {
                        self.curves.push(item);
                })
            });
        }
        defaultDepth();

        this.defaultDepth = defaultDepth;
        function defaultDepth () {
            self.topDepth = self.wellModel.topDepth;
            self.bottomDepth = self.wellModel.bottomDepth;
        }

        this.groupFn = function(item){
            return item.properties.dataset;
        }

        function setLinePropertiesIfNull (curve) {
            let resCurve = curve;
            if(resCurve.lineProperties == null) {
                let lineProperties = {
                    minScale: 0,
                    maxScale: 1
                }
                resCurve.lineProperties = lineProperties;
            }
            return resCurve;
        };

        this.outputObj = getOutput(this.curveModel);
        function getOutput (curveModel) {
            return {
                idDataset: curveModel.properties.idDataset,
                curve: curveModel.properties.name,
                unit: curveModel.properties.unit,
                leftScale: curveModel.lineProperties.minScale,
                rightScale: curveModel.lineProperties.maxScale,
                logOutput: false
            }
        }
        this.selectedWell = selectedWell;
        function selectedWell (idWell) {
            self.wellModel = utils.findWellById(idWell);
            defaultDepth();
            getAllCurvesOnSelectWell(self.wellModel);
            self.curveModel = setLinePropertiesIfNull(self.curves[0]);
            self.logInput = false;
            self.outputObj = getOutput(self.curveModel);
        }
        this.onChangeCurve = function (curveModel) {
            self.curveModel = setLinePropertiesIfNull(curveModel);
            $timeout(function(){
                self.outputObj = getOutput(self.curveModel);
            }, 100);
        }
        this.defaultDepth = function () {
            self.topDepth = self.wellModel.topDepth;
            self.bottomDepth = self.wellModel.bottomDepth;
        }
        function refresh (cb) {
            self.datasets = [];
            self.availableCurves = [];
            self.wellModel = utils.findWellById(self.idWell);
            selectedWell(self.idWell);
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
        function run () {
            if (self.applyingInProgress) return;
            self.applyingInProgress = true;
            if(self.topDepth < self.wellModel.topDepth ||
                self.bottomDepth > self.wellModel.bottomDepth)
                dialogUtils.errorMessageDialog(ModalService, "Input invalid [" + self.wellModel.topDepth + "," + self.wellModel.bottomDepth+ "]" );
            let inputData = [];
            let outputData = [];
            let yTop = Math.round((
                self.topDepth - self.wellModel.topDepth)
            /self.wellModel.step);
            let yBottom = Math.round((
                self.bottomDepth - self.wellModel.topDepth)
            /self.wellModel.step);

            function linearToLinearX (a, b, c, y, z) {
                return (c - a) * (z - y) / (b - a) + y;
            }
            function linearToLogarithmX (a, b, c, y, z) {
                return Math.pow(Math.E, (c - a) * (Math.log(z) - Math.log(y)) / ( b- a) + Math.log(y));
            }
            function logarithmToLinearX (a, b, c, y, z) {
                return (Math.log(c) - Math.log(a)) * (z - y) / (Math.log(b) - Math.log(a)) + y
            }
            function logarithmToLogarithmX (a, b, c, y, z) {
                return Math.pow(Math.E, (Math.log(c) - Math.log(a)) * (Math.log(z) - Math.log(y)) / (Math.log(b) - Math.log(a)) + log(y));
            }
            async.parallel([
                function(callback){
                    wiApiService.dataCurve(self.curveModel.id, function (dataCurve){
                        inputData = dataCurve.map(d => parseFloat(d.x));
                        callback();
                    });
                }],
                function(err, results) {
                    let len = inputData.length;

                    for(let i = 0; i < len; i++) {
                        if (inputData[i] == null || isNaN(inputData[i])) outputData.push(NaN);
                        if (!self.logInput && !self.outputObj.logOutput) {
                            outputData.push(linearToLinearX(self.curveModel.lineProperties.minScale,
                                self.curveModel.lineProperties.maxScale,
                                inputData[i],
                                self.outputObj.leftScale,
                                self.outputObj.rightScale));
                        } else if (!self.logInput && self.outputObj.logOutput) {
                            outputData.push(linearToLogarithmX(self.curveModel.lineProperties.minScale,
                                self.curveModel.lineProperties.maxScale,
                                inputData[i],
                                self.outputObj.leftScale,
                                self.outputObj.rightScale));
                        } else if (self.logInput && !self.outputObj.logOutput) {
                            outputData.push(logarithmToLinearX(self.curveModel.lineProperties.minScale,
                                self.curveModel.lineProperties.maxScale,
                                inputData[i],
                                self.outputObj.leftScale,
                                self.outputObj.rightScale));
                        } else if (self.logInput && self.outputObj.logOutput) {
                            outputData.push(logarithmToLogarithmX(self.curveModel.lineProperties.minScale,
                                self.curveModel.lineProperties.maxScale,
                                inputData[i],
                                self.outputObj.leftScale,
                                self.outputObj.rightScale));
                        };
                    };
                    console.log("outputData", inputData, outputData);
                    let request = {
                        idDataset: self.outputObj.idDataset,
                        curveName: self.outputObj.curve,
                        unit: self.outputObj.unit,
                        idDesCurve: self.curveModel.id,
                        data: utils.getDataTopBottomRange(outputData, yTop, yBottom)
                    }
                    if(self.outputObj.curve == self.curveModel.properties.name) {
                        dialogUtils.confirmDialog(ModalService, "WARNING", "OverWrite!", function (ret) {
                            if(ret) {
                                delete request.curveName;
                                delete request.unit;
                                wiApiService.processingDataCurve(request, function(res) {
                                    console.log("processingDataCurve", res);
                                    utils.refreshProjectState();
                                    self.applyingInProgress = false;
                                })
                            }
                        });
                    }
                    else {
                        delete request.idDesCurve;
                        if (self.curveModel.properties.idFamily)
                            request.idFamily = self.curveModel.properties.idFamily;
                        wiApiService.processingDataCurve(request, function(res) {
                            console.log("processingDataCurve", res);
                            utils.refreshProjectState();
                            self.applyingInProgress = false;
                        })
                    }
                })
            }
        this.onRunButtonClicked = function () {
            run();
        }
        this.onCancelButtonClicked = function () {
            close(null, 100);
        };
    }

    ModalService.showModal({
        templateUrl: "curve-rescale-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        initModal(modal);
        //$(modal.element[0].children[0]).draggable();
        modal.close.then(function (ret) {
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');
            callback(ret);
        });
    });
}
exports.setInitFunc = function(initFunction) {
    initModal = initFunction;
}
exports.curveRescaleDialog = curveRescaleDialog;