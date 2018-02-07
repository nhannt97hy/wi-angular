let helper = require('./DialogHelper');
module.exports = function (ModalService, wiD3Crossplot, callback){
    function ModalController($scope, wiComponentService, wiApiService, close) {
        let self = this;
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);

        let change = {
            unchanged: 0,
            created: 1,
            updated: 2,
            deleted: 3,
            uncreated: 4
        }

        let viCrossplot = wiD3Crossplot.getViCrossplot();
        this.userDefineLines = [];
        this.viCross = viCrossplot.getProperties()
        console.log("vi111", this.viCross);
        let udLinesProps = this.viCross.userDefineLines;

        udLinesProps.forEach(function(udLineItem, index) {
            udLineItem.change = change.unchanged;
            udLineItem.index = index;
            self.userDefineLines.push(udLineItem);
        });

        $scope.change = change;
        this.getUDLines = function () {
            return self.userDefineLines.filter(function (item, index) {
               return (item.change != change.deleted && item.change != change.uncreated);
           });
        }
        this.__idx = 0;
        $scope.selectedRow = 0;
        this.setClickedRow = function (indexRow) {
            $scope.selectedRow = indexRow;
            self.__idx = self.getUDLines()[indexRow].index;
        }
        this.onChange = function(index) {
            if(self.userDefineLines[index].change == change.unchanged) self.userDefineLines[index].change = change.updated;
        }
        // modal buttons
        this.removeRow = function () {
            if (!self.userDefineLines[self.__idx]) return;
            if(self.userDefineLines[self.__idx].change == change.created) {
                self.userDefineLines.splice(self.__idx, 1);
            } else {
                self.userDefineLines[self.__idx].change = change.deleted;
            }
            if (self.getUDLines().length) {
                self.setClickedRow(0);
            }
        };
        this.addRow = function () {
            self.userDefineLines.push({
                change: change.created,
                index: self.userDefineLines.length,
                lineStyle: {
                    lineColor: "blue",
                    lineWidth: 1,
                    lineStyle: [10, 0]
                },
                displayLine: true,
                displayEquation: true,
                idCrossPlot: self.viCross.idCrossPlot
            });
            console.log("addRow", self.userDefineLines);
        };
        console.log("userDefineLines", this.userDefineLines);

        this.onEditLineStyleButtonClicked = function(index) {
            console.log("onEditLineStyleButtonClicked", self.userDefineLines);

            DialogUtils.lineStyleDialog(ModalService, wiComponentService,function (lineStyleObj){
                self.userDefineLines[index].lineStyle = lineStyleObj.lineStyle;
            }, self.userDefineLines[index]);
        };
        function setUDLines(callback) {
            if(self.userDefineLines && self.userDefineLines.length) {
                async.eachOfSeries(self.userDefineLines, function(udLine, idx, callback){
                    switch(self.userDefineLines[idx].change) {
                        case change.created:
                        wiApiService.createUserDefineLine(self.userDefineLines[idx], function(response){
                            self.userDefineLines[idx].idUserDefineLine = response.idUserDefineLine;
                            console.log("create UDL", response.idUserDefineLine);
                            callback();
                        });
                        break;
                        case change.updated:
                        wiApiService.editUserDefineLine(self.userDefineLines[idx], function(){
                            console.log("update UDL");
                            callback();
                        });
                        break;
                        case change.deleted:
                        wiApiService.removeUserDefineLine(self.userDefineLines[idx].idUserDefineLine, function(){
                            console.log("delete UDL");
                            callback();
                        });
                        break;
                        default:
                        callback();
                        break;
                    }
                }, function(err) {
                    for (let i = self.userDefineLines.length - 1; i >= 0; i--){
                        switch(self.userDefineLines[i].change) {
                            case change.created:
                            case change.updated:
                            self.userDefineLines[i].change = change.unchanged;
                            break;
                            case change.deleted:
                            self.userDefineLines.splice(i, 1);
                            break;
                        }
                    }
                    self.viCross.userDefineLines = self.userDefineLines;
                    viCrossplot.setProperties({ userDefineLines: self.userDefineLines });
                    viCrossplot.plotUserDefineLines();
                    if(callback) callback();
                });
            } else {
                self.viCross.userDefineLines = self.userDefineLines;
                viCrossplot.setProperties(self.viCross)
                viCrossplot.doPlot();
                if(callback) callback();
            }
        }
        this.onOkButtonClicked = function () {
            setUDLines(function(){
                close();
            })
        };
        this.onApplyButtonClicked = function() {
            setUDLines();
        };
        this.onCancelButtonClicked = function () {
            console.log("cancel", self.regressionLines);

            close(null);
        }
    }
    ModalService.showModal({
        templateUrl: "user-define-line-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (ret) {
            helper.removeBackdrop();
            if (ret && callback) callback(ret);
        });
    });
};