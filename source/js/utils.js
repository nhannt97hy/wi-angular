'use strict';

var __GLOBAL = null;
exports.setGlobalObj = function (gObj) {
    __GLOBAL = gObj;
}

exports.debounce = debounce;

function debounce(func, wait, immediate) {
    var timeout;
    return function () {
        var context = this,
            args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

function getDialogUtils() {
    const wiComponentService = __GLOBAL.wiComponentService;
    let w
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

exports.error = errorMsg;

function errorMsg(errorMessage) {
    errorMessage = errorMessage || "Something's wrong!";
    let wics = __GLOBAL.wiComponentService;
    let DialogUtils = wics.getComponent('DIALOG_UTILS');
    DialogUtils.errorMessageDialog(__GLOBAL.ModalService, errorMessage);
}
exports.warning = function (warningMessage) {
    if (!warningMessage) return;
    warningMessage = warningMessage;
    let wiComponentService = __GLOBAL.wiComponentService;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    DialogUtils.warningMessageDialog(__GLOBAL.ModalService, warningMessage);
}

exports.projectOpen = function (wiComponentService, projectData) {
    console.log('unsorted',projectData);
    sortProjectData(projectData);
    console.log('sorted',projectData);
    wiComponentService.putComponent(wiComponentService.PROJECT_LOADED, projectData);
    wiComponentService.emit(wiComponentService.PROJECT_LOADED_EVENT);
};

exports.projectClose = function (wiComponentService) {
    wiComponentService.emit(wiComponentService.PROJECT_UNLOADED_EVENT);
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
        name: lineModel.name,
        unit: curveModel.properties.unit,
        minX: line.minValue,
        maxX: line.maxValue,
        scale: line.displayType,
        alias: curveModel.properties.alias,
        showHeader: line.showHeader,
        blockPosition: line.blockPosition,
        wrapMode: line.wrapMode,
        displayAs: line.displayAs,
        line: null,
        symbol: null
    };
    let temp = line.displayMode.toLowerCase().trim();
    if (temp == 'line' || temp == 'both') {
        lineModel.data.line = {
            dash: eval(line.lineStyle),
            color: line.lineColor,
            width: line.lineWidth
        }
    }
    if (temp == 'symbol' || temp == 'both') {
        lineModel.data.symbol = {
            style: line.symbolName.toLowerCase(),
            fillStyle: line.symbolFillStyle,
            strokeStyle: line.symbolStrokeStyle,
            lineWidth: line.symbolLineWidth,
            lineDash: eval(line.symbolLineDash),
            size: parseInt(line.symbolSize)
        }
    }
    return lineModel;
}

function shadingToTreeConfig(shading, paletteList) {
    let shadingModel = new Object();
    function getValPal(palName){
        console.log("getPal", paletteList.palName);
        return paletteList.palName;
    };
    shadingModel.id = shading.idShading;
    shadingModel.idLeftLine = shading.idLeftLine;
    shadingModel.idRightLine = shading.idRightLine;
    shadingModel.data = {
        id: shading.idShading,
        name: shading.name,
        refX: shading.refX,
        leftX: shading.leftFixedValue,
        rightX: shading.rightFixedValue,
        fill: shading.fill ? JSON.parse(shading.fill) : null,
        isNegPosFill: shading.isNegPosFill,
        positiveFill: shading.positiveFill ? JSON.parse(shading.positiveFill) : null,
        negativeFill: shading.negativeFill ? JSON.parse(shading.negativeFill) : null,
        refLineWidth: shading.refLineWidth || 5,
        refLineColor: shading.refLineColor || '#3e3e3e',
        showRefLine: shading.showRefLine
        // showRefLine: false
    };
    if(shadingModel.data.fill && shadingModel.data.fill.varShading && shadingModel.data.fill.varShading.palette) {
        shadingModel.data.fill.varShading.palName = shadingModel.data.fill.varShading.palName;
        shadingModel.data.fill.varShading.palette = paletteList[shadingModel.data.fill.varShading.palette];
    }
    if(shadingModel.data.positiveFill && shadingModel.data.positiveFill.varShading && shadingModel.data.positiveFill.varShading.palette) {
        shadingModel.data.positiveFill.varShading.palName = shadingModel.data.positiveFill.varShading.palName;
        shadingModel.data.positiveFill.varShading.palette = paletteList[shadingModel.data.positiveFill.varShading.palette];
    }
    if(shadingModel.data.negativeFill && shadingModel.data.negativeFill.varShading && shadingModel.data.negativeFill.varShading.palette) {
        shadingModel.data.negativeFill.varShading.palName = shadingModel.data.negativeFill.varShading.palName;
        shadingModel.data.negativeFill.varShading.palette = paletteList[shadingModel.data.negativeFill.varShading.palette];
    }
    console.log("shadingModel:", shadingModel);
    return shadingModel;
}

exports.shadingToTreeConfig = shadingToTreeConfig;

function zoneToTreeConfig(zone) {
    var zoneModel = new Object();
    zoneModel.name = 'zone';
    zoneModel.type = 'zone';
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
    return zoneModel;
}
exports.zoneToTreeConfig = zoneToTreeConfig;

function zoneSetToTreeConfig(zoneSet) {
    var zoneSetModel = new Object();
    zoneSetModel.name = 'zoneset';
    zoneSetModel.type = 'zoneset';
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
    zoneSetModel.children = new Array();
    if (!zoneSet.zones) return zoneSetModel;
    zoneSet.zones.forEach(function (zone) {
        zoneSetModel.children.push(zoneToTreeConfig(zone));
    });
    return zoneSetModel;
}
exports.zoneSetToTreeConfig = zoneSetToTreeConfig;
exports.createZoneSet = function (idWell, callback) {
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
        wiApiService.createZoneSet(zoneSetInfo, function (dataReturn) {
            __GLOBAL.$timeout(function () {
                if (callback) callback(dataReturn);
                refreshProjectState();
            });
        });
    });
}

