const wiDirectiveName = 'wiRightClick';
const moduleName = 'wi-right-click';

let app = angular.module(moduleName, []);
app.directive(wiDirectiveName, function ($parse) {
    return function (scope, element, attrs) {
        let fn = $parse(attrs[wiDirectiveName]);
        element.bind('contextmenu', function (event) {
            scope.$apply(function () {
                event.preventDefault();
                fn(scope, {$event: event});
            });
        });
    };
});

exports.name = moduleName;