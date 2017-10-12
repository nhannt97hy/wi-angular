const componentName = 'wiLevelMenu';
const moduleName = 'wi-level-menu';
function multiLevelCtrl($scope, $timeout) {
  var self = this;
  $scope.model = {
    id: null,
    properties: {
      name: 'select...'
    }
  };
  $scope.select = function(node) {
    $timeout(function() {
      $scope.selected = node;
    })
  };
  $scope.$watch('start', function(newValue) {
    $scope.model = self.myModel;
  });
  $scope.$watch('selected', function(newValue) {
    self.myModel = newValue;
  });

  $scope.$watch('model', function(newValue) {
    $scope.selected = newValue;
  });

}

let app = angular.module(moduleName, []);
  app.component(componentName, {
    templateUrl: "wi-level-menu.html",
    bindings: {
      options: "=",
      myModel: '='
    },
    transclude: true,
    controller: multiLevelCtrl,
    controllerAs: 'menuCtrl'
  });
  exports.name = moduleName;
  
