'use strict';

var __GLOBAL = null;
exports.setGlobalObj = function (gObj) {
    __GLOBAL = gObj;
}

exports.objcpy = function (destObj, sourceObj) {
    if (destObj) {
        for (let attr in sourceObj) {
            destObj[attr] = sourceObj[attr];
        }
    }
};

exports.objClone = function (obj) {
    return JSON.parse(JSON.stringify(obj));
}

exports.isEqual = function (a, b) {
    if (!a || !b) return false;
    let aProps = Object.getOwnPropertyNames(a);
    let bProps = Object.getOwnPropertyNames(b);

    if (aProps.length !== bProps.length) {
        return false;
    }

    for (let i = 0; i < aProps.length; i++) {
        let propName = aProps[i];

        if (a[propName] !== b[propName]) {
            return false;
        }
    }

    return true;
};

exports.bindFunctions = function (destHandlers, sourceHandlers, thisObj) {
    for (let handler in sourceHandlers) {
        destHandlers[handler] = sourceHandlers[handler].bind(thisObj);
    }
};

function error(errorMessage, callback) {
    errorMessage = errorMessage || "Something's wrong!";
    let wics = __GLOBAL.wiComponentService;
    let DialogUtils = wics.getComponent('DIALOG_UTILS');
    DialogUtils.errorMessageDialog(__GLOBAL.ModalService, errorMessage, callback);
}
exports.error = error;

function warning (warningMessage, callback) {
    if (!warningMessage) return;
    warningMessage = warningMessage;
    let wiComponentService = __GLOBAL.wiComponentService;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    DialogUtils.warningMessageDialog(__GLOBAL.ModalService, warningMessage, callback);
}
exports.warning = warning;

exports.doLogin = function doLogin (cb) {
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('refreshToken');
    // window.localStorage.removeItem('username');
    window.localStorage.removeItem('rememberAuth');
    $('.modal').remove();
    let wiComponentService = __GLOBAL.wiComponentService;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    DialogUtils.authenticationDialog(__GLOBAL.ModalService, wiComponentService, function (userInfo) {
        if (userInfo.remember) {
            window.localStorage.setItem('rememberAuth', true);
        }
        let sameUser = userInfo.username == window.localStorage.getItem('username');
        window.localStorage.setItem('username', userInfo.username);
        window.localStorage.setItem('token', userInfo.token);
        window.localStorage.setItem('refreshToken', userInfo.refreshToken);
        __GLOBAL.wiApiService.setAuthenticationInfo(userInfo);
        wiComponentService.getComponent('user').userUpdate();
        cb && cb(sameUser);
    });
}

exports.projectOpen = function (projectData) {
    let wiComponentService = __GLOBAL.wiComponentService;
    let LProject = {id:projectData.idProject, name:projectData.name};
    window.localStorage.setItem('LProject',JSON.stringify(LProject, null, 4));
    window.history.pushState(LProject, LProject.name, '?idProject=' + LProject.id);
    document.title = LProject.name + " - Well Insight";
    sortProjectData(projectData);
    wiComponentService.putComponent(wiComponentService.PROJECT_LOADED, projectData);
    putListFamily(function () {
        wiComponentService.emit(wiComponentService.PROJECT_LOADED_EVENT);
    })
};

exports.projectClose = function () {
    let wiComponentService = __GLOBAL.wiComponentService;
    window.localStorage.removeItem('LProject');
    wiComponentService.emit(wiComponentService.PROJECT_UNLOADED_EVENT);
    window.history.replaceState({}, 'home', '/');
    document.title = 'Well Insight';
};

function getCurveFromId(idCurve) {
    let wiComponentService = __GLOBAL.wiComponentService;
    let rootNodes = wiComponentService.getComponent(wiComponentService.WI_EXPLORER).treeConfig;
    if (!rootNodes) return;
    let curve = null;
    rootNodes.forEach(function (node) {
        visit(node, function (aNode) {
            if (aNode.type == 'curve' && aNode.id == idCurve) {
                curve = aNode;
            }
        });
    });
    return curve;
}

exports.getCurveFromId = getCurveFromId;
exports.lineToTreeConfig = lineToTreeConfig;

function lineToTreeConfig(line) {
    let lineModel = new Object();
    let curveModel = getCurveFromId(line.idCurve);
    lineModel.name = curveModel.properties.name;
    lineModel.type = 'line';
    lineModel.id = line.idLine;
    lineModel.idCurve = line.idCurve;
    lineModel.data = {
        id: line.idLine,
        idCurve: line.idCurve,
        idDataset: curveModel.properties.idDataset,
        dataset: findDatasetById(curveModel.properties.idDataset).name,
        name: lineModel.name,
        unit: line.unit,
        minX: line.minValue,
        maxX: line.maxValue,
        scale: line.displayType,
        alias: line.alias,
        showHeader: line.showHeader,
        showDataset: line.showDataset,
        blockPosition: line.blockPosition,
        wrapMode: line.wrapMode,
        displayAs: line.displayAs,
        displayMode: line.displayMode,
        autoValueScale: line.autoValueScale,
        line: null,
        symbol: null,
        orderNum: line.orderNum
    };
    lineModel.data.line = {
        dash: eval(line.lineStyle),
        color: line.lineColor,
        width: line.lineWidth
    }
    lineModel.data.symbol = {
        style: line.symbolName.toLowerCase(),
        fillStyle: line.symbolFillStyle,
        strokeStyle: line.symbolStrokeStyle,
        lineWidth: line.symbolLineWidth,
        lineDash: eval(line.symbolLineDash),
        size: parseInt(line.symbolSize)
    }
    return lineModel;
}

function shadingToTreeConfig(shading, paletteList) {
    let shadingModel = new Object();
    shadingModel.id = shading.idShading;
    shadingModel.idLeftLine = shading.idLeftLine;
    shadingModel.idRightLine = shading.idRightLine;
    shadingModel.data = Object.assign({}, shading, {
        id: shading.idShading,
        name: shading.name,
        refX: shading.refX,
        leftX: shading.leftFixedValue,
        rightX: shading.rightFixedValue,
        fill: shading.fill ? JSON.parse(shading.fill) : null,
        isNegPosFill: shading.isNegPosFill,
        positiveFill: shading.positiveFill ? JSON.parse(shading.positiveFill) : null,
        negativeFill: shading.negativeFill ? JSON.parse(shading.negativeFill) : null,
        refLineWidth: shading.refLineWidth || 1,
        refLineColor: shading.refLineColor || '#3e3e3e',
        showRefLine: shading.showRefLine
    });
    if (shadingModel.data.fill && shadingModel.data.fill.varShading) {
        shadingModel.data.fill.varShading.palette = paletteList[shadingModel.data.fill.varShading.palName];
    }
    if (shadingModel.data.positiveFill && shadingModel.data.positiveFill.varShading) {
        shadingModel.data.positiveFill.varShading.palette = paletteList[shadingModel.data.positiveFill.varShading.palName];
    }
    if (shadingModel.data.negativeFill && shadingModel.data.negativeFill.varShading) {
        shadingModel.data.negativeFill.varShading.palette = paletteList[shadingModel.data.negativeFill.varShading.palName];
    }
    console.log("shadingModel:", shadingModel);
    return shadingModel;
}

exports.shadingToTreeConfig = shadingToTreeConfig;

function zoneToTreeConfig(zone, options = {}) {
    var zoneModel = new Object();
    setTimeout(() => {
        let zoneSetModel = getModel('zoneset', zone.idZoneSet);
        let wellModel = getModel('well', zoneSetModel.properties.idWell);
        zoneModel.parentDataArr = [wellModel.data, zoneSetModel.data];
    });
    if (options.isDeleted) {
        zoneModel.name = 'zone-deleted-child';
        zoneModel.type = 'zone-deleted-child';
    } else {
        zoneModel.name = 'zone';
        zoneModel.type = 'zone';
    }
    zoneModel.id = zone.idZone;
    zoneModel.properties = {
        idZoneSet: zone.idZoneSet,
        idZone: zone.idZone,
        startDepth: zone.startDepth,
        endDepth: zone.endDepth,
        name: zone.name,
        fill: JSON.parse(zone.fill),
        background: JSON.parse(zone.fill).pattern.background,
        foreground: JSON.parse(zone.fill).pattern.foreground,
    };
    zoneModel.data = {
        icon: 'zone-table-16x16',
        label: `${zone.name}: ${zone.startDepth} - ${zone.endDepth}`
    }
    zoneModel.parent = 'zoneset' + zone.idZoneSet;
    return zoneModel;
}

exports.zoneToTreeConfig = zoneToTreeConfig;

function zoneSetToTreeConfig(zoneSet, options = {}) {
    var zoneSetModel = new Object();
    zoneSetModel.id = zoneSet.idZoneSet;
    zoneSetModel.properties = {
        idWell: zoneSet.idWell,
        idZoneSet: zoneSet.idZoneSet,
        name: zoneSet.name,
    };
    zoneSetModel.data = {
        childExpanded: false,
        icon: 'project-16x16-edit',
        label: zoneSet.name
    }
    if (options.isDeleted) {
        zoneSetModel.name = 'zoneset-deleted-child';
        zoneSetModel.type = 'zoneset-deleted-child';
        return zoneSetModel;
    }
    zoneSetModel.name = zoneSet.name;
    zoneSetModel.type = 'zoneset';
    zoneSetModel.children = new Array();
    if (!zoneSet.zones) return zoneSetModel;
    zoneSet.zones.forEach(function (zone) {
        zoneSetModel.children.push(zoneToTreeConfig(zone));
    });
    return zoneSetModel;
}

exports.zoneSetToTreeConfig = zoneSetToTreeConfig;
exports.createZoneSet = function createZoneSet (idWell, callback) {
    let wiComponentService = __GLOBAL.wiComponentService;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let selectedNode = getSelectedNode();
    if (selectedNode && selectedNode.type == 'zonesets') {
        idWell = selectedNode.properties.idWell;
    }
    if (!idWell) return;
    let promptConfig = {
        title: '<span class="zone-edit-16x16"></span> Create New Zonation Set',
        inputName: 'Name',
        input: ''
    }
    DialogUtils.promptDialog(__GLOBAL.ModalService, promptConfig, function (ret) {
        if (!ret) return;
        let wiApiService = __GLOBAL.wiApiService;
        let zoneSetInfo = {
            name: ret,
            idWell: idWell
        }
        wiApiService.createZoneSet(zoneSetInfo, function (dataReturn, err) {
            if (err) {
                createZoneSet(idWell, callback);
            } else {
                __GLOBAL.$timeout(function () {
                    if (callback) callback(dataReturn);
                    refreshProjectState();
                });
            }
        });
    });
}

function logplotToTreeConfig(plot, options = {}) {
    let plotModel = new Object();
    let wellModel = options.wellModel;
    if (!wellModel)
        wellModel = getModel('well', plot.idWell);

    setTimeout(() => {
        plotModel.parentData = wellModel.data;
    });

    if (options.isDeleted) {
        plotModel.name = 'logplot-deleted-child';
        plotModel.type = 'logplot-deleted-child';
        plotModel.id = plot.idPlot;
        plotModel.properties = {
            idWell: plot.idWell,
            idPlot: plot.idPlot,
            name: plot.name
        };
        plotModel.data = {
            childExpanded: false,
            icon: 'logplot-blank-16x16',
            label: plot.name
        }
        plotModel.parent = 'well' + plot.idWell;
        return plotModel;
    }
    plotModel.name = 'logplot';
    plotModel.type = 'logplot';
    plotModel.id = plot.idPlot;
    plotModel.properties = {
        idWell: plot.idWell,
        idPlot: plot.idPlot,
        name: plot.name,
        referenceCurve: plot.referenceCurve
    };
    plotModel.data = {
        childExpanded: false,
        icon: 'logplot-blank-16x16',
        label: plot.name
    }
    let wiComponentService = __GLOBAL.wiComponentService;
    plotModel.handler = function () {
        openLogplotTab(wiComponentService, plotModel);
    }
    plotModel.parent = 'well' + plot.idWell;
    let projectLogplots = wiComponentService.getComponent(wiComponentService.PROJECT_LOGPLOTS)
    if (projectLogplots) projectLogplots.push(plotModel);
    return plotModel;
}

exports.logplotToTreeConfig = logplotToTreeConfig;

