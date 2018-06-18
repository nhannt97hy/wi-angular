let helper = require('./DialogHelper');
module.exports = function(ModalService) {
    function ModalController($scope, wiComponentService, wiApiService, close, $timeout) {
        let self = this;
        window.bad = this;
        this.uploading = false;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        this.wells = utils.findWells().filter(well => {
            return well.children.find(c => c.type == 'dataset');
        });
        let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
        this.applyingInProgress = false;
        this.zoneSets = [];
        this.zones = [];
        this.curves = [];
        this.datasets = [];
        this.zoneSetModel = {};
        this.curveModel = {};
        let inputCurves = [];
        let outputCurve = [];
        this.dataCurves = [];

        if (selectedNodes && selectedNodes.length && selectedNodes[0].type == 'well') this.wellModel = selectedNodes[0];
        else if (selectedNodes && selectedNodes.length && selectedNodes[0].type == 'zoneset') {
            this.wellModel = utils.findWellById(selectedNodes[0].properties.idWell);
            this.zoneSetModel = selectedNodes[0];
        } else if (selectedNodes && selectedNodes.length && selectedNodes[0].type == 'zone') {
            this.zoneSetModel = utils.findZoneSetById(selectedNodes[0].properties.idZoneSet);
            this.wellModel = utils.findWellById(this.zoneSetModel.properties.idWell);
        } else if (selectedNodes && selectedNodes.length && selectedNodes[0].type == 'curve') {
            this.curveModel = selectedNodes[0];
            this.wellModel = utils.findWellByCurve(this.curveModel.id);
        } else this.wellModel = angular.copy(self.wells[0]);

        this.idWell = this.wellModel.id;
        selectWell(this.idWell);
        this.selectWell = selectWell;
        function zoneModels() {
            self.modelCurves = [];
            self.modelCurves = angular.copy(self.zones);
            self.modelCurves.forEach(function(z) {
                z.coalDensityCurve = 1.8;
                z.coalNeuCurve = 0.5;
                z.coalSonicCurve = 120;
                z.saltNeuCurve = 2.04;
                z.saltSonicCurve = 0;
                z.saltDensityCurve = 67;
                z.discrMinCurve = '';
                z.discrMaxCurve = '';
                z.badholeChecked = true;
                z.coalChecked = true;
                z.saltChecked = true;
            })
        }
        function selectWell(idWell) {
            self.wellModel = utils.findWellById(idWell);
            self.curves.length = 0;
            self.datasets.length = 0;
            if(self.wellModel ){
                self.wellModel.children.forEach(function (child, i) {
                    if (child.type == 'dataset')
                        self.datasets.push(child);
                    if (i == self.wellModel.children.length - 1) {
                        self.datasets.forEach(function (child) {
                            child.children.forEach(function (item) {
                                if (item.type == 'curve') {
                                    self.curves.push(item);
                                }
                            })
                        })
                    }
                })
            }
            self.curveModel = getCurveModel(self.curves).curveModel;
            self.curveDensity = getcurveDensity(self.curves).curveModel;
            self.curveNeutron = getcurveNeutron(self.curves).curveModel;
            self.curveSonic = getcurveSonic(self.curves).curveModel;
            self.datasetModel = self.datasets[0];
            self.zoneSets = utils.getZoneSetsInWell(self.wellModel);
            if (selectedNodes && selectedNodes[0].type == 'zoneset') {
                self.zoneSetModel = selectedNodes[0];
            } else self.zoneSetModel = self.zoneSets[0];
            selectZoneSet(self.zoneSetModel);
            zoneModels()
            if (self.curves.length) {
                let badhole = self.curves.find(c=>{
                    return c.name = "BadHole" && c.properties.idDataset== self.datasetModel.id;
                })
                let coal = self.curves.find(c=>{
                    return c.name = "Coal" && c.properties.idDataset== self.datasetModel.id;
                })
                let salt = self.curves.find(c=>{
                    return c.name = "Salt" && c.properties.idDataset== self.datasetModel.id;
                })
                self.badholeCurve = {
                    idDataset: self.datasetModel.id,
                    curveName: "BadHole",
                    idDesCurve: badhole?badhole.id:null,
                    data: [],
                    percent:"0%"
                }
                self.coalCurve = {
                    idDataset: self.datasetModel.id,
                    curveName: "Coal",
                    idDesCurve: coal?coal.id:null,
                    data: [],
                    percent:"0%"
                }
                self.saltCurve = {
                    idDataset: self.datasetModel.id,
                    curveName: "Salt",
                    idDesCurve: salt?salt.id:null,
                    data: [],
                    percent:"0%"
                }
            }else {
                delete self.badholeCurve;
                delete self.coalCurve;
                delete self.saltCurve;
            }
        }
        this.selectZoneSet = selectZoneSet;
        this.groupFn = function(item){
            return item.parent;
        }
        function selectZoneSet(zoneSetModel) {
            self.zones = [];
            if (zoneSetModel && Object.keys(zoneSetModel).length) {
                self.zones = zoneSetModel.children;
                zoneModels()
            }
        }
        function getCurveModel(curves) {
            let curveModel = {};
            let frCurves = curves.filter(function(c) {
                return (c.lineProperties &&
                    (c.lineProperties.name == 'Characteristic caliper diameter'));
            });
            curveModel = frCurves[0];
            if ((!frCurves || !frCurves.length) && curves.length) {
                curveModel = curves[0];
            }
            return {
                curveModel: curveModel
            };
        }
        function getcurveDensity(curves) {
            let curveDensity = {};
            let frCurves = curves.filter(function(c) {
                return (c.lineProperties &&
                    ((c.lineProperties.name == 'Density') || (c.lineProperties.name == 'Bulk Density')));
            });
            curveDensity = frCurves[0];
            if ((!frCurves || !frCurves.length) && curves.length) {
                curveDensity = curves[0];
            }
            return {
                curveModel: curveDensity
            };
        }
        function getcurveNeutron(curves) {
            let curveNeutron = {};
            let frCurves = curves.filter(function(c) {
                return (c.lineProperties &&
                    ((c.lineProperties.name == 'Thermal Neutron Porosity') || (c.lineProperties.name == 'Neutron Porosity')));
            });
            curveNeutron = frCurves[0];
            if ((!frCurves || !frCurves.length) && curves.length) {
                curveNeutron = curves[0];
            }
            return {
                curveModel: curveNeutron
            };
        }
        function getcurveSonic(curves) {
            let curveSonic = {};
            let frCurves = curves.filter(function(c) {
                return (c.lineProperties &&
                    ((c.lineProperties.name == 'Neutron Porosity') || (c.lineProperties.name == 'Acoustic')));
            });
            curveSonic = frCurves[0];
            if ((!frCurves || !frCurves.length) && curves.length) {
                curveSonic = curves[0];
            }
            return {
                curveModel: curveSonic
            };
        }
        wiComponentService.on(wiComponentService.PROJECT_REFRESH_EVENT, function () {
            self.applyingInProgress = false;
            $timeout(function () {
                self.wells =  utils.findWells().filter(well => {
                    return well.children.find(c => c.type == 'dataset');
                });
                selectWell(self.idWell);
            }, 0);
        })
        function validate() {
            let validA = [];
            let validB = [];
            self.modelCurves.forEach(zone => {
                if (zone.badholeChecked && !!zone.discrMinCurve == false && !!zone.discrMaxCurve == false){
                    validA.push(zone);
                }
                if (!zone.badholeChecked) {
                    validB.push(zone);
                }
            })
            if (validB.length == self.modelCurves.length) {
              return true;
            }
            if (validA.length) { return !validA.length;}
            else {return true;}
        }
        function run() {
            inputCurves = [self.curveModel, self.curveDensity, self.curveNeutron, self.curveSonic];
            async.eachSeries(inputCurves, function(model, cb) {
                let curve = self.dataCurves.find(function(c) {
                    return c.id == model.id;
                })
                if (curve) {
                    cb();
                } else {
                    wiApiService.dataCurve(model.id, dataCurve => {
                        self.dataCurves.push({
                            id: model.id,
                            data: dataCurve.map(d => {
                                return parseFloat(d.x);
                            })
                        });
                        cb();
                    });
                }
            }, function(err) {
                let len = Math.round((self.wellModel.bottomDepth - self.wellModel.topDepth) / self.wellModel.step);
                self.badholeCurve.data = new Array(len).fill(NaN);
                self.coalCurve.data = new Array(len).fill(NaN);
                self.saltCurve.data = new Array(len).fill(NaN);
                let curve1 = self.dataCurves.find(function(c) {
                    return c.id == self.curveDensity.id;
                })
                let curve2 = self.dataCurves.find(function(c) {
                    return c.id == self.curveNeutron.id;
                })
                let curve3 = self.dataCurves.find(function(c) {
                    return c.id == self.curveSonic.id;
                })
                let curve4 = self.dataCurves.find(function(c) {
                    return c.id == self.curveModel.id;
                })
                for (let i = 0; i <= len; i++) {
                    self.modelCurves.forEach(zone => {
                        if (i >= (zone.properties.startDepth - self.wellModel.topDepth) / self.wellModel.step &&
                            i <= (zone.properties.endDepth - self.wellModel.topDepth) / self.wellModel.step) {
                            if (zone.coalChecked) {
                                if (curve1.data[i] < zone.coalDensityCurve &&
                                    curve2.data[i] > zone.coalNeuCurve &&
                                    curve3.data[i] > zone.coalSonicCurve) {
                                    self.coalCurve.data[i] = 1;
                                } else {
                                    self.coalCurve.data[i] = 0;
                                }
                            }
                            if (zone.saltChecked) {
                                if (curve1.data[i] < zone.saltDensityCurve &&
                                    curve2.data[i] < zone.saltNeuCurve &&
                                    curve3.data[i] < zone.saltSonicCurve) {
                                    self.saltCurve.data[i] = 1;
                                } else {
                                    self.saltCurve.data[i] = 0;
                                }
                            }
                            if (zone.badholeChecked) {
                                if ((curve4.data[i] > zone.discrMinCurve && zone.discrMaxCurve == '') ||
                                    (curve4.data[i] < zone.discrMaxCurve && zone.discrMinCurve == '')) {
                                    self.badholeCurve.data[i] = 0;
                                } else {
                                    self.badholeCurve.data[i] = 1;
                                }
                            }
                        }
                    })
                }
                self.uploading = true;
                async.each(outputCurve,function (c,callback) {
                    if (c.idDesCurve) {
                        delete c.curveName;
                    }else {
                        delete c.idDesCurve;
                    }
                    wiApiService.processingDataCurve(c,function () {
                        callback();
                    },function (percent) {
                        c.percent = percent + "%";
                    })

                },function (err) {
                    self.uploading = false;
                    utils.refreshProjectState();
                })
            })

        }
        this.onRunButtonClicked = function() {
            if (self.applyingInProgress) return;
            self.applyingInProgress = true;
            if (validate()) {
                let overwriteCurve = new Set();
                outputCurve = [self.badholeCurve,self.coalCurve,self.saltCurve];
                outputCurve.forEach(c=>{
                    if (c.idDesCurve) {
                        overwriteCurve.add("<br>" + c.curveName);
                    }
                })
                if (overwriteCurve.size) {
                    dialogUtils.confirmDialog(ModalService,"Save Curve","Overwrite curve : " + Array.from(overwriteCurve) + "<br>?",function (res) {
                        if(res){
                            run();
                        }else {
                            self.applyingInProgress = false;
                        }

                    })
                }else {
                    run();
                }
            }else {
                utils.error('No Bad Hole discriminator is selected');
                self.applyingInProgress = false;
            }

        }
        this.onCancelButtonClicked = function() {
            close(null);
        };
    }

    ModalService.showModal({
        templateUrl: "badhole-coal-salt-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function(modal) {
        helper.initModal(modal);
        modal.close.then(function (data) {
            helper.removeBackdrop();
            if (data) {
                callback(data);
            }
        })
    });
}