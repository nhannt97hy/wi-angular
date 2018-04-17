const componentName = 'wiD3ObjectTrack';
const moduleName = 'wi-d3-object-track';
const componentAlias = 'wiD3Track';

function Controller ($scope, wiComponentService, wiApiService, ModalService, $compile) {
    let self = this;
    let Utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let graph = wiComponentService.getComponent(wiComponentService.GRAPH);
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let props = null;

    this.showContextMenu = function (event) {
        let items = self.wiD3Ctrl.getCommonContextMenuItems();
        let _currentTrack = self.wiD3Ctrl.getCurrentTrack();
        let trackItemsCreationArray = [{
            name: 'AddHistogram',
            label: 'Add Histogram',
            icon: 'histogram-new-16x16',
            handler: function () {
                let windowY = self.wiD3Ctrl.getDepthRangeFromSlidingBar();
                let range = windowY[1] - windowY[0];
                let newHistogramProps = {
                    divisions: 10,
                    plot: 'Bar',
                    color: 'blue',
                    showGrid: true,
                    idWell: self.wiD3Ctrl.getWellProps().idWell,
                    intervalDepthTop: windowY[0] + range/4.,
                    intervalDepthBottom: windowY[1] - range/4.,
                    name: "Histogram - " + (Math.random().toString(36).substr(2, 3))
                };

                let newHistogram;
                let newOoT;
                async.series([ function(callback) {
                    wiApiService.createHistogram(newHistogramProps, function(createdHistogram) {
                        if(!createdHistogram.idHistogram) {
                            DialogUtils.errorMessageDialog(ModalService, "Error! " + createdHistogram);
                            callback(createdHistogram);
                        }
                        else {
                            newHistogram = createdHistogram;
                            callback();
                        }
                    });
                }, function(callback) {
                    Utils.refreshProjectState().then(function() {
                        callback();
                    });
                }, function(callback) {
                    DialogUtils.histogramFormatDialog(ModalService, newHistogram.idHistogram, function(histogramProps) {
                        newHistogram = histogramProps
                        callback();
                    }, function() {
                        callback('cancel');
                    }, {
                        hideApply: true,
                        autoName: true
                    });
                }, function(callback) {
                    wiApiService.createObjectOfObjectTrack({
                        idObjectTrack: _currentTrack.id,
                        topDepth: newHistogram.intervalDepthTop,
                        bottomDepth: newHistogram.intervalDepthBottom,
                        object: JSON.stringify({
                            type: 'Histogram',
                            idHistogram: newHistogram.idHistogram,
                            background: 'white'
                        })
                    }, function(returnedObject) {
                        if (returnedObject.idObjectOfTrack) {
                            newOoT = returnedObject;
                            callback();
                        }
                        else {
                            newOoT = null;
                            callback(returnedObject);
                        }
                    });
                }, function(callback) {
                    Utils.refreshProjectState().then(function() {
                        callback();
                    });
                }, function(callback) {
                    if (!_currentTrack) return;
                    let transformY = _currentTrack.getTransformY();

                    let object = self.addObjectToTrack(_currentTrack, newOoT);
                    _currentTrack.setCurrentDrawing(object);
                    object.createHistogram(newHistogram.idHistogram, newHistogram.name, self.wiD3Ctrl.scopeObj, self.wiD3Ctrl.compileFunc, self.wiD3Ctrl.containerName);
                    callback();
                }]);
            }
        }, {
            name: 'AddCrossplot',
            label: 'Add Crossplot',
            icon: 'crossplot-new-16x16',
            handler: function () {
                let windowY = self.wiD3Ctrl.getDepthRangeFromSlidingBar();
                let range = windowY[1] - windowY[0];
                let newCrossplotModel = null;
                let newOoT;
                async.series([ function(callback) {
                    utils.createCrossplot(self.wiD3Ctrl.getWellProps().idWell,
                        "Crossplot - " + (Math.random().toString(36).substr(2, 3)),
                        function(err, crossplotModel) {
                            if (err) {
                                console.error(err);
                                utils.error(err, function() {
                                    callback();
                                });
                            }
                            else {
                                newCrossplotModel = crossplotModel;
                                callback();
                            }
                        }
                    );
                }, function(callback) {
                    let pointSet = newCrossplotModel.properties.pointsets[0];
                    pointSet.intervalDepthTop = windowY[0] + range/4.;
                    pointSet.intervalDepthBottom = windowY[1] - range/4.;
                    wiApiService.editPointSet(pointSet, function(returnData) {
                        newCrossplotModel.properties.pointsets[0] = returnData;
                        callback();
                    });
                }, function(callback) {
                    DialogUtils.crossplotFormatDialog(ModalService, newCrossplotModel.properties.idCrossPlot, function(crossplotProps) {
                        newCrossplotModel.properties = crossplotProps;
                        async.parallel([ function(cb) {
                            wiApiService.editCrossplot(newCrossplotModel.properties, function(returnData) {
                                cb();
                            });
                        }, function(cb) {
                            wiApiService.editPointSet(newCrossplotModel.properties.pointsets[0], function(returnData) {
                                cb();
                            });
                        }], function(err, result) {
                            callback();
                        });
                    }, function() {
                        callback('cancel');
                    }, {
                        hideApply: true,
                        autoName: true
                    });
                }, function(callback) {
                    wiApiService.createObjectOfObjectTrack({
                        idObjectTrack: _currentTrack.id,
                        topDepth: newCrossplotModel.properties.pointsets[0].intervalDepthTop,
                        bottomDepth: newCrossplotModel.properties.pointsets[0].intervalDepthBottom,
                        object: JSON.stringify({
                            type: 'Crossplot',
                            idCrossplot: newCrossplotModel.properties.idCrossPlot,
                            background: 'white'
                        })
                    }, function(returnedObject) {
                        if (returnedObject.idObjectOfTrack) {
                            newOoT = returnedObject;
                            callback();
                        }
                        else {
                            newOoT = null;
                            callback(returnedObject);
                        }
                    });
                }, function(callback) {
                    if (!_currentTrack) return;
                    let transformY = _currentTrack.getTransformY();

                    let object = self.addObjectToTrack(_currentTrack, newOoT);
                    _currentTrack.setCurrentDrawing(object);
                    object.createCrossplot(newCrossplotModel.properties.idCrossPlot,
                        newCrossplotModel.properties.name, self.wiD3Ctrl.scopeObj, self.wiD3Ctrl.compileFunc, self.wiD3Ctrl.containerName);
                    callback();
                }]);
            }
        }];
        items.trackItemsCreation = items.trackItemsCreation.concat(trackItemsCreationArray);
        self.wiD3Ctrl.setContextMenu(self.wiD3Ctrl.buildContextMenu(items));
    }
    this.openPropertiesDialog = function () {
        let viTrack = self.viTrack;
        let trackProps = viTrack.getProperties();
        DialogUtils.objectTrackPropertiesDialog(ModalService, self.wiD3Ctrl.wiLogplotCtrl, trackProps, function (props) {
            if (props) {
                props.idObjectTrack = viTrack.id;
                console.log("Track new properties: ", props);
                wiApiService.editObjectTrack(props, function () {
                    props.width = Utils.inchToPixel(props.width);
                    viTrack.setProperties(props);
                    viTrack.doPlot(true);
                })
            }
        })
    }
    this.addObjectToTrack = function (track, config) {
        if (!track || !track.addObject) return;
        if (!config) {
            console.log('there are no configurations of object');
        }
        let object = track.addObject(config, wiComponentService, wiApiService);
        track.plotObject(object);
        //track.rearrangeHeaders();
        track.onObjectMouseDown(object, function () {
            self.wiD3Ctrl.setCurrentTrack(track);
            if (d3.event.button == 2) {
                _objectOnRightClick();
            }
        });
        track.onObjectHeaderMouseDown(object, function () {
            self.wiD3Ctrl.setCurrentTrack(track);
            let depthRange = object.getDepthRange();
            let rangeValue = depthRange[1] - depthRange[0];
            depthRange[0] -= rangeValue * 0.5;
            depthRange[1] += rangeValue * 0.5;

            self.wiD3Ctrl.setDepthRange(depthRange);
            self.wiD3Ctrl.adjustSlidingBarFromDepthRange(depthRange);
            if (d3.event.button == 2) {
                _objectOnRightClick();
            }
        });

        object.on('dblclick', _objectOnDoubleClick);
        object.header.on('dblclick', _objectOnDoubleClick);

        return object;
    }
    this.removeAnObjectOfObjectTrack = removeAnObjectOfObjectTrack;

    this.$onInit = function () {
        self.plotAreaId = self.name + 'PlotArea';
    }
    this.onReady = function () {
        self.viTrack = createVisualizeObjectTrack(getProperties());
        self.wiD3Ctrl.subscribeTrackCtrlWithD3Ctrl(self);
    }

    function createVisualizeObjectTrack (trackProperties) {
        let trackConfig = trackProperties;
        let config = angular.copy(trackConfig);
        config.id = trackConfig.idObjectTrack;
        config.name = trackConfig.title;

        // TO BE REMOVED
        // config.yStep = parseFloat(self.wiD3Ctrl.getWellProps().step);
        // config.offsetY = parseFloat(self.wiD3Ctrl.getWellProps().topDepth);
        
        config.width = Utils.inchToPixel(trackConfig.width);
        //config.wiComponentService = wiComponentService;
        console.log(config);

        let track = graph.createObjectTrack(config, document.getElementById(self.plotAreaId));
        wiComponentService.putComponent('vi-object-track-' + config.id, track);

        return track;
    }
    function getProperties() {
        if(self.viTrack)
            return self.viTrack.getProperties();
        return self.properties;
    }
    function _objectOnRightClick() {
        let _currentTrack = self.wiD3Ctrl.getCurrentTrack();
        let object = _currentTrack.getCurrentDrawing();

        let contextMenu = [
            {
                name: 'RemoveObject',
                label: 'Remove Object',
                icon: '',
                handler: function () {
                    removeAnObjectOfObjectTrack();
                }
            }, {
                name: 'ObjectProperties',
                label: 'Object Properties',
                icon: '',
                handler: function () {
                    objectProperties();
                }
            }
        ];

        self.wiD3Ctrl.setContextMenu(contextMenu);
    }
    function objectProperties() {}
    function _objectOnDoubleClick() {
        objectProperties();
        d3.event.stopPropagation();
    }
    function removeAnObjectOfObjectTrack(objectToRemove) {
        let _currentTrack = self.wiD3Ctrl.getCurrentTrack();
        if(!_currentTrack.isObjectTrack() || (_currentTrack.isObjectTrack() && !_currentTrack.getCurrentDrawing)) {
            console.log('not an object track');
            return;
        }
        let object = objectToRemove || _currentTrack.getCurrentDrawing();
        console.log("Removing: ", object);
        wiApiService.removeObjectOfObjectTrack(object.id, function () {
            switch (object.currentDraw) {
                case "Crossplot":
                    wiApiService.removeCrossplot(object.idCrossplot, function () {
                        console.log("crossplot removed");
                        Utils.refreshProjectState();
                    });
                    break;
                case "Histogram" :
                    wiApiService.removeHistogram(object.idHistogram, function () {
                        console.log("histogram removed");
                        Utils.refreshProjectState();
                    })
                    break;
                default:
                    break;
            }
            _currentTrack.removeObject(object);
            // _plotZoneSet(_currentTrack);
            console.log("Remove complete");
        });
    }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: '../wi-d3-track-template.html',
    controller: Controller,
    controllerAs: componentAlias,
    transclude: true,
    bindings: {
        name: '@',
        wiD3Ctrl: '<',
        properties: '<'
    }
});
exports.name = moduleName;
