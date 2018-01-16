const wiZoneName = 'wiZone';
const moduleName = 'wi-zone';

function ZoneController(wiComponentService, $timeout){
    let self = this;

    this.handlers = new Object();
    
    this.zoneArr = [];

    this.$onInit = function(){
        if (self.name) wiComponentService.putComponent(self.name, self);
        if (self.onZoneCtrlReady) self.onZoneCtrlReady(self);
        self.zoneUpdate();
    }

    this.AllZoneButtonClick = function(){
        for (let idx in self.zoneArr) {
            self.zoneArr[idx] = false;
        }
        self.signal('zone-data', 'All');
    }

    this.ActiveZoneButtonClick = function(){
        for (let idx in self.zoneArr) {
            if (self.activeZone == "All") {
                self.zoneArr[idx] = false;
            }
            else {
                self.zoneArr[idx] = (self.activeZone == "" + self.zones[idx].id)?false:true;
            }
        }
        self.signal('zone-data', 'Active');
    }

    this.SelectZoneButtonClick = function(i){
        self.zoneArr[i] = !self.zoneArr[i];
        if(self.zones[i].handler) self.zones[i].handler();
        self.signal('zone-data', i);
    }

    this.zoneUpdate = function() {
        self.zoneArr.length = 0;
        if(self.zones){
            self.zones.forEach(function(element, i) {
                self.zoneArr.push(!(element.properties.idZone == self.activeZone || self.activeZone == "All"));
            });
        }
        self.signal('zone-data', 'external');
    }

    this.getActiveZones = function() {
        if (!self.zones) return null;
        return self.zones.filter(function(zone, i) {
            return !self.zoneArr[i];
        });
    }

	this.$onDestroy = function () {
		wiComponentService.dropComponent(self.name);
	}
}

ZoneController.prototype.trap = function(eventName, handlerCb) {
    let eventHandlers = this.handlers[eventName];
    if (!Array.isArray(eventHandlers)) {
        this.handlers[eventName] = [];
    }

    this.handlers[eventName].push(handlerCb);

    return this;
}

ZoneController.prototype.signal = function (eventName, data) {
    let eventHandlers = this.handlers[eventName];
    if (Array.isArray(eventHandlers)) {
        eventHandlers.forEach(function (handler) {
            handler(data);
        });
    }
}

let app = angular.module(moduleName, []);

app.component(wiZoneName, {
    templateUrl: "wi-zone.html",
    controller: ZoneController,
    controllerAs: wiZoneName,
    bindings: {
        name: '@',
        zones: '<',
        activeZone: '<',
        onZoneCtrlReady: '<'
    }
});

exports.name = moduleName;
