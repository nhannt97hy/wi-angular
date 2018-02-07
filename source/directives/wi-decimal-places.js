const wiDirectiveName = 'wiDecimalPlaces';
const moduleName = 'wi-decimal-places';

let app = angular.module(moduleName, []);

app.directive(wiDirectiveName, function () {
    return {
        restrict: 'A',
        link: function (scope, ele, attrs) {
            ele.bind('keypress', function (e) {
                if (window.getSelection().toString()) return;
                let newVal = $(this).val() + (e.charCode !== 0 ? String.fromCharCode(e.charCode) : '');
                let decimals = parseInt(attrs[wiDirectiveName]);
                let regex = new RegExp('(.*)\.' + Array(++decimals).join('[0-9]'));
                if ($(this).val().search(regex) === 0 && newVal.length > $(this).val().length) {
                    e.preventDefault();
                }
            });
        }
    };
});
exports.name = moduleName;
