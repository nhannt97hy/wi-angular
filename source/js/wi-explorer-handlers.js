exports.ImportASCIIButtonClicked = function () {
    console.log('ImportASCIIButton is clicked');
}

exports.ImportMultiASCIIButtonClicked = function () {
    console.log('ImportMultiASCIIButton is clicked');
}

exports.ImportLASButtonClicked = function () {
    let self = this;
    let utils = this.wiComponentService.getComponent(self.wiComponentService.UTILS);
    let DialogUtils = this.wiComponentService.getComponent('DIALOG_UTILS');
    DialogUtils.importLASDialog(this.ModalService, function (well) {
        if (well) {
            utils.updateWellProject(self.wiComponentService, well);
        }
    });
}

exports.ImportMultiLASButtonClicked = function () {
    let self = this;
    let utils = this.wiComponentService.getComponent(self.wiComponentService.UTILS);
    let DialogUtils = this.wiComponentService.getComponent('DIALOG_UTILS');
    DialogUtils.importMultiLASDialog(this.ModalService, function (wells) {
        if (wells) {
            utils.updateWellsProject(self.wiComponentService, wells);
        }
    })
}

exports.ImportDLISButtonClicked = function () {
    console.log('ImportDLISButton is clicked');
}

exports.Interval_CoreLoaderButtonClicked = function () {
    console.log('Interval/CoreLoaderButton is clicked');
}

exports.MultiWellCoreLoaderButtonClicked = function () {
    console.log('MultiWellCoreLoaderButton is clicked');
}

exports.ImportWellHeaderButtonClicked = function () {
    console.log('ImportWellHeaderButton is clicked');
}

exports.ImportWellTopButtonClicked = function () {
    console.log('ImportWellTopButton is clicked');
}

exports.ReloadProjectButtonClicked = function () {
    let utils = this.wiComponentService.getComponent(this.wiComponentService.UTILS);
    utils.refreshProjectState(this.wiComponentService, this.wiApiService)
        .then(function() {
            console.log('reload project success');
        })
        .catch(function(err) {
            console.log('reload project err', err);
        })
}

exports.CollapseProjectButtonClicked = function () {
    let rootTreeviewCtrl = this.wiComponentService.getComponent('WiExplorertreeview');
    let rootConfig = rootTreeviewCtrl.config;
    var expaned = false;
    for (let child of rootConfig) {
        expaned = child.data.childExpanded;
        if (!expaned) break;
    }
    if (expaned) {
        rootTreeviewCtrl.collapseAll(rootConfig);
    } else {
        rootTreeviewCtrl.expandAll(rootConfig);
    }
}

exports.DeleteProjectButtonClicked = function () {
    console.log('DeleteProjectButton is clicked');
}

exports.BrowseProjectButtonClicked = function () {
    let self = this;
    let wiComponentService = this.wiComponentService;
    let DialogUtils = wiComponentService.getComponent('DIALOG_UTILS');
    DialogUtils.openProjectDialog(this.ModalService, function (projectData) {
        let utils = self.wiComponentService.getComponent('UTILS');
        utils.projectOpen(self.wiComponentService, projectData);
    });
}
