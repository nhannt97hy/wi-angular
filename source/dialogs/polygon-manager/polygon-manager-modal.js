let helper = require('./DialogHelper');
module.exports = function (ModalService, wiD3Crossplot, callback){
    function ModalController($scope, wiComponentService, wiApiService, close) {
        let self = this;
        let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);

        let change = {
            unchanged: 0,
            created: 1,
            updated: 2,
            deleted: 3,
            uncreated: 4,
        }
        $scope.change = change;
        function init() {
            self.polygons = new Array();
            angular.copy(wiD3Crossplot.getPolygons()).forEach(function (polygonItem, index) {
                polygonItem.points = JSON.stringify(polygonItem.points);
                polygonItem.change = change.unchanged;
                polygonItem.index = index;
                self.polygons.push(polygonItem);
            });
        }
        init();
        this.getPolygons = function () {
            return self.polygons.filter(function (item, index) {
               return (item.change != change.deleted && item.change != change.uncreated);
           });
        }
        this.__idx = 0;
        $scope.selectedRow = 0;
        this.setClickedRow = function (indexRow) {
            $scope.selectedRow = indexRow;
            self.__idx = self.getPolygons()[indexRow].index;
        }
        this.onChange = function(index) {
            if(self.polygons[index].change == change.unchanged) self.polygons[index].change = change.updated;
        }
        // modal buttons
        this.removeRow = function () {
            if (!self.polygons[self.__idx]) return;
            if(self.polygons[self.__idx].change == change.created) {
                self.polygons[self.__idx].change = change.uncreated;
            } else {
                self.polygons[self.__idx].change = change.deleted;
            }
            if (self.getPolygons().length) {
                self.setClickedRow(0);
            }
        };
        this.addRow = function () {
            // self.polygonsCreated.push({index: self.polygonsCreated.length});
            self.polygons.push({
                change: change.created,
                index: self.polygons.length,
                display: true
            });
        };
        this.drawPolygon = function (index) {
            $('#polygon-modal').modal('hide');
            wiD3Crossplot.drawPolygon(self.polygons[index].idPolygon, function (drawingPolygon) {
                $('#polygon-modal').modal('show');
                if (self.polygons[index].change == change.unchanged) {
                    self.polygons[index].change = change.updated;
                }
                if (drawingPolygon) {
                    self.polygons[index].lineStyle = drawingPolygon.lineStyle;
                    self.polygons[index].points = JSON.stringify(drawingPolygon.points);
                }
            });
        }
        this.polygonLineColor = function (index) {
            dialogUtils.colorPickerDialog(ModalService, self.polygons[index].lineStyle, function (colorStr) {
                self.polygons[index].lineStyle = colorStr;
            });
        }
        function sendPolygonsAPIs() {
            // const idCrossPlot = wiD3Crossplot.wiCrossplotCtrl.id;
            async.eachOf(self.polygons, function(polygon, idx, callback) {
                if (polygon.change == change.created && polygon.points) {
                    polygon.points = JSON.parse(polygon.points);
                    // polygon.idCrossPlot = idCrossPlot;
                    polygon.change = change.unchanged;
                    // wiApiService.createPolygon(polygon, function(ret) {
                    //     polygon.idPolygon = ret.idPolygon;
                        callback();
                    // });
                }
                else if (polygon.change == change.updated && polygon.points) {
                    polygon.points = JSON.parse(polygon.points);
                    // polygon.idCrossPlot = idCrossPlot;
                    polygon.change = change.unchanged;
                    // wiApiService.editPolygon(polygon, callback);
                }
                else if (polygon.change == change.deleted) {
                    // polygon.idCrossPlot = idCrossPlot;
                    polygon.change = change.deleted;
                    // wiApiService.removePolygon(polygon.idPolygon, callback);
                }
                else if (polygon.change == change.unchanged && polygon.points) {
                    polygon.points = JSON.parse(polygon.points);
                    async.setImmediate(callback);
                }
                else {
                    async.setImmediate(callback);
                }

            }, function(err){
                wiD3Crossplot.initPolygons(self.polygons.filter(p => {return p.change == change.unchanged && p.points}));
                init();
            });

        }
        this.onOkButtonClicked = function () {
            sendPolygonsAPIs();
            close(null);
        };
        this.onApplyButtonClicked = function() {
            sendPolygonsAPIs();
        };
        this.onCancelButtonClicked = function () {
            close(null);
        }
    }
    ModalService.showModal({
        templateUrl: "polygon-manager-modal.html",
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