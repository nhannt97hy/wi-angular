const wiScrollName = 'wiScroll';
const moduleName = 'wi-scroll';

function Controller($scope, $timeout, $http) {
    let self = this;
    this.$onInit = function() {
        $timeout(function() {
            $('#' + self.idScroll).scroll(function() {
                var _self = this;
                let scrollTop = $(this).scrollTop();
                if (scrollTop + $(this).innerHeight() >= $(this)[0].scrollHeight) {
                    //self.busy = true;
                    self.downTrigger(function(num) {
                        //self.busy = false;
                        if (num > 0) {
                            $(_self).scrollTop(scrollTop - 3);
                        }
                    });
                }
                if ($(this).scrollTop() == 0) {
                    //self.busy = true;
                    self.upTrigger(function(num) {
                        //self.busy = false;
                        if (num > 0) {
                            $(_self).scrollTop(30);
                        }
                    });
                }
            });
        }, 1000)
    }
}

angular.module(moduleName, []).component(wiScrollName, {
    templateUrl: "wi-scroll.html",
    controller: Controller,
    controllerAs: "wiScroll",
    transclude: true,
    bindings: {
        idScroll: "<",
        upTrigger: "<",
        downTrigger: "<"
    }
});

exports.name = moduleName;
