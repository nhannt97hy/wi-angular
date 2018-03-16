const name = "wiWorkflowMachineLearning";
const moduleName = "wi-workflow-machine-learning";
const HOST = '54.169.13.92';
const PORT = 3002;
let token = window.localStorage.getItem('token');
let username;
if(token)
    username = JSON.parse(atob(token.split('.')[1])).username;
let petrophysics = require('./petrophysics');

function Controller(wiComponentService, wiMachineLearningApiService, wiApiService, $timeout, $scope, $http) {
    let self = this;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let DialogUtils = wiComponentService.getComponent(
        wiComponentService.DIALOG_UTILS
    );
    this.currentModelType = null;
    
    
    const LINEAR_REGRESSION_PARAMS = [];

    const HUBER_REGRESSOR_PARAMS = [{
        name: 'max_iter', 
        type: 'number', 
        value: 100,
        min: 1
    }, {
        name: "alpha",
        type: 'number',
        value: 0.0001,
        min: 0.0001,
        max: 1,
        step: 0.0001
    }, {
        name: "data_min",
        type: 'number',
        value: 0
    }, {
        name: "data_max",
        type: 'number',
        value: 1
    }, {
        name: "target_min",
        type: 'number',
        value: 0
    }, {
        name: "target_max",
        type: 'number',
        value: 1
    }];

    const LASSOS_PARAMS = [{
        name: 'max_iter', 
        type: 'number', 
        value: 1000
    }, {
        name: "alpha",
        type: 'number',
        value: 1,
        step: 0.1
    }, {
        name: "data_min",
        type: 'number',
        value: 0
    }, {
        name: "data_max",
        type: 'number',
        value: 1
    }, {
        name: "target_min",
        type: 'number',
        value: 0
    }, {
        name: "target_max",
        type: 'number',
        value: 1
    }];

    const DECISION_TREE_PARAMS = [{
        name: 'max_features', 
        type: 'select', 
        value: 1,
        choices: [{
            name: 'log2',
            value: 1
        }, {
            name: 'sqrt',
            value: 2
        }, {
            name: 'auto',
            value: 3
        }, {
            name: 'None',
            value: 4
        }]
    }, {
        name: "data_min",
        type: 'number',
        value: 0
    }, {
        name: "data_max",
        type: 'number',
        value: 1
    }, {
        name: "target_min",
        type: 'number',
        value: 0
    }, {
        name: "target_max",
        type: 'number',
        value: 1
    }];

    const RANDOM_FOREST_REGRESSOR_PARAMS = [{
        name: 'max_features', 
        type: 'select', 
        value: 1,
        choices: [{
            name: 'log2',
            value: 1
        }, {
            name: 'sqrt',
            value: 2
        }, {
            name: 'auto',
            value: 3
        }, {
            name: 'None',
            value: 4
        }]
    }, {
        name: "n_estimators",
        type: 'number',
        value: 10
    }, {
        name: "data_min",
        type: 'number',
        value: 0
    }, {
        name: "data_max",
        type: 'number',
        value: 1
    }, {
        name: "target_min",
        type: 'number',
        value: 0
    }, {
        name: "target_max",
        type: 'number',
        value: 1
    }];

    const SUPPORT_VECTOR_MACHINE_PARAMS = [{
        name: 'kernel', 
        type: 'select', 
        value: 1,
        choices: [{
            name: 'rbf',
            value: 1
        }, {
            name: 'linear',
            value: 2
        }, {
            name: 'poly',
            value: 3
        }, {
            name: 'sigmoid',
            value: 4
        }]
    }, {
        name: "gamma",
        type: 'number',
        value: 10,
        nullValue: 'auto',
        step: 0.1
    }, {
        name: "C",
        type: 'number',
        value: 0.1,
        step: 0.1
    }, {
        name: "data_min",
        type: 'number',
        value: 0
    }, {
        name: "data_max",
        type: 'number',
        value: 1
    }, {
        name: "target_min",
        type: 'number',
        value: 0
    }, {
        name: "target_max",
        type: 'number',
        value: 1
    }];

    const MULTIPERCEPTRON_PARAMS = [{
        name: 'activation',
        type: 'select',
        value: 1,
        choices: [{
            name: 'Sigmoid',
            value: 1
        }, {
            name: 'Tanh',
            value: 2
        }]
    },{
        name: "data_min",
        type: 'number',
        value: 0
    }, {
        name: "data_max",
        type: 'number',
        value: 1
    }, {
        name: "target_min",
        type: 'number',
        value: 0
    }, {
        name: "target_max",
        type: 'number',
        value: 1
    }, {
        name: 'Neuron Network Structure',
        type: 'nnconfig',
        value: {
            nLayer: 3,
            layerConfig: [{
                name: "layer 0",
                value:1
            }, {
                name: "layer 1",
                value:2
            },{
                name: "layer 2",
                value:3
            }]
        }
    },];

    const CONJUGATE_GRADIENT_PARAMS = [{
        name: 'activation',
        type: 'select',
        value: 1,
        choices: [{
            name: 'Sigmoid',
            value: 1
        }, {
            name: 'Tanh',
            value: 2
        }]
    },{
        name: "data_min",
        type: 'number',
        value: 0
    }, {
        name: "data_max",
        type: 'number',
        value: 1
    }, {
        name: "target_min",
        type: 'number',
        value: 0
    }, {
        name: "target_max",
        type: 'number',
        value: 1
    },{
        name: 'Neuron Network Structure',
        type: 'nnconfig',
        value: {
            nLayer: 3,
            layerConfig: [{
                name: "layer 0",
                value:1
            }, {
                name: "layer 1",
                value:2
            },{
                name: "layer 2",
                value:3
            }]
        }
    }];

    this.workflowConfig = {
        name: "MachineLearning",
        model: {
            modelType: {
                name: 'model type',
                type: 'select',
                value: 1,
                choices: [{
                    name: "LinearRegression",
                    value: 1,
                    parameters: LINEAR_REGRESSION_PARAMS
                }, {
                    name: "HuberRegressor",
                    value: 2,
                    parameters: HUBER_REGRESSOR_PARAMS
                }, {
                    name: "Lassos",
                    value: 3,
                    parameters: LASSOS_PARAMS
                }, {
                    name: "DecisionTreeRegressor",
                    value: 4,
                    parameters: DECISION_TREE_PARAMS
                }, {
                    name: "RandomForestRegressor",
                    value: 5,
                    parameters: RANDOM_FOREST_REGRESSOR_PARAMS
                }, {
                    name: "SupportVectorMachine",
                    value: 6,
                    parameters: SUPPORT_VECTOR_MACHINE_PARAMS
                }, {
                    name: "MultiPerceptron",
                    value: 7,
                    parameters: MULTIPERCEPTRON_PARAMS
                }, {
                    name: "ConjugateGradient",
                    value: 8,
                    parameters: CONJUGATE_GRADIENT_PARAMS
                }] 
            },
            inputs: [{name: "curve input"}, {name:'curve input'}, {name: 'curve output'}]
        },
        steps: [
            {
                name: "Training",
                inputs: [{ name: "Curve input" }, { name: "Curve output" }],
                parameters: [],
                outputs: [],
                function: train
            },
            {
                name: "Verify",
                inputs: [{ name: "Curve input" }, { name: "Curve verify" }],
                parameters: [],
                outputs: [],
                function: verify
            },
            {
                name: "Predict",
                inputs: [{ name: "Curve input" }],
                parameters: [],
                outputs: [],
                function: predict
            }
        ]
    };



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

    this.nnConfig = {inputs: [{name: "a0"},{name: "a0"},{name: "a0"}], outputs:[{name: "a0"}], layers: [2,2]};

    function updateNNConfig() {
        if (!self.currentModelType) {
            self.nnConfig = {inputs: [{name: "a0"},{name: "a0"},{name: "a0"}], outputs:[{name: "a0"}], layers: [2,2]};
            return;
        }
        if (!self.currentModelType.parameters.length) {
            self.nnConfig = {inputs: [{name: "a0"},{name: "a0"},{name: "a0"}], outputs:[{name: "a0"}], layers: [2,2]};
            return;
        }
        let config = self.currentModelType.parameters[self.currentModelType.parameters.length -1];
        if (config.type != 'nnconfig') {
            self.nnConfig = {inputs: [{name: "a0"},{name: "a0"},{name: "a0"}], outputs:[{name: "a0"}], layers: [2,2]};
            return;
        }
        self.nnConfig.inputs = [{name: "a0"},{name: "a0"},{name: "a0"}];
        self.nnConfig.outputs = [{name: "a0"}];
        self.nnConfig.layers = config.value.layerConfig.map(function(item){
            return item.value;
        });
        $timeout( function() {
            self.wiNNCtrl.update(self.nnConfig);
        });
    }
    this.updateNNConfig = _.debounce(updateNNConfig, 1000);    
    
    this.$onInit = function () {
        if (self.name) wiComponentService.putComponent(self.name, self);
        // CONFIGURE INPUT TAB
        self.selectionType = "1";

        onSelectionTypeChanged();

        // SELECT INPUT TAB
        self.isFrozen = !!self.idProject;
        self.projectConfig = new Array();
    };

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
                    })
                }
                break;
        }
    })

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
            item.value = __SELECTED_NODE.id > 0 ? __SELECTED_NODE.id : item.label;
            item.type = self.selectionType;
            __inputChanged.status = true;
            let tmp = new Set(__inputChanged.index);
            tmp.add(parentIdx);
            __inputChanged.index = Array.from(tmp);
        } else {
            toastr.error("please select data type!");
        }
    };

    this.onDeleteInput = function (idx) {
        for (let wf of self.workflowConfig.steps) {
            wf.inputData.splice(idx, 1);
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
    this.getListModel = function(){
        wiMachineLearningApiService.listModel(function(res){
            console.log('list: ', res);
            if(res.statusCode != 200)
                toastr.error(res.content);
            else {
                self.listModel = res.content;
                self.modelVerify = self.modelPredict = self.modelRetrain = self.listModel[0];
            }
        });
    };
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
    this.droppableSetting = function (wf) {
        let id = wf.name;
        $("wi-workflow-machine-learning #" + id).droppable({
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
                    __inputDataLen = wf.inputData.length;
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
        getFamilyList(familyList => {
            let payload = {
                data: curveInfo.data,
                idDataset: curveInfo.idDataset,
                idFamily: familyList.find(f => f.data.label == curveInfo.family).id
            }
            let curve = curveList.find(c => c.name == curveInfo.name);
            if (curve) {
                payload.idDesCurve = curve.idCurve;
                curveInfo.idCurve = curve.idCurve;
            } else {
                payload.curveName = curveInfo.name
            }
            wiApiService.processingDataCurve(payload, function (ret) {
                if(!curve) curveInfo.idCurve = ret.idCurve;
                callback();
            })
        });
    }

    function createLogplotFromResult(wfInput, wfOutput, callback) {
        let payload = {
            idWell: wfOutput.idWell,
            name: wfOutput.plotName
        };

        wiApiService.post(wiApiService.CREATE_PLOT, payload, (response, err) => {
            wfOutput.idPlot = response.idPlot;
            let currentOrderNum = 'a';
            async.eachSeries(wfInput.inputs, (ipt, done1) => {
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
                async.eachSeries(wfOutput, (opt, done2) => {
                    wiApiService.createLogTrack(response.idPlot, currentOrderNum, function (trackData) {
                        // create line
                        wiApiService.createLine({
                            idTrack: trackData.idTrack,
                            idCurve: opt.idCurve,
                            orderNum: currentOrderNum
                        }, function(line){
                            currentOrderNum = String.fromCharCode(currentOrderNum.charCodeAt(0) + 1);
                            done2();
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
                        wf.outputData[idx] = new Array();
                        wf.outputData[idx].idWell = wf.inputData[idx].well.idWell;
                        wf.outputData[idx].plotName = self.workflowConfig.name + wf.name + wf.inputData[idx].dataset.name;
                        wf.outputs.forEach((o, i) => {
                            wf.outputData[idx][i] = o;
                            wf.outputData[idx][i].data = ret[i];
                        })
                        async.each(wf.outputData[idx], (d, cb2) => {
                            let dataset = data.dataset;
                            d.idDataset = dataset.idDataset;
                            saveCurve(dataset.curves, d, cb2);
                        }, (err) => {
                            console.log("save curves done");
                            createLogplotFromResult(wf.inputData[idx], wf.outputData[idx], callback);
                            // callback();
                        })
                    })
                })
            }, (err) => {
                if (err) console.log(err);
                refreshProject();
                utils.refreshProjectState();
                console.log("done!", wf.outputData);
            }
            )
        }
    }

    this.finishWizard = function () {
        console.log("Finish him!");
    }
    this.addCurveInput = function(){
        self.workflowConfig.steps.forEach(function(step){
            step.inputs.unshift({name: "Curve input"});
        });
    }
    this.removeCurveInput = function(){
        let i = self.workflowConfig.steps[0].inputs.length;
        if(i==2)
            toastr.error('Need least at 1 curve input', '');
        else{
            self.workflowConfig.steps.forEach(function(step){
                step.inputs.splice(0, 1);
            });
        }
    }
    this.isCurveOutput = function(wf, i){
        if(wf.name=='Predict')
            return false;
        if(i==wf.inputs.length-1)
            return true;
        return false;
    }
    this.removeWell = function(wf, i){
        wf.inputData.splice(i, 1);
    }
    
    let listCurves = [];
    function getDataCurves(k, callback){
        listCurves = [];
        // console.log(self.workflowConfig);
        let inputData = self.workflowConfig.steps[k].inputData;
        if(inputData){
            let listInputData = [];
            inputData.forEach(function(data){
                let checkFullCurve = true;
                for(let j =0 ; j<data.inputs.length; j++){
                    if(!data.inputs[j].value){
                        checkFullCurve = false;
                        break;
                    }
                }
                if(checkFullCurve)
                listInputData.push(data.inputs);
            });
            for(let i =0; i< inputData[0].inputs.length; i++){
                listCurves[i] = [];
            }
            listInputData.forEach(function(input_data, i){
                let j=-1;
                async.each(input_data, function(curve,__end){
                    wiApiService.dataCurve(curve.value.id, function(data){
                        j++;
                        data.forEach(function(point){
                            listCurves[j].push(parseFloat(point.x));
                        });
                        __end();
                    });
                }, function(err){
                    if(i==listInputData.length-1){
                        // if(k!=0)
                        //     listCurves.splice(listCurves.length-1, 1);
                        // console.log(listCurves);
                        callback(listCurves);
                    }
                });
            });
        }else {
            toastr.error('Choose a dataset', '');
        }
    }
    function filterNull(curves){
        let l = curves.length;
        let filterCurves = [];
        for(let j = 0; j<l; j++){
            filterCurves[j] = [];
        }
        for(let i = 0; i<curves[0].length; i++){
            let checkNull = true;
            for(let j=0; j<l; j++)
                if(isNaN(curves[j][i]))
                    checkNull = false;
            if(checkNull)
                for(let j = 0; j<l; j++){
                    filterCurves[j].push(curves[j][i]);
                }
        }
        // console.log('result of filterNull: ', filterCurves);
        return filterCurves;
    }
    function train(){
        getDataCurves(0, function(list_curves){
            let curves = filterNull(list_curves);
            let payload = {
                name: self.nameModel,
                type: self.currentModelType.name,
                data: [],
                target: [],
                description: self.description,
                user_created: username,
                params: {
                    data_scale: self.data_scale,
                    target_scale: self.target_scale,
                    max_iter: self.max_iter,
                    alpha: self.alpha,
                    max_features: self.max_features,
                    kernel: self.kernel,
                    gamma: (self.gammaAuto==true)?"auto":self.gamma,
                    C: self.C,
                    n_estimators: self.n_estimators,
                    layers: self.hiddenLayer,
                    activation: self.activation
                }
            };
            for(let i=0; i<curves.length-1; i++)
                payload.data.push(curves[i]);
            curves[curves.length-1].forEach(function(x){
                payload.target.push(x);
            });
            wiComponentService.getComponent('SPINNER').show();   
            wiMachineLearningApiService.trainModel(payload, function(res){
                wiComponentService.getComponent('SPINNER').hide();   
                if(res.statusCode == 200){
                    console.log(res);
                    self.model_id_last_train = res.model_id;
                    toastr.success('Train model success!', '');
                }else{
                    toastr.error(res.content, '');
                }
            });    
        });
    };
    function verify(){
        getDataCurves(1, function(list_curves){
            let temp =[];
            for(let i=0; i<list_curves.length-1;i++)
                temp.push(list_curves[i]);
            let curves = filterNull(temp);
            let payload = {
                model_id: self.modelVerify.id,
                data: []
            };
            if(!self.workflowConfig.steps[0].disabled)
                payload.model_id = self.model_id_last_train;
            curves.forEach(function(curve){
                payload.data.push(curve);
            });
            // console.log("data-verify:", payload.data);
            wiComponentService.getComponent('SPINNER').show();  
            wiMachineLearningApiService.predict(payload, function(res){
                wiComponentService.getComponent('SPINNER').hide();
                console.log(res);
                if(res.statusCode ==200){
                    toastr.success('Verify success!', '');
                    let target = [];
                    res.content.forEach(function(x){
                        target.push(x);
                    });
                    for(let i = 0; i<list_curves[0].length; i++)
                    {
                        let checkNull = true;
                        for(let j=0; j< list_curves.length-1; j++)
                            if(isNaN(list_curves[j][i])){
                                checkNull = false;
                                break;
                            }
                        if(!checkNull)
                            target.splice(i,0,NaN);
                    }
                    console.log('result of verify: ', target);
                    console.log('verify curve: ', list_curves[list_curves.length-1]);
                }else{
                    toastr.error(res.content, '');
                }
            });
        });
    };
    function predict(){
        getDataCurves(2, function(list_curves){
            let curves = filterNull(list_curves);
            let payload = {
                model_id: self.modelPredict.id,
                data: curves
            };
            console.log('data predict: ', payload.data);
            if(!self.workflowConfig.steps[0].disabled)
                payload.model_id = self.model_id_last_train;
            wiComponentService.getComponent('SPINNER').show(); 
            wiMachineLearningApiService.predict(payload, function(res){
                wiComponentService.getComponent('SPINNER').hide();
                if(res.statusCode == 200){
                    toastr.success('Predict observation success!', '');
                    let target = [];
                    res.content.forEach(function(x){
                        target.push(x);
                    });
                    for(let i = 0; i<list_curves[0].length; i++)
                    {
                        let checkNull = true;
                        for(let j=0; j< list_curves.length; j++)
                            if(isNaN(list_curves[j][i])){
                                checkNull = false;
                                break;
                            }
                        if(!checkNull)
                            target.splice(i,0,NaN);
                    }
                    console.log('target of predict after fill null: ', target);
                }else{
                    toastr.error(res.content, '');
                }
            });
        });
    };
    
    this.listKernel = ["rbf", "linear", "poly", "sigmoid"];
    this.kernel = this.listKernel[0];
    this.listActivation = ["Tanh", "Sigmoid"];
    this.activation = this.listActivation[0];
    this.nameModel = "New Model";
    this.max_iter = 100;
    this.alpha = 0.0001;
    this.C = 0.1;this.gamma = 0.1;
    this.listFeatures = ['auto', 'sqrt', 'log2'];
    this.max_features = self.listFeatures[0];
    this.n_estimators = 10;
    this.data_scale = [0,1];
    this.target_scale = [0,1];
    this.nLayers = this.nNodes = 1;
    this.description = 'description';
    this.inputCurves = [];this.outputCurves = [];
    self.hiddenLayer = [4,4,4,4];
    this.change = function(){
        self.inputCurves = [];
        self.outputCurves = [];
        let leng = self.workflowConfig.steps[0].inputs.length;
        for(let i=0; i<leng-1; i++)
        self.inputCurves.push({name: self.workflowConfig.steps[0].inputs[i].value});
        self.outputCurves.push({name: self.workflowConfig.steps[0].inputs[leng-1].value});
    }
    this.addHiddenLayerButtonClicked = function () {
        self.hiddenLayer.push(2);
        self.hiddenLayer = angular.copy(self.hiddenLayer);
    }
    this.removeHiddenLayerButtonClicked = function () {
        if(self.hiddenLayer.length>1){
            self.hiddenLayer.pop();
            self.hiddenLayer = angular.copy(self.hiddenLayer);
        }
    }
    this.refreshInputData = function(){
        self.workflowConfig.steps.forEach(function(step){
            step.inputData = [];
        });
    }
    this.hideConfig = function(wf){
        if(wf.name=="Training"){
            return wf.disabled;
        }else
            return !self.workflowConfig.steps[0].disabled;
    }
    this.style = {
        "flex": "1"
    };
    this.removeNode = function(i){
        if(self.hiddenLayer[i]>=2)
        self.hiddenLayer[i] --;
        self.hiddenLayer = angular.copy(self.hiddenLayer);
        console.log(self.hiddenLayer);
    }
    this.addNode = function(i){
        self.hiddenLayer[i]++;
        self.hiddenLayer = angular.copy(self.hiddenLayer);
        console.log(self.hiddenLayer);
    }

    this.onModelTypeListInit = function(wiItemDropdownCtrl) {
        console.log('model type list init');
        wiItemDropdownCtrl.items = self.workflowConfig.model.modelType.choices.map(function(choice) {
            return {
                data: {label: choice.name},
                properties: choice
            }
        });
        wiItemDropdownCtrl.selectedItem = wiItemDropdownCtrl.items[0];
        self.currentModelType = wiItemDropdownCtrl.selectedItem.properties;
    }
    this.onModelTypeChanged = function(type) {
        self.currentModelType = type;
        self.updateNNConfig();
    }
    this.nnConfigNLayerChanged = function(nnConfig) {
        if (nnConfig.nLayer < nnConfig.layerConfig.length) {
            nnConfig.layerConfig.splice(nnConfig.nLayer, nnConfig.layerConfig.length - nnConfig.nLayer);
        }
        else {
            let oldLength = nnConfig.layerConfig.length;
            for (let i = 0; i < nnConfig.nLayer - oldLength; i++) {
                nnConfig.layerConfig.push({
                    name: "layer " + (oldLength + i),
                    value: 3
                });
            }
        }
    }
}

let app = angular.module(moduleName, []);

app.component(name, {
    templateUrl: "wi-workflow-machine-learning.html",
    controller: Controller,
    controllerAs: name,
    transclude: true,
    bindings: {
        name: "@",
        idProject: "<"
    }
});

exports.name = moduleName;