/*
function trackToModel(track) {
    var trackModel = new Object();
    trackModel.idPlot = track.idPlot;
    if (track.idTrack) {
        trackModel.idTrack = track.idTrack;
        trackModel.idPlot = track.idPlot;
        trackModel.type = 'log';
    } else if (track.idDepthAxis) {
        trackModel.idDepthTrack = track.idDepthAxis;
        trackModel.idPlot = track.idPlot;
        trackModel.type = 'depth';
    }
    return trackModel;
}
*/

function logplotToTreeConfig(plot) {
    var plotModel = new Object();
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
    plotModel.handler = function () {
        let selectedNode = getSelectedNode();
        if (selectedNode && selectedNode.type == 'logplot') {
            openLogplotTab(__GLOBAL.wiComponentService, selectedNode);
        }
    }
    /*
    plotModel.tracks = new Array();
    if (!plot.tracks) return plotModel;

    plot.tracks.forEach(function (track) {
        plotModel.tracks.push(trackToModel(track));
    });
    //TODO: refactor
    plot.depth_axes.forEach(function (depthTrack) {
        plotModel.tracks.push(trackToModel(depthTrack));
    });
    */
    return plotModel;
}

exports.logplotToTreeConfig = logplotToTreeConfig;

function crossplotToTreeConfig(crossplot) {
    var crossplotModel = new Object();
    crossplotModel.name = 'crossplot';
    crossplotModel.type = 'crossplot';
    crossplotModel.id = crossplot.idCrossPlot;
    crossplotModel.properties = {
        idWell: crossplot.idWell,
        idCrossplot: crossplot.idCrossPlot,
        name: crossplot.name,
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
        let selectedNode = getSelectedNode();
        if (selectedNode && selectedNode.type == 'crossplot') {
            openCrossplotTab(selectedNode);
        }
    }

    return crossplotModel;
}

exports.crossplotToTreeConfig = crossplotToTreeConfig;

function histogramToTreeConfig(histogram) {
    let histogramModel = new Object();
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
        // discriminators: histogram.discriminators,
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
        let selectedNode = getSelectedNode();
        if (selectedNode && selectedNode.type == 'histogram') {
            openHistogramTab(selectedNode);
        }
    }

    return histogramModel;
}

exports.histogramToTreeConfig = histogramToTreeConfig;

function curveToTreeConfig(curve) {
    var curveModel = new Object();
    curveModel.name = 'curve';
    curveModel.type = 'curve';
    curveModel.id = curve.idCurve;
    curveModel.properties = {
        idDataset: curve.idDataset,
        idCurve: curve.idCurve,
        idFamily: curve.idFamily,
        name: curve.name,
        unit: curve.unit || "NA",
        dataset: curve.dataset,
        alias: curve.name, // TODO
        minScale: curve.LineProperty ? curve.LineProperty.minScale : null,
        maxScale: curve.LineProperty ? curve.LineProperty.maxScale : null
    };
    curveModel.data = {
        childExpanded: false,
        icon: 'curve-16x16',
        label: curve.name,
        unit: curveModel.properties.unit
    };
    curveModel.curveData = null;
    return curveModel;
}

exports.curveToTreeConfig = curveToTreeConfig;

function datasetToTreeConfig(dataset) {
    var datasetModel = new Object();
    datasetModel.name = "dataset";
    datasetModel.type = "dataset";
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
    datasetModel.children = new Array();
    if (!dataset.curves) return datasetModel;

    dataset.curves.forEach(function (curve) {
        datasetModel.children.push(curveToTreeConfig(curve));
    });

    return datasetModel;
}

exports.datasetToTreeConfig = datasetToTreeConfig;

function createZoneSetsNode(well) {
    let zoneSetsModel = new Object();
    zoneSetsModel.name = 'zonesets';
    zoneSetsModel.type = 'zonesets';
    zoneSetsModel.data = {
        childExpanded: false,
        icon: 'user-define-16x16',
        label: "User Defined"
    };
    zoneSetsModel.properties = {
        idWell: well.idWell
    }
    zoneSetsModel.children = new Array();
    if (!well.zonesets) return zoneSetsModel;
    well.zonesets.forEach(function (zoneSet) {
        zoneSetsModel.children.push(zoneSetToTreeConfig(zoneSet));
    });
    return zoneSetsModel;
}

function createLogplotNode(well) {
    let logplotModel = new Object();
    logplotModel.name = 'logplots';
    logplotModel.type = 'logplots';
    logplotModel.data = {
        childExpanded: false,
        icon: 'logplot-blank-16x16',
        label: "Logplot"
    };
    logplotModel.properties = {
        idWell: well.idWell
    }
    logplotModel.children = new Array();
    if (!well.plots) return logplotModel;
    well.plots.forEach(function (plot) {
        logplotModel.children.push(logplotToTreeConfig(plot));
    });

    return logplotModel;
}

function createCrossplotNode(well) {
    let crossplotModel = new Object();
    crossplotModel.name = 'crossplots';
    crossplotModel.type = 'crossplots';
    crossplotModel.data = {
        childExpanded: false,
        icon: 'crossplot-blank-16x16',
        label: 'Crossplot'
    };
    crossplotModel.properties = {
        idWell: well.idWell
    };

    if (!well.crossplots) return crossplotModel;
    crossplotModel.children = new Array();
    well.crossplots.forEach(function (crossplot) {
        crossplotModel.children.push(crossplotToTreeConfig(crossplot));
    });

    return crossplotModel;
}

function createHistogramNode(well) {
    let histogramModel = new Object();
    histogramModel.name = 'histograms';
    histogramModel.type = 'histograms';
    histogramModel.data = {
        childExpanded: false,
        icon: 'histogram-blank-16x16',
        label: 'Histogram'
    };
    histogramModel.properties = {
        idWell: well.idWell
    };

    if (!well.histograms) return histogramModel;
    histogramModel.children = new Array();
    well.histograms.forEach(function (histogram) {
        histogramModel.children.push(histogramToTreeConfig(histogram));
    });
    return histogramModel;
}

