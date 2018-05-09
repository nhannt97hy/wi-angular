const componentName = 'wiD3ZoneTrack';
const moduleName = 'wi-d3-zone-track';
const componentAlias = 'wiD3Track';

let wiD3AbstractTrack = require('./wi-d3-abstract-track.js');
Controller.prototype = Object.create(wiD3AbstractTrack.prototype);
Controller.prototype.constructor = Controller;

function Controller ($scope, wiComponentService, wiApiService, ModalService, $element) {
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
        name: "AddZone",
        label: "Add Zone",
        icon: "zone-edit-16x16",
        handler: function () {
            if (!self.viTrack.idZoneSet) {
                Utils.error('Zone Set is required');
                return;
            }
            self.viTrack.setMode('AddZone');
        }
    }, {
        separator: '1'
    }];
    /*
    this.showContextMenu = function (event) {
        if(self.isZoneRightClicked) {
            _zoneOnRightClick();
            self.isZoneRightClicked = false;
        } else {
            let items = self.wiD3Ctrl.getCommonContextMenuItems();
            let track = self.viTrack;
            items.trackItemsCreation.push({
                name: "AddZone",
                label: "Add Zone",
                icon: "zone-edit-16x16",
                handler: function () {
                    if (!track.idZoneSet) {
                        Utils.error('Zone Set is required');
                        return;
                    }
                    track.setMode('AddZone');
                }
            });
            self.wiD3Ctrl.setContextMenu(self.wiD3Ctrl.buildContextMenu(items));
        }
    }
    */
    this.getContextMenu = function () {
        if(self.isZoneRightClicked) {
            self.isZoneRightClicked = false;
            return _getZoneContextMenu();
        } else {
            return _(contextMenu).concat(self.wiD3Ctrl.getContextMenu()).value();
        }
    }
    this.openPropertiesDialog = function () {
        // const zoneTrackProps = self.viTrack.getProperties();
        // zoneTrackProps.width = Utils.pixelToInch(zoneTrackProps.width);
        DialogUtils.zoneTrackPropertiesDialog(ModalService, this.getProperties());
    }
    this.update = function (baseSource) {
        if(baseSource && baseSource.idZoneSet == self.viTrack.idZoneSet) {
            _plotZoneTrack(baseSource, self.viTrack);
        } else {
            self.viTrack.removeAllZones();
            wiApiService.getZoneSet(self.viTrack.idZoneSet, function (zoneset) {
                for (let zone of zoneset.zones) {
                    self.addZoneToTrack(self.viTrack, zone);
                }
            });
        }
    }
    this.addZoneToTrack = function (track, config, controller) {
        if (!track || !track.addZone) return;
        if (!config || !config.idZoneSet) {
            config.idZoneSet = self.viTrack.isZoneTrack() ? self.viTrack.idZoneSet : undefined;
        }
        if (!config.idZoneSet) return;
        let zone = track.addZone(config);
        track.plotZone(zone);
        track.rearrangeHeaders();
        track.onZoneMouseDown(zone, function () {
            if (track.mode == 'SplitZone') {
                _splitZone(track, zone);
                track.setMode(null);
            }
            if (d3.event.button == 2) {
                self.isZoneRightClicked = true;
                if(controller)
                    controller.isZoneRightClicked = true;
                // _zoneOnRightClick();
            }
        });
        track.onZoneHeaderMouseDown(zone, function () {
            if (d3.event.button == 2) {
                self.isZoneRightClicked = true;
                if(controller)
                    controller.isZoneRightClicked = true;
                // _zoneOnRightClick();
            }
        });
        zone.on('dblclick', _zoneOnDoubleClick);
        zone.header.on('dblclick', _zoneOnDoubleClick);
        zone.onLineDragEnd(function () {
            let zones = track.adjustZonesOnZoneChange(zone);
            let updatedZones = zones[0];
            let deletedZones = zones[1];
            updatedZones.push(zone);
            let promises = [];
            // send api to add or delete zones
            for (let updatedZone of updatedZones) {
                updatedZone.idZone = updatedZone.id;
                promises.push(new Promise(resolve => {
                    wiApiService.editZone(updatedZone, function () {
                        resolve();
                    });
                }));
            }
            for (let deletedZone of deletedZones) {
                promises.push(new Promise(resolve => {
                    wiApiService.removeZone(deletedZone.id, function () {
                        resolve();
                    });
                }));
            }
            Promise.all(promises)
                .then(() => {
                    wiComponentService.emit('zone-updated', track)
                    Utils.refreshProjectState();
                })
            // Utils.emitEvent('zone-updated', track);
        })
        return zone;
    }
    this.onTrackKeyPressCallback = function () {
        if(!d3.event) return;
        let track = self.viTrack;
        switch(d3.event.key) {
            case 'Backspace':
            case 'Delete':
                let drawing = track.getCurrentDrawing();
                if (!drawing) return;
                if (drawing.isZone()) {
                    // Send api before deleting
                    wiApiService.removeZone(drawing.id, function () {
                        track.removeDrawing(drawing);
                        // Utils.emitEvent('zone-updated', track);
                        wiComponentService.emit('zone-updated', track)
                        Utils.refreshProjectState();
                    })
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
        self.viTrack = createVisualizeZoneTrack(self.getProperties());
        self.registerTrackCallback();
        self.registerTrackHorizontalResizerDragCallback();
        self.viTrack.on('keydown', self.onTrackKeyPressCallback);
        self.registerTrackMouseEventHandlers();
        self.getProperties().controller = self;
        if (self.wiD3Ctrl) self.wiD3Ctrl.registerTrackDragCallback(self);
        
        wiApiService.getZoneSet(self.viTrack.idZoneSet, function (zoneset) {
            for (let zone of zoneset.zones) {
                self.addZoneToTrack(self.viTrack, zone);
            }
        })

        // Utils.listenEvent('zone-updated', function(eventData) {
        wiComponentService.on('zone-updated', function(eventData) {
            console.log('zone updated event', eventData, eventData == self.viTrack);
            if(eventData && eventData.isZoneTrack && eventData.isZoneTrack()) {
                if(eventData.id == self.viTrack.id || eventData == self.viTrack) {
                    return;
                }
                if(eventData.idZoneSet != self.viTrack.idZoneSet) {
                    return;
                }
                self.update(eventData);
            } else if(eventData &&
                ( (eventData.isZone && eventData.isZone() && eventData.idZoneSet == self.viTrack.idZoneSet) ||
                (eventData.properties && eventData.properties.idZoneSet == self.viTrack.idZoneSet) )) {
                self.update();
            } else {
                self.update();
            }
        });

        /* register when track mode = add zone */
        let track = self.viTrack;
        let zone;
        track.plotContainer.call(d3.drag()
            .on('start', function () {
                track.setCurrentDrawing(null);
                if (track.mode != 'AddZone') return;
                track.startY = d3.mouse(track.plotContainer.node())[1];
            })
            .on('drag', function () {
                if (track.mode != 'AddZone') return;
                let y1 = d3.mouse(track.plotContainer.node())[1];
                let y2 = track.startY;
                let minY = d3.min([y1, y2]);
                let maxY = d3.max([y1, y2]);
                zone = track.getCurrentZone();

                if (!zone) {
                    zone = self.addZoneToTrack(track, {
                        minY: track.minY,
                        maxY: track.maxY
                    });
                    track.setCurrentDrawing(zone);
                }
                if (!zone) {
                    track.setMode(null);
                    return;
                }
                let transformY = zone.getTransformY();
                let startDepth = transformY.invert(minY);
                let endDepth = transformY.invert(maxY);
                zone.setProperties({
                    name: parseInt(startDepth),
                    startDepth: startDepth,
                    endDepth: endDepth
                });
                track.plotZone(zone);
            })
            .on('end', function () {
                if (track.mode != 'AddZone') return;
                // Send api to create new zone on server
                if (!track.idZoneSet) {
                    track.idZoneSet = _currentTrack.isZoneTrack() ? _currentTrack.idZoneSet : undefined;
                    if (!track.idZoneSet) return;
                }
                let zoneData = {
                    idZoneSet: track.idZoneSet,
                    name: zone.name,
                    startDepth: zone.startDepth,
                    endDepth: zone.endDepth,
                    fill: zone.fill
                }
                wiApiService.createZone(zoneData, function (createdZone, err) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    zone.setProperties(createdZone);
                    let modifiedZones = track.adjustZonesOnZoneChange(zone);
                    let updatedZones = modifiedZones[0];
                    let deletedZones = modifiedZones[1];
                    // Send api to update or delete zones
                    if (updatedZones && updatedZones.length) {
                        updatedZones.forEach(function (updatingZone) {
                            updatingZone.idZone = updatingZone.id;
                            wiApiService.editZone(updatingZone, function () {
                            });
                        });
                    }
                    if (deletedZones && deletedZones.length) {
                        deletedZones.forEach(function (deletingZone) {
                            wiApiService.removeZone(deletingZone.id, function () {
                            });
                        });
                    }
                    // _plotZoneSet(track);
                    // Utils.emitEvent('zone-updated', track);
                    wiComponentService.emit('zone-updated', track);
                    Utils.refreshProjectState();
                    track.setMode(null);
                    track.rearrangeHeaders();
                })
            })
        );
    }

    function createVisualizeZoneTrack (trackProperties) {
        let config = angular.copy(trackProperties);
        config.id = trackProperties.idZoneTrack;
        config.name = trackProperties.title;

        // TO BE REMOVED
        // config.yStep = parseFloat(self.wiD3Ctrl.getWellProps().step);
        // config.offsetY = parseFloat(self.wiD3Ctrl.getWellProps().topDepth);

        config.width = Utils.inchToPixel(trackProperties.width);
        config.bgColor = trackProperties.color;

        config.wiComponentService = wiComponentService;
        console.log(config);
        let track = graph.createZoneTrack(config, document.getElementById(self.plotAreaId));

        wiComponentService.putComponent('vi-zone-track-' + config.id, track );
        return track;
    }
	function _splitZone(track, zone) {
        let props = Utils.objClone(zone.getProperties());
        let zone1 = self.addZoneToTrack(track, {});
        let zone2 = self.addZoneToTrack(track, {});

        zone1.setProperties(props);
        zone2.setProperties(props);

        let fill = props.fill;
        let fill1 = Utils.objClone(fill);
        fill1.pattern.background = track.genColor();
        zone1.fill = fill1;

        let fill2 = Utils.objClone(fill);
        fill2.pattern.background = track.genColor();
        zone2.fill = fill2;

        let y = d3.mouse(track.plotContainer.node())[1];
        let depth = zone.getTransformY().invert(y);
        // Send api to remove zone
        wiApiService.removeZone(zone.id, function () {
            zone1.endDepth = depth;
            zone2.startDepth = depth;
            zone2.name = parseInt(depth);
            // Send api to create zones;
            wiApiService.createZone(zone1.getProperties(), function (zone1Return, err) {
                if (err) return;
                zone1.id = zone1Return.idZone;
                wiApiService.createZone(zone2.getProperties(), function (zone2Return, err) {
                    if (err) return;
                    zone2.id = zone2Return.idZone;
                    track.plotZone(zone1);
                    track.plotZone(zone2);
                    track.removeZone(zone);
                    track.rearrangeHeaders();
                    Utils.refreshProjectState();
                })
            })
        })
    }
    function _getZoneContextMenu() {
        let zone = self.viTrack.getCurrentZone();
        return [
            {
                name: "AutoZoneNamed",
                label: "Auto Zone Named",
                handler: function () {
                    self.viTrack.autoName().forEach(function (zone) {
                        wiApiService.editZone(zone.getProperties(), function () {
                            // Utils.emitEvent('zone-updated', self.viTrack);
                            wiComponentService.emit('zone-updated', self.viTrack);
                            Utils.refreshProjectState();
                        });
                    });
                    self.viTrack.doPlot(true);
                }
            }, {
                name: "ZoneProperties",
                label: "Zone Properties",
                icon: "zone-edit-16x16",
                handler: zoneProperties
            }, {
                name: "RemoveZone",
                label: "Remove Zone",
                icon: "zone-delete-16x16",
                handler: function () {
                    wiApiService.removeZone(zone.id, function () {
                        //_plotZoneSet(self.viTrack);
                        self.viTrack.removeZone(zone);
                        // Utils.emitEvent('zone-updated', self.viTrack);
                        wiComponentService.emit('zone-updated', self.viTrack);
                        // wiComponentService.emit(wiComponentService.DELETE_MODEL, self.viTrack);
                        Utils.refreshProjectState();
                    });
                }
            }, {
                name: "ZoneTable",
                label: "Zone Table",
                icon: "zone-table-16x16",
                handler: function () {
                }
            }, {
                name: "SplitZone",
                label: "Split Zone",
                handler: function () {
                    self.viTrack.setMode('SplitZone');
                }
            }
        ]
        /*
        let _currentTrack = self.viTrack;
        let zone = self.viTrack.getCurrentZone();
        console.log(zone);
        self.wiD3Ctrl.setContextMenu([
            {
                name: "AutoZoneNamed",
                label: "Auto Zone Named",
                handler: function () {
                    self.viTrack.autoName().forEach(function (zone) {
                        wiApiService.editZone(zone.getProperties(), function () {
                            // _plotZoneSet(_currentTrack);
                            Utils.emitEvent('zone-updated', self.viTrack);
                            Utils.refreshProjectState();
                        });
                    });
                    self.viTrack.doPlot(true);
                }
            }, {
                name: "ZoneProperties",
                label: "Zone Properties",
                icon: "zone-edit-16x16",
                handler: zoneProperties
            }, {
                name: "RemoveZone",
                label: "Remove Zone",
                icon: "zone-delete-16x16",
                handler: function () {
                    wiApiService.removeZone(zone.id, function () {
                        //_plotZoneSet(self.viTrack);
                        self.viTrack.removeZone(zone);
                        Utils.emitEvent('zone-updated', self.viTrack);
                        // wiComponentService.emit(wiComponentService.DELETE_MODEL, self.viTrack);
                        Utils.refreshProjectState();
                    });
                }
            }, {
                name: "ZoneTable",
                label: "Zone Table",
                icon: "zone-table-16x16",
                handler: function () {
                }
            }, {
                name: "SplitZone",
                label: "Split Zone",
                handler: function () {
                    self.viTrack.setMode('SplitZone');
                }
            }
        ]);
        */
    }
    function zoneProperties() {
        let _currentTrack = self.viTrack;
        let zone = _currentTrack.getCurrentZone();
        DialogUtils.zonePropertiesDialog(ModalService, zone.getProperties(), function (props) {
            wiApiService.editZone(props, function () {
                zone.setProperties(props);
                // _plotZoneSet(_currentTrack);
                zone.doPlot();
                // Utils.emitEvent('zone-updated', self.viTrack);
                wiComponentService.emit('zone-updated', self.viTrack);
                Utils.refreshProjectState();
            })
        })
    }
    function _zoneOnDoubleClick() {
        zoneProperties();
        // Prevent track properties dialog from opening
        d3.event.stopPropagation();
    }
    function _plotZoneTrack(sourceViZoneTrack, viZoneTrack) {
        if (!viZoneTrack) return;
        viZoneTrack.removeAllZones();
        sourceViZoneTrack.getZones().forEach(function (sourceZone) {
            const zoneConfig = angular.copy(sourceZone);
            zoneConfig.idZoneTrack = viZoneTrack.id;
            // let wiD3 = wiComponentService.getComponent('logplot' + viZoneTrack.idPlot).getwiD3Ctrl();
            self.addZoneToTrack(viZoneTrack, zoneConfig, self.wiD3Ctrl.getComponentCtrlByViTrack(viZoneTrack));
        })
    }
    function _plotZoneSet(sourceZoneTrack) {
        let layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
        // plot this logplot
        
        let tcs = self.wiD3Ctrl.trackComponents.filter(tc => (tc.idZoneTrack && tc.idZoneTrack != sourceZoneTrack.id));
        tcs.forEach(function (tc) {
            if (tc.controller.viTrack.idZoneSet != sourceZoneTrack.idZoneSet) return;
            _plotZoneTrack(sourceZoneTrack, tc.controller.viTrack);
        })
        // plot others logplots
        let logplotModel = self.wiD3Ctrl.wiLogplotCtrl.getLogplotModel();
        let well = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED).wells.find(well => well.idWell == logplotModel.properties.idWell);
        well.plots.forEach(function (aLogplot) {
            if (aLogplot.idPlot != sourceZoneTrack.idPlot) {
                if (!layoutManager.getItemById('logplot' + aLogplot.idPlot)) return;
                wiApiService.getLogplot(aLogplot.idPlot, function (logplot) {
                    logplot.zone_tracks.forEach(function (zoneTrack) {
                        if (zoneTrack.idZoneSet != sourceZoneTrack.idZoneSet) return;
                        let viZoneTrack = wiComponentService.getComponent('vi-zone-track-' + zoneTrack.idZoneTrack);
                        if (!viZoneTrack) return;
                        _plotZoneTrack(sourceZoneTrack, viZoneTrack);
                    });
                })
            }
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