function crossplotToTreeConfig(crossplot, options = {}) {
    let crossplotModel = new Object();
    setTimeout(() => {
        let wellModel = getModel('well', crossplot.idWell);
        crossplotModel.parentData = wellModel.data;
    });
    if (options.isDeleted) {
        crossplotModel.name = 'crossplot-deleted-child';
        crossplotModel.type = 'crossplot-deleted-child';
        crossplotModel.id = crossplot.idCrossPlot;
        crossplotModel.properties = {
            idWell: crossplot.idWell,
            idCrossPlot: crossplot.idCrossPlot,
            name: crossplot.name,
            discriminator: crossplot.discriminator == 'null' ? null : crossplot.discriminator,
            axisColors: (!crossplot.axisColors || crossplot.axisColors == 'null') ? null : JSON.parse(crossplot.axisColors),
            isDefineDepthColors: crossplot.isDefineDepthColors,
            referenceTopDepth: crossplot.referenceTopDepth,
            referenceBottomDepth: crossplot.referenceBottomDepth,
            referenceScale: crossplot.referenceScale,
            referenceVertLineNumber: crossplot.referenceVertLineNumber,
            referenceDisplay: crossplot.referenceDisplay,
            referenceShowDepthGrid: crossplot.referenceShowDepthGrid,
            reference_curves: crossplot.reference_curves,
            pointSet: crossplot.pointsets ? crossplot.pointsets[0] : {}
        };
        crossplotModel.data = {
            childExpanded: false,
            icon: 'crossplot-blank-16x16',
            label: crossplot.name
        }
        return crossplotModel;
    }
    crossplotModel.name = 'crossplot';
    crossplotModel.type = 'crossplot';
    crossplotModel.id = crossplot.idCrossPlot;
    crossplotModel.properties = {
        idWell: crossplot.idWell,
        idCrossPlot: crossplot.idCrossPlot,
        name: crossplot.name,
        discriminator: crossplot.discriminator == 'null' ? null : crossplot.discriminator,
        axisColors: (!crossplot.axisColors || crossplot.axisColors == 'null') ? null : JSON.parse(crossplot.axisColors),
        isDefineDepthColors: crossplot.isDefineDepthColors,
        referenceTopDepth: crossplot.referenceTopDepth,
        referenceBottomDepth: crossplot.referenceBottomDepth,
        referenceScale: crossplot.referenceScale,
        referenceVertLineNumber: crossplot.referenceVertLineNumber,
        referenceDisplay: crossplot.referenceDisplay,
        referenceShowDepthGrid: crossplot.referenceShowDepthGrid,
        reference_curves: crossplot.reference_curves,
        pointSet: crossplot.pointsets ? crossplot.pointsets[0] : {}
    };
    crossplotModel.data = {
        childExpanded: false,
        icon: 'crossplot-blank-16x16',
        label: crossplot.name
    }
    crossplotModel.handler = function () {
        openCrossplotTab(crossplotModel);
    }
    crossplotModel.parent = 'well' + crossplot.idWell;
    let wiComponentService = __GLOBAL.wiComponentService;
    wiComponentService.getComponent(wiComponentService.PROJECT_CROSSPLOTS).push(crossplotModel);
    return crossplotModel;
}

exports.crossplotToTreeConfig = crossplotToTreeConfig;

function histogramToTreeConfig(histogram, options = {}) {
    let histogramModel = new Object();
    setTimeout(() => {
        let wellModel = getModel('well', histogram.idWell);
        histogramModel.parentData = wellModel.data;
    });
    if (options.isDeleted) {
        histogramModel.name = 'histogram-deleted-child';
        histogramModel.type = 'histogram-deleted-child';
        histogramModel.id = histogram.idHistogram;
        histogramModel.properties = {
            idHistogram: histogram.idHistogram,
            name: histogram.name,
            histogramTitle: histogram.histogramTitle,
            hardCopyWidth: histogram.hardCopyWidth,
            hardCopyHeight: histogram.hardCopyHeight,
            intervalDepthTop: histogram.intervalDepthTop,
            intervalDepthBottom: histogram.intervalDepthBottom,
            activeZone: histogram.activeZone,
            divisions: histogram.divisions,
            leftScale: histogram.leftScale,
            rightScale: histogram.rightScale,
            showGaussian: histogram.showGaussian,
            loga: histogram.loga,
            showGrid: histogram.showGrid,
            showCumulative: histogram.showCumulative,
            flipHorizontal: histogram.flipHorizontal,
            lineStyle: histogram.lineStyle,
            lineColor: histogram.lineColor,
            plot: histogram.plot,
            plotType: histogram.plotType,
            color: histogram.color,
            discriminator: histogram.discriminator == 'null' ? null : JSON.parse(histogram.discriminator),
            idWell: histogram.idWell,
            idCurve: histogram.idCurve,
            idZoneSet: histogram.idZoneSet,
            referenceTopDepth: histogram.referenceTopDepth,
            referenceBottomDepth: histogram.referenceBottomDepth,
            referenceScale: histogram.referenceScale,
            referenceVertLineNumber: histogram.referenceVertLineNumber,
            referenceDisplay: histogram.referenceDisplay,
            referenceShowDepthGrid: histogram.referenceShowDepthGrid,
            reference_curves: histogram.reference_curves
        };
        histogramModel.data = {
            childExpanded: false,
            icon: 'histogram-blank-16x16',
            label: histogram.name
        }
        return histogramModel;
    }
    histogramModel.name = 'histogram';
    histogramModel.type = 'histogram';
    histogramModel.id = histogram.idHistogram;
    histogramModel.properties = {
        idHistogram: histogram.idHistogram,
        name: histogram.name,
        histogramTitle: histogram.histogramTitle,
        hardCopyWidth: histogram.hardCopyWidth,
        hardCopyHeight: histogram.hardCopyHeight,
        intervalDepthTop: histogram.intervalDepthTop,
        intervalDepthBottom: histogram.intervalDepthBottom,
        activeZone: histogram.activeZone,
        divisions: histogram.divisions,
        leftScale: histogram.leftScale,
        rightScale: histogram.rightScale,
        showGaussian: histogram.showGaussian,
        loga: histogram.loga,
        showGrid: histogram.showGrid,
        showCumulative: histogram.showCumulative,
        flipHorizontal: histogram.flipHorizontal,
        lineStyle: histogram.lineStyle,
        lineColor: histogram.lineColor,
        plot: histogram.plot,
        plotType: histogram.plotType,
        color: histogram.color,
        discriminator: histogram.discriminator == 'null' ? null : JSON.parse(histogram.discriminator),
        idWell: histogram.idWell,
        idCurve: histogram.idCurve,
        idZoneSet: histogram.idZoneSet,
        referenceTopDepth: histogram.referenceTopDepth,
        referenceBottomDepth: histogram.referenceBottomDepth,
        referenceScale: histogram.referenceScale,
        referenceVertLineNumber: histogram.referenceVertLineNumber,
        referenceDisplay: histogram.referenceDisplay,
        referenceShowDepthGrid: histogram.referenceShowDepthGrid,
        reference_curves: histogram.reference_curves
    };
    histogramModel.data = {
        childExpanded: false,
        icon: 'histogram-blank-16x16',
        label: histogram.name
    }
    histogramModel.handler = function () {
        openHistogramTab(histogramModel);
    }
    histogramModel.parent = 'well' + histogram.idWell;
    let wiComponentService = __GLOBAL.wiComponentService;
    wiComponentService.getComponent(wiComponentService.PROJECT_HISTOGRAMS).push(histogramModel);
    return histogramModel;
}

exports.histogramToTreeConfig = histogramToTreeConfig;

function comboviewToTreeConfig(comboview, isDeleted) {
    let comboviewModel = new Object();
    comboviewModel.name = 'combinedPlot';
    comboviewModel.type = 'comboview';
    comboviewModel.id = comboview.idCombinedBox;
    comboviewModel.properties = {
        idWell: comboview.idWell,
        idCombinedBox: comboview.idCombinedBox,
        name: comboview.name
    };
    comboviewModel.data = {
        childExpanded: false,
        icon: 'link-view-16x16',
        label: comboview.name
    };

    comboviewModel.handler = function () {
        openComboviewTab(comboviewModel);
    }

    comboviewModel.parent = 'well' + comboview.idWell;

    return comboviewModel;
}
exports.comboviewToTreeConfig = comboviewToTreeConfig;

function createCurveModel (curve) {
    let curveModel = new Object();
    curveModel.name = curve.name;
    curveModel.type = 'curve';
    curveModel.id = curve.idCurve;
    curveModel.properties = curve;
    const listFamily = getListFamily() || [];
    Object.assign(curveModel.properties, {
        idDataset: curve.idDataset,
        idCurve: curve.idCurve,
        idFamily: curve.idFamily,
        family: listFamily.find(f => f.idFamily === curve.idFamily),
        name: curve.name,
        unit: curve.unit,
        alias: curve.name
    });
    // curveModel.datasetName = curve.dataset;
    curveModel.data = {
        childExpanded: false,
        icon: 'curve-16x16',
        label: curve.name,
        unit: curveModel.properties.unit,
        familyName: _.get(curveModel,'properties.family.name')
    };
    curveModel.lineProperties = curve.LineProperty;
    curveModel.curveData = null;
    curveModel.parent = curve.dataset;
    return curveModel;
}
exports.createCurveModel = createCurveModel;

function curveToTreeConfig(curve, isDeleted, wellModel, datasetModel, treeRoot) {
    let curveModel = createCurveModel(curve);
    // let dModel = datasetModel || getModel('dataset', curve.idDataset);
    // let wModel = wellModel || getModel('well', datasetModel.properties.idWell, treeRoot);
    setTimeout(() => {
        //let datasetModel = getModel('dataset', curve.idDataset);
        //let wellModel = getModel('well', datasetModel.properties.idWell);
        curveModel.parentDataArr = [(wellModel||{}).data, (datasetModel||{}).data];
    });
    if (isDeleted) {
        curveModel.name = 'curve-deleted-child';
        curveModel.type = 'curve-deleted-child';
        curveModel.id = curve.idCurve;
        curveModel.properties = {
            idDataset: curve.idDataset,
            idCurve: curve.idCurve,
            idFamily: curve.idFamily,
            name: curve.name,
            unit: curve.unit,
            alias: curve.name
        };
        // curveModel.datasetName = curve.dataset;
        curveModel.data = {
            childExpanded: false,
            icon: 'curve-16x16',
            label: curve.name,
            unit: curveModel.properties.unit
        };
        curveModel.lineProperties = curve.LineProperty;
        curveModel.curveData = null;
        curveModel.parent = curve.dataset;
        return curveModel;
    } else {
        return curveModel;
    }
}
exports.curveToTreeConfig = curveToTreeConfig;

function createDatasetModel (dataset) {
    let datasetModel = new Object();
    datasetModel.name = dataset.name;
    datasetModel.type = "dataset";
    datasetModel.id = dataset.idDataset;
    datasetModel.properties = dataset;
    Object.assign(datasetModel.properties, {
        idWell: dataset.idWell,
        idDataset: dataset.idDataset,
        name: dataset.name,
        datasetKey: dataset.datasetKey,
        datasetLabel: dataset.datasetLabel
    });
    datasetModel.data = {
        childExpanded: false,
        icon: "curve-data-16x16",
        label: dataset.name
    };
    datasetModel.children = new Array();
    return datasetModel;
}
exports.createDatasetModel = createDatasetModel;

function datasetToTreeConfig(dataset, isDeleted, wellModel, treeRoot) {
    let datasetModel = createDatasetModel(dataset);
    let wM = wellModel;
    if (!wM) wM = getModel('well', dataset.idWell, treeRoot);
    setTimeout(() => {
        datasetModel.parentData = wM.data;
    });
    if (isDeleted) {
        datasetModel.name = "dataset-deleted-child";
        datasetModel.type = "dataset-deleted-child";
        datasetModel.id = dataset.idDataset;
        datasetModel.properties = {
            idWell: dataset.idWell,
            idDataset: dataset.idDataset,
            name: dataset.name,
            datasetKey: dataset.datasetKey,
            datasetLabel: dataset.datasetLabel
        };
        datasetModel.data = {
            childExpanded: false,
            icon: "curve-data-16x16",
            label: dataset.name
        };
        datasetModel.parent = 'well' + dataset.idWell;
        datasetModel.children = new Array();
        if (!dataset.curves) return datasetModel;
        return datasetModel;
    } else {
        if (!dataset.curves) return datasetModel;
        dataset.curves.forEach(function (curve) {
            curve.dataset = dataset.name;
            datasetModel.children.push(curveToTreeConfig(curve, false, wM, datasetModel));
        });
        return datasetModel;
    }
}
exports.datasetToTreeConfig = datasetToTreeConfig;

function createWellsNode(parent) {
    let wellsModel = new Object();
    wellsModel.name = 'wells-deleted';
    wellsModel.type = 'wells-deleted';
    wellsModel.data = {
        childExpanded: false,
        icon: 'well-16x16',
        label: "Wells"
    }
    wellsModel.properties = {
        totalItems: parent.wells.length
    }
    wellsModel.children = new Array();
    if (!parent.wells) return wellsModel;
    parent.wells.forEach(function (well) {
        wellsModel.children.push(wellToTreeConfig(well, true));
    });
    return wellsModel;
}

function createDatasetsNode(parent) {
    let datasetsModel = new Object();
    datasetsModel.name = 'datasets-deleted';
    datasetsModel.type = 'datasets-deleted';
    datasetsModel.data = {
        childExpanded: false,
        icon: 'curve-data-16x16',
        label: "Datasets",
        isCollection: true
    };
    datasetsModel.properties = {
        totalItems: parent.datasets.length
    }
    datasetsModel.children = new Array();
    if (!parent.datasets) return datasetsModel;
    parent.datasets.forEach(function (dataset) {
        datasetsModel.children.push(datasetToTreeConfig(dataset, true));
    });
    return datasetsModel;
}

