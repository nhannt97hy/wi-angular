'use strict';
// petrophysics

function calVSHfromGR(inputs, parameters, callback) {
    let grCurve = inputs[0];
    let matrix = parameters[0].value || 10;
    let shale = parameters[1].value || 120;
    let type = parameters[2].value || 1;
    let result = new Array();
    async.series([
        function (cb) {
            // cal GR index
            for (let i = 0; i < grCurve.length; i++) {
                result[i] = (grCurve[i] - matrix) / (shale - matrix);
            }
            cb();
        },
        function (cb) {
            // cal VSH by type
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
            let output = {
                name: "VSH_GR",
                data: result,
                unit: "v/v"
            }
            callback([output]);
        })
}
exports.calVSHfromGR = calVSHfromGR;

function calPorosityFromDensity(inputs, parameters, callback) {
    let total = new Array();
    let effective = new Array()
    let density = inputs[0];
    let vsh = inputs[1];
    let matrix = parameters[0].value || 2.65;
    let shale = parameters[1].value || 2.4;
    let fluid = parameters[2].value || 1;

    let sh = (matrix - shale) / (matrix - fluid);
    for (let i = 0; i < density.length; i++) {
        total[i] = (matrix - density[i]) / (matrix - fluid);
        if (vsh) {
            let tmp = total[i] - (sh * vsh[i]);
            effective[i] = parseFloat(tmp.clamp(0, 1).toFixed(4));
        };
    }
    total = total.map(d => parseFloat(d.clamp(0, 1).toFixed(4)));
    let output = [{
        name: "PHIT_D",
        data: total,
        unit: "v/v"
    }];
    if (vsh) output.push({
        name: "PHIE_D",
        data: effective,
        unit: "v/v"
    })
    callback(output);
}
exports.calPorosityFromDensity = calPorosityFromDensity;

function calSaturationArchie(inputs, parameters, callback) {
    let SW = new Array(), SH = new Array(), SW_UNCL = new Array(), BVW = new Array();
    let Rt = inputs[0], porosity = inputs[1];
    let a = parameters[0].value || 1;
    let m = parameters[1].value || 2;
    let n = parameters[2].value || 2;
    let Rw = parameters[3].value || 0.03;
    for (let i = 0; i < Rt.length; i++) {
        SW_UNCL[i] = Math.pow((a * Rw) / (Rt[i] * Math.pow(porosity[i], m)), (1 / n));
        SW[i] = parseFloat(SW_UNCL[i].clamp(0, 1).toFixed(4));
        SH[i] = 1 - SW[i];
        BVW[i] = SW[i] * porosity[i];
    }
    callback([
        {
            name: "SW_AR",
            data: SW,
            unit: "v/v"
        },
        {
            name: "SH_AR",
            data: SH,
            unit: "v/v"
        },
        {
            name: "SW_AR_UNCL",
            data: SW_UNCL,
            unit: "v/v"
        },
        {
            name: "BVW_AR",
            data: BVW,
            unit: "v/v"
        },
    ]
    )
}
exports.calSaturationArchie = calSaturationArchie;