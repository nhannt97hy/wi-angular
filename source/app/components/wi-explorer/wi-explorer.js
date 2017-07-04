const componentName = 'wiExplorer';
const moduleName = 'wi-explorer';

function Controller($scope, $timeout, wiComponentService) {
    let self = this;

    this.$onInit = function () {
        // hide for test
        $scope.handlers = wiComponentService.getComponent('GLOBAL_HANDLERS');

        /**
         id: Date.now(),
         "type": "project",
         "name": "Test-Project",
         "company": "UET",
         "department": "FIT",
         "description": "blablabla"
         */
        // wiComponentService.on('open-project-event', function (data) {
        //     // todo: remove test
        //     console.log('project data: ', data);
        //     self.treeConfig = TREE_CONFIG_TEST;
        //     console.log('treeConfig', self.treeConfig)
        //     // $scope.$apply();
        //     // $timeout(function () {
        //     //     let mockTreeData = TREE_CONFIG_TEST;
        //     //     console.log('response data: ', mockTreeData);
        //     //
        //     //     self.treeConfig = mockTreeData;
        //     //     $scope.$apply();
        //     // }, 2000);
        // });

        // test
        // $timeout(function () {
        //     self.treeConfig = TREE_CONFIG_TEST;
        //     console.log('treeConfig', self.treeConfig)
        // }, 5000);

        if (self.name) wiComponentService.putComponent(self.name, self);
    };
    
    this.$onChanges = function (changes) {
        console.log('wi explorer changes ', changes);

    }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-explorer.html',
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        name: '@',
        treeConfig: '<'
    }
});

exports.name = moduleName;


/**
 MOCK TEST
 */

TREE_CONFIG_TEST_3 = [
    {
        name: 'item11000',
        type: 'item11000',
        data: {
            icon: 'project-new-16x16',
            label: 'item 11000',
            description: 'mm',
            childExpanded: false
        },
        children: [
            {
                name: 'item11',
                type: 'item11',
                data: {
                    icon: 'project-new-16x16',
                    label: 'item 1.1',
                    description: 'hu hu hu',
                    childExpanded: false
                },
                children: [
                    {
                        name: 'item1211',
                        type: 'item121',
                        data: {
                            icon: 'project-new-16x16',
                            label: 'item 1.2.1.1',
                            description: 'hic',
                            childExpanded: false
                        },
                        children: []
                    },
                    {
                        name: 'item1212',
                        type: 'item121',
                        data: {
                            name: 'item122',
                            icon: 'project-new-16x16',
                            label: 'item 1.2.1.2',
                            description: '',
                            childExpanded: false
                        },
                        children: []
                    }
                ]
            },
            {
                name: 'item12',
                type: 'item12',
                data: {
                    icon: 'project-new-16x16',
                    label: 'item 1.2',
                    description: '',
                    childExpanded: false
                },
                children: []
            }
        ]
    },
    {
        name: 'item2',
        type: 'item2',
        data: {
            icon: 'project-new-16x16',
            label: 'item 2',
            description: 'description 2',
            childExpanded: false
        }
    }
];