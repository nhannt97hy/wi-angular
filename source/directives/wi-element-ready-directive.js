const wiDirectiveName = 'wiElementReady';
const moduleName = 'wi-element-ready';

let app = angular.module(moduleName, []);
app.directive(wiDirectiveName, function ($parse) {
    return {
        restrict: 'A',
        link: function ($scope, elem, attrs) {
            elem.ready(function () {
                $scope.$apply(function () {
                    let func = $parse(attrs.wiElementReady);
                    func($scope);
                })
            })
        }
    }
});

exports.name = moduleName;