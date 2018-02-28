const name = "wiStep";
const moduleName = "wi-step";

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

    this.$onInit = function() {
        wiComponentService.putComponent(self.name, self);
        // CONFIGURE INPUT TAB
        self.selectionType = "3";
        onSelectionTypeChanged();

        // SELECT INPUT TAB
        self.isFrozen = !!self.idProject;
        self.projectConfig = new Array();
    };

    this.onClick = function($index, $event, node) {
        self.selectionList.forEach(function(item) {
            item.data.selected = false;
        });
        node.data.selected = true;
    };
    function getFamilyList() {
        if (!self.filterText) {
            if (!__familyList) {
                __familyList = utils.getListFamily().map(function(family) {
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
                __familyList = utils.getListFamily().map(function(family) {
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
    this.inputArray = new Array();
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
                    function(node, _hash) {
                        if (node.type == "curve") {
                            _hash[node.data.label] = 1;
                        }
                        return false;
                    },
                    hash
                );
                self.selectionList = Object.keys(hash).map(function(key) {
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

    this.onSelectTemplate = function(type) {
        let __SELECTED_NODE = self.selectionList.find(function(d) {
            return d.data.selected;
        });
        if (__SELECTED_NODE) {
            let item = self.inputConfig.find(d => d.name == type);
            item.label = __SELECTED_NODE.data.label;
            item.value =
                __SELECTED_NODE.id > 0 ? __SELECTED_NODE.id : item.label;
            item.type = self.selectionType;
        } else {
            toastr.error("please select data type!");
        }
    };

    this.addMoreInput = function(option) {
        console.log("Add more");
        function filterCurveByTpl(type, dataset) {
            return dataset.children.filter(d => {
                switch (self.template[type].type) {
                    case "group":
                        return (
                            d.lineProperties &&
                            d.lineProperties.familyGroup ==
                                self.template[type].name
                        );
                        break;

                    case "family":
                        return (
                            d.lineProperties &&
                            d.lineProperties.name == self.template[type].name
                        );
                        break;

                    case "curve":
                        return d.name == self.template[type].name;
                        break;
                }
            });
        }
        function addMore(dataset) {
            let existed = self.inputs.find(d => d.idDataset == dataset.id);
            if (!existed) {
                let FRArr = filterCurveByTpl("FR", dataset);
                let PRArr = filterCurveByTpl("PR", dataset);
                if (FRArr.length && PRArr.length) {
                    self.inputs.push({
                        idDataset: dataset.id,
                        dataset: dataset.name,
                        well: dataset.parentData.label,
                        FRArr: FRArr,
                        PRArr: PRArr,
                        Fr: FRArr[0],
                        Pr: PRArr[0],
                        a: 1,
                        m: 2,
                        n: 2,
                        Rw: 0.03
                    });
                } else {
                    toastr.error(
                        "Dataset" + dataset.name + " doesn't match data type!"
                    );
                }
            } else {
                toastr.error("Dataset" + dataset.name + " already added!");
            }
        }
        if (self.template.FR && self.template.PR) {
            switch (option.type) {
                case "dataset":
                    addMore(option);
                    break;

                case "well":
                    option.children
                        .filter(c => {
                            return c.type == "dataset";
                        })
                        .forEach(c => {
                            addMore(c);
                        });
                    break;
            }
        } else {
            toastr.error("Please select data type!");
        }
    };

    this.onDeleteInput = function(idx) {
        self.inputArray.splice(idx, 1);
    };
    this.upTrigger = function(cb) {
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
    this.downTrigger = function(cb) {
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
    this.onFilterEnterKey = function(filterText) {
        self.filterText = filterText;
        if (self.selectionType == FAMILY_SELECTION) {
            __selectionTop = 0;
            $timeout(function() {
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
    this.getProjectList = function(wiItemDropdownCtrl) {
        if (!self.idProject) {
            wiApiService.getProjectList(null, function(projectList) {
                console.log(projectList);
                wiItemDropdownCtrl.items = projectList.map(function(prj) {
                    return {
                        data: {
                            label: prj.name
                        },
                        properties: prj
                    };
                });
            });
        } else {
            wiApiService.getProjectInfo(self.idProject, function(projectProps) {
                self.projectName = projectProps.name;
                self.projectChanged({ idProject: projectProps.idProject });
            });
        }
    };

    this.projectChanged = function(projectProps) {
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
                function(wells) {
                    self.projectConfig.length = 0;
                    modelFrom(self.projectConfig, wells);
                }
            );
        }
    };
    function draggableSetting() {
        $timeout(function() {
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
                return curves.filter(function(cModel) {
                    return true;
                });
            case FAMILY_SELECTION:
                return curves.filter(function(cModel) {
                    return matchCriterion.value == cModel.properties.idFamily;
                });
            case CURVE_SELECTION:
                return curves.filter(function(cModel) {
                    return matchCriterion.value == cModel.properties.name;
                });
        }
        return undefined;
    }
    this.droppableSetting = function() {
        $("wi-step .wi-droppable").droppable({
            drop: function(event, ui) {
                console.log(parseInt($(ui.draggable[0]).attr("data")));
                let idDataset = parseInt($(ui.draggable[0]).attr("data"));
                let options = new Object();
                for (let node of self.projectConfig) {
                    utils.visit(
                        node,
                        function(_node, _options) {
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
                console.log(options.result);
                // populate data into self.inputArray
                if (!options.result) {
                    toastr.error("Dataset doesn't not exist");
                    return;
                }
                let datasetModel = options.result;
                let datasetName = datasetModel.properties.name;
                let idWell = datasetModel.properties.idWell;
                let wellModel = self.projectConfig.find(
                    well => well.id == idWell
                );
                let wellName = wellModel.properties.name;

                let inputItems = self.inputConfig.map(function(ipt) {
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
                    parameters: angular.copy(self.parameterConfig)
                };
                $timeout(() => self.inputArray.push(input));

                /*
				inputConfig = [{ name: "Gamma Ray", label: "Gama Ray Family", value: 892, type: "2" }];
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
				]*/
            }
        });
    };

    function selectHandler(currentNode, noLoadData, rootNode, callback) {
        function bareSelectHandler() {
            if (currentNode.data) {
                $timeout(function() {
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
                wiApiService.getWell(currentNode.id, function(wellProps) {
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
        rootNode.forEach(function(item) {
            utils.visit(item, function(node) {
                if (node.data) node.data.selected = false;
            });
        });
        rootNode.__SELECTED_NODES = [];
    }

    this.prjClickFunction = function($index, $event, node) {
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
        selectHandler(node, false, rootNode, function() {
            draggableSetting();
        });
    }
}

let app = angular.module(moduleName, []);

app.component(name, {
    templateUrl: "wi-step.html",
    controller: Controller,
    controllerAs: name,
    transclude: true,
    bindings: {
        name: "@",
        idProject: "<",
        inputConfig: "<", // Array of {name, type, value, choices}
        parameterConfig: "<" // Array of {name, type, value, choices}
    }
});

exports.name = moduleName;
