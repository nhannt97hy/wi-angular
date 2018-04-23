function Controller () { }

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
	if(!depth) {
		y = d3.mouse(self.viTrack.plotContainer.node())[1];
		depth = self.viTrack.getTransformY().invert(y);
		self.showDepth = true;
		self.wiD3Ctrl.trackComponents.forEach(tc => tc.controller.drawTooltip(depth));
	} else {
		if (self.wiD3Ctrl.referenceLine()) self.viTrack.drawTooltipLines(depth);
		if (self.wiD3Ctrl.tooltip()) self.viTrack.drawTooltipText(depth, self.showDepth);
		self.showDepth = false;
	}
}

Controller.prototype.removeTooltip = function() {
	let self = this;
	self.viTrack.removeTooltipLines();
	self.viTrack.removeTooltipText();
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
