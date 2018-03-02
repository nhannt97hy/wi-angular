const name = "wiWorkflowPlayer";
const moduleName = "wi-workflow-player";
let petrophysics = require('./petrophysics');

function Controller(wiComponentService, wiApiService, $timeout, $scope) {
    let self = this;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let DialogUtils = wiComponentService.getComponent(
        wiComponentService.DIALOG_UTILS
    );
    let __selectionTop = 0;
    let __selectionLength = 50;
    let __selectionDelta = 10;
    let __familyList = undefined;
    self.filterText = "";
    self.filterText1 = "";
    const CURVE_SELECTION = "1";
    const FAMILY_SELECTION = "2";
    const FAMILY_GROUP_SELECTION = "3";
    self.CURVE_SELECTION = CURVE_SELECTION;
    self.FAMILY_SELECTION = FAMILY_SELECTION;
    self.FAMILY_GROUP_SELECTION = FAMILY_GROUP_SELECTION;

    this.$onInit = function () {
        wiComponentService.putComponent(self.name, self);
        // CONFIGURE INPUT TAB
        self.selectionType = "3";
        onSelectionTypeChanged();

        // SELECT INPUT TAB
        self.isFrozen = !!self.idProject;
        self.projectConfig = new Array();
    };

    this.onClick = function ($index, $event, node) {
        self.selectionList.forEach(function (item) {
            item.data.selected = false;
        });
        node.data.selected = true;
    };
    function getFamilyList() {
        if (!self.filterText) {
            if (!__familyList) {
                __familyList = utils.getListFamily().map(function (family) {
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
            }
            return __familyList;
        } else {
            if (!__familyList) {
                __familyList = utils.getListFamily().map(function (family) {
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
            }
            let list = __familyList;
            return list.filter(item =>
                item.data.label
                    .toLowerCase()
                    .includes(self.filterText.toLowerCase())
            );
        }
    }
    /*this.inputArray = [
        {
            well: { name: "W4", idWell: 2 },
            dataset: { name: "W4", idDataset: 2 },
            inputs: [
                {
                    name: "Gamma Ray",
                    value: { idCurve: 1, name: "ECGR" },
                    choices: [
                        { idCurve: 1, name: "ECGR" },
                        { idCurve: 2, name: "ECGR-NEW" }
                    ]
                }
            ],
            parameters: [
                { name: "Gamma ray clean", type: "number", value: 10 },
                { name: "Gamma ray clay", type: "number", value: 120 },
                {
                    name: "Method",
                    type: "select",
                    value: { name: "Linear", value: "Linear" },
                    choices: [
                        { name: "Linear", value: "Linear" },
                        { name: "Clavier", value: "Clavier" },
                        { name: "Larionov Tertiary rocks", value: "Tertiary" }
                    ]
                }
            ]
        },
        {
            well: "02_97_DD_1X",
            dataset: "02_97_DD_1X",
            inputs: [
                {
                    name: "Gamma Ray",
                    value: { idCurve: 1, name: "ECGR" },
                    choices: [
                        { idCurve: 1, name: "ECGR" },
                        { idCurve: 2, name: "ECGR-NEW" }
                    ]
                }
            ],
            parameters: [
                { name: "Gamma ray clean", type: "number", value: 10 },
                { name: "Gamma ray clay", type: "number", value: 120 },
                {
                    name: "Method",
                    type: "select",
                    value: { name: "Linear", value: "Linear" },
                    choices: [
                        { name: "Linear", value: "Linear" },
                        { name: "Clavier", value: "Clavier" },
                        { name: "Larionov Tertiary rocks", value: "Tertiary" }
                    ]
                }
            ]
        }
    ];*/
    /*
        worflowConfig = {
            name: "Clastic",
            steps: [
                {
                    name: "Shale Volume",
                    inputs: [{ name: "Gamma Ray" }],
                    data: [...],
                    parameters: [],
                },
                {
                    name: "Porosity",
                    inputs: [{ name: "Bulk Density" }, { name: "Shale Volume" }]
                },
                {
                    name: "Saturation",
                    inputs: [
                        { name: "Formation Resistivity" },
                        { name: "Porosity" }
                    ]
                }
            ]
        };
    */
    //	inputConfig = [{ name: "Gamma Ray", value: "Gama Ray Family", type: "2" }];
    ////	inputConfig = [{ name: "Gamma Ray", value: "DTCO3", type: "1" }];
    this.onSelectionTypeChanged = onSelectionTypeChanged;
    function onSelectionTypeChanged() {
        self.filterText1 = "";
        self.filterText = "";
        switch (self.selectionType) {
            case FAMILY_GROUP_SELECTION:
                let temp = utils.getListFamily();
                let groups = new Set();
                temp.forEach(t => {
                    groups.add(t.familyGroup);
                });
                self.selectionList = Array.from(groups).map(g => {
                    return {
                        id: -1,
                        data: {
                            label: g,
                            icon: "zone-table-16x16",
                            selected: false
                        },
                        children: [],
                        properties: {}
                    };
                });
                break;
            case FAMILY_SELECTION:
                let tempArray = getFamilyList();
                self.selectionList = tempArray.slice(0, __selectionLength);
                __selectionTop = 0;
                break;
            case CURVE_SELECTION:
                let hash = new Object();
                let root = wiComponentService.getComponent(
                    wiComponentService.WI_EXPLORER
                ).treeConfig[0];
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
                self.selectionList = Object.keys(hash).map(function (key) {
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
                });
                break;
            default:
                break;
        }
    }

    this.onSelectTemplate = function (parentIdx, itemIdx) {
        let __SELECTED_NODE = self.selectionList.find(function (d) {
            return d.data.selected;
        });
        if (__SELECTED_NODE) {
            let step = self.workflowConfig.steps[parentIdx];
            let item = step.inputs[itemIdx];
            item.label = __SELECTED_NODE.data.label;
            item.value =
                __SELECTED_NODE.id > 0 ? __SELECTED_NODE.id : item.label;
            item.type = self.selectionType;
        } else {
            toastr.error("please select data type!");
        }
    };

    this.onDeleteInput = function (idx) {
        for (let wf of self.workflowConfig.steps) {
            wf.inputData.splice(idx, 1);
        }
        // self.inputArray.splice(idx, 1);
    };
    this.upTrigger = function (cb) {
        let familyList = getFamilyList();
        if (self.selectionType == FAMILY_SELECTION) {
            if (__selectionTop > 0) {
                if (__selectionTop > __selectionDelta) {
                    let newItems = familyList
                        .slice(
                            __selectionTop - __selectionDelta,
                            __selectionTop
                        )
                        .reverse();
                    __selectionTop = __selectionTop - __selectionDelta;
                    cb(newItems, self.selectionList);
                } else {
                    let newItems = familyList
                        .slice(0, __selectionTop)
                        .reverse();
                    __selectionTop = 0;
                    cb(newItems, self.selectionList);
                }
            } else cb([]);
        } else cb([]);
    };
    this.downTrigger = function (cb) {
        let familyList = getFamilyList();
        if (self.selectionType == FAMILY_SELECTION) {
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
        } else cb([]);
    };
    this.onFilterEnterKey = function (filterText) {
        self.filterText = filterText;
        if (self.selectionType == FAMILY_SELECTION) {
            __selectionTop = 0;
            $timeout(function () {
                self.selectionList = getFamilyList().slice(
                    0,
                    __selectionLength
                );
            });
        }
    };

    // SELECT INPUT TAB
    function modelFrom(rootConfig, wells) {
        wells.forEach(well => {
            let wellModel = utils.createWellModel(well);
            rootConfig.push(wellModel);
            if (well.datasets && well.datasets.length) {
                well.datasets.forEach(dataset => {
                    let datasetModel = utils.createDatasetModel(dataset);
                    wellModel.children.push(datasetModel);
                    dataset.curves.forEach(curve => {
                        datasetModel.children.push(
                            utils.createCurveModel(curve)
                        );
                    });
                });
            }
        });
    }
    function refreshProject() {
        if (!isNaN(self.idProject) && self.idProject > 0) {
            self.projectChanged({ idProject: self.idProject });
        }
    }
    this.refreshProject = refreshProject;
    this.getProjectList = function (wiItemDropdownCtrl) {
        if (!self.idProject) {
            wiApiService.getProjectList(null, function (projectList) {
                console.log(projectList);
                wiItemDropdownCtrl.items = projectList.map(function (prj) {
                    return {
                        data: {
                            label: prj.name
                        },
                        properties: prj
                    };
                });
            });
        } else {
            wiApiService.getProjectInfo(self.idProject, function (projectProps) {
                self.projectName = projectProps.name;
                self.projectChanged({ idProject: projectProps.idProject });
            });
        }
    };

    this.projectChanged = function (projectProps) {
        let __idProject = projectProps.idProject;
        if (__idProject > 0) {
            wiApiService.listWells(
                {
                    idProject: __idProject,
                    match:
                        self.prjFilter && self.prjFilter.length
                            ? self.prjFilter
                            : undefined
                },
                function (wells) {
                    self.projectConfig.length = 0;
                    modelFrom(self.projectConfig, wells);
                }
            );
        }
    };
    function draggableSetting() {
        $timeout(function () {
            $(
                'wi-base-treeview#__projectWellTree .wi-parent-node[type="dataset"]'
            ).draggable({
                helper: "clone",
                containment: "document",
                appendTo: document.getElementById("testElement")
            });
        }, 500);
    }
    function matchCurves(curves, matchCriterion) {
        switch (matchCriterion.type) {
            case FAMILY_GROUP_SELECTION:
                let familyList = utils.getListFamily();
                return curves.filter(function (cModel) {
                    let group = familyList.find(
                        f => f.idFamily == cModel.properties.idFamily
                    );
                    return group
                        ? matchCriterion.value == group.familyGroup
                        : false;
                });
            case FAMILY_SELECTION:
                return curves.filter(function (cModel) {
                    return matchCriterion.value == cModel.properties.idFamily;
                });
            case CURVE_SELECTION:
                return curves.filter(function (cModel) {
                    return matchCriterion.value == cModel.properties.name;
                });
        }
        return [];
    }
    this.droppableSetting = function () {
        $("wi-workflow-player .wi-droppable").droppable({
            drop: function (event, ui) {
                let idDataset = parseInt($(ui.draggable[0]).attr("data"));
                let options = new Object();
                for (let node of self.projectConfig) {
                    utils.visit(
                        node,
                        function (_node, _options) {
                            if (
                                _node.type == "dataset" &&
                                _node.id == idDataset
                            ) {
                                _options.result = _node;
                                return true;
                            } else return false;
                        },
                        options
                    );
                    if (options.found) break;
                }
                // populate data into self.inputArray
                if (!options.result) {
                    toastr.error("Dataset doesn't not exist");
                    return;
                }
                let datasetModel = options.result;
                // let datasetName = datasetModel.properties.name;
                let idWell = datasetModel.properties.idWell;
                let wellModel = self.projectConfig.find(
                    well => well.id == idWell
                );
                let wellName = wellModel.properties.name;

                for (let wf of self.workflowConfig.steps) {
                    if (!wf.inputData || !Array.isArray(wf.inputData))
                        wf.inputData = new Array();
                    let existDataset = wf.inputData.find(i => i.dataset.idDataset == datasetModel.properties.idDataset);
                    if (existDataset) return;
                    let inputItems = wf.inputs.map(function (ipt) {
                        let tempItem = {
                            name: ipt.name,
                            choices: matchCurves(datasetModel.children, ipt)
                        };
                        tempItem.value = tempItem.choices.length
                            ? tempItem.choices[0]
                            : null;
                        return tempItem;
                    });
                    let input = {
                        well: wellModel.properties,
                        dataset: datasetModel.properties,
                        inputs: inputItems,
                        parameters: angular.copy(wf.parameters)
                    };
                    $timeout(() => {
                        wf.inputData.push(input);
                    });
                }
                $timeout(
                    () =>
                        (self.wiDroppableHeight =
                            $("wi-workflow-player .wi-droppable>div").height() +
                            6)
                );
            }
        });
    };

    function selectHandler(currentNode, noLoadData, rootNode, callback) {
        function bareSelectHandler() {
            if (currentNode.data) {
                $timeout(function () {
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
            if (Date.now() - (currentNode.ts || 0) > 20 * 1000) {
                wiApiService.getWell(currentNode.id, function (wellProps) {
                    currentNode.ts = Date.now();
                    if (wellProps.datasets && wellProps.datasets.length) {
                        currentNode.children.length = 0;
                        wellProps.datasets.forEach(dataset => {
                            let datasetModel = utils.createDatasetModel(
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
        rootNode.forEach(function (item) {
            utils.visit(item, function (node) {
                if (node.data) node.data.selected = false;
            });
        });
        rootNode.__SELECTED_NODES = [];
    }

    this.prjClickFunction = function ($index, $event, node) {
        clickFunction($index, $event, node, self.projectConfig, true);
    };

    function clickFunction(
        $index,
        $event,
        node,
        rootNode,
        multiNodeFetch = false
    ) {
        node.$index = $index;
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
        selectHandler(node, false, rootNode, function () {
            draggableSetting();
        });
    }

    this.validate = function () {
        for (let step of self.workflowConfig.steps) {
            if (!step.disabled) {
                for (let input of step.inputs) {
                    if (!input.value) return false;
                }
            }
        }
        return true;
    };

    function saveCurve(curveList, curveInfo, callback) {
        let payload = {
            data: curveInfo.data,
            unit: curveInfo.unit,
            idDataset: curveInfo.idDataset
        }
        let curve = curveList.find(c => c.name == curveInfo.name);
        if (curve) {
            payload.idDesCurve = curve.idCurve;
        } else {
            payload.curveName = curveInfo.name
        }
        wiApiService.processingDataCurve(payload, function (ret) {
            callback();
        })
    }

    this.runWorkflow = function (wf) {
        let run = petrophysics[wf.function];
        if (wf.inputData && wf.inputData.length && run) {
            if (!wf.outputData || !Array.isArray(wf.outputData)) wf.outputData = new Array();
            async.eachOfSeries(wf.inputData, (data, idx, callback) => {
                let curvesData = [];
                async.eachOfSeries(data.inputs, (curve, index, cb) => {
                    let idCurve = curve.value.id;
                    wiApiService.dataCurve(idCurve, function (data) {
                        curvesData.push(data.map(d => parseFloat(d.x)));
                        cb();
                    })
                }, (err) => {
                    if (err) console.log(err);
                    run(curvesData, wf.parameters, function (ret) {
                        wf.outputData[idx] = ret;
                        async.each(ret, (d, cb2) => {
                            let dataset = data.dataset;
                            d.idDataset = dataset.idDataset;
                            saveCurve(dataset.curves, d, cb2);
                        }, (err) => {
                            console.log("save curves done");
                            refreshProject();
                            callback();
                        })
                    })
                })
            }, (err) => {
                if (err) console.log(err);
                console.log("done!", wf.outputData);
            }
            )
        }
    }
}

let app = angular.module(moduleName, []);

app.component(name, {
    templateUrl: "wi-workflow-player.html",
    controller: Controller,
    controllerAs: name,
    transclude: true,
    bindings: {
        name: "@",
        idProject: "<",
        workflowConfig: "<"
    }
});

exports.name = moduleName;
