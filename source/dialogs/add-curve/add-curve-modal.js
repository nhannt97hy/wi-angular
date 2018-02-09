let helper = require('./DialogHelper');
module.exports = function (ModalService, Selwell) {
    function ModalController($scope, wiComponentService, wiApiService, close, $timeout){
        let self = this;
        this.applyingInProgress = false;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);

        this.wellArr = utils.findWells();
        if(Selwell){
            self.SelectedWell = Selwell;
        }else{
            if(selectedNodes && selectedNodes.length){
                switch (selectedNodes[0].type){
                    case 'well':
                    self.SelectedWell = selectedNodes[0];
                    break;

                    case 'dataset':
                    self.SelectedWell = utils.findWellById(selectedNodes[0].properties.idWell);
                    self.datasetName = selectedNodes[0];
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
        }

        this.datasets = [];
        this.curves = [];
        this.families = utils.getListFamily();
        this.selectedFamily = this.families[0];
        this.onWellChanged = function(){
            self.datasets.length = 0;
            self.curves.length = 0;
            if(self.SelectedWell){
                self.SelectedWell.children.forEach(function(child, i){
                    if(child.type == 'dataset')
                        self.datasets.push(child);
                    if(i== self.SelectedWell.children.length -1){
                        if(self.datasets && self.datasets.length!= 0){
                            if(!self.datasetName) self.datasetName = self.datasets[0].id;
                            self.datasets.forEach(function(child){
                                child.children.forEach(function (curve) {
                                    if (curve.type == 'curve') {
                                       self.curves.push(curve);
                                   }
                               })
                            })
                        }
                    }
                })
            }
        }

        this.onWellChanged();
        this.onFamilyChanged = function () {
            self.unit = self.selectedFamily.family_spec.length ? self.selectedFamily.family_spec[0].unit : null;
        }
        this.onFamilyChanged();
        this.onRunButtonClicked = function () {
            if (self.applyingInProgress) return;
            self.applyingInProgress = true;
            let curve = self.curves.find(curve=> {
                return curve.name == self.curveName && curve.properties.idDataset == self.datasetName;
            })
            if(curve){
                toastr.error('Curve existed!');
                self.applyingInProgress = false;
            }else {
                let bottomDepth = self.SelectedWell.bottomDepth;
                let topDepth = self.SelectedWell.topDepth;
                let step = self.SelectedWell.step;
                let length = Math.ceil((bottomDepth - topDepth)/step)+1;
                let initValue = self.initValue?self.initValue:100;
                let payload = {
                    curveName : self.curveName,
                    idDataset : self.datasetName,
                    data : new Array(length).fill(initValue),
                    unit : self.unit,
                    idFamily : self.selectedFamily.idFamily
                }
                wiApiService.processingDataCurve(payload,function(curve, err){
                    if (err) {
                        self.applyingInProgress = false;
                        $scope.$apply();
                        return;
                    }
                    utils.refreshProjectState();
                    close(null);
                })
            }
        }
        this.onCancelButtonClicked = function(){
            close(null);
        }
    }

    ModalService.showModal({
        templateUrl: "add-curve-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function () {
            helper.removeBackdrop();
        });
    });
}