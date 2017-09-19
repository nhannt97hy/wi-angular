const wiZoneName = 'wiZone';
const moduleName = 'wi-zone';

function ZoneController(wiComponentService, $timeout){
    let self = this;

    this.zoneArr = [];

    this.$onInit = function(){
        if (self.name) wiComponentService.putComponent(self.name, self);
        self.zoneUpdate();
    }

    this.AllZoneButtonClick = function(){
        if(self.allZoneHandler){
            self.allZoneHandler();
        }
        for (let idx in self.zoneArr) {
            self.zoneArr[idx] = false;
        }
    }

    this.ActiveZoneButtonClick = function(){
        if(self.activeZoneHandler){
            self.activeZoneHandler();
        }
        for (let idx in self.zoneArr) {
            if (self.activeZone == "All") {
                self.zoneArr[idx] = false;
            }
            else {
                self.zoneArr[idx] = (self.activeZone == "" + self.zones[idx].id)?false:true;
            }
        }
    }

    this.SelectZoneButtonClick = function(i){
        self.zoneArr[i] = !self.zoneArr[i];
        if(self.zones[i].handler) self.zones[i].handler();
    }

    this.zoneUpdate = function() {
        self.zoneArr.length = 0;
        if(self.zones){
            self.zones.forEach(function(element, i) {
                self.zoneArr.push(!(element.properties.idZone == self.activeZone || self.activeZone == "All"));
            });
        }
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
        allZoneHandler: '<',
        activeZoneHandler: '<'
    }
});

exports.name = moduleName;