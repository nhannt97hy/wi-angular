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
                    self.downTrigger(function(newItems, existingList) {
                        if (newItems.length > 0) {
                            async.eachSeries(newItems, function(item, done) {
                                $timeout(function() {
                                    item.data.bgColor= '#CCF';
                                    existingList.push(item);
                                    existingList.shift();
                                    done();
                                }, 100);
                            }, function() {
                                $(_self).scrollTop(scrollTop - 3);
                                $timeout(() => existingList.forEach(item => delete item.data.bgColor), 1000);;
                            });
                        }
                    });
                }
                if ($(this).scrollTop() == 0) {
                    self.upTrigger(function(newItems, existingList) {
                        if (newItems.length > 0) {
                            async.eachSeries(newItems, function(item, done) {
                                $timeout(function() {
                                    item.data.bgColor= '#CCF';
                                    existingList.unshift(item);
                                    existingList.pop();
                                    done();
                                }, 100);
                            }, function() {
                                $(_self).scrollTop(3);
                                //existingList.forEach(item => delete item.data.bgColor);
                                $timeout(() => existingList.forEach(item => delete item.data.bgColor), 1000);;
                            });
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
