const name = 'wiCustomInput';
const moduleName = 'wi-custom-input';

function Controller() {
    let self = this;

    this.onClick = function(val){
        self.model = val;
    }

    this.onChanged = function(){
        if(self.model.id) self.model.id = null;
        let curveModel = self.options.find(curve => {
            return curve.properties.name == self.model.name;
        });

        if(curveModel) {
            self.model.id = curveModel.properties.idCurve;
        }
    }

    this.onClickCurve = function(curve){
        self.model.name = curve.properties.name;
        self.model.id = curve.properties.idCurve;        
    }
}

let app = angular.module(moduleName, []);

app.component(name, {
    templateUrl: 'wi-custom-input.html',
    controller: Controller,
    controllerAs: name,
    bindings: {
        model: '=',
        options: '<',
        type: '@'
    }
});

exports.name = moduleName;
