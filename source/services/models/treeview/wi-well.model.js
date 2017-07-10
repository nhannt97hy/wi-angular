const wiServiceName = 'WiWell';
const moduleName = 'wi-well-model';

let app = angular.module(moduleName, []);
app.factory(wiServiceName, function (WiTreeItem, WiProperty, WiDataset) {
    /**
     * Sample item from server
     bottomDepth:"50"
     createdAt:"2017-07-05T10:26:47.000Z"
     idProject:1
     idWell:2
     name:"Well22"
     step:"30"
     topDepth:"10"
     updatedAt: "2017-07-05T10:26:47.000Z"
     */

    function WiWell(well) {
        let self = this;
        let defaultTreeItem = new WiTreeItem();
        angular.copy(defaultTreeItem, self);

        try {
            self.type = 'well';
            self.name = well['idWell'];
            self.data.icon = 'well-16x16';
            self.data.label = well['name'];
            self.data.properties = parsePropertiesList(well);

            for(let dataset of well.datasets) {
                console.log('dataset in well', dataset);

                let datasetTreeItem = new WiDataset(dataset);
                console.log('datasetTreeItem', datasetTreeItem);

                self.children.push(datasetTreeItem);
            }
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