const wiDirectiveName = 'wiInputRangeLimit';
const moduleName = 'wi-input-range-limit';

let app = angular.module(moduleName, []);
app.directive(wiDirectiveName, function($timeout) {
    return {
        link: function(scope, element, attributes) {
            element.on("keydown keyup", function(e) {
                if( e.keyCode != 46 // delete
                    && e.keyCode != 8 // backspace
                    && e.keyCode != 13 // enter
                ) {
                    let val = element.val();
                    if(val === ''){
                        val = String.fromCharCode(e.keyCode);
                    }
                    if(Number(val) > Number(attributes.max)) {
                        e.preventDefault();
                        element.val(Number(attributes.max));
                        element.trigger('input');
                    } else if(Number(val) < Number(attributes.min)) {
                        if(Number(element.val() + String.fromCharCode(e.keyCode)) < Number(attributes.min)) {
                            e.preventDefault();
                            element.val(Number(attributes.min));
                            element.trigger('input');
                        }
                    }
                }
            });
        }
    };
});

exports.name = moduleName;
