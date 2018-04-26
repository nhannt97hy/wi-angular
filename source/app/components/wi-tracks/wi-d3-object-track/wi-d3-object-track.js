const componentName = 'wiD3ObjectTrack';
const moduleName = 'wi-d3-object-track';
const componentAlias = 'wiD3Track';

let wiD3AbstractTrack = require('./wi-d3-abstract-track.js');
Controller.prototype = Object.create(wiD3AbstractTrack.prototype);
Controller.prototype.constructor = Controller;

function Controller ($scope, wiComponentService, wiApiService, ModalService, $compile) {
    wiD3AbstractTrack.call(this, wiApiService, wiComponentService);
    let self = this;
    let Utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let graph = wiComponentService.getComponent(wiComponentService.GRAPH);
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let props = null;
    let contextMenu = [{
        name: "TrackProperties",
        label: "Track Properties",
        icon: 'track-properties-16x16',
        handler: function() {
            self.openPropertiesDialog()
        }
    }, {
        separator: '1'
    }, {
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
                    idObjectTrack: self.viTrack.id,
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
                if (!self.viTrack) return;
                let transformY = self.viTrack.getTransformY();

                let object = self.addObjectToTrack(self.viTrack, newOoT);
                self.viTrack.setCurrentDrawing(object);
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
                    idObjectTrack: self.viTrack.id,
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
                if (!self.viTrack) return;
                let transformY = self.viTrack.getTransformY();

                let object = self.addObjectToTrack(self.viTrack, newOoT);
                self.viTrack.setCurrentDrawing(object);
                object.createCrossplot(newCrossplotModel.properties.idCrossPlot,
                    newCrossplotModel.properties.name, self.wiD3Ctrl.scopeObj, self.wiD3Ctrl.compileFunc, self.wiD3Ctrl.containerName);
                callback();
            }]);
        }
    }, {
        separator: '1'
    }];
    this.getContextMenu = function () {
        return _(contextMenu).concat(self.wiD3Ctrl.contextMenu).value();
    }
    /*
    this.showContextMenu = function (event) {
        let items = self.wiD3Ctrl.getCommonContextMenuItems();
        let viTrack = self.viTrack;
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
                        idObjectTrack: viTrack.id,
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
                    if (!viTrack) return;
                    let transformY = viTrack.getTransformY();

                    let object = self.addObjectToTrack(viTrack, newOoT);
                    viTrack.setCurrentDrawing(object);
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
                        idObjectTrack: viTrack.id,
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
                    if (!viTrack) return;
                    let transformY = viTrack.getTransformY();

                    let object = self.addObjectToTrack(viTrack, newOoT);
                    viTrack.setCurrentDrawing(object);
                    object.createCrossplot(newCrossplotModel.properties.idCrossPlot,
                        newCrossplotModel.properties.name, self.wiD3Ctrl.scopeObj, self.wiD3Ctrl.compileFunc, self.wiD3Ctrl.containerName);
                    callback();
                }]);
            }
        }];
        items.trackItemsCreation = items.trackItemsCreation.concat(trackItemsCreationArray);
        self.wiD3Ctrl.setContextMenu(self.wiD3Ctrl.buildContextMenu(items));
    }
    */
    this.openPropertiesDialog = function () {
        let viTrack = self.viTrack;
        DialogUtils.objectTrackPropertiesDialog(ModalService, viTrack.getProperties(), function (props) {
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
            // self.wiD3Ctrl.setCurrentTrack(track);
            if (d3.event.button == 2) {
                _objectOnRightClick();
            }
        });
        track.onObjectHeaderMouseDown(object, function () {
            // self.wiD3Ctrl.setCurrentTrack(track);
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
    this.onTrackKeyPressCallback = function () {
        if(!d3.event) return;
        let track = self.viTrack;
        switch(d3.event.key) {
            case 'Backspace':
            case 'Delete':
                let drawing = track.getCurrentDrawing();
                if (!drawing) return;
                if (drawing.isObject()) {
                    self.removeAnObjectOfObjectTrack();
                }
            case 'Escape':
                // Bug
                if (track && track.setMode) track.setMode(null);
                return;
        }
   }

    this.$onInit = function () {
        wiD3AbstractTrack.prototype.$onInit.call(self);
        self.plotAreaId = self.name + 'PlotArea';
    }
    this.onReady = function () {
        self.viTrack = createVisualizeObjectTrack(self.getProperties());
        self.registerTrackCallback();
        self.registerTrackHorizontalResizerDragCallback();
        self.viTrack.on('keydown', self.onTrackKeyPressCallback);
        self.registerTrackMouseEventHandlers();
        self.getProperties().controller = self;
        if(self.wiD3Ctrl) self.wiD3Ctrl.registerTrackDragCallback(self);
        
        for (let objectOfTrack of self.getProperties().object_of_tracks) {
            let anObject = self.addObjectToTrack(self.viTrack, objectOfTrack);
            let objectProps = JSON.parse(objectOfTrack.object);
            switch(objectProps.type) {
                case 'Histogram' :
                    if (objectProps.idHistogram) {
                        let histogramModel = Utils.findHistogramModelById(objectProps.idHistogram);
                        if (histogramModel && histogramModel.properties) {
                            anObject.createHistogram(
                                histogramModel.properties.idHistogram,
                                histogramModel.properties.name,
                                self.wiD3Ctrl.scopeObj, self.wiD3Ctrl.compileFunc, self.wiD3Ctrl.containerName
                            );
                        }
                        else {
                            // TODO
                        }
                    }
                    else {
                        // TODO
                    }
                    break;
                case 'Crossplot':
                    if (objectProps.idCrossplot) {
                        let crossplotModel = Utils.getModel('crossplot', objectProps.idCrossplot);
                        if (crossplotModel && crossplotModel.properties) {
                            anObject.createCrossplot(
                                crossplotModel.properties.idCrossPlot,
                                crossplotModel.properties.name,
                                self.wiD3Ctrl.scopeObj, self.wiD3Ctrl.compileFunc, self.wiD3Ctrl.containerName
                            );
                        }
                        else {
                            // TODO
                        }
                    }
                    else {
                        // TODO
                    }
                    break;
                    objectProps.intervalDepthTop = objectOfTrack.topDepth;
                    objectProps.intervalDepthBottom = objectOfTrack.bottomDepth;
                    wiApiService.getCrossplot(objectProps.idCrossPlot, function(crossplot) {
                        if(crossplot.idCrossPlot) {
                            wiApiService.getPointSet(objectProps.idPointSet, function(pointSet) {
                                wiApiService.infoCurve(pointSet.idCurveX, function(curveX) {
                                    wiApiService.dataCurve(pointSet.idCurveX, function(dataCurveX) {
                                        curveX.rawData = dataCurveX;
                                        if(pointSet.idCurveX == pointSet.idCurveY) {
                                            let curveY = curveX;
                                            Utils.createCrossplotToObjectOfTrack(anObject, curveX, curveY, pointSet, objectProps, wiApiService);
                                        } else {
                                            wiApiService.infoCurve(pointSet.idCurveY, function(curveY) {
                                                wiApiService.dataCurve(pointSet.idCurveY, function(dataCurveY) {
                                                    curveY.rawData = dataCurveY;
                                                    Utils.createCrossplotToObjectOfTrack(anObject, curveX, curveY, pointSet, objectProps, wiApiService);
                                                })
                                            })
                                        }
                                    })
                                })
                            });
                        } else {
                            self.removeAnObjectOfObjectTrack(anObject);
                        }
                    });
                    break;
                default:
                    break;
            }
        }
    }

    function createVisualizeObjectTrack (trackProperties) {
        let trackConfig = trackProperties;
        let config = angular.copy(trackConfig);
        config.id = trackConfig.idObjectTrack;
        config.name = trackConfig.title;
        config.yStep = parseFloat(self.wiD3Ctrl.getWellProps().step);
        config.offsetY = parseFloat(self.wiD3Ctrl.getWellProps().topDepth);
        config.width = Utils.inchToPixel(trackConfig.width);
        //config.wiComponentService = wiComponentService;
        console.log(config);

        let track = graph.createObjectTrack(config, document.getElementById(self.plotAreaId));
        wiComponentService.putComponent('vi-object-track-' + config.id, track);

        return track;
    }
    function _objectOnRightClick() {
        let viTrack = self.viTrack;
        let object = viTrack.getCurrentDrawing();

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
        let viTrack = self.viTrack;
        if(!viTrack.isObjectTrack() || (viTrack.isObjectTrack() && !viTrack.getCurrentDrawing)) {
            console.log('not an object track');
            return;
        }
        let object = objectToRemove || viTrack.getCurrentDrawing();
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
            viTrack.removeObject(object);
            // _plotZoneSet(viTrack);
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
        properties: '<',
        minY: '<',
        maxY: '<'
    }
});
exports.name = moduleName;
