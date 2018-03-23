let helper = require('./DialogHelper');
module.exports = function (ModalService, wiLogplotCtrl) {
    function ModalController(wiComponentService, wiApiService, close) {
        let self = this;
        window.auto = this;

        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let wiExplorer = wiComponentService.getComponent(wiComponentService.WI_EXPLORER);

        let wiD3Ctrl = wiLogplotCtrl.getwiD3Ctrl();

        let logTracks = wiD3Ctrl.getTracks().filter(track => track.type == 'log-track');
        let depthTracks = wiD3Ctrl.getTracks().filter(track => track.type == 'depth-track');
        let imageTracks = wiD3Ctrl.getTracks().filter(track => track.type == 'image-track');
        let zoneTracks = wiD3Ctrl.getTracks().filter(track => track.type == 'zone-track');
        let objectTracks = wiD3Ctrl.getTracks().filter(track => track.type == 'object-track');

        this.unit = "inch";
        if (Array.isArray(logTracks) && logTracks.length) {
            this.width = utils.pixelToInch(logTracks[0].width);
            this.log = true;
        } else if (Array.isArray(depthTracks) && depthTracks.length) {
            this.width = utils.pixelToInch(depthTracks[0].width);
            this.depth = true;
        } else if (Array.isArray(zoneTracks) && zoneTracks.length) {
            this.width = utils.pixelToInch(zoneTracks[0].width);
            this.zone = true;
        } else if (Array.isArray(imageTracks) && imageTracks.length) {
            this.width = utils.pixelToInch(imageTracks[0].width);
            this.image = true;
        } else if (Array.isArray(objectTracks) && objectTracks.length) {
            this.width = utils.pixelToInch(objectTracks[0].width);
            this.object = true;
        } else {
            this.width = 0;
        }
        function update() {
            if(self.depth && Array.isArray(depthTracks) && depthTracks.length) {
                depthTracks.forEach(function(d){
                    let request = {
                        idDepthAxis : d.id,
                        width: self.width
                    }
                    wiApiService.editDepthTrack(request, function(res){
                        d.width = utils.inchToPixel(self.width);
                        d.doPlot();
                    });
                })
            };
            if(self.log && Array.isArray(logTracks) && logTracks.length) {
                logTracks.forEach(function(l){
                    let request = {
                        idTrack : l.id,
                        width: self.width
                    }
                    wiApiService.editTrack(request, function(res){
                        l.width = utils.inchToPixel(self.width);
                        l.doPlot();
                    });
                })
            };
            if(self.image && Array.isArray(imageTracks) && imageTracks.length) {
                imageTracks.forEach(function(i){
                    let request = {
                        idImageTrack : i.id,
                        width: self.width
                    }
                    wiApiService.editImageTrack(request, function(res){
                        i.width = utils.inchToPixel(self.width);
                        i.doPlot();
                    });
                })
            };
            if(self.zone && Array.isArray(zoneTracks) && zoneTracks.length) {
                zoneTracks.forEach(function(z){
                    let request = {
                        idZoneTrack : z.id,
                        width: self.width
                    }
                    wiApiService.editZoneTrack(request, function(res){
                        z.width = utils.inchToPixel(self.width);
                        z.doPlot();
                    });
                })
            }
            if(self.object && Array.isArray(objectTracks) && objectTracks.length) {
                objectTracks.forEach(function(o){
                    let request = {
                        idObjectTrack : o.id,
                        width: self.width
                    }
                    wiApiService.editObjectTrack(request, function(res){
                        o.width = utils.inchToPixel(self.width);
                        o.doPlot();
                    });
                })
            }
        }
        this.onApplyButtonClicked = function(){
            update();
        };
        this.onOkButtonClicked = function(){
            update();
            close(self);
        };
        this.onCancelButtonClicked = function(){
            close(null);
        }
    }
    ModalService.showModal({
        templateUrl: "auto-size-track-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function () {
            helper.removeBackdrop();
        });
    });
}
