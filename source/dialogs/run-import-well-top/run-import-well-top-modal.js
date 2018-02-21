let initModal;
exports.setInitFunc = function(initFunction) {
    initModal = initFunction;
}
exports.dialogFunc = runImportWellTopDialog;

function runImportWellTopDialog(ModalService, wtCSV, callback) {
    function ModalController($scope, close, wiApiService, wiBatchApiService, $timeout) {
        let self = this;
        self.loading = false;
        self.successWells = new Array();
        this.onOkButtonClicked = function () {
            close(null);
        };
        this.initModal = function() {
            let spinner = new Spinner({
                color: '#FFF',
                shadow: true
            });
            let backdrop = document.getElementById('spinner-holder');
            backdrop.appendChild(spinner.spin().el);
        }
        self.startImportWT = startImportWT;
        function startImportWT() {
            if (self.projectName && self.projectName.length) {
                self.loading = true;
                async.series([function(done) {
                    wiBatchApiService.batchCreateWells(self.projectName, function(err, res){
                        if (err) done(err);
                        else done(null, res.idProject);
                    });
                }, function(done) {
                    wiBatchApiService.runImportWellTopCSV(self.projectName, wtCSV.idUserFileUploaded, function(err, res){
                        if (err) done(err);
                        else done(null);
                    });
                }], function(err, res) {
                    if (err) toastr.error("Error:" + err.message);
                    else {
                        self.idProject = res[0];
                        wiApiService.listWells({idProject:self.idProject}, function(wells) {
                            self.successWells.length = 0;
                            
                            wells.forEach(well => {
                                let wellModel = utils.createWellModel(well)
                                self.successWells.push(wellModel);
                            });
                        });
                    }
                    self.loading = false;
                });
                /*
                wiBatchApiService.batchCreateWells(self.projectName, function(err, res){
                    if (err) return toastr.error('Error' + err.message);

                    wiBatchApiService.runImportWellTopCSV(self.projectName, wtCSV.idUserFileUploaded, function(err, successWells){
                        if (err) toastr.error("Error:" + err.message);
                        else self.successWells = successWells;
                        self.loading = false;
                        //else self.successWells = successWells.content;
                    });
                });
                */
            }
            else {
                toastr.error("Error: Enter project name to import");
            }
        }
        this.onNodeClick = function($index, $event, node) {
            function unSelectSubTree(root) {
                root.data.selected = false;
                if (root.children) {
                    for (let c of root.children) {
                        unSelectSubTree(c);
                    }
                }
            }
            let saveState = false;
            if (node) node.data.selected = saveState;
            for (let well of self.successWells) unSelectSubTree(well);
            if (!node) return;
            node.data.selected = !saveState;
            if (node.type == 'well' && (Date.now() - (node.ts||0)) > 3 * 1000) {
                wiApiService.getWell(node.properties.idWell, function(well) {
                    node.children.length = 0;
                    if (well.zonesets && well.zonesets.length) {
                        well.zonesets.forEach(function(zoneset) {
                            let zsModel = utils.zoneSetToTreeConfig(zoneset);
                            node.children.push(zsModel);
                        });
                    }
                    node.ts = Date.now();
                });
            }
        }
    }

    ModalService.showModal({
        templateUrl: 'run-import-well-top-modal.html',
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        initModal(modal);
        modal.close.then(function (data) {
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');
            if (callback) {
                callback(data);
            }
        });
    });
};

