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

module.exports = Controller;
