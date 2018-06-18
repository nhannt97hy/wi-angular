exports.ExitButtonClicked = function () {
    let wiComponentService = this.wiComponentService;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let DialogUtils = wiComponentService.getComponent('DIALOG_UTILS');
    DialogUtils.confirmDialog(this.ModalService, "Exit Program", "Are you sure to exit program?", function (isExit) {
        if (isExit) {
            window.localStorage.removeItem('token');
            window.localStorage.removeItem('username');
            window.localStorage.removeItem('password');
            window.localStorage.removeItem('rememberAuth');
            location.reload();
        }
    })
};
exports.BatchToolsClicked = function() {
    console.log('Well Import clicked');
    let wiComponentService = this.wiComponentService;
    let layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
    let root = layoutManager.getRoot();
    if (root.contentItems && root.contentItems.length)
        root.removeChild(root.contentItems[0]);
    root.addChild({
        type: 'component',
        id: 'well-import',
        componentName: 'wi-block',
        componentState: {
            templateId: 'well-import'
        },
        title: 'Title'
    });
}
exports.lasZipArchiveUploadDone = function() {
    toastr.info('upload successfully completed');
    angular.element($('wi-stages ul')[0]).scope().ctrl.skip();
}
exports.lasZipArchiveUploadError = function(error) {
    toastr.error('Error: ' + error.reason + " (error:" + error.code + ")");
    $('wi-stage wi-chunked-upload form')[0].reset();
}

exports.wellHeaderUpload = function(file, callback) {
    let wiBatchApiService = this.wiBatchApiService;
    wiBatchApiService.uploadWellHeader(file, callback);
}
exports.wellHeaderUploadDone = function() {
    toastr.info('upload successfully completed');
    angular.element($('wi-stages ul')[0]).scope().ctrl.skip();
}
exports.wellHeaderUploadError = function(error) {
    toastr.error('Error: ' + error.reason + " (error:" + error.code + ")");
    $('wi-stage wi-chunked-upload form')[1].reset();
}
exports.wellTopUpload = function(file, callback) {
    let wiBatchApiService = this.wiBatchApiService;
    wiBatchApiService.uploadWellTop(file, callback);
}
exports.wellTopUploadDone = function() {
    toastr.info('upload successfully completed');
    angular.element($('wi-stages ul')[0]).scope().ctrl.skip();
}
exports.wellTopUploadError = function(error) {
    toastr.error('Error: ' + error.reason + " (error:" + error.code + ")");
    $('wi-stage wi-chunked-upload form')[2].reset();
}


exports.ImportBlockButtonClicked = function () {
    let wiComponentService = this.wiComponentService;
    let layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
    // console.log(layoutManager.getRoot());
    let root = layoutManager.getRoot();
    root.removeChild(root.contentItems[0]);
    root.addChild({
        type: 'component',
        id: 'import-block',
        componentName: 'wi-block',
        componentState: {
            templateId: 'import-block'
        },
        title: 'Title'
    });
};

exports.WipmButtonClicked = function () {
    let wiComponentService = this.wiComponentService;
    let layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
    // console.log(layoutManager.getRoot());
    let root = layoutManager.getRoot();
    root.removeChild(root.contentItems[0]);
    root.addChild({
        type: 'component',
        id: 'wipm',
        componentName: 'wi-block',
        componentState: {
            templateId: 'wipm'
        }
    });
};

exports.ExportToolButtonClicked = function () {
    let wiComponentService = this.wiComponentService;
    let layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
    // console.log(layoutManager.getRoot());
    let root = layoutManager.getRoot();
    root.removeChild(root.contentItems[0]);
    root.addChild({
        type: 'component',
        id: 'export-tool',
        componentName: 'wi-block',
        componentState: {
            templateId: 'export-tool'
        }
    });
};