function wellToTreeConfig(well) {
    var wellModel = new Object();
    wellModel.name = "well";
    wellModel.type = "well";
    wellModel.id = well.idWell;
    wellModel.properties = {
        idProject: well.idProject,
        idWell: well.idWell,
        name: well.name,
        topDepth: well.topDepth,
        bottomDepth: well.bottomDepth,
        step: well.step
    };
    wellModel.data = {
        childExpanded: false,
        icon: "well-16x16",
        label: well.name
    };

    wellModel.children = new Array();

    if (well.datasets) {
        well.datasets.forEach(function (dataset) {
            wellModel.children.push(datasetToTreeConfig(dataset));
        });
    }
    let zoneSetsNode = createZoneSetsNode(well);
    let logplotNode = createLogplotNode(well);
    let crossplotNode = createCrossplotNode(well);
    let histogramNode = createHistogramNode(well);
    wellModel.children.push(zoneSetsNode);
    wellModel.children.push(logplotNode);
    wellModel.children.push(crossplotNode);
    wellModel.children.push(histogramNode);
    return wellModel;
}

exports.wellToTreeConfig = wellToTreeConfig;

exports.projectToTreeConfig = function (project) {
    var projectModel = new Object();
    projectModel.type = 'project';
    projectModel.name = 'project';
    projectModel.id = project.idProject;
    projectModel.properties = {
        idProject: project.idProject,
        name: project.name,
        department: project.department,
        company: project.company,
        description: project.description
    };
    projectModel.data = {
        childExpanded: false,
        icon: 'well-insight-16x16',
        label: project.name,
        selected: false
    };
    projectModel.children = new Array();

    if (!project.wells) return projectModel;

    project.wells.forEach(function (well) {
        projectModel.children.push(wellToTreeConfig(well));
    });
    return projectModel;
}

exports.visit = visit;

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

exports.getSelectedNode = getSelectedNode;

function getSelectedNode() {
    return getSelectedPath().pop();
}

exports.getSelectedProjectNode = getSelectedProjectNode;

function getSelectedProjectNode() {
    const wiComponentService = __GLOBAL.wiComponentService;
    let rootNodes = wiComponentService.getComponent(wiComponentService.WI_EXPLORER).treeConfig;
    if (!rootNodes || rootNodes.length <= 0) return;
    return rootNodes[0];
    //return getSelectedPath().shift();
}

exports.getSelectedPath = getSelectedPath;

function getSelectedPath(foundCB) {
    const wiComponentService = __GLOBAL.wiComponentService;
    let rootNodes = wiComponentService.getComponent(wiComponentService.WI_EXPLORER).treeConfig;
    if (!rootNodes) return;
    let selectedPath = new Array();
    visit(rootNodes[0], function (node, options) {
        if (node.data) {
            if (foundCB) {
                if (foundCB(node)) {
                    selectedPath = options.path.slice();
                    return true;
                }
            } else if (node.data.selected == true) {
                selectedPath = options.path.slice();
                return true;
            }
        }
        return false;
    }, {
        path: new Array()
    });
    return selectedPath;
}

exports.pushProjectToExplorer = function (self, project, wiComponentService, WiTreeConfig, WiWell, $timeout) {
    self.treeConfig = (new WiTreeConfig()).config;
    $timeout(function () {
        let wiRootTreeviewComponent = wiComponentService.getComponent(self.treeviewName);
        wiRootTreeviewComponent.config[0].data.label = project.name;
        wiRootTreeviewComponent.config[0].children = [];
    });
    if (!project.wells) return;
    // parse config from data
    // inject child item to origin config
    let wells = [];
    for (let well of project.wells) {
        let wiWellTemp = new WiWell(well);
        wells.push(wiWellTemp);
    }
    $timeout(function () {
        let wiRootTreeviewComponent = wiComponentService.getComponent(self.treeviewName);
        if (wiRootTreeviewComponent) {
            for (let well of wells) {
                wiRootTreeviewComponent.addItemToFirst('wells', well);
            }
        }
    });
};

exports.updateWellProject = updateWellProject;

function updateWellProject(wiComponentService, well) {
    let project = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);
    if (!project) return;
    if (!Array.isArray(project.wells)) {
        project.wells = [];
        project.wells.push(well);
    } else {
        let isNewWell = true;
        for (let i = 0; i < project.wells.length; i++) {
            if (project.wells[i].idWell == well.idWell) {
                project.wells[i] = well;
                isNewWell = false;
            }
        }
        if (isNewWell) {
            project.wells.push(well);
        }
    }
    wiComponentService.putComponent(wiComponentService.PROJECT_LOADED, project);
    //wiComponentService.emit(wiComponentService.UPDATE_WELL_EVENT, well);
    wiComponentService.emit(wiComponentService.PROJECT_REFRESH_EVENT);
};

exports.updateWellsProject = function (wiComponentService, wells) {
    let project = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);
    if (!project) return;
    for (let well of wells) {
        updateWellProject(wiComponentService, well);
    }
};

exports.getCurveData = getCurveData;

function getCurveData(apiService, idCurve, callback) {
    apiService.post(apiService.DATA_CURVE, {
            idCurve
        }, function (curve) {
            callback(null, curve);
        });
}

//exports.getCurveDataByName = getCurveDataByName;

