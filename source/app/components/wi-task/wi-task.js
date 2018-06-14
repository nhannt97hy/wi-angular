const name = "wiTask";
const moduleName = "wi-task";
let petrophysics = require('./petrophysics');

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
        wiComponentService.putComponent("wiTask" + self.id, self);
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
        self.taskDataTreeName = name + 'taskDataTree';

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

    function onSelectionTypeChanged(selType) {
        self.filterText1 = "";
        self.filterText = "";
        self.selectionType = selType || self.selectionType;
        switch (self.selectionType) {
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
    // function buildWellList(wells) {
    //     wells.forEach(well => {
    //         const wellModel = utils.createWellModel(well);
    //         self.projectConfig.push(wellModel);
    //     });
    // }
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
                let zoneArr = zonesets.reduce((total, curVal) => total.concat(curVal.zones.map(z => z.name)), []);
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
                    // buildWellList(wells);
                    buildZoneSetListFromServer(wells);
                }
            );
        }
    };
    function draggableSetting(domEle) {
        $timeout(() => {
            domEle.draggable({
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
    this.onPrjReady = function(){
        let domEle = $( '#' + self.projectTreeName + ' .wi-parent-node[type="dataset"]');
        draggableSetting(domEle);
    }
    this.onZoneReady = function(){
        let domEle = $('#' + self.zonationTreeName + ' .wi-parent-node[type="zoneset"]');
        draggableSetting(domEle);
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
                const type = ($(ui.draggable[0]).attr("type"));
                let options = new Object();
                let idWell, wellModel;
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
                let zoneItems = function(wellProps){
                    if(self.taskConfig.zonation){
                        let zoneset = self.zone_set_list.find(zs => {
                            return zs.name == self.taskConfig.zonation.name && zs.idWell == wellProps.idWell;
                        });
                        if(zoneset && zoneset.zones.length){
                            let ret = zoneset.zones.reduce((total, zone) => {
                                if(self.taskConfig.zonation.children.findIndex(c => c == zone.name) >= 0){
                                    total.push({
                                            data: {
                                                childExpanded: true,
                                                icon: 'zone-table-16x16',
                                                label: `${zone.name}: ${zone.startDepth} - ${zone.endDepth}` ,
                                                selected: false
                                            },
                                            type: 'zone',
                                            children: angular.copy(paramItems),
                                            startDepth: zone.startDepth,
                                            endDepth: zone.endDepth
                                        })
                                }
                                return total;
                            }, [])
                            if(ret.length) return ret;
                        }
                    }
                    return [
                        {
                            data: {
                                childExpanded: true,
                                icon: 'zone-table-16x16',
                                label: `ZONENATION_ALL: ${wellProps.topDepth} - ${wellProps.bottomDepth}` ,
                                selected: false
                            },
                            type: 'zone',
                            children: paramItems
                        }
                    ]
                }
                switch(type){
                    case 'dataset':
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
                        const existDataset = self.taskConfig.inputData.find(
                            i => i.idDataset == idDataset
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
                            idDataset: idDataset,
                            wellProps: wellProps,
                            dataset: datasetName,
                            data: {
                                childExpanded: true,
                                icon: "well-16x16",
                                label: `${wellProps.name} / ${datasetModel.properties.name}`,
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
                                    children: zoneItems(wellProps),
                                    type: 'zoneset'
                                }
                            ]
                        };
                        if(input.children[0].children.find(c => c.data.value == null)) {
                            toastr.error('Dataset does not reach requirement inputs');
                            return;
                        }
                        $timeout(() => {
                            self.taskConfig.inputData.push(input);
                            // self.typeFilter = 'inputchoice';
                        })
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
                        self.taskConfig.inputData && self.taskConfig.inputData.forEach(input => {
                            $timeout(() => {
                                input.children[1].children = zoneItems(input.wellProps);
                            })
                        })
                        // self.typeFilter = 'zonechoice';
                        break;
                }
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
            name: "Enabled/Disabled",
            label: "Enabled/Disabled",
            icon: "fa fa-exchange",
            handler: function(){
                let selectedNodes = self.taskConfig.inputData.__SELECTED_NODES;
                selectedNodes.forEach(node => {
                    node.data.unused = node.data.unused ? !node.data.unused : true;
                })
                self.taskConfig.inputData.__SELECTED_NODES = [];
            }
        },
        {
            name: "Delete",
            label: "Delete",
            icon: "delete-16x16",
            handler: function () {
                let selectedNodes = self.taskConfig.inputData.__SELECTED_NODES;
                selectedNodes.forEach(node => {
                    let idx = self.taskConfig.inputData.findIndex(ip => ip.$index == node.$index);
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
            // draggableSetting();
        });
    }

    this.addToWorkflowClick = function(){
        console.log('Add to workflow');
    }
    function updateChoices(newCurveProps) {
        self.projectConfig.forEach(well => {
            well.children.forEach(dataset => {
                if(dataset.id == newCurveProps.idDataset && dataset.type == 'dataset'){
                    let hasCurve = dataset.children.find(c => c.id == newCurveProps.idCurve);
                    if(!hasCurve) $timeout(() => dataset.children.push(utils.createCurveModel(newCurveProps)));
                }
            })
        })
    }

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
        minorTicks: 5
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
                async.eachSeries(config.curves, function(curveProps) {
                    wiApiService.dataCurve(curveProps.idCurve, function(dataCurve) {
                        let controller = self.logTrackProps.controller;
                        controller.addCurveToTrack(controller.viTrack, dataCurve, curveProps);
                    })
                })
            }
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
            return tmp;
        });
        console.log('input map: ', inputMap);
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
                console.log('this is callback function');
                resolve();
            })
        }))
        Promise.all(promises)
            .then(function() {
                updateTrack(config);
            });
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
        id: "<"
    }
});

exports.name = moduleName;
