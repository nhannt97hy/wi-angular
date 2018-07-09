let helper = require('./DialogHelper');
module.exports = function (ModalService, wiComponentService, idMarkerSet, wellProps, callback) {
    function ModalController($scope, $timeout, wiComponentService, wiApiService, close) {
        let self = this;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        this.selectedMarkerset = {};
        
        this.markerSetConfig = [];
        function createMarkerSetModel(markerSet) {
            return {
                idMarkerSet: markerSet.idMarkerSet,
                name: markerSet.name,
                idWell: markerSet.idWell,
                type: 'markerSet',
                data: {
                    icon: 'well-marker-add-16x16',
                    label: markerSet.name,
                    childExpanded: false,
                    selected: (markerSet.idMarkerSet == idMarkerSet)
                },
                properties: markerSet
            }
        }
        wiApiService.listMarkerSet(wellProps.idWell, function (markerSets) {
            for (markerSet of markerSets) {
                self.markerSetConfig.push(createMarkerSetModel(markerSet));
            }
        })
        if(idMarkerSet) {
            getMarkerSets(idMarkerSet);
        }
        function getMarkerSets (idMarkerSet) {
            wiApiService.getMarkerSet(idMarkerSet, function (info) {
                if (info) {
                    self.markers = info.markers;
                }
                else {
                    console.log('no info');
                }
            })
        }
        this.clickFunction = function($index, $event, node) {
            self.lastSelectedMarkerSet = node;
            setSelectedNode(node);
            self.selectedMarkerset = node.properties;
            getMarkerSets(node.idMarkerSet);
        }
        function setSelectedNode(node) {
            self.markerSetConfig.forEach(function (item) {
                utils.visit(item, function (n) {
                    if (n.data) n.data.selected = false;
                    if (n.name == node.name) n.data.selected = true;
                });
            });
        }
        this.refreshMarkerList = function () {
            self.newMarker = false;
            if (self.newMarkerSet) {
                self.markers = []
            } else {
                wiApiService.getMarkerSet(self.lastSelectedMarkerSet.idMarkerSet, function (info) {
                    if (info) {
                        self.markers = info.markers;
                    }
                })
            }
        }
        this.selectMarkerToggle = function (marker) {
            self.markers.forEach(z => z.flag = false);
            marker.flag = true;
            marker.showOnTrack = !marker.showOnTrack;
            wiApiService.editMarker(marker, function(res) {
                console.log("ok", res);
            });
        }
        this.onOkButtonClicked = function () {
            close(self.selectedMarkerset);
        };
        this.onCancelButtonClicked = function () {
            close(null, 100);
        };

        
    }
    ModalService.showModal({
        templateUrl: "marker-set-edit-modal.html",
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
