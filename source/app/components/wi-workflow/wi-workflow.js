const name = 'wiWorkflow';
const moduleName = 'wi-workflow';

function Controller(wiComponentService) {
    let self = this;

    this.$onInit = function(){
        wiComponentService.putComponent(wiComponentService.WI_WORKFLOW, self);
    }
}

let app = angular.module(moduleName, []);

app.component(name, {
    templateUrl: 'wi-workflow.html',
    controller: Controller,
    controllerAs: name,
    transclude: true
});

exports.name = moduleName;
