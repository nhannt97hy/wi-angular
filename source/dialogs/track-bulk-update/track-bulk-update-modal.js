let helper = require('./DialogHelper');
module.exports = function (ModalService, allTracks, idLogplot) {
    function ModalController(wiComponentService, wiApiService, close) {
        let self = this;
        window.tBulk = this;

        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let wiExplorer = wiComponentService.getComponent(wiComponentService.WI_EXPLORER);

        this.tracks = [];
        this.sumWidth = 0;
        let logplotElem = $('wi-logplot#' + idLogplot + '>.logplot-main-content');
        this.widthOfLogplot = utils.pixelToInch(logplotElem.width()).toFixed(4);

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
            self.sumWidth = self.sumWidth.toFixed(4);
        };
        this.sumWidth = this.sumWidth.toFixed(4);

        console.log("tracks", this.tracks, allTracks);
        function getLogTrack (track) {
            return (allTracks.find(t => t.id == track.idTrack && t.type == 'log-track'));
        };
        function getDepthTrack (track) {
            return (allTracks.find(t => t.id == track.idDepthAxis && t.type == 'depth-track'));
        };
        function getZoneTrack (track) {
            return (allTracks.find(t => t.id == track.idZoneTrack && t.type == 'zone-track'));
        };
        function getImageTrack (track) {
            return (allTracks.find(t => t.id == track.idImageTrack && t.type == 'image-track'));
        };
        function getObjectTrack (track) {
            return (allTracks.find(t => t.id == track.idObjectTrack && t.type == 'object-track'));
        };
        // console.log("allTracks", allTracks);
        function getTrackProps (track) {
            let props = track.getProperties();
            props.check = true;
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
                    props.color = props.background;
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
            let tracks = self.tracks.filter(track => track.check == true);
            async.eachOfSeries(tracks, function(track, idx, callback){
                switch(track.type) {
                    case 'Log Track':
                        wiApiService.editTrack(track, function(res) {
                            let l = angular.copy(track);
                            l.width = utils.inchToPixel(l.width);
                            let logTrack = getLogTrack(l);
                            console.log("log", res, l, logTrack);
                            logTrack.setProperties(l);

                            logTrack.doPlot(false);
                            async.setImmediate(callback);
                        });
                        break;
                    case 'Depth Track':
                        track.trackBackground = track.color;
                        wiApiService.editDepthTrack(track, function(res) {
                            console.log("depth", res);
                            let d = angular.copy(track);
                            d.width = utils.inchToPixel(d.width);
                            let depthTrack = getDepthTrack(d);
                            depthTrack.setProperties(d);

                            depthTrack.doPlot(false);
                            async.setImmediate(callback);
                        });
                        break;
                    case 'Zone Track':
                        wiApiService.editZoneTrack(track, function(res) {
                            console.log("zone", res);
                            let z = angular.copy(track);
                            z.width = utils.inchToPixel(z.width);
                            let zoneTrack = getZoneTrack(z);
                            zoneTrack.setProperties(z);

                            zoneTrack.doPlot(false);
                            async.setImmediate(callback);
                        });
                        break;
                    case 'Image Track':
                        track.background = track.color;
                        wiApiService.editImageTrack(track, function(res) {
                            let i = angular.copy(track);
                            console.log("image", res, i);
                            i.width = utils.inchToPixel(i.width);
                            let imageTrack = getImageTrack(i);
                            imageTrack.setProperties(i);

                            imageTrack.doPlot(false);
                            async.setImmediate(callback);
                        });
                        break;
                    case 'Object Track':
                        wiApiService.editObjectTrack(track, function(res) {
                            let o = angular.copy(track);
                            o.width = utils.inchToPixel(o.width);
                            let objectTrack = getObjectTrack(o);
                            objectTrack.setProperties(o);

                            objectTrack.doPlot(false);
                            async.setImmediate(callback);
                        });
                        break;
                    default:
                        async.setImmediate(callback);
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
        helper.initModal(modal);
        modal.close.then(function () {
            helper.removeBackdrop();
        });
    });
}