function createCurvesNode(parent) {
    let curvesModel = new Object();
    curvesModel.name = 'curves-deleted';
    curvesModel.type = 'curves-deleted';
    curvesModel.data = {
        childExpanded: false,
        icon: 'curve-16x16',
        label: "Curves",
        isCollection: true
    }
    curvesModel.properties = {
        totalItems: parent.curves.length
    }
    curvesModel.children = new Array();
    if (!parent.curves) return curvesModel;
    parent.curves.forEach(function (curve) {
        curvesModel.children.push(curveToTreeConfig(curve, true));
    });
    return curvesModel;
}

function createZonesNode(parent, options = {}) {
    let zonesModel = new Object();
    if (options.isDeleted) {
        zonesModel.name = 'zones-deleted';
        zonesModel.type = 'zones-deleted';
    }
    zonesModel.data = {
        childExpanded: false,
        icon: 'zone-table-16x16',
        label: "Zones",
        isCollection: true
    }
    zonesModel.properties = {
        totalItems: parent.curves.length
    }
    zonesModel.children = new Array();
    if (!parent.zones) return zonesModel;
    parent.zones.forEach(function (zone) {
        zonesModel.children.push(zoneToTreeConfig(zone, { isDeleted: true }));
    });
    return zonesModel;
}

function createLogplotsNode(parent, options = {}) {
    let plotsModel = new Object();
    plotsModel.data = {
        childExpanded: false,
        icon: 'logplot-blank-16x16',
        label: "Logplots"
    }
    if (options.isDeleted) {
        plotsModel.name = 'logplots-deleted';
        plotsModel.type = 'logplots-deleted';
        plotsModel.data.isCollection = true;
    } else if (options.isCollection) {
        plotsModel.type = 'project-logplots';
        plotsModel.data.isCollection = true;
    } else {
        plotsModel.name = 'logplots';
        plotsModel.type = 'logplots';
    }
    plotsModel.children = new Array();
    if (!parent) return plotsModel;
    if (!parent.plots) return plotsModel;
    plotsModel.properties = {
        totalItems: parent.plots.length,
        idWell: parent.idWell
    }
    if (options.isDeleted) {
        parent.plots.forEach(function (plot) {
            plotsModel.children.push(logplotToTreeConfig(plot, { isDeleted: true }));
        });
    } else {
        parent.plots.forEach(function (plot) {
            plotsModel.children.push(logplotToTreeConfig(plot, options));
        });
    }
    return plotsModel;
}

function createCrossplotsNode(parent, options = {}) {
    let crossplotsModel = new Object();
    crossplotsModel.data = {
        childExpanded: false,
        icon: 'crossplot-blank-16x16',
        label: "Crossplots"
    }
    if (options.isDeleted) {
        crossplotsModel.name = 'crossplots-deleted';
        crossplotsModel.type = 'crossplots-deleted';
        crossplotsModel.data.isCollection = true;
    } else if (options.isCollection) {
        crossplotsModel.type = 'project-crossplots';
        crossplotsModel.data.isCollection = true;
    } else {
        crossplotsModel.name = 'crossplots';
        crossplotsModel.type = 'crossplots';
    }
    crossplotsModel.children = new Array();
    if (!parent) return crossplotsModel;
    if (!parent.crossplots) return crossplotsModel;
    crossplotsModel.properties = {
        totalItems: parent.crossplots.length,
        idWell: parent.idWell
    }
    if (options.isDeleted) {
        parent.crossplots.forEach(function (crossplot) {
            crossplotsModel.children.push(crossplotToTreeConfig(crossplot, { isDeleted: true }));
        });
    } else {
        parent.crossplots.forEach(function (crossplot) {
            crossplotsModel.children.push(crossplotToTreeConfig(crossplot));
        });
    }
    return crossplotsModel;
}

function createHistogramsNode(parent, options = {}) {
    let histogramsModel = new Object();
    histogramsModel.data = {
        childExpanded: false,
        icon: 'histogram-blank-16x16',
        label: "Histograms"
    }
    if (options.isDeleted) {
        histogramsModel.name = 'histograms-deleted';
        histogramsModel.type = 'histograms-deleted';
        histogramsModel.data.isCollection = true;
    } else if (options.isCollection) {
        histogramsModel.type = 'project-histograms';
        histogramsModel.data.isCollection = true;
    } else {
        histogramsModel.name = 'histograms';
        histogramsModel.type = 'histograms';
    }
    histogramsModel.children = new Array();
    if (!parent) return histogramsModel;
    if (!parent.histograms) return histogramsModel;
    histogramsModel.properties = {
        totalItems: parent.histograms.length,
        idWell: parent.idWell
    }
    if (options.isDeleted) {
        parent.histograms.forEach(function (histogram) {
            histogramsModel.children.push(histogramToTreeConfig(histogram, {isDeleted: true}));
        });
    } else {
        parent.histograms.forEach(function (histogram) {
            histogramsModel.children.push(histogramToTreeConfig(histogram));
        });
    }
    return histogramsModel;
}

function createZoneSetsNode(parent, options = {}) {
    let zoneSetsModel = new Object();
    if (options.isDeleted) {
        zoneSetsModel.name = 'zonesets-deleted';
        zoneSetsModel.type = 'zonesets-deleted';
        zoneSetsModel.data = {
            childExpanded: false,
            icon: 'user-define-16x16',
            label: "Zone Sets"
        };
    } else {
        zoneSetsModel.name = 'zonesets';
        zoneSetsModel.type = 'zonesets';
        zoneSetsModel.data = {
            childExpanded: false,
            icon: 'user-define-16x16',
            label: "User Defined"
        };
    }
    zoneSetsModel.children = new Array();
    if (!parent || !parent.zonesets) return zoneSetsModel;
    zoneSetsModel.properties = {
        idWell: parent.idWell,
        totalItems: parent.zonesets.length
    }
    if (options.isDeleted) {
        parent.zonesets.forEach(function (zoneSet) {
            zoneSetsModel.children.push(zoneSetToTreeConfig(zoneSet, { isDeleted: true }));
        });
    } else {
        parent.zonesets.forEach(function (zoneSet) {
            zoneSetsModel.children.push(zoneSetToTreeConfig(zoneSet));
        });
    }
    return zoneSetsModel;
}

function createComboviewsNode(parent) {
    let comboviewsModel = new Object();
    comboviewsModel.data = {
        childExpanded: false,
        icon: 'link-view-16x16',
        label: "Combined Plots"
    }
    comboviewsModel.name = 'comboviews';
    comboviewsModel.type = 'comboviews';

    comboviewsModel.children = new Array();
    if (!parent) return comboviewsModel;
    if (!parent.combined_boxes) return comboviewsModel;
    comboviewsModel.properties = {
        totalItems: parent.combined_boxes.length,
        idWell: parent.idWell
    }
    parent.combined_boxes.forEach(function (comboview) {
        // comboview.parent = parent;
        comboviewsModel.children.push(comboviewToTreeConfig(comboview));
    });
    return comboviewsModel;
}

function createWellModel(well) {
    let wellModel = new Object();
    wellModel.name = "well";
    wellModel.type = "well";
    wellModel.id = well.idWell;
    wellModel.properties = well;
    Object.assign(wellModel, {
        idProject: well.idProject,
        idWell: well.idWell,
        name: well.name || well.wellName,
        topDepth: parseFloat(well.topDepth),
        bottomDepth: parseFloat(well.bottomDepth),
        step: parseFloat(well.step),
        idGroup: well.idGroup
    });
    wellModel.data = {
        childExpanded: false,
        icon: "well-16x16",
        label: well.name || well.wellName
    };
    if (well.idGroup) wellModel.parent = 'group' + well.idGroup;
    else wellModel.parent = 'project' + well.idProject;
    wellModel.children = new Array();
    return wellModel;
}
exports.createWellModel = createWellModel;

function wellToTreeConfig(well, isDeleted) {
    if (isDeleted) {
        var wellModel = new Object();
        wellModel.name = "well-deleted-child";
        wellModel.type = "well-deleted-child";
        wellModel.id = well.idWell;
        wellModel.properties = {
            idProject: well.idProject,
            idWell: well.idWell,
            name: well.name,
            topDepth: parseFloat(well.topDepth),
            bottomDepth: parseFloat(well.bottomDepth),
            step: parseFloat(well.step)
        };
        wellModel.data = {
            childExpanded: false,
            icon: "well-16x16",
            label: well.name
        };
        wellModel.children = new Array();
        wellModel.parent = 'project' + well.idProject;
        return wellModel;
    } else {
        let wellModel = createWellModel(well);
        if (well.datasets) {
            well.datasets.forEach(function (dataset) {
                wellModel.children.push(datasetToTreeConfig(dataset, false, wellModel));
            });
        }
        let zoneSetsNode = createZoneSetsNode(well);
        let logplotNode = createLogplotsNode(well, {wellModel});
        let crossplotNode = createCrossplotsNode(well);
        let histogramNode = createHistogramsNode(well);
        let comboviewNode = createComboviewsNode(well);
        wellModel.children.push(zoneSetsNode);
        wellModel.children.push(logplotNode);
        wellModel.children.push(crossplotNode);
        wellModel.children.push(histogramNode);
        wellModel.children.push(comboviewNode);
        return wellModel;
    }
}
exports.wellToTreeConfig = wellToTreeConfig;

function groupToTreeConfig (group) {
    let groupModel = {};
    groupModel.name = 'group';
    groupModel.type = 'group';
    groupModel.data = {
        childExpanded: false,
        icon: 'group-16x16',
        label: group.name
    };
    groupModel.id = group.idGroup;
    groupModel.properties = group;
    groupModel.children = [];
    return groupModel;
}
exports.groupToTreeConfig = groupToTreeConfig;

function getGroupModel (idGroup, allGroups, rootNode) {
    let groupModel = getModel('group', idGroup, rootNode);
    if (!groupModel) {
        let group = allGroups.find(g => g.idGroup == idGroup);
        let parentGroupModel;
        if (!group.idParent) {
            parentGroupModel = rootNode;
        } else {
            parentGroupModel = getGroupModel(group.idParent, allGroups, rootNode);
        }
        groupModel = groupToTreeConfig(group);
        parentGroupModel.children.push(groupModel);
    }
    return groupModel;
}
exports.getGroupModel = getGroupModel;

function createProjectModel (project) {
    let projectModel = new Object();
    projectModel.type = 'project';
    projectModel.name = 'project';
    projectModel.id = project.idProject;
    projectModel.properties = project;
    projectModel.data = {
        childExpanded: true,
        icon: 'well-insight-16x16',
        label: project.name,
        selected: false
    };
    projectModel.children = new Array();
    return projectModel;
}
exports.createProjectModel = createProjectModel;

exports.projectToTreeConfig = function (project) {
    let projectModel = createProjectModel(project);
    let wiComponentService = __GLOBAL.wiComponentService;
    // project logplots
    let projectLogplots = [];
    wiComponentService.putComponent(wiComponentService.PROJECT_LOGPLOTS, projectLogplots);
    let projectLogplotsNode = createLogplotsNode(null, { isCollection: true });
    projectLogplotsNode.children = projectLogplots;
    // project crossplots
    let projectCrossplots = [];
    wiComponentService.putComponent(wiComponentService.PROJECT_CROSSPLOTS, projectCrossplots);
    let projectCrossplotsNode = createCrossplotsNode(null, { isCollection: true });
    projectCrossplotsNode.children = projectCrossplots;
    // project histograms
    let projectHistograms = [];
    wiComponentService.putComponent(wiComponentService.PROJECT_HISTOGRAMS, projectHistograms);
    let projectHistogramsNode = createHistogramsNode(null, { isCollection: true });
    projectHistogramsNode.children = projectHistograms;
    // well groups
    project.groups.forEach(function (group) {
        getGroupModel(group.idGroup, project.groups, projectModel);
    });
    // wells
    project.wells.forEach(function (well) {
        if (well.idGroup) {
            let groupModel = getGroupModel(well.idGroup, project.groups, projectModel);
            groupModel.children.push(wellToTreeConfig(well));
        } else {
            projectModel.children.push(wellToTreeConfig(well));
        }
    });

    projectModel.children.push(projectLogplotsNode);
    projectModel.children.push(projectCrossplotsNode);
    projectModel.children.push(projectHistogramsNode);
    return projectModel;
}

function dustbinToTreeConfig(dustbin) {
    var dustbinModel = new Object();
    dustbinModel.type = 'dustbin';
    dustbinModel.name = 'dustbin';
    dustbinModel.properties = {};
    dustbinModel.data = {
        childExpanded: false,
        icon: 'recycle-bin-empty-16x16',
        label: 'Recycle Bin',
        selected: false
    };
    dustbinModel.children = new Array();
    if (dustbin) {
        updateDustbinConfig(dustbin);
    }
    return dustbinModel;
}

