const name = 'wiCustomInput';
const moduleName = 'wi-custom-input';

function Controller() {
    let self = this;

    this.onClick = function(val){
        self.model = val;
    }

    this.onChanged = function(){
        if(self.model.idDesCurve) self.model.idDesCurve = null;
        let curveModel = self.options.find(curve => {
            return curve.properties.name == self.model.curveName && curve.idDataset == self.model.idDataset;
        });

        if(curveModel) {
            self.model.idDesCurve = curveModel.properties.idCurve;
        }
    }

    this.onClickCurve = function(curve){
        self.model.curveName = curve.properties.name;
        self.model.idDesCurve = curve.properties.idCurve;        
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
        type: '@',
        disabled: '<'
    }
});

exports.name = moduleName;