exports.testGetData = function() {
    let wiApiService = this.wiApiService;
    console.log('Test get Data', wiApiService);
    // wiApiService.dataCurve(1, function(dataCurve) {
    //     console.log(dataCurve);
    // });
    window.WIAPISERVICE = wiApiService;

    wiApiService.getProjectInfo(1, function(projectInfo) {
        console.log(projectInfo);
        wiApiService.getProject(projectInfo, function(pInfo) {
            console.log(pInfo);
        });
    });
}
exports.isDisabled = function() {
    return !!this.wiChunkedUploadService.uploadUrl
}
exports.InventoryInspectionButtonClicked = function() {
    let wiComponentService = this.wiComponentService;
    let layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
    // console.log(layoutManager.getRoot());
    let root = layoutManager.getRoot();
    if (root.contentItems.length >0)
        root.removeChild(root.contentItems[0]);
    root.addChild({
        type: 'component',
        id: 'inventory-block',
        componentName: 'wi-block',
        componentState: {
            templateId: 'online-inventory'
        },
        title: 'Title'
    });
}
exports.InventoryConnectButtonClicked = function() {
    let wiComponentService = this.wiComponentService;
    let layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
    // console.log(layoutManager.getRoot());
    let root = layoutManager.getRoot();
    if (root.contentItems.length >0)
        root.removeChild(root.contentItems[0]);
    root.addChild({
        type: 'component',
        id: 'online-inventory',
        componentName: 'wi-block',
        componentState: {
            templateId: 'inventory-connect'
        },
        title: 'Title'
    });
}
exports.NeuralNetworkPlaygroundButtonClicked = function() {
    let wiComponentService = this.wiComponentService;
    let layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
    // console.log(layoutManager.getRoot());
    let root = layoutManager.getRoot();
    if (root.contentItems.length >0)
        root.removeChild(root.contentItems[0]);
    root.addChild({
        type: 'component',
        id: 'neural-network',
        componentName: 'wi-block',
        componentState: {
            templateId: 'neural-network-playground'
        },
        title: 'Title'
    });
}
exports.wiPlotButtonClicked = function() {
    let wiComponentService = this.wiComponentService;
    let layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
    // console.log(layoutManager.getRoot());
    let root = layoutManager.getRoot();
    if (root.contentItems.length >0)
        root.removeChild(root.contentItems[0]);
    root.addChild({
        type: 'component',
        id: 'wi-plot',
        componentName: 'wi-block',
        componentState: {
            templateId: 'wi-plot-playground'
        },
        title: 'Title'
    });
}
exports.wiXplotButtonClicked = function() {
    let wiComponentService = this.wiComponentService;
    let layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
    // console.log(layoutManager.getRoot());
    let root = layoutManager.getRoot();
    if (root.contentItems.length > 0)
        root.removeChild(root.contentItems[0]);
    root.addChild({
        type: 'component',
        id: 'wi-xplot',
        componentName: 'wi-block',
        componentState: {
            templateId: 'wi-xplot'
        },
        title: 'Title'
    });
}
exports.wiHisButtonClicked = function() {
    let wiComponentService = this.wiComponentService;
    let layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
    // console.log(layoutManager.getRoot());
    let root = layoutManager.getRoot();
    if (root.contentItems.length > 0)
        root.removeChild(root.contentItems[0]);
    root.addChild({
        type: 'component',
        id: 'wi-his',
        componentName: 'wi-block',
        componentState: {
            templateId: 'wi-his'
        },
        title: 'Title'
    });
}
exports.onInventoryInit = function(wiListCtrl) {
    let wiOnlineInvService = this.wiOnlineInvService;
    let utils = this.wiComponentService.getComponent(this.wiComponentService.UTILS);
    wiOnlineInvService.listWells({},function(wells) {
        wiListCtrl.items = wells.map(function(w) {
            return utils.wellToTreeConfig(w);
        });
    });
}

exports.MachineLearningButtonClicked = function () {
    let wiComponentService = this.wiComponentService;
    let layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
    // console.log(layoutManager.getRoot());
    let root = layoutManager.getRoot();
    root.removeChild(root.contentItems[0]);
    root.addChild({
        type: 'component',
        id: 'machine-learning',
        componentName: 'wi-block',
        componentState: {
            templateId: 'machine-learning'
        }
    });
};

exports.FlowDesignerButtonClicked = function () {
    let wiComponentService = this.wiComponentService;
    let layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
    let root = layoutManager.getRoot();
    if (root.contentItems.length > 0) root.removeChild(root.contentItems[0]);
    root.addChild({
        type: 'component',
        id: 'flow-designer',
        componentName: 'wi-block',
        componentState: {
            templateId: 'flow-designer'
        }
    });
};