exports.setupCurveDraggable = function (element, wiComponentService, apiService) {
    let dragMan = wiComponentService.getComponent(wiComponentService.DRAG_MAN);

    element.draggable({
        start: function (event, ui) {
            dragMan.dragging = true;
        },
        stop: function (event, ui) {
            dragMan.dragging = false;
            let wiD3Ctrl = dragMan.wiD3Ctrl;
            let track = dragMan.track;
            let wiSlidingBarCtrl = dragMan.wiSlidingBarCtrl;
            dragMan.wiD3Ctrl = null;
            dragMan.track = null;
            let idCurve = parseInt(ui.helper.attr('data'));
            if (wiD3Ctrl && track) {
                if (wiD3Ctrl.verifyDroppedIdCurve(idCurve)) {
                    apiService.post(apiService.CREATE_LINE, {
                        idTrack: track.id,
                        idCurve: idCurve
                    }, function (line) {
                        let lineModel = lineToTreeConfig(line);
                        getCurveData(apiService, idCurve, function (err, data) {
                            if (!err) wiD3Ctrl.addCurveToTrack(track, data, lineModel.data);
                        });
                    });
                }
                else {
                    errorMsg("Cannot drop curve from another well");
                }
                return;
            }
            if (wiSlidingBarCtrl && wiSlidingBarCtrl.verifyDroppedIdCurve(idCurve)) {
                wiSlidingBarCtrl.createPreview(idCurve);
            }
            else {
                errorMsg("Cannot drop curve from another well");
            }
        },
        appendTo: 'body',
        revert: false,
        scroll: false,
        helper: 'clone',
        containment: 'document',
        cursor: 'move',
        cursorAt: {
            top: 0,
            left: 0
        }
    });
};

exports.createNewBlankLogPlot = function (wiComponentService, wiApiService, logplotName) {
    let selectedNode = getSelectedNode();
    if (selectedNode.type != 'logplots') return;
    let well = getModel('well', selectedNode.properties.idWell);
    let firstCurve = null;
    for (let child of well.children) {
        if (child.type == "dataset") {
            if (child.children && child.children.length) {
                firstCurve = child.children[0]
                break;
            }
        }
    }
    let dataRequest = {
        idWell: selectedNode.properties.idWell,
        name: logplotName,
        option: 'blank-plot',
        referenceCurve: firstCurve ? firstCurve.properties.idCurve : null
    };
    return new Promise(function(resolve, reject){
        wiApiService.post(wiApiService.CREATE_PLOT, dataRequest, function(response){
            if(!response.name){
                reject(response);
            } else {
                resolve(response);
            }
            
        });
    });
};

function openLogplotTab(wiComponentService, logplotModel, callback) {
    let layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
    layoutManager.putTabRightWithModel(logplotModel);
    if (logplotModel.data.opened) return;
    logplotModel.data.opened = true;
    let logplotName = 'logplot' + logplotModel.properties.idPlot;
    let logplotCtrl = wiComponentService.getComponent(logplotName);
    let wiD3Ctrl = logplotCtrl.getwiD3Ctrl();
    let slidingBarCtrl = logplotCtrl.getSlidingbarCtrl();
    let wiApiService = __GLOBAL.wiApiService;
    // wiApiService.getPalettes(function(paletteList) {
    getPalettes(function(paletteList) {
        wiApiService.post(wiApiService.GET_PLOT, {idPlot: logplotModel.id},
            function (plot) {
                if (logplotModel.properties.referenceCurve) {
                    slidingBarCtrl.createPreview(logplotModel.properties.referenceCurve);
                }
                let tracks = new Array();

                if (plot.depth_axes && plot.depth_axes.length) {
                    plot.depth_axes.forEach(function(depthTrack) {
                        tracks.push(depthTrack);
                    });
                }
                if (plot.tracks && plot.tracks.length) {
                    plot.tracks.forEach(function (track) {
                        tracks.push(track);
                    });
                }
                if (plot.zone_tracks && plot.zone_tracks.length) {
                    plot.zone_tracks.forEach(function (zoneTrack) {
                        tracks.push(zoneTrack);
                    })
                }

                function drawAllShadings(someTrack, trackObj) {
                    someTrack.shadings.forEach(function (shading) {
                        let shadingModel = shadingToTreeConfig(shading, paletteList);
                        let linesOfTrack = trackObj.getCurves();
                        console.log("LinhTinh:", linesOfTrack, shading, shadingModel);
                        let lineObj1 = null;
                        let lineObj2 = null;

                        if(!shadingModel.idRightLine) return;
                        if(!shadingModel.idLeftLine) {
                            for (let line of linesOfTrack) {
                                if (line.id == shading.idRightLine) {
                                      lineObj1 = line;
                                }
                            }
                            wiD3Ctrl.addCustomShadingToTrack(trackObj, lineObj1, shadingModel.data.leftX, shadingModel.data);
                        }
                        else {
                            for (let line of linesOfTrack) {
                                if (line.id == shading.idRightLine) {
                                      lineObj1 = line;
                                }
                                if (line.id == shading.idLeftLine) {
                                    lineObj2 = line;
                                }
                            }
                            wiD3Ctrl.addPairShadingToTrack(trackObj, lineObj2, lineObj1, shadingModel.data);
                        }

                    });
                };
                let aTrack = tracks.shift();
                while (aTrack) {
                    if (aTrack.idDepthAxis) {
                        wiD3Ctrl.pushDepthTrack(aTrack);
                    }
                    else if (aTrack.idTrack) {
                        let trackObj = wiD3Ctrl.pushLogTrack(aTrack);
                        aTrack.markers.forEach(function (marker) {
                            wiD3Ctrl.addMarkerToTrack(trackObj, marker);
                        });
                        aTrack.images.forEach(function (image) {
                            image.src = image.location;
                            wiD3Ctrl.addImageToTrack(trackObj, image);

                        })
                        if (!aTrack.lines || aTrack.lines.length == 0) {
                            aTrack = tracks.shift();
                            continue;
                        }

                        let lineCount = 0;
                        let lineNum = aTrack.lines.length;
                        let eventEmitter = new EventEmitter();
                        eventEmitter.on('line-drawed', function (someTrack) {
                            console.log(someTrack);
                            lineCount++;
                            if (lineCount == lineNum) {
                                drawAllShadings(someTrack, trackObj);
                            }
                        });

                        let someTrack = aTrack;
                        aTrack.lines.forEach(function (line) {
                            getCurveData(wiApiService, line.idCurve, function (err, data) {
                                let lineModel = lineToTreeConfig(line);
                                if (!err) {
                                    wiD3Ctrl.addCurveToTrack(trackObj, data, lineModel.data);
                                }
                                else {
                                    console.error(err);
                                    wiComponentService.getComponent(wiComponentService.UTILS).error(err);
                                }
                                eventEmitter.emitEvent('line-drawed', [someTrack]);
                            });
                        });
                    } else if(aTrack.idZoneTrack) {
                        let viTrack = wiD3Ctrl.pushZoneTrack(aTrack);
                        if (!aTrack.zoneset) {
                            aTrack = tracks.shift();
                            continue;
                        }
                        wiApiService.getZoneSet(aTrack.zoneset.idZoneSet, function (zoneset) {
                            for (let zone of zoneset.zones) {
                                wiD3Ctrl.addZoneToTrack(viTrack, zone);
                            }
                        })
                    }
                    aTrack = tracks.shift();
                }
                if (callback) callback();
            });
    });
};
exports.openLogplotTab = openLogplotTab;

