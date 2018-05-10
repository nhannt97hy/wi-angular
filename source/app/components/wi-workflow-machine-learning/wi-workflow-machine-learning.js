const name = "wiWorkflowMachineLearning";
const moduleName = "wi-workflow-machine-learning";

var __USERINFO = {
    username: null,
    token: null,
    refreshToken: null
};

function Controller(wiComponentService, wiMachineLearningApiService, wiApiService, $timeout, $scope, $http) {
    let self = this;
    window.WFML = this;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let DialogUtils = wiComponentService.getComponent(
        wiComponentService.DIALOG_UTILS
    );
    this.currentModelType = null;

    ////////////////////////////////////////
    const ___PERM_FAM_ID = 574;
    const ___FACIES_FAM_ID = 1198;
    const CROSS_RECURRENCE_PLOT = 'crp';
    const ML_TOOLKIT = 'curve';
    const PERMEABILITY_AI = 'anfis';
    const FACIES_AI = 'facies';
    const PERM_CURVE_NAME = 'PERM_CORE';
    const FACIES_CURVE_NAME = 'DELTAIC_FACIES';
    const TRAIN_STEP_NAME = 'Train';
    const VERIFY_STEP_NAME = 'Verify';
    const PREDICT_STEP_NAME = 'Predict';
    ////////////////////////////////////////

    const LINEAR_REGRESSION_PARAMS = [];

    const HUBER_REGRESSOR_PARAMS = [{
        name: 'max_iter',
        type: 'number',
        value: 100,
        min: 100,
        max: 1000
    }, {
        name: "alpha",
        type: 'number',
        value: 0.0001,
        min: 0.0001,
        max: 1,
        step: 0.0001
    }];

    const LASSO_PARAMS = [{
        name: 'max_iter',
        type: 'number',
        value: 1000,
        min: 100,
        max: 1000
    }, {
        name: "alpha",
        type: 'number',
        //value: 0.1,
        //step: 0.1
        value: 0.0001,
        step: 0.0001,
        min: 0.0001,
        max: 1
    }];

    const DECISION_TREE_PARAMS = [{
        name: 'max_features',
        type: 'select', // or number
        value: {
            name: 'None',
            value: 4
        },
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
    }];

    const RANDOM_FOREST_REGRESSOR_PARAMS = [{
        name: 'max_features',
        type: 'select', // or number
        value: {
            name: 'None',
            value: 4
        },
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
        value: 150,
        min: 10,
        max: 500
    }];

    const SUPPORT_VECTOR_MACHINE_PARAMS = [{
        name: 'kernel',
        type: 'select',
        value: {
            name: 'linear',
            value: 2
        },
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
        value: 0.1,
        step: 0.1,
        max: 1
    }, {
        name: "C",
        type: 'number',
        value: 20,
        step: 0.001,
        min: 0.001,
        max: 100
    }];

    const MULTIPERCEPTRON_PARAMS = [{
        name: 'activation',
        type: 'select',
        value: {
            name: 'relu',
            value: 1
        },
        choices: [{
            name: 'relu',
            value: 1
        }, {
            name: 'tanh',
            value: 2
        }, {
            name: 'logistic',
            value: 3
        }]
    }, {
        name: 'max_iter',
        type: 'number',
        min: 1,
        value: 2000
    }, {
        name: 'learning_rate_init',
        type: 'number',
        value: 0.001,
        step: 0.001
    }, {
        name: 'tol',
        type: 'number',
        value: 0.0003,
        step: 0.0001
    }, {
        name: 'Neuron Network Structure',
        type: 'nnconfig',
        value: {
            nLayer: 3,
            layerConfig: [{
                name: "layer 0",
                value: 100
            }, {
                name: "layer 1",
                value: 100
            }, {
                name: "layer 2",
                value: 100
            }]
        }
    }];

    const CONJUGATE_GRADIENT_PARAMS = [{
        name: 'activation',
        type: 'select',
        value: {
            name: 'relu',
            value: 1
        },
        choices: [{
            name: 'relu',
            value: 1
        }, {
            name: 'tanh',
            value: 2
        }, {
            name: 'logistic',
            value: 3
        }]
    }, {
        name: 'max_iter',
        type: 'number',
        min: 1,
        value: 2000
    }, {
        name: 'learning_rate_init',
        type: 'number',
        value: 0.001,
        step: 0.1
    }, {
        name: 'tol',
        type: 'number',
        value: 0.0003,
        step: 0.0001
    }, {
        name: 'Neuron Network Structure',
        type: 'nnconfig',
        value: {
            nLayer: 3,
            layerConfig: [{
                name: "layer 0",
                value: 100
            }, {
                name: "layer 1",
                value: 100
            }, {
                name: "layer 2",
                value: 100
            }]
        }
    }];

    const CROSS_RECURRENCE_PLOT_PARAMS = [{
        name: 'dim',
        type: 'number',
        min: 2,
        value: 2
    }, {
        name: 'tau',
        type: 'number',
        min: 1,
        value: 2
    }, {
        name: 'lambd',
        type: 'number',
        min: 0,
        value: 2
    }, {
        name: 'curve_number',
        type: 'number',
        min: 1,
        value: 2
    }, {
        name: 'facies_class_number',
        type: 'number',
        min: 0,
        value: 93.1939
    }, {
        name: 'epsilon',
        type: 'number',
        value: 2
    }, {
        name: 'percent',
        type: 'number',
        max: 1,
        value: 2
    }];

    const DECISION_TREE_CLASSIFIER = [{
        name : 'criterion',
        type : 'select',
        choices: [{
            name: 'entropy',
            value: 'entropy'
        }, {
            name: 'gini',
            value: 'gini'
        }]
    }, {
        name: 'min_samples_split',
        type: 'number',
        min: 1,
        value: 5
    },{
        name: "min_impurity_decrease",
        type: 'number',
        min: 0.0001,
        max: 0.9999,
        value: 0.01
    }];

    const KNN = [{
        name: "num_neighbors",
        type: 'number',
        min : 1,
        value: 100
    },{
        name: 'p',
        type: 'number',
        min: 1,
        value: 1
    }];

    const LOGISTIC_REGRESSION = [{
        name: 'C',
        type: 'number',
        min: 1,
        value: 20
    },{
        name: 'max_iter',
        type: 'number',
        min: 1,
        value: 10000
    },{
        name: 'solver',
        type: 'select',
        choices: [{
            name: 'liblinear',
            value: 'liblinear'
        },{
            name: 'newton-cg',
            value: 'newton-cg'
        },{
            name: 'lbfgs',
            value: 'lbfgs'
        },{
            name: 'sag',
            value: 'sag'
        },{
            name: 'saga',
            value: 'saga'
        }]
    }];

    const RANDOM_FOREST_CLASSIFIER = [{
        name: 'num_trees',
        type: 'number',
        min: 1,
        value: 150
    },{
        name: 'criterion',
        type: 'select',
        choices: [{
            name: 'entropy',
            value: 'entropy'
        },{
            name: 'gini',
            value: 'gini'
        }],
        value: {
            name: 'entropy',
            value: 'entropy'
        }
    },{
        name: 'min_samples_split',
        type: 'number',
        min: 1,
        value: 5
    },{
        name: 'min_impurity_decrease',
        type: 'number',
        min: 0.0000001,
        max: 0.9999999,
        value: 0.0003,
        step: 0.0001 
    }];

    const NEURAL_NET_CLASSIFIER = [{
        name: 'algorithmn',
        type: 'select',
        choices: [{
            name: 'backprop',
            value: 'backprop'
        },{
            name: 'evolution',
            value: 'evolution'
        }],
        value: {
            name: 'backprop',
            value: 'backprop'
        }
    },{
        name: 'batch_size',
        type: 'number',
        min: -1,
        value: -1
    },{
        name: 'learning_rate',
        type: 'number',
        min: 0.001,
        value: 0.001
    },{
        name: 'num_epochs',
        type: 'number',
        min: 1,
        value: 10000
    },{
        name: 'optimizer',
        type: 'select',
        choices: [{
            name: 'adamax',
            value: 'adamax'
        },{
            name: 'sgd',
            value: 'sgd'
        },{
            name: 'rmsprop',
            value: 'rmsprop'
        },{
            name: 'adagrad',
            value: 'adagrad'
        },{
            name: 'adadelta',
            value: 'adadelta'
        },{
            name: 'adam',
            value: 'adam'
        },{
            name: 'nadam',
            value: 'nadam'
        }],
        value: {
            name: 'adamax',
            value: 'adamax'
        }
    },{
        name: 'warm_up',
        type: 'select',
        choices: [{
            name: 'true',
            value: true
        },{
            name: 'false',
            value: false
        }],
        value: {
            name: 'true',  
            value: true
        } 
    },{
        name: 'boosting_ops',
        type: 'number',
        min: 0,
        value: 0
    }, {
        name: 'sigma',
        type: 'number',
        min: 0.01,
        value: 0.01,
        step: 0.01
    },{
        name: 'population',
        type: 'number',
        min: 1,
        value: 100
    }];


    this.listModelType = {
        name: 'model type',
        type: 'select',
        //value: 1,
        choices: [{
            name: "LinearRegression",
            value: 1,
            parameters: LINEAR_REGRESSION_PARAMS
        }, {
            name: "HuberRegressor",
            value: 2,
            parameters: HUBER_REGRESSOR_PARAMS
        },{
            name: "NeuralNetClassifier",
            value: 14,
            parameters: NEURAL_NET_CLASSIFIER
        }
        /* {
            name: "Lasso",
            value: 3,
            parameters: LASSO_PARAMS
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
        }, {
            name: "CrossRecurrencePlot",
            value: 9,
            parameters: CROSS_RECURRENCE_PLOT_PARAMS
        }, {
            name: "DecisionTreeClassifier",
            value: 10,
            parameters: DECISION_TREE_CLASSIFIER
        },{
            name: "KNN",
            value: 11,
            parameters: KNN
        },{
            name: "LogisticRegression",
            value: 12,
            parameters: LOGISTIC_REGRESSION
        },{
            name: "RandomForestClassifier",
            value: 13,
            parameters: RANDOM_FOREST_CLASSIFIER
        }*/
        ]
    };

    this.workflowResults = [{
        name: TRAIN_STEP_NAME,
        outputData: []
    }, {
        name: VERIFY_STEP_NAME,
        outputData: []
    }, {
        name: PREDICT_STEP_NAME,
        outputData: []
    }];

    this.safeRunStep = function (wf, cb) {
        __running_wf = true;
        runStep(wf, function () {
            __running_wf = false;
            utils.refreshProjectState();
            self.saveWorkflow();
            if (cb) cb();
        });
    }
    this.runStep = runStep;
    function runStep(wf, cb) {
        switch (wf.name) {
            case TRAIN_STEP_NAME:
                console.log('runstep train');
                train(cb);
                break;
            case VERIFY_STEP_NAME:
                console.log('runstep verify');
                verify(cb);
                break;
            case PREDICT_STEP_NAME:
                console.log('runstep predict');
                predict(cb);
                break;
        };
    }
    let well = [];
    function getDataCurves(step, callback) {
        let listInputCurves = [];
        let inputCurves = [];
        let inputData = step.inputData;
        if (inputData) {
            well = [];
            console.log(inputData);
            async.forEachOfSeries(inputData, function (iptData, idx, _end) {
                let inputSet = iptData;
                listInputCurves[idx] = [];
                let wellName = iptData.well.name;
                async.forEachOfSeries(inputSet.inputs, function (curveInfo, idx1, __end) {
                    listInputCurves[idx][idx1] = [];
                    wiApiService.dataCurve(curveInfo.value.idCurve, function (curveData) {
                        listInputCurves[idx][idx1] = curveData.map(function (d) {
                            if(idx==0) well.push(wellName);
                            return parseFloat(d.x);
                        });
                        __end();
                    });
                }, function (err) {
                    _end();
                });
            }, function (err) {
                callback(listInputCurves);
            })

        } else {
            console.error("inputData is empty !!", inputData);
            toastr.error('Choose dataset');
        }
    }
    function getDataCurvesAndJoin(step, callback) {
        let curveInputs = [];
        let inputData = step.inputData;
        if (inputData) {
            well = [];
            console.log(inputData);
            async.forEachOfSeries(inputData, function (iptData, i, __done) {
                let j = -1;
                let wellName = iptData.well.name;
                async.forEachOfSeries(iptData.inputs, function (curveInfo, idx, __end) {
                    wiApiService.dataCurve(curveInfo.value.idCurve, function (curveData) {
                        j++;
                        if (i == 0) curveInputs[j] = [];
                        curveData.forEach(function (data) {
                            curveInputs[j].push(parseFloat(data.x));
                            if(j==0) well.push(wellName);
                        });
                        __end();
                    });
                }, function (err) {
                    if (err)
                        __done(err);
                    __done();
                });
            }, function (err) {
                callback(curveInputs);
            });
        } else {
            toastr.error('Choose a dataset', '');
        }
    }
    function filterNull(curves) {
        let WELL = [];
        let l = curves.length;
        let filterCurves = [];
        let fillNull = [];
        for (let j = 0; j < l; j++) {
            filterCurves[j] = [];
        }
        for (let i = 0; i < curves[0].length; i++) {
            let checkNull = true;
            for (let j = 0; j < l; j++)
                if (isNaN(curves[j][i])) {
                    fillNull.push(i);
                    checkNull = false;
                    break;
                }
            if (checkNull)
                for (let j = 0; j < l; j++) {
                    if(j==0) WELL.push(well[i]);
                    filterCurves[j].push(curves[j][i]);
                }
        }
        return {
            filterCurves: filterCurves,
            fillNull: fillNull,
            well: WELL
        };
    }
    function fillNullInCurve(fillArr, curve) {
        for (let i in fillArr)
            curve.splice(fillArr[i], 0, NaN);
    }
    function shortName(name) {
        const __names = {
            LinearRegression: "LR",
            HuberRegressor: "HR",
            Lasso: "LS",
            DecisionTreeRegressor: "DT",
            RandomForestRegressor: "RF",
            MultiPerceptron: "MP",
            ConjugateGradient: "CG",
            SupportVectorMachine: "SVM"
        };
        return __names[name];
    }
    function genModelId() {
        return __USERINFO.username + '-idWorkflow:' + self.idWorkflow;
    }
    function outputCurveName() {
        let modelType = self.workflowConfig.model.type;
        switch (modelType) {
            case ML_TOOLKIT:
                let steps = self.workflowConfig.steps;
                let trainingStep = steps[0];
                let trainingCurves = trainingStep.inputData.length ? trainingStep.inputData[0].inputs : '';
                if (trainingCurves == '')
                    return false;
                let lastTrainingInputCurve = trainingCurves[trainingCurves.length - 1];
                return lastTrainingInputCurve.name + "-WF" + self.idWorkflow + '-' + shortName(self.currentModelType.name);
            case PERMEABILITY_AI:
                return 'PERM_CORE-WF' + self.idWorkflow;
            case FACIES_AI:
                return 'DELTAIC_FACIES-WF' + self.idWorkflow;
        }
        return
    }
    function train(cb) {
        let step = self.workflowConfig.steps.filter(function (step) { return step.name == TRAIN_STEP_NAME; })[0];
        getDataCurvesAndJoin(step, function (list_curves) {
            let curves = filterNull(list_curves).filterCurves;
            let target = curves.splice(curves.length - 1, 1)[0];
            let WELL = filterNull(list_curves).well;
            let data = curves;
            let params;
            let payload;
            function getValueParam(name, modelType) {
                let parameters = modelType.parameters;
                let param = parameters.filter(function (param) { return param.name == name; });
                if (param.length) {
                    if (param[0].type == 'number') {
                        console.log(param[0].name, param[0].value);
                        let value = param[0].value;
                        if (value == undefined) {
                            value = param[0].max;
                        }
                        console.log(value);
                        return value;
                    }
                    else if (param[0].type == 'select') {
                        if (Number.isInteger(param[0].value))
                            return param[0].choices[0].name;
                        else
                            return param[0].value.name;
                    }
                    else {
                        let layers = [];
                        if (param[0].value.nLayer == undefined)
                            layers = [100, 100, 100];
                        else
                            param[0].value.layerConfig.forEach(function (layer) { layers.push(layer.value ? layer.value : 100); });
                        return layers;
                    }
                }
            }
            switch (self.workflowConfig.model.type) {
                case ML_TOOLKIT:
                    if (self.currentModelType.name == 'LinearRegression')
                        params = {};
                    else {
                        params = {
                            max_iter: getValueParam('max_iter', self.currentModelType),
                            alpha: getValueParam('alpha', self.currentModelType),
                            max_features: getValueParam('max_features', self.currentModelType) == "None" ? null : getValueParam('max_features', self.currentModelType),
                            kernel: getValueParam('kernel', self.currentModelType),
                            gamma: getValueParam('gamma', self.currentModelType),
                            C: getValueParam('C', self.currentModelType),
                            n_estimators: getValueParam('n_estimators', self.currentModelType),
                            // epochs: getValueParam('epochs', self.currentModelType),
                            learning_rate_init: getValueParam('learning_rate_init', self.currentModelType),
                            tol: getValueParam('tol', self.currentModelType),
                            hidden_layer_sizes: getValueParam('Neuron Network Structure', self.currentModelType),
                            activation: getValueParam('activation', self.currentModelType)
                        }
                    }
                    payload = {
                        model_id: genModelId(),
                        model_type: self.currentModelType.name,
                        params: params,
                        train: {
                            target: target,
                            data: data
                        }
                    };
                    console.log(payload);
                    window.trainData = payload;
                    wiMachineLearningApiService.trainModel(payload, function (res) {
                        if (res) {
                            toastr.success('Train model success');
                            console.log('train model success', res);

                            self.workflowResults[0].outputData.length = 0;
                            if (res.error_path && res.error_path.training_errors)
                                self.workflowResults[0].outputData.push({
                                    idErrorPlot: 1,
                                    name: "Training Errors",
                                    value: res.error_path.training_errors
                                });
                            if (res.error_path && res.error_path.validation_errors)
                                self.workflowResults[0].outputData.push({
                                    idErrorPlot: 2,
                                    name: "Validation Errors",
                                    value: res.error_path.validation_errors
                                });

                            if (cb) cb();
                        } else {
                            console.log('train model fail');
                            if (cb) cb('train model fail');
                        }
                    });
                    break;
                case CROSS_RECURRENCE_PLOT:
                    params = {
                        dim: getValueParam('dim', self.currentModelType),
                        tau: getValueParam('tau', self.currentModelType),
                        epsilon: getValueParam('epsilon', self.currentModelType),
                        lambd: getValueParam('lambd', self.currentModelType),
                        percent: getValueParam('percent', self.currentModelType),
                        curve_number: getValueParam('curve_number', self.currentModelType),
                        facies_class_number: getValueParam('facies_class_number', self.currentModelType)
                    }
                    payload = {
                        model_id: genModelId(),
                        data: {
                            well: WELL,//array of string
                            data: data,
                            target: target
                        },
                        params: params
                    }
                    console.log(payload);
                    wiMachineLearningApiService.trainCRP(payload, function (res) {
                        if (res) {
                            toastr.success('Train model success');
                            console.log('train model success', res);

                            self.workflowResults[0].outputData.length = 0;
                            if (res.error_path && res.error_path.training_errors)
                                self.workflowResults[0].outputData.push({
                                    idErrorPlot: 1,
                                    name: "Training Errors",
                                    value: res.error_path.training_errors
                                });
                            if (res.error_path && res.error_path.validation_errors)
                                self.workflowResults[0].outputData.push({
                                    idErrorPlot: 2,
                                    name: "Validation Errors",
                                    value: res.error_path.validation_errors
                                });

                            if (cb) cb();
                        } else {
                            console.log('train model fail');
                            if (cb) cb('train model fail');
                        }
                    });
                    break;
            }

        });
    }

    // }
    function saveCurveAndCreatePlot(curveInfo, step, index, cb) {
        /*let _stepVerify = self.workflowConfig.steps.filter(function(step){
            return step.name==VERIFY_STEP_NAME;
        })[0];*/
        saveCurve(curveInfo, function (curveProps) {
            delete curveInfo.data;

            let inCurves = step.inputData[index].inputs.map(function (ipt) {
                return ipt.value;
            });
            let outCurves = [];

            if (step.name == VERIFY_STEP_NAME) {
                outCurves = inCurves.splice(inCurves.length - 1, 1);
            }

            outCurves.push({
                idCurve: curveProps.idCurve,
                name: curveProps.name
            });

            createLogplot(
                curveInfo.idWell,
                step.inputData[index].well.name + '-' + curveProps.name + '-' + step.name,
                inCurves, outCurves,
                function (err, response) {
                    if (err) {
                        console.error(err);
                        toastr.error(err.message);
                        if (cb) cb(err);
                        return;
                    }
                    let wfResult = self.workflowResults.find(function (wfr) {
                        return wfr.name == step.name;
                    });
                    // wfResult.outputData.length = 0;
                    wfResult.outputData.push(response);

                    if (cb) cb();
                }
            );
        });
    }
    function verify(cb) {
        let _stepVerify = self.workflowConfig.steps.filter(function (step) { return step.name == VERIFY_STEP_NAME; })[0];
        let wfResult = self.workflowResults.find(function (wfr) {
            return wfr.name == VERIFY_STEP_NAME;
        });
        wfResult.outputData.length = 0;
        getDataCurves(_stepVerify, function (list_input) {
            async.forEachOfSeries(list_input, function (list_curves, index, __done) {
                let length = list_curves.length;
                let verifyCurve = [];
                list_curves[length - 1].forEach(function (x) {
                    verifyCurve.push(x);
                })
                // verifyCurve  = list_curves.splice(list_curves.length-1, 1)[0];
                // list_curves.splice(list_curves.length-1, 1);
                list_curves.pop();
                let indicesObj = filterNull(list_curves);
                // indicesObj.filterCurves.splice(indicesObj.filterCurves.length-1, 1);
                let dataCurves = indicesObj.filterCurves;
                let nullPositions = indicesObj.fillNull;
                let WELL = indicesObj.well;
                let payload = null;
                console.log(self.workflowConfig.model.type);
                switch (self.workflowConfig.model.type) {
                    case ML_TOOLKIT:
                        if (!outputCurveName()) {
                            toastr.error('Choose a dataset to train before verify');
                            __done('fail');
                        } else {
                            payload = {
                                model_id: genModelId(),
                                data: dataCurves
                            };
                            console.log(payload);
                            window.verifyData = payload;
                            wiMachineLearningApiService.predictCurve(payload, function (res) {
                                if (res) {
                                    toastr.success('Verification success');
                                    console.log('verify success', res);

                                    window.tar = [];
                                    res.target.forEach(function (x) {
                                        window.tar.push(x);
                                    });
                                    fillNullInCurve(nullPositions, res.target);
                                    // for(let i =0; i<res.target.length; i++)
                                    // console.log(verifyCurve[i],' - ', res.target[i]);

                                    let lastIdx = _stepVerify.inputData[index].inputs.length - 1;
                                    let curveInfo = {
                                        idDataset: _stepVerify.inputData[index].dataset.idDataset,
                                        idFamily: _stepVerify.inputData[index].inputs[lastIdx].value.idFamily,
                                        idWell: _stepVerify.inputData[index].well.idWell,
                                        name: outputCurveName(),
                                        data: res.target
                                    }
                                    saveCurveAndCreatePlot(curveInfo, _stepVerify, index, function (err) {
                                        if (err) {
                                            toastr.error(err.message);
                                            __done(err);
                                        }
                                        __done();
                                        // if (cb) cb(err);
                                    });
                                } else {
                                    __done('fail');
                                    // if (cb) cb('verify fail');
                                }
                            });
                        }
                        break;
                    case CROSS_RECURRENCE_PLOT:
                        if (!outputCurveName()) {
                            toastr.error('Choose a dataset to train before verify');
                            __done('fail');
                        } else {
                            payload = {
                                model_id: genModelId(),
                                test: {
                                    well: WELL,//array of string
                                    data: dataCurves
                                }
                            };
                            console.log(payload);
                            wiMachineLearningApiService.predictCRP(payload, function (res) {
                                if (res) {
                                    toastr.success('Verification success');
                                    console.log('verify success', res);

                                    window.tar = [];
                                    res.target.forEach(function (x) {
                                        window.tar.push(x);
                                    });
                                    fillNullInCurve(nullPositions, res.target);
                                    // for(let i =0; i<res.target.length; i++)
                                    // console.log(verifyCurve[i],' - ', res.target[i]);

                                    let lastIdx = _stepVerify.inputData[index].inputs.length - 1;
                                    let curveInfo = {
                                        idDataset: _stepVerify.inputData[index].dataset.idDataset,
                                        idFamily: _stepVerify.inputData[index].inputs[lastIdx].value.idFamily,
                                        idWell: _stepVerify.inputData[index].well.idWell,
                                        name: outputCurveName(),
                                        data: res.target
                                    }
                                    saveCurveAndCreatePlot(curveInfo, _stepVerify, index, function (err) {
                                        if (err) {
                                            toastr.error(err.message);
                                            __done(err);
                                        }
                                        __done();
                                        // if (cb) cb(err);
                                    });
                                } else {
                                    __done('fail');
                                    // if (cb) cb('verify fail');
                                }
                            });
                        }
                        break;
                    case PERMEABILITY_AI:
                        payload = {
                            data: dataCurves
                        };
                        console.log(payload);
                        wiMachineLearningApiService.predictAnfis(payload, function (res) {
                            if (res) {
                                toastr.success('Verification curve success');
                                console.log('Prediction success', res);
                                fillNullInCurve(nullPositions, res.target)
                                let lastIdx = _stepVerify.inputData[index].inputs.length - 1;
                                let curveInfo = {
                                    idDataset: _stepVerify.inputData[index].dataset.idDataset,
                                    idFamily: ___PERM_FAM_ID,
                                    idWell: _stepVerify.inputData[index].well.idWell,
                                    name: outputCurveName(),
                                    data: res.target
                                }
                                saveCurveAndCreatePlot(curveInfo, _stepVerify, index, function (err) {
                                    if (err) {
                                        toastr.error(err.message);
                                        __done(err);
                                    }
                                    __done();
                                });
                            } else {
                                __done('fail');
                            }
                        });
                        break;
                    case FACIES_AI:
                        payload = {
                            data: dataCurves
                        };
                        window.face = payload;
                        wiMachineLearningApiService.predictFacies(payload, function (res) {
                            if (res) {
                                toastr.success('Verification curve success');
                                console.log('verify success', res);
                                fillNullInCurve(nullPositions, res.target)
                                let lastIdx = _stepVerify.inputData[index].inputs.length - 1;
                                let curveInfo = {
                                    idDataset: _stepVerify.inputData[index].dataset.idDataset,
                                    idFamily: ___FACIES_FAM_ID,
                                    idWell: _stepVerify.inputData[index].well.idWell,
                                    name: outputCurveName(),
                                    data: res.target
                                }
                                saveCurveAndCreatePlot(curveInfo, _stepVerify, index, function (err) {
                                    if (err) {
                                        toastr.error(err.message);
                                        __done(err);
                                    }
                                    __done();
                                });
                            } else {
                                __done('fail');
                            }
                        });
                        break;
                };
            }, function (err) {
                if (cb) cb();
            });
        });
    };

    function predict(cb) {
        let _stepPredict = self.workflowConfig.steps.filter(function (step) { return step.name == PREDICT_STEP_NAME; })[0];
        let _stepTrain = self.workflowConfig.steps.filter(function (step) { return step.name == TRAIN_STEP_NAME; })[0];
        let wfResult = self.workflowResults.find(function (wfr) {
            return wfr.name == PREDICT_STEP_NAME;
        });
        wfResult.outputData.length = 0;
        getDataCurves(_stepPredict, function (list_input) {
            async.forEachOfSeries(list_input, function (list_curves, index, __done) {
                let indicesObj = filterNull(list_curves);
                let dataCurves = indicesObj.filterCurves;
                let nullPositions = indicesObj.fillNull;
                let WELL = indicesObj.well;
                let payload = null;

                switch (self.workflowConfig.model.type) {
                    case ML_TOOLKIT:
                        if (!outputCurveName()) {
                            toastr.error('choose a dataset to train before predict');
                            __done('fail');
                        } else {
                            payload = {
                                model_id: genModelId(),
                                data: dataCurves
                            };
                            console.log(payload);
                            wiMachineLearningApiService.predictCurve(payload, function (res) {
                                if (res) {
                                    toastr.success('Predict curve success');
                                    console.log('predict success', res);
                                    fillNullInCurve(nullPositions, res.target);
                                    if (!_stepTrain.inputData.length) {
                                        toastr.error('Need train model before predict');
                                        return;
                                    }
                                    let lastIdx = _stepTrain.inputData[0].inputs.length - 1;
                                    let curveInfo = {
                                        idDataset: _stepPredict.inputData[index].dataset.idDataset,
                                        idFamily: _stepTrain.inputData[0].inputs[lastIdx].value.idFamily,
                                        idWell: _stepPredict.inputData[index].well.idWell,
                                        name: outputCurveName(),
                                        data: res.target
                                    }
                                    saveCurveAndCreatePlot(curveInfo, _stepPredict, index, function (err) {
                                        if (err) {
                                            toastr.error(err.message);
                                            __done(err);
                                        }
                                        __done();
                                    });
                                } else {
                                    __done('fail');
                                }
                            });
                        }
                        break;
                    case CROSS_RECURRENCE_PLOT:
                        if (!outputCurveName()) {
                            toastr.error('choose a dataset to train before predict');
                            __done('fail');
                        } else {
                            payload = {
                                model_id: genModelId(),
                                test: {
                                    well: WELL,//array of string
                                    data: dataCurves
                                }
                            };
                            console.log(payload);
                            wiMachineLearningApiService.predictCRP(payload, function (res) {
                                if (res) {
                                    toastr.success('Predict curve success');
                                    console.log('predict success', res);
                                    fillNullInCurve(nullPositions, res.target);
                                    if (!_stepTrain.inputData.length) {
                                        toastr.error('Need train model before predict');
                                        return;
                                    }
                                    let lastIdx = _stepTrain.inputData[0].inputs.length - 1;
                                    let curveInfo = {
                                        idDataset: _stepPredict.inputData[index].dataset.idDataset,
                                        idFamily: _stepTrain.inputData[0].inputs[lastIdx].value.idFamily,
                                        idWell: _stepPredict.inputData[index].well.idWell,
                                        name: outputCurveName(),
                                        data: res.target
                                    }
                                    saveCurveAndCreatePlot(curveInfo, _stepPredict, index, function (err) {
                                        if (err) {
                                            toastr.error(err.message);
                                            __done(err);
                                        }
                                        __done();
                                    });
                                } else {
                                    __done('fail');
                                }
                            });
                        }
                        break;
                    case PERMEABILITY_AI:
                        payload = {
                            data: dataCurves
                        };
                        wiMachineLearningApiService.predictAnfis(payload, function (res) {
                            if (res) {
                                toastr.success('Predict curve success');
                                console.log('predict success', res);
                                fillNullInCurve(nullPositions, res.target);
                                let curveInfo = {
                                    idDataset: _stepPredict.inputData[index].dataset.idDataset,
                                    idFamily: ___PERM_FAM_ID,
                                    idWell: _stepPredict.inputData[index].well.idWell,
                                    name: outputCurveName(),
                                    data: res.target
                                }
                                saveCurveAndCreatePlot(curveInfo, _stepPredict, index, function (err) {
                                    if (err) {
                                        toastr.error(err.message);
                                        __done(err);
                                    }
                                    __done();
                                });
                            } else {
                                __done('fail');
                            }
                        });
                        break;
                    case FACIES_AI:
                        payload = {
                            data: dataCurves
                        };
                        wiMachineLearningApiService.predictFacies(payload, function (res) {
                            if (res) {
                                toastr.success('Predict curve success');
                                console.log('predict success', res);
                                fillNullInCurve(nullPositions, res.target);
                                let curveInfo = {
                                    idDataset: _stepPredict.inputData[index].dataset.idDataset,
                                    idFamily: ___FACIES_FAM_ID,
                                    idWell: _stepPredict.inputData[index].well.idWell,
                                    name: outputCurveName(),
                                    data: res.target
                                }
                                saveCurveAndCreatePlot(curveInfo, _stepPredict, index, function (err) {
                                    if (err) {
                                        toastr.error(err.message);
                                        __done(err);
                                    }
                                    __done();
                                });
                            } else {
                                __done('fail');
                            }
                        });
                        break;
                }
            }, function (err) {
                if (cb) cb();
            });
        });
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

    this.nnConfig = { inputs: [], outputs: [], layers: [] };

    function updateNNConfig() {
        if (!self.currentModelType) {
            return;
        }
        if (!self.currentModelType.parameters.length) {
            return;
        }
        let config = self.currentModelType.parameters[self.currentModelType.parameters.length - 1];
        if (config.type != 'nnconfig') {
            return;
        }
        self.nnConfig = { inputs: [], outputs: [], layers: [] };

        self.nnConfig.inputs = self.workflowConfig.model.inputs.filter(function (input) { return input.class == 'curve input' });
        self.nnConfig.outputs = self.workflowConfig.model.inputs.filter(function (input) { return input.class == 'curve output' });
        self.nnConfig.layers = config.value.layerConfig.map(function (item) {
            return item.value;
        });
        self.saveWorkflow();
        $timeout(function () {
            self.wiNNCtrl.update(self.nnConfig);
        });
    }

    this.updateNNConfig = _.debounce(updateNNConfig);
    setInterval(self.updateNNConfig(), 1000);
    function getCurrentProjectId() {
        let openProject = wiComponentService.getComponent(
            wiComponentService.PROJECT_LOADED
        );
        return (openProject || {}).idProject;
    };
    this.$onInit = function () {
        self.idProject = getCurrentProjectId();
        if (self.name) wiComponentService.putComponent(self.name, self);
        console.log(self.idWorkflow);
        if (self.idWorkflow) {
            wiApiService.getWorkflow(self.idWorkflow, function (workflow) {
                self.workflowConfig = workflow.content;
                self.workflowName = workflow.name;
                console.log(self.workflowConfig);
                self.currentModelType = self.workflowConfig.model.currentModelType;
                if (self.workflowConfig.model.type == CROSS_RECURRENCE_PLOT)
                    self.currentModelType = self.listModelType.choices[self.listModelType.choices.length - 1];
                console.log(self.currentModelType);
                self.workflowResults[1] = self.workflowConfig.steps.find(function (step) {
                    return step.name == self.workflowResults[1].name;
                }).result || self.workflowResults[1];
                self.workflowResults[2] = self.workflowConfig.steps.find(function (step) {
                    return step.name == self.workflowResults[2].name;
                }).result || self.workflowResults[2];
            });
        }

        // CONFIGURE INPUT TAB
        self.selectionType = "1";

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
    this.onSelectTemplate = function (itemIdx) {
        self.changeCurveSelection = false;
        let __SELECTED_NODE = self.selectionList.find(function (d) {
            return d.data.selected;
        });
        if (__SELECTED_NODE) {
            let inputs = self.workflowConfig.model.inputs;
            let item = inputs[itemIdx];
            if (item.label != __SELECTED_NODE.data.label)
                self.changeCurveSelection = true;
            item.label = __SELECTED_NODE.data.label;
            item.value = __SELECTED_NODE.id > 0 ? __SELECTED_NODE.id : item.label;
            item.name = item.label;
            item.type = self.selectionType;
            __inputChanged.status = true;
            let tmp = new Set(__inputChanged.index);
            tmp.add(0, 1, 2);
            __inputChanged.index = Array.from(tmp);
            self.saveWorkflow();
        } else {
            toastr.error("please select data type!");
        }
    };
    this.updateCurveSelection = function () {
        if (self.changeCurveSelection) {
            self.workflowConfig.steps.forEach(function (step) {
                console.log(step.inputData);
                step.inputData = [];

            });
            self.saveWorkflow();
            self.changeCurveSelection = false;
        }
    }
    this.onDeleteInput = function (idx) {
        for (let wf of self.workflowConfig.steps) {
            wf.inputData.splice(idx, 1);
        }
        self.saveWorkflow();
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
    this.downTriggerPrj = function (cb) {
        let wells = self.projectConfig;
        if (wells.length && !isNaN(__idProject) && __idProject > 0) {
            wiApiService.listWells({
                idProject: __idProject,
                start: wells[wells.length - 1].properties.idWell,
                limit: 10,
                match: (self.prjFilter && self.prjFilter.length) ? self.prjFilter : undefined,
                forward: true
            }, function (listOfWells) {
                let lowm = new Array();
                modelFrom(lowm, listOfWells);
                if (cb) cb(lowm, wells);
            });
        }
        else if (cb) cb([]);
    }
    this.upTriggerPrj = function (cb) {
        let wells = self.projectConfig;
        if (wells.length && !isNaN(__idProject) && __idProject > 0) {
            wiApiService.listWells({
                idProject: __idProject,
                start: wells[0].properties.idWell,
                limit: 10,
                match: (self.prjFilter && self.prjFilter.length) ? self.prjFilter : undefined,
                forward: false
            }, function (listOfWells) {
                let lowm = new Array();
                modelFrom(lowm, listOfWells);
                if (cb) cb(lowm, wells);
            });
        }
        else if (cb) cb([]);
    }
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
                let idWell = datasetModel.properties.idWell;
                let wellModel = self.projectConfig.find(
                    well => well.id == idWell
                );
                let wellName = wellModel.properties.name;
                if (!wf.inputData || !Array.isArray(wf.inputData))
                    wf.inputData = new Array();
                let existDataset = wf.inputData.find(i => i.dataset.idDataset == datasetModel.properties.idDataset);
                if (existDataset) return;

                let inputs = [];

                if (wf.name == PREDICT_STEP_NAME)
                    self.workflowConfig.model.inputs.forEach(function (ipt, idx) {
                        if (idx < self.workflowConfig.model.inputs.length - 1)
                            inputs.push(ipt);
                    });
                else inputs = self.workflowConfig.model.inputs;


                let inputItems = inputs.map(function (ipt) {
                    let tempItem = {
                        name: ipt.name,
                        choices: matchCurves(datasetModel.children.map(function (curve, idx) { return { idCurve: curve.id, name: curve.name, idFamily: curve.properties.idFamily }; }), ipt)
                    };
                    tempItem.value = tempItem.choices.length ? tempItem.choices[0] : null;
                    return tempItem;
                });

                let inputsNull = inputItems.filter(function (ipt) { return ipt.value == null; });
                if (inputsNull.length > 0) {
                    for (let missingInput of inputsNull) {
                        toastr.error(missingInput.name + " is missing");
                    }
                    return;
                }

                let input = {
                    well: {
                        idWell: wellModel.properties.idWell,
                        name: wellModel.properties.name
                    },
                    dataset: {
                        idDataset: datasetModel.properties.idDataset,
                        name: datasetModel.properties.name
                    },
                    inputs: inputItems
                };
                $timeout(() => {
                    wf.inputData.push(input);
                    __inputDataLen = wf.inputData.length;
                    self.saveWorkflow();
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
        if (!self.workflowConfig)
            return false;
        for (let input of self.workflowConfig.model.inputs) {
            if (!input.value) return false;
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
                idFamily: curveInfo.idFamily || (family || {}).id || null
            }
            wiApiService.checkCurveExisted(curveInfo.name, curveInfo.idDataset, (curve) => {
                if (curve.idCurve) {
                    payload.idDesCurve = curve.idCurve;
                    curveInfo.idCurve = curve.idCurve;
                } else {
                    payload.curveName = curveInfo.name
                }
                wiApiService.processingDataCurve(payload, function (ret) {
                    if (!curve.idCurve) curveInfo.idCurve = ret.idCurve;
                    let _ret = null;
                    if (!curve.idCurve) {
                        _ret = ret;
                    } else {
                        _ret = curveInfo;
                        _ret.idFamily = payload.idFamily;
                    }

                    callback(_ret);
                })
            })
        });
    }

    this.removeWell = function (wf, i) {
        wf.inputData.splice(i, 1);
        self.saveWorkflow();
    }
    this.addCurveInput = function () {
        self.workflowConfig.model.inputs.unshift({ class: "curve input" });
        self.changeCurveSelection = true;
    }
    this.removeCurveInput = function (index) {
        let i = self.workflowConfig.model.inputs.length;
        if (i == 2)
            toastr.error('Need least at 1 curve input', '');
        else {
            self.workflowConfig.model.inputs.splice(index, 1);
            self.changeCurveSelection = true;
            self.saveWorkflow();
        }
    }
    this.outputCurveStyle = function (idx) {
        if (idx == self.workflowConfig.model.inputs.length - 1)
            return {
                "margin-top": "30px"
            }
        return {};
    }

    this.onModelTypeListInit = function (wiItemDropdownCtrl) {
        self.listModelType.choices.pop();
        wiItemDropdownCtrl.items = self.listModelType.choices.map(function (choice) {
            return {
                data: { label: choice.name },
                properties: choice
            }
        });
        if (!self.currentModelType) {
            if (wiItemDropdownCtrl.items.length) {
                wiItemDropdownCtrl.selectedItem = wiItemDropdownCtrl.items[0];
                self.currentModelType = wiItemDropdownCtrl.selectedItem.properties;
                if (self.workflowConfig && self.workflowConfig.model)
                    self.workflowConfig.model.currentModelType = self.currentModelType;
            }
        }
        else {
            wiItemDropdownCtrl.selectedItem = wiItemDropdownCtrl.items.find(function (item) {
                return item.properties.name == self.currentModelType.name;
            });
        }
    }
    this.onModelTypeChanged = function (type) {
        self.workflowConfig.model.currentModelType = type;
        self.currentModelType = self.workflowConfig.model.currentModelType;
        self.updateNNConfig();
        self.saveWorkflow();
    }
    this.nnConfigNLayerChanged = function (nnConfig) {
        if (nnConfig.nLayer < nnConfig.layerConfig.length) {
            nnConfig.layerConfig.splice(nnConfig.nLayer, nnConfig.layerConfig.length - nnConfig.nLayer);
        }
        else {
            let oldLength = nnConfig.layerConfig.length;
            for (let i = 0; i < nnConfig.nLayer - oldLength; i++) {
                nnConfig.layerConfig.push({
                    name: "layer " + (oldLength + i),
                    value: 10
                });
            }
        }
    }

    let __running_wf = false;
    function saveWorkflow() {
        if (!self.idWorkflow || __running_wf) return;
        let verifyResult = self.workflowResults[1];
        let predictResult = self.workflowResults[2];
        let verifyStepIdx = -1;
        let predictStepIdx = -1;
        for (let idx in self.workflowConfig.steps) {
            if (self.workflowConfig.steps[idx].name == verifyResult.name) {
                verifyStepIdx = idx;
            }
            if (self.workflowConfig.steps[idx].name == predictResult.name) {
                predictStepIdx = idx;
            }
        };

        if (verifyStepIdx >= 0) {
            self.workflowConfig.steps[verifyStepIdx].result = verifyResult;
        }
        if (predictStepIdx >= 0) {
            self.workflowConfig.steps[predictStepIdx].result = predictResult;
        }
        self.workflowConfig.model.currentModelType = self.currentModelType;
        wiApiService.editWorkflow({
            idWorkflow: self.idWorkflow,
            content: self.workflowConfig
        }, function (workflow) {
            console.log('save workflow', workflow);
        });
    }
    this.saveWorkflow = _.debounce(saveWorkflow, 3000);
    this.finishWizard = function () {
        __running_wf = true;
        self.workflowResults.forEach(function (step) {
            step.outputData.length = 0;
        })
        async.forEachOfSeries(self.workflowConfig.steps, function (step, idx, done) {
            if (step.inputData && step.inputData.length != 0) {
                self.runStep(step, done);
            } else {
                toastr.error('can\'t ' + step.name + '! choose a datase for ' + step.name);
                async.setImmediate(done);
            }
        }, function (err) {
            if (err) toastr.error(err);
            __running_wf = false;
            console.log('finish');
            utils.refreshProjectState();
            saveWorkflow();
        });
    }
    this.running = function () {
        return __running_wf;
    }
    this.createSpinner = function () {
        // $timeout( () => {
        //     document.getElementById("workflow-" + self.idWorkflow + "-spinner").appendChild((new Spinner()).spin().el);
        // }, 700);
    }

    this.openPlot = function (plot) {
        console.log('openPlot');
        let layout = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
        layout.putTabRightWithModel({
            id: plot.idPlot,
            type: 'logplot',
            properties: {
                idPlot: plot.idPlot,
                name: plot.name,
                idWell: plot.idWell
            }
        });
    }
    this.removePlot = function (odata) {
        delete odata.idPlot;
        delete odata.plotName;
        self.saveWorkflow();
    }
    this.openErrorPlot = function (odata) {
        console.log('openErrorPlot');
        let layout = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
        let tabId = self.workflowName + '-' + self.idWorkflow + '-' + odata.idErrorPlot;

        let rightContainer = layout.getItemById('right');
        let tabItem = rightContainer.getItemsById(tabId)[0];
        if (tabItem) {
            rightContainer.setActiveContentItem(tabItem);
            return;
        }
        let htmlTemplate = `<wi-plot style='height:100%;width:100%;display: flex;' configs='${plotConfig(odata)}' options='${plotOption(odata)}'></wi-plot>`;
        console.log(htmlTemplate);
        rightContainer.addChild({
            type: 'component',
            id: tabId,
            isClosable: true,
            componentName: 'html-block',
            componentState: {
                html: htmlTemplate
            },
            title: `${self.workflowName} - ${odata.name}`
        });
    }
    this.removeErrorPlot = function (odata) {
        delete odata.idErrorPlot;
        delete odata.name;
        delete odata.value;
        self.saveWorkflow();
    }
    function createLogplot(idWell, plotName, inCurves, outCurves, callback) {
        let payload = {
            idWell: idWell,
            name: plotName,
            override: true
        };
        wiApiService.post(wiApiService.CREATE_PLOT, payload, function (response, err) {
            if (err) return;

            let currentOrderNum = 'm';
            async.series([function plotInCurves(done) {
                async.eachSeries(inCurves, function (curve, done1) {
                    wiApiService.createLogTrack(response.idPlot, currentOrderNum, function (trackData) {
                        //create line
                        wiApiService.createLine({
                            idTrack: trackData.idTrack,
                            idCurve: curve.idCurve,
                            orderNum: currentOrderNum
                        }, function (line) {
                            currentOrderNum = String.fromCharCode(currentOrderNum.charCodeAt(0) + 1);
                            done1();
                        })
                    }, {
                            title: curve.name
                        });

                }, function (err) {
                    if (err) {
                        done(err);
                    }
                    else done();
                });
            }, function plotOutCurves(done) {
                wiApiService.createLogTrack(response.idPlot, currentOrderNum, function (trackData) {
                    async.each(outCurves, function (curve, done1) {
                        //create line
                        wiApiService.createLine({
                            idTrack: trackData.idTrack,
                            idCurve: curve.idCurve,
                            orderNum: currentOrderNum
                        }, function (line) {
                            currentOrderNum = String.fromCharCode(currentOrderNum.charCodeAt(0) + 1);
                            done1();
                        })
                    }, function (err) {
                        if (err) {
                            done(err);
                        }
                        else done();
                    });
                }, {
                        title: outCurves[0].name
                    });
            }], function (err) {
                if (err) callback(err);
                else callback(null, response);
            });
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
            async.eachSeries(wfInput.inputs, function (ipt, done1) {
                wiApiService.createLogTrack(response.idPlot, currentOrderNum, function (trackData) {
                    //create line
                    wiApiService.createLine({
                        idTrack: trackData.idTrack,
                        idCurve: ipt.value.properties ? ipt.value.properties.idCurve : ipt.value.idCurve,
                        orderNum: currentOrderNum
                    }, function (line) {
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
                        }, function (line) {
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
                                idTrack: trackData.idTrack,
                                name: opt.name + "-left",
                                orderNum: 'm',
                                negativeFill: {
                                    display: false,
                                    sadingType: "pattern",
                                    pattern: {
                                        background: "blue",
                                        foreground: "black",
                                        name: "none"
                                    }
                                },
                                positiveFill: {
                                    display: false,
                                    sadingType: "pattern",
                                    pattern: {
                                        background: "blue",
                                        foreground: "black",
                                        name: "none"
                                    }
                                },
                                fill: {
                                    display: true,
                                    shadingType: "pattern",
                                    pattern: {
                                        name: "none",
                                        foreground: "black",
                                        background: bgColor
                                    }
                                },
                                isNegPosFill: false,
                                idLeftLine: null,
                                idRightLine: line.idLine,
                                leftFixedValue: 0,
                                idControlCurve: opt.idCurve
                            }, function (shadingProps) {
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
    function plotConfig(odata) {
        let extent = d3.extent(odata.value);
        return JSON.stringify({
            y: {
                label: odata.name,
                min: extent[0],
                max: extent[1],
                data: odata.value
            },
            x: {
                label: 'Iterations',
                min: 0,
                max: odata.value.length,
                data: odata.value.map(function (d, i) { return i + 1; })
            }
        });
    }
    function plotOption(odata) {
        return JSON.stringify({
            lineColor: 'blue',
            lineStyle: 'solid',
            pointColor: 'black',
            pointStyle: 'circle',
            showPoint: true,
            showLine: true
        });
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
        idWorkflow: "<"
    }
});

exports.name = moduleName;
