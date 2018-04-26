let helper = require('./DialogHelper');

// module.exports = function (ModalService, wiD3Ctrl, zoneTrackProperties, callback) {
module.exports = function (ModalService, trackComponent, callback) {
    function ModalController($scope, wiComponentService, wiApiService, close, $timeout) {
        let self = this;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let viZoneTrack = trackComponent.controller ? trackComponent.controller.viTrack : null;
        let well = utils.findWellByLogplot(trackComponent.idPlot);
        // let props = zoneTrackProperties || {
        //     showTitle: true,
        //     title: "New Zone",
        //     topJustification: "center",
        //     color: '#ffffff',
        //     width: 1,
        //     parameterSet: null
        // }
        let props = viZoneTrack ? viZoneTrack.getProperties() : trackComponent;
        props.width = viZoneTrack ? utils.pixelToInch(props.width) : props.width;
        console.log(props);
        // if (props.idZoneTrack) viZoneTrack = wiD3Ctrl.getComponentCtrlByProperties(props).viTrack;
        this.showTitle = props.showTitle;
        this.title = props.title;
        this.topJustification = props.topJustification.toLowerCase();
        this.color = props.color;
        this.width = props.width;
        this.parameterSet = props.parameterSet;
        this.zoneSets = [];
        this.zoomFactor = props.zoomFactor;

        function refreshZoneSets() {
			wiApiService.listZoneSet(well.properties.idWell, function (zoneSets) {
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
           utils.createZoneSet(well.properties.idWell, function (zoneSetReturn) {
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
            if (viZoneTrack) {
                const request = {
                    idPlot: props.idPlot,
                    idZoneTrack: props.idZoneTrack,
                    showTitle: props.showTitle,
                    title: props.title,
                    topJustification: props.topJustification,
                    color: props.color,
                    width: props.width,
                    zoomFactor: props.zoomFactor,
                    parameterSet: props.parameterSet,
                    idZoneSet: props.idZoneSet,
                }
                wiApiService.editZoneTrack(request, function () {
                    const viZoneTrackProps = Object.assign({}, props, {
                        width: utils.inchToPixel(props.width)
                    })
                    viZoneTrack.setProperties(viZoneTrackProps);
                    if (zoneSetChanged) {
                        wiApiService.getZoneSet(viZoneTrack.idZoneSet, function (zoneset) {
                            viZoneTrack.removeAllZones();
                            for (let zone of zoneset.zones) {
                                trackComponent.controller.addZoneToTrack(viZoneTrack, zone);
                            }
                        })
                    }
                    viZoneTrack.doPlot(true);
                });
            } else {
                wiApiService.createZoneTrack(props, function (res, err) {
                    if (err) return;
                    props.idZoneTrack = res.idZoneTrack;
					callback && callback(props);
                    setTimeout(() => {
                        // viZoneTrack = wiD3Ctrl.getComponentCtrlByProperties(props).viTrack;
                        viZoneTrack = trackComponent.controller.viTrack;
                    }, 100);
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
