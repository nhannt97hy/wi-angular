let helper = require("./DialogHelper");
module.exports = function(ModalService, wiComponentService, wiD3CrossplotCtrl, callback) {
    function ModalController($scope, wiComponentService, wiApiService, close, $timeout) {
        let self = this;
        window.TNR = this;
        let DialogUtils = wiComponentService.getComponent(
            wiComponentService.DIALOG_UTILS
        );
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        this.onRefresh = function() {
            console.log('Ternary Dialog refresh');
            $scope.updating = false;
            let well = wiD3CrossplotCtrl.getWell();
            $scope.datasets = well.children.filter(function(node) {
                return node.type == "dataset";
            });
            $scope.result.selectedDataset = $scope.datasets.find(d => d.id == $scope.result.selectedDataset.id);
        };

        wiComponentService.on(wiComponentService.PROJECT_REFRESH_EVENT,self.onRefresh);

        let change = ($scope.change = {
            unchanged: 0,
            created: 1,
            updated: 2,
            deleted: 3,
            uncreated: 4
        });

        // $scope.selectDataSetting = {
        //     showCheckAll: false,
        //     showUncheckAll: false,
        //     displayProp: "id",
        //     checkBoxes: true
        // };
        this.idPolygonTest = [];
        let viCrossplot = wiD3CrossplotCtrl.getViCrossplot();
        let props = angular.copy(viCrossplot.getProperties());
        let ternary = (this.ternary = props.ternary);
        let well = wiD3CrossplotCtrl.getWell();
        $scope.datasets = well.children.filter(function(node) {
            return node.type == "dataset";
        });

        function prepareVertices(vertices) {
            self.vertices = vertices.map(function(vertex, index) {
                vertex.change = change.unchanged;
                vertex.index = index;

                vertex.x = +parseFloat(vertex.x).toFixed(4);
                vertex.y = +parseFloat(vertex.y).toFixed(4);

                return vertex;
            });
        }
        prepareVertices(ternary.vertices);

        this.modelData = [];
        this.optionsData = [1, 2, 3];
        let savedTernary = angular.copy(ternary);

        if (!this.vertices || !this.vertices.length) {
            this.__idx = null;
            $scope.selectedRow = null;
        } else {
            this.__idx = 0;
            $scope.selectedRow = 0;
        }
        let calculateOptions = ($scope.calculateOptions = ternary.calculate);
        $scope.result = ternary.result || {
            outputCurve: false,
            selectedDataset: $scope.datasets[0]
        };

        this.polygonList = new Array();
        props.polygons.forEach(function(polygonItem, index) {
            self.polygonList.push({
                idx: index + 1,
                value: polygonItem.idPolygon,
                bgColor: polygonItem.lineStyle
            });
        });

        this.getVertices = function() {
            return self.vertices.filter(function(item, index) {
                return (
                    item.change != change.deleted &&
                    item.change != change.uncreated
                );
            });
        };

        this.getTernaryVertices = function() {
            return self.getVertices().filter(function(item) {
                return item.used;
            });
        };

        this.setClickedRow = function(indexRow) {
            $scope.selectedRow = indexRow;
            self.__idx = self.getVertices()[indexRow].index;
        };

        this.onChange = function(index) {
            if (
                self.vertices[index] &&
                self.vertices[index].change == change.unchanged
            )
                self.vertices[index].change = change.updated;
        };

        this.removeRow = function(indexRow) {
            self.__idx = self.getVertices()[indexRow].index;
            if (!self.vertices[self.__idx]) return;
            if (self.vertices[self.__idx].change == change.created) {
                self.vertices[self.__idx].change = change.uncreated;
            } else {
                self.vertices[self.__idx].change = change.deleted;
            }
            if (self.getVertices().length) {
                self.setClickedRow(self.getVertices().length - 1);
            }
            viCrossplot.setProperties({
                ternary: { vertices: self.getVertices() }
            });
            viCrossplot.plotTernary();
        };

        this.addRow = function() {
            self.vertices.push({
                change: change.created,
                index: self.vertices.length,
                style: "Circle",
                showed: true,
                used: self.getTernaryVertices().length >= 3 ? false : true,
                name: "Material_" + (self.vertices.length + 1)
            });
            self.setClickedRow(self.getVertices().length - 1);
            $timeout(() => {
                let body = $('#ternaryBody');
                body.scrollTop(body[0].scrollHeight);
            });
        };

        this.pickVertex = function() {
            $("#ternary-modal").modal("hide");
            let idx = $scope.selectedRow;
            viCrossplot.setProperties({
                ternary: {
                    vertices: self.getVertices()
                }
            });
            wiD3CrossplotCtrl.pickVertex(idx, function(vertex) {
                $("#ternary-modal").modal("show");
                if(!vertex || typeof(vertex) == 'string') {
                    toastr.error(vertex || "Invalid point!");
                    viCrossplot.onMouseDown(
                        wiD3CrossplotCtrl.mouseDownCallback
                    );
                    return;
                }
                vertex = angular.copy(vertex);
                vertex.x = +parseFloat(vertex.x).toFixed(4);
                vertex.y = +parseFloat(vertex.y).toFixed(4);

                if (idx == null) {
                    vertex.name = "Material_" + (self.vertices.length + 1);
                    viCrossplot.plotTernary();
                    vertex.change = change.created;
                    vertex.index = self.vertices.length;
                    self.vertices.push(vertex);
                } else {
                    if (self.vertices[self.__idx].change == change.unchanged)
                        vertex.change = change.updated;
                    else vertex.change = change.created;
                    vertex.index = self.vertices[self.__idx].index;
                    self.vertices[self.__idx] = vertex;
                }
                $scope.$apply();
                viCrossplot.onMouseDown(
                    wiD3CrossplotCtrl.mouseDownCallback
                );
            });
        };

        this.pickPoint = function() {
            $("#ternary-modal").modal("hide");
            wiD3CrossplotCtrl.pickPoint(function(point) {
                $("#ternary-modal").modal("show");
                if (point) {
                    point = angular.copy(point);
                    point.x = +parseFloat(point.x).toFixed(4);
                    point.y = +parseFloat(point.y).toFixed(4);

                    calculateOptions.point = point;
                    $scope.$apply();
                }
                viCrossplot.onMouseDown(
                    wiD3CrossplotCtrl.mouseDownCallback
                );
            });
        };

        this.importVertices = function() {
        console.log("Import");
        if (self.ImportFile) {
            if (self.ImportFile.name.toLowerCase().includes(".csv")) {
                self.vertices.forEach(v => {
                    switch(v.change){
                        case change.created:
                        v.change = change.uncreated;
                        break;

                        case change.updated:
                        case change.unchanged:
                        v.change = change.deleted;
                        break;
                    }
                })
                let reader = new FileReader();
                reader.onload = function(event) {
                    let lines = this.result.split("\n");
                    for (let i = 1; i < lines.length; i++) {
                        let ele = lines[i]
                            .trim()
                            .split(",");
                        if (ele.length >= 6) $timeout(() => {
                                self.vertices.push({
                                    change: change.created,
                                    index: self.vertices.length,
                                    x: parseFloat(ele[0]),
                                    y: parseFloat(ele[1]),
                                    name: ele[2],
                                    style: ele[3],
                                    used: ele[4].toLowerCase() == 'true',
                                    showed: ele[5].toLowerCase() == 'true'
                                });
                            });
                    }
                };
                reader.readAsText(self.ImportFile);
            } else {
                toastr.error("Supported csv file(.csv) only!");
                delete self.ImportFile;
            }
        }
        };

        this.exportVertices = function() {
        console.log("Export Ternary!");
        if (self.getVertices().length) {
            let text = "X,Y,Name,Style,Used in ternary,Show/Hide\r\n";
            self.getVertices().forEach(point => {
                text = text + point.x + "," + point.y + "," + point.name + "," + point.style + "," + point.used + "," + point.showed + "\r\n";
            });
            let blob = new Blob([text], { type: "text/csv" });
            let a = document.createElement("a");
            let fileName = "ternary.csv";
            a.download = fileName;
            a.href = URL.createObjectURL(blob);
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            a.parentNode.removeChild(a);
        } else {
            toastr.error("Export error!");
        }
        };

        function setVertices(callback) {
            let usedVertices = self.getVertices().filter(function(d) {
                return (
                    d.used &&
                    d.x != null &&
                    d.y != null &&
                    !isNaN(d.x) &&
                    !isNaN(d.y)
                );
            });
            if (usedVertices.length > 3) {
                utils.error(
                    "There can not be more than 3 vertices used in ternary"
                );
                return;
            }

            async.eachOfSeries(
                self.vertices,
                function(vertex, idx, cb) {
                    vertex = self.vertices[idx];
                    let data = {
                        xValue: vertex.x,
                        yValue: vertex.y,
                        name: vertex.name,
                        style: vertex.style,
                        usedIn: vertex.used,
                        show: vertex.showed,
                        idTernary: vertex.idVertex,
                        idCrossPlot: props.idCrossPlot
                    };

                    switch (self.vertices[idx].change) {
                        case change.created:
                            wiApiService.createTernary(data, function(
                                response
                            ) {
                                self.vertices[idx].idVertex =
                                    response.idTernary;
                                cb();
                            });
                            break;
                        case change.updated:
                            wiApiService.editTernary(data, function(response) {
                                cb();
                            });
                            break;
                        case change.deleted:
                            wiApiService.removeTernary(
                                self.vertices[idx].idVertex,
                                function(response) {
                                    cb();
                                }
                            );
                            break;
                        default:
                            cb();
                    }
                },
                function() {
                    for (let i = self.vertices.length - 1; i >= 0; i--) {
                        if (
                            self.vertices[i].change == change.deleted ||
                            self.vertices[i].change == change.uncreated
                        ) {
                            self.vertices.splice(i, 1);
                        }
                    }
                    prepareVertices(self.vertices);
                    savedTernary.vertices = self.getVertices();
                    savedTernary.calculate = calculateOptions;
                    if (usedVertices.length < 3) $scope.result = {};
                    savedTernary.result = $scope.result;
                    viCrossplot.setProperties({ ternary: savedTernary });
                    viCrossplot.plotTernary();
                    savedTernary = angular.copy(savedTernary);
                    if (callback) callback();
                }
            );
        }

        function save(curves, curveNames) {
            let topDepth = parseFloat(well.properties.topDepth);
            let step = parseFloat(well.properties.step);

            $scope.updating = true;
            async.eachOf(
                curves,
                (curve, i, callback) => {
                    let dict = {};
                    curve.forEach(function(point) {
                        dict[Math.round((point.y - topDepth) / step)] = point.x;
                    });
                    let indices = Object.keys(dict).map(k => parseInt(k));
                    let maxIndex = Math.max.apply(null, indices);

                    let values = [];
                    for (let i = 0; i <= maxIndex; i++) {
                        values.push(dict[i] === undefined ? null : dict[i]);
                    }
                    let payload = {
                        data: values,
                        idDataset: $scope.result.selectedDataset.id
                    };

                    wiApiService.checkCurveExisted(
                        curveNames[i],
                        $scope.result.selectedDataset.id,
                        curve => {
                            if (curve.idCurve) {
                                payload.idDesCurve = curve.idCurve;
                            } else {
                                payload.curveName = curveNames[i];
                            }
                            wiApiService.processingDataCurve(payload, function( res, err ) {
                                if(!res.idCurve) {
                                    wiComponentService.emit(wiComponentService.MODIFIED_CURVE_DATA, {
                                        idCurve: payload.idDesCurve,
                                        data: payload.data
                                    })
                                }
                                callback();
                            });
                        }
                    );
                }, (err) => {
                    utils.refreshProjectState();
                }
            );
        }
        this.onSaveCurveButtonClicked = function() {
            if (
                !$scope.result.selectedDataset ||
                $scope.result.selectedDataset.id == null
            ) {
                toastr.error("No dataset selected");
                return;
            }

            let curves = $scope.result.curves;
            if (!curves || !curves.length) {
                toastr.error("No curves to save");
                return;
            }
            let curveNames = ($scope.result.curveNames || []).filter(function(
                n
            ) {
                return n; // n != null, n != ''
            });
            if (curveNames.length < 3) {
                toastr.error("Curve name can not be blank");
                return;
            }
            let unique = [...new Set(curveNames.map(c => c.toUpperCase()))];
            if(unique.length < 3){
                toastr.error("Curve names can not be equal");
                return;
            }
            let existed = 0;
            curveNames.forEach(name => {
                let curve = $scope.result.selectedDataset.children.find(
                    c => c.name.toUpperCase() == name.toUpperCase()
                );
                if (curve) existed++;
            });
            if (existed) {
                DialogUtils.confirmDialog(
                    ModalService,
                    "Save Curve",
                    "Overwrite?",
                    ret => {
                        if (ret) save(curves, curveNames);
                    }
                );
            } else {
                save(curves, curveNames);
            }
        };

        this.onCalculateButtonClicked = function() {
            let tmpTernary = {
                idTernary: savedTernary.idTernary,
                vertices: self.getVertices(),
                calculate: calculateOptions
            };
            viCrossplot.setProperties({ ternary: tmpTernary });
            let result = viCrossplot.calculateTernary();
            if (result.error) utils.error(result.error);
            else {
                result.materials = result.materials.map(function(m) {
                    return +parseFloat(m).toFixed(4);
                });
                $scope.result = Object.assign($scope.result, result);
                if (!$scope.result.curveNames) {
                    $scope.result.curveNames = [
                        "Material_1",
                        "Material_2",
                        "Material_3"
                    ];
                }
            }
        };

        this.onOkButtonClicked = function() {
            setVertices(function() {
                close(null);
                wiComponentService.removeEvent(wiComponentService.PROJECT_REFRESH_EVENT, self.onRefresh);
            });
        };
        this.onApplyButtonClicked = function(callback) {
            setVertices();
        };
        this.onCancelButtonClicked = function() {
            viCrossplot.setProperties({ ternary: savedTernary });
            viCrossplot.plotTernary();
            close(null);
            wiComponentService.removeEvent(wiComponentService.PROJECT_REFRESH_EVENT, self.onRefresh);
        };
    }

    ModalService.showModal({
        templateUrl: "ternary-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function(modal) {
        helper.initModal(modal);
        modal.close.then(function(ret) {
            helper.removeBackdrop();
            if (ret && callback) callback(ret);
        });
    });
};