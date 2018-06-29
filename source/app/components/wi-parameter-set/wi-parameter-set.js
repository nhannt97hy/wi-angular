const componentName = 'wiParameterSet';
const moduleName = 'wi-parameter-set';

function Controller($scope, wiComponentService, wiApiService) {
    let self = this;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);

    this.parameterSetList = [];
    this.selectedParameterSet = {};
    this.parameterSetTreeConfig = {};

    this.$onInit = function () {
        wiComponentService.putComponent(this.name, this);
        this.getParameterSetList();
        $scope.$watch(() => self.selectedParameterSet, (newVal) => {
            if (newVal) self.parameterSetTreeConfig = _parameterSetToTreeConfig(newVal.content);
        })
    }

    this.getParameterSetList = function () {
        const idProject = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED).idProject;
        wiApiService.listParameterSet(idProject, function (res, err) {
            if (err) return;
            self.parameterSetList = res;
            self.selectedParameterSet = res.find(p => p.idParameterSet == self.selectedParameterSet.idParameterSet) || self.parameterSetList[0];
        })
    }

    // private
    function _parameterSetToTreeConfig(parameterSet) {
        if (!parameterSet) return {};
        return Object.keys(parameterSet).map(pName => ({
            type: 'parameter-set',
            data: {
                icon: 'zone-table-16x16',
                label: pName
            },
            children: Object.keys(parameterSet[pName]).map(key => ({
                type: 'parameter-choice',
                data: {
                    label: key,
                    value: isNaN(parseFloat(parameterSet[pName][key]))
                        ? { name: parameterSet[pName][key], value: parameterSet[pName][key] }
                        : parameterSet[pName][key],
                    choices: isNaN(parseFloat(parameterSet[pName][key]))
                        ? [{ name: parameterSet[pName][key], value: parameterSet[pName][key] }]
                        : undefined,
                }
            }))
        }));
    }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-parameter-set.html',
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        name: '@'
    }
});

exports.name = moduleName;
