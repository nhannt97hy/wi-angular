let helper = require('./DialogHelper');
module.exports = function (ModalService, plotModels, callback) {
    function ModalController(wiComponentService, wiApiService, close) {
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let self = this;

        let props = {
            logplots: [],
            histograms: [],
            crossplots: []
        };

        let blank = [{
            id: null,
            name: ''
        }];

        // this.mainLogplots = blank.concat(wiComponentService.getComponent('project-logplots'));
        // this.mainHistograms = blank.concat(wiComponentService.getComponent('project-histograms'));
        // this.mainCrossplots = blank.concat(wiComponentService.getComponent('project-crossplots'));

        this.mainLogplots = wiComponentService.getComponent('project-logplots');
        this.mainHistograms = wiComponentService.getComponent('project-histograms');
        this.mainCrossplots = wiComponentService.getComponent('project-crossplots');

        for (let i = 0; i < this.mainLogplots.length; i++) this.mainLogplots[i].wellName = this.mainLogplots[i].parentData.label;
        for (let i = 0; i < this.mainHistograms.length; i++) this.mainHistograms[i].wellName = this.mainHistograms[i].parentData.label;
        for (let i = 0; i < this.mainCrossplots.length; i++) this.mainCrossplots[i].wellName = this.mainCrossplots[i].parentData.label;

        this.logplots = this.mainLogplots;
        this.histograms = this.mainHistograms;
        this.crossplots = this.mainCrossplots;

        this.onSelectLogplot = function(selectedLogplots) {
            props.logplots = selectedLogplots;
            if (selectedLogplots.length) {
                selectedLogplots.forEach(l => filterGroup(l.wellName));
            } else {
                filterGroup(null);
            }
            console.log(props.logplots);
        }

        this.onSelectHistogram = function(selectedHistograms) {
            props.histograms = selectedHistograms;
            if (selectedHistograms.length) {
                selectedHistograms.forEach(h => filterGroup(h.wellName));
            } else {
                filterGroup(null);
            }
            console.log(props.histograms);
        }

        this.onSelectCrossplot = function(selectedCrossplots) {
            props.crossplots = selectedCrossplots;
            if (selectedCrossplots.length) {
                selectedCrossplots.forEach(c => filterGroup(c.wellName));
            } else {
                filterGroup(null);
            }
            console.log(props.crossplots);
        }

        function filterGroup (wellName) {
            if (wellName) {
                self.logplots =  self.mainLogplots.filter(logplot => logplot.wellName == wellName);
                self.histograms = self.mainHistograms.filter(histogram => histogram.wellName == wellName);
                self.crossplots = self.mainCrossplots.filter(crossplot => crossplot.wellName == wellName);
            } else {
                self.logplots = self.mainLogplots;
                self.histograms = self.mainHistograms;
                self.crossplots = self.mainCrossplots;
            }
        }

        this.onOkButtonClicked = function () {
            close(props);
        }

        this.onApplyButtonClicked = function () {
            close(null);
        }

        this.onCancelButtonClicked = function () {
            close(null);
        }
    }

    ModalService.showModal({
        templateUrl: "combined-plot-properties-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (ret) {
            helper.removeBackdrop();
            if (ret) callback(ret);
        });
    });
}