const directiveName = 'wiInitialization';
const moduleName = 'wi-initialization';
let app = angular.module(moduleName, []);
app.directive(directiveName,['$rootScope',function($rootScope) {
    return {
        restrict: 'A',
        link: function($scope) {
            var to;
            var listener = $scope.$watch(function() {
                clearTimeout(to);
                to = setTimeout(function () {
                    listener();
                    $rootScope.$broadcast('initialized');
                }, 200);
            });
        }
    };
}]);
exports.name = moduleName;
