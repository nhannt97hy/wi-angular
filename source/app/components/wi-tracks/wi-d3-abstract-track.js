function Controller (wiApiService, wiComponentService) {
    this.wiApiService = wiApiService;
    this.wiComponentService = wiComponentService;
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
        self.wiD3Ctrl && self.wiD3Ctrl.adjustHeaderHeight(self.viTrack);
        self.wiD3Ctrl && self.wiD3Ctrl.updateScale();
    });
}
Controller.prototype.drawTooltip = function(depth) {
	let self = this;
    if (!self.wiD3Ctrl) {
        self.viTrack.drawTooltipLines(depth);
        self.viTrack.drawTooltipText(depth, true);
        return;
    }
    if (self.wiD3Ctrl.referenceLine()) self.viTrack.drawTooltipLines(depth);
    if (self.wiD3Ctrl.tooltip()) self.viTrack.drawTooltipText(depth, true);
}

Controller.prototype.removeTooltip = function() {
	let self = this;
	self.viTrack.removeTooltipLines();
	self.viTrack.removeTooltipText();
}

Controller.prototype.mouseOverHandler = function() {
    if (!this.wiD3Ctrl) return;
    this.wiD3Ctrl.trackUnderMouse = this.getProperties();
}

Controller.prototype.mouseLeaveHandler = function() {
    let self = this;
    if(!self.wiD3Ctrl) {
        self.removeTooltip();
        return;
    }
    this.wiD3Ctrl.trackUnderMouse = null;
    let debounced = _.debounce(function() {
        if (self.wiD3Ctrl.trackUnderMouse) return;
        self.wiD3Ctrl.trackComponents.forEach(tc => tc.controller.removeTooltip());
    }, 500);
    debounced();
    //console.log(self.wiD3Ctrl.trackUnderMouse);
}

Controller.prototype.registerTrackMouseEventHandlers = function () {
    let self = this;
    if (!self.viTrack) return;
    // for Tooltips
    self.viTrack.plotContainer.on('mousemove', handleMouseMove);
    function handleMouseMove() {
        let mouse = d3.mouse(self.viTrack.plotContainer.node());
        if(!mouse || !Array.isArray(mouse)) return;
        let y = mouse[1];
		let depth = self.viTrack.getTransformY().invert(y);
        if (!self.wiD3Ctrl) self.drawTooltip(depth);
		else self.wiD3Ctrl.trackComponents.forEach(tc => tc.controller.drawTooltip(depth));
    }
    
    self.viTrack.trackContainer.on('mouseover', function() {
        self.mouseOverHandler.call(self);
    });

    self.viTrack.plotContainer.on('mouseleave', function() {
        if(self.wiD3Ctrl) {
            self.wiD3Ctrl.trackComponents.forEach(tc => tc.controller.removeTooltip());    
        } else {
            self.removeTooltip();
        }
    })
    self.viTrack.trackContainer.on('mouseleave', function() {
        self.mouseLeaveHandler.call(self);
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
    let Utils = self.wiComponentService.getComponent(self.wiComponentService.UTILS);

    d3.select(viTrack.root.node().parentNode)
        .attr('class', 'wi-d3-track-component')

    if (!viTrack.isCorrelationTrack()) {
        viTrack.on('focus', function () {
            self.wiD3Ctrl && self.wiD3Ctrl.setCurrentTrack(trackComponent);
        });
        viTrack.on('mousedown', function () {
            d3.event.stopPropagation();
            self.wiD3Ctrl && self.wiD3Ctrl.setCurrentTrack(trackComponent);
            // if (d3.event.button == 2) _trackOnRightClick(track);
        });
        viTrack.on('dblclick', function () {
            self.wiD3Ctrl && self.wiD3Ctrl.setCurrentTrack(trackComponent);
            self.wiD3Ctrl && self.openPropertiesDialog();
        });
    }
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
    if(!self.wiD3Ctrl) {
        viTrack.on('mousewheel', function() {
            let mouse = d3.mouse(viTrack.plotContainer.node());
            if (mouse[1] < 0) return;

            if (d3.event.ctrlKey) {
                self.zoom();
                d3.event.preventDefault();
                d3.event.stopPropagation();
            }
            else
                self.scroll();
        })
    }
}

Controller.prototype.zoom = function() {
    let self = this;
    let sign = d3.event.deltaY<0 ? 1:-1;
    let transformY = self.viTrack.getTransformY();
    let mouseDepth = transformY.invert(d3.event.offsetY);

    // calculate new factor 
    let minFactor = (mouseDepth - this.minY) / 10;
    let maxFactor = (this.maxY - mouseDepth) / 10;
    if(minFactor < 0 ) minFactor = 0; 
    if(maxFactor < 0 ) maxFactor = 0; 

    // assign new depth
    if(sign == 1) {
        this.minY += minFactor;
        this.maxY -= maxFactor;
    } else if (sign == -1) {
        this.minY -= minFactor;
        this.maxY += maxFactor;
    }
    if(self.getWellProps) {
        let wellProps = self.getWellProps();
        if(wellProps) {
            if(self.minY <= Number(wellProps.topDepth)) self.minY = Number(wellProps.topDepth);
            if(self.maxY >= Number(wellProps.bottomDepth)) self.maxY = Number(wellProps.bottomDepth);
        }
    }
    this.setDepthRange([this.minY, this.maxY]);
    // this.viTrack.getZones().forEach(zone => zone.lower());
}

Controller.prototype.scroll = function() {
    let sign = d3.event.deltaY<0 ? 1:-1;
    const _SPEED = (this.maxY - this.minY) / 10;
    if(this.getWellProps) {
        let wellProps = this.getWellProps();
        if(wellProps && (this.minY - _SPEED <= wellProps.topDepth && sign == -1) || (this.maxY + _SPEED >= wellProps.bottomDepth && sign == 1))
            return;
    }
    if(sign == 1) {
        this.minY += _SPEED;
        this.maxY += _SPEED;
    } else if (sign == -1) {
        this.minY -= _SPEED;
        this.maxY -= _SPEED;
    }
    this.setDepthRange([this.minY, this.maxY]);
    // this.viTrack.getZones().forEach(zone => zone.lower());
}

Controller.prototype.getContextMenu = function () {
    // return wi-d3 ctrl context menu by default
    return self.wiD3Ctrl ? self.wiD3Ctrl.getContextMenu() : []
}

Controller.prototype.showContextMenu = function (event) {
    console.log('showing track context menu')
    let self = this;
    let contextMenu = self.getContextMenu();
    if (event.button != 2) return;
    event.stopPropagation();
    self.wiComponentService.getComponent('ContextMenu')
        .open(event.clientX, event.clientY, contextMenu, function() {});
}

Controller.prototype.getWellProps = function() {
    if(this.viTrack) return this.viTrack.getWellProps();
    return null;
}

Controller.prototype.$onInit = function() {
    let self = this;
    this.wiD3Ctrl && this.wiD3Ctrl.wiLogplotCtrl.on('depth-range-updated', function(depthRange) {
        if(self.viTrack) {
            self.viTrack.minY = depthRange[0];
            self.viTrack.maxY = depthRange[1];
            self.viTrack.doPlot();
        }
    });
}

Controller.prototype.$doCheck = function() {
    if (!this.viTrack) return;
    if (this.viTrack.minY == this.minY && this.viTrack.maxY == this.maxY) return;
    this.setDepthRange([this.minY, this.maxY]);
}

module.exports = Controller;
