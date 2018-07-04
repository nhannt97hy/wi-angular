'use strict';
// petrophysics
const moduleName = 'wi-petrophysics';

function calVCLfromGR(inputs, parameters, callback) {
    let grCurve = inputs[0];
    let result = new Array(grCurve.length).fill(null);

    // cal GR index
    for (let i = 0; i < grCurve.length; i++) {
        parameters.forEach(zone => {
            let clean = zone.param[0] || 10;
            let clay = zone.param[1] || 120;
            let type = zone.param[2] || 1;
            if(zone.startDepth && zone.endDepth){
                let currentDepth = i * parameters.step + parameters.topDepth;
                if(currentDepth >= zone.startDepth && currentDepth <= zone.endDepth){
                    result[i] = (grCurve[i] - clean) / (clay - clean);
                }
            }else{
                result[i] = (grCurve[i] - clean) / (clay - clean);
            }
            // cal VCL by type
            switch (type) {
                case 1: // Linear
                    break;

                case 2: // Clavier
                    result[i] = 1.7 - Math.sqrt(3.38 - Math.pow(result[i] + 0.7, 2));
                    break;

                case 3: // Larionov Tertiary
                    result[i] = 0.083 * (Math.pow(2, 3.7 * result[i]) - 1);
                    break;

                case 4: // Larionov rocks
                    result[i] = 0.33 * (Math.pow(2, 3.7 * result[i]) - 1);
                    break;

                case 5: // Stieber variation I
                    result[i] = result[i] / (2 - result[i]);
                    break;

                case 6: // Stieber : Miocene and Pliocene
                    result[i] = result[i] / (3 - 2 * result[i]);
                    break;

                case 7: // Stieber variation II
                    result[i] = result[i] / (4 - 3 * result[i]);
                    break;
                default:
                    break;
            }
        })
    }
    result = result.map(d => d ? parseFloat(d.clamp(0, 1).toFixed(4)) : null);
    callback([result]);
}

function calVCLfromND(inputs, parameters, callback){
    let nphi = inputs[0], rhob = inputs[1];
    let result = new Array(grCurve.length).fill(null);

    for (let i = 0; i < grCurve.length; i++) {
        parameters.forEach(zone => {
            let clean = zone.param[0] || 10;
            let clay = zone.param[1] || 120;
            let type = zone.param[2] || 1;
            if(zone.startDepth && zone.endDepth){
                let currentDepth = i * parameters.step + parameters.topDepth;
                if(currentDepth >= zone.startDepth && currentDepth <= zone.endDepth){
                    // need update
                }
            }else{
                    // need update
            }
        })
    }
    result = result.map(d => d ? parseFloat(d.clamp(0, 1).toFixed(4)) : null);
    callback([result]);
}

function calPorosityFromDensity(inputs, parameters, callback) {
    let density = inputs[0];
    let vclay = inputs[1];
    let total = new Array(density.length).fill(null);
    let effective = new Array(density.length).fill(null);

    for( let i = 0; i < density.length; i++){
        parameters.forEach(zone => {
            let clean = zone.param[0].value || 2.65;
            let fluid = zone.param[1].value || 1;
            let clay = zone.param[2].value || 2.3;
            let sh = (clean - clay) / (clean - fluid);
            if(zone.startDepth && zone.endDepth){
                let currentDepth = i * parameters.step + parameters.topDepth;
                if(currentDepth >= zone.startDepth && currentDepth <= zone.endDepth){
                    total[i] = (clean - density[i]) / (clean - fluid);
                    if (vclay) {
                        let tmp = total[i] - (sh * vclay[i]);
                        effective[i] = parseFloat(tmp.clamp(0, 1).toFixed(4));
                    };
                }
            }else{
                total[i] = (clean - density[i]) / (clean - fluid);
                if (vclay) {
                    let tmp = total[i] - (sh * vclay[i]);
                    effective[i] = parseFloat(tmp.clamp(0, 1).toFixed(4));
                };
            }
        })
    }

    total = total.map(d => parseFloat(d.clamp(0, 1).toFixed(4)));
    callback([total, effective]);
}

function calSaturationArchie(inputs, parameters, callback) {
    let Rt = inputs[0], porosity = inputs[1];
    let result = new Array(4).fill().map(r => new Array(Rt.length).fill(null));
    for (let i = 0; i < Rt.length; i++) {
        parameters.forEach(zone => {
            let a = zone.param[0].value || 1;
            let m = zone.param[1].value || 2;
            let n = zone.param[2].value || 2;
            let Rw = zone.param[3].value || 0.03;
            if(zone.startDepth && zone.endDepth){
                let currentDepth = i * parameters.step + parameters.topDepth;
                if(currentDepth >= zone.startDepth && currentDepth <= zone.endDepth){
                    let tmp = Math.pow((a * Rw) / (Rt[i] * Math.pow(porosity[i], m)), (1 / n));
                    result[2][i] = tmp; // SW_AR_UNCL
                    let tmp2 = parseFloat(tmp.clamp(0, 1).toFixed(4));
                    result[0][i] = tmp2; // SW_AR
                    result[1][i] = 1 - tmp2; //SH_AR
                    result[3][i] = tmp2 * porosity[i]; //BVW_AR
                }
            }else {
                let tmp = Math.pow((a * Rw) / (Rt[i] * Math.pow(porosity[i], m)), (1 / n));
                result[2][i] = tmp; // SW_AR_UNCL
                let tmp2 = parseFloat(tmp.clamp(0, 1).toFixed(4));
                result[0][i] = tmp2; // SW_AR
                result[1][i] = 1 - tmp2; //SH_AR
                result[3][i] = tmp2 * porosity[i]; //BVW_AR
            }
        })
    }
    callback(result);
}

