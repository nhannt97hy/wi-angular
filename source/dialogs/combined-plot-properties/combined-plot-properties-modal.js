let helper = require('./DialogHelper');
module.exports = function (ModalService, callback) {
    function ModalController(wiComponentService, wiApiService, close) {
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let self = this;

        // let project = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);
        // let wells = project.wells;

        let props = {
            logplot: null,
            histogram: null,
            crossplot: null
        };

        // console.log('project loaded', project);
        let blank = [{
            id: null,
            name: ''
        }];

        this.logplots = blank.concat(wiComponentService.getComponent('project-logplots'));
        this.histograms = blank.concat(wiComponentService.getComponent('project-histograms'));
        this.crossplots = blank.concat(wiComponentService.getComponent('project-crossplots'));

        for (let i = 1; i < this.logplots.length; i++) this.logplots[i].wellName = this.logplots[i].parentData.label;
        for (let i = 1; i < this.histograms.length; i++) this.histograms[i].wellName = this.histograms[i].parentData.label;
        for (let i = 1; i < this.crossplots.length; i++) this.crossplots[i].wellName = this.crossplots[i].parentData.label;
        // wells.forEach(function(well) {
        //     well.plots.forEach(function(plot) {
        //         plot.wellName = well.name;
        //         self.logplots.push(plot);
        //     });

        //     well.histograms.forEach(function(histogram) {
        //         histogram.wellName = well.name;
        //         self.histograms.push(histogram);
        //     });

        //     well.crossplots.forEach(function(crossplot) {
        //         crossplot.wellName = well.name;
        //         self.crossplots.push(crossplot);
        //     });
        // });


        // this.logplots = blank.concat(this.logplots);
        // this.histograms = blank.concat(this.histograms);
        // this.crossplots = blank.concat(this.crossplots);

        // console.log('logplots', this.logplots);
        // console.log('histograms', this.histograms);
        // console.log('crossplots', this.crossplots);

        this.onSelectLogplot = function(selectedLogplot) {
            console.log(selectedLogplot);
            props.logplot = selectedLogplot;
        }

        this.onSelectHistogram = function(selectedHistogram) {
            console.log(selectedHistogram);
            props.histogram = selectedHistogram;
        }

        this.onSelectCrossplot = function(selectedCrossplot) {
            console.log(selectedCrossplot);
            props.crossplot = selectedCrossplot;
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
            callback(ret);
        });
    });
}