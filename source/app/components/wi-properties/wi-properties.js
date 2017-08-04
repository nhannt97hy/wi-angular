const componentName = 'wiProperties';
const moduleName = 'wi-properties';

function Controller(wiComponentService) {
    let self = this;

    this.$onInit = function () {
        if (self.name) wiComponentService.putComponent(self.name, self);

        wiComponentService.on('update-properties', function doUpdateListConfig(currentItem) {
            self.listConfig = toListConfig(currentItem);
        });
        wiComponentService.on('project-unloaded-event', function cleanList() {
            self.listConfig = null;
        });
    };

    function toListConfig(currentItem) {
        let listConfig = [];
        let config = {};
        let itemProperties = currentItem.properties;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        switch (currentItem.type) {
            case 'well':
                config = {
                    name: currentItem.name,
                    heading: 'Depths',
                    data: [{
                        key: 'bottomDepth',
                        label: 'Bottom Depth',
                        value: itemProperties.bottomDepth,
                    }, {
                        key: 'step',
                        label: 'Step',
                        value: itemProperties.step
                    }, {
                        key: 'topDepth',
                        label: 'Top Depth',
                        value: itemProperties.topDepth
                    }]
                }
                listConfig.push(config);
                config = {
                    name: currentItem.name,
                    heading: 'Informations',
                    data: [{
                        key: 'name',
                        label: 'Name',
                        value: itemProperties.name,
                        editable: true
                    }, {
                        key: 'unit',
                        label: 'Unit',
                        value: itemProperties.unit,
                        editable: true
                    }]
                }
                listConfig.push(config);
                break;
            case 'dataset':
                var well = utils.findWellById(itemProperties.idWell);
                config = {
                    name: currentItem.name,
                    heading: 'Properties',
                    data: [{
                        key: 'name',
                        label: 'Name',
                        value: itemProperties.name,
                        editable: true
                    }, {
                        key: 'well',
                        label: 'Well',
                        value: well.properties.name
                    }]
                }
                listConfig.push(config);
                break;
            case 'curve':
                var dataset = utils.findDatasetById(itemProperties.idDataset);
                var well = utils.findWellById(dataset.properties.idWell);
                config = {
                    name: currentItem.name,
                    heading: 'Depths',
                    data: [{
                        key: 'endDepth',
                        label: 'End Depth',
                        value: ''
                    }, {
                        key: 'startDepth',
                        label: 'Start Depth',
                        value: ''
                    }]
                }
                listConfig.push(config);
                config = {
                    name: currentItem.name,
                    heading: 'Informations',
                    data: [{
                        key: 'alias',
                        label: 'Alias',
                        value: ''
                    }, {
                        key: 'dataset',
                        label: 'Curve Set Name',
                        value: dataset.properties.name
                    }, {
                        key: 'dataType',
                        label: 'DataType',
                        value: '',
                        editable: true
                    }, {
                        key: 'exportName',
                        label: 'Export Name',
                        value: itemProperties.name,
                        editable: true
                    }, {
                        key: 'family',
                        label: 'Family',
                        value: '',
                        editable: true
                    }, {
                        key: 'name',
                        label: 'Name',
                        value: itemProperties.name,
                        editable: true
                    }, {
                        key: 'unit',
                        label: 'Unit',
                        value: itemProperties.unit,
                        editable: true
                    }, {
                        key: 'wellName',
                        label: 'Well Name',
                        value: well.properties.name,
                    }]
                }
                listConfig.push(config);
                config = {
                    name: currentItem.name,
                    heading: 'Values',
                    data: [{
                        key: 'maxValue',
                        label: 'Max Value',
                        value: ''
                    }, {
                        key: 'meanValue',
                        label: 'Mean Value',
                        value: ''
                    }, {
                        key: 'minValue',
                        label: 'Min Value',
                        value: ''
                    }]
                }
                listConfig.push(config);
                break;
            case 'logplot':
                var well = utils.findWellById(itemProperties.idWell);
                config = {
                    name: currentItem.name,
                    heading: 'Informations',
                    data: [{
                        key: 'depthReference',
                        label: 'Depth Reference',
                        value: '',
                        editable: true
                    }, {
                        key: 'name',
                        label: 'Name',
                        value: itemProperties.name,
                        editable: true
                    }, {
                        key: 'wellName',
                        label: 'Well Name',
                        value: well.properties.name,
                    }]
                }
                listConfig.push(config);
                config = {
                    name: currentItem.name,
                    heading: 'Misc',
                    data: [{
                        key: 'pointSymbol',
                        label: 'Point Symbol',
                        value: '',
                        editable: true
                    }, {
                        key: 'symbolColor',
                        label: 'Symbol Color',
                        value: '',
                        editable: true
                    }]
                }
                listConfig.push(config);
                config = {
                    name: currentItem.name,
                    heading: 'Plot Ranges',
                    data: [{
                        key: 'plotRangeFrom',
                        label: 'Plot Range From',
                        value: '',
                        editable: true
                    }, {
                        key: 'plotRangeTo',
                        label: 'Plot Range To',
                        value: '',
                        editable: true
                    }]
                }
                listConfig.push(config);
                config = {
                    name: currentItem.name,
                    heading: 'Utilities',
                    data: [{
                        key: 'invert',
                        label: 'Invert',
                        type: 'checkbox',
                        value: false
                    }, {
                        key: 'horizontalDisplay',
                        label: 'Horizontal Display',
                        type: 'checkbox',
                        value: false
                    }, {
                        key: 'showTooltip',
                        label: 'Show Tooltip',
                        type: 'checkbox',
                        value: false
                    }]
                }
                listConfig.push(config);
                break;
            default:
                break;
        }
        // for development process
        // TODO: remove
        config = {
            name: currentItem.name,
            heading: "---" + currentItem.name + " properties---",
            data: []
        }
        for (var key in currentItem.properties) {
            if (currentItem.properties.hasOwnProperty(key)) {
                config.data.push({
                    key: key,
                    label: key,
                    value: currentItem.properties[key]
                });
            }
        }
        listConfig.push(config);
        return listConfig;
    }

    // function doUpdateListConfig(currentItem) {
    //     self.listConfig = toListConfig(currentItem);
    // }

    function cleanList() {
        self.listConfig = null;
    }

    // this.updateListConfig = function(newConfig) {
    //     doUpdateListConfig(newConfig);
    // }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-properties.html',
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        name: '@',
        listConfig: '<'
    }
});

exports.name = moduleName;