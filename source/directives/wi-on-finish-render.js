const wiDirectiveName = 'wiOnFinishRender';
const moduleName = 'wi-on-finish-render';

let app = angular.module(moduleName, []);
app.directive(wiDirectiveName, function ($timeout) {
  return {
    restrict: 'A',
    link: function (scope, element, attr) {
      if (scope.$last === true) {
          $timeout(function () {
              scope.$emit(attr.onFinishRender);
          });
      }
  }
  }
});

exports.name = moduleName;