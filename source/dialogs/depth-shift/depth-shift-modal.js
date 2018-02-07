let helper = require('./DialogHelper');
module.exports = function( ModalService, SelWell, ShiftCurve, callback ) {
    function ModalController(close, wiApiService, $timeout, wiComponentService) {
        let self = this;
        let applyingInProgress = false;
        window.depthS = this;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let DialogUtils = wiComponentService.getComponent(
        wiComponentService.DIALOG_UTILS );

        this.SelWell = SelWell;
        this.ShiftCurve = ShiftCurve;
        this.shiftMode = "1";
        (this.other = false), (this.ShowTrack = false), (this.ShowResult = false);
        this.suffix = "_ds";
        this.datasets = [];
        this.curves = [];
        this.shiftedTable = [];

        this.onWellChange = function() {
        self.datasets.length = 0;
        self.curves.length = 0;
        if (self.SelWell) {
            self.SelWell.children.forEach(function(child, i) {
            if (child.type == "dataset") self.datasets.push(child);
            if (i == self.SelWell.children.length - 1) {
                self.datasets.forEach(function(child) {
                child.children.forEach(function(item) {
                    if (item.type == "curve") {
                    let d = item;
                    d.flag = false;
                    self.curves.push(d);
                    }
                });
                });
            }
            });
            self.selectedDataset = self.datasets[0];
            self.RefCurve = self.curves[0];
        }
        };

        this.onWellChange();
        wiComponentService.on(wiComponentService.PROJECT_REFRESH_EVENT, function() {
            self.applyingInProgress = false;
            $timeout(function() {
                self.onWellChange();
            });
        });

        this.onChangeDepth = function(index, depth) {
            let point = self.shiftedTable[index];
            point.origin = point.origin >= self.SelWell.topDepth ? point.origin : self.SelWell.topDepth;
            if (depth) {
                point.change = point.shifted - point.origin;
            } else {
                point.shifted = point.origin + point.change;
            }
            point.shifted = point.shifted <= self.SelWell.bottomDepth ? point.shifted : self.SelWell.bottomDepth;
        };

        this.groupFn = function(item){
            return item.properties.dataset;
        }

        this.delete = function(index) {
            self.shiftedTable.splice(index, 1);
        };

        this.addShifted = function() {
            self.shiftedTable.push({
                name: "Shift point " + self.shiftedTable.length,
                origin: self.shiftedTable.length
                ? self.shiftedTable[self.shiftedTable.length - 1].shifted
                : self.SelWell.topDepth,
                shifted: self.shiftedTable.length
                ? self.shiftedTable[self.shiftedTable.length - 1].shifted
                : self.SelWell.topDepth,
                change: 0,
                id: Math.random()
            });
        };

        this.checked = false;
        this.select = function(curve) {
            curve.flag = !curve.flag;
        };
        this.checkAll = function() {
            self.checked = !self.checked;
            self.curves.forEach(function(curve) {
                curve.flag = self.checked;
            });
        };
        this.CurveF = function(curve) {
            return curve.id != self.ShiftCurve.idCurve;
        };

        function validate(callback) {
        if (self.shiftedTable && self.shiftedTable.length) {
            async.each(
            self.shiftedTable,
            (point, cb) => {
                point.flag = false;
                if ( point.origin < self.SelWell.topDepth || point.shifted > self.SelWell.bottomDepth ) {
                    point.flag = true;
                }
                let below = self.shiftedTable.find(
                    p => p.origin >= point.origin && p.id != point.id
                );
                if (below) {
                    if (point.origin == below.origin) point.flag = true;
                    if (
                        point.shifted + self.SelWell.step > below.shifted ||
                        point.origin + self.SelWell.step > below.origin
                    )
                        point.flag = true;
                }
                cb();
            },
            function(err) {
                let flag = self.shiftedTable.find(p => p.flag == true);
                callback(!flag);
            }
            );
        } else {
            callback(false);
        }
        }

        this.onImportButtonClicked = function() {
        console.log("Import");
        if (self.ImportFile) {
            self.shiftedTable.length = 0;
            if (self.ImportFile.type.match("text")) {
            let reader = new FileReader();
            reader.onload = function(event) {
                let lines = this.result.split("\n");
                if (lines[0].trim() == "Depth Shift File") {
                let line1 = lines[1].trim().split(",");
                if (line1.length == 1) {
                    let len = parseInt(line1[0]);
                    len = len <= lines.length - 2 ? len : lines.length - 2;
                    for (let i = 0; i < len; i++) {
                    let ele = lines[i + 2].trim().split(",");
                    if (ele.length >= 3)
                        $timeout(() => {
                            self.shiftedTable.push({
                                name: ele[0],
                                origin: parseFloat(ele[1]) || 0,
                                shifted: parseFloat(ele[2]) || 0,
                                change: parseFloat(ele[2]) - parseFloat(ele[1]) || 0,
                                id: Math.random()
                            });
                        })
                    }
                } else {
                    utils.error("Import error! Invalid Format!");
                }
                } else {
                utils.error("Import error! Not Depth Shifts File");
                }
            };
            reader.readAsText(self.ImportFile);
            } else {
            utils.error("Supported text file(.txt) only!");
            delete self.ImportFile;
            }
        }
        };

        this.onExportButtonClicked = function() {
        console.log("Export");
        if (self.shiftedTable.length) {
            let text = "Depth Shift File\r\n" + self.shiftedTable.length + "\r\n";
            self.shiftedTable.forEach(point => {
            text =
                text +
                point.name +
                "," +
                point.origin +
                "," +
                point.shifted +
                "\r\n";
            });
            let blob = new Blob([text], {
            type: "text"
            });
            let a = document.createElement("a");
            let fileName = "depth shift.txt";
            a.download = fileName;
            a.href = URL.createObjectURL(blob);
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            a.parentNode.removeChild(a);
        } else {
            utils.error("Export error!");
        }
        };

        function saveCurve(data) {
            let payload = {
                curveName: self.ShiftCurve.name + self.suffix,
                idDataset: self.selectedDataset.id,
                data: data,
                unit: self.ShiftCurve.unit
            };
            let curve = self.curves.find(
                c => c.name == payload.curveName && c.idDataset == payload.idDataset
            );
            if (curve) {
                payload.idDesCurve = curve.id;
                delete payload.curveName;
            } else {
                delete payload.idDesCurve;
            }

            wiApiService.processingDataCurve(payload, function(){
                utils.refreshProjectState();
            })
        }

        function toIndex(depth) {
        return Math.round((depth - self.SelWell.topDepth) / self.SelWell.step);
        }

        function run() {
        wiApiService.dataCurve(self.ShiftCurve.idCurve, function(dataCurve) {
            let data = dataCurve.map(d => {
            return { y: parseInt(d.y), x: parseFloat(d.x) };
            });
            let origin2d = [];
            let shift2d = [];
            async.sortBy(
            self.shiftedTable,
            function(point, cb) {
                cb(null, point.origin);
            },
            function(err, result) {
                for (let i = 0; i <= result.length; i++) {
                let start = function(type) {
                    return result[i - 1] ? toIndex(result[i - 1][type]) + 1 : 0;
                };
                let end = function(type) {
                    return result[i] ? toIndex(result[i][type]) + 1 : data.length;
                };
                let originArr = data.slice(start("origin"), end("origin"));
                let shiftedArr = data.slice(start("shifted"), end("shifted"));
                origin2d.push(originArr);
                shift2d.push(angular.copy(shiftedArr));
                }
                shift2d.forEach((array, idx) => {
                let origin = origin2d[idx];
                array[0].x = origin[0].x;
                array[array.length - 1].x = origin[origin.length - 1].x;
                for (let i = 1; i < array.length - 1; i++) {
                    let index = Math.round((i + 1) * origin.length / array.length);
                    array[i].x = origin[index - 1].x;
                }
                // console.log(array);
                });

                let out = [];
                shift2d.forEach(a => {
                out = out.concat(a);
                });
                console.log(out);
                saveCurve(out.map(d => parseFloat(d.x)));
            }
            );
        });
        }

        this.onApplyButtonClicked = function() {
        console.log("Apply");
        // validate(valid => {
        // 	if(valid){
        // 		run();
        // 	}else{
        // 		utils.error("Shift point(s) invalid!");
        // 	}
        // })
        };

        this.onRunButtonClicked = function() {
            if(self.applyingInProgress) return;
            self.applyingInProgress = true;
            console.log("Run");
            validate(valid => {
                if (valid) {
                    let curve = self.curves.find(c => c.name == ShiftCurve.name + self.suffix && c.properties.idDataset == self.selectedDataset.id);
                    if(curve){
                        DialogUtils.confirmDialog(ModalService, "Save Curve", "Overwrite Curve?", (ret) => {
                            if(ret){
                                run();
                            }else{
                                self.applyingInProgress = false;
                            }
                        })
                    }else{
                        run();
                    }
                } else {
                    utils.error("Shift point(s) invalid!");
                }
            });
        };

        this.onCancelButtonClicked = function() {
        close(null);
        };
    }

    ModalService.showModal({
        templateUrl: "depth-shift-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function(modal) {
        helper.initModal(modal);
        modal.close.then(function (data) {
            helper.removeBackdrop();
            if (data) {
                callback(data);
            }
        })
    });
};