exports.dustbinToTreeConfig = dustbinToTreeConfig;

function updateDustbinConfig(dustbin) {
    let dustbinModel = dustbinToTreeConfig();
    dustbinModel.children.push(createWellsNode(dustbin));
    dustbinModel.children.push(createDatasetsNode(dustbin));
    dustbinModel.children.push(createCurvesNode(dustbin));
    dustbinModel.children.push(createZoneSetsNode(dustbin, {isDeleted: true}));
    dustbinModel.children.push(createZonesNode(dustbin, {isDeleted: true}));
    dustbinModel.children.push(createLogplotsNode(dustbin, { isDeleted: true }));
    dustbinModel.children.push(createCrossplotsNode(dustbin, { isDeleted: true }));
    dustbinModel.children.push(createHistogramsNode(dustbin, { isDeleted: true }));
    return dustbinModel;
}

exports.updateDustbinConfig = updateDustbinConfig;


function visit(node, callback, options) {
    if (options && options.found) return;
    if (node.data && node.data.deleted) return;
    if (options && options.path && options.path.push)
        options.path.push(node);
    if (callback(node, options)) {
        if (options) options.found = true
    }
    if (node.children) {
        node.children.forEach(function (child) {
            visit(child, callback, options);
        });
    }
    if (options && options.path && options.path.pop)
        options.path.pop();
}

exports.visit = visit;

exports.getSelectedProjectNode = getSelectedProjectNode;

function getSelectedProjectNode() {
    const wiComponentService = __GLOBAL.wiComponentService;
    let rootNodes = wiComponentService.getComponent(wiComponentService.WI_EXPLORER).treeConfig;
    if (!rootNodes || rootNodes.length <= 0) return;
    return rootNodes[0];
    //return getSelectedPath().shift();
}

exports.getSelectedPath = getSelectedPath;

function getSelectedPath(foundCB, rootNode) {
    const wiComponentService = __GLOBAL.wiComponentService;
    if (!rootNode) {
        rootNode = wiComponentService.getComponent(wiComponentService.WI_EXPLORER).treeConfig[0];
    }
    if (!rootNode) return;
    let selectedPath = new Array();
    visit(rootNode, function (node, options) {
        if (foundCB) {
            if (foundCB(node)) {
                selectedPath = options.path.slice();
                return true;
            }
        } else if (node.data.selected == true) {
            selectedPath = options.path.slice();
            return true;
        }
        return false;
    }, {
        path: new Array()
    });
    return selectedPath;
}

exports.getCurveData = getCurveData;

function getCurveData(apiService, idCurve, callback) {
    apiService.dataCurve(idCurve, function (curve) {
        callback(null, curve);
    });
    /*apiService.post(apiService.DATA_CURVE, {
            idCurve
        }, function (curve) {
            callback(null, curve);
        });*/
}

exports.setupCurveDraggable = function (element, wiComponentService, apiService) {
    let dragMan = wiComponentService.getComponent(wiComponentService.DRAG_MAN);
    let selectedObjs;
    element.draggable({
        helper: function (event) {
            selectedObjs = $(`.wi-parent-node[type='curve']`).filter('.item-active').clone();
            let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
            if (!selectedNodes || selectedNodes.find(n => n.type != 'curve')) return $(event.currentTarget).clone();
            return $('<div/>').append(selectedObjs.find('.wi-parent-content div:nth-child(2)'));
        },
        start: function (event, ui) {
            dragMan.dragging = true;
            d3.selectAll('.vi-track-plot-container').style('z-index', 1);
        },
        stop: function (event, ui) {
            dragMan.dragging = false;
            let wiD3Ctrl = dragMan.wiD3Ctrl;
            let track = dragMan.track;
            let wiSlidingBarCtrl = dragMan.wiSlidingBarCtrl;
            dragMan.wiD3Ctrl = null;
            dragMan.track = null;
            d3.selectAll('.vi-track-plot-container').style('z-index', 'unset');
            function handleDrop(idCurves) {
                if (wiSlidingBarCtrl) {
                    let idCurve = idCurves[0];
                    let errorCode = wiSlidingBarCtrl.verifyDroppedIdCurve(idCurve);
                    console.log('drop curve into slidingBar', errorCode);
                    if (errorCode > 0) {
                        wiSlidingBarCtrl.createPreview(idCurve);
                        let logplotModel = wiSlidingBarCtrl.logPlotCtrl.getLogplotModel();
                        let logplotRequest = angular.copy(logplotModel.properties);
                        logplotRequest.referenceCurve = idCurve;
                        apiService.editLogplot(logplotRequest, function () {
                            logplotModel.properties.referenceCurve = idCurve;
                        });
                    }
                    else if (errorCode === 0) {
                        toastr.error("Cannot drop curve from another well");
                    }
                    return;
                }
                if (wiD3Ctrl && !track) {
                    const errorCode = wiD3Ctrl.verifyDroppedIdCurve(idCurves[0]);
                    if (errorCode > 0) {
                        wiD3Ctrl.addLogTrack(null, function (logTrackController) {
                            async.eachSeries(idCurves, (idCurve, next) => {
                                const viTrack = logTrackController.viTrack;
                                apiService.createLine({
                                    idTrack: viTrack.id,
                                    idCurve: idCurve,
                                    orderNum: viTrack.getCurveOrderKey()
                                }, function (line) {
                                    let lineModel = lineToTreeConfig(line);
                                    getCurveData(apiService, idCurve, function (err, data) {
                                        if (!err) logTrackController.addCurveToTrack(viTrack, data, lineModel.data);
                                        next(err);
                                    });
                                });
                            });
                        });
                    } else if (errorCode === 0) {
                        toastr.error("Cannot drop curve from another well");
                    }
                    return;
                }
                if (wiD3Ctrl && track) {
                    async.eachSeries(idCurves, (idCurve, next) => {
                        let errorCode = wiD3Ctrl.verifyDroppedIdCurve(idCurve);
                        if (errorCode > 0) {
                            apiService.createLine({
                                idTrack: track.id,
                                idCurve: idCurve,
                                orderNum: track.getCurveOrderKey()
                            }, function (line) {
                                let lineModel = lineToTreeConfig(line);
                                getCurveData(apiService, idCurve, function (err, data) {
                                    if (!err) wiD3Ctrl.getComponentCtrlByViTrack(track).addCurveToTrack(track, data, lineModel.data);
                                    next(err);
                                });
                            });
                        }
                        else if (errorCode === 0) {
                            toastr.error("Cannot drop curve from another well");
                        }
                        return;
                    })
                }
            }
            let idCurves = selectedObjs.map(function () { return parseInt($(this).attr('data')) }).get();
            if (idCurves.length) {
                handleDrop(idCurves);
            } else {
                let idCurve = parseInt(ui.helper.attr('data'));
                handleDrop([idCurve]);
            }
        },
        appendTo: 'body',
        revert: false,
        scroll: false,
        containment: 'document',
        cursor: 'move',
        cursorAt: {
            top: 0,
            left: 0
        }
    });
};

exports.createNewBlankLogPlot = function (wiComponentService, wiApiService, logplotName, type) {
    let currentWell = getCurrentWell();
    let dataRequest = {
        idWell: currentWell.properties.idWell,
        name: logplotName,
        option: 'blank-plot',
        plotTemplate: type ? type : null
    };
    return new Promise(function (resolve, reject) {
        wiApiService.post(wiApiService.CREATE_PLOT, dataRequest, function (logplot, err) {
            if (err) {
                reject();
            } else {
                logplot.parent = angular.copy(currentWell.properties);
                resolve(logplot);
            }

        });
    });
};

var createPointSet = function (pointSetData, callback) {
    __GLOBAL.wiApiService.createPointSet(pointSetData, function (pointSet) {
        console.log(pointSet);
        callback(pointSet);
    })
}
exports.createPointSet = createPointSet;
function createCrossplotToObjectOfTrack(objectOfTrack, curveX, curveY, pointSet, objectProps, wiApiService) {
    wiApiService.getWell(objectProps.idWell, function(wellProps) {
        curveX.minX = pointSet.scaleLeft;
        curveX.maxX = pointSet.scaleRight;
        curveY.minX = pointSet.scaleBottom;
        curveY.maxX = pointSet.scaleTop;
        pointSet.intervalDepthTop = objectProps.intervalDepthTop;
        pointSet.intervalDepthBottom = objectProps.intervalDepthBottom;

        let crossplotConfig = {
            curve1 : curveX,
            curve2 : curveY,
            config : {
                name : objectProps.name,
                idCrossPlot: objectProps.idCrossPlot,
                idWell : wellProps.idWell,
                topDepth : parseFloat(wellProps.topDepth),
                bottomDepth : parseFloat(wellProps.bottomDepth),
                pointSet : pointSet,
            },
            background : objectProps.background
        }
        console.log("Crossplot configurations: ", crossplotConfig);
        objectOfTrack.createCrossplotToForeignObject(crossplotConfig, wellProps);
    });
};
exports.createCrossplotToObjectOfTrack = createCrossplotToObjectOfTrack;
function openLogplotTab(wiComponentService, logplotModel, callback, isClosable = true) {
    let layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
    // let graph = wiComponentService.getComponent('GRAPH');
    layoutManager.putTabRightWithModel(logplotModel, isClosable);
    if (logplotModel.data.opened) return;
    logplotModel.data.opened = true;
    if (callback) wiComponentService.on(wiComponentService.LOGPLOT_LOADED_EVENT, function handler () {
        callback();
        wiComponentService.removeEvent(wiComponentService.LOGPLOT_LOADED_EVENT, handler);
    });
};
exports.openLogplotTab = openLogplotTab;

function getCurrentWell() {
    let currentWell = getSelectedPath().find(node => node.type == 'well');
    if(!currentWell){
        toastr.error("Please select well first!");
        return;
    }
    return currentWell;
}
exports.getCurrentWell = getCurrentWell;
function getStaticNode(type) {
    if (!type) return;
    let wiComponentService = __GLOBAL.wiComponentService;
    let currentWell = getSelectedPath().find(node => node.type == 'well');
    let model = null;
    if (currentWell) {
        visit(currentWell, function (node) {
            if (node.type == type) {
                model = node;
            }
        });
        if (model) return model;
    }
    let rootNodes = wiComponentService.getComponent(wiComponentService.WI_EXPLORER).treeConfig;
    let tmp = {children: rootNodes};
    if (!rootNodes || !rootNodes.length) return;
    visit(tmp, function (node) {
        if (node.type == type) {
            model = node;
        }
    });
    return model;
}
exports.getStaticNode = getStaticNode;

function getModel(type, id, rootNode) {
    if (!type || !id) return;
    let wiComponentService = __GLOBAL.wiComponentService;
    if (!rootNode) {
        rootNode = wiComponentService.getComponent(wiComponentService.WI_EXPLORER).treeConfig[0];
    }
    if (!rootNode) return;
    let model = null;
    visit(rootNode, function (node) {
        if (node.type == type && node.id == id) {
            model = node;
        }
    });
    return model;
}
exports.getModel = getModel;

exports.getParentByModel = function (modelType, idModel, parentType, rootNode) {
    var path = getSelectedPath(function (node) {
        return node.type == modelType && node.id == idModel;
    }, rootNode) || [];
    if (!parentType) return path[path.length - 2];
    return path.find(p => p.type == parentType);
};

exports.findLogplotModelById = function (logplotId) {
    let wiComponentService = __GLOBAL.wiComponentService;
    let rootNodes = wiComponentService.getComponent(wiComponentService.WI_EXPLORER).treeConfig;
    if (!rootNodes || !rootNodes.length) return;
    let plot = null;
    visit(rootNodes[0], function (node) {
        if (node.type == 'logplot' && node.id == logplotId) {
            plot = node;
        }
    });
    return plot;
}

function findDatasetById(idDataset) {
    let wiComponentService = __GLOBAL.wiComponentService;
    let rootNodes = wiComponentService.getComponent(wiComponentService.WI_EXPLORER).treeConfig;
    if (!rootNodes || !rootNodes.length) return;
    let dataset = null;
    visit(rootNodes[0], function (node) {
        if (node.type == 'dataset' && node.id == idDataset) {
            dataset = node;
        }
    });
    return dataset;
}

exports.findDatasetById = findDatasetById;

function findZoneSetById(idZoneSet) {
    let wiComponentService = __GLOBAL.wiComponentService;
    let rootNodes = wiComponentService.getComponent(wiComponentService.WI_EXPLORER).treeConfig;
    if (!rootNodes || !rootNodes.length) return;
    let zoneSet = null;
    visit(rootNodes[0], function (node) {
        if (node.type == 'zoneset' && node.id == idZoneSet) {
            zoneSet = node;
        }
    });
    return zoneSet;
}

exports.findZoneSetById = findZoneSetById;

