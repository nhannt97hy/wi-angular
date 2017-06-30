var DialogUtils = require('./DialogUtils');
var app = angular.module('app', ['angularModalService']);
app.controller('SampleController', function($scope, ModalService) {
    $scope.show = function() {
        DialogUtils.confirmDialog(ModalService, 
        	"troi oi la troi", 
        	"sao toi kho the nay?", 
        	function(yesOrNo) {
        		console.log("user choose " + yesOrNo);
        	}
        );
    }
});

