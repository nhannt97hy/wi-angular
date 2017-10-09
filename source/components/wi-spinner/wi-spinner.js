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

    wiComponentService.on(wiComponentService.PROJECT_REFRESH_EVENT, hide);
    this.$onInit = function() {
        if (self.name) wiComponentService.putComponent(self.name, self);
    }
    this.onReady = function() {
        _backdrop = document.getElementById('spinnerHolder');
        //$timeout(function() {show();}, 3000);
    }
    this.show = show;
    function show() {
        self.shown = true;
        
        if (_backdrop) _backdrop.appendChild(_spinner.spin().el);
    }
    this.hide = hide; 
    function hide() {
        $timeout(function(){
            self.shown = false;
            if (_spinner) _spinner.stop();
        })
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
