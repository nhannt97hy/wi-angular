let helper = require('./DialogHelper');
module.exports = function (ModalService, wiD3HistogramCtrl, callback, cancelCallback, opt) {
    function ModalController(close, wiComponentService, wiApiService, $timeout) {
        window.modal = this;
        const __selectionLength = 50;
        const __selectionDelta = 10;
        const CURVE_SELECTION = "1";
        const FAMILY_SELECTION = "2";
        const FAMILY_GROUP_SELECTION = "3";
        let self = this;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        //TreeName
        let name = 'wiHistogram' + wiD3HistogramCtrl.wiHistogramCtrl.id;
        this.SelectionTreeName = 'wiHistogramFormatModalSelectionTree';
        this.projectTreeName = 'wiHistogramFormatModalProjectTreeName';
        this.taskDataTreeName = 'wiHistogramFormatModalTaskDataTree';
        let __selectionTop = 0;
        let __dragging = false;
        let __familyList;
        let _histogramModel = utils.getModel('histogram', wiD3HistogramCtrl.wiHistogramCtrl.id);
        this.histogramModelProps = angular.copy(_histogramModel.properties);
        this.config = angular.copy(wiD3HistogramCtrl.config);
        this.curvesProperties = angular.copy(wiD3HistogramCtrl.curvesProperties);
        this.label = angular.copy(wiD3HistogramCtrl.label);
        this.datasetsList = this.curvesProperties.map(cp => {
            return cp.idDataset;
        });
        this.filterText = "";
        this.filterText1 = "";
        this.hideApply = ((opt || {}).hideApply || false);
        this.CURVE_SELECTION = CURVE_SELECTION;
        this.FAMILY_SELECTION = FAMILY_SELECTION;
        this.FAMILY_GROUP_SELECTION = FAMILY_GROUP_SELECTION;
        this.selectionType = "1";
        this.taskConfig = {
            inputs: [
                {
                    name: "X Axis",
                    label: self.label.name,
                    value: self.label.name,
                    type: self.label.type
                }
            ],
            parameters: [
            ],
            outputs: [
            ],
            function: ""
        };

        wiApiService.listFamily(listF => {
            list = listF;
            onSelectionTypeChanged();
        });

        self.idxTab = 0;

        this.getCurrentProjectId = function () {
            if (self.idProject) return self.idProject;
            const openProject = wiComponentService.getComponent(
                wiComponentService.PROJECT_LOADED
            );
            return (openProject || {}).idProject;
        }

        // SELECT INPUT TAB
        self.idProject = self.getCurrentProjectId();
        self.isFrozen = !!self.idProject;
        self.projectConfig = new Array();

        this.onShowTab = function (idx) {
            self.idxTab = idx;
        }

        this.onClick = function ($index, $event, node) {
            self.selectionList.forEach(item => {
                item.data.selected = false;
            });
            node.data.selected = true;
        }

        this.onSelectTemplate = function (idx) {
            const __SELECTED_NODE = self.selectionList.find(d => d.data.selected);
            if (__SELECTED_NODE) {
                let item = self.taskConfig.inputs[idx];
                item.label = __SELECTED_NODE.data.label;
                item.value =
                    __SELECTED_NODE.id > 0 ? __SELECTED_NODE.id : item.label;
                item.type = self.selectionType;
                self.inputChange = true;
            } else {
                toastr.error("please select data type!");
            }
        }

        this.onTabChange = function (index) {
            if (index != 1 || !self.inputChange) return;
            self.config.scale = {};
            self.projectChanged({ idProject: self.idProject });
            self.inputChange = false;
            self.tabChange = true;
        }

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

        this.refreshProject = function () {
            if (!isNaN(self.idProject) && self.idProject > 0) {
                self.projectChanged({ idProject: self.idProject });
            }
        }
        this.getProjectList = function (wiItemDropdownCtrl) {
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

        this.projectChanged = function (projectProps) {
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
                        buildWellList(wells);
                    }
                );
            }
        };
        function draggableSetting(domEle) {
            $timeout(() => {
                domEle.draggable({
                    helper: "clone",
                    start: function (event, ui) {
                        __dragging = true;
                    },
                    stop: function (event, ui) {
                        __dragging = false;
                    },
                    containment: "document",
                    appendTo: document.querySelector("#dragObjElement"),
                    scroll: false
                });
            }, 500);
        }
        this.onPrjReady = function () {
            let domEle = $('#' + self.projectTreeName + ' .wi-parent-node[type="dataset"]');
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
        this.droppableSetting = function () {
            $(".wi-droppable").droppable({
                drop(event, ui) {
                    if (!__dragging) return;
                    // check modal draggable
                    if (ui.draggable[0].className.includes("modal-content")) return;
                    const type = ($(ui.draggable[0]).attr("type"));
                    switch (type) {
                        case 'dataset':
                            const idDataset = parseInt($(ui.draggable[0]).attr("data"));
                            self.getInputData(idDataset, true, self.updateProperties);
                            break;
                    }
                }
            });
        };

        this.getInputData = function (idDataset, drop, callback) {
            let options = new Object();
            for (let node of self.projectConfig) {
                utils.visit(
                    node,
                    (_node, _options) => {
                        if (_node.type == "dataset" && _node.id == idDataset) {
                            if (drop) {
                                _options.result = _node;
                                return true;
                            } else {
                                if (self.datasetsList.indexOf(_node.properties.idDataset) > -1) {
                                    _options.result = _node;
                                    return true;
                                }
                            }
                        }
                        return false;
                    },
                    options
                );
                if (options.found) break;
            }
            // populate data into self.inputArray
            if (!options.result) {
                // toastr.error("Dataset doesn't exist");
                return;
            }
            let datasetModel = options.result;
            let datasetName = datasetModel.properties.name;
            let idWell = datasetModel.properties.idWell;
            let wellModel = self.projectConfig.find(well => well.id == idWell);
            let wellProps = wellModel.properties;
            if (!self.taskConfig.inputData || !Array.isArray(self.taskConfig.inputData)) {
                self.taskConfig.inputData = new Array();
            }
            // let existDataset = self.taskConfig.inputData.find(i => i.idDataset == idDataset);
            // if (existDataset) return;

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
                children: inputItems
            };
            if (input.children.find(c => c.data.value == null)) {
                if (drop) {
                    toastr.error('Dataset does not reach requirement inputs');
                } else {
                    let tmpIpt = self.taskConfig.inputData.find(ipDt => ipDt.idDataset == input.idDataset);
                    let idx = self.taskConfig.inputData.indexOf(tmpIpt);
                    if (idx == -1) return;
                    let d = self.datasetsList.find(idDataset => idDataset == tmpIpt.idDataset);
                    let props = self.curvesProperties.find(cp => cp.idDataset == tmpIpt.idDataset);
                    if (self.curvesProperties[self.curvesProperties.indexOf(props)].flag != 'create') {
                        self.curvesProperties[self.curvesProperties.indexOf(props)].flag = 'delete';
                    } else {
                        self.curvesProperties.splice(self.curvesProperties.indexOf(props), 1);
                    }
                    self.taskConfig.inputData.splice(idx, 1);
                    self.datasetsList.splice(self.datasetsList.indexOf(d), 1);
                }
                return;
            }
            $timeout(() => {
                if (self.datasetsList.indexOf(input.idDataset) == -1 && drop) {
                    input.flag = 'create';
                    input.drop = true;
                    self.datasetsList.push(input.idDataset);
                    self.taskConfig.inputData.push(input);
                } else if (self.datasetsList.indexOf(input.idDataset) != -1) {
                    let tmpIpt = self.taskConfig.inputData.find(ipDt => ipDt.idDataset == input.idDataset);
                    let idx = self.taskConfig.inputData.indexOf(tmpIpt);
                    if (tmpIpt) {
                        input.flag = tmpIpt.flag;
                    } else {
                        input.flag = 'edit';
                    }
                    if (idx != -1) {
                        // if (tmpIpt.flag == 'create' && tmpIpt.drop || tmpIpt.flag == 'edit') {
                        self.taskConfig.inputData[idx] = input;
                        // }
                    } else {
                        self.taskConfig.inputData.push(input);
                    }
                } else {
                    return;
                }
                console.log('trong getInputData');
                if (callback) callback();
            });
        }

        this.updateProperties = function () {
            console.log('sau getInputData');
            let datasets = self.taskConfig.inputData;
            datasets.forEach(set => {
                let curve = set.children[0].data.value.properties;
                let curveProps = {
                    idWell: set.wellProps.idWell,
                    idDataset: set.idDataset,
                    idCurve: curve.idCurve,
                    flag: set.flag
                };

                let lineColor = null;

                if (!curve.family) {
                    wiApiService.infoCurve(curveProps.idCurve, function (info) {
                        if (!self.config.scale.left || self.config.scale.left > info.LineProperty.minScale)
                            self.config.scale.left = info.LineProperty.minScale;
                        if (!self.config.scale.right || self.config.scale.right < info.LineProperty.maxScale)
                            self.config.scale.right = info.LineProperty.maxScale;
                        lineColor = info.LineProperty.lineColor;
                        updateCurveProps(curveProps);
                    });
                } else {
                    if (!self.config.scale.left || self.config.scale.left > curve.family.family_spec[0].minScale)
                        self.config.scale.left = curve.family.family_spec[0].minScale;
                    if (!self.config.scale.right || self.config.scale.right < curve.family.family_spec[0].maxScale)
                        self.config.scale.right = curve.family.family_spec[0].maxScale;
                    lineColor = curve.family.family_spec[0].lineColor;
                    updateCurveProps(curveProps);
                }

                function updateCurveProps (curveProps) {
                    if (curveProps.idCurve) {
                        if (curveProps.flag == 'create') {
                            if (self.curvesProperties.findIndex(cp => {
                                return cp.idDataset == curveProps.idDataset;
                            }) == -1) {
                                curveProps.options = {
                                    plot: 'Bar',
                                    lineColor: lineColor,
                                    showGaussian: false,
                                    showCumulative: true
                                };
                                self.curvesProperties.push(curveProps);
                            } else {
                                let props = self.curvesProperties.find(cp => cp.idDataset == curveProps.idDataset);
                                curveProps.options = props.options;
                                self.curvesProperties[self.curvesProperties.indexOf(props)] = curveProps;
                            }
                            // if (!set.drop) set.flag = 'edit';
                        } else if (curveProps.flag == 'edit') {
                            let props = self.curvesProperties.find(cp => cp.idDataset == curveProps.idDataset);
                            curveProps.options = props.options;
                            self.curvesProperties[self.curvesProperties.indexOf(props)] = curveProps;
                        }
                    }
                    self.histogramModelProps.curvesProperties = self.curvesProperties;
                }
            });
        }

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

        const inputContextMenu = [
            {
                name: "Delete",
                label: "Delete",
                icon: "delete-16x16",
                handler: function () {
                    let selectedNodes = self.taskConfig.inputData.__SELECTED_NODES;
                    selectedNodes.forEach(node => {
                        let idx = self.taskConfig.inputData.findIndex(ip => ip.$index == node.$index);
                        if (idx > -1) {
                            let tmpIpt = self.taskConfig.inputData[idx];
                            let props = self.curvesProperties.find(cp => cp.idDataset == tmpIpt.idDataset);
                            let d = self.datasetsList.find(idDataset => idDataset == tmpIpt.idDataset);
                            self.curvesProperties[self.curvesProperties.indexOf(props)].flag = 'delete';
                            self.taskConfig.inputData.splice(idx, 1);
                            self.datasetsList.splice(self.datasetsList.indexOf(d), 1);
                        }
                    })
                    self.taskConfig.inputData.__SELECTED_NODES = [];
                }
            }
        ];

        this.taskShowContextMenu = function($event, $index, node){
            if(node && node.type == 'dataset'){
                wiComponentService
                .getComponent("ContextMenu")
                .open($event.clientX, $event.clientY, inputContextMenu);
            }
        }

        this.prjClickFunction = function ($index, $event, node) {
            clickFunction($index, $event, node, self.projectConfig);
        };

        this.taskClickFuntion = function ($index, $event, node) {
            if (node && node.type == 'dataset') {
                let rootNode = self.taskConfig.inputData;
                if (!Array.isArray(rootNode.__SELECTED_NODES)) rootNode.__SELECTED_NODES = [];
                if (!$event.ctrlKey) unselectAllNodes(rootNode)
                let selectedNodes = rootNode.__SELECTED_NODES;
                if (!selectedNodes.includes(node)) selectedNodes.push(node);
                rootNode.__SELECTED_NODES = selectedNodes;
                node.data.selected = true;
                node.$index = $index;
            }
        }

        function clickFunction($index, $event, node, rootNode) {
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

        function buildWellList(wells) {
            async.each(wells, function (well, cb) {
                let wellModel = utils.createWellModel(well);
                self.projectConfig.push(wellModel);
                wiApiService.getWell(well.idWell, wellProps => {
                    if (wellProps.datasets && wellProps.datasets.length) {
                        wellModel.children.length = 0;
                        wellProps.datasets.forEach(dataset => {
                            const datasetModel = utils.createDatasetModel(dataset);
                            wellModel.children.push(datasetModel);
                            dataset.curves && dataset.curves.length && dataset.curves.forEach(curve => {
                                datasetModel.children.push(
                                    utils.createCurveModel(curve)
                                );
                            });
                            if (self.taskConfig.inputs[0].label) {
                                self.getInputData(dataset.idDataset);
                                $timeout(() => {
                                    cb();
                                })
                            }
                        });
                    }
                });
            }, function (err) {
                if (err) {
                    console.error(err);
                    return;
                }
                self.updateProperties();
            });
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

        // For configurations
        this.pickColor = function (props) {
            DialogUtils.colorPickerDialog(ModalService, props.options.lineColor, function (colorStr) {
                props.options.lineColor = colorStr;
                if (!props.flag) props.flag = 'edit';
            });
        };

        this.checkLogaStatus = function () {
            if (self.config.loga) {
                self.checkLogaValue(self.config.scale.left, 'scaleLeft');
                self.checkLogaValue(self.config.scale.right, 'scaleRight');
            }
        }
        this.checkLogaValue = function (value, label) {
            if (self.config.loga) {
                switch (label) {
                    case 'scaleLeft':
                        self.config.scale.left = value < 0 ? 0.01 : value;
                        break;
                    case 'scaleRight':
                        self.config.scale.right = value < 0 ? 0.01 : value;
                        break;
                }
                if(Math.ceil(value) <= 0) {
                    $('#' + label).css('box-shadow', '0px 0px 5px red');
                    $timeout(function () {
                    $('#' + label).css('box-shadow', '');
                    }, 255)
                }
            }
        }

        function updateHistogram() {
            if (self.config.loga) {
                if (self.config.scale.left == 0
                    || self.config.scale.right == 0) {
                    self.config.loga = false;
                    toastr.error("Scale can't be 0 in Logarithmic");
                    return;
                }
            }

            if (self.inputChange && !self.tabChange) self.onTabChange(1);

            // self.updateProperties();

            if (self.curvesProperties && self.curvesProperties.length) {
                self.curvesProperties = self.curvesProperties.filter(cp => cp.flag != 'delete');
                let curves = self.curvesProperties.map(cp => { return cp.idCurve; });
                let dataRequest = {
                    idProject: wiD3HistogramCtrl.histogramModel.properties.idProject,
                    idHistogram: wiD3HistogramCtrl.idHistogram,
                    curves: curves,
                    divisions: self.config.numOfDivisions,
                    leftScale: self.config.scale.left,
                    rightScale: self.config.scale.right,
                    loga: self.config.loga,
                    showGrid: self.config.showGrid,
                    // showCumulative: self.config.showCumulative,
                    flipHorizontal: self.config.flipHorizontal,
                    // plot: self.config.plot,
                    plotType: self.config.plotType
                };
                wiApiService.editHistogram(dataRequest, function (hisProps) {
                    wiApiService.getHistogram(hisProps.idHistogram, function (histogram) {
                        async.eachSeries(histogram.curves, function (curve, cb) {
                            let props = self.curvesProperties.find(cp => {
                                return cp.idCurve == curve.idCurve;
                            });
                            props.options.idHistogramCurveSet = curve.histogram_curve_set.idHistogramCurveSet;
                            wiApiService.editHistogramCurveSet(props.options, function (returnData) {
                                curve.histogram_curve_set = curve.options = returnData;
                                cb();
                            });
                        }, function (err) {
                            if (err) {
                                console.error(err);
                                return;
                            }
                            if (histogram.curves[0]) {
                                self.config.showGaussian = histogram.curves[0].histogram_curve_set.showGaussian;
                                self.config.showCumulative = histogram.curves[0].histogram_curve_set.showCumulative;
                                self.config.plot = histogram.curves[0].histogram_curve_set.plot;
                            }
                            self.histogramModelProps = histogram;
                            self.histogramModelProps.curves = self.curves = histogram.curves;
                            self.histogramModelProps.config = self.config;
                            self.histogramModelProps.curvesProperties = self.curvesProperties;
                            self.histogramModelProps.wells = new Object();
                            histogram.curves.forEach(curve => {
                                let w = utils.findWellByCurve(curve.idCurve);
                                let well = {
                                    idWell: w.idWell,
                                    topDepth: w.topDepth,
                                    bottomDepth: w.bottomDepth,
                                    step: w.step
                                };
                                self.histogramModelProps.wells[curve.idCurve] = well;
                            });
                            _histogramModel.properties = self.histogramModelProps; // save change back to the data tree
                            if (callback) callback(self.histogramModelProps);
                        });
                    });
                });
            } else {
                self.histogramModelProps.curves = self.curves = [];
                self.histogramModelProps.config = self.config;
                self.histogramModelProps.curvesProperties = self.curvesProperties;
                self.histogramModelProps.wells = new Object();
                histogram.curves.forEach(curve => {
                    let w = utils.findWellByCurve(curve.idCurve);
                    let well = {
                        idWell: w.idWell,
                        topDepth: w.topDepth,
                        bottomDepth: w.bottomDepth,
                        step: w.step
                    };
                    self.histogramModelProps.wells[curve.idCurve] = well;
                });
                _histogramModel.properties = self.histogramModelProps; // save change back to the data tree
                if (callback) callback(self.histogramModelProps);
            }
        }

        this.onOkButtonClicked = function () {
            updateHistogram();
            close();
        }
        this.onApplyButtonClicked = function () {
            updateHistogram();
        }
        this.onCancelButtonClicked = function () {
            if (cancelCallback) cancelCallback();
            close(null);
        }
    }
    ModalService.showModal({
        templateUrl: "histogram-format-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (ret) {
            helper.removeBackdrop();
            if (!ret) return;
            callback(ret);
        })
    });
};