/*exports.updateLogplotProject = function(wiComponentService, idWell, logplot) {
    let project = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);

    let selectWellProject = findWellProjectById(idWell, project);
    if (!selectWellProject) return;

    if (!Array.isArray(selectWellProject.plots) || selectWellProject.plots.length === 0) {
        selectWellProject.plots = [];
        selectWellProject.plots.push(logplot);
        return;
    }

    for (let plot of selectWellProject.plots) {
        if (!Array.isArray(project.wells)) {
            project.wells = [];
            project.wells.push(well);
        } else {

        }
    }

    let isNewPlot = true;
    for (let i = 0; i < selectWellProject.plots.length; i++) {
        if (selectWellProject.plots[i].idPlot == logplot.idPlot) {
            selectWellProject.plots[i] = logplot;
            isNewPlot = false;
        }
    }
    if (isNewPlot) {
        selectWellProject.plots.push(logplot);
    }

    wiComponentService.emit(wiComponentService.UPDATE_LOGPLOT_EVENT, logplot);
    wiComponentService.putComponent(wiComponentService.PROJECT_LOADED, project);
}

function findWellProjectById(idWell, project) {
    if (!project || !Array.isArray(project.wells)) return;
    for (let well of project.wells) {
        if (well.idWell == idWell) {
            return well;
        }
    }

    return null;
}*/

function getModel(type, id) {
    if (!type || !id) return;
    let wiComponentService = __GLOBAL.wiComponentService;
    let rootNodes = wiComponentService.getComponent(wiComponentService.WI_EXPLORER).treeConfig;
    if (!rootNodes || !rootNodes.length) return;
    let model = null;
    console.log(rootNodes[0], type);
    visit(rootNodes[0], function (node) {
        if (node.type == type && node.id == id) {
            model = node;
        }
    });
    return model;
}

exports.getModel = getModel;

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

function findWellById(idWell) {
    let wiComponentService = __GLOBAL.wiComponentService;
    let rootNodes = wiComponentService.getComponent(wiComponentService.WI_EXPLORER).treeConfig;
    if (!rootNodes || !rootNodes.length) return;
    let well = null;
    visit(rootNodes[0], function (node) {

        if (node.type == 'well' && node.id == idWell) {
            well = node;
        }
    });
    return well;
}

exports.findWellById = findWellById;

exports.findWellByLogplot = function (idLogplot) {
    var path = getSelectedPath(function (node) {
        return node.type == "logplot" && node.id == idLogplot;
    }) || [];
    return path[1];
};
exports.findWellByCrossplot = function (idCrossplot) {
    var path = getSelectedPath(function (node) {
        return node.type == 'crossplot' && node.id == idCrossplot;
    }) || [];
    return path[1];
}

exports.findWellByHistogram = function (idHistogram) {
    var path = getSelectedPath(function (node) {
        return node.type == 'histogram' && node.id == idHistogram;
    }) || [];
    return path[1];
}

exports.findWellByCurve = function(idCurve) {
    var path = getSelectedPath(function (node) {
        return node.type == 'curve' && node.id == idCurve;
    }) || [];
    return path[1];
}

exports.findHistogramModelById = function(idHistogram){
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
// exports.parseTime = function (wiComponentService, time) {
//     let moment = wiComponentService.getComponent(wiComponentService.MOMENT);
//     let timestamp = 'DD-MM-YYYY, h:mm:ss a';
//
//     return moment(time).format(timestamp);
// };

exports.trackProperties = function (ModalService, wiComponentService) {
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    DialogUtils.trackPropertiesDialog(this.ModalService, function (ret) {});
};

function sortProjectData(projectData){
    if (!projectData.wells) return;
    projectData.wells.sort((a,b)=>{
        let nameA = a.name.toUpperCase();
        let nameB = b.name.toUpperCase();
        return nameA == nameB ? 0 : nameA > nameB ? 1 : -1;
    });
    projectData.wells.forEach(well=>{
        well.datasets.sort((a,b)=>{
            let nameA = a.name.toUpperCase();
            let nameB = b.name.toUpperCase();
            return nameA == nameB ? 0 : nameA > nameB ? 1 : -1;
        });
        well.datasets.forEach(dataset=>{
            dataset.curves.sort((a,b)=>{
                let nameA = a.name.toUpperCase();
                let nameB = b.name.toUpperCase();
                return nameA == nameB ? 0 : nameA > nameB ? 1 : -1;
            });
        });
        well.zonesets.sort((a,b)=>{
            let nameA = a.name.toUpperCase();
            let nameB = b.name.toUpperCase();
            return nameA == nameB ? 0 : nameA > nameB ? 1 : -1;
        })
        well.zonesets.forEach(function(zoneset){
            zoneset.zones.sort((a,b)=>{
                let nameA = parseInt(a.name);
                let nameB = parseInt(b.name);
                return nameA > nameB;
            })
        })
    });
}

let refreshProjectState = function () {
    let wiComponentService = __GLOBAL.wiComponentService;
    let project = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);
    let dom = document.getElementById('treeContent');

    if (!project) return;

    return new Promise(function (resolve, reject) {
        let payload = {
            idProject: project.idProject
        };
        let wiApiService = __GLOBAL.wiApiService;
        let ScrollTmp = dom.scrollTop;
        window.localStorage.setItem('scrollTmp', ScrollTmp);
        wiApiService.post(wiApiService.GET_PROJECT, payload, function (projectRefresh) {
            console.log("Refresh");
            console.log(projectRefresh);
            sortProjectData(projectRefresh);

            wiComponentService.putComponent(wiComponentService.PROJECT_LOADED, projectRefresh);
            wiComponentService.emit(wiComponentService.PROJECT_REFRESH_EVENT);
            resolve();
        });
    });
}
exports.refreshProjectState = refreshProjectState;

