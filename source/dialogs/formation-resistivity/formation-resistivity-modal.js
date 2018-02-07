let helper = require('./DialogHelper');
module.exports = function (ModalService, callback) {
    function ModalController($scope, wiComponentService, wiApiService, close, $timeout) {

        let self = this;
        window.fr = this;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let wiExplorer = wiComponentService.getComponent(wiComponentService.WI_EXPLORER);
        this.wells = utils.findWells();
        let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);

        this.applyingInProgress = false;

        this.zoneSets = [];
        this.zones = [];
        this.curves = [];

        this.zoneSetModel = {};
        this.curveModel = {};
        this.unit = 'DEGC';
        this.desCurve = null

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

                case 'zoneset':
                self.wellModel = utils.findWellById(selectedNodes[0].properties.idWell);
                self.zoneSetModel = selectedNodes[0];
                break;

                case 'zone':
                self.zoneSetModel = utils.findZoneSetById(selectedNodes[0].properties.idZoneSet);
                self.wellModel = utils.findWellById(this.zoneSetModel.properties.idWell);
                break;

                default:
                self.wellModel = self.wells && self.wells.length ? angular.copy(self.wells[0]) : null;
                break;
            }
        }
        else {
            self.wellModel = self.wells && self.wells.length ? angular.copy(self.wells[0]) : null;
        };

        this.idWell = this.wellModel.id;
        selectWell (this.idWell);
        this.selectWell = selectWell;
        function selectWell (idWell) {
            self.wellModel = utils.findWellById(idWell);
            self.curves = self.wellModel.children[0].children;
            self.curveModel = getCurveModel(self.curves).curveModel;
            self.unit = getCurveModel(self.curves).unit;
            self.datasets = self.wellModel.children;
            self.datasetModel = self.datasets[0];
            // self.zones = [];
            self.zoneSets = utils.getZoneSetsInWell(self.wellModel);
            // if (!self.zoneSetModel || !Object.keys(self.zoneSetModel).length) {
            //         self.zoneSetModel = self.zoneSets[0];
            // }
            if (selectedNodes && selectedNodes[0].type == 'zoneset') {
                    self.zoneSetModel = selectedNodes[0];
            }
            else self.zoneSetModel = self.zoneSets[0];
            selectZoneSet (self.zoneSetModel);

            self.desCurve = {
                idDataset: self.datasetModel.id,
                curveName: 'Rw',
                idDesCurve: null,
                data: []
            };
        }
        this.selectZoneSet = selectZoneSet;
        function selectZoneSet (zoneSetModel) {
            self.zones = [];
            if (zoneSetModel && Object.keys(zoneSetModel).length) self.zones = zoneSetModel.children;
        }
        function getCurveModel (curves) {
            let curveModel = {};
            let unit = 'DEGC';
            curves.forEach(function(c) {
                if (c.properties.name == 'TEMP') {
                    curveModel = c;
                    unit = c.properties.unit;
                }
            });
            let frCurves = curves.filter(function (c) {
                return (c.lineProperties &&
                    (c.lineProperties.name == 'Formation Temperature'  ||
                        c.lineProperties.name == 'Temperature'))
            });
            if ((!curveModel || !Object.keys(curveModel).length) && frCurves.length) {
                curveModel = frCurves[0];
                unit = frCurves[0].properties.unit;
            }
            return {curveModel : curveModel, unit : unit};
        }
        this.groupFn = function(item){
            return item.properties.dataset;
        }

        this.onRunButtonClicked = function () {
            if (self.applyingInProgress) return;
            self.applyingInProgress = true;

            let inputData = [];
            let outputData = [];

            function tempF(unit, temp) {
                let t = null;
                if (temp != null || !isNaN(temp)) {
                    if (unit == 'DEGC') t = 1.8 * temp + 32;
                    else if (unit == 'DEGF') t = temp;
                }
                return t;
            }
            function rWF (cSP, temp) {
                let t = tempF (self.unit, temp);
                return ( ((1 / (2.74 * Math.pow(10, -4) * Math.pow(cSP, 0.955))) + 0.0123 ) * (81.77 / (t + 6.77)) );
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
                        self.zones.forEach(function(z) {
                            if (!isNaN(outputData[i])) return;

                            if(z.hasOwnProperty('use') && z.use && z.hasOwnProperty('sanility') && z.sanility
                                && (i >= utils.convertRangeDepthToIndex(z.properties.startDepth, self.wellModel))
                                && (i <= utils.convertRangeDepthToIndex(z.properties.endDepth, self.wellModel))) {
                                    outputData[i] = rWF(z.sanility, inputData[i]);
                                }

                            else outputData[i] = NaN;
                        });
                    };
                    console.log("outputData", inputData, outputData);
                    let request = {
                        idDataset: self.desCurve.idDataset,
                        curveName: self.desCurve.curveName,
                        unit: 'OHM.M',
                        idDesCurve: self.desCurve.idDesCurve,
                        data: outputData
                    }
                    if(self.desCurve.hasOwnProperty('idDesCurve') && self.desCurve.idDesCurve != null) {
                        dialogUtils.confirmDialog(ModalService, "WARNING", "OverWrite!", function (ret) {
                            if(ret) {
                                delete request.curveName;
                                delete request.unit;
                                console.log("request", request);
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
                        request.idFamily = 66;
                        wiApiService.processingDataCurve(request, function(res) {
                            console.log("processingDataCurve", res);
                            utils.refreshProjectState();
                            self.applyingInProgress = false;
                        })
                    }
                })
        }
        this.onCancelButtonClicked = function () {
            close(null, 100);
        };

    }

    ModalService.showModal({
        templateUrl: "formation-resistivity-modal.html",
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