function calCutoffSummation(inputs, parameters, callback){
    let clay = inputs[0], phi = inputs[1], sw = inputs[2];
    let res = new Array(clay.length).fill(null);
    let pay = new Array(clay.length).fill(null);
    // res[0] = 0;
    // pay[0] = 1;
    for(let i = 0; i < clay.length; i++){
        parameters.forEach(zone => {
            let clay_cut = zone.param[0].value;
            let phi_cut = zone.param[1].value;
            let sw_cut = zone.param[2].value;
            if(zone.startDepth && zone.endDepth){
                let currentDepth = i * parameters.step + parameters.topDepth;
                if(currentDepth >= zone.startDepth && currentDepth <= zone.endDepth){
                    let seed = Math.random();
                    res[i] = seed < 0.2 ? 0: (seed > 0.8 ? 1 : res[i-1]);
                    pay[i] = seed < 0.2 ? 0: (seed > 0.8 ? 1 : pay[i-1]);
                    //res[i] = (clay[i] <= clay_cut && phi[i] >= phi_cut) ? 1 : 0;
                    //pay[i] = (clay[i] <= clay_cut && phi[i] >= phi_cut && sw[i] <= sw_cut) ? 1 : 0;
                }
            }else{
                let seed = Math.random();
                res[i] = seed < 0.2 ? 0: (seed > 0.8 ? 1 : res[i-1]);
                pay[i] = seed < 0.2 ? 0: (seed > 0.8 ? 1 : pay[i-1]);
                //res[i] = (clay[i] <= clay_cut && phi[i] >= phi_cut) ? 1 : 0;
                //pay[i] = (clay[i] <= clay_cut && phi[i] >= phi_cut && sw[i] <= sw_cut) ? 1 : 0;
            }
        })
    }
    callback([res, pay]);
}


const fns = {
    calVCLfromGR,
    calPorosityFromDensity,
    calSaturationArchie,
    calCutoffSummation
};

angular.module(moduleName, []).factory('wiPetrophysics', function (wiComponentService, wiApiService) {
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);

    function saveCurve(curveInfo, callback) {
        const familyList = utils.getListFamily();
        let family = familyList.find(f => f.name == curveInfo.family);
        let payload = {
            data: curveInfo.data,
            idDataset: curveInfo.idDataset,
            idFamily: (family || {}).idFamily || null,
            unit: curveInfo.unit
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
    }

    function createLogplotFromResult({ inputMap, taskConfig, name }, callback) {
        const idProject = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED).idProject;
        let payload = {
            idProject: idProject,
            name: name,
            override: true
        };
        wiApiService.post(wiApiService.CREATE_PLOT, payload, (response, err) => {
            let currentOrderNum = 'm';
            async.eachOfSeries(inputMap, function(item, idx, end){
                let wfInput = item.inputs;
                let wfOutput = taskConfig.outputData[idx];
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

    function execute({ taskConfig, name }, done) {
        let runFunc = fns[taskConfig.function];
        if(!runFunc) {
            toastr.error('Not yet implement');
            return;
        }
        taskConfig.outputData = new Array();
        let inputMap = taskConfig.inputData.reduce((total, d) => {
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

        async.eachOf(inputMap, function (data, idx, callback) {
            let curveData = [];
            async.eachSeries(data.inputs, function (curve, cb) {
                (async () => {
                    if (!curve.id) {
                        await new Promise((resolve, reject) => {
                            wiApiService.checkCurveExisted(curve.name, data.idDataset, (res, err) => {
                                if (err || !res.idCurve) reject(res);
                                curve.id = res.idCurve;
                                resolve();
                            });
                        })
                    }
                    wiApiService.dataCurve(curve.id, function (dataCurve) {
                        curveData.push(dataCurve.map(d => parseFloat(d.x)));
                        cb();
                    })
                })();
            }, function (err) {
                if (!err) {
                    runFunc(curveData, data.parameters, function (ret) {
                        taskConfig.outputData[idx] = new Object();
                        taskConfig.outputData[idx].idDataset = data.idDataset;
                        taskConfig.outputData[idx].outputCurves = new Array();
                        taskConfig.outputs.forEach((o, i) => {
                            taskConfig.outputData[idx].outputCurves[i] = Object.assign({}, o);
                            taskConfig.outputData[idx].outputCurves[i].data = ret[i];
                        });
                        async.each(taskConfig.outputData[idx].outputCurves, function (d, cb2) {
                            if(d.use){
                                d.idDataset = data.idDataset;
                                saveCurve(d, function (curveProps) {
                                    delete d.data;
                                    // updateChoices(curveProps);
                                    cb2();
                                });
                            }else{
                                cb2();
                            }
                        }, function (err) {
                            taskConfig.outputData[idx].outputCurves = taskConfig.outputData[idx].outputCurves.filter(c => c.use);
                            callback();
                        });
                    })
                }
            })
        }, function (err) {
            if (!err) {
                createLogplotFromResult({ inputMap, taskConfig, name }, function () {
                    done();
                });
            }
        });
    }
    return {
        execute
    }
})

module.exports.name = moduleName;
