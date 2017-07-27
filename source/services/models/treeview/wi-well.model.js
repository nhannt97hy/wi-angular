const wiServiceName = 'WiWell';
const moduleName = 'wi-well-model';

let app = angular.module(moduleName, []);
app.factory(wiServiceName, function (WiTreeItem, WiProperty, WiDataset, WiLogplotsModel) {
    function WiWell(well) {
        let self = this;
        let defaultTreeItem = new WiTreeItem();
        let defaultChildWell = [
            {
                name: 'rawdata',
                type: 'rawdata',
                data: {
                    icon: 'project-new-16x16',
                    label: 'Raw data',
                    unit: '',
                    childExpanded: false,
                    properties: {}
                },
                children: []
            },
            {
                name: 'intepretationmodel',
                type: 'intepretationmodel',
                data: {
                    icon: 'project-new-16x16',
                    label: 'Intepretation Model',
                    unit: '',
                    childExpanded: false,
                    properties: {}
                },
                children: []
            },
            {
                name: 'userdefined',
                type: 'userdefined',
                data: {
                    icon: 'user-define-16x16',
                    label: 'User Defined',
                    unit: '',
                    childExpanded: false,
                    properties: {}
                },
                children: []
            },
            // {
            //     name: 'logplots',
            //     type: 'logplots',
            //     data: {
            //         icon: 'logplot-blank-16x16',
            //         label: 'Logplot',
            //         unit: '',
            //         childExpanded: false,
            //         properties: {}
            //     },
            //     children: []
            // },
            {
                name: 'crossplot',
                type: 'crossplot',
                data: {
                    icon: 'crossplot-blank-16x16',
                    label: 'CrossPlot',
                    unit: '',
                    childExpanded: false,
                    properties: {}
                },
                children: []
            }
        ];

        angular.copy(defaultTreeItem, self);
        angular.copy(defaultChildWell, self.children);

        try {
            self.type = 'well';
            self.name = well['idWell'] + 'well';
            self.data.icon = 'well-16x16';
            self.data.label = well['name'];
            self.data.properties = parsePropertiesList(well);

            if (well.datasets) {
                for (let dataset of well.datasets) {
                    let datasetTreeItem = new WiDataset(dataset, well['name']);
                    self.children.unshift(datasetTreeItem);
                }
            }

            let logplots = new WiLogplotsModel(well);
            self.children.push(logplots);

        } catch (err) {
            console.error('Parse well model has error', err);
        }
    }

    function parsePropertiesList(well) {
        let property = new WiProperty();
        property.addNewItemListview('depths', 'Depths', {
            'Bottom Depth': well.bottomDepth,
            'Step': well.step,
            'Top Depth': well.topDepth,
        });
        property.addNewItemListview('informations', 'Informations', {
            'Name': well.name,
            'Unit': 'M'
        });

        return property;
    }

    return WiWell;
});

exports.name = moduleName;
