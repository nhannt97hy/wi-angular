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
        for (let i = 0; i < project.wells.length; i++) {
            if (project.wells[i].idWell == well.idWell) {
                project.wells[i] = well;
            }
        }
    }

    wiComponentService.emit(wiComponentService.UPDATE_WELL_EVENT, well);
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
        containment: 'document'
    });
};

exports.createNewBlankLogPlot = function (wiComponentService, logPlot) {
    wiComponentService.emit(wiComponentService.ADD_LOGPLOT_EVENT, logPlot.title);
};

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
