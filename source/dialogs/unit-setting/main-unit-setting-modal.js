var DialogUtils = require('./DialogUtils');

var app = angular.module('app', ['angularModalService']);

app.controller('SampleController', function($scope, ModalService){
	$scope.show = function(){
		DialogUtils.unitSettingDialog(ModalService, function(ret) {
			console.log(ret);
		}, {
			unitSystem : ["Default", "Canadian", "English", "Metric", "Russian"],
			caliper : ["in", "m", "cm", "Ft", "1.Ft", "mm", "um"],
			neutron : ["v/v", "Trac", "%", "pu", "imp/min"],
			gammaRay : ["api", "GAPI", "uR/h", "GAMA"], 
			acoustic : ["us/ft", "us/m"],
			pressure : ["psi", "Pa", "kPa", "MPa", "mBar", "Bar", "kg/m2", "atm", "torr"],
			bitSize : ["in", "m", "cm", "Ft", "1.Ft", "mm", "um"],
			density : ["g/cm3", "kg/m3"],
			concentration : ["v/v", "%", "ppm", "kpp", "m", "1/L", "mS/m", "1/kg", "dB/m", "mV", "galUS/min", "mD/cP", "b/elec", "b/cm3", "m3/d", "MV"],
			permeability : ["mD", "D"],
			porosity : ["v/v", "m3/m3", "ft3/ft3", "%", "imp/min", "ratio"],
			angle : ["deg", "dega", "grad", "rad"],
			resistivity : ["olm.m", "ratio"],
			saturation : ["v/v", "m3/m3", "ft3/ft3",  "%", "ratio"],
			temperature : ["degC", "degF"],
			volume : ["v/v", "cm3", "L.m"],
			sp : ["mv"],
			length : ["m"],
			time : ["s"],
			area : ["m2"],
			flow : ["t"],
			speed : ["m/s", "m2", "ft/h", "ratio", "ft/s", "m/min", "rpm", "mn/m"],
			force : ["N"]
		});
	};
});