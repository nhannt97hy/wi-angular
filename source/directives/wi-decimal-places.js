const wiDirectiveName = 'wiDecimalPlaces';
const moduleName = 'wi-decimal-places';

let app = angular.module(moduleName, []);

app.directive(wiDirectiveName, function () {
    return {
        restrict: 'A',
        link: function (scope, ele, attrs) {
            let decimals = parseInt(attrs[wiDirectiveName]);
            ele.bind('keypress', function (event) {
                if (window.getSelection().toString()) return;
                const elem = $(this);
                const oldVal = elem.val();
                if(event.charCode == 43) {
                    event.preventDefault();
                    return;
                }
                else if(event.charCode == 45 && oldVal) {
                    if(oldVal < 0) {
                        event.preventDefault();
                        elem.val(Math.abs(oldVal));
                        return;
                    }else{
                        setTimeout(()=> {
                            const newVal = elem.val();
                            if(!newVal) elem.val(oldVal);
                            return;
                        })
                    }
                }
                const regex = new RegExp('(.*)[.,]' + Array(decimals + 1).join('[0-9]'));
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
