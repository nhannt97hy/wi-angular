let helper = require('./DialogHelper');
module.exports = function (ModalService, wiD3Ctrl) {
    function ModalController($scope, close) {
        let self = this;
        let visHistogram = wiD3Ctrl.visHistogram;
        if(wiD3Ctrl.histogramModel.properties.idZoneSet){
            this.bins = visHistogram.fullBins;
        }else{
            this.bins = visHistogram.intervalBins;
        }

        this.SelectedBinNum = null;

        this.getLength = function(b){
            return b.length;
        }

        this.getValueRange = function(b){
            return b.x0 + '<-->' + b.x1;
        }

        this.maxValueRange = getMaxValueRange();
        function getMaxValueRange(){
            let max = -99999999;
            let max_idx = -1;
            let val = null;

            self.bins.forEach(function(b, i){
                if(max < self.getLength(b)){
                    max = self.getLength(b);
                    max_idx = i;
                    val = self.getValueRange(b);
                }
            })

            return {
                id: max_idx,
                value: val
            }
        };

        this.onSearchButtonClick = function () {
            self.Point_Num = self.getLength(self.bins[self.SelectedBinNum - 1]);
            self.Max_Value = self.bins[self.SelectedBinNum - 1][self.Point_Num - 1];
        }

        this.onCloseButtonClicked = function () {
            console.log("on Close clicked");
            close();
        }
    }

    ModalService.showModal({
        templateUrl: "histogram-frequency-info-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function () {
            helper.removeBackdrop();
        });
    })
}