exports.renameWell = function () {
    let wiComponentService = __GLOBAL.wiComponentService;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let selectedNode = getSelectedNode();
    if (selectedNode.type != 'well') return;
    let promptConfig = {
        title: '<span class="curve-data-16x16"></span> Rename Well',
        inputName: 'Name',
        input: selectedNode.properties.name
    }
    DialogUtils.promptDialog(__GLOBAL.ModalService, promptConfig, function (ret) {
        if (!ret) return;
        let wiApiService = __GLOBAL.wiApiService;
        let wellInfo = selectedNode.properties;
        wellInfo.name = ret;
        wiApiService.editWell(wellInfo, function () {
            __GLOBAL.$timeout(function () {
                selectedNode.properties.name = ret;
                selectedNode.data.label = ret;
            })
        });
    });
}

exports.renameDataset = function () {
    let wiComponentService = __GLOBAL.wiComponentService;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let selectedNode = getSelectedNode();
    if (selectedNode.type != 'dataset') return;
    let promptConfig = {
        title: '<span class="curve-data-16x16"></span> Rename Dataset',
        inputName: 'Name',
        input: selectedNode.properties.name
    }
    DialogUtils.promptDialog(__GLOBAL.ModalService, promptConfig, function (ret) {
        if (!ret) return;
        let wiApiService = __GLOBAL.wiApiService;
        let datasetInfo = selectedNode.properties;
        datasetInfo.name = ret;
        wiApiService.editDataset(datasetInfo, function () {
            __GLOBAL.$timeout(function () {
                selectedNode.properties.name = ret;
                selectedNode.data.label = ret;
            })
        });
    });
}
exports.createDataset = function () {
    let wiComponentService = __GLOBAL.wiComponentService;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let selectedNode = getSelectedNode();
    if (selectedNode.type != 'well') return;
    let promptConfig = {
        title: '<span class="dataset-new-16x16"></span> Create New Dataset',
        inputName: 'Name',
        input: 'NewDataset'
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
        wiApiService.createDataset(datasetInfo, function () {
            __GLOBAL.$timeout(function () {
                refreshProjectState();
            })
        });
    });
}

exports.exportCurve = function () {
    let wiComponentService = __GLOBAL.wiComponentService;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
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

exports.renameCurve = function () {
    let wiComponentService = __GLOBAL.wiComponentService;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let selectedNode = getSelectedNode();
    if (selectedNode.type != 'curve') return;
    let promptConfig = {
        title: '<span class="curve-edit-16x16"></span> Rename Curve',
        inputName: 'Name',
        input: selectedNode.properties.name
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
        wiApiService.editCurve(curveInfo, function () {
            __GLOBAL.$timeout(function () {
                selectedNode.properties.name = ret;
                selectedNode.data.label = ret;
            })
        });
    });
}

exports.copyCurve = function () {
    let wiComponentService = __GLOBAL.wiComponentService;
    let selectedNode = getSelectedNode();
    if (selectedNode.type != 'curve') return;
    wiComponentService.putComponent(wiComponentService.COPYING_CURVE, selectedNode);
    wiComponentService.putComponent(wiComponentService.CUTTING_CURVE, null);
}

exports.cutCurve = function () {
    let wiComponentService = __GLOBAL.wiComponentService;
    let selectedNode = getSelectedNode();
    if (selectedNode.type != 'curve') return;
    wiComponentService.putComponent(wiComponentService.CUTTING_CURVE, selectedNode);
    wiComponentService.putComponent(wiComponentService.COPYING_CURVE, null);
}

exports.pasteCurve = function () {
    let wiComponentService = __GLOBAL.wiComponentService;
    let selectedNode = getSelectedNode();
    if (selectedNode.type != 'curve' && selectedNode.type != 'dataset') return;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let wiApiService = __GLOBAL.wiApiService;
    // if copying
    let copyingCurve = wiComponentService.getComponent(wiComponentService.COPYING_CURVE);
    if (copyingCurve) {
        let isCurveExist = false;
        // console.log(copyingCurve.properties.name);
        // console.log("===========");
        // console.log(selectedNode.children);
        selectedNode.children.forEach(function(c){
            if(copyingCurve.properties.name == c.data.label) {
                isCurveExist = true;
            }
        });
        if(!isCurveExist){
            if (copyingCurve.properties.idDataset == selectedNode.properties.idDataset) return;
            let currentDatasetName = "";
            if (selectedNode.type == 'curve') {
                let currentDataset = findDatasetById(selectedNode.properties.idDataset);
                currentDatasetName = currentDataset.properties.name;
            } else {
                currentDatasetName = selectedNode.properties.name;
            }
            let curveInfo = {
                idCurve: copyingCurve.properties.idCurve,
                desDatasetId: selectedNode.properties.idDataset
            }
            wiApiService.copyCurve(curveInfo, function (curve) {
                refreshProjectState();
            });
            wiComponentService.putComponent(wiComponentService.COPYING_CURVE, null);
        } else {
            //console.log("Curve exist");
            DialogUtils.confirmDialog(__GLOBAL.ModalService, "WARNING!", copyingCurve.properties.name +" existed! Override it ?", function(yes){
                if(yes){
                    if (copyingCurve.properties.idDataset == selectedNode.properties.idDataset) return;
                    let currentDatasetName = "";
                    if (selectedNode.type == 'curve') {
                        let currentDataset = findDatasetById(selectedNode.properties.idDataset);
                        currentDatasetName = currentDataset.properties.name;
                    } else {
                        currentDatasetName = selectedNode.properties.name;
                    }
                    let curveInfo = {
                        idCurve: copyingCurve.properties.idCurve,
                        desDatasetId: selectedNode.properties.idDataset
                    }
                    wiApiService.copyCurve(curveInfo, function (curve) {
                        refreshProjectState();
                    });
                    wiComponentService.putComponent(wiComponentService.COPYING_CURVE, null);
                } else {
                    return;
                }
            });
        }
        return;
    }
    // if cutting
    let cuttingCurve = wiComponentService.getComponent(wiComponentService.CUTTING_CURVE);
    if (cuttingCurve) {
        let isCurveExist = false;
        selectedNode.children.forEach(function(c){
            if(cuttingCurve.properties.name == c.data.label) {
                isCurveExist = true;
            }
        });
        if(!isCurveExist){
            if (cuttingCurve.properties.idDataset == selectedNode.properties.idDataset) return;
            let curveInfo = {
                idCurve: cuttingCurve.properties.idCurve,
                desDatasetId: selectedNode.properties.idDataset,
            }
            wiApiService.cutCurve(curveInfo, function () {
                refreshProjectState();
            });
            wiComponentService.putComponent(wiComponentService.CUTTING_CURVE, null);
        } else {
            DialogUtils.confirmDialog(__GLOBAL.ModalService, "WARNING!", cuttingCurve.properties.name +" existed! Override it ?",function(yes){
                if(yes){
                    if (cuttingCurve.properties.idDataset == selectedNode.properties.idDataset) return;
                    let curveInfo = {
                        idCurve: cuttingCurve.properties.idCurve,
                        desDatasetId: selectedNode.properties.idDataset,
                    }
                    wiApiService.cutCurve(curveInfo, function () {
                        refreshProjectState();
                    });
                    wiComponentService.putComponent(wiComponentService.CUTTING_CURVE, null);
                } else {
                    return;
                }
            });
        }
        return;
    }
}

