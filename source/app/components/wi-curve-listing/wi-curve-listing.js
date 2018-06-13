const componentName = "wiCurveListing";
const moduleName = "wi-curve-listing";

function Controller( $scope, wiComponentService, wiApiService, ModalService, $timeout ) {
    let self = this;
    let dataContainer;
    let dataCtrl;
    let __dragging = false;

    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let DialogUtils = wiComponentService.getComponent(
        wiComponentService.DIALOG_UTILS
    );
    let selectedNodes = wiComponentService.getComponent(
        wiComponentService.SELECTED_NODES
    );
    function getMin(data){
        return d3.min(data);
    }
    function getMax(data){
        return d3.max(data);
    }
    function getMean(data){
        return d3.mean(data);
    }
    function getStandardDeviation(data){
        return d3.deviation(data);
    }
    function getQuantile(data, percent){
        return d3.quantile(data.sort((a,b) => a - b), percent/100);
    }
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
                appendTo: document.querySelector("wi-curve-listing #dragElement")
            });
        });
    }
    function getWellConfig(){
        self.wellConfig = self.SelectedWell.children
            .filter(c => c.type == "dataset")
            .map(d => {
                let tmp = angular.copy(d);
                tmp.data = Object.assign({}, {
                    childExpanded: true,
                    icon: d.data.icon,
                    label: d.data.label
                })
                tmp.children.forEach(curve => {
                    curve.data = Object.assign({}, {
                        icon: curve.data.icon,
                        label: curve.data.label,
                        familyName: curve.data.familyName,
                        unit: curve.data.unit
                    });
                })
                return tmp;
            });
    }
    function initData(){
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
                        let cModel = utils.getModel("curve", parseInt(idCurve));
                        let _header = cModel.properties.name;
                        let options = [];
                        utils.visit(self.SelectedWell, function(_node, _options){
                            if(_node.type == 'curve' && _node.data.label == _header){
                                _options.push(_node);
                                return false;
                            }
                        }, options)
                        if (options.length > 1) {
                            _header = cModel.properties.name + "(" + cModel.parent + ")";
                        }
                        if(curve) {
                            _header = '<i class="fa fa-asterisk unsaved" aria-hidden="true"></i><i>'+ _header + '</i>';
                        }
                        return _header;
                    }
                },
                rowHeaders: function(row) {
                    return '<div class="zone-square" style="background-color:'+ utils.colorGenerator()+'"></div>' + row;
                },
                rowHeaderWidth: 70,
                manualColumnResize: true,
                fixedColumnsLeft: 1,
                contextMenu: {
                    items: {
                        rm_col: {
                            name: "Remove column(s)",
                            callback: function() {
                                let selected = dataCtrl.getSelected();
                                let cols = new Set();
                                selected.forEach(sel => {
                                    let min = Math.min(sel[1], sel[3]);
                                    let max = Math.max(sel[1], sel[3]);
                                    let i = min;
                                    while(i <= max){
                                        cols.add(i);
                                        i++;
                                    }
                                })
                                let rm = Array.from(cols).sort((a, b) => b - a);
                                rm.forEach(idx => {
                                    idx != 0 && self.dataSettings[self.currentIndex].setting.columns.splice(idx, 1);
                                })
                                dataCtrl.updateSettings(
                                    self.dataSettings[self.currentIndex].setting
                                );
                            },
                            disabled: function() {
                                let selected = dataCtrl.getSelected();
                                if(!selected) return true;
                                return selected.every(sel => {
                                    if((sel[1] == 0 && sel[3] == 0)){
                                        return true;
                                    }
                                })
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
                // beforeCopy: function(data, coords){
                //     console.log(data, coords);
                // },
                copyPaste: {
                    columnsLimit: 1000,
                    rowsLimit: length
                },
                renderAllRows: false,
                // beforeChange: function(changes, source) {
                //     changes = changes.map(r => {
                //         r[3] = '' + parseFloat(r[3]);
                //         return r;
                //     })
                // },
                afterChange: function(change, source) {
                    if (source == "loadData") return;
                    if (change && change.length) {
                        change.forEach(c => {
                            if (c[2] != c[3])
                                self.dataSettings[self.currentIndex].curves[c[1]] = true;
                        });
                        dataCtrl.render();
                    }
                },
                search: true,
                headerTooltips: {
                    rows: false,
                    columns: true,
                    onlyTrimmed: true
                },
                formulas: true
            };

            _current.length = length;
            _current.topDepth = topDepth,
            _current.bottomDepth = bottomDepth,
            _current.step = step;
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
    function getStatisticData(){
        let _currentSetting = self.dataSettings[self.currentIndex];
        if(!_currentSetting) return [];
        return _currentSetting.setting.columns.reduce((total, col) => {
            let idCurve = col.data;
            if(idCurve != 'depth'){
                let cModel = utils.getModel("curve", parseInt(idCurve));
                let data = _currentSetting.setting.data.map(row => {
                    let tmp = parseFloat(row[idCurve]);
                    return isNaN(tmp) ? null : tmp;
                })
                total.push([
                    cModel.name,
                    cModel.properties.LineProperty ? cModel.properties.LineProperty.name : '',
                    cModel.properties.unit,
                    getMin(data),
                    getMax(data),
                    getMean(data),
                    getStandardDeviation(data),
                    _currentSetting.topDepth,
                    _currentSetting.bottomDepth,
                    _currentSetting.step,
                    data.filter(d => d == null).length,
                    new Date(cModel.properties.updatedAt).toDateString(),
                    '',
                    getQuantile(data, 5),
                    getQuantile(data, 10),
                    getQuantile(data, 25),
                    getQuantile(data, 50),
                    getQuantile(data, 75),
                    getQuantile(data, 90),
                    getQuantile(data, 95)
                ])
            }
            return total;
        }, [])
    }
    function initStatistic(){
        if (!self.statisticSettings) {
            self.statisticSettings = {
                // data: getStatisticData(),
                colHeaders: ["Name", "Family", "Unit", "Min value", "Max value", "Mean value", "Standard deviation", "Top", "Bottom", "Step", "Fraction of missing value", "Last modification date", "Description", "Quantile 5", "Quantile 10", "Quantile 25", "Quantile 50", "Quantile 75", "Quantile 90", "Quantile 95"],
                rowHeaders: true,
                manualColumnResize: true,
                fixedColumnsLeft: 1,
                renderAllRows: false,
                headerTooltips: {
                    rows: false,
                    columns: true,
                    onlyTrimmed: true
                },
                columns: function(col){
                    return {
                        readOnly: true
                    }
                }
            };
        }
        self.statisticSettings.data = getStatisticData();
        if (!dataCtrl) {
            dataCtrl = new Handsontable(
                dataContainer,
                self.statisticSettings
            );
        } else {
            dataCtrl.updateSettings(
                self.statisticSettings
            );
        }
    }
    function switchSetting(){
        if(self.visualizationMode == 'Data'){
            initData();
        }else{
            initStatistic();
        }
    }
    this.onChangeWell = function() {
        $scope.Filter = null;
        self.currentIndex = self.SelectedWell.id;
        getWellConfig();
        switchSetting();
        dataCtrl.render();
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
            // if(self.dataSettings[idWell]){
            //     let _current = self.dataSettings[idWell];
            //     for (const [key, value] of Object.entries(_current.curves)){
            //         if(value.idDataset == model.id){
            //             value.datasetName = model.name;
            //         }
            //     }
            // }
            if(idWell == self.currentIndex){
                getWellConfig();
                dataCtrl.render();
            }
            break;

            case 'curve':
            idWell = utils.findWellByCurve(model.id).id;
            // if(self.dataSettings[idWell]){
            //     let _current = self.dataSettings[idWell];
            //     if (_current.curves[model.id]) _current.curves[model.id].name = model.name;
            // }
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
                _current.curves[curve.idCurve] = false;
                _current.setting.data.forEach((r, i) => {
                    r[curve.idCurve] = curve.data[i] || NaN;
                })
            }
        }
    }
    this.keyEventandler = function(event) {
        if(self.visualizationMode == "Statistic") return;
        if (event.ctrlKey && event.keyCode == 71) {//Ctrl + g
            event.preventDefault();
            if(self.goToWidgetOpened) return;
            $timeout(()=> {
                self.findWidgetOpened = false;
                self.goToWidgetOpened = true;
            })
        }else if(event.ctrlKey && event.keyCode == 70){//Ctrl + f
            event.preventDefault();
            if(self.findWidgetOpened) return;
            $timeout(() => {
                self.goToWidgetOpened = false;
                self.findWidgetOpened = true;
            })
        }else if(event.keyCode == 27){//ESC
            $timeout(() => {
                self.goToWidgetOpened = false;
                self.findWidgetOpened = false;
            })
        }
    }
    this.goToRowEnter = function(){
        if(!self.goToRowInput) return;
        let ret = self.goToRowInput;
        if (ret < 0) {
            ret = Math.abs(ret);
        } else if (ret >=self.dataSettings[self.currentIndex].length) {
            ret = self.dataSettings[self.currentIndex].length - 1;
        }
        dataCtrl.selectRows(ret);
        dataCtrl.scrollViewportTo(ret);
        $timeout(() => {
            self.goToWidgetOpened = false;
        })
    }
    this.focusInput = function(dom){
        let searchFiled = $(dom)[0];
        searchFiled.focus();
        if(dom == '#find-widget-input'){
            Handsontable.dom.addEvent(searchFiled, 'keyup', function (event) {
                self.findResultCount = 0;
                var search = dataCtrl.getPlugin('search');
                var queryResult = search.query(this.value);

                console.log(queryResult);
                $timeout(()=> {
                    self.findResultCount = queryResult.length;
                })
                dataCtrl.render();
            });
        }
    }

    this.$onInit = function() {
        wiComponentService.putComponent("WCL", self);
        self.isShowPropPanel = false;
        self.goToWidgetOpened = false;
        self.findWidgetOpened = false;
        self.visualizationMode = "Data";
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
        document.addEventListener("keydown", self.keyEventandler);

        angular.element(document).ready(function() {
            dataContainer = document.getElementById("dataContainer");
            self.onChangeWell();
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
                        _current.curves[idCurve] = false;

                        _current.setting.data.forEach(
                            (r, i) =>
                                (r[idCurve] = '' + parseFloat((result[i] || {}).x))
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

    this.togglePropPanel = function() {
        self.isShowPropPanel = !self.isShowPropPanel;
    };
    this.toggleVisualizationMode = function(){
        if(self.visualizationMode == "Data"){
            self.visualizationMode = "Statistic";
        }else{
            self.visualizationMode = "Data";
        }
        dataCtrl.destroy();
        dataCtrl = undefined;
        switchSetting();
    }

    this.onAddCurveButtonClicked = function() {
        console.log("onAddCurveButtonClicked");
        DialogUtils.addCurveDialog(ModalService, self.SelectedWell);
    };
    this.onSaveButtonClicked = function() {
        console.log("onSaveButtonClicked");
        let modifiedCurves = [];
        let __curves = self.dataSettings[self.currentIndex].curves;
        for (let c in __curves) {
            if (__curves[c]) {
                let cModel = utils.getModel("curve", parseInt(c));
                let curve = {
                    name: cModel.properties.name,
                    datasetName: cModel.parent,
                    id: cModel.properties.idCurve,
                    idDataset: cModel.properties.idDataset
                }
                curve.data = self.dataSettings[self.currentIndex].setting.data.map(r => {
                    let tmp = parseFloat(r["" + curve.id]);
                    return isNaN(tmp) ? null : tmp;
                });
                modifiedCurves.push(curve);
            }
        }
        if (modifiedCurves.length) {
            DialogUtils.saveCurvesDialog(ModalService, modifiedCurves, function(
                savedCurves
            ) {
                toastr.success(savedCurves.length + "/" + modifiedCurves.length + " curves saved!");
                $timeout(function() {
                    savedCurves.forEach(curve => {
                        // check curve as saved
                        __curves[curve] = false;
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

    this.$onDestroy = function(){
        wiComponentService.removeEvent(wiComponentService.PROJECT_REFRESH_EVENT, self.onRefresh);
        wiComponentService.removeEvent(wiComponentService.RENAME_MODEL, self.onRename);
        wiComponentService.removeEvent(wiComponentService.MODIFIED_CURVE_DATA, self.onModifiedCurve);
        wiComponentService.removeEvent(wiComponentService.DELETE_MODEL, self.onDelete);
        document.removeEventListener('resize', self.resizeHandler);
        document.removeEventListener("keydown", self.keyEventandler);
    }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: "wi-curve-listing.html",
    controller: Controller,
    controllerAs: componentName
});

exports.name = moduleName;
