const name = 'wiMultiInput';
const moduleName = 'wi-multi-input';

function Controller() {
    let self = this;

    this.$onInit = function(){
        self.name = 'inputType' + Math.random();
        if(self.model.type == 'value'){
            self.SelectedValue = self.model.value;
        }else if (self.model.type == 'curve') {
            self.SelectedCurve = self.curvesList.find(curve => {
                return curve.id == self.model.value;
            })
        }else{
            return;
        }
    }

    this.groupFn = function(item){
        return item.parent;
    }

    this.onValueChange = function(){
        self.model.value = self.SelectedValue;
    }

    this.onSelectCurve = function(){
        if(!self.SelectedCurve){
            self.SelectedCurve = self.curvesList[0];
        }
        self.model.value = self.SelectedCurve.properties.idCurve;
    }
    this.onSelectCurveChange = function(){
        if(self.SelectedCurve){
            self.model.value = self.SelectedCurve.properties.idCurve;
        }
    }
}

let app = angular.module(moduleName, []);

app.component(name, {
    templateUrl: 'wi-multi-input.html',
    controller: Controller,
    controllerAs: name,
    require: 'ngModel',
    bindings: {
        model: '<',
        curvesList: '<',
        ngChange: '<',
        valueOnly: '<'
    }
});

exports.name = moduleName;
