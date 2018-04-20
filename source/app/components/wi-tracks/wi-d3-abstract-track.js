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

module.exports = Controller;
