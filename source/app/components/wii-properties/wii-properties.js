const componentName = 'wiiProperties';
const moduleName = 'wii-properties';

function Controller(wiComponentService, wiApiService, $timeout) {
    let self = this;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);

    this.$onInit = function () {
        if (self.name) wiComponentService.putComponent(self.name, self);

        wiComponentService.on(wiComponentService.UPDATE_PROPERTIES_EVENT, function doUpdateListConfig(currentItem) {
            toListConfig(currentItem).then(function (listConfig) {
                $timeout(function () {
                    self.listConfig = listConfig;
                    wiComponentService.putComponent('properties-node', currentItem);
                })
            });
        });
    };
    const type = {
        checkbox: 'checkbox',
        select: 'select'
    }
    const propsMap = {
        'TOP': 'Top_depth',
        'STOP': 'Bottom_depth',
        'STEP': 'Step',
        'NULL': 'Null_value',
        'WELL': 'WELL',
        'UWI': 'UWI',
        'API': 'API',
        'LATI': 'Latitude',
        'LONG': 'Longtitude',
        'EASTING': 'Easting_(X)',
        'NORTHING': 'Northing_(Y)',
        'KB': 'KB elevation',
        'GL': 'GL elevation',
        'TD': 'Total depth',
        'ID': 'Id',
        'NAME': 'Name',
        'COMPANY': 'Company',
        'OPERATOR': 'Operator',
        'AUTHOR': 'Author',
        'DATE': 'Date',
        'LOGDATE': 'Logging date',
        'SRVC': 'Service company',
        'GDAT': 'GeoDatum',
        'LIC': 'License number',
        'CNTY': 'County',
        'STATE': 'State',
        'PROV': 'Province',
        'CTRY': 'Country',
        'LOC': 'Location',
        'FLD': 'Field',
        'PROJ': 'Project',
        'CODE': 'Code',
        'AREA': 'Area',
        'TYPE': 'Area',
        'STATUS': 'Status',
        'GEN1': 'Gen 01',
        'GEN2': 'Gen 02',
        'GEN3': 'Gen 03',
        'GEN4': 'Gen 04',
        'GEN5': 'Gen 05',
        'GEN6': 'Gen 06',
    }
    async function toListConfig(currentItem) {
        let listConfig = [];
        let config = {};
        let itemProperties = currentItem.properties;
        if (!itemProperties) return;
        let inventory = wiComponentService.getComponent('INVENTORY');
        var well = utils.getParentByModel(currentItem.type, currentItem.id, 'well', inventory);
        switch (currentItem.type) {
            case 'well':
                config = {
                    name: currentItem.name,
                    heading: 'Well Properties',
                    data: []
                }
                if (!Array.isArray(itemProperties.well_headers)) break;
                config.data = itemProperties.well_headers.map(header => {
                    return {
                        key: header.header,
                        label: propsMap[header.header] || header.header,
                        value: header.value
                    }
                })
                listConfig.push(config);
                break;
            case 'curve':
                config = {
                    name: currentItem.name,
                    heading: 'Informations',
                    data: [ {
                        key: 'name',
                        label: 'Name',
                        value: itemProperties.name
                    }, {
                        key: 'alias',
                        label: 'Alias',
                        value: itemProperties.alias
                    }, {
                        key: 'unit',
                        label: 'Unit',
                        value: itemProperties.unit
                    }, {
                        key: 'wellName',
                        label: 'Well Name',
                        value: well.properties.name,
                    }]
                }
                listConfig.push(config);
                config = {
                    name: currentItem.name,
                    heading: 'Depths',
                    data: [{
                        key: 'endDepth',
                        label: 'End Depth',
                        value: itemProperties.stopDepth
                    }, {
                        key: 'startDepth',
                        label: 'Start Depth',
                        value: itemProperties.startDepth
                    }, {
                        key: 'step',
                        label: 'Step',
                        value: itemProperties.step
                    }]
                }
                listConfig.push(config);
                break;
            default:
                break;
        }
        listConfig.forEach(config => {
            config.data.forEach(d => {
                if (d.editable == undefined || d.editable == null) d.editable = true;
            })
        })
        return listConfig;
    }

    // function doUpdateListConfig(currentItem) {
    //     self.listConfig = toListConfig(currentItem);
    // }

    this.emptyList = function () {
        self.listConfig = null;
    }

    // this.updateListConfig = function(newConfig) {
    //     doUpdateListConfig(newConfig);
    // }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wii-properties.html',
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        name: '@',
        listConfig: '<'
    }
});

exports.name = moduleName;
