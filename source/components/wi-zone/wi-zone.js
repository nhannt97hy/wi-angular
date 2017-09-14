const wiZoneName = 'wiZone';
const moduleName = 'wi-zone';

function ZoneController(wiComponentService){
    let self = this;

    this.zoneArr = [];
    this.fullZoneArr = [];

    this.$onInit = function(){
        if (self.name) wiComponentService.putComponent(self.name, self);

        self.zones.forEach(function(element, i) {
            self.fullZoneArr.push(element.idZone);
            if(element.idZone == self.activeZone || self.activeZone == "All"){
                self.zoneArr.push(element.idZone);
            }
        });
    }

    this.AllZoneButtonClick = function(){
        if(self.allZoneHandler){
            self.allZoneHandler();
        }
        self.zoneArr = angular.copy(self.fullZoneArr);
    }

    this.ActiveZoneButtonClick = function(){
        if(self.activeZoneHandler){
            self.activeZoneHandler();
        }
        self.zoneArr.length = 0;
        self.zoneArr.push(self.activeZone);
    }

    this.SelectZoneButtonClick = function(i, idZone){
        var index = self.zoneArr.indexOf(idZone);
        if(index == -1){
            self.zoneArr.push(idZone);
        }else{
            self.zoneArr.splice(index, 1);
        }

        if(self.zones[i].handler) self.zones[i].handler();
    }

    this.isInActive = function(id){
        return self.zoneArr.indexOf(id) == -1;
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