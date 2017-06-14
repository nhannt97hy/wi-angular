// todo: write some services
var app = angular.module('app', ['angularModalService']);

app.controller('SampleController', ["$scope", "ModalService", function($scope, ModalService) {
// var modalScope = $rootScope.$new();
    $scope.show = function() {
        ModalService.showModal({
            templateUrl: 'new-project-template.html',
            controller: 'ModalController',
            // scope: modalScope
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(ret) {
                if(ret == 'Cancel'){
                    $scope.message = "You said " + ret;
                }else{
                    $scope.message = "You said " + JSON.stringify(ret, null, 4);
                }
            });
        });
    };

}]);

 app.controller( 'ModalController', function($scope, close) {
     $scope.close = function(ret) {
         close(ret, 500); // close, but give 500ms for bootstrap to animate
     };
     $scope.onOK = function () {
         return {
             name: $scope.name,
             location: $scope.location,
             company: $scope.company,
             department: $scope.department,
             description: $scope.description
         }
     }
});
