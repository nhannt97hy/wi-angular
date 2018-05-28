const name = 'wiCustomInput';
const moduleName = 'wi-custom-input';

function Controller($scope) {
    let self = this;
    this.$onChanges = function(changes){
        if(self.type == 'curve' && self.options){
            self.optionsHash = Array.from(self.options.reduce((total, curVal) => {
                total.add(curVal.properties.name.toUpperCase());
                return total;
            }, new Set()))
        }
    }

    this.onClick = function(val){
        console.log(val);
        self.model = val;
    }
    $scope.$watch(() => {
            return self.model.idDataset;
        }, (value) => {
            if(self.type == 'curve'){
                self.onChanged();
            }
    })

    this.onChanged = function(){
        if(self.model.idDesCurve) self.model.idDesCurve = null;
        let curveModel = self.options.find(curve => {
            return curve.properties.name.toUpperCase() == self.model.curveName && curve.properties.idDataset == self.model.idDataset;
        });
        if(curveModel) {
            self.model.idDesCurve = curveModel.properties.idCurve;
        }
    }

    this.onClickCurve = function(curve){
        self.model.curveName = curve;
        self.onChanged();
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
