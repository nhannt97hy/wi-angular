const name = "wiWorkflowPlayer";
const moduleName = "wi-workflow-player";
// let petrophysics = require('./petrophysics');

function Controller(wiComponentService, wiApiService, $timeout, $scope) {
    let self = this;
    let __running_wf = false;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let DialogUtils = wiComponentService.getComponent(
        wiComponentService.DIALOG_UTILS
    );
    let __selectionTop = 0;
    let __selectionLength = 50;
    let __selectionDelta = 10;
    self.filterText = "";
    self.filterText1 = "";
    const CURVE_SELECTION = "1";
    const FAMILY_SELECTION = "2";
    const FAMILY_GROUP_SELECTION = "3";
    self.CURVE_SELECTION = CURVE_SELECTION;
    self.FAMILY_SELECTION = FAMILY_SELECTION;
    self.FAMILY_GROUP_SELECTION = FAMILY_GROUP_SELECTION;
    let __inputChanged = {
        status: false,
        index: []
    };
    let __inputDataLen = 0;

    this.$onInit = function () {
        if (self.name) wiComponentService.putComponent(self.name, self);
        if (self.idWorkflow) {
            wiApiService.getWorkflow(self.idWorkflow, function(workflow) {
                console.log(workflow.content);
                self.workflowConfig = workflow.content;
            });
        }
        // CONFIGURE INPUT TAB
        self.selectionType = "3";

        onSelectionTypeChanged();

        // SELECT INPUT TAB
        self.isFrozen = !!self.idProject;
        self.projectConfig = new Array();
    };

    function saveWorkflow() {
        if (!self.idWorkflow || __running_wf) return;
        wiApiService.editWorkflow({
            idWorkflow: self.idWorkflow,
            content:self.workflowConfig
        }, function(workflow) {
            console.log('save workflow', workflow);
        });
    }
    this.saveWorkflow = _.debounce(saveWorkflow, 3000);

    $scope.$on('wizard:stepChanged', function (event, args) {
        self.filterText = '';
        switch (args.index) {
            case 0:
                __inputChanged.status = false;
                __inputChanged.index.length = 0;
                break;

            case 2:
                if (__inputChanged.status && __inputDataLen) {
                    console.log("inputs in step " + __inputChanged.index + " has changed! Must be refresh!");
                    __inputChanged.index.forEach(item => {
                        let step = self.workflowConfig.steps[item];
                        step.inputData.forEach(child => {
                            child.inputs.forEach((ipt, idx) => {
                                ipt.choices = matchCurves(child.dataset.curves, step.inputs[idx]);
                                ipt.value = ipt.choices.length ? ipt.choices[0] : null;
                            })
                        })
                    });
                }
                self.saveWorkflow();
                break;
        }
    });

    this.onClick = function ($index, $event, node) {
        self.selectionList.forEach(function (item) {
            item.data.selected = false;
        });
        node.data.selected = true;
    };
    let __familyList;
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
            case FAMILY_GROUP_SELECTION:
                let temp = utils.getListFamily();
                let groups = new Set();
                if (temp) {
                    temp.forEach(t => {
                        groups.add(t.familyGroup);
                    });
                    $timeout(function () {
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
                    });
                } else {
                    wiApiService.listFamily(function (temp) {
                        temp.forEach(t => {
                            groups.add(t.familyGroup);
                        });
                        $timeout(function () {
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
                        });
                    })
                }

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
            __inputChanged.status = true;
            let tmp = new Set(__inputChanged.index);
            tmp.add(parentIdx);
            __inputChanged.index = Array.from(tmp);
            self.saveWorkflow();
        } else {
            toastr.error("please select data type!");
        }
    };

    this.onDeleteInput = function (idx) {
        for (let wf of self.workflowConfig.steps) {
            wf.inputData.splice(idx, 1);
            wf.outputData.splice(idx, 1);
        }
        __inputDataLen--;
    };
    this.upTrigger = function (cb) {
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
    this.downTrigger = function (cb) {
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
    this.onFilterEnterKey = function (filterText) {
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
                    if (familyList) {
                        let group = familyList.find(
                            f => {
                                if (cModel.properties) return f.idFamily == cModel.properties.idFamily;
                                return f.idFamily == cModel.idFamily;
                            }
                        );
                        return group
                            ? matchCriterion.value == group.familyGroup
                            : false;
                    }
                });
            case FAMILY_SELECTION:
                return curves.filter(function (cModel) {
                    if (cModel.properties) return matchCriterion.value == cModel.properties.idFamily;
                    return matchCriterion.value == cModel.idFamily;
                });
            case CURVE_SELECTION:
                return curves.filter(function (cModel) {
                    if (cModel.properties) return matchCriterion.value == cModel.properties.name;
                    return matchCriterion.value == cModel.name;
                });
        }
        return [];
    }
    function updateChoices(newCurveProps) {
        for (let step of self.workflowConfig.steps) {
            for (let iptData of step.inputData) {
                let dataset = iptData.dataset;
                let idx = dataset.curves.findIndex(c => {
                    let id = c.properties ? c.properties.idCurve : c.idCurve;
                    return id == newCurveProps.idCurve;
                });
                if (idx < 0) dataset.curves.push(newCurveProps);
                for (let inputIdx in iptData.inputs) {
                    iptData.inputs[inputIdx].choices = matchCurves(dataset.curves, step.inputs[inputIdx]);
                }
            }
        }
    }
    this.droppableSetting = function () {
        $("wi-workflow-player .wi-droppable").droppable({
            drop: function (event, ui) {
                let w = $(this.parentElement).width();
                $(this.parentElement).css('width', w);
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
                if (!options.result) {
                    toastr.error("Dataset doesn't not exist");
                    return;
                }
                let datasetModel = options.result;

                let idWell = datasetModel.properties.idWell;
                let wellModel = self.projectConfig.find(
                    well => well.id == idWell
                );
                let wellName = wellModel.properties.name;

                for (let wf of self.workflowConfig.steps) {
                    if (!wf.inputData || !Array.isArray(wf.inputData))
                        wf.inputData = new Array();
                    let existDataset = wf.inputData.find(
                        i => i.dataset.idDataset == datasetModel.properties.idDataset
                    );
                    if (existDataset) return;
                    let inputItems = wf.inputs.map(function (ipt) {
                        let tempItem = {
                            name: ipt.name,
                            choices: matchCurves(datasetModel.properties.curves, ipt)
                        };
                        tempItem.value = tempItem.choices.length
                            ? tempItem.choices[0]
                            : null;
                        return tempItem;
                    });
                    let _well = angular.copy(wellModel.properties);
                    delete _well.well_headers;
                    _well.well_headers = undefined;
                    let input = {
                        well: _well,
                        dataset: datasetModel.properties,
                        inputs: inputItems,
                        parameters: angular.copy(wf.parameters)
                    };
                    $timeout(() => {
                        wf.inputData.push(input);
                        __inputDataLen = wf.inputData.length;
                        self.saveWorkflow();
                    });
                }
                $timeout( function() {
                    self.wiDroppableHeight = $("wi-workflow-player .wi-droppable>div").height() + 6;
                });
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
        if (!self.workflowConfig || !self.workflowConfig.steps)
            return false;

        for (let step of self.workflowConfig.steps) {
            if (!step.disabled) {
                for (let input of step.inputs) {
                    if (!input.value) return false;
                }
            }
        }
        return true;
    };

    function saveCurve(curveInfo, callback) {
        console.log('save curve', curveInfo);
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

    function createLogplotFromResult(wfInput, wfOutput, callback) {
        let payload = {
            idWell: wfOutput.idWell,
            name: wfOutput.plotName,
            override: true
        };

        wiApiService.post(wiApiService.CREATE_PLOT, payload, (response, err) => {
            wfOutput.idPlot = response.idPlot;
            let currentOrderNum = 'm';
            async.eachSeries(wfInput.inputs, function(ipt, done1) {
                wiApiService.createLogTrack(response.idPlot, currentOrderNum, function (trackData) {
                    //create line
                    wiApiService.createLine({
                        idTrack: trackData.idTrack,
                        idCurve: ipt.value.properties ? ipt.value.properties.idCurve : ipt.value.idCurve,
                        orderNum: currentOrderNum
                    }, function(line){
                        currentOrderNum = String.fromCharCode(currentOrderNum.charCodeAt(0) + 1);
                        done1();
                    })
                }, {
                        title: ipt.name
                });
            }, function (err) {
                if (err) toastr.error(err);
                async.eachSeries(wfOutput.outputCurves, (opt, done2) => {
                    wiApiService.createLogTrack(response.idPlot, currentOrderNum, function (trackData) {
                        // create line
                        currentOrderNum = String.fromCharCode(currentOrderNum.charCodeAt(0) + 1);
                        wiApiService.createLine({
                            idTrack: trackData.idTrack,
                            idCurve: opt.idCurve,
                            orderNum: 'm'
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
                    }, {
                            title: opt.name
                        })
                }, function (err) {
                    if (err) toastr.error(err);
                    callback();
                })
            })
        })
    }

    this.runWorkflow = runWorkflow;
    this.safeRunWorkflow = safeRunWorkflow;
    function safeRunWorkflow(wf) {
        if(__running_wf) return;
        if (wf.inputData && wf.inputData.length) {
            __running_wf = true;
            runWorkflow(wf, function() {
                __running_wf = false;
                utils.refreshProjectState();
                self.saveWorkflow();
                console.log("done!", wf.outputData);
            });
        }
    }
    function runWorkflow(wf, finCallback) {
        let run = petrophysics[wf.function];
        if (!wf.outputData || !Array.isArray(wf.outputData)) {
            wf.outputData = new Array();
        }
        // Loop each dataset
        async.eachOf(wf.inputData, function(data, idx, callback) {
            let curvesData = [];
            // loop each input curves
            async.eachSeries(data.inputs, function(curve, cb) {
                if(curve.choices && curve.choices.length){
                    if(!curve.value) curve.value = curve.choices[0];
                    let idCurve = (curve.value.properties || {}).idCurve || curve.value.idCurve;
                    wiApiService.dataCurve(idCurve, function (data) {
                        curvesData.push(data.map(d => parseFloat(d.x)));
                        cb();
                    });
                }else{
                    cb('no choices');
                }
            }, function(err) {
                // done get all curves
                if (err) {
                    console.log(err);
                    callback(err);
                }else{
                    run(curvesData, wf.parameters, function (ret) {
                        wf.outputData[idx] = new Object();
                        wf.outputData[idx].idWell = wf.inputData[idx].well.idWell;
                        wf.outputData[idx].plotName = self.workflowConfig.name + '-' + wf.name + '-' + wf.inputData[idx].dataset.name;
                        wf.outputData[idx].outputCurves = new Array();
                        wf.outputs.forEach((o, i) => {
                            wf.outputData[idx].outputCurves[i] = o;
                            wf.outputData[idx].outputCurves[i].data = ret[i];
                        });
                        async.each(wf.outputData[idx].outputCurves, function(d, cb2) {
                            let dataset = data.dataset;
                            d.idDataset = dataset.idDataset;
                            d.idWell = data.well.idWell;
                            console.log(d);
                            saveCurve(d, function(curveProps) {
                                delete d.data;
                                updateChoices(curveProps);
                                cb2();
                            });
                        }, function(err) {
                            createLogplotFromResult(wf.inputData[idx], wf.outputData[idx], callback);
                        });
                    });
                }
            });
        }, function(err) {
            if (err) console.log(err);
            //refreshProject();
            if (finCallback) finCallback();
        });
    }

    this.finishWizard = function () {
        console.log("Finish him!", self.workflowConfig);
        __running_wf = true;
        async.eachOfSeries(self.workflowConfig.steps, function(step, idx, done){
            if( step.disabled ) {
                async.setImmediate(done);
                return;
            }
            runWorkflow(step, done);
        }, function(err) {
            if (err) toastr.error(err);
            console.log('finish');
            __running_wf = false;
            utils.refreshProjectState();
            self.saveWorkflow();
        });
    }
    this.rightWidth = function() {
        return $($('wi-workflow')[0].parentNode).width() *2 /3;
    }
    this.openPlot = function(plot){
        let layout = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
        layout.putTabRightWithModel({
            id: plot.idPlot,
            type: 'logplot',
            properties: {
                idPlot: plot.idPlot,
                name: plot.plotName,
                idWell: plot.idWell
            }
        });
    }
    this.removePlot = function(outputData) {
        delete outputData.idPlot;
        delete outputData.plotName;
        self.saveWorkflow();
    }
    this.running = function() {
        return __running_wf;
    }
    this.createSpinner = function() {
        $timeout( () => {
            document.getElementById("workflow-" + self.idWorkflow + "-spinner").appendChild((new Spinner()).spin().el);
        }, 700);
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
        idWorkflow: "<"
    }
});

exports.name = moduleName;
