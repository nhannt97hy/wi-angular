const wiContainerName = 'wiContainer';
const moduleName = 'wi-container';

function ContainerController(wiComponentService, $timeout) {
    let self = this;

    this.$onInit = function(){
        if (self.name) wiComponentService.putComponent(self.name, self);
    }

    this.onCloseButtonClick = function() {
        if(self.closeHandler)
        self.closeHandler();
        console.log('Close', self.name);
    }
}

let app = angular.module(moduleName, []);

app.component(wiContainerName, {
    templateUrl: 'wi-container.html',
    controller: ContainerController,
    controllerAs: wiContainerName,
    bindings: {
        name: '@',
        title: '@',
        closeHandler: '<'
    },
    transclude: true
});

exports.name = moduleName;