let helper = require('./DialogHelper');
module.exports = function (ModalService, wiD3Crossplot, callback){
    function ModalController($scope, wiComponentService, wiApiService, close) {
        let self = this;
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        // console.log("wiD3Crossplot", wiD3Crossplot);
        let change = {
            unchanged: 0,
            created: 1,
            updated: 2,
            deleted: 3
            // uncreated: 4
        }
        // let polygons = angular.copy(wiD3Crossplot.getPolygons());
        // this.polygonList = new Array();
        // polygons.forEach(function(polygonItem, index) {
        //     let pItem = {
        //         idPolygon: polygonItem.idPolygon,
        //         idx: index
        //     }
        //     self.polygonList.push(pItem);
        // });
        let polygons = angular.copy(wiD3Crossplot.getPolygons());
        this.polygonList = new Array();
        polygons.forEach(function(polygonItem, index) {
            self.polygonList.push({
                idx: index + 1,
                // value:polygonItem.idPolygon,
                value:polygonItem.idPolygon || index + 1,
                bgColor: polygonItem.lineStyle
            });
        });
        // console.log('polygonList',self.polygonList);

        // let viCrossplot = wiD3Crossplot.getViCrossplot();
        let viCrossplot = wiD3Crossplot.viWiXplot;
        this.regressionLines = [];
        this.viCross = viCrossplot.getProperties()
        // console.log("vi111", this.viCross, this.polygonList);
        let regressionLinesProps = this.viCross.regressionLines;

        regressionLinesProps.forEach(function(item, index) {
            let regLineItem = angular.copy(item);
            regLineItem.change = change.unchanged;
            regLineItem.index = index;
            regLineItem.polygons = item.polygons.map(p => {
                return p.idPolygon;
            })
            self.regressionLines.push(regLineItem);
        });

        $scope.change = change;
        // console.log("wiD3Crossplot", wiD3Crossplot, viCrossplot, self.regressionLines);
        this.getRegressionLines = function () {
            return self.regressionLines.filter(function (item, index) {
               return item.change != change.deleted;
           });
        }
        this.polygonsArr = new Array();
        // this.regressionLines.forEach(function(regLine, index){
        //     let pArr = [];
        //     console.log("reggg", regLine.polygons);
        //     self.polygonList.forEach(function(polygon) {
        //         for( let i = 0; i < regLine.polygons; i++){
        //             if( regLine.polygons[i] == polygon.idPolygon) pArr.push(polygon);
        //             console.log("pArr", pArr);
        //         }
        //     })
        //     self.polygonsArr.push(pArr);
        // });
        // this.setPolygonArr = function (index) {
        //     self.regressionLines[index].polygons = self.polygonsArr[index];
        // }
        // this.polygonsArr = [[{"idPolygon":5,"idx":0},{"idPolygon":6,"idx":1}]]
        console.log("TTTT", this.regressionLines);
        this.__idx = 0;
        $scope.selectedRow = 0;
        this.setClickedRow = function (indexRow) {
            $scope.selectedRow = indexRow;
            self.__idx = self.getRegressionLines()[indexRow].index;
        }
        this.onChange = function(index) {
            if(self.regressionLines[index].change == change.unchanged) self.regressionLines[index].change = change.updated;
        }
        // modal buttons
        this.removeRow = function (idx) {
            // if (!self.regressionLines[self.__idx]) return;
            if(self.regressionLines[idx].change == change.created) {
                self.regressionLines.splice(idx, 1);
            } else {
                self.regressionLines[idx].change = change.deleted;
            }
            if (self.getRegressionLines().length) {
                self.setClickedRow((idx - 1) || 0);
            }
        };
        // function genColor() {
        //     let rand = function () {
        //         return Math.floor(Math.random() * 255);
        //     }
        //     return "rgb(" + rand() + "," + rand() + "," + rand() + ")";
        // }

        this.addRow = function () {
            self.regressionLines.push({
                change: change.created,
                index: self.regressionLines.length,
                displayLine: true,
                displayEquation: true,
                regType: "Linear",
                lineStyle: {
                    lineColor: utils.colorGenerator(),
                    lineWidth: 1,
                    lineStyle: [10, 0]
                },
                exclude: true,
                polygons: []
                // idCrossPlot: self.viCross.idCrossPlot
            });
            console.log("addRow", self.regressionLines);
        };
        // console.log("regressionLines", this.regressionLines);
        this.onselectedPolygonsChange = function(){
            if(self.selectedCurveX) self.pointSet.idCurveX = self.selectedCurveX;
        }
        this.onEditLineStyleButtonClicked = function(index) {
            console.log("onEditLineStyleButtonClicked", self.regressionLines);

            DialogUtils.lineStyleDialog(ModalService, wiComponentService,function (lineStyleObj){
                self.regressionLines[index].lineStyle = lineStyleObj.lineStyle;
            }, self.regressionLines[index]);
        };
        function setRegressionLines(callback) {
            if(self.regressionLines && self.regressionLines.length) {
                async.eachOfSeries(self.regressionLines, function(regLine, idx, callback){
                    // let pArr = [];
                    // regLine.polygons.forEach(function(p, index){
                    //     console.log("ppp", p);
                    //     pArr.push(p.idPolygon);
                    // });
                    // regLine.polygons = pArr;
                    // console.log("regLine", regLine, self.polygonList);
                    switch(regLine.change) {
                        case change.created:
                        // wiApiService.createRegressionLines(regLine, function(res){
                        //     console.log("create", res, regLine);
                        //     regLine.idRegressionLine = res.idRegressionLine;
                            callback();
                        // });
                        break;
                        case change.updated:
                        // wiApiService.editRegressionLines(regLine, function(res){
                        //     console.log("update", res, regLine);
                            callback();
                        // });
                        break;
                        case change.deleted:
                        // wiApiService.removeRegressionLines(regLine.idRegressionLine, function(res){
                        //     console.log("delete", res);
                            callback();
                        // });
                        break;
                        default:
                        callback();
                        break;
                    }
                }, function(err) {
                    for (let i = self.regressionLines.length - 1; i >= 0; i--){
                        switch(self.regressionLines[i].change) {
                            case change.created:
                            case change.updated:
                            self.regressionLines[i].change = change.unchanged;
                            break;
                            case change.deleted:
                            self.regressionLines.splice(i, 1);
                            break;
                        }
                    }
                    self.viCross.regressionLines = self.regressionLines;
                    // viCrossplot.setProperties({ regressionLines: self.regressionLines });
                    viCrossplot.plotRegressionLines();
                    if(callback) callback();
                });
            } else {
                self.viCross.regressionLines = self.regressionLines;
                // viCrossplot.setProperties(self.viCross)
                viCrossplot.doPlot();
                if(callback) callback();
            }
        }
        this.onOkButtonClicked = function () {
            setRegressionLines(function() {
                // self.viCross.regressionLines = self.regressionLines;
                // viCrossplot.setProperties(self.viCross);
                // viCrossplot.doPlot();
                close();
            });
        };
        this.onApplyButtonClicked = function() {
            setRegressionLines(function() {
                console.log("okii", self.viCross);
                // self.viCross.regressionLines = self.regressionLines;
                // viCrossplot.setProperties(self.viCross);
                // viCrossplot.doPlot();
            });
        };
        this.onCancelButtonClicked = function () {
            console.log("cancel", self.regressionLines);

            close(null);
        }
    }
    ModalService.showModal({
        templateUrl: "regression-line-modal.html",
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