function getDisplayMode(currentCurve) {
    if (currentCurve.line && currentCurve.symbol) return "Both";
    if (currentCurve.line && !currentCurve.symbol) return "Line";
    if (!currentCurve.line && currentCurve.symbol) return "Symbol";
    return "None";
}

exports.curveOptions = function (currentTrack, currentCurve, index) {
    let options = {
        // Locally use properties
        _index: index,
        idLine: currentCurve.id,
        idTrack: currentTrack.id,
        showHeader: currentCurve.showHeader,
        showDataset: false, // add to currentCurve - Canh
        ignoreMissingValues: false,
        alias: currentCurve.alias,
        minValue: currentCurve.minX,
        maxValue: currentCurve.maxX,
        autoValueScale: false,
        displayType: currentCurve.scale,
        displayMode: getDisplayMode(currentCurve),
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
exports.mergeShadingObj = function (shadingOptions, fillPatternStyles, variableShadingStyle) {

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
        if(!shadingObj.isNegPosFill){
            shadingObj.fill = variableShadingStyle.fill;
        } else {
            shadingObj.positiveFill = variableShadingStyle.positiveFill;
            shadingObj.negativeFill = variableShadingStyle.negativeFill;
        }
        // shadingObj.fill.display = true;
    } else {
        alert("shadingObj has undefined shadingStyle");
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

function editProperty(item) {
    let selectedNode = getSelectedNode();
    let properties = selectedNode.properties;
    let wiApiService = __GLOBAL.wiApiService;
    let wiComponentService = __GLOBAL.wiComponentService;
    let newProperties = angular.copy(properties);
    newProperties[item.key] = item.value;
    if (JSON.stringify(newProperties) === JSON.stringify(properties)) return;
    switch (selectedNode.type) {
        case 'well':
            wiApiService.editWell(newProperties, function () {
                refreshProjectState();
            });
            break;
        case 'dataset':
            wiApiService.editDataset(newProperties, function () {
                refreshProjectState();
            });
            break;
        case 'curve':
            if (item.key == 'idFamily') {
                newProperties.unit = getListFamily().find(family => family.idFamily == newProperties.idFamily).unit;
                selectedNode.properties.idFamily = newProperties.idFamily;
                selectedNode.properties.unit = newProperties.unit;
            }
            wiApiService.editCurve(newProperties, function () {
                refreshProjectState().then(function () {
                    wiComponentService.emit('update-properties', selectedNode);
                }).catch();
            });
            break;
        case 'zoneset':
            wiApiService.editZoneSet(newProperties, function () {
                refreshProjectState();
            });
            break;
        case 'zone':
            wiApiService.editZone(newProperties, function () {
                refreshProjectState();
            });
            break;
        case 'logplot':
            wiApiService.editLogplot(newProperties, function () {
                refreshProjectState();
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

exports.createNewBlankCrossPlot = function (wiComponentService, wiApiService, crossplotName) {
    let selectedNode = getSelectedNode();
    if (selectedNode.type != 'crossplots') return;
    let dataRequest = {
        idWell: selectedNode.properties.idWell,
        name: crossplotName,
        option: 'blank-plot'
    };
    return new Promise(function(resolve, reject){
        wiApiService.post(route, dataRequest, function(response){
            if(!response.data){
                reject(response);
            } else {
                resolve(response);
            }
        });
    });
};

exports.createPointSet = function (pointSetData, callback) {
    __GLOBAL.wiApiService.createPointSet(pointSetData, function (pointSet) {
        console.log(pointSet);
        callback(pointSet);
    })
}

exports.createCrossplot = function (idWell, crossplotName, callback) {
    let DialogUtils = __GLOBAL.wiComponentService.getComponent(__GLOBAL.wiComponentService.DIALOG_UTILS);
    let dataRequest = {
        idWell: idWell,
        name: crossplotName
    }
    __GLOBAL.wiApiService.createCrossplot(dataRequest, function (crossplot) {
        if(!crossplot.name){
            DialogUtils.errorMessageDialog(__GLOBAL.ModalService, "Name: " + dataRequest.name + " existed!");
        } else {
            let crossplotModel = crossplotToTreeConfig(crossplot);
            refreshProjectState().then(function () {
                openCrossplotTab(crossplotModel, callback);
            });
        }
    })
}

function openCrossplotTab(crossplotModel, callback) {

    let wiComponentService = __GLOBAL.wiComponentService;
    let wiApiService = __GLOBAL.wiApiService;
    let layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
    layoutManager.putTabRightWithModel(crossplotModel);
    let graph = wiComponentService.getComponent('GRAPH');
    if (crossplotModel.data.opened) return;
    crossplotModel.data.opened = true;
    let crossplotName = 'crossplot' + crossplotModel.properties.idCrossplot;
    let wiCrossplotCtrl = __GLOBAL.wiComponentService.getComponent(crossplotName);
    let wiD3CrossplotCtrl = wiCrossplotCtrl.getWiD3CrossplotCtrl();

    let wellProps = findWellById(crossplotModel.properties.idWell);

    wiApiService.getCrossplot(crossplotModel.properties.idCrossplot, function (crossplot) {
        if (crossplot.pointsets && crossplot.pointsets.length) {
            let pointSet = crossplot.pointsets[0];
            console.log("crosplot", crossplot);
            if (!pointSet.idCurveX || !pointSet.idCurveY) return;

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
                                } catch (error) {}
                            }
                        }
                        if (Array.isArray(crossplot.regressionlines) && crossplot.regressionlines.length > 0) {
                            for (let regLine of crossplot.regressionlines) {
                                try {
                                    regLine.lineStyle = JSON.parse(regLine.lineStyle);
                                } catch(e) {
                                    console.log(e);
                                }
                            }
                        }
                        let viCurveX = graph.buildCurve( curveX, dataX, wellProps.properties);
                        let viCurveY = graph.buildCurve( curveY, dataY, wellProps.properties);

                        wiD3CrossplotCtrl.createVisualizeCrossplot(viCurveX, viCurveY, crossplot);
                    }

                    if (pointSet.idCurveZ) {
                        wiApiService.infoCurve(pointSet.idCurveZ, function (curveZ) {
                            let viCurveZ = graph.buildCurve( curveZ, curveZ.data, wellProps.properties);
                            pointSet.curveZ = viCurveZ;
                            createViCrossplot();
                        });
                    } else {
                        createViCrossplot();
                    }
                })
            })
        }
    })
    if (callback) callback(wiCrossplotCtrl);
};
exports.openCrossplotTab = openCrossplotTab;

