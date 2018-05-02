const name = "wiTask";
const moduleName = "wi-task";

function Controller(wiComponentService, wiApiService, $timeout) {
    const self = this;
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);
    //   const DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let __selectionTop = 0;
    const __selectionLength = 50;
    const __selectionDelta = 10;
    let __dragging = false;
    let __familyList;
    self.filterText = "";
    self.filterText1 = "";
    const CURVE_SELECTION = "1";
    const FAMILY_SELECTION = "2";
    const FAMILY_GROUP_SELECTION = "3";
    self.CURVE_SELECTION = CURVE_SELECTION;
    self.FAMILY_SELECTION = FAMILY_SELECTION;
    self.FAMILY_GROUP_SELECTION = FAMILY_GROUP_SELECTION;

    this.$onInit = function() {
        wiComponentService.putComponent("wiTask", self);
        // CONFIGURE INPUT TAB
        self.selectionType = "3";
        wiApiService.listFamily(listF => {
            // console.log(listF);
            list = listF;
            onSelectionTypeChanged();
        });

        // SELECT INPUT TAB
        self.idProject = self.getCurrentProjectId();
        self.isFrozen = !!self.idProject;
        self.projectConfig = new Array();
    };
    this.getCurrentProjectId = function() {
        if (self.idProject) return self.idProject;
        const openProject = wiComponentService.getComponent(
            wiComponentService.PROJECT_LOADED
        );
        return (openProject || {}).idProject;
    };

    this.onClick = function($index, $event, node) {
        self.selectionList.forEach(item => {
            item.data.selected = false;
        });
        node.data.selected = true;
    };
    function getFamilyList() {
        if (!self.filterText) {
            if (!__familyList) {
                let temp = utils.getListFamily();
                if (!temp) temp = list;
                __familyList = temp.map(family => ({
                    id: family.idFamily,
                    data: {
                        label: family.name,
                        icon: "user-define-16x16",
                        selected: false
                    },
                    children: [],
                    properties: family
                }));
            }
            return __familyList;
        }
        if (!__familyList) {
            let temp = utils.getListFamily();
            if (!temp) temp = list;
            __familyList = temp.map(family => ({
                id: family.idFamily,
                data: {
                    label: family.name,
                    icon: "user-define-16x16",
                    selected: false
                },
                children: [],
                properties: family
            }));
        }
        let list = __familyList;
        return list.filter(item =>
            item.data.label
                .toLowerCase()
                .includes(self.filterText.toLowerCase())
        );
    }
    this.taskConfig = {
        inputs: [
            {
                name: "Gamma Ray"
            }
        ],
        parameters: [
            { name: "GR clean", type: "number", value: 10 },
            { name: "GR clay", type: "number", value: 120 },
            {
                name: "Method",
                type: "select",
                choices: [
                    {
                        name: "Linear",
                        value: 1
                    },
                    {
                        name: "Clavier",
                        value: 2
                    },
                    {
                        name: "Larionov Tertiary rocks",
                        value: 3
                    },
                    {
                        name: "Larionov older rocks",
                        value: 4
                    },
                    {
                        name: "Stieber variation I",
                        value: 5
                    },
                    {
                        name: "Stieber - Miocene and Pliocene",
                        value: 6
                    },
                    {
                        name: "Stieber variation II",
                        value: 7
                    }
                ]
            }
        ],
        outputs: [
            {name: "VCL_GR", family: "Clay Volume"}
        ],
        function: "calVCLfromGR"
    };

    this.onSelectionTypeChanged = onSelectionTypeChanged;

    function onSelectionTypeChanged() {
        self.filterText1 = "";
        self.filterText = "";
        switch (self.selectionType) {
            case FAMILY_GROUP_SELECTION:
                let temp = utils.getListFamily();
                // console.log('temp: ', temp);
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
                const tempArray = getFamilyList();
                self.selectionList = tempArray.slice(0, __selectionLength);
                __selectionTop = 0;
                break;
            case CURVE_SELECTION:
                const hash = new Object();
                const root = wiComponentService.getComponent(
                    wiComponentService.WI_EXPLORER
                ).treeConfig[0];
                utils.visit(
                    root,
                    (node, _hash) => {
                        if (node.type == "curve") {
                            _hash[node.data.label] = 1;
                        }
                        return false;
                    },
                    hash
                );
                console.log("hash: ", hash);
                self.selectionList = Object.keys(hash).map(key => ({
                    id: -1,
                    data: {
                        label: key,
                        icon: "curve-16x16",
                        selected: false
                    },
                    children: [],
                    properties: {}
                }));
                break;
            default:
                break;
        }
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
        const familyList = getFamilyList();
        if (self.selectionType == FAMILY_SELECTION) {
            if (__selectionTop > 0) {
                if (__selectionTop > __selectionDelta) {
                    const newItems = familyList
                        .slice(
                            __selectionTop - __selectionDelta,
                            __selectionTop
                        )
                        .reverse();
                    __selectionTop -= __selectionDelta;
                    cb(newItems, self.selectionList);
                } else {
                    const newItems = familyList
                        .slice(0, __selectionTop)
                        .reverse();
                    __selectionTop = 0;
                    cb(newItems, self.selectionList);
                }
            } else cb([]);
        } else cb([]);
    };
    this.downTrigger = function(cb) {
        const familyList = getFamilyList();
        if (self.selectionType == FAMILY_SELECTION) {
            const __selectionBottom = __selectionTop + __selectionLength;
            if (__selectionBottom < familyList.length) {
                if (familyList.length - __selectionBottom > __selectionDelta) {
                    const newItems = familyList.slice(
                        __selectionBottom + 1,
                        __selectionDelta + __selectionBottom + 1
                    );
                    __selectionTop += __selectionDelta;
                    cb(newItems, self.selectionList);
                } else {
                    const newItems = familyList.slice(
                        __selectionBottom + 1,
                        familyList.length
                    );
                    __selectionTop += familyList.length - __selectionBottom;
                    cb(newItems, self.selectionList);
                }
            } else cb([]);
        } else cb([]);
    };
    this.onFilterEnterKey = function(filterText) {
        self.filterText = filterText;
        if (self.selectionType == FAMILY_SELECTION) {
            __selectionTop = 0;
            $timeout(() => {
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
            const wellModel = utils.createWellModel(well);
            rootConfig.push(wellModel);
            if (well.datasets && well.datasets.length) {
                well.datasets.forEach(dataset => {
                    const datasetModel = utils.createDatasetModel(dataset);
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
                    modelFrom(self.projectConfig, wells);
                }
            );
        }
    };
    function draggableSetting() {
        $timeout(() => {
            $(
                'wi-task wi-base-treeview#__projectWellTree .wi-parent-node[type="dataset"]'
            ).draggable({
                helper: "clone",
                start: function(event, ui) {
                    __dragging = true;
                },
                stop: function(event, ui) {
                    __dragging = false;
                },
                containment: "document",
                appendTo: document.querySelector("wi-task #dragElement")
            });
        }, 500);
    }
    function matchCurves(curves, matchCriterion) {
        switch (matchCriterion.type) {
            case FAMILY_GROUP_SELECTION:
                const familyList = utils.getListFamily();
                return curves.filter(cModel => {
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
            case FAMILY_SELECTION:
                return curves.filter(cModel => {
                    if (cModel.properties) {
                        return (
                            matchCriterion.value == cModel.properties.idFamily
                        );
                    }
                    return matchCriterion.value == cModel.idFamily;
                });
            case CURVE_SELECTION:
                return curves.filter(cModel => {
                    if (cModel.properties) {
                        return matchCriterion.value == cModel.properties.name;
                    }
                    return matchCriterion.value == cModel.name;
                });
        }
        return [];
    }
    this.droppableSetting = function() {
        $("wi-task .wi-droppable").droppable({
            drop(event, ui) {
                if (!__dragging) return;
                // check modal draggable
                if (ui.draggable[0].className.includes("modal-content")) return;
                const idDataset = parseInt($(ui.draggable[0]).attr("data"));
                const options = new Object();
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
                // console.log(options.result);
                // populate data into self.inputArray
                if (!options.result) {
                    toastr.error("Dataset doesn't not exist");
                    return;
                }
                const datasetModel = options.result;
                const datasetName = datasetModel.properties.name;
                const idWell = datasetModel.properties.idWell;
                const wellModel = self.projectConfig.find(
                    well => well.id == idWell
                );
                const wellName = wellModel.properties.name;
                if (
                    !self.taskConfig.inputData ||
                    !Array.isArray(self.taskConfig.inputData)
                ) {
                    self.taskConfig.inputData = new Array();
                }
                const existDataset = self.taskConfig.inputData.find(
                    i => i.id == idDataset
                );
                if (existDataset) return;

                let inputItems = self.taskConfig.inputs.map(ipt => {
                    let tempItem = {
                        data: {
                            childExpanded: false,
                            icon: "curve-16x16",
                            label: ipt.name,
                            choices: matchCurves(datasetModel.children, ipt),
                            selected: false
                        },
                        type: "inputchoice"
                    };
                    tempItem.data.value = tempItem.data.choices.length
                        ? tempItem.data.choices[0]
                        : null;
                    return tempItem;
                });
                let input = {
                    type: 'dataset',
                    id: idDataset,
                    idWell: idWell,
                    dataset: datasetModel.properties,
                    data: {
                        childExpanded: true,
                        icon: "curve-data-16x16",
                        label: `${wellModel.properties.name} / ${datasetModel.properties.name}`,
                        selected: false
                    },
                    children: [
                        {
                            data: {
                                childExpanded: true,
                                label: 'Inputs',
                                selected: false
                            },
                            children: inputItems,
                            type: 'input'
                        },
                        {
                            data: {
                                childExpanded: true,
                                label: 'Zonation',
                                selected: false
                            },
                            children: [],
                            type: 'zoneset'
                        }
                    ],
                    parameters: angular.copy(self.taskConfig.parameters)
                };
                wiApiService.getWell(idWell, function(wellInfo){
                    let zonesets = wellInfo.zone_sets;
                    let zoneset = zonesets.find(zs => zs.zones.length);
                    let paramItems = self.taskConfig.parameters.map(param => {
                        let tempItem = {
                            data: {
                                childExpanded: false,
                                label: param.name,
                                selected: false
                            },
                            type: 'zonechoice'
                        }
                        if(param.type == 'select'){
                            tempItem.data.choices = angular.copy(param.choices);
                            tempItem.data.value = param.value ? param.value : (tempItem.data.choices.length
                                ? tempItem.data.choices[0]
                                : null);
                        }else{
                            tempItem.data.value = param.value;
                        }
                        return tempItem;
                    })
                    if(zoneset){
                        zoneset.zones.forEach(zone => {
                            input.children[1].children.push({
                                data: {
                                    childExpanded: true,
                                    icon: 'zone-table-16x16',
                                    label: `${zone.name}: ${zone.startDepth} - ${zone.endDepth}`,
                                    selected: false
                                },
                                type: 'zone',
                                children: paramItems,
                                properties: zone
                            })
                        })
                    }else{
                        input.children[1].children.push({
                            data: {
                                childExpanded: true,
                                icon: 'zone-table-16x16',
                                label: `ZONENATION_ALL: ${wellInfo.topDepth} - ${wellInfo.bottomDepth}` ,
                                selected: false
                            },
                            type: 'zone',
                            children: paramItems
                        })
                    }
                    $timeout(() => self.taskConfig.inputData.push(input));
                })
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
            if (Date.now() - (currentNode.ts || 0) > 20 * 1000) {
                wiApiService.getWell(currentNode.id, wellProps => {
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

    this.taskClickFuntion = function($index, $event, node){
        if(node && node.type == 'dataset'){
            let rootNode = self.taskConfig.inputData;
            if (!Array.isArray(rootNode.__SELECTED_NODES)) rootNode.__SELECTED_NODES = [];
            if(!$event.ctrlKey) unselectAllNodes(rootNode)
            let selectedNodes = rootNode.__SELECTED_NODES;
            if(!selectedNodes.includes(node)) selectedNodes.push(node);
            rootNode.__SELECTED_NODES = selectedNodes;
            node.data.selected = true;
            node.$index = $index;
        }
    }

    const inputContextMenu = [
        {
            name: "Delete",
            label: "Delete",
            icon: "delete-16x16",
            handler: function () {
                let selectedNodes = self.taskConfig.inputData.__SELECTED_NODES;
                selectedNodes.forEach(node => {
                    let idx = self.taskConfig.inputData.findIndex(ip => ip.id == node.id);
                    if(idx > -1) self.taskConfig.inputData.splice(idx, 1);
                })
                self.taskConfig.inputData.__SELECTED_NODES = [];
            }
        },
        {
            name: "Interactive",
            label: "Interactive",
            icon: "curve-interactive-edit-16x16",
            handler: function () {
                let selectedNodes = self.taskConfig.inputData.__SELECTED_NODES;
                console.log(selectedNodes);
            }
        }
    ]

    this.taskShowContextMenu = function($event, $index, node){
        if(node && node.type == 'dataset'){
            wiComponentService
            .getComponent("ContextMenu")
            .open($event.clientX, $event.clientY, inputContextMenu);
        }
    }

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
            draggableSetting();
        });
    }

    this.addToWorkflowClick = function(){
        console.log('Add to workflow');
    }

    this.runWorkflowClick = function(){
        console.log('run workflow');
    }
}

const app = angular.module(moduleName, []);

app.component(name, {
    templateUrl: "wi-task.html",
    controller: Controller,
    controllerAs: name,
    transclude: true,
    bindings: {
        name: "@",
        idTask: "<"
    }
});

exports.name = moduleName;
