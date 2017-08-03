const wiDirectiveName = 'wiEnter';
const moduleName = 'wi-enter';

let app = angular.module(moduleName, []);
app.directive(wiDirectiveName, function ($parse) {
    return function (scope, element, attrs) {
        let fn = $parse(attrs[wiDirectiveName]);
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    event.preventDefault();
                    fn(scope, {$event: event});
                });
            }
        });
    };
});

exports.name = moduleName;