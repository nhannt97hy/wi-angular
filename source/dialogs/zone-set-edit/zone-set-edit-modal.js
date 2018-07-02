let helper = require('./DialogHelper');
module.exports = function (ModalService, wiComponentService, idZoneSet, wellProps, callback) {
    function ModalController($scope, $timeout, wiComponentService, wiApiService, close) {
        let self = this;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        this.selectedZoneset = {};
        // this.selectedZones = [];
        
        this.zoneSetConfig = [];
        function createZoneSetModel(zoneSet) {
            return {
                idZoneSet: zoneSet.idZoneSet,
                name: zoneSet.name,
                idWell: zoneSet.idWell,
                type: 'zoneSet',
                data: {
                    icon: 'mineral-zone-16x16',
                    label: zoneSet.name,
                    childExpanded: false,
                    selected: (zoneSet.idZoneSet == idZoneSet)
                },
                properties: zoneSet
            }
        }
        wiApiService.listZoneSet(wellProps.idWell, function (zoneSets) {
            for (zoneSet of zoneSets) {
                self.zoneSetConfig.push(createZoneSetModel(zoneSet));
            }
        })
        getZoneSets(idZoneSet);
        function getZoneSets (idZoneSet) {
            wiApiService.getZoneSet(idZoneSet, function (info) {
                if (info) {
                    self.zones = info.zones;
                }
                else {
                    console.log('no info');
                }
            })
        }
        this.clickFunction = function($index, $event, node) {
            self.lastSelectedZoneSet = node;
            setSelectedNode(node);
            self.selectedZoneset = node.properties;
            getZoneSets(node.idZoneSet);
        }
        function setSelectedNode(node) {
            self.zoneSetConfig.forEach(function (item) {
                utils.visit(item, function (n) {
                    if (n.data) n.data.selected = false;
                    if (n.name == node.name) n.data.selected = true;
                });
            });
        }
        this.refreshZoneList = function () {
            self.newZone = false;
            // self.selectedZones = [];
            // self.zoneEditted = false;
            if (self.newZoneSet) {
                self.zones = []
            } else {
                wiApiService.getZoneSet(self.lastSelectedZoneSet.idZoneSet, function (info) {
                    if (info) {
                        self.zones = info.zones;
                    }
                })
            }
        }
        this.selectZoneToggle = function (zone) {
            zone.flag = !zone.flag;
            zone.showOnTrack = !zone.showOnTrack;
            wiApiService.editZone(zone, function(res) {
                console.log("ok", res);
            });
        }
        /*this.onZoneChanged = function (zone) {
            self.zoneEditted = true;
            zone.zoneEditted = true;
        }*/
        /*this.createZone = function () {
            dialogUtils.createNewZoneDialog(ModalService, self.zones[0].zone_template.template, function (data) {
                if (data) {
                    data.idZoneSet = self.lastSelectedZoneSet.idZoneSet;
                    wiApiService.createZone(data, function (zone) {
                        self.refreshZoneList();
                    })
                }
            });
        }*/
        /*this.editZone = function () {
            for (zone of self.zones) {
                if (zone.zoneEditted) {
                    wiApiService.editZone(zone, function () {
                        console.log('edit success');
                        zone.zoneEditted = false;
                        self.zoneEditted = false;
                    });
                }
            }
        }*/
        /*this.deleteZone = function () {
            let length = self.zones.length
            for (z of self.zones) {
                if (z.flag) {
                    self.zones.splice(self.zones.indexOf(z), 1);
                    wiApiService.removeZone(z.idZone, function () {
                        self.selectedZones = [];
                    })
                }
            }
        }*/
        this.onOkButtonClicked = function () {
            close(self.selectedZoneset);
        };
        this.onCancelButtonClicked = function () {
            close(null, 100);
        };

        
    }
    ModalService.showModal({
        templateUrl: "zone-set-edit-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (data) {
            helper.removeBackdrop();
            if (data) callback(data);
        });
    });
}