function getRootFromWiExplorer() {
    let wiComponentService = __GLOBAL.wiComponentService;
    let wiExplorer = wiComponentService.getComponent(wiComponentService.WI_EXPLORER);
    if (!wiExplorer || !wiExplorer.treeConfig) return null;
    return wiExplorer.treeConfig[0];
}
function findWellById(idWell, rootNode) {
    let root = rootNode;
    if (!root) root = getRootFromWiExplorer();
    if (!root) return {};
    let well = null;
    visit(root, function (node) {
        if (node.type == 'well' && node.id == idWell) {
            well = node;
        }
    });
    return well;
}
exports.findWellById = findWellById;

function findWellByLogplot (idLogplot) {
    var path = getSelectedPath(function (node) {
        return node.type == "logplot" && node.id == idLogplot;
    }) || [];
    return path.find(p => p.type == 'well');
};
exports.findWellByLogplot = findWellByLogplot;

exports.findWellByCrossplot = function (idCrossPlot) {
    var path = getSelectedPath(function (node) {
        return node.type == 'crossplot' && node.id == idCrossPlot;
    }) || [];
    return path.find(p => p.type == 'well');
}

exports.findWellByHistogram = function (idHistogram) {
    var path = getSelectedPath(function (node) {
        return node.type == 'histogram' && node.id == idHistogram;
    }) || [];
    return path.find(p => p.type == 'well');
}

exports.findWellByComboview = function (idCombinedBox) {
    var path = getSelectedPath(function (node) {
        return node.type == 'comboview' && node.id == idCombinedBox;
    }) || [];
    return path[1];
}

exports.findWellByCurve = findWellByCurve;

function findWellByCurve(idCurve) {
    var path = getSelectedPath(function (node) {
        return node.type == 'curve' && node.id == idCurve;
    }) || [];
    return path.find(p => p.type == 'well');
}


function restrictedVisit(node, depth, callback) {
    if (!depth) return;
    if (callback) callback(node);
    if (node.children) {
        for (let child of node.children)
            restrictedVisit(child, depth - 1, callback);
    }
}
exports.findWells = findWells;
function findWells() {
    let wells = new Array();
    let wiComponentService = __GLOBAL.wiComponentService;
    let rootNodes = wiComponentService.getComponent(wiComponentService.WI_EXPLORER).treeConfig;
    if (!rootNodes || !rootNodes.length) return;
    let prjNode = rootNodes[0];
    restrictedVisit(prjNode, 3, function(node) {
        if (node.type == 'well') {
            wells.push(node);
        }
    });
    return wells;
}

exports.findHistogramModelById = findHistogramModelById;
function findHistogramModelById(idHistogram) {
    let wiComponentService = __GLOBAL.wiComponentService;
    let rootNodes = wiComponentService.getComponent(wiComponentService.WI_EXPLORER).treeConfig;
    if (!rootNodes || !rootNodes.length) return;
    let his = null;
    visit(rootNodes[0], function (node) {
        if (node.type == 'histogram' && node.id == idHistogram) {
            his = node;
        }
    });
    return his;
}

exports.findComboviewModelById = function (idComboview) {
    let wiComponentService = __GLOBAL.wiComponentService;
    let rootNodes = wiComponentService.getComponent(wiComponentService.WI_EXPLORER).treeConfig;
    if (!rootNodes || !rootNodes.length) return;
    let comboview = null;
    visit(rootNodes[0], function (node) {
        if (node.type == 'comboview' && node.id == idComboview) {
            comboview = node;
        }
    });
    return comboview;
}
// exports.parseTime = function (wiComponentService, time) {
//     let moment = wiComponentService.getComponent(wiComponentService.MOMENT);
//     let timestamp = 'DD-MM-YYYY, h:mm:ss a';
//
//     return moment(time).format(timestamp);
// };

exports.trackProperties = function (ModalService, wiComponentService) {
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    DialogUtils.trackPropertiesDialog(this.ModalService, function (ret) {
    });
};

function sortProjectData(projectData) {
    if (!projectData.wells) return;
    projectData.wells.sort((a, b) => {
        let nameA = a.name.toUpperCase();
        let nameB = b.name.toUpperCase();
        return nameA == nameB ? 0 : nameA > nameB ? 1 : -1;
    });
    projectData.wells.forEach(well => {
        well.datasets.sort((a, b) => {
            let nameA = a.name.toUpperCase();
            let nameB = b.name.toUpperCase();
            return nameA == nameB ? 0 : nameA > nameB ? 1 : -1;
        });
        well.datasets.forEach(dataset => {
            dataset.curves.sort((a, b) => {
                let nameA = a.name.toUpperCase();
                let nameB = b.name.toUpperCase();
                return nameA == nameB ? 0 : nameA > nameB ? 1 : -1;
            });
        });
        well.zonesets.sort((a, b) => {
            let nameA = a.name.toUpperCase();
            let nameB = b.name.toUpperCase();
            return nameA == nameB ? 0 : nameA > nameB ? 1 : -1;
        });
        well.zonesets.forEach(function (zoneset) {
            zoneset.zones.sort((a, b) => {
                let depthA = parseFloat(a.startDepth);
                let depthB = parseFloat(b.startDepth);
                return depthA - depthB;
            })
        })
    });
}

let refreshProjectState = function (idProject) {
    let wiComponentService = __GLOBAL.wiComponentService;
    let project = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);
    let dom = document.getElementById('treeContent');

    if (!project && !idProject) return;

    return new Promise(function (resolve, reject) {
        let payload = {
            idProject: idProject || project.idProject
        };
        let wiApiService = __GLOBAL.wiApiService;
        if (dom) {
            let ScrollTmp = dom.scrollTop;
            window.localStorage.setItem('scrollTmp', ScrollTmp);
        }
        wiApiService.post(wiApiService.GET_PROJECT, payload, function (projectRefresh) {
            sortProjectData(projectRefresh);

            wiComponentService.putComponent(wiComponentService.PROJECT_LOADED, projectRefresh);
            wiComponentService.emit(wiComponentService.PROJECT_REFRESH_EVENT);
            wiComponentService.emit(wiComponentService.DUSTBIN_REFRESH_EVENT);
            resolve(projectRefresh);
        });
    });
}
exports.refreshProjectState = refreshProjectState;

exports.renameWell = function renameWell (newName) {
    let wiComponentService = __GLOBAL.wiComponentService;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let selectedNode = getSelectedNode();
    if (selectedNode.type != 'well') return;
    let promptConfig = {
        title: '<span class="curve-data-16x16"></span> Rename Well',
        inputName: 'Name',
        input: newName || selectedNode.properties.name
    }
    DialogUtils.promptDialog(__GLOBAL.ModalService, promptConfig, function (ret) {
        if (!ret) return;
        let wiApiService = __GLOBAL.wiApiService;
        let wellInfo = angular.copy(selectedNode.properties);
        wellInfo.name = ret;
        wiApiService.editWell(wellInfo, function (res, err) {
            if (err) {
                renameWell(ret);
                return;
            }
            __GLOBAL.$timeout(function () {
                selectedNode.name = ret;
                selectedNode.properties.name = ret;
                selectedNode.data.label = ret;
                wiComponentService.emit(wiComponentService.RENAME_MODEL, selectedNode);
            })
        });
    });
}

exports.renameDataset = function renameDataset (newName) {
    let wiComponentService = __GLOBAL.wiComponentService;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let selectedNode = getSelectedNode();
    if (selectedNode.type != 'dataset') return;
    let promptConfig = {
        title: '<span class="curve-data-16x16"></span> Rename Dataset',
        inputName: 'Name',
        input: newName || selectedNode.properties.name
    }
    DialogUtils.promptDialog(__GLOBAL.ModalService, promptConfig, function (ret) {
        if (!ret) return;
        let wiApiService = __GLOBAL.wiApiService;
        let datasetInfo = angular.copy(selectedNode.properties);
        datasetInfo.name = ret;
        wiApiService.editDataset(datasetInfo, function (res, err) {
            if (err) {
                renameDataset(ret);
                return;
            }
            __GLOBAL.$timeout(function () {
                selectedNode.name = ret;
                selectedNode.properties.name = ret;
                selectedNode.data.label = ret;
                selectedNode.children.forEach(c => c.parent = ret);
                wiComponentService.emit(wiComponentService.RENAME_MODEL, selectedNode);
            })
        });
    });
}
exports.createDataset = function (name) {
    let wiComponentService = __GLOBAL.wiComponentService;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let selectedNode = getSelectedNode();
    if (selectedNode.type != 'well') return;
    let promptConfig = {
        title: '<span class="dataset-new-16x16"></span> Create New Dataset',
        inputName: 'Name',
        input: name || 'NewDataset'
    }
    DialogUtils.promptDialog(__GLOBAL.ModalService, promptConfig, function (ret) {
        if (!ret) return;
        let wiApiService = __GLOBAL.wiApiService;
        let datasetInfo = {
            name: ret,
            idWell: selectedNode.properties.idWell,
            datasetKey: selectedNode.properties.name,
            datasetLabel: selectedNode.properties.name
        }
        wiApiService.createDataset(datasetInfo, function (res, err) {
            if (err) {
                exports.createDataset(ret);
                return;
            }
            __GLOBAL.$timeout(function () {
                refreshProjectState();
            })
        });
    });
}

exports.exportCurve = function () {
    let selectedNode = getSelectedNode();
    if (selectedNode.type != 'curve') return;
    let wiApiService = __GLOBAL.wiApiService;
    wiApiService.exportCurve(selectedNode.properties.idCurve, function (data, type) {
        let blob = new Blob([data], {
            type: type
        });
        let a = document.createElement('a');
        let fileName = selectedNode.properties.name + '.xlsx';
        a.download = fileName;
        a.href = URL.createObjectURL(blob);
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        a.parentNode.removeChild(a);
    });
}

exports.renameCurve = function renameCurve (newName) {
    let wiComponentService = __GLOBAL.wiComponentService;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let selectedNode = getSelectedNode();
    if (selectedNode.type != 'curve') return;
    let promptConfig = {
        title: '<span class="curve-edit-16x16"></span> Rename Curve',
        inputName: 'Name',
        input: newName || selectedNode.properties.name
    }
    DialogUtils.promptDialog(__GLOBAL.ModalService, promptConfig, function (ret) {
        if (!ret) return;
        let wiApiService = __GLOBAL.wiApiService;
        let curveInfo = {
            idCurve: selectedNode.properties.idCurve,
            name: ret,
            idDataset: selectedNode.properties.idDataset,
            dataset: selectedNode.properties.dataset,
            unit: selectedNode.properties.unit
        }
        wiApiService.editCurve(curveInfo, function (res, err) {
            if (err) {
                renameCurve(ret);
                return;
            }
            __GLOBAL.$timeout(function () {
                selectedNode.name = ret;
                selectedNode.properties.name = ret;
                selectedNode.data.label = ret;
                wiComponentService.emit(wiComponentService.RENAME_MODEL, selectedNode);
            })
        });
    });
}

exports.copyCurve = function () {
    let wiComponentService = __GLOBAL.wiComponentService;
    let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
    if (selectedNodes[0].type != 'curve') return;
    wiComponentService.putComponent(wiComponentService.COPYING_CURVE, selectedNodes);
    wiComponentService.putComponent(wiComponentService.CUTTING_CURVE, null);
}

exports.cutCurve = function () {
    let wiComponentService = __GLOBAL.wiComponentService;
    let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
    if (selectedNodes[0].type != 'curve') return;
    wiComponentService.putComponent(wiComponentService.CUTTING_CURVE, selectedNodes);
    wiComponentService.putComponent(wiComponentService.COPYING_CURVE, null);
}

