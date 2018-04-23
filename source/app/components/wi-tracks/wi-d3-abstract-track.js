function Controller (wiApiService) {
    this.wiApiService = wiApiService;
}

Controller.prototype.getProperties = function() {
    return this.properties;
}

Controller.prototype.setOrderNum = function(orderNum) {
    this.viTrack.orderNum = orderNum;
    this.viTrack.updateOrderNum();
}

Controller.prototype.openPropertiesDialog = function() {
    console.log('openPropertiesDialog abstract method');
}

Controller.prototype.registerTrackHorizontalResizerDragCallback = function() {
    let self = this;
    this.viTrack.onHorizontalResizerDrag(function () {
        self.wiD3Ctrl.adjustHeaderHeight(self.viTrack);
        self.wiD3Ctrl.updateScale();
    });
}
Controller.prototype.drawTooltip = function(depth) {
	let self = this;
    if (self.wiD3Ctrl.referenceLine()) self.viTrack.drawTooltipLines(depth);
    if (self.wiD3Ctrl.tooltip()) self.viTrack.drawTooltipText(depth, true);
}

Controller.prototype.removeTooltip = function() {
	let self = this;
	self.viTrack.removeTooltipLines();
	self.viTrack.removeTooltipText();
}

Controller.prototype.registerTrackTooltip = function () {
    let self = this;
    if (!self.viTrack) return;

    self.viTrack.plotContainer.on('mousemove', function() {
		let y = d3.mouse(self.viTrack.plotContainer.node())[1];
		let depth = self.viTrack.getTransformY().invert(y);
		self.wiD3Ctrl.trackComponents.forEach(tc => tc.controller.drawTooltip(depth));
    });

    self.viTrack.plotContainer.on('mouseover', function() {
        self.wiD3Ctrl.trackUnderMouse = self.getProperties();
        //console.log(self.wiD3Ctrl.trackUnderMouse);
    });

    self.viTrack.plotContainer.on('mouseleave', function() {
        self.wiD3Ctrl.trackUnderMouse = null;
        let debounced = _.debounce(function() {
            if (self.wiD3Ctrl.trackUnderMouse) return;
            self.wiD3Ctrl.trackComponents.forEach(tc => tc.controller.removeTooltip());
        }, 500);
        debounced();
        //console.log(self.wiD3Ctrl.trackUnderMouse);
    });
}

Controller.prototype.onTrackKeyPressCallback = function () {
    if (!d3.event) return;
    console.log( ' on track key ' + d3.event.key + ' pressed');
}

Controller.prototype.setDepthRange = function(depthRange) {
    if (!this.viTrack) return;
    this.viTrack.minY = depthRange[0];
    this.viTrack.maxY = depthRange[1];
    this.viTrack.doPlot();
}

Controller.prototype.registerTrackCallback = function() {
    let self = this;
    let trackComponent = this.getProperties();
    let viTrack = self.viTrack;
    viTrack.on('focus', function () {
        self.wiD3Ctrl.setCurrentTrack(trackComponent);
    });
    viTrack.on('mousedown', function () {
        d3.event.stopPropagation();
        self.wiD3Ctrl.setCurrentTrack(trackComponent);
        // if (d3.event.button == 2) _trackOnRightClick(track);
    });
    viTrack.on('dblclick', function () {
        self.wiD3Ctrl.setCurrentTrack(trackComponent);
        openTrackPropertiesDialog();
    });
    viTrack.onVerticalResizerDrag(function () {
        if (trackComponent.idTrack) {
            self.wiApiService.editTrack({ 
                idTrack: trackComponent.idTrack, 
                width: Utils.pixelToInch(viTrack.width) 
            }, null, { silent: true });
        } 
        else if (trackComponent.idDepthAxis) {
            self.wiApiService.editDepthTrack({ 
                idDepthAxis: trackComponent.idDepthAxis, 
                width: Utils.pixelToInch(viTrack.width) 
            }, null, { 
                silent: true 
            });
        } 
        else if (trackComponent.idZoneTrack) {
            self.wiApiService.editZoneTrack({ 
                idZoneTrack: trackComponent.idZoneTrack, 
                width: Utils.pixelToInch(viTrack.width) 
            }, null, { 
                silent: true 
            });
        } 
        else if (trackComponent.idImageTrack) {
            self.wiApiService.editImageTrack({ 
                idImageTrack: trackComponent.idImageTrack, 
                width: Utils.pixelToInch(viTrack.width) 
            }, null, { 
                silent: true 
            });
        } else if (trackComponent.idObjectTrack) {
            self.wiApiService.editObjectTrack({ 
                idObjectTrack: trackComponent.idObjectTrack, 
                width: Utils.pixelToInch(viTrack.width) 
            }, null, { 
                silent: true
            });
        }
    });
}

Controller.prototype.$onInit = function() {
    let self = this;
    this.wiD3Ctrl.wiLogplotCtrl.on('depth-range-updated', function(depthRange) {
        self.viTrack.minY = depthRange[0];
        self.viTrack.maxY = depthRange[1];
        self.viTrack.doPlot();
    });
}

Controller.prototype.$doCheck = function() {
    if (!this.viTrack) return;
    if (this.viTrack.minY == this.minY && this.viTrack.maxY == this.maxY) return;
    this.setDepthRange([this.minY, this.maxY]);
}

module.exports = Controller;