exports.createNewBlankHistogram = function (wiComponentService, wiApiService, histogramName) {
    let selectedNode = getSelectedNode();
    if (selectedNode.type != 'histograms') return;
    let dataRequest = {
        idWell: selectedNode.properties.idWell,
        name: histogramName
    };
    return new Promise(function(resolve, reject){
        wiApiService.post(wiApiService.CREATE_HISTOGRAM, dataRequest, function(response){
            if(!response.name){
                reject(response);
            } else {
                resolve(response);
            }
        });
    });
};

function openHistogramTab(histogramModel, callback) {
    let wiComponentService = __GLOBAL.wiComponentService;
    let layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
    layoutManager.putTabRightWithModel(histogramModel);
    if (histogramModel.data.opened) return;
    histogramModel.data.opened = true;
    if (callback) callback();
};
exports.openHistogramTab = openHistogramTab;


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
    let inch = Math.round(px / getDpi() * 1000) / 1000;
    return inch
}

exports.pixelToInch = pixelToInch;

function getDpcm() {
    return getDpi() * 2.54;
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

function getValPalette(palName, paletteList){
    console.log("NAME", paletteList.palName);
    return paletteList.palName;
}
exports.getValPalette = getValPalette;

function triggerWindowResize() {
    __GLOBAL.$timeout(function () {
        window.dispatchEvent(new Event('resize'));
    })
}

exports.triggerWindowResize = triggerWindowResize;

function putListFamily() {
    __GLOBAL.wiApiService.listFamily(function (families) {
        __GLOBAL.wiComponentService.putComponent(__GLOBAL.wiComponentService.LIST_FAMILY, families);
    })
}
exports.putListFamily = putListFamily;

function getListFamily() {
    return __GLOBAL.wiComponentService.getComponent(__GLOBAL.wiComponentService.LIST_FAMILY);
}
exports.getListFamily = getListFamily;

exports.openZonemanager = function(item){
    let wiComponentService = __GLOBAL.wiComponentService;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    DialogUtils.zoneManagerDialog(__GLOBAL.ModalService, item);
}
/*exports.getScaleCurveIfNotFamily = function(idCurve) {
    __GLOBAL.wiApiService.scaleCurve(idCurve, function(rangeObj) {
        console.log("rangeObj", rangeObj);
    })
}*/

exports.renameZoneSet = function(zoneSetModel){
    let wiComponentService = __GLOBAL.wiComponentService;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let promptConfig = {
        title: '<span class="user-define-16x16"></span> Rename ZoneSet',
        inputName: 'Name',
        input: zoneSetModel.properties.name
    }
    DialogUtils.promptDialog(__GLOBAL.ModalService, promptConfig, function (ret) {
        if (!ret) return;
        let wiApiService = __GLOBAL.wiApiService;
        let zoneSetInfo = zoneSetModel.properties;
        zoneSetInfo.name = ret;
        wiApiService.editZoneSet(zoneSetInfo, function () {
            __GLOBAL.$timeout(function () {
                zoneSetModel.properties.name = ret;
                zoneSetModel.data.label = ret;
            })
        });
    });
}
function getPalettes(callback) {
    let wiApiService = __GLOBAL.wiApiService;
    let wiComponentService = __GLOBAL.wiComponentService;
    let pals = wiComponentService.getComponent(wiComponentService.PALETTES);
    if (pals) {
        if (callback) callback(pals);
        return;
    }
    else  {
        wiApiService.getPalettes(function(paletteList) {
            wiComponentService.putComponent(wiComponentService.PALETTES, paletteList);
            if (callback) callback(paletteList);
        });
        return;
    }
}
exports.getPalettes = getPalettes;
