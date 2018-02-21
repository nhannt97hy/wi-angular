let initModal;
exports.setInitFunc = function(initFunction) {
    initModal = initFunction;
}
exports.dialogFunc = runImportDialog;

function runImportDialog(ModalService, zipArchives, zipArchive, callback) {
    function ModalController($scope, close, wiBatchApiService, $timeout) {
        let self = this;
        this.msgQueue = new Array();

        this.message = "Select a zip archive to import into Inventory";
        this.zipArchives = zipArchives;
        this.zipArchive = zipArchive;
        var socket;
        initSocket();
        this.onOkButtonClicked = function () {
            close(null);
        };

        this.onCancelButtonClicked = function () {
            close(null);
        }

        this.startImport = startImport;
        function startImport() {
            self.message = "Importing zip archive ...";
            self.animateClass = "animate";
            let token = window.localStorage.getItem('token');
            if (!self.zipArchive || !self.zipArchive.workflowName || !self.zipArchive.workflowName.length) {
                toastr.error("Please choose a zip archive");
                return;
            }
            if (!token) {
                toastr.error("Please login");
                return;
            }
            socket.emit('run-workflow', {
                token: token,
                workflowName: self.zipArchive.workflowName
            });
        }
        function initSocket() {
            socket = io(wiBatchApiService.getWiBatchUrl());
            socket.on('run-workflow-done', function(msg) {
                console.log(msg);
                $timeout(function() {
                    self.msgQueue.push(msg);
                    var conObj = $('.console');
                    conObj.scrollTop(conObj[0].scrollHeight);
                });
            }).on('run-workflow-file-result', function(msg) {
                $timeout(function() {
                    self.msgQueue.push(msg);
                    var conObj = $('.console');
                    conObj.scrollTop(conObj[0].scrollHeight);
                });
            });
            if (self.zipArchive && self.zipArchive.status == 'running') startImport();
        }
    }

    ModalService.showModal({
        templateUrl: 'run-import-modal.html',
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        initModal(modal);
        modal.close.then(function (data) {
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');

            if (data) {
                callback(data);
            }
        });
    });
};

