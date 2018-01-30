let initModal;
function trackBulkUpdateDialog (ModalService, allTracks) {
    function ModalController(wiComponentService, wiApiService, close) {
        let self = this;
        window.tBulk = this;

        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let wiExplorer = wiComponentService.getComponent(wiComponentService.WI_EXPLORER);

        this.tracks = [];
        this.sumWidth = 0;

        allTracks.forEach(function(t) {
            self.tracks.push(getTrackProps(t));
        });

        this.tracks.forEach(function(track) {
            self.colorTrack = function (track) {
                dialogUtils.colorPickerDialog(ModalService, track.color, function (colorStr) {
                    track.color = colorStr;
                });
            };
            self.sumWidth += track.width;
        });
        this.getSum = function () {
            self.sumWidth = 0;
            this.tracks.forEach(function(track) {
                self.sumWidth += track.width;
            });
        };

        console.log("tracks", this.tracks);
        function getLogTrack (track) {
            return (allTracks.filter(t => t.id == track.idTrack))[0];
        };
        function getDepthTrack (track) {
            return (allTracks.filter(t => t.id == track.idDepthAxis))[0];
        };
        function getZoneTrack (track) {
            return (allTracks.filter(t => t.id == track.idZoneTrack))[0];
        };
        function getImageTrack (track) {
            return (allTracks.filter(t => t.id == track.idImageTrack))[0];
        };
        function getObjectTrack (track) {
            return (allTracks.filter(t => t.id == track.idObjectTrack))[0];
        };
        // console.log("allTracks", allTracks);
        function getTrackProps (track) {
            let props =  {
                check : true
            }
            props = track.getProperties();
            props.width = utils.pixelToInch(track.width);
            switch (track.type) {
                case 'log-track':
                    props.type = "Log Track";
                    break;
                case 'depth-track':
                    props.type = "Depth Track";
                    break;
                case 'zone-track':
                    props.type = "Zone Track";
                    break;
                case 'image-track':
                    props.type = "Image Track";
                    break;
                case 'object-track':
                    props.type = "Object Track";
                    break;
                default:
                    break;
            }
            return props;
        }
        function callAPI (cb) {
            async.eachOfSeries(self.tracks, function(track, idx, callback){
                console.log("API", track);
                switch(track.type) {
                    case 'Log Track':
                        if( track.check ) {
                            wiApiService.editTrack(track, function(res) {
                                let l = angular.copy(track);
                                l.width = utils.inchToPixel(l.width);
                                let logTrack = getLogTrack(l);
                                console.log("log", res, l, logTrack);
                                logTrack.setProperties(l);

                                logTrack.doPlot(true);
                                if (callback) callback();
                            })
                        } else {
                            if (callback) callback();

                        }
                        break;
                    case 'Depth Track':
                        if( track.check ) {
                            track.trackBackground = track.color;
                            wiApiService.editDepthTrack(track, function(res) {
                                console.log("depth", res);
                                let d = angular.copy(track);
                                d.width = utils.inchToPixel(d.width);
                                let depthTrack = getDepthTrack(d);
                                depthTrack.setProperties(d);

                                depthTrack.doPlot(true);
                                if (callback) callback();
                            })
                        } else {
                            if (callback) callback();

                        }
                        break;
                    case 'Zone Track':
                        if( track.check ) {
                            wiApiService.editZoneTrack(track, function(res) {
                                console.log("zone", res);
                                let z = angular.copy(track);
                                z.width = utils.inchToPixel(z.width);
                                let zoneTrack = getZoneTrack(z);
                                zoneTrack.setProperties(z);

                                zoneTrack.doPlot(true);
                                if (callback) callback();
                            })
                        } else {
                            if (callback) callback();

                        }
                        break;
                    case 'Image Track':
                        if( track.check ) {
                            wiApiService.editImageTrack(track, function(res) {
                                console.log("image", res);
                                let i = angular.copy(track);
                                i.width = utils.inchToPixel(i.width);
                                let imageTrack = getImageTrack(i);
                                imageTrack.setProperties(i);

                                imageTrack.doPlot(true);
                                if (callback) callback();
                            })
                        } else {
                            if (callback) callback();

                        }
                        break;
                    case 'Object Track':
                        if( track.check ) {
                            wiApiService.editObjectTrack(track, function(res) {
                                let i = angular.copy(track);
                                i.width = utils.inchToPixel(i.width);
                                let objectTrack = getObjectTrack(i);
                                objectTrack.setProperties(i);

                                objectTrack.doPlot(true);
                                if (callback) callback();
                            })
                        } else {
                            if (callback) callback();
                        }
                        break;
                    default:
                        if (callback) callback();
                        break;
                }
            }, function(err) {
                if (err) {
                    setTimeout(() => {
                        DialogUtils.errorMessageDialog(ModalService, err);
                    });
                }
                if(cb) cb();
            });
        }
        this.onApplyButtonClicked = function(){
            callAPI(function(){});
        };
        this.onOkButtonClicked = function(){
            callAPI(function(){
                close();
            });

        };
        this.onCancelButtonClicked = function(){
            close(null);
        }
    }
    ModalService.showModal({
        templateUrl: "track-bulk-update-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        initModal(modal);
        // modal.element.modal();
        // $(modal.element[0].children[0]).draggable();
        modal.close.then(function () {
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');
        });
    });
}

exports.setInitFunc = function(initFunction) {
    initModal = initFunction;
}
exports.trackBulkUpdateDialog = trackBulkUpdateDialog;