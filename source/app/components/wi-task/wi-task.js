const name = "wiTask";
const moduleName = "wi-task";

function Controller(wiComponentService, wiApiService, $timeout, ModalService, wiPetrophysics, $scope) {
    const self = this;
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    const layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
    const DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let __selectionTop = 0;
    const __selectionLength = 50;
    const __selectionDelta = 10;
    let __dragging = false;
    let __familyList;
    let list;
    self.filterText = "";
    self.filterText1 = "";
    const CURVE_SELECTION = "1";
    const FAMILY_SELECTION = "2";
    const FAMILY_GROUP_SELECTION = "3";
    const TASK_SELECTION = "4";
    self.CURVE_SELECTION = CURVE_SELECTION;
    self.FAMILY_SELECTION = FAMILY_SELECTION;
    self.FAMILY_GROUP_SELECTION = FAMILY_GROUP_SELECTION;
    self.TASK_SELECTION = TASK_SELECTION;
    let inputDataTable;
    let dataCtrl;

    this.$onInit = function () {
        wiComponentService.putComponent("wiTask" + self.id, self);
        self.taskConfig.inputData = new Array();
        self.taskConfig.paramData = new Array();
        self.visualizationMode = "Inputs";
        // CONFIGURE INPUT TAB
        self.selectionType = "3";
        wiApiService.listFamily(listF => {
            // console.log(listF);
            list = listF;
            onSelectionTypeChanged();
        });

        //TreeName
        let name = 'wiTask' + self.id;
        self.SelectionTreeName = name + 'SelectionTree';
        self.projectTreeName = name + 'projectTree';
        self.zonationTreeName = name + 'zonationTree';
        self.taskTreeName = name + 'taskTree';
        self.taskDataTreeName = name + 'taskDataTable';

        self.idxTab = 0;

        // SELECT INPUT TAB
        self.idProject = self.getCurrentProjectId();
        self.isFrozen = !!self.idProject;
        self.projectConfig = new Array();
        self.zone_set_list = new Array();
    };
    this.getCurrentProjectId = function() {
        if (self.idProject) return self.idProject;
        const openProject = wiComponentService.getComponent(
            wiComponentService.PROJECT_LOADED
        );
        return (openProject || {}).idProject;
    };
    this.onShowTab = function(idx){
        self.idxTab = idx;
    }

    this.onClick = function($index, $event, node) {
        self.selectionList.forEach(item => {
            item.data.selected = false;
        });
        node.data.selected = true;
    };
    function getFamilyList(callback) {
        if (!self.filterText) {
            if (!__familyList) {
                let temp = utils.getListFamily();
                if (temp) {
                    __familyList = temp.map(function (family) {
                        return {
                            id: family.idFamily,
                            data: {
                                label: family.name,
                                icon: "user-define-16x16",
                                selected: false
                            },
                            children: [],
                            properties: family
                        };
                    });
                    callback(__familyList);
                }
                else {
                    wiApiService.listFamily(function (lstFamily) {
                        __familyList = lstFamily.map(function (family) {
                            return {
                                id: family.idFamily,
                                data: {
                                    label: family.name,
                                    icon: "user-define-16x16",
                                    selected: false
                                },
                                children: [],
                                properties: family
                            };
                        });
                        callback(__familyList);
                    });
                }
            }
            else callback(__familyList);
        } else {
            if (!__familyList) {
                let temp = utils.getListFamily();
                if (temp) {
                    __familyList = temp.map(function (family) {
                        return {
                            id: family.idFamily,
                            data: {
                                label: family.name,
                                icon: "user-define-16x16",
                                selected: false
                            },
                            children: [],
                            properties: family
                        };
                    });
                    callback(__familyList.filter(item =>
                        item.data.label
                            .toLowerCase()
                            .includes(self.filterText.toLowerCase())
                    ));
                }
                else {
                    wiApiService.listFamily(function (lstFamily) {
                        __familyList = lstFamily.map(function (family) {
                            return {
                                id: family.idFamily,
                                data: {
                                    label: family.name,
                                    icon: "user-define-16x16",
                                    selected: false
                                },
                                children: [],
                                properties: family
                            };
                        });
                        callback(__familyList.filter(item =>
                            item.data.label
                                .toLowerCase()
                                .includes(self.filterText.toLowerCase())
                        ));
                    });
                }
            }
            else {
                callback(__familyList.filter(item =>
                    item.data.label
                        .toLowerCase()
                        .includes(self.filterText.toLowerCase())
                ));
            }
        }
    }

    this.onSelectionTypeChanged = onSelectionTypeChanged;

    function onSelectionTypeChanged(selType) {
        self.filterText1 = "";
        self.filterText = "";
        self.selectionType = selType || self.selectionType;
        switch (self.selectionType) {
            case TASK_SELECTION:
                if (!self.wiFlowDesigner) break;
                self.selectionList = self.wiFlowDesigner.getPreviousTasks(self.id).map(e => ({
                    id: e.businessObject.get('idTask'),
                    data: {
                        label: e.businessObject.get('name'),
                        icon: "workflow-16x16",
                        selected: false
                    },
                    children: [],
                    properties: {}
                }));
                break;
            case FAMILY_GROUP_SELECTION:
                let temp = utils.getListFamily();
                if (!temp) temp = list;
                const groups = new Set();
                temp.forEach(t => {
                    groups.add(t.familyGroup);
                });
                self.selectionList = Array.from(groups).map(g => ({
                    id: -1,
                    data: {
                        label: g,
                        icon: "zone-table-16x16",
                        selected: false
                    },
                    children: [],
                    properties: {}
                }));
                break;
            case FAMILY_SELECTION:
                getFamilyList(function (familyList) {
                    $timeout(function () {
                        self.selectionList = familyList.slice(0, __selectionLength);
                    });
                    __selectionTop = 0;
                });
                break;
            case CURVE_SELECTION:
            let hash = new Object();
            let wiExplr = wiComponentService.getComponent(wiComponentService.WI_EXPLORER);
            let root = null;
            if (wiExplr) root = wiExplr.treeConfig[0];
            if (root) {
                utils.visit(
                    root,
                    function (node, _hash) {
                        if (node.type == "curve") {
                            _hash[node.data.label] = 1;
                        }
                        return false;
                    },
                    hash
                );
                $timeout(() => self.selectionList = Object.keys(hash).map(function (key) {
                    return {
                        id: -1,
                        data: {
                            label: key,
                            icon: "curve-16x16",
                            selected: false
                        },
                        children: [],
                        properties: {}
                    };
                }));
            }
            else {
                buildCurveListFromServer(function (curve) {
                    hash[curve.name] = 1;
                }, function () {
                    $timeout(() => self.selectionList = Object.keys(hash).map(function (key) {
                        return {
                            id: -1,
                            data: {
                                label: key,
                                icon: "curve-16x16",
                                selected: false
                            },
                            children: [],
                            properties: {}
                        };
                    }));
                });
            }
                break;
            default:
                break;
        }
    }
    function buildCurveListFromServer(cb, done) {
        if (!self.idProject) {
            toastr.error("No project exists");
            return;
        }
        wiApiService.listWells({
            idProject: self.idProject,
            limit: 100000
        }, function (wells) {
            if (!Array.isArray(wells)) {
                toastr.error('Error in listing wells');
                console.error(wells);
                return;
            }
            async.each(wells, function (well, __end) {
                wiApiService.getWell(well.idWell, function (wellProps) {
                    for (let dataset of wellProps.datasets) {
                        for (let curve of dataset.curves) {
                            cb(curve);
                        }
                    }
                    __end();
                })
            }, function (err) {
                done();
            });
        });
    }
    this.onSelectTemplate = function(idx) {
        const __SELECTED_NODE = self.selectionList.find(d => d.data.selected);
        if (__SELECTED_NODE) {
            const item = self.taskConfig.inputs[idx];
            item.label = __SELECTED_NODE.data.label;
            item.value =
                __SELECTED_NODE.id > 0 ? __SELECTED_NODE.id : item.label;
            item.type = self.selectionType;
        } else {
            toastr.error("please select data type!");
        }
    };

    this.onDeleteInput = function(idx) {
        self.taskConfig.inputData.splice(idx, 1);
    };
    this.upTrigger = function(cb) {
        if (self.selectionType == FAMILY_SELECTION) {
            if (__selectionTop > 0) {
                if (__selectionTop > __selectionDelta) {
                    getFamilyList(function (familyList) {
                        let newItems = familyList
                            .slice(
                                __selectionTop - __selectionDelta,
                                __selectionTop
                            )
                            .reverse();
                        __selectionTop = __selectionTop - __selectionDelta;
                        cb(newItems, self.selectionList);

                    });
                } else {
                    getFamilyList(function (familyList) {
                        let newItems = familyList
                            .slice(0, __selectionTop)
                            .reverse();
                        __selectionTop = 0;
                        cb(newItems, self.selectionList);
                    });
                }
            } else cb([]);
        } else cb([]);
    };
    this.downTrigger = function(cb) {
        if (self.selectionType == FAMILY_SELECTION) {
            getFamilyList(function (familyList) {
                let __selectionBottom = __selectionTop + __selectionLength;
                if (__selectionBottom < familyList.length) {
                    if (familyList.length - __selectionBottom > __selectionDelta) {
                        let newItems = familyList.slice(
                            __selectionBottom + 1,
                            __selectionDelta + __selectionBottom + 1
                        );
                        __selectionTop = __selectionTop + __selectionDelta;
                        cb(newItems, self.selectionList);
                    } else {
                        let newItems = familyList.slice(
                            __selectionBottom + 1,
                            familyList.length
                        );
                        __selectionTop =
                            __selectionTop +
                            (familyList.length - __selectionBottom);
                        cb(newItems, self.selectionList);
                    }
                } else cb([]);
            });
        } else cb([]);
    };
    this.onFilterEnterKey = function(filterText) {
        self.filterText = filterText;
        if (self.selectionType == FAMILY_SELECTION) {
            __selectionTop = 0;
            $timeout(function () {
                getFamilyList(function (familyList) {
                    self.selectionList = familyList.slice(0, __selectionLength);
                });
            });
        }
    };

    // SELECT INPUT TAB
    function buildZoneSetListFromServer(wells) {
        async.each(wells, function (well, __end) {
            wiApiService.getWell(well.idWell, function (wellProps) {
                const wellModel = utils.createWellModel(well);
                wellModel.ts = Date.now();
                for (let zoneset of wellProps.zone_sets) {
                    self.zone_set_list.push(zoneset);
                }
                if (wellProps.datasets && wellProps.datasets.length) {
                    wellModel.children.length = 0;
                    wellProps.datasets.forEach(dataset => {
                        const datasetModel = utils.createDatasetModel(
                            dataset
                        );
                        wellModel.children.push(datasetModel);
                        dataset.curves &&
                            dataset.curves.length &&
                            dataset.curves.forEach(curve => {
                                datasetModel.children.push(
                                    utils.createCurveModel(curve)
                                );
                            });
                    });
                }
                self.projectConfig.push(wellModel);
                __end();
            })
        }, function (err) {
            let hash = new Object();
            self.zone_set_list.forEach(zone => hash[zone.name] = 1);
            let zoneChild = function(zonesets){
                let zoneArr = zonesets.reduce((total, curVal) => total.concat(curVal.zones.map(z => z.zone_template.name)), []);
                return Array.from(new Set(zoneArr)).map((item, idx) => {
                    return {
                        id: idx,
                        data: {
                            label: item,
                            icon: "zone-table-16x16",
                            selected: false,
                        },
                        type: 'zone'
                    }
                })
            }
            self.zonationConfig = Object.keys(hash).map((key, idx) => {
                let zonesetArr = self.zone_set_list.filter(zs => zs.name == key);
                return {
                    id: idx,
                    data: {
                        label: key,
                        selected: false,
                        icon: 'project-16x16-edit'
                    },
                    children: zoneChild(zonesetArr),
                    type: 'zoneset'
                }
            })
        });
    }

    this.refreshProject = function () {
        if (!isNaN(self.idProject) && self.idProject > 0) {
            self.projectChanged({ idProject: self.idProject });
        }
    }
    this.getProjectList = function(wiItemDropdownCtrl) {
        if (!self.idProject) {
            wiApiService.getProjectList(null, projectList => {
                console.log(projectList);
                wiItemDropdownCtrl.items = projectList.map(prj => ({
                    data: {
                        label: prj.name
                    },
                    properties: prj
                }));
            });
        } else {
            wiApiService.getProjectInfo(self.idProject, projectProps => {
                self.projectName = projectProps.name;
                self.projectChanged({ idProject: projectProps.idProject });
            });
        }
    };

    this.projectChanged = function(projectProps) {
        const __idProject = projectProps.idProject;
        if (__idProject > 0) {
            wiApiService.listWells(
                {
                    idProject: __idProject,
                    match:
                        self.prjFilter && self.prjFilter.length
                            ? self.prjFilter
                            : undefined
                },
                wells => {
                    self.projectConfig.length = 0;
                    self.zone_set_list.length = 0;
                    buildZoneSetListFromServer(wells);
                }
            );
        }
    };
    function draggableSetting(domEle) {
        $timeout(() => {
            domEle.draggable({
                helper: "clone",
                scope: 'wi-task',
                containment: "document",
                appendTo: $('wi-task').filter('#' + self.id).find('#dragElement')
            });
        }, 500);
    }
    this.onPrjReady = function(){
        let domEle = $( '#' + self.projectTreeName + ' .wi-parent-node[type="dataset"]');
        draggableSetting(domEle);
    }
    this.onZoneReady = function(){
        let domEle = $('#' + self.zonationTreeName + ' .wi-parent-node[type="zoneset"]');
        draggableSetting(domEle);
    }
    function matchCurves(curves, matchCriterion) {
        let ret = [];
        switch (matchCriterion.type) {
            case FAMILY_GROUP_SELECTION:
                const familyList = utils.getListFamily();
                ret = curves.filter(cModel => {
                    if (familyList) {
                        const group = familyList.find(f => {
                            if (cModel.properties) {
                                return f.idFamily == cModel.properties.idFamily;
                            }
                            return f.idFamily == cModel.idFamily;
                        });
                        return group
                            ? matchCriterion.value == group.familyGroup
                            : false;
                    }
                });
                break;
            case FAMILY_SELECTION:
                ret = curves.filter(cModel => {
                    if (cModel.properties) {
                        return (
                            matchCriterion.value == cModel.properties.idFamily
                        );
                    }
                    return matchCriterion.value == cModel.idFamily || matchCriterion.name == cModel.family;
                });
                break;
            case CURVE_SELECTION:
                ret = curves.filter(cModel => {
                    if (cModel.properties) {
                        return matchCriterion.value == cModel.properties.name;
                    }
                    return matchCriterion.value == cModel.name;
                });
                break;
        }
        if(ret.length) return Array.from(new Set(ret.map(c => c.name)));
        return [];
    }
    function property(attr){
        switch(attr){
            case "Use":
            if(self.visualizationMode == "Inputs"){
                return {
                    data: 'use',
                    type: "dropdown",
                    source: ['Yes', "No"]
                }
            }else {
                return {
                    data: "used"
                }
            }
            case "Well":
            return {
                data: 'wellProps.name',
                readOnly: true
            };
            case "Dataset":
            return {
                data: 'dataset',
                readOnly: true
            };
            default:
            if(self.visualizationMode == "Inputs"){
                let idx = self.taskConfig.inputs.findIndex(i => i.name == attr);
                let colData = {
                    data: 'inputs.' + idx + '.value'
                };
                return colData;
            }else{
                let idx = self.taskConfig.parameters.findIndex(i => i.name == attr);
                let colData = {
                    data: 'inputs.' + idx + '.value',
                    type: 'numeric'
                };
                if(self.taskConfig.parameters[idx].choices) {
                    colData.type = 'dropdown';
                }
                return colData;
            }
        }
    }
    function initInputs(){
        if (!self.inputSettings) {
            let header = ["Use", "Well", "Dataset"].concat(self.taskConfig.inputs.map(i => i.name));
            self.inputSettings = {
                data: self.taskConfig.inputData || [],
                colHeaders: header,
                rowHeaders: true,
                manualColumnResize: true,
                fixedColumnsLeft: 2,
                contextMenu: {
                    items: {
                        rm_col: {
                            name: "Remove row(s)",
                            callback: function() {
                                let selected = dataCtrl.getSelected();
                                let cols = new Set();
                                selected.forEach(sel => {
                                    let min = Math.min(sel[0], sel[2]);
                                    let max = Math.max(sel[0], sel[2]);
                                    let i = min;
                                    while(i <= max){
                                        cols.add(i);
                                        i++;
                                    }
                                })
                                let rm = Array.from(cols).sort((a, b) => b - a);
                                rm.forEach(idx => {
                                    self.taskConfig.inputData.splice(idx, 1);
                                })
                                dataCtrl.updateSettings(
                                    {data: self.taskConfig.inputData}
                                );
                            },
                            disabled: function(){
                                let selected = dataCtrl.getSelected();
                                if(!selected) return true;
                                return false;
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
                columns: header.map(h => property(h)),
                cells: function(row, col, prop){
                    let cellProperties = this;
                    if(col > 1){
                        let r = self.taskConfig.inputData[row] || {};
                        let inputs = r.inputs || [];
                        let src = (inputs[col - 3] || {}).choices;
                        if(src){
                            cellProperties.source = src;
                            cellProperties.type = 'dropdown';
                        }

                    }
                    return cellProperties;
                },
                copyPaste: {
                    columnsLimit: 1000,
                    rowsLimit: 1000
                },
                renderAllRows: false,
                headerTooltips: {
                    rows: false,
                    columns: true,
                    onlyTrimmed: true
                },
                dropdownMenu: ['filter_by_condition', 'filter_operators', 'filter_by_condition2','filter_by_value', 'filter_action_bar'],
                filters: true,
                columnSorting: true,
                sortIndicator: true
            };
        }
        // self.inputSettings.data = self.taskConfig.inputData || [];
        if (!dataCtrl) {
            dataCtrl = new Handsontable(
                inputDataTable,
                self.inputSettings
            );
        } else {
            dataCtrl.updateSettings(
                self.inputSettings
            );
        }
    }
    function initParameters(){
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
                inputDataTable,
                self.statisticSettings
            );
        } else {
            dataCtrl.updateSettings(
                self.statisticSettings
            );
        }
    }
    function switchSetting(){
        if(self.visualizationMode == 'Inputs'){
            initInputs();
        }else{
            initParameters();
        }
    }
    this.toggleVisualizationMode = function(mode){
        if(self.visualizationMode == mode) return;
        self.visualizationMode = mode;
        console.log(self.visualizationMode);
        dataCtrl.destroy();
        dataCtrl = undefined;
        switchSetting();
    }
    this.droppableSetting = function() {
        inputDataTable = document.getElementById(self.taskDataTreeName);
        switchSetting();
        // dataCtrl.render();
        $(`#${self.taskDataTreeName}`).parent().droppable({
            scope: 'wi-task',
            drop(event, ui) {
                if (!ui.draggable) return;
                // check modal draggable
                if (ui.draggable[0].className.includes("modal-content")) return;
                const type = ($(ui.draggable[0]).attr("type"));
                let options = new Object();
                let idWell, wellModel;
                let paramItems = function(){
                    return self.taskConfig.parameters.reduce((total, param, idx) => {
                        total[idx] = param;
                        return total;
                    }, {});
                }
                let zoneItems = function(data){
                    if(self.taskConfig.zonation){
                        let zoneset = self.zone_set_list.find(zs => {
                            return zs.name == self.taskConfig.zonation.name && zs.idWell == data.wellProps.idWell;
                        });
                        if(zoneset && zoneset.zones.length){
                            let ret = zoneset.zones.reduce((total, zone) => {
                                if(self.taskConfig.zonation.children.findIndex(c => c == zone.zone_template.name) >= 0){
                                    total.push({
                                        idDataset: data.idDataset,
                                        wellProps: data.wellProps,
                                        dataset: data.datasetName,
                                        params: paramItems(),
                                        properties: zone
                                    })
                                }
                                return total;
                            }, [])
                            if(ret.length) return ret;
                        }
                    }
                    return [
                        {
                            idDataset: data.idDataset,
                            wellProps: data.wellProps,
                            dataset: data.datasetName,
                            params: paramItems(),
                            properties: {
                                endDepth: data.wellProps.bottomDepth,
                                startDepth: data.wellProps.topDepth,
                                zone_template: {
                                    name: "Zonation_all",
                                    pattern: "none",
                                    background: "rgba(255, 155, 100, 0.5)",
                                    foreground: 'white'
                                }
                            }
                        }
                    ]
                }
                switch(type){
                    case 'dataset':
                    (async () => {
                        const idDataset = parseInt($(ui.draggable[0]).attr("data"));
                        for (const node of self.projectConfig) {
                            utils.visit(
                                node,
                                (_node, _options) => {
                                    if (
                                        _node.type == "dataset" &&
                                        _node.id == idDataset
                                    ) {
                                        _options.result = _node;
                                        return true;
                                    }
                                    return false;
                                },
                                options
                            );
                            if (options.found) break;
                        }
                        // populate data into self.inputArray
                        if (!options.result) {
                            toastr.error("Dataset doesn't exist");
                            return;
                        }
                        const datasetModel = options.result;
                        const datasetName = datasetModel.properties.name;
                        idWell = datasetModel.properties.idWell;
                        wellModel = self.projectConfig.find(
                            well => well.id == idWell
                        );
                        const wellProps = wellModel.properties;
                        if (
                            !self.taskConfig.inputData ||
                            !Array.isArray(self.taskConfig.inputData)
                        ) {
                            self.taskConfig.inputData = new Array();
                        }
                        if (
                            !self.taskConfig.paramData ||
                            !Array.isArray(self.taskConfig.paramData)
                        ) {
                            self.taskConfig.paramData = new Array();
                        }
                        const existDataset = self.taskConfig.inputData.find(
                            i => i.idDataset == idDataset
                        );
                        if (existDataset) return;

                        const prevTaskCurves = [];
                        if (self.wiFlowDesigner) {
                            const prevTasks = self.wiFlowDesigner.getPreviousTasks(self.id);
                            await new Promise((resolve, reject) => {
                                async.each(prevTasks, (taskElement, next) => {
                                    const idTask = taskElement.businessObject.get('idTask');
                                    wiApiService.getTask(idTask, (task) => {
                                        const taskConfig = task.content;
                                        if (taskConfig.inputData.find(i => i.idDataset == idDataset && i.use == 'Yes')) prevTaskCurves.push(...taskConfig.outputs);
                                        next();
                                    });
                                }, (err, result) => {
                                    if (err) return reject(err);
                                    resolve();
                                })
                            })
                        }
                        datasetModel.children.push(...prevTaskCurves.filter(taskCurve => taskCurve.use && !datasetModel.children.find(c => c.name == taskCurve.name)));
                        let inputItems = self.taskConfig.inputs.reduce((total, ipt, idx) => {
                            let tempItem = {
                                name: ipt.name,
                                choices: matchCurves(datasetModel.children, ipt),
                            };
                            tempItem.value = tempItem.choices.length
                                ? tempItem.choices[0]
                                : null;
                                total[idx] = tempItem;
                            return total;
                        }, {});

                        let data = {
                            use: 'Yes',
                            idDataset: idDataset,
                            wellProps: wellProps,
                            dataset: datasetName,
                            inputs: inputItems
                        };
                        if(Object.values(data.inputs).find(c => c.value == null)) {
                            toastr.error('Dataset does not reach requirement inputs');
                            return;
                        }
                        self.taskConfig.inputData.push(data);
                        self.taskConfig.paramData.push(...zoneItems(data));
                    })();
                        break;

                    case 'zoneset':
                        const idZoneSet = parseInt($(ui.draggable[0]).attr("data"));
                        let zoneset = self.zonationConfig.find(zs => zs.id == idZoneSet);
                        let child = zoneset.children.filter(z => !z.data.unused).map(z => z.data.label);
                        if(!child.length) {
                            toastr.error("Zoneset must contains at least 1 used zone!");
                            return;
                        }
                        self.taskConfig.zonation = {
                            name: zoneset.data.label,
                            children: child
                        }
                        self.taskConfig.paramData = new Array();
                        self.taskConfig.inputData && self.taskConfig.inputData.forEach(data => {
                            self.taskConfig.paramData.push(...zoneItems(data));
                        })
                        break;
                }
                switchSetting();
            }
        });
    };

    function selectHandler(currentNode, noLoadData, rootNode, callback) {
        function bareSelectHandler() {
            if (currentNode.data) {
                $timeout(() => {
                    currentNode.data.selected = true;
                });
                let selectedNodes = rootNode.__SELECTED_NODES;
                if (!Array.isArray(selectedNodes)) selectedNodes = [];
                if (!selectedNodes.includes(currentNode)) {
                    selectedNodes.push(currentNode);
                }
                rootNode.__SELECTED_NODES = selectedNodes;
            }
        }
        if (currentNode.type == "well" && !noLoadData) {
            if (Date.now() - (currentNode.ts || 0) > 30 * 1000) {
                wiApiService.getWell(currentNode.id, wellProps => {
                    // console.log(wellProps);
                    currentNode.ts = Date.now();
                    if (wellProps.datasets && wellProps.datasets.length) {
                        currentNode.children.length = 0;
                        wellProps.datasets.forEach(dataset => {
                            const datasetModel = utils.createDatasetModel(
                                dataset
                            );
                            currentNode.children.push(datasetModel);
                            dataset.curves &&
                                dataset.curves.length &&
                                dataset.curves.forEach(curve => {
                                    datasetModel.children.push(
                                        utils.createCurveModel(curve)
                                    );
                                });
                        });
                    }
                    bareSelectHandler();
                    callback && callback();
                });
            } else {
                bareSelectHandler();
                callback && callback();
            }
        } else {
            bareSelectHandler();
            callback && callback();
        }
    }
    function unselectAllNodes(rootNode) {
        rootNode.forEach(item => {
            utils.visit(item, node => {
                if (node.data) node.data.selected = false;
            });
        });
        rootNode.__SELECTED_NODES = [];
    }

    this.prjClickFunction = function($index, $event, node) {
        clickFunction($index, $event, node, self.projectConfig);
    };
    this.zoneClickFunction = function($index, $event, node){
        if(node && node.type == 'zone'){
            node.data.unused = !node.data.unused;
        }
    }

    // this.taskClickFuntion = function($index, $event, node){
    //     if(node && node.type == 'dataset'){
    //         let rootNode = self.taskConfig.inputData;
    //         if (!Array.isArray(rootNode.__SELECTED_NODES)) rootNode.__SELECTED_NODES = [];
    //         if(!$event.ctrlKey) unselectAllNodes(rootNode)
    //         let selectedNodes = rootNode.__SELECTED_NODES;
    //         if(!selectedNodes.includes(node)) selectedNodes.push(node);
    //         rootNode.__SELECTED_NODES = selectedNodes;
    //         node.data.selected = true;
    //         node.$index = $index;
    //     }
    // }

    this.onToggleUseOutput = function(item){
        if(item.use == false || self.taskConfig.outputs.filter(c => c.use).length > 1){
            item.use = !item.use;
        }else{
            toastr.error('Must have at least one output!');
        }
    }
    this.editFamily = function(item){
        DialogUtils.curveFamilyDialog(ModalService, wiComponentService, item.idFamily, null, (ret)=>{
            item.idFamily = ret.idFamily;
            item.family = ret.name;
            self.getListUnit(item);
        })
    }
    this.getListUnit = function(item, defaultUnit){
        if(!item.idFamily) {
            const familyList = utils.getListFamily();
            let family = familyList.find(f => f.name == item.family);
            item.idFamily = (family || {}).idFamily || null;
        }
        if(item.idFamily){
            wiApiService.getListUnit({idFamily: item.idFamily}, (listUnit) => {
                item.listUnit = listUnit;
                if(!defaultUnit) item.unit = listUnit[0].name;
            })
        }
    }

    // const inputContextMenu = [
    //     {
    //         name: "Enabled/Disabled",
    //         label: "Enabled/Disabled",
    //         icon: "fa fa-exchange",
    //         handler: function(){
    //             let selectedNodes = self.taskConfig.inputData.__SELECTED_NODES;
    //             selectedNodes.forEach(node => {
    //                 node.data.unused = node.data.unused ? !node.data.unused : true;
    //             })
    //             self.taskConfig.inputData.__SELECTED_NODES = [];
    //         }
    //     },
    //     {
    //         name: "Delete",
    //         label: "Delete",
    //         icon: "delete-16x16",
    //         handler: function () {
    //             let selectedNodes = self.taskConfig.inputData.__SELECTED_NODES;
    //             selectedNodes.forEach(node => {
    //                 let idx = self.taskConfig.inputData.findIndex(ip => ip.$index == node.$index);
    //                 if(idx > -1) self.taskConfig.inputData.splice(idx, 1);
    //             })
    //             self.taskConfig.inputData.__SELECTED_NODES = [];
    //         }
    //     },
    //     {
    //         name: "Interactive",
    //         label: "Interactive",
    //         icon: "curve-interactive-edit-16x16",
    //         handler: function () {
    //             let selectedNodes = self.taskConfig.inputData.__SELECTED_NODES;
    //             console.log(selectedNodes);
    //         }
    //     }
    // ]

    // this.taskShowContextMenu = function($event, $index, node){
    //     if(node && node.type == 'dataset'){
    //         wiComponentService
    //         .getComponent("ContextMenu")
    //         .open($event.clientX, $event.clientY, inputContextMenu);
    //     }
    // }

    function clickFunction( $index, $event, node, rootNode) {
        // node.$index = $index;
        if (!node) {
            unselectAllNodes(rootNode);
            return;
        }
        let selectedNodes = rootNode.__SELECTED_NODES;
        if (!Array.isArray(selectedNodes)) selectedNodes = [];
        if (selectedNodes.length) {
            if (
                !$event.ctrlKey ||
                node.type != selectedNodes[0].type ||
                node.parent != selectedNodes[0].parent
            ) {
                unselectAllNodes(rootNode);
            }
        }
        selectHandler(node, false, rootNode, () => {
            // draggableSetting();
        });
    }

    this.saveTask = function () {
        if (self.new) return;
        wiApiService.editTask({ idTask: self.id, name: self.name, content: self.taskConfig }, (resTask) => {
            const tabComponent = $scope.$parent.tabComponent;
            layoutManager.updateTabTitle(tabComponent, resTask.name);
            wiComponentService.emit('task.changed', resTask);
            toastr.success(`Task ${self.name} saved`, null, { timeOut: 1000, progressBar: false });
        });
    }

    this.addToFlowClick = function(){
        // const DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        DialogUtils.openFlowDialog(ModalService, function (flow) {
            if (flow.task && flow.tasks.find(t => t.name === self.name)) {
                toastr.error('Task name existed in this flow');
                self.addToFlowClick();
                return;
            }
            layoutManager.putTabRight({
                id: 'flow' + flow.idFlow,
                title: flow.name,
                tabIcon: 'workflow-16x16',
                componentState: {
                    html: `<wi-flow-designer id="${flow.idFlow}" flow="flow"></wi-flow-designer>`,
                    model: {
                        type: 'flow',
                        id: flow.idFlow,
                    },
                    flow
                }
            });
            setTimeout(() => {
                const flowCtrl = wiComponentService.getComponent('flow' + flow.idFlow);
                flowCtrl.createTask(self);
            }, 100);
        });
    }

    // function updateChoices(newCurveProps) {
    //     self.projectConfig.forEach(well => {
    //         well.children.forEach(dataset => {
    //             if(dataset.id == newCurveProps.idDataset && dataset.type == 'dataset'){
    //                 let hasCurve = dataset.children.find(c => c.id == newCurveProps.idCurve);
    //                 if(!hasCurve) $timeout(() => dataset.children.push(utils.createCurveModel(newCurveProps)));
    //             }
    //         })
    //     })
    // }

/* 
    function saveCurve(curveInfo, callback) {
        getFamilyList(familyList => {
            let family = familyList.find(f => f.data.label == curveInfo.family);
            let payload = {
                data: curveInfo.data,
                idDataset: curveInfo.idDataset,
                idFamily: (family || {}).id || null
            }
            wiApiService.checkCurveExisted(curveInfo.name, curveInfo.idDataset, (curve) => {
                if (curve.idCurve) {
                    payload.idDesCurve = curve.idCurve;
                    curveInfo.idCurve = curve.idCurve;
                } else {
                    payload.curveName = curveInfo.name
                }
                wiApiService.processingDataCurve(payload, function (ret) {
                    if(!curve.idCurve) curveInfo.idCurve = ret.idCurve;
                    let _ret = null;
                    if(!curve.idCurve) {
                        _ret = ret;
                    }else{
                        _ret = curveInfo;
                        _ret.idFamily = payload.idFamily;
                    }

                    callback(_ret);
                })
            })
        });
    }
    function createLogplotFromResult(inputMap, callback) {
        let payload = {
            idProject: self.idProject,
            name: self.name,
            override: true
        };

        wiApiService.post(wiApiService.CREATE_PLOT, payload, (response, err) => {
            self.idPlot = response.idPlot;
            let currentOrderNum = 'm';
            async.eachOfSeries(inputMap, function(item, idx, end){
                let wfInput = item.inputs;
                let wfOutput = self.taskConfig.outputData[idx];
                async.parallel([
                    function(_end1){
                        wiApiService.createLogTrack(response.idPlot, currentOrderNum, function (trackData) {
                            async.eachSeries(wfInput, function(ipt, done1) {
                                //create line
                                wiApiService.createLine({
                                    idTrack: trackData.idTrack,
                                    idCurve: ipt.id,
                                    orderNum: currentOrderNum
                                }, function(line){
                                    currentOrderNum = String.fromCharCode(currentOrderNum.charCodeAt(0) + 1);
                                    done1();
                                })
                            },(err) => {
                                _end1();
                            });
                        }, {
                            title: 'Inputs'
                        })
                }, function (_end2) {
                    wiApiService.createLogTrack(response.idPlot, currentOrderNum, function (trackData) {
                        async.eachSeries(wfOutput.outputCurves, (opt, done2) => {
                            // create line
                            currentOrderNum = String.fromCharCode(currentOrderNum.charCodeAt(0) + 1);
                            wiApiService.createLine({
                                idTrack: trackData.idTrack,
                                idCurve: opt.idCurve,
                                orderNum: currentOrderNum
                            }, function(line){
                                let bgColor = null;
                                switch (opt.family) {
                                    case "Net Reservoir Flag":
                                        bgColor = "green";
                                        break;
                                    case "Net Pay Flag":
                                        bgColor = "red";
                                        break;
                                }
                                if (!bgColor) {
                                    done2();
                                    return;
                                }
                                wiApiService.createShading({
                                    idTrack:trackData.idTrack,
                                    name:opt.name + "-left",
                                    orderNum: 'm',
                                    negativeFill : {
                                        display: false,
                                        sadingType: "pattern",
                                        pattern: {
                                            background : "blue",
                                            foreground : "black",
                                            name : "none"
                                        }
                                    },
                                    positiveFill: {
                                        display: false,
                                        sadingType: "pattern",
                                        pattern: {
                                            background : "blue",
                                            foreground : "black",
                                            name : "none"
                                        }
                                    },
                                    fill:{
                                        display:true,
                                        shadingType:"pattern",
                                        pattern:{
                                            name: "none",
                                            foreground:"black",
                                            background:bgColor
                                        }
                                    },
                                    isNegPosFill:false,
                                    idLeftLine:null,
                                    idRightLine:line.idLine,
                                    leftFixedValue:0,
                                    idControlCurve:opt.idCurve
                                }, function(shadingProps) {
                                    done2();
                                });
                            })
                        }, (err) => {
                            _end2();
                        })
                    }, {
                        title: 'Outputs'
                    }
                )}
                ], function (err, result) {
                    if (err) toastr.error(err);
                    end();
                })
            }, (err) => {
                callback();
            })
        })
    }

    this.runWorkflowClick = function(){
        let runFunc = petrophysics[self.taskConfig.function];
        if(!runFunc) {
            toastr.error('Not yet implement');
            return;
        }
        self.taskConfig.outputData = new Array();
        let inputMap = self.taskConfig.inputData.reduce((total, d) => {
            if(!d.data.unused){
                let tmp =  {
                    inputs: d.children[0].children.map(c => c.data.value),
                    parameters: d.children[1].children.map(c => {
                        return {
                            endDepth: c.endDepth,
                            startDepth: c.startDepth,
                            param: c.children.map(cc => typeof(cc.data.value) != 'object' ? cc.data.value : cc.data.value.value)
                        }
                    }),
                    idDataset: d.idDataset,
                    idWell: d.wellProps.idWell,
                    dataset: d.dataset
                };

                tmp.parameters.step = parseFloat(d.wellProps.step);
                tmp.parameters.topDepth = parseFloat(d.wellProps.topDepth);
                tmp.parameters.bottomDepth = parseFloat(d.wellProps.bottomDepth);
                total.push(tmp);
            }
            return total;
        }, [])

        async.eachOf(inputMap, function(data, idx, callback){
            let curveData = [];
            async.eachSeries(data.inputs, function(curve, cb){
                wiApiService.dataCurve(curve.id, function(dataCurve){
                    curveData.push(dataCurve.map(d => parseFloat(d.x)));
                    cb();
                })
            }, function(err){
                if(!err){
                    runFunc(curveData, data.parameters, function(ret){
                        let wf = self.taskConfig;
                        wf.outputData[idx] = new Object();
                        wf.outputData[idx].idDataset = data.idDataset;
                        wf.outputData[idx].outputCurves = new Array();
                        wf.outputs.forEach((o, i) => {
                            wf.outputData[idx].outputCurves[i] = Object.assign({},o);
                            wf.outputData[idx].outputCurves[i].data = ret[i];
                        });
                        async.each(wf.outputData[idx].outputCurves, function(d, cb2) {
                            d.idDataset = data.idDataset;
                            saveCurve(d, function(curveProps) {
                                delete d.data;
                                updateChoices(curveProps);
                                cb2();
                            });
                        }, function(err) {
                            callback();
                        });
                    })
                }
            })
        }, function(err){
            if(!err){
                createLogplotFromResult(inputMap, function(){
                    utils.refreshProjectState();
                });
            }
        })
    }
 */
    this.runTask = function () {
        wiPetrophysics.execute(self, utils.refreshProjectState);
    }

    /*************************** THANG: hard code for interative track *****************************/
    this.logTrackProps = {
        width: 2.5,
        title: 'Track',
        showTitle: true,
        showDepthGrid: true,
        showEndLabels: true,
        showValueGrid:true,
        topJustification: 'center',
        bottomJustification: 'center',
        majorTicks: 1,
        minorTicks: 5,
        showZoneSet: true
    }
    this.currentInput = {
        zoneset: null,
        curves: [],
        well: {
            topDepth: 0,
            bottomDepth: 10000,
        }
    }
    function updateTrack(config) {
        let timerHandler = null;
        if(!self.logTrackProps.controller) {
            timerHandler = setInterval(function() {
                if(self.logTrackProps.controller) {
                    clearInterval(timerHandler);
                    updateTrack();
                } else {
                    console.log('not ready yet');
                }
            }, 100);
        } else {
            // Ready for update track
            console.log('ready for update track with config: ', config);
            updateFunction(config);
        }

        function updateFunction(config) {
            if(config.curves) {
                self.currentInput.well = utils.findWellByCurve(config.curves[0].idCurve);
                self.logTrackProps.lines = config.curves;
                /*
                async.eachSeries(config.curves, function(curveProps, cb) {
                    wiApiService.dataCurve(curveProps.idCurve, function(dataCurve) {
                        let controller = self.logTrackProps.controller;
                        controller.addCurveToTrack(dataCurve, curveProps);
                        cb();
                    })
                }, function(err) {
                    self.currentInput.zoneset = self.taskConfig.inputData[0].children.find(c => c.type == 'zoneset');
                })
                */
            }
            self.currentInput.zoneset = self.taskConfig.inputData[0].children.find(c => c.type == 'zoneset');
        }
    }
    this.onShowTrackButtonClicked = function() {
        self.showWFControlLine = !self.showWFControlLine;
        console.log('task config: ', self.taskConfig);
        if(!self.showWFControlLine) return;
        // get input map for hard code data
        let inputMap = self.taskConfig.inputData.map(d => {
            let tmp =  {
                inputs: d.children[0].children.map(c => c.data.value),
                parameters: d.children[1].children.map(c => {
                    return {
                        endDepth: c.endDepth,
                        startDepth: c.startDepth,
                        name: c.name,
                        fill: c.fill,
                        params: c.children.map(cc => {
                                return {
                                    label: cc.data.label,
                                    value: cc.data.value
                                }
                        }).filter(p => typeof(p.value) == 'number')
                    }
                }),
                idDataset: d.idDataset,
                idWell: d.wellProps.idWell,
                dataset: d.dataset
            };

            tmp.parameters.step = parseFloat(d.wellProps.step);
            tmp.parameters.topDepth = parseFloat(d.wellProps.topDepth);
            tmp.parameters.bottomDepth = parseFloat(d.wellProps.bottomDepth);
            return tmp;
        });
        console.log('input map: ', inputMap);
        console.log('task config', self.taskConfig);
        let config = {};
        let promises = [];
        promises.push(new Promise(function(resolve) {
            let inputs = inputMap[0].inputs.map(node => node.properties);
            async.eachSeries(inputs, function(inputCurve, callback) {
                wiApiService.infoCurve(inputCurve.idCurve, function(curveInfo) {
                    if(!config.curves || !Array.isArray(config.curves)) config.curves = [];
                    config.curves.push(curveInfo);
                    callback();
                });
            }, function(err) {
                resolve();
            })
        }));
        promises.push(new Promise(function(resolve) {
            config.zoneset = {
                name: 'zoneset',
                zones: inputMap[0].parameters
            };
            resolve();
        }))
        Promise.all(promises)
            .then(function() {
                updateTrack(config);
            });
    }
    /*************************** END OF HARD CODE *****************************/
}

const app = angular.module(moduleName, []);

app.component(name, {
    templateUrl: "wi-task.html",
    controller: Controller,
    controllerAs: name,
    transclude: true,
    bindings: {
        name: "@",
        id: "<",
        taskConfig: '<',
        new: '<',
        wiFlowDesigner: '<'
    }
});

exports.name = moduleName;
