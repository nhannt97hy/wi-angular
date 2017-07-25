'use strict';

exports.objcpy = function (destObj, sourceObj) {
    if (destObj) {
        for (let attr in sourceObj) {
            destObj[attr] = sourceObj[attr];
        }
    }
};

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

exports.projectOpen = function (wiComponentService, projectData) {
    wiComponentService.putComponent(wiComponentService.PROJECT_LOADED, projectData);
    wiComponentService.emit(wiComponentService.PROJECT_LOADED_EVENT);
};

exports.projectClose = function (wiComponentService) {
    wiComponentService.emit('project-unloaded-event');
};

exports.pushProjectToExplorer = function (self, project, wiComponentService, WiTreeConfig, WiWell, $timeout) {
    console.log('project data: ', project);
    self.treeConfig = (new WiTreeConfig()).config;
    console.log('self.treeConfig', self.treeConfig);

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
            wiRootTreeviewComponent.config[0].data.label = project.name;
            wiRootTreeviewComponent.config[0].children = [];
            for (let well of wells) {
                wiRootTreeviewComponent.addItemToFirst('wells', well);
            }
        }
    });
};

exports.updateWellProject = function (wiComponentService, well) {
    // update well
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

    wiComponentService.emit(wiComponentService.UPDATE_WELL_EVENT, well);
    wiComponentService.putComponent(wiComponentService.PROJECT_LOADED, project);
};

// todo: refactor
exports.updateWellsProject = function (wiComponentService, wells) {
    // update well
    let project = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);
    if (!project) return;
    for (let well of wells) {
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
    }
    wiComponentService.emit(wiComponentService.UPDATE_MULTI_WELLS_EVENT, wells);
    wiComponentService.putComponent(wiComponentService.PROJECT_LOADED, project);
};

function getCurveDataByName(apiService, idCurve, callback) {
    apiService.post(apiService.CURVE, {idCurve})
        .then(function (curve) {
            console.log('curve data', curve);
            callback(null, curve);
        })
        .catch(function (err) {
            console.error('getCurveDataByName', err);

            callback(err);
        });
}

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
            dragMan.wiD3Ctrl = null;
            dragMan.track = null;
            if (wiD3Ctrl && track) {
                getCurveDataByName(apiService, ui.helper.attr('data'), function (err, data) {
                    if (!err) wiD3Ctrl.addCurveToTrack(track, data, {
                        name: ui.helper.attr('data'),
                        unit: 'm3'
                    });
                });
            }
        },
        appendTo: 'body',
        revert: false,
        scroll: false,
        helper: 'clone',
        containment: 'document',
        cursor: 'move',
        cursorAt: {top: 0, left: 0}
    });
};

exports.createNewBlankLogPlot = function (wiComponentService, wiApiService, logplotName) {
    let well = wiComponentService.getComponent(wiComponentService.ITEM_ACTIVE_PAYLOAD);
    console.log('well payload', well);

    let dataRequest = {
        idWell: well.idWell,
        name: logplotName,
        option: 'blank-plot'
    };
    return wiApiService.post(wiApiService.CREATE_PLOT, dataRequest);
};

exports.openLogplotTab = function (wiComponentService, logplot) {
    wiComponentService.emit(wiComponentService.ADD_LOGPLOT_EVENT, logplot);
}

exports.updateLogplotProject = function(wiComponentService, idWell, logplot) {
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
}

exports.findLogplotModelById = function (logplotId, wiComponentService) {
    let project = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);

    if (!project || !Array.isArray(project.wells)) return;

    for (let well of project.wells) {
        if (!Array.isArray(well.plots)) continue;

        for (let plot of well.plots) {
            if (plot.idPlot == logplotId) {
                return plot;
            }
        }
    }

    return null;
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
       console.log("OKOK");
    });
};

exports.refreshProjectState = function(wiComponentService, wiApiService) {
    let project = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);

    if (!project) return;

    return new Promise(function(resolve, reject) {
        let payload = {
            idProject: project.idProject
        };

        wiApiService.post(wiApiService.GET_PROJECT, payload)
            .then(function(projectRefresh) {
                wiComponentService.putComponent(wiComponentService.PROJECT_LOADED, projectRefresh);
                wiComponentService.emit(wiComponentService.PROJECT_REFRESH_EVENT);

                resolve();
            })
            .catch(function(err) {
                console.error('refreshProjectState', err);

                reject();
            });
    });
};
