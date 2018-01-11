const componentName = 'wiSpinner';
const moduleName = 'wi-spinner';

function Controller(wiComponentService, $timeout, $scope) {
    let self = this;
    this.shown = false;
    let _spinner = new Spinner({
        color: '#FFF',
        shadow: true
    });
    let _backdrop = null;

    // wiComponentService.on(wiComponentService.PROJECT_REFRESH_EVENT, hide);
    this.$onInit = function() {
        if (self.name) wiComponentService.putComponent(self.name, self);
    }
    this.onReady = function() {
        _backdrop = document.getElementById('spinnerHolder');
    }
    let count = 0;
    this.show = show;
    function show(silent = false) {
        if (silent) return;
        console.log('spinner');
        count++;
        if (!_backdrop) return;
        self.shown = true;
        _backdrop.appendChild(_spinner.spin().el);
    }
    this.hide = hide;
    function hide() {
        console.log('stop spinner');
        count--;
        if (count > 0) return console.log(count);
        self.shown = false;
        if (_spinner) _spinner.stop();
    }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-spinner.html',
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        name: "@"
    }
});

exports.name = moduleName;