exports.pasteCurve = function () {
    let wiComponentService = __GLOBAL.wiComponentService;
    let selectedNode = getSelectedNode();
    if (!selectedNode) return;
    if (selectedNode.type != 'curve' && selectedNode.type != 'dataset') return;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let wiApiService = __GLOBAL.wiApiService;
    let currentDataset;
    if (selectedNode.type == 'curve') {
        // selectedNode is Curve
        currentDataset = findDatasetById(selectedNode.properties.idDataset);
    } else {
        // selectedNode is Dataset
        currentDataset = selectedNode;
    }
    // if copying
    let copyingCurves = wiComponentService.getComponent(wiComponentService.COPYING_CURVE);
    if (Array.isArray(copyingCurves)) {
        async.eachOf(copyingCurves, function (copyingCurve, index, next) {
            let isCurveExist = false;
            currentDataset.children.forEach(function (curve) {
                if (copyingCurve.properties.name == curve.properties.name) {
                    isCurveExist = true;
                }
            });
            if (!isCurveExist) {
                if (copyingCurve.properties.idDataset == selectedNode.properties.idDataset) return;
                let curveInfo = {
                    idCurve: copyingCurve.properties.idCurve,
                    desDatasetId: selectedNode.properties.idDataset
                }
                wiApiService.copyCurve(curveInfo, function (curve) {
                    next();
                });
                wiComponentService.putComponent(wiComponentService.COPYING_CURVE, null);
            } else {
                // curve existed
                DialogUtils.confirmDialog(__GLOBAL.ModalService, "WARNING!", copyingCurve.properties.name + " existed! Override it ?", function (yes) {
                    if (yes) {
                        if (copyingCurve.properties.idDataset == selectedNode.properties.idDataset) return;
                        let curveInfo = {
                            idCurve: copyingCurve.properties.idCurve,
                            desDatasetId: selectedNode.properties.idDataset
                        }
                        wiApiService.copyCurve(curveInfo, function (curve) {
                            next();
                        });
                        wiComponentService.putComponent(wiComponentService.COPYING_CURVE, null);
                    } else {
                        next();
                        return;
                    }
                });
            }
        }, function (err) {
            refreshProjectState();
        });
        return;
    }
    // if cutting
    let cuttingCurves = wiComponentService.getComponent(wiComponentService.CUTTING_CURVE);
    if (Array.isArray(cuttingCurves)) {
        async.eachOf(cuttingCurves, function (cuttingCurve, index, next) {
            let isCurveExist = false;
            currentDataset.children.forEach(function (curve) {
                if (cuttingCurve.properties.name == curve.properties.name) {
                    isCurveExist = true;
                }
            });
            if (!isCurveExist) {
                if (cuttingCurve.properties.idDataset == selectedNode.properties.idDataset) return;
                let curveInfo = {
                    idCurve: cuttingCurve.properties.idCurve,
                    desDatasetId: selectedNode.properties.idDataset,
                }
                wiApiService.cutCurve(curveInfo, function () {
                    next();
                });
                wiComponentService.putComponent(wiComponentService.CUTTING_CURVE, null);
            } else {
                // curve existed
                DialogUtils.confirmDialog(__GLOBAL.ModalService, "WARNING!", cuttingCurve.properties.name + " existed! Override it ?", function (yes) {
                    if (yes) {
                        if (cuttingCurve.properties.idDataset == selectedNode.properties.idDataset) return;
                        let curveInfo = {
                            idCurve: cuttingCurve.properties.idCurve,
                            desDatasetId: selectedNode.properties.idDataset,
                        }
                        wiApiService.cutCurve(curveInfo, function () {
                            next();
                        });
                        wiComponentService.putComponent(wiComponentService.CUTTING_CURVE, null);
                    } else {
                        next();
                        return;
                    }
                });
            }
        }, function (err) {
            refreshProjectState();
        })
        return;
    }
}


exports.curveOptions = function (currentTrack, currentCurve, index) {
    let options = {
        // Locally use properties
        _index: index,
        idLine: currentCurve.id,
        idTrack: currentTrack.id,
        showHeader: currentCurve.showHeader,
        showDataset: currentCurve.showDataset, // add to currentCurve - Canh
        ignoreMissingValues: false,
        alias: currentCurve.alias,
        minValue: currentCurve.minX,
        maxValue: currentCurve.maxX,
        autoValueScale: currentCurve.autoValueScale,
        displayType: currentCurve.scale,
        displayMode: currentCurve.displayMode,
        wrapMode: currentCurve.wrapMode.capitalize(),
        blockPosition: currentCurve.blockPosition.capitalize(),
        displayAs: currentCurve.displayAs.capitalize()
    }
    return options;
}
exports.mergeLineObj = function (curveOptions, lineStyle, symbolStyle) {
    let lineObj = {};
    angular.extend(lineObj, curveOptions, lineStyle, symbolStyle);
    lineObj.lineStyle = JSON.stringify(lineObj.lineStyle);
    lineObj.symbolLineDash = JSON.stringify(lineObj.symbolLineDash);
    return lineObj;
};
exports.mergeShadingObj1 = function (shadingOptions, fillPatternStyles, variableShadingStyle) {

    let shadingObj = new Object();
    angular.extend(shadingObj, shadingOptions);
    if (shadingObj.shadingStyle == 'fillPattern') {
        //if (!shadingObj.isNegPosFilling) {
        if (!shadingObj.isNegPosFill) {
            shadingObj.fill = fillPatternStyles.fill;
        } else {
            shadingObj.positiveFill = fillPatternStyles.positiveFill;
            shadingObj.negativeFill = fillPatternStyles.negativeFill;
        }
    }
    else if (shadingObj.shadingStyle == 'variableShading') {
        shadingObj.idControlCurve = variableShadingStyle.idControlCurve;
        if (!shadingObj.isNegPosFill) {
            shadingObj.fill = variableShadingStyle.fill;
        } else {
            shadingObj.positiveFill = variableShadingStyle.positiveFill;
            shadingObj.negativeFill = variableShadingStyle.negativeFill;
        }
        // shadingObj.fill.display = true;
    } else {
        error("shadingObj has undefined shadingStyle");
    }
    return shadingObj;
}
exports.mergeShadingObj = function (shadingOptions, fillPatternStyles, variableShadingStyle) {

    let shadingObj = new Object();
    angular.extend(shadingObj, shadingOptions);

    shadingObj.fill.pattern = fillPatternStyles.fill.pattern;
    shadingObj.fill.varShading = variableShadingStyle.fill.varShading;
    shadingObj.positiveFill.pattern = fillPatternStyles.positiveFill.pattern;
    shadingObj.positiveFill.varShading = variableShadingStyle.positiveFill.varShading;
    shadingObj.negativeFill.pattern = fillPatternStyles.negativeFill.pattern;
    shadingObj.negativeFill.varShading = variableShadingStyle.negativeFill.varShading;

    shadingObj.fill.varShading.palette = variableShadingStyle.fill.varShading.palName;
    shadingObj.positiveFill.varShading.palette = variableShadingStyle.positiveFill.varShading.palName;
    shadingObj.negativeFill.varShading.palette = variableShadingStyle.negativeFill.varShading.palName;

    if (shadingObj.shadingStyle == 'pattern') {
        shadingObj.fill.display = fillPatternStyles.fill.display;
        shadingObj.positiveFill.display = fillPatternStyles.positiveFill.display;
        shadingObj.negativeFill.display = fillPatternStyles.negativeFill.display;

        shadingObj.fill.shadingType = 'pattern';
        shadingObj.positiveFill.shadingType = 'pattern';
        shadingObj.negativeFill.shadingType = 'pattern';

    }
    else if (shadingObj.shadingStyle == 'varShading') {
        shadingObj.idControlCurve = variableShadingStyle.idControlCurve;
        shadingObj.fill.display = variableShadingStyle.fill.display;
        shadingObj.positiveFill.display = variableShadingStyle.positiveFill.display;
        shadingObj.negativeFill.display = variableShadingStyle.negativeFill.display;

        shadingObj.fill.shadingType = 'varShading';
        shadingObj.positiveFill.shadingType = 'varShading';
        shadingObj.negativeFill.shadingType = 'varShading';

    } else {
        error("shadingObj has undefined shadingStyle");
    }
    return shadingObj;
}
exports.changeLine = function (lineObj, wiApiService, callback) {
    wiApiService.editLine(lineObj, function (result) {
        if (callback) callback(result);
    });
}
exports.changeTrack = function (trackObj, wiApiService, callback) {
    wiApiService.editTrack(trackObj, function (result) {
        if (callback) callback(result);
    });
}
exports.editDepthTrack = function (depthTrackObj, wiApiService, callback) {
    wiApiService.editDepthTrack(depthTrackObj, function (result) {
        if (callback) callback(result);
    });
}

function editProperty(item, callback) {
    let wiApiService = __GLOBAL.wiApiService;
    let wiComponentService = __GLOBAL.wiComponentService;
    let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
    let selectedNode = selectedNodes[0];
    let properties = selectedNode.properties;
    let newProperties = angular.copy(properties);
    newProperties[item.key] = item.value;
    if (JSON.stringify(newProperties) === JSON.stringify(properties)) return;
    switch (selectedNode.type) {
        case 'well':
            wiApiService.editWell(newProperties, function () {
                refreshProjectState().then(function () {
                    callback && callback();
                });
            });
            break;
        case 'dataset':
            wiApiService.editDataset(newProperties, function () {
                refreshProjectState().then(function () {
                    callback && callback();
                });
            });
            break;
        case 'curve':
            let promises = [];
            selectedNodes.forEach(selectedNode => {
                properties = selectedNode.properties;
                newProperties = angular.copy(properties);
                newProperties[item.key] = item.value;
                if (item.key == 'unit') {
                    wiApiService.familyUpdate({
                        idFamily: properties.idFamily,
                        idFamilySpec: item.value
                    }, function (res, err) {
                        if (err) return;
                        putListFamily(callback);
                    })
                    return;
                }
                if (item.key == 'idFamily') {
                    if (!newProperties.idFamily) newProperties.idFamily = null;
                    else {
                        const family = getListFamily().find(family => family.idFamily == newProperties.idFamily);
                        if (family) newProperties.unit = family.family_spec.unit;
                    }
                }
                promises.push(new Promise(resolve => {
                    wiApiService.editCurve(newProperties, function () {
                        resolve();
                    });
                }));
            });
            Promise.all(promises).then(() => {
                refreshProjectState().then(function () {
                    selectedNodes.forEach(n => updateLinesOnCurveEdited(n));
                    callback && callback();
                });
            }).catch();
            break;
        case 'zoneset':
            wiApiService.editZoneSet(newProperties, function () {
                refreshProjectState().then(function () {
                    callback && callback();
                });
            });
            break;
        case 'zone':
            wiApiService.editZone(newProperties, function () {
                refreshProjectState().then(function () {
                    callback && callback();
                });
            });
            break;
        case 'logplot':
            wiApiService.editLogplot(newProperties, function () {
                refreshProjectState().then(function () {
                    callback && callback();
                });
            });
            break;
        default:
            return;
    }
}

exports.upperCaseFirstLetter = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
exports.editProperty = editProperty;

exports.createCrossplot = function (idWell, crossplotName, callback, crossTemplate, fromCurves = {}) {
    let DialogUtils = __GLOBAL.wiComponentService.getComponent(__GLOBAL.wiComponentService.DIALOG_UTILS);
    let crossplotProps;
    let pointSetProps;
    let crossplotModel;
    async.series([function(cb) {
        __GLOBAL.wiApiService.createCrossplot({
            idWell: idWell,
            name: crossplotName,
            crossTemplate: crossTemplate
        }, function (crossplot, err) {
            if (err) {
                cb("create Crossplot failed");
            }
            else {
                crossplotProps = crossplot;
                // for crosstemplate
                if (crossplot.foundCurveX && crossplot.foundCurveY) {
                    console.log('found all curves');
                }
                else {
                    let curveX = crossplot.foundCurveX ? "Curve X: FOUND" : "Curve X: NOT FOUND<br>";
                    let curveY = crossplot.foundCurveY ? "Curve Y: FOUND" : "Curve Y: NOT FOUND<br>";
                    // if (crossTemplate) DialogUtils.warningMessageDialog(__GLOBAL.ModalService, curveX + "<br>" + curveY);
                }
                cb();
            }
        });
    }, function(cb) {
        if(!crossTemplate){
            __GLOBAL.wiApiService.createPointSet({
                idCrossPlot: crossplotProps.idCrossPlot,
                idWell: idWell,
                idCurveX: (fromCurves.CurveX || {}).idCurve || null,
                idCurveY: (fromCurves.CurveY || {}).idCurve || null,
                idCurveZ: (fromCurves.CurveZ || {}).idCurve || null,
                majorX: 5,
                minorX: 5,
                majorY: 5,
                minorY: 5,
                scaleLeft:(fromCurves.CurveX || {}).minX != 'undefined'? (fromCurves.CurveX || {}).minX : null,
                scaleRight:(fromCurves.CurveX || {}).maxX != 'undefined'? (fromCurves.CurveX || {}).maxX : null,
                scaleBottom:(fromCurves.CurveY || {}).minX != 'undefined'? (fromCurves.CurveY || {}).minX : null,
                scaleTop:(fromCurves.CurveY || {}).maxX != 'undefined'? (fromCurves.CurveY || {}).maxX : null
            }, function (pointSet, err) {
                if (err) {
                    cb('create pointset failed');
                }
                else {
                    pointSetProps = pointSet;
                    cb();
                }
            });
        } else {
            cb();
        }
    }, function(cb) {
        refreshProjectState().then(function () {
            cb();
        });
    }, function(cb) {
        crossplotModel = getModel('crossplot', crossplotProps.idCrossPlot);
        __GLOBAL.wiApiService.getCrossplot(crossplotProps.idCrossPlot, function(dataReturn) {
            crossplotModel.properties = dataReturn;
            cb();
        })
    }], function(err, results) {
        if (!callback) return;
        callback(err, crossplotModel);
    });
}

function openCrossplotTab(crossplotModel) {
    let wiComponentService = __GLOBAL.wiComponentService;
    let layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
    layoutManager.putTabRightWithModel(crossplotModel);
    //if (callback) callback(wiCrossplotCtrl);
};

