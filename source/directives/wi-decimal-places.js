const wiDirectiveName = 'wiDecimalPlaces';
const moduleName = 'wi-decimal-places';

let app = angular.module(moduleName, []);

app.directive(wiDirectiveName, function () {
    return {
        restrict: 'A',
        link: function (scope, ele, attrs) {
            let decimals = parseInt(attrs[wiDirectiveName]);
            ele.bind('keypress', function () {
                if (window.getSelection().toString()) return;
                const regex = new RegExp('(.*)[.,]' + Array(decimals + 1).join('[0-9]'));
                const elem = $(this);
                const oldVal = elem.val();
                if (elem.val().search(regex) === 0) {
                    setTimeout(() => {
                        const newVal = elem.val();
                        const diff = Math.abs(newVal - oldVal);
                        if (diff > 0 && diff < 1) elem.val(oldVal);
                        else if (diff === 0 && elem.val().length > oldVal.length) elem.val(oldVal);
                    });
                }
            });
        }
    };
});
exports.name = moduleName;
