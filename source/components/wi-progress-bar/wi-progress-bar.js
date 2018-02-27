var moduleName = 'wi-progress-bar';
//var basePath = (__BASE_PATH || "") + moduleName + "/";
angular.module(moduleName, [])
    .component('wiProgressBar', {
        templateUrl: "wi-progress-bar.html",
        controller: Controller,
        controllerAs: 'wiProgressBar',
        bindings: {
            percent: "<"
        }
    });

function Controller() {
    let self = this;
    this.percent = 0;
    this.update = function(progress) {
        self.percent = progress;
    }
}
exports.name = moduleName;
