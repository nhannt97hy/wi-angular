let helper = require('./DialogHelper');

module.exports = function (ModalService, wiD3Ctrl, zoneTrackProperties) {
    function ModalController($scope, wiComponentService, wiApiService, close, $timeout) {
        let self = this;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let wiLogplotModel = wiD3Ctrl.wiLogplotCtrl.getLogplotModel();
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let viZoneTrack, wiD3ZoneTrack;
        let props = zoneTrackProperties || {
            showTitle: true,
            title: "New Zone",
            topJustification: "center",
            color: '#ffffff',
            width: 1,
            parameterSet: null
        }
        console.log(props);
        if (props.idZoneTrack) {
            wiD3ZoneTrack = wiD3Ctrl.getComponentCtrlByProperties(props);
            viZoneTrack = wiD3ZoneTrack.viTrack
        }
        this.showTitle = props.showTitle;
        this.title = props.title;
        this.topJustification = props.topJustification.toLowerCase();
        this.color = props.color;
        this.width = props.width;
        this.parameterSet = props.parameterSet;
        this.zoneSets = [];
        this.zoomFactor = props.zoomFactor;

        function refreshZoneSets() {
            wiApiService.listZoneSet(wiLogplotModel.properties.idWell, function (zoneSets) {
                $timeout(function(){
                    $scope.$apply(function () {
                        self.zoneSets = zoneSets;
                    });
                });
            });
        }
        refreshZoneSets();
        this.idZoneSet = props.idZoneSet;
        // Dialog buttons
        this.createZoneSet = function () {
            utils.createZoneSet(wiLogplotModel.properties.idWell, function (zoneSetReturn) {
                refreshZoneSets();
                self.idZoneSet = zoneSetReturn.idZoneSet;
            });
        }
        this.trackBackground = function () {
            DialogUtils.colorPickerDialog(ModalService, self.color, function (colorStr) {
                self.color = colorStr;
            });
        }
        function doApply(cb) {
            if (!self.idZoneSet) return toastr.error("Zone Set is required");
            const zoneSetChanged = self.idZoneSet !== props.idZoneSet;
            Object.assign(props, {
                showTitle: self.showTitle,
                title: self.title,
                topJustification: self.topJustification,
                color: self.color,
                width: self.width,
                zoomFactor: self.zoomFactor,
                parameterSet: self.parameterSet,
                idZoneSet: self.idZoneSet,
            })
            if (props.idZoneTrack) {
                wiApiService.editZoneTrack(props, function () {
                    const viZoneTrackProps = Object.assign({}, props, {
                        width: utils.inchToPixel(props.width)
                    })
                    viZoneTrack.setProperties(viZoneTrackProps);
                    if (zoneSetChanged) {
                        wiApiService.getZoneSet(viZoneTrack.idZoneSet, function (zoneset) {
                            viZoneTrack.removeAllZones();
                            for (let zone of zoneset.zones) {
                                wiD3ZoneTrack.addZoneToTrack(viZoneTrack, zone);
                            }
                        })
                    }
                    viZoneTrack.doPlot(true);
                });
            } else {
                wiApiService.createZoneTrack(props, function (res, err) {
                    if (err) return;
                    props.idZoneTrack = res.idZoneTrack;
                    wiD3Ctrl.pushZoneTrack(props);
                    setTimeout(() => {
                        viZoneTrack = wiD3Ctrl.getComponentCtrlByProperties(props).viTrack;
                    });
                })
            }
            cb && cb();
        }
        this.onApplyButtonClicked = function () {
            doApply();
        }
        this.onOkButtonClicked = function () {
            doApply(function() {
                close(null, 100);
            });
        };
        this.onCancelButtonClicked = function () {
            close(null, 100);
        };
    }
    ModalService.showModal({
        templateUrl: "zone-track-properties-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function () {
            helper.removeBackdrop();
        });
    });
}
