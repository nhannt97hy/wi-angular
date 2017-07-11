'use strict';

//Utils for object checking and object cloning
function objcpy(destObj, sourceObj) {
    if (destObj) {
        for (let attr in sourceObj) {
            destObj[attr] = sourceObj[attr];
        }
    }
}

function isEqual(a, b) {
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
}
var openProject = {
    valid: false
};

function bindFunctions(destHandlers, sourceHandlers, thisObj) {
    for (let handler in sourceHandlers) {
        destHandlers[handler] = sourceHandlers[handler].bind(thisObj);
    }
}
// APP Utils
function projectOpen(wiComponentService, projectData) {
    wiComponentService.emit('project-loaded-event', projectData);
    objcpy(openProject, projectData);
    openProject.valid = true;
}

function projectClose(wiComponentService) {
    wiComponentService.emit('project-unloaded-event');
    openProject.valid = false;
    openProject = {};
}

function pushProjectToExplorer(self, project, wiComponentService, WiTreeConfig, WiWell, $timeout) {
    console.log('project data: ', project);
    self.treeConfig = (new WiTreeConfig()).config;
    console.log('self.treeConfig', self.treeConfig);
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
}

exports.objcpy = objcpy;
exports.isEqual = isEqual;
exports.bindFunctions = bindFunctions;
exports.projectOpen = projectOpen;
exports.projectClose = projectClose;
exports.pushProjectToExplorer = pushProjectToExplorer;
exports.openProject = openProject;