var DialogUtils = require('./DialogUtils');

var app = angular.module('app', ['angularModalService']);

app.controller('SampleController', function($scope, ModalService){
	$scope.show = function(){
		DialogUtils.unitSettingDialog(ModalService, function(ret) {
			console.log(ret);
		});
	};
	
});