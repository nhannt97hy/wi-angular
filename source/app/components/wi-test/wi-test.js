const componentName = 'wiTest';
const moduleName = 'wi-test';
function WiTestController(wiApiService){
    let self = this;
    this.families = [];
    this.curves_dt = [];
    this.curves_tg = [];
    wiApiService.listFamily(function(list){
        console.log('list family: ', list);
        self.families = list;
    })
    for(let i = 1; i<10; i++)
    wiApiService.getWell(i, function(infWell){
        console.log('well info: ', infWell);
    })
    this.dt = [];
    this.data = function(){
        var datas = $('#family li input:checked');
        self.dt = [];
        if(datas.length > 0)
        datas.each(function() {
            self.dt.push(JSON.parse(this.value));
        });
        // if(self.dt.length > 0)
        //     console.log(self.dt);
        // self.curves_dt = self.dt;
    }
    this.tg = [];
    this.curves_tg = [];
    this.target = function(){
        var datas = $('#family li input:checked');
        self.tg = [];
        if(datas.length > 0)
        datas.each(function() {
            self.tg.push(JSON.parse(this.value));
        });
        // if(self.tg.length > 0)
        //     console.log(self.tg);
        // self.curves_tg = self.tg;
    }
    this.wells = [];
    wiApiService.listWells({ 
        idProject: 1
    }, function(wells) {
        if(wells.length > 0){
            self.wells = wells;
            // console.log(self.wells);
            
        }
    });
    this.dtW = [];
    this.dataW = function(){
        // console.log('self.dt: ', self.dt);
        var datas = $('#well li input:checked');
        self.dtW = [];
        datas.each(function() {
            self.dtW.push(JSON.parse(this.value));
        });
        console.log('dtW: ', self.dtW);
        for(let i =0;i<self.dt.length;i++)
            self.curves_dt[i]=[];
        self.dtW.forEach(function(well) {
            // self.dt.forEach(function(d){
                // console.log('abc:', self.dt);
                wiApiService.getWell(well.idWell, function(info){
                    info.datasets[0].curves.forEach(function(curve){
                        self.dt.forEach(function(family,i){
                            // family = JSON.parse(family);
                            // console.log(family);
                            // console.log(curve.idFamily);
                            if(curve.idFamily==family.idFamily)
                                self.curves_dt[i].push(curve);
                        })
                        // console.log('dtc: ', self.curves_dt);
                    })
                })
        });
        // console.log('dtcurves:',self.curves_dt);
        // if(self.dtW.length > 0)
        //     console.log(self.dtW);
        
    }
    this.tgW = [];
    this.targetW = function(){
        // console.log('self.dt: ', self.tg);
        var datas = $('#well li input:checked');
        self.tgW = [];
        datas.each(function() {
            self.tgW.push(JSON.parse(this.value));
        });
        // console.log('tgW: ', self.tgW);
        for(let i =0;i<self.tg.length;i++)
            self.curves_tg[i]=[];
        self.tgW.forEach(function(well) {
            // self.dt.forEach(function(d){
                // console.log('abc:', self.dt);
                wiApiService.getWell(well.idWell, function(info){
                    info.datasets[0].curves.forEach(function(curve){
                        self.tg.forEach(function(family,i){
                            // family = JSON.parse(family);
                            // console.log(family);
                            // console.log(curve.idFamily);
                            if(curve.idFamily==family.idFamily)
                                self.curves_tg[i].push(curve);
                        })
                        // console.log('dtc: ', self.curves_dt);
                    })
                })
        });
    }
}
let app = angular.module(moduleName, [
    
]);

app.component(componentName, {
    templateUrl: 'wi-test.html',
    controller: WiTestController,
    controllerAs: 'wiTestCtrl'
});

exports.name = moduleName;