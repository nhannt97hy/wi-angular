const componentName = "wiCurveListing";
const moduleName = "wi-curve-listing";

function Controller( $scope, wiComponentService, wiApiService, ModalService, $timeout ) {
    let self = this;
    let dataContainer;
    let dataCtrl;
    let __dragging = false;
    let dialogOpened = false;

    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let DialogUtils = wiComponentService.getComponent(
        wiComponentService.DIALOG_UTILS
    );
    let selectedNodes = wiComponentService.getComponent(
        wiComponentService.SELECTED_NODES
    );
    function draggableSetting() {
        $timeout(function() {
            $(
                'wi-base-treeview#__listingtWellTree .wi-parent-node[type="curve"]'
            ).draggable({
                helper: function(event) {
                    return $(event.currentTarget).clone();
                },
                start: function(event, ui) {
                    __dragging = true;
                },
                stop: function(event, ui) {
                    __dragging = false;
                },
                containment: "document",
                appendTo: document.getElementById("dragElement")
            });
        });
    }
    function getWellConfig(){
        self.wellConfig = self.SelectedWell.children
            .filter(c => c.type == "dataset")
            .map(d => {
                let tmp = angular.copy(d);
                tmp.data.childExpanded = true;
                delete tmp.data.selected;
                return tmp;
            });
    }
    this.onChangeWell = function() {
        $scope.Filter = null;
        self.currentIndex = self.SelectedWell.id;
        getWellConfig();
        if (!self.dataSettings[self.currentIndex]) {
            self.dataSettings[self.currentIndex] = new Object();
            let _current = self.dataSettings[self.currentIndex];
            _current.curves = new Object();
            let step = self.SelectedWell.step;
            let topDepth = self.SelectedWell.topDepth;
            let bottomDepth = self.SelectedWell.bottomDepth;
            let length = Math.round((bottomDepth - topDepth) / step) + 1;
            _current.setting = {
                colHeaders: function(col){
                    switch (col){
                        case 0:
                        return 'Depth';

                        default:
                        let idCurve = self.dataSettings[self.currentIndex].setting.columns[col].data;
                        let curve = self.dataSettings[self.currentIndex].curves[idCurve];
                        let _header = curve.name;
                        let datasets = self.SelectedWell.children.filter(c => c.type == 'dataset');
                        if (datasets.length > 1) {
                            let cName = datasets.filter(d => {
                                return d.children.find(
                                    c => c.name == curve.name
                                );
                            });
                            if (cName.length > 1)
                                _header = curve.name + "(" + curve.datasetName + ")";
                        }
                        if(curve.modified) {
                            _header = '<i class="fa fa-exclamation" aria-hidden="true"></i>'+ _header;
                        }
                        return _header;
                    }
                },
                manualColumnResize: true,
                fixedColumnsLeft: 1,
                contextMenu: {
                    items: {
                        rm_col: {
                            name: "Remove column(s)",
                            callback: function() {
                                let selected = dataCtrl.getSelected()[0];
                                let idx = Math.min(selected[1], selected[3]);
                                let len =
                                    Math.abs(selected[1] - selected[3]) + 1;
                                self.dataSettings[self.currentIndex].setting.columns.splice(idx, len);
                                dataCtrl.updateSettings(
                                    self.dataSettings[self.currentIndex].setting
                                );
                            },
                            disabled: function() {
                                let selected = dataCtrl.getSelected();
                                return (selected[0][1] == 0 ||selected[0][3] == 0);
                            }
                        },
                        hsep1: "---------",
                        alignment: {},
                        hsep2: "---------",
                        undo: {},
                        redo: {},
                        hsep3: "---------",
                        copy: {},
                        cut: {}
                    }
                },
                columns: [
                    {
                        data: "depth",
                        readOnly: true
                    }
                ],
                beforeCopy: function(data, coords){
                    console.log(data, coords);
                },
                renderAllRows: false,
                afterChange: function(change, source) {
                    if (source == "loadData") return;
                    if (change && change.length) {
                        change.forEach(c => {
                            if (c[2] != c[3])
                                self.dataSettings[self.currentIndex].curves[c[1]].modified = true;
                        });
                        dataCtrl.render();
                    }
                }
            };

            _current.length = length;
            _current.setting.data = new Array(length)
                .fill()
                .map(d => new Object());
            for (let i = 0; i < length - 1; i++) {
                _current.setting.data[i]["depth"] = (
                    step * i +
                    topDepth
                ).toFixed(4);
            }
            _current.setting.data[length - 1]["depth"] = bottomDepth;
            _current.setting.rowHeaders = _current.setting.data.map((r,i) => i);
        }
        if (!dataCtrl) {
            dataCtrl = new Handsontable(
                dataContainer,
                self.dataSettings[self.currentIndex].setting
            );
        } else {
            dataCtrl.updateSettings(
                self.dataSettings[self.currentIndex].setting
            );
        }
    }
    this.onRefresh = function() {
        console.log('WCL refresh');
        $timeout(function() {
            self.wells = utils.findWells();
            self.SelectedWell = self.wells.find(w => {
                return w.id == self.SelectedWell.id;
            });
            if (!self.SelectedWell) {
                delete self.dataSettings[self.currentIndex];
                self.SelectedWell = self.wells[0];
            }
            self.onChangeWell();
        });
    }
    this.onRename = function(model){
        console.log(model);
        let idWell;
        switch(model.type){
            case 'dataset':
            idWell = model.properties.idWell;
            if(self.dataSettings[idWell]){
                let _current = self.dataSettings[idWell];
                for (const [key, value] of Object.entries(_current.curves)){
                    if(value.idDataset == model.id){
                        value.datasetName = model.name;
                    }
                }
            }
            if(idWell == self.currentIndex){
                getWellConfig();
                dataCtrl.render();
            }
            break;

            case 'curve':
            idWell = utils.findWellByCurve(model.id).id;
            if(self.dataSettings[idWell]){
                let _current = self.dataSettings[idWell];
                if (_current.curves[model.id]) _current.curves[model.id].name = model.name;
            }
            if(idWell == self.currentIndex){
                getWellConfig();
                dataCtrl.render();
            }
            break;

            default:
            break;
        }
    }

    this.resizeHandler = function(event){
        let model = event.model;
        if(model.type == 'WCL'){
            dataCtrl.render();
        }
    }

    this.onModifiedCurve = function(curve){
        if(curve.wcl) return;
        let idWell = utils.findWellByCurve(curve.idCurve).id;
        if(self.dataSettings[idWell]){
            let _current = self.dataSettings[idWell];
            if(_current.curves.hasOwnProperty(curve.idCurve)){
                console.log('WCL overwrite data curve');
                _current.curves[curve.idCurve].modified = false;
                _current.setting.data.forEach((r, i) => {
                    r[curve.idCurve] = curve.data[i] || NaN;
                })
            }
        }
    }

    this.$onInit = function() {
        wiComponentService.putComponent("WCL", self);
        self.isShowRefWin = false;
        self.wells = utils.findWells();
        self.dataSettings = new Object();
        if (selectedNodes && selectedNodes.length) {
            switch (selectedNodes[0].type) {
                case "well":
                    self.SelectedWell = selectedNodes[0];
                    break;

                case "dataset":
                    self.SelectedWell = utils.findWellById(
                        selectedNodes[0].properties.idWell
                    );
                    break;

                case "curve":
                    self.SelectedWell = utils.findWellByCurve(
                        selectedNodes[0].id
                    );
                    break;

                default:
                    self.SelectedWell =
                        self.wells && self.wells.length ? self.wells[0] : null;
            }
        } else {
            self.SelectedWell =
                self.wells && self.wells.length ? self.wells[0] : null;
        }
        wiComponentService.on(wiComponentService.PROJECT_REFRESH_EVENT,self.onRefresh)
        wiComponentService.on(wiComponentService.RENAME_MODEL, self.onRename)
        wiComponentService.on(wiComponentService.MODIFIED_CURVE_DATA, self.onModifiedCurve);
        wiComponentService.on(wiComponentService.DELETE_MODEL, self.onDelete);
        document.addEventListener('resize', self.resizeHandler);

        angular.element(document).ready(function() {
            dataContainer = document.getElementById("dataContainer");
            self.onChangeWell();
            document.addEventListener("keydown", function(event) {
                if (event.ctrlKey && event.keyCode == 71) {
                    event.preventDefault();
                    if(dialogOpened) return;
                    dialogOpened = true;
                    // open go to dialog
                    let promptConfig = {
                        title:
                            "Type index number between 0 and " +
                            (self.dataSettings[self.currentIndex].length - 1) +
                            " to navigate to",
                        inputName: "Go to Index",
                        type: "number"
                    };
                    DialogUtils.promptDialog(
                        ModalService,
                        promptConfig,
                        function(ret) {
                            dialogOpened = false;
                            if(!ret) return;
                            if (ret < 0) {
                                ret = Math.abs(ret);
                            } else if (
                                ret >=
                                self.dataSettings[self.currentIndex].length
                            ) {
                                ret =
                                    self.dataSettings[self.currentIndex].length - 1;
                            }
                            dataCtrl.selectRows(ret);
                            dataCtrl.scrollViewportTo(ret);
                        }
                    );
                }
            });
        });
    };
    this.droppableSetting = function() {
        $("#dataContainer").droppable({
            drop: function(event, ui) {
                if (!__dragging) return;
                // check modal draggable
                if (ui.draggable[0].className.includes("modal-content")) return;
                let idCurve = $(ui.draggable[0]).attr("data");
                let _current = self.dataSettings[self.currentIndex];
                let cModel = utils.getModel("curve", parseInt(idCurve));
                function addCol() {
                    let curveIdx = _current.setting.columns.findIndex(
                        c => c.data == idCurve
                    );
                    if (curveIdx < 0) {
                        // add column
                        _current.setting.columns.push({
                            data: idCurve,
                            type: "numeric",
                            numericFormat: {
                                pattern: "0,0.0000",
                                culture: "en-US"
                            }
                        });
                        dataCtrl.updateSettings(_current.setting);
                    }
                    dataCtrl.selectColumns(idCurve);
                    let selected = dataCtrl.getSelectedRange();
                    dataCtrl.scrollViewportTo(null, selected[0].from.col);
                    $("#dataContainer.active").toggleClass("active");
                }
                if (
                    !_current.curves ||
                    !_current.curves.hasOwnProperty(idCurve)
                ) {
                    // curveData == null => need pollute through api)
                    wiApiService.dataCurve(parseInt(idCurve), function(result) {
                        if (!result) return;
                        _current.curves[idCurve] = {
                            id: parseInt(idCurve),
                            name: cModel.name,
                            idDataset: cModel.properties.idDataset,
                            datasetName: cModel.parent,
                            modified: false
                        };

                        _current.setting.data.forEach(
                            (r, i) =>
                                (r[idCurve] = parseFloat((result[i] || {}).x))
                        );
                        addCol();
                    });
                } else {
                    addCol();
                }
            }
        });
    };

    this.onReady = function() {
        draggableSetting();
    };

    this.toggleRefWin = function() {
        self.isShowRefWin = !self.isShowRefWin;
    };

    this.onAddCurveButtonClicked = function() {
        console.log("onAddCurveButtonClicked");
        DialogUtils.addCurveDialog(ModalService, self.SelectedWell);
    };
    this.onSaveButtonClicked = function() {
        console.log("onSaveButtonClicked");
        let modifiedCurves = [];
        for (let c in self.dataSettings[self.currentIndex].curves) {
            let curve = angular.copy(
                self.dataSettings[self.currentIndex].curves[c]
            );
            if (curve.modified) {
                curve.data = self.dataSettings[self.currentIndex].setting.data.map(r => r["" + curve.id]);
                modifiedCurves.push(curve);
            }
        }
        if (modifiedCurves.length) {
            DialogUtils.saveCurvesDialog(ModalService, modifiedCurves, function(
                savedCurves
            ) {
                toastr.success("Save curve(s) successed!");
                $timeout(function() {
                    savedCurves.forEach(curve => {
                        // check curve as saved
                        self.dataSettings[self.currentIndex].curves[
                            curve
                        ].modified = false;
                    });
                    dataCtrl.render();
                });
            });
        } else {
            toastr.error(
                "There are no curve data was modified in current well!"
            );
        }
    };
    this.onDelete = function(model) {
        switch (model.type) {
            case "curve":
                let wellModel = utils.findWellByCurve(model.id);
                let idCurve = "" + model.id;
                let _current = self.dataSettings["" + wellModel.id];
                if (_current) {
                    if (_current.curves.hasOwnProperty(idCurve)) {
                        delete _current.curves[idCurve];
                    }
                    _current.setting.data.forEach(r => {
                        if (r.hasOwnProperty(idCurve)) delete r[idCurve];
                    });
                    let idx = _current.setting.columns.findIndex(
                        c => c.data == idCurve
                    );
                    if (idx) {
                        _current.setting.columns.splice(idx, 1);
                    }
                }
                break;

            case 'dataset':
            let idDataset = model.id;
            let current = self.dataSettings[model.properties.idWell];
            if(current){
                let hasCurve = [];
                for( const [key, value] of Object.entries(current.curves)){
                    if(value.idDataset == idDataset) {
                        hasCurve.push(value.id);
                    }
                }
                if(hasCurve.length){
                    hasCurve.forEach(curve => {
                        if(current.curves.hasOwnProperty(curve)) delete current.curves[curve];
                        current.setting.data.forEach( r => {
                            if(r.hasOwnProperty(curve)) delete r[curve];
                        })
                        let idx = current.setting.columns.findIndex(c => c.data == curve);
                        if(idx) current.setting.columns.splice(idx, 1);
                    })
                }
            }
            break;

            case "well":
            let idWell = "" + model.id;
            if (self.dataSettings.hasOwnProperty(idWell))
                delete self.dataSettings[idWell];
            break;

            default:
                break;
        }
    };
    this.onRefWinBtnClicked = function() {
        console.log("onRefWinBtnClicked");
    };

    this.$onDestroy = function(){
        wiComponentService.removeEvent(wiComponentService.PROJECT_REFRESH_EVENT, self.onRefresh);
        wiComponentService.removeEvent(wiComponentService.RENAME_MODEL, self.onRename);
        wiComponentService.removeEvent(wiComponentService.MODIFIED_CURVE_DATA, self.onModifiedCurve);
        wiComponentService.removeEvent(wiComponentService.DELETE_MODEL, self.onDelete);
        document.removeEventListener('resize', self.resizeHandler);
    }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: "wi-curve-listing.html",
    controller: Controller,
    controllerAs: componentName
});

exports.name = moduleName;
