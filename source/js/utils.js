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

exports.setupCurveDraggable = function (wiComponentService) {
    let dragMan = wiComponentService.getComponent(wiComponentService.DRAG_MAN);

    $('.wi-parent-node').draggable({
        start: function (event, ui) {
            console.log('start', ui.helper.attr('data-curve'));
            dragMan.dragging = true;
            dragMan.draggedObj = ui.helper.attr('data-curve');
        },
        stop: function (event, ui) {
            dragMan.cancelingId = setTimeout(function () {
                console.log('stop');
                dragMan.dragging = false;
                dragMan.draggedObj = null;
                dragMan.cancelingId = null;
            }, 1000);
        },
        appendTo: 'body',
        revert: false,
        scroll: false,
        helper: 'clone',
        containment: 'document'
    });
};

// exports.parseTime = function (wiComponentService, time) {
//     let moment = wiComponentService.getComponent(wiComponentService.MOMENT);
//     let timestamp = 'DD-MM-YYYY, h:mm:ss a';
//
//     return moment(time).format(timestamp);
// };