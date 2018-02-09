let helper = require('./DialogHelper');
module.exports = function (ModalService, callback) {
    function ModalController($scope, close, Upload, wiComponentService, wiApiService) {
        let self = this;
        this.lasInfos = null;
        this.projectLoaded = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        this.wells = this.projectLoaded.wells
        this.isDisabled = true;
        this.lasFiles = null;
        this.selectedWells = [];
        this.selectedDatasets = [];
        this.selectedCurves = [];
        this.transactionId = Date.now();
        window.iml = this;
        this.settings = {
            isOverwriteWellHeader: false,
            isCreateNewWellIfDupe: false,
            isCreateNewDatasetIfDupe: false,
            isUseUwiAsWellName: false,
            isLoadAllCurves: true
        };
        this.families = [
        'Gamma Ray',
        'Porosity',
        'Density',
        'Acoustic',
        'Resistivity',
        'Permeability',
        'Saturation',
        'Volume'
        ];
        this.selectedFamilies = {};
        this.families.forEach(function (family) {
            self.selectedFamilies[family] = true;
        });
        this.onUploadButtonClicked = function () {
            let payloadParams = {
                file: self.lasFiles,
                families: self.selectedFamilies,
                isLoadAllCurves : self.settings.isLoadAllCurves,
                transactionId: self.transactionId
            };
            //console.log(payloadParams);
            wiApiService.uploadMultiFilesPrepare(payloadParams, function (lasInfos) {
                self.lasInfos = lasInfos;
                self.curves = lasInfos[0].curves;
                self.lasInfos.forEach(function (lasInfo) {
                    lasInfo.isLoad = true;
                    lasInfo.LASName = lasInfo.originalname;
                    lasInfo.wellInfo.depthUnit = 'M';
                    lasInfo.curves.forEach(function (curve) {
                        curve.isLoad = true;
                    });
                });
                self.isDisabled = false;
                self.lasInfos.sort(function (a,b){
                    let originalnameA = a.originalname.toUpperCase();
                    let originalnameB = b.originalname.toUpperCase();
                    return (originalnameA == originalnameB ? 0 : originalnameA > originalnameB ? 1 : -1);
                });
                self.lasFiles.sort(function (a,b){
                    let nameA = a.name.toUpperCase();
                    let nameB = b.name.toUpperCase();
                    return (nameA == nameB ? 0 : nameA > nameB ? 1 : -1);
                });
            });
        }
        $scope.fileIndex = 0;
        this.onLasClick = function ($index) {
            $scope.fileIndex = $index;
            self.curves = self.lasInfos[$index].curves;
        }

        this.onRemoveFileClick = function () {
            self.lasInfos.splice($scope.fileIndex, 1);
            if (!self.lasInfos.length) {
                self.isDisabled = true;
            }
        }

        this.onRemoveAllFilesClick = function () {
            self.lasInfos = [];
            self.curves = [];
            self.isDisabled = true;
        }
        this.updateLasFiles = function () {
            // self.lasInfos.forEach(function(lasInfo, i){
            //     self.lasFiles[i].isLoad = lasInfo.isLoad;
            // });
        }
        this.updateWells = function () {
            self.selectedWells = [];
            self.lasInfos.forEach(function (lasInfo) {
                let well = self.wells.find(well => well.name == lasInfo.selectedWellName) || lasInfo.selectedWellName;
                if(well){
                    self.selectedWells.push(well);
                } else {
                    self.selectedWells.push("");
                }
                lasInfo.selectedWell = well ? well : {datasets: []};
                console.log(lasInfo.selectedWell);
            });
        }
        this.updateDatasets = function () {
            self.selectedDatasets = [];
            self.lasInfos.forEach(function (lasInfo) {
                let dataset = lasInfo.selectedDatasetName;
                if(dataset){
                    self.selectedDatasets.push(dataset);
                } else {
                    self.selectedDatasets.push("");
                }
            });
        }
        this.onLoadButtonClicked = function () {
            let selectedWellNames = [];
            let selectedDatasetNames = [];
            let selectedCurves = [];
            let wellHeaders = [];
            let isLoadFile = [];
            //console.log(self.selectedWells);
            self.selectedWells.forEach(function (well) {
                selectedWellNames.push(well.idWell ? well.name : well);
            })
            self.selectedDatasets.forEach(function (dataset) {
                selectedDatasetNames.push(dataset.idDataset ? dataset.name : dataset);
            })
            self.lasInfos.forEach(function (each, i) {
                isLoadFile.push(each.isLoad);
                wellHeaders.push(each.wellInfo);
                let curveIsLoaded = {
                    data : [],
                    length : 0
                }
                each.curves.forEach(function (c,i) {
                    if (c.isLoad) {
                        curveIsLoaded.data.push(c.name);
                        curveIsLoaded.length ++;
                    }

                });
                selectedCurves.push(curveIsLoaded);
                curveIsLoaded = {
                    data : [],
                    length : 0
                };

            });
            let payloadParams = {
                id_project: self.projectLoaded.idProject,
                settings: self.settings,
                families: self.selectedFamilies,
                file: self.lasFiles,
                id_wells: selectedWellNames,
                id_datasets: selectedDatasetNames,
                curves : selectedCurves,
                wellHeaders: wellHeaders,
                isLoad : isLoadFile
            };
            console.log('payloadParams', payloadParams);
            wiApiService.uploadMultiFiles(payloadParams)
            .then(function (wells) {
                console.log('wells response', wells);
                setTimeout(function () {
                    utils.refreshProjectState();
                    return close(wells, 500);
                }, 2000);
            })
            .catch(function (err) {
                console.log('err', err);
            });

        };

        this.onCancelButtonClicked = function () {
            console.log("onCancelButtonClicked");
            close(null, 100);
        };
    }

    ModalService.showModal({
        templateUrl: 'import-multi-LAS-modal.html',
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (data) {
            helper.removeBackdrop();
            if (data) callback(data);
        });
    });
};