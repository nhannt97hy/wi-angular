let helper = require('./DialogHelper');
module.exports = function(ModalService){
    function ModalController(close, wiComponentService, wiApiService, $timeout, $scope){
        let self = this;
        window.SArchie = this;
        this.applyingInProgress = false;
        this.finished = false;

        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        this.wells = utils.findWells();
        this.datasets = [];
        this.wells.forEach(well => {
            self.datasets = self.datasets.concat(well.children.filter(c => {
                return c.type == 'dataset';
            }));
        });
        this.template = new Object();
        this.selectedCurves = [];

        this.onFilterChange = function(groupBy){
            let _temps = new Set();
            function filter(dataset){
                switch(self.filterBy){
                    case 'group':
                    dataset.children.forEach(c => {
                        if(c.lineProperties)
                        _temps.add(c.lineProperties.familyGroup);
                    })
                    break;

                    case 'family':
                    dataset.children.forEach(c => {
                        if(c.lineProperties)
                        _temps.add(c.lineProperties.name);
                    })
                    break;

                    case 'curve':
                    dataset.children.forEach(c => {
                        _temps.add(c.name);
                    })
                    break;
                }
            }
            switch(self.groupBy){
                case 'well':
                    if(groupBy){
                        self.selWell = groupBy;
                    }
                    if(self.selWell){
                        let _datasets = self.datasets.filter(d => d.properties.idWell == self.selWell.id);
                        _datasets.forEach(d => {
                            filter(d);
                        })
                    }
                    break;

                case 'dataset':
                    if(groupBy){
                        self.selDataset = groupBy;
                    }
                    if(self.selDataset) filter(self.selDataset);
                    break;
                }
                self.templates = Array.from(_temps);
        }

        this.onSelectTemplate = function(type){
            if(self.selTemplate){
                self.template[type] = {
                    type: self.filterBy,
                    name: self.selTemplate
                }
            }else{
                toastr.error("please select data type!");
            }
        }

        this.onApplyButtonClicked = function(){
            console.log("Applying Saturation!");
        }

        this.onOKButtonClicked = function(){
            console.log("OK Saturation");
        }

        this.onCancelButtonClicked = function(){
            close();
        }
    }

    ModalService.showModal({
        templateUrl: "saturation-archie-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (ret) {
            helper.removeBackdrop();
            if (!ret) return;
        })
    });
}