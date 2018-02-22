let helper = require('./DialogHelper');
module.exports = function (ModalService, toolBox, idCombinedBox, callback) {
    function ModalController(wiComponentService, wiApiService, close) {
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let self = this;

        const _NEW = 'created';
        const _EDIT = 'edited';
        const _DEL = 'deleted';
        const _DEFAULT = 'default';

        let nameCounter = 0;

        this._DEL = _DEL;
        this.tools = angular.copy(toolBox);
        this.selectedRow = self.tools && self.tools.length ? 0 : -1;
        this.toolCounter = this.tools.length;

        console.log('tools', this.tools);
        console.log('toolCounter', this.toolCounter);

        this.addTool = function (index) {
            let newTool = {
                name: 'New Tool ' + ++nameCounter,
                color: self.genColor(),
                flag: _NEW
            };

            self.tools.splice(index, 0, newTool);
            self.selectedRow = self.tools.length - 1;
        }

        this.onAddButtonClicked = function () {
            self.toolCounter++;
            self.addTool(self.tools.length);
        }

        this.onToolChanged = function(index) {
            if (typeof self.tools[index].flag === 'undefined') {
                self.tools[index].flag = _EDIT;
            }
        }

        this.onDeleteButtonClicked = function () {
            self.toolCounter--;
            if (self.tools[self.selectedRow].flag != _NEW) {
                self.tools[self.selectedRow].flag = _DEL;
            } else {
                self.tools.splice(self.selectedRow, 1);
            }
            self.selectedRow = self.selectedRow > 0 ? self.selectedRow - 1 : 0;
        }
        this.onClearAllButtonClicked = function () {
            self.tools.map(function(t){
                t.flag = _DEL;
            })
            self.selectedRow = -1;
        }

        this.setClickedRow = function (indexRow) {
            self.selectedRow = indexRow;
        }

        this.selectColor = function (index) {
            dialogUtils.colorPickerDialog(ModalService, self.tools[index].color, function (colorStr) {
                self.tools[index].color = colorStr;
                self.onToolChanged(index);
            });
        }

        this.genColor = function () {
            let rand = function () {
                return Math.floor(Math.random() * 255);
            }
            return "rgb(" + rand() + "," + rand() + "," + rand() + ")";
        }

        function doApply (callback) {
            if (self.tools && self.tools.length) {
                async.eachOfSeries(self.tools, function(tool, i, callback) {
                    switch (self.tools[i].flag) {
                        case _NEW:
                        case _DEFAULT:
                            delete self.tools[i].flag;
                            self.tools[i].idCombinedBox = idCombinedBox;
                            wiApiService.createCombinedBoxTool(self.tools[i], function(data) {
                                self.tools[i] = data;
                                callback();
                            });
                            break;

                        case _EDIT:
                            delete self.tools[i].flag;
                            self.tools[i].idCombinedBox = idCombinedBox;
                            wiApiService.editCombinedBoxTool(self.tools[i], function(data) {
                                self.tools[i] = data;
                                callback();
                            });
                            break;

                        case _DEL:
                            wiApiService.removeCombinedBoxTool(self.tools[i].idCombinedBoxTool, function() {
                                callback();
                            });
                            break;

                        default:
                            callback();
                            break;
                    }
                }, function (err) {
                    for (let i = self.tools.length - 1; i >= 0; i--) {
                        switch (self.tools[i].flag) {
                            case _DEL:
                                    self.tools.splice(i, 1);
                                break;

                            case _NEW:
                            case _EDIT:
                                delete self.tools[i].flag;
                                break;
                        }
                    }
                    utils.refreshProjectState().then(function() {
                        if (callback) callback();
                    });
                });
            } else {
                if (callback) callback();
            }
        }

        this.onOkButtonClicked = function () {
            doApply(function () {
                close(self.tools);
            });
        }

        this.onCancelButtonClicked = function () {
            close(null);
        }
    }

    ModalService.showModal({
        templateUrl: "combobox-selection-modal.html",
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