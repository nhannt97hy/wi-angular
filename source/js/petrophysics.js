'use strict';
// petrophysics

function calVCLfromGR(inputs, parameters, callback) {
    let grCurve = inputs[0];
    let clean = parameters[0].value || 10;
    let clay = parameters[1].value || 120;
    let type = parameters[2].value || 1;
    let result = new Array();
    async.series([
        function (cb) {
            // cal GR index
            for (let i = 0; i < grCurve.length; i++) {
                result[i] = (grCurve[i] - clean) / (clay - clean);
            }
            cb();
        },
        function (cb) {
            // cal VCL by type
            switch (type) {
                case 1: // Linear
                    cb();
                    break;

                case 2: // Clavier
                    result = result.map(d => { return 1.7 - Math.sqrt(3.38 - Math.pow(d + 0.7, 2)) });
                    cb();
                    break;

                case 3: // Larionov Tertiary
                    result = result.map(d => { return 0.083 * (Math.pow(2, 3.7 * d) - 1) });
                    cb();
                    break;

                case 4: // Larionov rocks
                    result = result.map(d => { return 0.33 * (Math.pow(2, 3.7 * d) - 1) });
                    cb();
                    break;

                case 5: // Stieber variation I
                    result = result.map(d => { return d / (2 - d) });
                    cb();
                    break;

                case 6: // Stieber : Miocene and Pliocene
                    result = result.map(d => { return d / (3 - 2 * d) });
                    cb();
                    break;

                case 7: // Stieber variation II
                    result = result.map(d => { return d / (4 - 3 * d) });
                    cb();
                    break;
                default:
                    break;
            }
        }], function (err) {
            result = result.map(d => parseFloat(d.clamp(0, 1).toFixed(4)));
            callback([result]);
        })
}
exports.calVCLfromGR = calVCLfromGR;

function calPorosityFromDensity(inputs, parameters, callback) {
    let total = new Array();
    let effective = new Array()
    let density = inputs[0];
    let vclay = inputs[1];
    let clean = parameters[0].value || 2.65;
    let fluid = parameters[1].value || 1;
    let clay = parameters[2].value || 2.3;

    let sh = (clean - clay) / (clean - fluid);
    for (let i = 0; i < density.length; i++) {
        total[i] = (clean - density[i]) / (clean - fluid);
        if (vclay) {
            let tmp = total[i] - (sh * vclay[i]);
            effective[i] = parseFloat(tmp.clamp(0, 1).toFixed(4));
        };
    }
    total = total.map(d => parseFloat(d.clamp(0, 1).toFixed(4)));
    callback([total, effective]);
}
exports.calPorosityFromDensity = calPorosityFromDensity;

function calSaturationArchie(inputs, parameters, callback) {
    let result = new Array(4).fill().map(r => new Array());
    let Rt = inputs[0], porosity = inputs[1];
    let a = parameters[0].value || 1;
    let m = parameters[1].value || 2;
    let n = parameters[2].value || 2;
    let Rw = parameters[3].value || 0.03;
    for (let i = 0; i < Rt.length; i++) {
        let tmp = Math.pow((a * Rw) / (Rt[i] * Math.pow(porosity[i], m)), (1 / n));
        result[2][i] = tmp; // SW_AR_UNCL
        let tmp2 = parseFloat(tmp.clamp(0, 1).toFixed(4));
        result[0][i] = tmp2; // SW_AR
        result[1][i] = 1 - tmp2; //SH_AR
        result[3][i] = tmp2 * porosity[i]; //BVW_AR
    }
    callback(result);
}
exports.calSaturationArchie = calSaturationArchie;

function calCutoffSummation(inputs, parameters, callback){
    let clay = inputs[0], phi = inputs[1], sw = inputs[2];
    let clay_cut = parameters[2], phi_cut = parameters[3], sw_cut = parameters[4];
    let res = new Array(), pay = new Array();

    // res[0] = 0;
    // pay[0] = 1;
    for(let i = 0; i < clay.length; i++){
        // let seed = Math.random();
        // res[i] = seed < 0.2 ? 0: (seed > 0.8 ? 1 : res[i-1]);
        // pay[i] = seed < 0.2 ? 0: (seed > 0.8 ? 1 : pay[i-1]);
        res[i] = (clay[i] <= clay_cut && phi[i] >= phi_cut) ? 1 : 0;
        pay[i] = (clay[i] <= clay_cut && phi[i] >= phi_cut && sw[i] <= sw_cut) ? 1 : 0;
    }
    callback([res, pay]);
}

exports.calCutoffSummation = calCutoffSummation;