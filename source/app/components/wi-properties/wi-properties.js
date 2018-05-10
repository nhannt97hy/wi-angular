const componentName = 'wiProperties';
const moduleName = 'wi-properties';

function Controller(wiComponentService, wiApiService, $timeout, $scope, ModalService) {
    let self = this;
    this.$onInit = function () {
        if (self.name) wiComponentService.putComponent(self.name, self);

        wiComponentService.on('update-properties', async function doUpdateListConfig(currentItem) {
            self.listConfig = await toListConfig(currentItem);
            $scope.$apply();
        });
        wiComponentService.on('project-unloaded-event', function cleanList() {
            self.listConfig = null;
        });
    };
    const type = {
        checkbox: 'checkbox',
        select: 'select',
        action: 'action'
    }

    async function toListConfig(currentItem) {
        let listConfig = [];
        let config = {};
        let itemProperties = currentItem.properties;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
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
                const curveUnits = await wiApiService.asyncGetListUnit({idCurve: itemProperties.idCurve});
                currentItem.currentUnit = curveUnits.find(u => u.name === currentItem.properties.unit);
                config = {
                    name: currentItem.name,
                    heading: 'Depths',
                    data: [{
                        key: 'endDepth',
                        label: 'End Depth',
                        value: well.properties.bottomDepth
                    }, {
                        key: 'startDepth',
                        label: 'Start Depth',
                        value: well.properties.topDepth
                    }]
                }
                listConfig.push(config);
                let listFamily = utils.getListFamily();
                let curveFamily = listFamily.find(f => f.idFamily === itemProperties.idFamily) || {};
                let listUnit = curveFamily.family_spec || [];
                let curveUnit = listUnit.find(u => u.isDefault === true) || {};
                config = {
                    name: currentItem.name,
                    heading: 'Informations',
                    data: [{
                        key: 'alias',
                        label: 'Alias',
                        value: itemProperties.alias
                    }, {
                        key: 'dataset',
                        label: 'Curve Set Name',
                        value: dataset.properties.name
                    }, {
                        key: 'datatype',
                        label: 'DataType',
                        value: '',
                        editable: false
                    }, {
                        key: '',
                        label: 'Export Name',
                        value: itemProperties.name,
                        editable: false
                    }, {
                        key: 'name',
                        label: 'Name',
                        value: itemProperties.name,
                        editable: true
                    }, {
                        key: 'unit',
                        label: 'Unit',
                        editable: true,
                        value: currentItem.properties.unit
                    }, {
                        key: 'compatiable-list',
                        label: 'Compatiable List',
                        type: type.select,
                        options: curveUnits.map(unit => {
                            return {
                                value: unit.idUnit,
                                label: unit.name
                            }
                        }),
                        onChange: function (item) {
                            let payload = {};
                            payload.srcUnit = currentItem.currentUnit;
                            payload.desUnit = curveUnits.find(u => u.idUnit === item.value);
                            payload.idCurve = itemProperties.idCurve;
                            wiApiService.convertCurveUnit(payload, function (response) {
                                utils.refreshProjectState().then(() => {
                                    $timeout(function () {
                                        wiComponentService.emit('update-properties', utils.getSelectedNode());
                                    })
                                });
                            });
                        },
                        value: currentItem.currentUnit ? currentItem.currentUnit.idUnit : null,
                        editable: true
                    }, {
                        key: 'unknown',
                        label: 'Unknown',
                        value: currentItem.currentUnit ? null : currentItem.properties.unit,
                        color: 'red'
                    }, {
                        key: 'long-list',
                        label: 'Long List',
                        value: 'Long'
                    }, {
                        key: 'idFamily',
                        label: 'Family',
                        type: type.action,
                        handle: () => {
                            dialogUtils.curveFamilyDialog(ModalService, currentItem, listFamily, function (newFamily) {
                                if (!newFamily) return;
                                utils.editProperty({key: 'idFamily', value: newFamily.idFamily}, async function () {
                                    itemProperties.idFamily = newFamily.idFamily;
                                    self.listConfig = await toListConfig(currentItem);
                                    $scope.$apply();
                                })
                            });
                        },
                        value: itemProperties.idFamily,
                        valueLabel: curveFamily.name,
                        icon: 'family-edit-16x16',
                        editable: true
                    }, {
                        key: 'family-unit',
                        label: 'Family Unit',
                        value: curveUnit.unit
                    },
                        // {
                        // key: 'unit',
                        // label: 'Unit',
                        // type: type.select,
                        // options: listUnit.map(unit => {
                        //     return {
                        //         value: unit.idFamilySpec,
                        //         label: unit.unit
                        //     }
                        // }),
                        // value: curveUnit.idFamilySpec,
                        // editable: true
                        // }
                        {
                            key: 'wellName',
                            label: 'Well Name',
                            value: well.properties.name,
                        }]
                };
                listConfig.push(config);
                const scale = await wiApiService.asyncScaleCurve(itemProperties.idCurve, {silent: true});
                config = {
                    name: currentItem.name,
                    heading: 'Values',
                    data: [{
                        key: 'maxValue',
                        label: 'Max Value',
                        value: scale.maxScale
                    }, {
                        key: 'meanValue',
                        label: 'Mean Value',
                        value: scale.meanValue
                    }, {
                        key: 'minValue',
                        label: 'Min Value',
                        value: scale.minScale
                    }]
                }
                listConfig.push(config);
                break;
            case 'zoneset':
                var well = utils.findWellById(itemProperties.idWell);
                config = {
                    name: currentItem.name,
                    heading: 'Properties',
                    data: [
                        {
                            key: 'isDefault',
                            label: 'Is Default',
                            type: type.checkbox
                        }, {
                            key: 'name',
                            label: 'Name',
                            value: itemProperties.name,
                            editable: true
                        }, {
                            key: 'type',
                            label: 'Type',
                            value: 'Zonation',
                        }, {
                            key: 'well',
                            label: 'Well',
                            value: well.properties.name
                        }
                    ]
                }
                listConfig.push(config);
                break;
            case 'zone':
                config = {
                    name: currentItem.name,
                    heading: 'Colors',
                    data: [
                        {
                            key: 'backgroundColor',
                            label: 'Background Color',
                            value: itemProperties.background,
                            editable: true
                        }, {
                            key: 'lineColor',
                            label: 'Line Color',
                            value: '',
                            editable: true
                        }, {
                            key: 'textColor',
                            label: 'Text Color',
                            value: '',
                            editable: true
                        }
                    ]
                }
                listConfig.push(config);
                config = {
                    name: currentItem.name,
                    heading: 'Depths',
                    data: [{
                        key: 'endDepth',
                        label: 'End Depth',
                        value: itemProperties.endDepth
                    }, {
                        key: 'startDepth',
                        label: 'Start Depth',
                        value: itemProperties.startDepth
                    }]
                }
                listConfig.push(config);
                config = {
                    name: currentItem.name,
                    heading: 'Informations',
                    data: [{
                        key: 'isDefault',
                        label: 'Is Default',
                        type: type.checkbox
                    }, {
                        key: 'name',
                        label: 'Name',
                        value: itemProperties.name,
                        editable: true
                    }, {
                        key: 'zoneType',
                        label: 'Zone Type',
                        value: 'Zonation',
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
                        type: type.checkbox,
                        value: false,
                        editable: true
                    }, {
                        key: 'horizontalDisplay',
                        label: 'Horizontal Display',
                        type: type.checkbox,
                        value: false,
                        editable: true
                    }, {
                        key: 'showTooltip',
                        label: 'Show Tooltip',
                        type: type.checkbox,
                        value: false,
                        editable: true
                    }]
                }
                listConfig.push(config);
                break;
            case 'crossplot':
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
                    heading: 'Interval',
                    data: [{
                        key: 'intervalBottom',
                        label: 'Interval Bottom',
                        value: '',
                        editable: true
                    }, {
                        key: 'intervalTop',
                        label: 'Interval Top',
                        value: '',
                        editable: true
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
                        key: 'activeColorAxisColor',
                        label: 'Active Color Axis Color',
                        type: type.checkbox,
                        value: false,
                        editable: true
                    }, {
                        key: 'symbolColor',
                        label: 'Symbol Color',
                        value: '',
                        editable: true
                    }, {
                        key: 'useActiveZonesColor',
                        label: 'Use Active Zone Color',
                        type: type.checkbox,
                        value: false,
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
                        type: type.checkbox,
                        value: false,
                        editable: true
                    }, {
                        key: 'horizontalDisplay',
                        label: 'Horizontal Display',
                        type: type.checkbox,
                        value: false,
                        editable: true
                    }, {
                        key: 'showGrid',
                        label: 'Show Grid',
                        type: type.checkbox,
                        value: false,
                        editable: true
                    }, {
                        key: 'showOverlay',
                        label: 'Show Overlay',
                        type: type.checkbox,
                        value: false,
                        editable: true
                    }, {
                        key: 'showTooltip',
                        label: 'Show Tooltip',
                        type: type.checkbox,
                        value: false,
                        editable: true
                    }, {
                        key: 'showYAxisAsPercent',
                        label: 'Show Y Axis As Percent',
                        type: type.checkbox,
                        value: false,
                        editable: true
                    }]
                }
                listConfig.push(config);
                /*
                if (!currentItem.data.ts || Date.now() - currentItem.data.ts > 30000)
                    wiApiService.getCrossplot(itemProperties.idCrossPlot, function (dataReturn) {
                        console.log(dataReturn);
                        currentItem.properties = dataReturn;
                        currentItem.properties.discriminator = JSON.parse(currentItem.properties.discriminator);
                        itemProperties = currentItem.properties;
                        currentItem.data.ts = Date.now();
                    });
                */
                break;
            case 'histogram':
                var well = utils.findWellById(itemProperties.idWell);
                config = {
                    name: currentItem.name,
                    heading: 'Division and Scales',
                    data: [{
                        key: 'histogramDivision',
                        label: 'Histogram Division',
                        value: '',
                        editable: true
                    }, {
                        key: 'maxScale',
                        label: 'Max Scale',
                        value: '',
                        editable: true
                    }, {
                        key: 'minScale',
                        label: 'Min Scale',
                        value: '',
                        editable: true
                    }]
                }
                listConfig.push(config);
                config = {
                    name: currentItem.name,
                    heading: 'Informations',
                    data: [{
                        key: 'depthReference',
                        label: 'Depth Reference',
                        value: '',
                        editable: true
                    }, {
                        key: 'displayType',
                        label: 'Display Type',
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
                    heading: 'Interval',
                    data: [{
                        key: 'intervalBottom',
                        label: 'Interval Bottom',
                        value: '',
                        editable: true
                    }, {
                        key: 'intervalTop',
                        label: 'Interval Top',
                        value: '',
                        editable: true
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
                    }, {
                        key: 'useActiveZonesColor',
                        label: 'Use Active Zone Color',
                        type: type.checkbox,
                        value: false,
                        editable: true
                    }]
                }
                listConfig.push(config);
                config = {
                    name: currentItem.name,
                    heading: 'Utilities',
                    data: [{
                        key: 'cumulate',
                        label: 'Cumulate',
                        type: type.checkbox,
                        value: false,
                        editable: true
                    }, {
                        key: 'displayAsCurve',
                        label: 'Display As Curve',
                        type: type.checkbox,
                        value: false,
                        editable: true
                    }, {
                        key: 'invert',
                        label: 'Invert',
                        type: type.checkbox,
                        value: false,
                        editable: true
                    }, {
                        key: 'horizontalDisplay',
                        label: 'Horizontal Display',
                        type: type.checkbox,
                        value: false,
                        editable: true
                    }, {
                        key: 'showOverlay',
                        label: 'Show Overlay',
                        type: type.checkbox,
                        value: false,
                        editable: true
                    }, {
                        key: 'showTooltip',
                        label: 'Show Tooltip',
                        type: type.checkbox,
                        value: false,
                        editable: true
                    }, {
                        key: 'showYAxisAsPercent',
                        label: 'Show Y Axis As Percent',
                        type: type.checkbox,
                        value: false,
                        editable: true
                    }]
                }
                listConfig.push(config);
                /*
                if (!currentItem.data.ts || Date.now() - currentItem.data.ts > 30000)
                    wiApiService.getHistogram(itemProperties.idHistogram, function (dataReturn) {
                        console.log(dataReturn);
                        currentItem.properties = dataReturn;
                        currentItem.properties.discriminator = JSON.parse(currentItem.properties.discriminator);
                        itemProperties = currentItem.properties;
                        itemProperties.reference_curves = dataReturn.reference_curves;
                        currentItem.data.ts = Date.now();
                    });
                */
                break;
            case String(currentItem.type.match(/^.*-deleted/)):
                config = {
                    name: currentItem.name,
                    heading: 'Information',
                    data: [{
                        key: 'totals',
                        label: 'Total Items',
                        value: itemProperties.totalItems
                    }]
                }
                listConfig.push(config);
                break;
            case 'well-deleted-child':
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
                    }]
                }
                listConfig.push(config);
                break;
            case 'dataset-deleted-child':
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
            case 'curve-deleted-child':
                var dataset = utils.findDatasetById(itemProperties.idDataset);
                var well = utils.findWellById(dataset.properties.idWell);
                config = {
                    name: currentItem.name,
                    heading: 'Depths',
                    data: [{
                        key: 'endDepth',
                        label: 'End Depth',
                        value: well.properties.bottomDepth
                    }, {
                        key: 'startDepth',
                        label: 'Start Depth',
                        value: well.properties.topDepth
                    }]
                }
                listConfig.push(config);
                config = {
                    name: currentItem.name,
                    heading: 'Informations',
                    data: [{
                        key: 'alias',
                        label: 'Alias',
                        value: itemProperties.alias
                    }, {
                        key: 'dataset',
                        label: 'Curve Set Name',
                        value: dataset.properties.name
                    }, {
                        key: 'datatype',
                        label: 'DataType',
                        value: '',
                        editable: false
                    }, {
                        key: '',
                        label: 'Export Name',
                        value: itemProperties.name,
                        editable: false
                    }, {
                        key: 'idFamily',
                        label: 'Family',
                        type: type.select,
                        options: utils.getListFamily().map(function (family) {
                            return {
                                value: family.idFamily,
                                label: family.name
                            }
                        }),
                        value: itemProperties.idFamily,
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
                        editable: false
                    }, {
                        key: 'wellName',
                        label: 'Well Name',
                        value: well.properties.name,
                    }]
                }
                listConfig.push(config);
                const scale_ = await wiApiService.asyncScaleCurve(itemProperties.idCurve);
                // const scale = await wiApiService.scaleCurvePromise(itemProperties.idCurve);
                config = {
                    name: currentItem.name,
                    heading: 'Values',
                    data: [{
                        key: 'maxValue',
                        label: 'Max Value',
                        value: scale_.maxScale
                    }, {
                        key: 'meanValue',
                        label: 'Mean Value',
                        value: scale_.meanScale
                    }, {
                        key: 'minValue',
                        label: 'Min Value',
                        value: scale_.minScale
                    }]
                }
                listConfig.push(config);
                break;
            case 'logplot-deleted-child':
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
                        type: type.checkbox,
                        value: false,
                        editable: true
                    }, {
                        key: 'horizontalDisplay',
                        label: 'Horizontal Display',
                        type: type.checkbox,
                        value: false,
                        editable: true
                    }, {
                        key: 'showTooltip',
                        label: 'Show Tooltip',
                        type: type.checkbox,
                        value: false,
                        editable: true
                    }]
                }
                listConfig.push(config);
                break;
            case 'crossplot-deleted-child':
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
                    heading: 'Interval',
                    data: [{
                        key: 'intervalBottom',
                        label: 'Interval Bottom',
                        value: '',
                        editable: true
                    }, {
                        key: 'intervalTop',
                        label: 'Interval Top',
                        value: '',
                        editable: true
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
                        key: 'activeColorAxisColor',
                        label: 'Active Color Axis Color',
                        type: type.checkbox,
                        value: false,
                        editable: true
                    }, {
                        key: 'symbolColor',
                        label: 'Symbol Color',
                        value: '',
                        editable: true
                    }, {
                        key: 'useActiveZonesColor',
                        label: 'Use Active Zone Color',
                        type: type.checkbox,
                        value: false,
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
                        type: type.checkbox,
                        value: false,
                        editable: true
                    }, {
                        key: 'horizontalDisplay',
                        label: 'Horizontal Display',
                        type: type.checkbox,
                        value: false,
                        editable: true
                    }, {
                        key: 'showGrid',
                        label: 'Show Grid',
                        type: type.checkbox,
                        value: false,
                        editable: true
                    }, {
                        key: 'showOverlay',
                        label: 'Show Overlay',
                        type: type.checkbox,
                        value: false,
                        editable: true
                    }, {
                        key: 'showTooltip',
                        label: 'Show Tooltip',
                        type: type.checkbox,
                        value: false,
                        editable: true
                    }, {
                        key: 'showYAxisAsPercent',
                        label: 'Show Y Axis As Percent',
                        type: type.checkbox,
                        value: false,
                        editable: true
                    }]
                }
                listConfig.push(config);
                break;
            case 'histogram-deleted-child':
                var well = utils.findWellById(itemProperties.idWell);
                config = {
                    name: currentItem.name,
                    heading: 'Division and Scales',
                    data: [{
                        key: 'histogramDivision',
                        label: 'Histogram Division',
                        value: '',
                        editable: true
                    }, {
                        key: 'maxScale',
                        label: 'Max Scale',
                        value: '',
                        editable: true
                    }, {
                        key: 'minScale',
                        label: 'Min Scale',
                        value: '',
                        editable: true
                    }]
                }
                listConfig.push(config);
                config = {
                    name: currentItem.name,
                    heading: 'Informations',
                    data: [{
                        key: 'depthReference',
                        label: 'Depth Reference',
                        value: '',
                        editable: true
                    }, {
                        key: 'displayType',
                        label: 'Display Type',
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
                    heading: 'Interval',
                    data: [{
                        key: 'intervalBottom',
                        label: 'Interval Bottom',
                        value: '',
                        editable: true
                    }, {
                        key: 'intervalTop',
                        label: 'Interval Top',
                        value: '',
                        editable: true
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
                    }, {
                        key: 'useActiveZonesColor',
                        label: 'Use Active Zone Color',
                        type: type.checkbox,
                        value: false,
                        editable: true
                    }]
                }
                listConfig.push(config);
                config = {
                    name: currentItem.name,
                    heading: 'Utilities',
                    data: [{
                        key: 'cumulate',
                        label: 'Cumulate',
                        type: type.checkbox,
                        value: false,
                        editable: true
                    }, {
                        key: 'displayAsCurve',
                        label: 'Display As Curve',
                        type: type.checkbox,
                        value: false,
                        editable: true
                    }, {
                        key: 'invert',
                        label: 'Invert',
                        type: type.checkbox,
                        value: false,
                        editable: true
                    }, {
                        key: 'horizontalDisplay',
                        label: 'Horizontal Display',
                        type: type.checkbox,
                        value: false,
                        editable: true
                    }, {
                        key: 'showOverlay',
                        label: 'Show Overlay',
                        type: type.checkbox,
                        value: false,
                        editable: true
                    }, {
                        key: 'showTooltip',
                        label: 'Show Tooltip',
                        type: type.checkbox,
                        value: false,
                        editable: true
                    }, {
                        key: 'showYAxisAsPercent',
                        label: 'Show Y Axis As Percent',
                        type: type.checkbox,
                        value: false,
                        editable: true
                    }]
                }
                listConfig.push(config);
                break;
            default:
                break;
        }
        // for development process
        // TODO: remove
        /* config = {
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
        listConfig.push(config); */
        return listConfig;
    }
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