exports.openCrossplotTab = openCrossplotTab;
/*
function openCrossplotTab(crossplotModel, callback) {

    let wiComponentService = __GLOBAL.wiComponentService;
    let wiApiService = __GLOBAL.wiApiService;
    let layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
    layoutManager.putTabRightWithModel(crossplotModel);
    let graph = wiComponentService.getComponent('GRAPH');
    if (crossplotModel.data.opened) return;
    crossplotModel.data.opened = true;
    let crossplotName = 'crossplot' + crossplotModel.properties.idCrossPlot;
    let wiCrossplotCtrl = __GLOBAL.wiComponentService.getComponent(crossplotName);
    let wiD3CrossplotCtrl = wiCrossplotCtrl.getWiD3CrossplotCtrl();

    let wellProps = findWellById(crossplotModel.properties.idWell);
    wiD3CrossplotCtrl.loading = true;
    wiApiService.getCrossplot(crossplotModel.properties.idCrossPlot, function (crossplot) {
        if (crossplot.pointsets && crossplot.pointsets.length) {
            let pointSet = crossplot.pointsets[0];
            console.log("crossplot", crossplot);
            if (!pointSet.idCurveX || !pointSet.idCurveY) {
                wiD3CrossplotCtrl.loading = false;
                return;
            }

            wiApiService.dataCurve(pointSet.idCurveX, function (dataX) {
                wiApiService.dataCurve(pointSet.idCurveY, function (dataY) {
                    function createViCrossplot() {
                        let curveX = getModel('curve', pointSet.idCurveX);
                        let curveY = getModel('curve', pointSet.idCurveY);

                        wiD3CrossplotCtrl.pointSet = pointSet;
                        wiD3CrossplotCtrl.linkModels();
                        crossplot.pointSet = wiD3CrossplotCtrl.pointSet;

                        if (Array.isArray(crossplot.polygons) && crossplot.polygons.length > 0) {
                            for (let polygon of crossplot.polygons) {
                                try {
                                    polygon.points = JSON.parse(polygon.points);
                                } catch (error) {
                                }
                            }
                        }
                        if (Array.isArray(crossplot.regressionlines) && crossplot.regressionlines.length > 0) {
                            for (let regLine of crossplot.regressionlines) {
                                try {
                                    let pArr = [];
                                    regLine.polygons.forEach(function (p, index) {
                                        pArr.push(p.idPolygon);
                                    })
                                    regLine.polygons = pArr;
                                    regLine.lineStyle = JSON.parse(regLine.lineStyle);
                                } catch (e) {
                                    console.log(e);
                                }
                            }
                        }
                        if (Array.isArray(crossplot.user_define_lines) && crossplot.user_define_lines.length > 0) {
                            for (let udLine of crossplot.user_define_lines) {
                                try {
                                    udLine.lineStyle = JSON.parse(udLine.lineStyle);
                                } catch (e) {
                                    console.log(e);
                                }
                            }
                        }
                        if (!crossplot.axisColors || crossplot.axisColors == 'null') {
                            crossplot.axisColors = [];
                        }
                        else if (typeof crossplot.axisColors == 'string') {
                            crossplot.axisColors = JSON.parse(crossplot.axisColors);
                        }

                        let viCurveX = graph.buildCurve(curveX, dataX, wellProps.properties);
                        let viCurveY = graph.buildCurve(curveY, dataY, wellProps.properties);

                        let crossplotConfig = angular.copy(crossplot);
                        crossplotConfig.regressionLines = crossplot.regressionlines;
                        crossplotConfig.userDefineLines = crossplot.user_define_lines;

                        if (Array.isArray(crossplot.ternaries) && crossplot.ternaries.length > 0) {
                            crossplotConfig.ternary = {
                                vertices: crossplot.ternaries.map(function (vertex) {
                                    return {
                                        idVertex: vertex.idTernary,
                                        x: vertex.xValue,
                                        y: vertex.yValue,
                                        showed: vertex.show,
                                        used: vertex.usedIn,
                                        name: vertex.name,
                                        style: vertex.style
                                    }
                                })
                            }
                        }

                        wiD3CrossplotCtrl.loading = false;
                        if (crossplot.discriminator && crossplot.discriminator != 'null' && crossplot.discriminator != {}) {
                            console.log('crossplotDiscrim', crossplot.discriminator);
                            crossplot.discriminator = JSON.parse(crossplot.discriminator);
                            evaluateExpr(wellProps, crossplot.discriminator, function (result) {
                                crossplotConfig.discriminatorData = result;
                                wiD3CrossplotCtrl.createVisualizeCrossplot(viCurveX, viCurveY, crossplotConfig);
                            });
                        }
                        else {
                            wiD3CrossplotCtrl.createVisualizeCrossplot(viCurveX, viCurveY, crossplotConfig);
                        }
                        //__GLOBAL.$timeout(function() {
                        //    wiD3CrossplotCtrl.createVisualizeCrossplot(viCurveX, viCurveY, crossplotConfig);
                        //}, 1500);
                    }

                    if (pointSet.idCurveZ) {
                        wiApiService.dataCurve(pointSet.idCurveZ, function (dataZ) {
                            let curveZ = getModel('curve', pointSet.idCurveZ);
                            let viCurveZ = graph.buildCurve(curveZ, dataZ, wellProps.properties);
                            pointSet.curveZ = viCurveZ;
                            createViCrossplot();
                        });
                    } else {
                        createViCrossplot();
                    }
                })
            })
        }
        else {
            wiD3CrossplotCtrl.loading = false;
        }
    })
    if (callback) callback(wiCrossplotCtrl);
};
*/
exports.createHistogram = function (idWell, curve, histogramName, histogramTemplate) {
    let DialogUtils = __GLOBAL.wiComponentService.getComponent(__GLOBAL.wiComponentService.DIALOG_UTILS);
    let dataRequest = curve ? {
        idWell: idWell,
        idCurve: curve.idCurve,
        leftScale: curve.minX,
        rightScale: curve.maxX,
        name: histogramName,
        color:curve.line.color
    } : {
        idWell: idWell,
        name: histogramName,
        histogramTemplate: histogramTemplate
    };
    return new Promise(function (resolve, reject) {
        __GLOBAL.wiApiService.createHistogram(dataRequest, function (histogram, err) {
            if (!err) {
                resolve(histogram);
                let histogramModel = histogramToTreeConfig(histogram);
                refreshProjectState().then(function () {
                    openHistogramTab(histogramModel);
                });
                // setTimeout(function () {
                //     if (histogram.noCurveFound || histogram.noCurveFound == "true") {
                //         DialogUtils.warningMessageDialog(__GLOBAL.ModalService, "NO CURVE FOUND");
                //     }
                // }, 1000);
            } else {
                reject();
            }
        })
    })
};

function openHistogramTab(histogramModel) {
    let wiComponentService = __GLOBAL.wiComponentService;
    let layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
    layoutManager.putTabRightWithModel(histogramModel);
    if (histogramModel.data.opened) return;
    histogramModel.data.opened = true;
    // if (callback) callback();
};
exports.openHistogramTab = openHistogramTab;

exports.createComboview = function (idWell, comboviewName, comboviewTemplate) {
    let dataRequest = {
        idWell: idWell,
        name: comboviewName,
        selection: '',
        idLogPlots: null,
        idCrossPlots: null,
        idHistograms: null
    };

    return new Promise (function (resolve, reject) {
        __GLOBAL.wiApiService.createCombinedBox(dataRequest, function (combinedBox) {
            if (combinedBox.name) {
                resolve(combinedBox);
            } else {
                reject(combinedBox);
            }
        });
    });
}

function openComboviewTab(comboviewModel) {
    let wiComponentService = __GLOBAL.wiComponentService;
    let layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
    __GLOBAL.wiApiService.getCombinedBox(comboviewModel.properties.idCombinedBox, function (data) {
        let toolBox = data.combined_box_tools;
        let selections = data.selection_tools;
        for (let i = 0; i < selections.length; i++) {
            let tool = toolBox.find(tool => tool.idCombinedBoxTool == selections[i].idCombinedBoxTool);
            selections[i].color = tool.color;
            selections[i].name = tool.name;
        }
        let plots = data.plots;
        let histograms = data.histograms;
        let crossplots = data.cross_plots;
        // self.init();
        comboviewModel.properties.toolBox = toolBox;
        comboviewModel.properties.selections = selections;
        comboviewModel.properties.plots = plots;
        comboviewModel.properties.histograms = histograms;
        comboviewModel.properties.crossplots = crossplots;
        layoutManager.putTabRightWithModel(comboviewModel);
        if (comboviewModel.data.opened) return;
        comboviewModel.data.opened = true;
    });
}

exports.openComboviewTab = openComboviewTab;

function getDpi() {
    let inch = document.createElement('inch');
    inch.style = 'height: 1in; width: 1in; left: -100%; position: absolute; top: -100%;';
    document.body.appendChild(inch);
    let devicePixelRatio = window.devicePixelRatio || 1;
    let dpi = inch.clientWidth * devicePixelRatio;
    document.body.removeChild(inch);
    return dpi;
}

exports.getDpi = getDpi;

function inchToPixel(inch) {
    return getDpi() * inch;
}

exports.inchToPixel = inchToPixel;

function pixelToInch(px) {
    let inch = Math.round(px / getDpi() * 10000) / 10000;
    return inch
}

exports.pixelToInch = pixelToInch;

function getDpcm() {
    return getDpi() / 2.54;
}

exports.getDpcm = getDpcm;

function cmToPixel(cm) {
    let dpCm = getDpi() / 2.54;
    return dpCm * cm;
}

exports.cmToPixel = cmToPixel;

function pixelToCm(px) {
    let dpCm = getDpi() / 2.54;
    let cm = Math.round(px / dpCm * 1000) / 1000;
    return cm
}

exports.pixelToCm = pixelToCm;

function hexToRgbA(hex) {
    var c;
    var hexStr = hex;
    if (!hex || hex.length == 0) {
        hexStr = '#FFFFFE';
    }
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hexStr)) {
        c = hexStr.substring(1).split('');
        if (c.length == 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');

        return {
            r: (c >> 16) & 255,
            g: (c >> 8) & 255,
            b: c & 255,
            a: 1
        };
    }

    throw new Error('Bad Hex');
}

exports.hexToRgbA = hexToRgbA;

exports.rgbaObjToString = function (rgbaObj) {
    return 'rgba(' + rgbaObj.r + ',' + rgbaObj.g + ',' + rgbaObj.b + ',' + rgbaObj.a + ')';
}

function getValPalette(palName, paletteList) {
    console.log("NAME", paletteList.palName);
    return paletteList.palName;
}

exports.getValPalette = getValPalette;

function putListFamily(callback) {
    __GLOBAL.wiApiService.listFamily(function (families) {
        // families.sort((a,b) => {
        //     if (a.name.toLowerCase() < b.name.toLowerCase()) {
        //         return -1;
        //     }
        //     if (a.name.toLowerCase() > b.name.toLowerCase()) {
        //         return 1;
        //     }
        //     if (a.name.toLowerCase() == b.name.toLowerCase()) {
        //         return 0;
        //     }
        // });
        families.sort(function(a, b) {
            return parseInt(a.idFamily) - parseInt(b.idFamily);
        });
        __GLOBAL.wiComponentService.putComponent(__GLOBAL.wiComponentService.LIST_FAMILY, families);
        callback && callback();
    })
}

exports.putListFamily = putListFamily;

function getListFamily() {
    return __GLOBAL.wiComponentService.getComponent(__GLOBAL.wiComponentService.LIST_FAMILY);
}

exports.getListFamily = getListFamily;

exports.openZonemanager = function (item) {
    let wiComponentService = __GLOBAL.wiComponentService;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    DialogUtils.zoneManagerDialog(__GLOBAL.ModalService, item);
}
/*exports.getScaleCurveIfNotFamily = function(idCurve) {
    __GLOBAL.wiApiService.scaleCurve(idCurve, function(rangeObj) {
        console.log("rangeObj", rangeObj);
    })
}*/

exports.renameZoneSet = function renameZoneSet (zoneSetModel, newName) {
    let wiComponentService = __GLOBAL.wiComponentService;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let promptConfig = {
        title: '<span class="user-define-16x16"></span> Rename ZoneSet',
        inputName: 'Name',
        input: newName || zoneSetModel.properties.name
    }
    DialogUtils.promptDialog(__GLOBAL.ModalService, promptConfig, function (ret) {
        if (!ret) return;
        let wiApiService = __GLOBAL.wiApiService;
        let zoneSetInfo = angular.copy(zoneSetModel.properties);
        zoneSetInfo.name = ret;
        wiApiService.editZoneSet(zoneSetInfo, function (res, err) {
            if (err) {
                renameZoneSet(zoneSetModel, newName);
                return;
            }
            __GLOBAL.$timeout(function () {
                zoneSetModel.name = ret;
                zoneSetModel.properties.name = ret;
                zoneSetModel.data.label = ret;
                wiComponentService.emit(wiComponentService.RENAME_MODEL, zoneSetModel);
            })
        });
    });
}

exports.updateWiHistogramOnModelDeleted = function (model) {
    let wiComponentService = __GLOBAL.wiComponentService;
    switch (model.type) {
        case 'curve':
            let idCurve = model.properties.idCurve;
            let wellModel = findWellByCurve(idCurve);
            let histogramModels = wellModel.children.find(child => child.type == 'histograms');
            histogramModels.children.forEach(function (histogramModel) {
                let wiHistogramCtrl = wiComponentService.getComponent('histogram' + histogramModel.properties.idHistogram);
                if (!wiHistogramCtrl) return;
                let wiD3Ctrl = wiHistogramCtrl.getwiD3Ctrl();
                if (histogramModel.properties.idCurve && wiD3Ctrl.hasThisCurve(idCurve)) {
                    wiD3Ctrl.unloadCurve();
                }
                let refWindCtrl = wiComponentService.getComponent(wiHistogramCtrl.getWiRefWindCtrlName());
                if(refWindCtrl){
                    for(let i = refWindCtrl._viCurves.length - 1; i >= 0; i--){
                        if(refWindCtrl._viCurves[i].idCurve == idCurve) refWindCtrl.removeRefCurve(i);
                    }
                }
            });
            break;
        default:
            console.log('not implemented')
            return;
    }
}

exports.updateWiCrossplotOnModelDeleted = function updateWiCrossplotOnModelDeleted(model) {
    let wiComponentService = __GLOBAL.wiComponentService;
    switch (model.type) {
        case 'curve':
            let idCurve = model.properties.idCurve;
            let wellModel = findWellByCurve(idCurve);
            let crossplotModels = wellModel.children.find(child => child.type == 'crossplots');
            let layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
            crossplotModels.children.forEach(function (crossplotModel) {
                let wiCrossplotCtrl = wiComponentService.getComponent('crossplot' + crossplotModel.properties.idCrossPlot);
                if (!wiCrossplotCtrl) return;
                let wiD3CrossplotCtrl = wiCrossplotCtrl.getWiD3CrossplotCtrl();
                let pointSet = wiD3CrossplotCtrl.getPointSet(wiD3CrossplotCtrl.crossplotModel.properties);
                if (idCurve == pointSet.idCurveX || idCurve == pointSet.idCurveY) {
                    //layoutManager.removeTabWithModel(crossplotModel);
                    wiD3CrossplotCtrl.removeVisualizeCrossplot();
                } else if (idCurve == pointSet.idCurveZ) {
                    wiD3CrossplotCtrl.updateAll();
                }
            });
            break;
        default:
            console.log('not implemented')
            return;
    }
}

exports.updateWiLogplotOnModelDeleted = function updateWiLogplotOnModelDeleted(model) {
    let wiComponentService = __GLOBAL.wiComponentService;
    switch (model.type) {
        case 'curve':
            let idCurve = model.properties.idCurve;
            let wellModel = findWellByCurve(idCurve);
            let logplotModels = wellModel.children.find(child => child.type == 'logplots');
            logplotModels.children.forEach(function (logplotModel) {
                let wiLogplotCtrl = wiComponentService.getComponent('logplot' + logplotModel.properties.idPlot);
                if (!wiLogplotCtrl) return;
                let wiD3Ctrl = wiLogplotCtrl.getwiD3Ctrl();
                let viTracks = wiD3Ctrl.getTracks();
                viTracks.forEach(function (viTrack) {
                    if (!viTrack.isLogTrack()) return;
                    let curves = viTrack.getCurves().filter(curve => curve.idCurve == idCurve);
                    curves.forEach(curve => {
                        viTrack.removeCurve(curve);
                    })
                })
            });
            break;
        default:
            console.log('not implemented')
            return;
    }
}

function updateLinesOnCurveEdited(curveModel) {
    let wiComponentService = __GLOBAL.wiComponentService;
    let wiApiService = __GLOBAL.wiApiService;
    let idCurve = curveModel.properties.idCurve;
    let wellModel = findWellByCurve(idCurve);
    let logplotModels = wellModel.children.find(child => child.type == 'logplots');
    logplotModels.children.forEach(function (logplotModel) {
        let wiLogplotCtrl = wiComponentService.getComponent('logplot' + logplotModel.properties.idPlot);
        if (!wiLogplotCtrl) return;
        let wiD3Ctrl = wiLogplotCtrl.getwiD3Ctrl();
        let viTracks = wiD3Ctrl.getTracks();
        viTracks.forEach(function (viTrack) {
            if (!viTrack.isLogTrack()) return;
            let viCurves = viTrack.getCurves().filter(curve => curve.idCurve == idCurve);
            viCurves.forEach(viCurve => {
                wiApiService.infoLine(viCurve.id, function (line) {
                    viCurve.setProperties(line);
                    viCurve.doPlot();
                })
            })
        })
    });
}

exports.updateLinesOnCurveEdited = updateLinesOnCurveEdited;

function getPalettes(callback) {
    let wiApiService = __GLOBAL.wiApiService;
    let wiComponentService = __GLOBAL.wiComponentService;
    let pals = wiComponentService.getComponent(wiComponentService.PALETTES);
    if (pals) {
        if (callback) callback(pals);
        return;
    }
    else {
        wiApiService.getPalettes(function (paletteList) {
            wiComponentService.putComponent(wiComponentService.PALETTES, paletteList);
            if (callback) callback(paletteList);
        });
        return;
    }
}

exports.getPalettes = getPalettes;

function findFamilyById(idFamily) {
    if (!idFamily) return null;
    let wiComponentService = __GLOBAL.wiComponentService;
    let families = wiComponentService.getComponent(wiComponentService.LIST_FAMILY);
    return families.binarySearch(function (family) {
        return family.idFamily === idFamily;
    }, idFamily);
}

exports.findFamilyById = findFamilyById;

exports.evaluateExpr = evaluateExpr;

function evaluateExpr(well, discriminator, callback) {
    let result = new Array();
    let length = (well.bottomDepth - well.topDepth) / well.step;
    let curveSet = new Set();
    let curvesData = new Array();
    let spinner = __GLOBAL.wiComponentService.getComponent("SPINNER");

    function findCurve(condition) {
        if (condition && condition.children && condition.children.length) {
            condition.children.forEach(function (child) {
                findCurve(child);
            })
        } else if (condition && condition.left && condition.right) {
            curveSet.add(condition.left.value);
            if (condition.right.type == 'curve') {
                curveSet.add(condition.right.value);
            }
        } else {
            return;
        }
    }

    findCurve(discriminator);

    function evaluate(condition, index) {
        if (condition && condition.children && condition.children.length) {
            let left = evaluate(condition.children[0], index);
            let right = evaluate(condition.children[1], index);
            switch (condition.operator) {
                case 'and':
                    return left && right;
                case 'or':
                    return left || right;
            }
        }
        else if (condition && condition.left && condition.right) {
            let leftCurve = curvesData.find(function (curve) {
                return curve.idCurve == condition.left.value;
            });

            let left = leftCurve ? parseFloat(leftCurve.data[index]) : null;

            let right = condition.right.value;
            if (condition.right.type == 'curve') {
                let rightCurve = curvesData.find(function (curve) {
                    return curve.idCurve == condition.right.value;
                })
                right = rightCurve ? parseFloat(rightCurve.data[index]): null;
            }

            if (left!= null && right!= null) {
                switch (condition.comparison) {
                    case '<':
                        return left < right;
                    case '>':
                        return left > right;
                    case '=':
                        return left == right;
                    case '<=':
                        return left <= right;
                    case '>=':
                        return left >= right;
                }
            } else {
                return false;
            }
        } else {
            return true;
        }
    }

    let curveArr = Array.from(curveSet);
    async.eachOfSeries(
        curveArr,
        function (curve, i, done) {
            if(curve){
                __GLOBAL.wiApiService.dataCurve(curve, function (data) {
                    if(Array.isArray(data)){
                        curvesData.push({
                            idCurve: curve,
                            data: data.map(d => parseFloat(d.x))
                        })
                    }
                    done();
                })
            }else{
                let len = Math.round((well.bottomDepth - well.topDepth)/well.step) + 1;
                let data = new Array(len);
                spinner.show();
                async.eachOf(data, function(depth, i, callback){
                    data[i] = parseFloat((well.step * i + well.topDepth).toFixed(4));
                    async.setImmediate(callback);
                }, function(err){
                    curvesData.push({
                        idCurve: curve,
                        data: data
                    })
                    done();
                    spinner.hide();
                })
            }
        },
        function (err) {
            console.log('done!', curvesData);
            for (let i = 0; i <= length; i++) {
                result.push(evaluate(discriminator, i));
            }
            callback(result);
        }
    );
}

exports.drawIcon = drawIcon;

function drawIcon(idIcon, type) {
    let wiComponentService = __GLOBAL.wiComponentService;
    let graph = wiComponentService.getComponent(wiComponentService.GRAPH);

    let icon = $('#' + idIcon)[0];
    console.log("type", type, icon);

    let ctx = icon.getContext('2d');
    ctx.clearRect(0, 0, icon.width, icon.height);

    let helper = new graph.CanvasHelper(ctx, {
        strokeStyle: 'black',
        fillStyle: 'black',
        size: 30
    });
    let funcType = type.toLowerCase();
    switch (funcType) {
        case 'circle':
            helper.circle(10, 10);
            break;
        case 'cross':
            helper.cross(10, 10);
            break;
        case 'diamond':
            helper.diamond(10, 10);
            break;
        case 'plus':
            helper.plus(10, 10);
            break;
        case 'square':
            helper.square(10, 10);
            break;
        case 'star':
            helper.star(10, 10);
            break;
        default:
            break;
    }
}

function getDataTopBottomRange(data, topPos, bottomPos) {
    let retData = [];
    for (let i = 0; i < data.length; i++) {
        if (i < topPos || i > bottomPos) retData.push(null);
        else retData.push(data[i]);
    }
    return retData;
}
exports.getDataTopBottomRange = getDataTopBottomRange;

function convertRangeDepthToIndex (depth, well) {
    let d = Math.round((
                depth - well.topDepth)
                            /well.step);
    return d;
}
exports.convertRangeDepthToIndex = convertRangeDepthToIndex;
function getZoneSetsInWell (well) {
    let zoneSets = [];
    well.children.forEach(function(child) {
        if(child.type == 'zonesets') zoneSets = angular.copy(child.children);
    })
    return zoneSets;
}
exports.getZoneSetsInWell = getZoneSetsInWell;

function getAllCurvesOfWell (well) {
    let datasets =[];
    let curves = [];
    well.children.forEach(function (child) {
        if (child.type == 'dataset') datasets.push(child);
    });
    datasets.forEach(function (child) {
        child.children.forEach(function (item) {
            if (item.type == 'curve') curves.push(item);
        })
    });
    return curves;
}
exports.getAllCurvesOfWell = getAllCurvesOfWell;

/*function getShadingStyle(fillObj) {
    if (fillObj.pattern) return "fillPattern";

    if (fillObj.varShading) return "variableShading";

    fillObj.pattern = {
        name: 'none',
        background: "white",
        foreground: 'black'
    };
    return "fillPattern";
}*/
function getShadingStyle (fillObj) {
    if(fillObj.shadingType == 'pattern') return 'pattern';
    if(fillObj.shadingType == 'varShading') return 'varShading';
    fillObj.shadingType = 'pattern';
    return 'pattern';

}
exports.getShadingStyle = getShadingStyle;

function isEmpty(val){
    return (val === undefined || val == null || val.length <= 0) ? true : false;
}
exports.isEmpty = isEmpty;

function getVisualizeShading (track, idShading) {
    let shadings = (track.drawings).filter(d => d.type == 'shading')
    return shadings.filter(s => s.id == idShading)[0];
}
exports.getVisualizeShading = getVisualizeShading;

function updateWiCurveListingOnModelDeleted(model){
    let wiComponentService = __GLOBAL.wiComponentService;
    let wiCurveListing = wiComponentService.getComponent('WCL');
    if(wiCurveListing) wiCurveListing.removeModel(model);
}
function getSelectedNode(rootNode) {
    return getSelectedPath(null, rootNode).pop();
}

exports.getSelectedNode = getSelectedNode;

exports.updateWiCurveListingOnModelDeleted = updateWiCurveListingOnModelDeleted;

function getDepthCurve(well){
    let length = Math.round((well.bottomDepth - well.topDepth)/well.step) + 1;
    let depth = new Array(length);
    for(i = 0; i < length; i++){
        depth[i] = parseFloat((well.step * i + well.topDepth).toFixed(4));
    }
    return depth;
}
exports.getDepthCurve = getDepthCurve;

function emitEvent (eventName, eventData) {
    let event = new CustomEvent(eventName, {detail: eventData});
    document.dispatchEvent(event);
}
exports.emitEvent = emitEvent;

function listenEvent (eventName, callback) {
    document.addEventListener(eventName, function (e) {
        callback(e.detail);
    })
}
exports.listenEvent = listenEvent;
function swapValue (a, b) {
    let t = a;
    a = b;
    b = t;
}
exports.swapValue = swapValue;
exports.colorGenerator = function(){
    let rand = function () {
        return Math.floor(Math.random() * 255);
    }
    return "rgb(" + rand() + "," + rand() + "," + rand() + ")";
}